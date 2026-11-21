import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  buildTrafficReport,
  DailyTrafficRow,
  getBaghdadDateString,
  isProductionTrafficEnvironment,
  resolveTrafficDateRange,
  TrafficStore,
  validateTrackPayload,
} from "./traffic-analytics";

export interface AdminAuthResult {
  authorized: boolean;
  status: 200 | 401 | 403 | 500 | 503;
  error?: string;
}

export type AdminAuthVerifier = (request: NextRequest) => Promise<AdminAuthResult>;

function getSupabaseEnv(): {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey, serviceRoleKey };
}

/**
 * Extracts bearer token safely without reading PII into logs or storage.
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

/**
 * Creates a server-side TrafficStore backed by Supabase.
 * For admin reads, passes caller JWT so Postgres RLS (public.is_admin()) is also enforced.
 */
export function createSupabaseTrafficStore(accessToken?: string): TrafficStore | null {
  const env = getSupabaseEnv();
  if (!env) return null;

  const clientKey = env.serviceRoleKey || env.anonKey;
  const headers: Record<string, string> = {
    apikey: clientKey,
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const supabase = createClient(env.url, clientKey, {
    global: Object.keys(headers).length > 0 ? { headers } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async recordEvent({ trafficDate, sessionId, eventId }) {
      try {
        const { data, error } = await supabase.rpc("record_site_traffic", {
          p_traffic_date: trafficDate,
          p_session_id: sessionId,
          p_event_id: eventId,
        });

        if (error) {
          console.warn("Traffic RPC warning (table/func not ready):", error.message);
          return { recorded: false, duplicate: false, visitIncremented: false, pageviewIncremented: false };
        }

        const payload = (data ?? {}) as Record<string, unknown>;
        return {
          recorded: Boolean(payload.recorded),
          duplicate: Boolean(payload.duplicate),
          visitIncremented: Boolean(payload.visit_incremented),
          pageviewIncremented: Boolean(payload.pageview_incremented),
        };
      } catch (err) {
        console.warn("Traffic RPC not ready in Supabase:", err);
        return { recorded: false, duplicate: false, visitIncremented: false, pageviewIncremented: false };
      }
    },

    async getTrafficData({ from, to }) {
      try {
        const { data: metaRow, error: metaError } = await supabase
          .from("site_traffic_meta")
          .select("tracking_start_date")
          .eq("id", 1)
          .maybeSingle();

        if (metaError) {
          console.warn("Traffic meta table query warning:", metaError.message);
          return { trackingStartDate: null, rows: [] };
        }

        const { data: rows, error: rowsError } = await supabase
          .from("site_traffic_daily")
          .select("traffic_date, visits, pageviews")
          .gte("traffic_date", from)
          .lte("traffic_date", to)
          .order("traffic_date", { ascending: true });

        if (rowsError) {
          console.warn("Traffic daily table query warning:", rowsError.message);
          return { trackingStartDate: null, rows: [] };
        }

        return {
          trackingStartDate:
            metaRow && typeof metaRow.tracking_start_date === "string"
              ? metaRow.tracking_start_date
              : null,
          rows: (rows ?? []) as DailyTrafficRow[],
        };
      } catch (err) {
        console.warn("Traffic tables not ready in Supabase:", err);
        return { trackingStartDate: null, rows: [] };
      }
    },
  };
}

/**
 * Verifies user session + admin role strictly on the server via Supabase Auth & profiles table.
 */
export const verifyAdminOnServer: AdminAuthVerifier = async (request) => {
  const token = extractBearerToken(request);
  if (!token) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication token is required.",
    };
  }

  const env = getSupabaseEnv();
  if (!env) {
    return {
      authorized: false,
      status: 503,
      error: "Supabase configuration is not available on server.",
    };
  }

  const userClient = createClient(env.url, env.anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData?.user) {
    return {
      authorized: false,
      status: 401,
      error: "Invalid or expired authentication session.",
    };
  }

  const profileClient = env.serviceRoleKey
    ? createClient(env.url, env.serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : userClient;

  const { data: profileData, error: profileError } = await profileClient
    .from("profiles")
    .select("role, status")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      authorized: false,
      status: 500,
      error: "Failed to verify user permissions on server.",
    };
  }

  if (!profileData || profileData.role !== "admin" || profileData.status === "suspended") {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden: Admin role required.",
    };
  }

  return { authorized: true, status: 200 };
};

export interface TrackHandlerDeps {
  isProductionEnv?: () => boolean;
  getStore?: () => TrafficStore | null;
  now?: () => Date;
}

export async function handleTrackTrafficRequest(
  request: NextRequest,
  deps: TrackHandlerDeps = {}
): Promise<NextResponse> {
  const isProd = deps.isProductionEnv
    ? deps.isProductionEnv()
    : isProductionTrafficEnvironment({
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelFlag: process.env.VERCEL,
        host: request.headers.get("x-forwarded-host") || request.headers.get("host"),
        origin: request.headers.get("origin"),
      });

  if (!isProd) {
    return NextResponse.json(
      {
        tracked: false,
        duplicate: false,
        visitIncremented: false,
        pageviewIncremented: false,
        reason: "non_production",
      },
      { status: 200 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { tracked: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = validateTrackPayload(body);
  if (parsed.ok !== true) {
    return NextResponse.json(
      { tracked: false, error: parsed.error },
      { status: 400 }
    );
  }

  const store = deps.getStore ? deps.getStore() : createSupabaseTrafficStore();
  if (!store) {
    return NextResponse.json(
      { tracked: false, error: "Analytics storage is not configured" },
      { status: 503 }
    );
  }

  const now = deps.now ? deps.now() : new Date();
  const trafficDate = getBaghdadDateString(now);

  try {
    const result = await store.recordEvent({
      trafficDate,
      sessionId: parsed.sessionId,
      eventId: parsed.eventId,
    });

    return NextResponse.json(
      {
        tracked: result.recorded,
        duplicate: result.duplicate,
        visitIncremented: result.visitIncremented,
        pageviewIncremented: result.pageviewIncremented,
        trafficDate,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to record site traffic event:", err);
    return NextResponse.json(
      { tracked: false, error: "Failed to record traffic event" },
      { status: 500 }
    );
  }
}

export interface AdminTrafficHandlerDeps {
  verifyAdmin?: AdminAuthVerifier;
  getStore?: (token: string | null) => TrafficStore | null;
  now?: () => Date;
}

export async function handleAdminTrafficRequest(
  request: NextRequest,
  deps: AdminTrafficHandlerDeps = {}
): Promise<NextResponse> {
  const verify = deps.verifyAdmin ?? verifyAdminOnServer;
  const authResult = await verify(request);
  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || "Unauthorized" },
      { status: authResult.status }
    );
  }

  const url = new URL(request.url);
  const now = deps.now ? deps.now() : new Date();
  const resolved = resolveTrafficDateRange({
    filter: url.searchParams.get("filter") ?? "7d",
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
    now,
  });

  if (resolved.ok !== true) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const token = extractBearerToken(request);
  const store = deps.getStore
    ? deps.getStore(token)
    : createSupabaseTrafficStore(token ?? undefined);

  if (!store) {
    return NextResponse.json(
      { error: "Analytics storage is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    const data = await store.getTrafficData({
      from: resolved.range.from,
      to: resolved.range.to,
    });

    const report = buildTrafficReport({
      range: resolved.range,
      trackingStartDate: data.trackingStartDate,
      rows: data.rows,
    });

    return NextResponse.json(report, { status: 200 });
  } catch (err) {
    console.error("Failed to query admin traffic analytics:", err);
    return NextResponse.json(
      {
        error:
          "Unable to load traffic analytics data from Supabase: " +
          (err instanceof Error ? err.message : String(err)),
      },
      { status: 500 }
    );
  }
}
