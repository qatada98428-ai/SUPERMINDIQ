import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { PlatformAssignment, AssignmentRuleGroup } from "@/lib/platform-store";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "qatada98@gmail.com";
const ACTION_UPSERT = "competition_upsert";
const ACTION_DELETE = "competition_delete";

function extractBearer(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

function isMissingTableError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = String(err.code || "");
  const msg = String(err.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table")
  );
}

function mapPlatformAssignmentRow(row: Record<string, unknown>): PlatformAssignment {
  const cfg = (row.config || {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    kind: (row.kind as PlatformAssignment["kind"]) || "admin_competition",
    title: String(row.title || ""),
    description: row.description ? String(row.description) : undefined,
    creatorId: String(row.creator_id || ""),
    creatorName: String(row.creator_name || "إدارة المنصة"),
    creatorRole: (row.creator_role as "trainer" | "admin") || "admin",
    targetType: (row.target_type as PlatformAssignment["targetType"]) || "all_students",
    targetValue: row.target_value ? String(row.target_value) : undefined,
    targetStudentIds: Array.isArray(row.target_student_ids)
      ? (row.target_student_ids as string[])
      : undefined,
    exerciseType: (cfg.exerciseType as PlatformAssignment["exerciseType"]) || "competition",
    rulesLevel: (cfg.rulesLevel as PlatformAssignment["rulesLevel"]) || "simple",
    allowSubtraction: cfg.allowSubtraction !== false,
    digitPlace: (cfg.digitPlace as PlatformAssignment["digitPlace"]) || "units",
    termsCount: Number(cfg.termsCount || 4),
    questionsCount: Number(cfg.questionsCount || 20),
    timeLimitMinutes: Number(cfg.timeLimitMinutes || 10),
    timeMode: (cfg.timeMode as PlatformAssignment["timeMode"]) || "countdown",
    answerMode: (cfg.answerMode as PlatformAssignment["answerMode"]) || "typing",
    choicesCount: (Number(cfg.choicesCount || 4) as 2 | 3 | 4 | 5),
    displayMode: (cfg.displayMode as PlatformAssignment["displayMode"]) || "focus",
    voiceMode: (cfg.voiceMode as PlatformAssignment["voiceMode"]) || "arabic",
    orderMode: (cfg.orderMode as PlatformAssignment["orderMode"]) || "sequential",
    ruleGroups: Array.isArray(cfg.ruleGroups)
      ? (cfg.ruleGroups as AssignmentRuleGroup[])
      : undefined,
    notifyStudents: row.notify_students !== false,
    dueDate: row.due_date ? String(row.due_date) : undefined,
    isActive: row.is_active !== false,
    createdAt: String(row.created_at || new Date().toISOString()),
    submissions: [],
  };
}

function getSupabaseClients(token?: string | null): {
  db: SupabaseClient;
  userClient: SupabaseClient | null;
  hasServiceKey: boolean;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !anonKey) return null;

  const db = createClient(url, serviceKey || anonKey, {
    global:
      !serviceKey && token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userClient = token
    ? createClient(url, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  return { db, userClient, hasServiceKey: Boolean(serviceKey) };
}

async function resolveCaller(
  req: NextRequest,
  clients: { db: SupabaseClient; userClient: SupabaseClient | null }
): Promise<{
  userId: string | null;
  email: string | null;
  name: string | null;
  role: "admin" | "trainer" | "student" | "guest";
}> {
  const token = extractBearer(req);
  if (!token || !clients.userClient) {
    return { userId: null, email: null, name: null, role: "guest" };
  }
  const {
    data: { user },
    error,
  } = await clients.userClient.auth.getUser(token);
  if (error || !user) {
    return { userId: null, email: null, name: null, role: "guest" };
  }

  const { data: prof } = await clients.db
    .from("profiles")
    .select("id, role, name, email")
    .eq("id", user.id)
    .maybeSingle();

  const role: "admin" | "trainer" | "student" =
    prof?.role === "admin" || user.email?.toLowerCase() === ADMIN_EMAIL
      ? "admin"
      : prof?.role === "trainer"
      ? "trainer"
      : "student";

  return {
    userId: user.id,
    email: prof?.email || user.email || null,
    name: prof?.name || null,
    role,
  };
}

async function resolveActorUuid(db: SupabaseClient, userId: string | null): Promise<string | null> {
  if (userId && /^[0-9a-f-]{36}$/i.test(userId)) return userId;
  const { data } = await db
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();
  return data?.id ? String(data.id) : null;
}

async function readCloudCompetitions(db: SupabaseClient): Promise<{
  assignments: PlatformAssignment[];
  deletedIds: string[];
  storage: "platform_assignments" | "audit_store";
  error?: string;
}> {
  // 1. Try dedicated platform_assignments table first
  const { data: directRows, error: directErr } = await db
    .from("platform_assignments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!directErr && directRows) {
    return {
      assignments: directRows.map((r) => mapPlatformAssignmentRow(r as Record<string, unknown>)),
      deletedIds: [],
      storage: "platform_assignments",
    };
  }

  if (!isMissingTableError(directErr)) {
    return {
      assignments: [],
      deletedIds: [],
      storage: "platform_assignments",
      error: directErr?.message,
    };
  }

  // 2. Fallback: durable event-log state inside existing public.admin_audit_logs
  const { data: logRows, error: logErr } = await db
    .from("admin_audit_logs")
    .select("action, target_id, details, created_at")
    .eq("target_type", "settings")
    .in("action", [ACTION_UPSERT, ACTION_DELETE])
    .order("created_at", { ascending: true })
    .limit(1000);

  if (logErr) {
    return {
      assignments: [],
      deletedIds: [],
      storage: "audit_store",
      error: logErr.message,
    };
  }

  const activeMap = new Map<string, PlatformAssignment>();
  const deletedSet = new Set<string>();

  for (const row of logRows || []) {
    const id = String(row.target_id || "");
    if (!id) continue;
    if (row.action === ACTION_DELETE) {
      activeMap.delete(id);
      deletedSet.add(id);
    } else if (row.action === ACTION_UPSERT && row.details && typeof row.details === "object") {
      const item = row.details as PlatformAssignment;
      activeMap.set(id, {
        ...item,
        id,
        submissions: [],
      });
      deletedSet.delete(id);
    }
  }

  const assignments = Array.from(activeMap.values()).sort((a, b) =>
    String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
  );

  return {
    assignments,
    deletedIds: Array.from(deletedSet),
    storage: "audit_store",
  };
}

async function upsertCloudCompetition(
  db: SupabaseClient,
  assignment: PlatformAssignment,
  actorId: string | null,
  actorEmail: string | null
): Promise<{ ok: boolean; storage: string; error?: string }> {
  const { error: directErr } = await db.from("platform_assignments").upsert([
    {
      id: assignment.id,
      kind: assignment.kind,
      title: assignment.title,
      description: assignment.description || null,
      creator_id: assignment.creatorId,
      creator_name: assignment.creatorName,
      creator_role: assignment.creatorRole,
      target_type: assignment.targetType,
      target_value: assignment.targetValue || null,
      target_student_ids: assignment.targetStudentIds || [],
      config: {
        exerciseType: assignment.exerciseType,
        rulesLevel: assignment.rulesLevel,
        allowSubtraction: assignment.allowSubtraction,
        digitPlace: assignment.digitPlace,
        termsCount: assignment.termsCount,
        questionsCount: assignment.questionsCount,
        timeLimitMinutes: assignment.timeLimitMinutes,
        timeMode: assignment.timeMode || "countdown",
        answerMode: assignment.answerMode,
        choicesCount: assignment.choicesCount,
        displayMode: assignment.displayMode || "focus",
        voiceMode: assignment.voiceMode || "arabic",
        orderMode: assignment.orderMode || "sequential",
        ruleGroups: assignment.ruleGroups || [],
      },
      is_active: assignment.isActive,
      notify_students: assignment.notifyStudents !== false,
      due_date: assignment.dueDate || null,
      created_at: assignment.createdAt,
    },
  ]);

  if (!directErr) {
    return { ok: true, storage: "platform_assignments" };
  }

  if (!isMissingTableError(directErr)) {
    return { ok: false, storage: "platform_assignments", error: directErr.message };
  }

  // Fallback to admin_audit_logs
  const resolvedAdminId = await resolveActorUuid(db, actorId);
  if (!resolvedAdminId) {
    return { ok: false, storage: "audit_store", error: "Missing profile UUID for audit storage" };
  }

  // Strip submissions array to keep payload lean and clean
  const cleanPayload: PlatformAssignment = {
    ...assignment,
    submissions: [],
  };

  const { error: logErr } = await db.from("admin_audit_logs").insert([
    {
      admin_id: resolvedAdminId,
      admin_email: actorEmail || ADMIN_EMAIL,
      action: ACTION_UPSERT,
      target_type: "settings",
      target_id: assignment.id,
      details: cleanPayload,
    },
  ]);

  if (logErr) {
    return { ok: false, storage: "audit_store", error: logErr.message };
  }

  return { ok: true, storage: "audit_store" };
}

async function deleteCloudCompetition(
  db: SupabaseClient,
  id: string,
  actorId: string | null,
  actorEmail: string | null
): Promise<{ ok: boolean; storage: string; error?: string }> {
  const { error: directErr } = await db
    .from("platform_assignments")
    .delete()
    .eq("id", id);

  if (!directErr) {
    return { ok: true, storage: "platform_assignments" };
  }

  if (!isMissingTableError(directErr)) {
    return { ok: false, storage: "platform_assignments", error: directErr.message };
  }

  const resolvedAdminId = await resolveActorUuid(db, actorId);
  if (!resolvedAdminId) {
    return { ok: false, storage: "audit_store", error: "Missing profile UUID for audit storage" };
  }

  const { error: logErr } = await db.from("admin_audit_logs").insert([
    {
      admin_id: resolvedAdminId,
      admin_email: actorEmail || ADMIN_EMAIL,
      action: ACTION_DELETE,
      target_type: "settings",
      target_id: id,
      details: { id, deleted: true, deletedAt: new Date().toISOString() },
    },
  ]);

  if (logErr) {
    return { ok: false, storage: "audit_store", error: logErr.message };
  }

  return { ok: true, storage: "audit_store" };
}

// =========================================================================
// GET /api/competitions — Fetch authoritative competitions list from Cloud
// =========================================================================
export async function GET(request: NextRequest) {
  const token = extractBearer(request);
  const clients = getSupabaseClients(token);
  if (!clients) {
    return NextResponse.json(
      { assignments: [], deletedIds: [], source: "local" },
      { status: 200 }
    );
  }

  try {
    const caller = await resolveCaller(request, clients);
    const includeInactive = request.nextUrl.searchParams.get("includeInactive") === "1";

    const readRes = await readCloudCompetitions(clients.db);
    if (readRes.error) {
      return NextResponse.json(
        {
          assignments: [],
          deletedIds: [],
          source: "cloud_error",
          error: readRes.error,
        },
        { status: 200 }
      );
    }

    let items = readRes.assignments;
    if (!includeInactive || (caller.role !== "admin" && caller.role !== "trainer")) {
      items = items.filter((a) => a.isActive !== false);
    } else if (caller.role === "trainer" && caller.userId) {
      // Trainers see all active competitions + their own paused competitions
      items = items.filter((a) => a.isActive !== false || a.creatorId === caller.userId);
    }

    return NextResponse.json(
      {
        assignments: items,
        deletedIds: readRes.deletedIds,
        source: "cloud",
        storage: readRes.storage,
      },
      { status: 200 }
    );
  } catch (err) {
    console.warn("GET /api/competitions error:", err);
    return NextResponse.json(
      { assignments: [], deletedIds: [], source: "error" },
      { status: 200 }
    );
  }
}

// =========================================================================
// POST /api/competitions — Create new competition (Admin & Trainer only)
// =========================================================================
export async function POST(request: NextRequest) {
  const token = extractBearer(request);
  const clients = getSupabaseClients(token);
  if (!clients) {
    return NextResponse.json({ ok: true, source: "local" }, { status: 200 });
  }

  try {
    const caller = await resolveCaller(request, clients);
    if (caller.role !== "admin" && caller.role !== "trainer") {
      return NextResponse.json({ error: "غير مصرح لك بإنشاء مسابقات" }, { status: 403 });
    }

    const body = (await request.json()) as { assignment?: PlatformAssignment };
    const incoming = body?.assignment;
    if (!incoming || !incoming.id || !incoming.title?.trim()) {
      return NextResponse.json({ error: "بيانات المسابقة غير مكتملة" }, { status: 400 });
    }

    const sanitized: PlatformAssignment = {
      ...incoming,
      title: incoming.title.trim(),
      creatorId: caller.role === "admin" ? incoming.creatorId || caller.userId || "trainer-qatada" : caller.userId || incoming.creatorId,
      creatorRole: caller.role === "admin" ? incoming.creatorRole || "admin" : "trainer",
      kind: caller.role === "admin" ? incoming.kind : "trainer_homework",
      isActive: incoming.isActive !== false,
      notifyStudents: incoming.notifyStudents !== false,
      createdAt: incoming.createdAt || new Date().toISOString(),
      submissions: [],
    };

    const res = await upsertCloudCompetition(clients.db, sanitized, caller.userId, caller.email);
    if (!res.ok) {
      return NextResponse.json(
        { error: res.error || "تعذر حفظ المسابقة في قاعدة البيانات" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, assignment: sanitized, source: "cloud", storage: res.storage },
      { status: 200 }
    );
  } catch (err) {
    console.warn("POST /api/competitions error:", err);
    return NextResponse.json({ error: "خطأ داخلي أثناء حفظ المسابقة" }, { status: 500 });
  }
}

// =========================================================================
// PATCH /api/competitions — Update / Toggle Active / Toggle Notify
// =========================================================================
export async function PATCH(request: NextRequest) {
  const token = extractBearer(request);
  const clients = getSupabaseClients(token);
  if (!clients) {
    return NextResponse.json({ ok: true, source: "local" }, { status: 200 });
  }

  try {
    const caller = await resolveCaller(request, clients);
    if (caller.role !== "admin" && caller.role !== "trainer") {
      return NextResponse.json({ error: "غير مصرح لك بتعديل المسابقات" }, { status: 403 });
    }

    const body = (await request.json()) as {
      id?: string;
      patch?: Partial<PlatformAssignment>;
      assignment?: PlatformAssignment;
    };

    const targetId = body.id || body.assignment?.id;
    if (!targetId) {
      return NextResponse.json({ error: "معرّف المسابقة مطلوب" }, { status: 400 });
    }

    const readRes = await readCloudCompetitions(clients.db);
    const existing = readRes.assignments.find((a) => a.id === targetId);

    if (
      existing &&
      caller.role === "trainer" &&
      caller.userId &&
      existing.creatorId !== caller.userId
    ) {
      return NextResponse.json({ error: "يمكنك تعديل مسابقاتك الخاصة فقط" }, { status: 403 });
    }

    const merged: PlatformAssignment | null = existing
      ? {
          ...existing,
          ...(body.assignment || {}),
          ...(body.patch || {}),
          id: existing.id,
          submissions: [],
        }
      : body.assignment
      ? {
          ...body.assignment,
          ...(body.patch || {}),
          id: targetId,
          submissions: [],
        }
      : null;

    if (!merged) {
      return NextResponse.json({ error: "المسابقة غير موجودة" }, { status: 404 });
    }

    const res = await upsertCloudCompetition(clients.db, merged, caller.userId, caller.email);
    if (!res.ok) {
      return NextResponse.json(
        { error: res.error || "تعذر تحديث المسابقة في قاعدة البيانات" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, assignment: merged, source: "cloud", storage: res.storage },
      { status: 200 }
    );
  } catch (err) {
    console.warn("PATCH /api/competitions error:", err);
    return NextResponse.json({ error: "خطأ داخلي أثناء تحديث المسابقة" }, { status: 500 });
  }
}

// =========================================================================
// DELETE /api/competitions?id=... — Permanently delete competition
// =========================================================================
export async function DELETE(request: NextRequest) {
  const token = extractBearer(request);
  const clients = getSupabaseClients(token);
  if (!clients) {
    return NextResponse.json({ ok: true, source: "local" }, { status: 200 });
  }

  try {
    const caller = await resolveCaller(request, clients);
    if (caller.role !== "admin" && caller.role !== "trainer") {
      return NextResponse.json({ error: "غير مصرح لك بحذف المسابقات" }, { status: 403 });
    }

    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "معرّف المسابقة مطلوب للحذف" }, { status: 400 });
    }

    // Trainers may only delete their own competitions
    if (caller.role === "trainer" && caller.userId) {
      const readRes = await readCloudCompetitions(clients.db);
      const existing = readRes.assignments.find((a) => a.id === id);
      if (existing && existing.creatorId !== caller.userId) {
        return NextResponse.json({ error: "يمكنك حذف مسابقاتك الخاصة فقط" }, { status: 403 });
      }
    }

    const res = await deleteCloudCompetition(clients.db, id, caller.userId, caller.email);
    if (!res.ok) {
      return NextResponse.json(
        { error: res.error || "تعذر حذف المسابقة من قاعدة البيانات" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, deletedId: id, source: "cloud", storage: res.storage },
      { status: 200 }
    );
  } catch (err) {
    console.warn("DELETE /api/competitions error:", err);
    return NextResponse.json({ error: "خطأ داخلي أثناء حذف المسابقة" }, { status: 500 });
  }
}
