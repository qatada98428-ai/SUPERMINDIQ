import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function extractBearer(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !anonKey) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  const token = extractBearer(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Verify caller identity using their JWT
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser(token);

    if (authErr || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Use service role client (if configured) to read authorized competition submissions
    const db = createClient(url, serviceKey || anonKey, {
      global: serviceKey ? undefined : { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: callerProfile } = await db
      .from("profiles")
      .select("id, role, email")
      .eq("id", user.id)
      .maybeSingle();

    const callerRole =
      callerProfile?.role === "admin" ||
      user.email?.toLowerCase() === "qatada98@gmail.com"
        ? "admin"
        : callerProfile?.role === "trainer"
        ? "trainer"
        : "student";

    if (callerRole !== "admin" && callerRole !== "trainer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requestedIdsParam = request.nextUrl.searchParams.get("assignmentIds") || "";
    const requestedIds = new Set(
      requestedIdsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );

    const { data: sessions, error: sessErr } = await db
      .from("training_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (sessErr || !sessions) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const filtered = sessions.filter((row) => {
      const meta = (row.metadata || {}) as Record<string, unknown>;
      const assignId = typeof meta.assignmentId === "string" ? meta.assignmentId : "";
      if (!assignId) return false;
      if (callerRole === "admin") return true;
      const creatorId =
        typeof meta.assignmentCreatorId === "string" ? meta.assignmentCreatorId : "";
      return creatorId === user.id || requestedIds.has(assignId);
    });

    // Fetch profile names/emails for the participating students
    const userIds = Array.from(new Set(filtered.map((r) => String(r.user_id || "")).filter(Boolean)));
    const profileMap = new Map<string, { name?: string; email?: string }>();
    if (userIds.length > 0) {
      const { data: profRows } = await db
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);
      (profRows || []).forEach((p) => {
        profileMap.set(String(p.id), { name: p.name || undefined, email: p.email || undefined });
      });
    }

    // Group all rows by (assignmentId, studentId) chronologically so every retry is tracked
    type RawRow = (typeof filtered)[number];
    const grouped = new Map<string, RawRow[]>();
    for (const row of filtered) {
      const meta = (row.metadata || {}) as Record<string, unknown>;
      const assignId = String(meta.assignmentId || "");
      const studentId = String(row.user_id || "");
      if (!assignId || !studentId) continue;
      const key = `${assignId}::${studentId}`;
      const arr = grouped.get(key) || [];
      arr.push(row);
      grouped.set(key, arr);
    }

    const results = Array.from(grouped.values()).map((rows) => {
      // Chronological order: Attempt 1, Attempt 2, ...
      const ordered = [...rows].sort((a, b) =>
        String(a.created_at || "").localeCompare(String(b.created_at || ""))
      );

      const attempts = ordered.map((row, idx) => {
        const meta = (row.metadata || {}) as Record<string, unknown>;
        const totalQ = Number(row.total_questions || 0);
        const correct = Number(row.correct_answers || 0);
        const wrong = Number(row.wrong_answers || Math.max(0, totalQ - correct));
        const duration = Number(row.duration_seconds || 0);
        const rawAttemptNum = Number(meta.attemptNumber || 0);
        const attemptNumber = Math.max(idx + 1, rawAttemptNum);

        return {
          attemptNumber,
          score: Number(row.score || 0),
          totalQuestions: totalQ,
          correctAnswers: correct,
          wrongAnswers: wrong,
          unansweredCount: Number(meta.unansweredCount || 0),
          accuracy: Math.round(Number(row.accuracy_rate || 0)),
          durationSeconds: duration,
          avgSecondsPerQuestion:
            typeof meta.avgSecondsPerQuestion === "number"
              ? meta.avgSecondsPerQuestion
              : totalQ > 0
              ? Number((duration / totalQ).toFixed(1))
              : 0,
          ruleBreakdown: Array.isArray(meta.ruleBreakdown) ? meta.ruleBreakdown : undefined,
          questionDetails: Array.isArray(meta.questionDetails) ? meta.questionDetails : undefined,
          completedAt: String(row.created_at || new Date().toISOString()),
        };
      });

      const latestRow = ordered[ordered.length - 1];
      const latestAttempt = attempts[attempts.length - 1];
      const latestMeta = (latestRow.metadata || {}) as Record<string, unknown>;
      const prof = profileMap.get(String(latestRow.user_id));

      return {
        assignmentId: String(latestMeta.assignmentId || ""),
        assignmentTitle:
          typeof latestMeta.assignmentTitle === "string" ? latestMeta.assignmentTitle : undefined,
        assignmentCreatorId:
          typeof latestMeta.assignmentCreatorId === "string"
            ? latestMeta.assignmentCreatorId
            : undefined,
        studentId: String(latestRow.user_id || ""),
        studentName: String(prof?.name || latestMeta.studentName || "بطل العقل الخارق"),
        studentEmail: String(prof?.email || latestMeta.studentEmail || ""),
        governorate: String(latestMeta.governorate || ""),
        score: latestAttempt.score,
        totalQuestions: latestAttempt.totalQuestions,
        correctAnswers: latestAttempt.correctAnswers,
        wrongAnswers: latestAttempt.wrongAnswers,
        unansweredCount: latestAttempt.unansweredCount,
        accuracy: latestAttempt.accuracy,
        durationSeconds: latestAttempt.durationSeconds,
        avgSecondsPerQuestion: latestAttempt.avgSecondsPerQuestion,
        attemptNumber: latestAttempt.attemptNumber,
        totalAttempts: attempts.length,
        attempts,
        ruleBreakdown: latestAttempt.ruleBreakdown,
        questionDetails: latestAttempt.questionDetails,
        completedAt: latestAttempt.completedAt,
      };
    });

    return NextResponse.json({ results }, { status: 200 });
  } catch (err) {
    console.warn("Competition results API error:", err);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
