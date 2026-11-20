export const TRAFFIC_TIMEZONE = "Asia/Baghdad" as const;

export type TrafficFilterKey = "today" | "7d" | "30d" | "1y" | "custom";

export interface TrafficDateRange {
  filter: TrafficFilterKey;
  from: string; // YYYY-MM-DD in Asia/Baghdad
  to: string; // YYYY-MM-DD in Asia/Baghdad
  today: string; // YYYY-MM-DD in Asia/Baghdad
  daysCount: number;
}

export interface DailyTrafficRow {
  traffic_date: string; // YYYY-MM-DD
  visits: number;
  pageviews: number;
}

export interface TrafficChartPoint {
  date: string; // YYYY-MM-DD
  visits: number;
  pageviews: number;
  tracked: boolean;
}

export interface TrafficReportResponse {
  timezone: typeof TRAFFIC_TIMEZONE;
  filter: TrafficFilterKey;
  from: string;
  to: string;
  today: string;
  trackingStartDate: string | null;
  includesPreTrackingDays: boolean;
  fullyBeforeTrackingStart: boolean;
  totals: {
    visits: number;
    pageviews: number;
    trackedDaysCount: number;
    totalDaysInRange: number;
  };
  series: TrafficChartPoint[];
}

export interface TrackEventInput {
  sessionId: string;
  eventId: string;
  now?: Date;
}

export interface TrackEventResult {
  tracked: boolean;
  duplicate: boolean;
  visitIncremented: boolean;
  pageviewIncremented: boolean;
  trafficDate?: string;
  reason?: string;
}

export interface TrafficStore {
  recordEvent(params: {
    trafficDate: string;
    sessionId: string;
    eventId: string;
  }): Promise<{
    recorded: boolean;
    duplicate: boolean;
    visitIncremented: boolean;
    pageviewIncremented: boolean;
  }>;
  getTrafficData(params: {
    from: string;
    to: string;
  }): Promise<{
    trackingStartDate: string | null;
    rows: DailyTrafficRow[];
  }>;
}

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const OPAQUE_ID_REGEX = /^[A-Za-z0-9_-]{8,128}$/;

/**
 * Formats any Date as YYYY-MM-DD strictly in Asia/Baghdad timezone (UTC+03:00).
 */
export function getBaghdadDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TRAFFIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD and verifies it represents a real calendar date (no 2026-02-31 rollovers).
 */
export function isValidDateKey(value: string): boolean {
  if (!DATE_KEY_REGEX.test(value)) return false;
  const [yStr, mStr, dStr] = value.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/**
 * Adds deltaDays to a YYYY-MM-DD calendar key safely in UTC arithmetic.
 */
export function addDaysToDateKey(dateKey: string, deltaDays: number): string {
  const [yStr, mStr, dStr] = dateKey.split("-");
  const dt = new Date(
    Date.UTC(Number(yStr), Number(mStr) - 1, Number(dStr) + deltaDays)
  );
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Computes inclusive number of calendar days between two YYYY-MM-DD keys.
 */
export function diffDaysInclusive(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const startMs = Date.UTC(fy, fm - 1, fd);
  const endMs = Date.UTC(ty, tm - 1, td);
  return Math.floor((endMs - startMs) / 86_400_000) + 1;
}

/**
 * Enumerates every YYYY-MM-DD between from and to inclusive.
 */
export function enumerateDateKeys(from: string, to: string): string[] {
  const totalDays = diffDaysInclusive(from, to);
  if (totalDays <= 0) return [];
  const dates: string[] = [];
  for (let i = 0; i < totalDays; i++) {
    dates.push(addDaysToDateKey(from, i));
  }
  return dates;
}

/**
 * Resolves Today / 7d / 30d / 1y / Custom ranges anchored strictly to Asia/Baghdad.
 */
export function resolveTrafficDateRange(params: {
  filter?: string | null;
  from?: string | null;
  to?: string | null;
  now?: Date;
}): { ok: true; range: TrafficDateRange } | { ok: false; error: string } {
  const today = getBaghdadDateString(params.now ?? new Date());
  const rawFilter = (params.filter ?? "7d").trim().toLowerCase();

  let filter: TrafficFilterKey;
  if (rawFilter === "today") filter = "today";
  else if (rawFilter === "7d") filter = "7d";
  else if (rawFilter === "30d") filter = "30d";
  else if (rawFilter === "1y" || rawFilter === "365d" || rawFilter === "year")
    filter = "1y";
  else if (rawFilter === "custom") filter = "custom";
  else {
    return { ok: false, error: "Invalid date filter specified." };
  }

  if (filter === "today") {
    return {
      ok: true,
      range: { filter, from: today, to: today, today, daysCount: 1 },
    };
  }
  if (filter === "7d") {
    return {
      ok: true,
      range: {
        filter,
        from: addDaysToDateKey(today, -6),
        to: today,
        today,
        daysCount: 7,
      },
    };
  }
  if (filter === "30d") {
    return {
      ok: true,
      range: {
        filter,
        from: addDaysToDateKey(today, -29),
        to: today,
        today,
        daysCount: 30,
      },
    };
  }
  if (filter === "1y") {
    return {
      ok: true,
      range: {
        filter,
        from: addDaysToDateKey(today, -364),
        to: today,
        today,
        daysCount: 365,
      },
    };
  }

  const from = (params.from ?? "").trim();
  const to = (params.to ?? "").trim();
  if (!isValidDateKey(from) || !isValidDateKey(to)) {
    return {
      ok: false,
      error: "Custom range requires valid from and to dates (YYYY-MM-DD).",
    };
  }
  if (from > to) {
    return {
      ok: false,
      error: "Start date must be on or before end date.",
    };
  }
  const daysCount = diffDaysInclusive(from, to);
  if (daysCount > 731) {
    return {
      ok: false,
      error: "Custom range cannot exceed 731 days.",
    };
  }

  return {
    ok: true,
    range: { filter: "custom", from, to, today, daysCount },
  };
}

/**
 * Checks whether runtime & request belong strictly to Production (excludes dev, preview, localhost).
 */
export function isProductionTrafficEnvironment(params: {
  nodeEnv?: string;
  vercelEnv?: string;
  vercelFlag?: string;
  host?: string | null;
  origin?: string | null;
}): boolean {
  if (params.nodeEnv !== "production") return false;

  // On Vercel, exclude preview and development deployments strictly.
  if (params.vercelEnv !== undefined && params.vercelEnv !== "") {
    if (params.vercelEnv !== "production") return false;
  } else if (params.vercelFlag === "1") {
    return false;
  }

  const candidates = [params.host, params.origin]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.toLowerCase());

  if (candidates.length === 0) return false;

  for (const candidate of candidates) {
    if (
      candidate.includes("localhost") ||
      candidate.includes("127.0.0.1") ||
      candidate.includes("[::1]") ||
      candidate.includes("0.0.0.0") ||
      candidate.endsWith(".local") ||
      candidate.includes(".local:")
    ) {
      return false;
    }
  }

  return true;
}

export function validateTrackPayload(body: unknown): {
  ok: true;
  sessionId: string;
  eventId: string;
} | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid payload" };
  }
  const record = body as Record<string, unknown>;
  const sessionId =
    typeof record.sessionId === "string" ? record.sessionId.trim() : "";
  const eventId =
    typeof record.eventId === "string" ? record.eventId.trim() : "";

  if (!OPAQUE_ID_REGEX.test(sessionId) || !OPAQUE_ID_REGEX.test(eventId)) {
    return { ok: false, error: "Invalid sessionId or eventId format" };
  }

  return { ok: true, sessionId, eventId };
}

/**
 * Builds the exact day-by-day report from real DB rows without any synthetic/mock estimates.
 */
export function buildTrafficReport(params: {
  range: TrafficDateRange;
  trackingStartDate: string | null;
  rows: DailyTrafficRow[];
}): TrafficReportResponse {
  const { range, trackingStartDate, rows } = params;
  const rowMap = new Map<string, DailyTrafficRow>();

  for (const row of rows) {
    if (isValidDateKey(row.traffic_date)) {
      rowMap.set(row.traffic_date, {
        traffic_date: row.traffic_date,
        visits: Math.max(0, Number(row.visits) || 0),
        pageviews: Math.max(0, Number(row.pageviews) || 0),
      });
    }
  }

  const dateKeys = enumerateDateKeys(range.from, range.to);
  let totalVisits = 0;
  let totalPageviews = 0;
  let trackedDaysCount = 0;

  const series: TrafficChartPoint[] = dateKeys.map((date) => {
    const isAfterStart =
      trackingStartDate !== null && date >= trackingStartDate && date <= range.today;
    const row = rowMap.get(date);
    const visits = row ? row.visits : 0;
    const pageviews = row ? row.pageviews : 0;

    if (isAfterStart) trackedDaysCount += 1;
    totalVisits += visits;
    totalPageviews += pageviews;

    return {
      date,
      visits,
      pageviews,
      tracked: isAfterStart || Boolean(row),
    };
  });

  const includesPreTrackingDays =
    trackingStartDate === null || range.from < trackingStartDate;
  const fullyBeforeTrackingStart =
    trackingStartDate === null || range.to < trackingStartDate;

  return {
    timezone: TRAFFIC_TIMEZONE,
    filter: range.filter,
    from: range.from,
    to: range.to,
    today: range.today,
    trackingStartDate,
    includesPreTrackingDays,
    fullyBeforeTrackingStart,
    totals: {
      visits: totalVisits,
      pageviews: totalPageviews,
      trackedDaysCount,
      totalDaysInRange: dateKeys.length,
    },
    series,
  };
}
