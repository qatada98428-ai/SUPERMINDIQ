"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Eye,
  Users,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Info,
  Clock,
  Loader2,
  BarChart3,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  TrafficFilterKey,
  TrafficReportResponse,
  TrafficChartPoint,
} from "@/lib/traffic-analytics";

const FILTER_OPTIONS: Array<{ id: TrafficFilterKey; label: string }> = [
  { id: "today", label: "اليوم" },
  { id: "7d", label: "آخر 7 أيام" },
  { id: "30d", label: "آخر 30 يومًا" },
  { id: "1y", label: "آخر سنة" },
  { id: "custom", label: "فترة مخصّصة" },
];

interface ChartBucket {
  key: string;
  label: string;
  rangeLabel: string;
  visits: number;
  pageviews: number;
  tracked: boolean;
}

function getTodayBaghdadInputDefault(): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Baghdad",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const y = parts.find((p) => p.type === "year")?.value ?? "2026";
    const m = parts.find((p) => p.type === "month")?.value ?? "01";
    const d = parts.find((p) => p.type === "day")?.value ?? "01";
    return `${y}-${m}-${d}`;
  } catch {
    return "2026-01-01";
  }
}

function formatShortArabicDate(dateKey: string): string {
  const parts = dateKey.split("-");
  if (parts.length !== 3) return dateKey;
  return `${parts[2]}/${parts[1]}`;
}

function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-");
  return `${m}/${y.slice(2)}`;
}

function buildChartBuckets(series: TrafficChartPoint[]): {
  mode: "daily" | "monthly";
  buckets: ChartBucket[];
} {
  if (series.length <= 45) {
    return {
      mode: "daily",
      buckets: series.map((pt) => ({
        key: pt.date,
        label: formatShortArabicDate(pt.date),
        rangeLabel: pt.date,
        visits: pt.visits,
        pageviews: pt.pageviews,
        tracked: pt.tracked,
      })),
    };
  }

  // Group into exact calendar months using real daily rows (zero estimation)
  const monthMap = new Map<string, ChartBucket>();
  for (const pt of series) {
    const monthKey = pt.date.slice(0, 7);
    const existing = monthMap.get(monthKey);
    if (!existing) {
      monthMap.set(monthKey, {
        key: monthKey,
        label: formatMonthLabel(monthKey),
        rangeLabel: `${monthKey} (تجميع من البيانات اليومية)`,
        visits: pt.visits,
        pageviews: pt.pageviews,
        tracked: pt.tracked,
      });
    } else {
      existing.visits += pt.visits;
      existing.pageviews += pt.pageviews;
      existing.tracked = existing.tracked || pt.tracked;
    }
  }

  return {
    mode: "monthly",
    buckets: Array.from(monthMap.values()),
  };
}

const TRAFFIC_MIGRATION_SQL = `-- SUPER MIND | Traffic Analytics Schema & Atomic RPC
CREATE TABLE IF NOT EXISTS public.site_traffic_meta (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tracking_start_date DATE NOT NULL DEFAULT (TIMEZONE('Asia/Baghdad', NOW()))::DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.site_traffic_meta (id, tracking_start_date)
VALUES (1, (TIMEZONE('Asia/Baghdad', NOW()))::DATE)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.site_traffic_daily (
  traffic_date DATE PRIMARY KEY,
  visits INT NOT NULL DEFAULT 0 CHECK (visits >= 0),
  pageviews INT NOT NULL DEFAULT 0 CHECK (pageviews >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_traffic_daily_date
  ON public.site_traffic_daily(traffic_date DESC);

CREATE TABLE IF NOT EXISTS public.site_traffic_sessions (
  session_id TEXT PRIMARY KEY,
  first_traffic_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_traffic_sessions_created_at
  ON public.site_traffic_sessions(created_at DESC);

CREATE TABLE IF NOT EXISTS public.site_traffic_events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  traffic_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_traffic_events_created_at
  ON public.site_traffic_events(created_at DESC);

ALTER TABLE public.site_traffic_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_traffic_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_traffic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_traffic_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read traffic meta" ON public.site_traffic_meta;
CREATE POLICY "Admins can read traffic meta"
  ON public.site_traffic_meta FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read daily traffic" ON public.site_traffic_daily;
CREATE POLICY "Admins can read daily traffic"
  ON public.site_traffic_daily FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read traffic sessions" ON public.site_traffic_sessions;
CREATE POLICY "Admins can read traffic sessions"
  ON public.site_traffic_sessions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read traffic events" ON public.site_traffic_events;
CREATE POLICY "Admins can read traffic events"
  ON public.site_traffic_events FOR SELECT
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.record_site_traffic(
  p_traffic_date DATE,
  p_session_id TEXT,
  p_event_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_session TEXT := btrim(COALESCE(p_session_id, ''));
  v_clean_event   TEXT := btrim(COALESCE(p_event_id, ''));
  v_baghdad_today DATE := (TIMEZONE('Asia/Baghdad', NOW()))::DATE;
  v_event_inserted TEXT;
  v_session_inserted TEXT;
  v_visit_inc INT := 0;
BEGIN
  IF length(v_clean_session) < 8 OR length(v_clean_session) > 128 THEN
    RAISE EXCEPTION 'Invalid session_id';
  END IF;

  IF length(v_clean_event) < 8 OR length(v_clean_event) > 128 THEN
    RAISE EXCEPTION 'Invalid event_id';
  END IF;

  IF p_traffic_date IS NULL OR p_traffic_date < DATE '2026-01-01' OR p_traffic_date > (v_baghdad_today + 1) THEN
    RAISE EXCEPTION 'Invalid traffic_date';
  END IF;

  INSERT INTO public.site_traffic_meta (id, tracking_start_date)
  VALUES (1, LEAST(v_baghdad_today, p_traffic_date))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.site_traffic_events (event_id, session_id, traffic_date)
  VALUES (v_clean_event, v_clean_session, p_traffic_date)
  ON CONFLICT (event_id) DO NOTHING
  RETURNING event_id INTO v_event_inserted;

  IF v_event_inserted IS NULL THEN
    RETURN jsonb_build_object(
      'recorded', false,
      'duplicate', true,
      'visit_incremented', false,
      'pageview_incremented', false
    );
  END IF;

  INSERT INTO public.site_traffic_sessions (session_id, first_traffic_date)
  VALUES (v_clean_session, p_traffic_date)
  ON CONFLICT (session_id) DO NOTHING
  RETURNING session_id INTO v_session_inserted;

  IF v_session_inserted IS NOT NULL THEN
    v_visit_inc := 1;
  END IF;

  INSERT INTO public.site_traffic_daily (traffic_date, visits, pageviews, updated_at)
  VALUES (p_traffic_date, v_visit_inc, 1, NOW())
  ON CONFLICT (traffic_date) DO UPDATE
  SET
    visits = public.site_traffic_daily.visits + EXCLUDED.visits,
    pageviews = public.site_traffic_daily.pageviews + EXCLUDED.pageviews,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'recorded', true,
    'duplicate', false,
    'visit_incremented', (v_visit_inc = 1),
    'pageview_incremented', true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_site_traffic(DATE, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_site_traffic(DATE, TEXT, TEXT) TO anon, authenticated, service_role;`;

export default function AdminTrafficSection() {
  const { session } = useAuth();
  const [copiedSql, setCopiedSql] = useState(false);
  const [filter, setFilter] = useState<TrafficFilterKey>("7d");
  const defaultToday = useMemo(() => getTodayBaghdadInputDefault(), []);
  const [customFrom, setCustomFrom] = useState<string>(defaultToday);
  const [customTo, setCustomTo] = useState<string>(defaultToday);
  const [appliedCustom, setAppliedCustom] = useState<{ from: string; to: string }>({
    from: defaultToday,
    to: defaultToday,
  });

  const [report, setReport] = useState<TrafficReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hoveredBucket, setHoveredBucket] = useState<ChartBucket | null>(null);

  const fetchTrafficReport = useCallback(
    async (targetFilter: TrafficFilterKey, customRange?: { from: string; to: string }) => {
      setLoading(true);
      setError(null);
      setHoveredBucket(null);

      try {
        let accessToken = session?.access_token ?? null;
        if (!accessToken) {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data } = await supabase.auth.getSession();
            accessToken = data.session?.access_token ?? null;
          }
        }

        if (!accessToken) {
          setReport(null);
          setError("تعذّر التحقق من جلسة الأدمن. يرجى إعادة تسجيل الدخول.");
          return;
        }

        const qs = new URLSearchParams({ filter: targetFilter });
        if (targetFilter === "custom" && customRange) {
          qs.set("from", customRange.from);
          qs.set("to", customRange.to);
        }

        const response = await fetch(`/api/admin/traffic?${qs.toString()}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setReport(null);
          setError(
            (payload && typeof payload.error === "string" && payload.error) ||
              `تعذّر جلب إحصاءات الزيارات (رمز الحالة ${response.status}).`
          );
          return;
        }

        setReport(payload as TrafficReportResponse);
      } catch (err) {
        setReport(null);
        setError(
          err instanceof Error && err.message
            ? `تعذّر الاتصال بالخادم لجلب الإحصاءات: ${err.message}`
            : "تعذّر الاتصال بالخادم لجلب الإحصاءات."
        );
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  useEffect(() => {
    if (filter === "custom") {
      void fetchTrafficReport("custom", appliedCustom);
    } else {
      void fetchTrafficReport(filter);
    }
  }, [filter, appliedCustom, fetchTrafficReport]);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!customFrom || !customTo) {
      setValidationError("يرجى اختيار تاريخ البداية وتاريخ النهاية.");
      return;
    }
    if (customFrom > customTo) {
      setValidationError("يجب أن يكون تاريخ البداية قبل أو مساوياً لتاريخ النهاية.");
      return;
    }

    setAppliedCustom({ from: customFrom, to: customTo });
    if (filter !== "custom") {
      setFilter("custom");
    }
  };

  const handleCopySql = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(TRAFFIC_MIGRATION_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 4000);
    }
  };

  const chartData = useMemo(() => {
    if (!report) return null;
    const { mode, buckets } = buildChartBuckets(report.series);
    const maxVal = Math.max(
      1,
      ...buckets.map((b) => Math.max(b.visits, b.pageviews))
    );
    return { mode, buckets, maxVal };
  }, [report]);

  const hasZeroActivity =
    Boolean(report) &&
    report!.totals.visits === 0 &&
    report!.totals.pageviews === 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header & Baghdad Timezone Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  إحصاءات الزيارات
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>بيانات فعلية مسجّلة في الإنتاج بتوقيت بغداد (Asia/Baghdad)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>محمية بالخادم • دون أسماء أو IP</span>
            </span>

            <button
              type="button"
              onClick={() =>
                void fetchTrafficReport(
                  filter,
                  filter === "custom" ? appliedCustom : undefined
                )
              }
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>تحديث</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {FILTER_OPTIONS.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setValidationError(null);
                  setFilter(item.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Form */}
        {filter === "custom" && (
          <form
            onSubmit={handleApplyCustomRange}
            className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex-1 space-y-1">
              <label
                htmlFor="traffic-custom-from"
                className="block text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                من تاريخ (بتوقيت بغداد)
              </label>
              <input
                id="traffic-custom-from"
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex-1 space-y-1">
              <label
                htmlFor="traffic-custom-to"
                className="block text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                إلى تاريخ (بتوقيت بغداد)
              </label>
              <input
                id="traffic-custom-to"
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>تطبيق النطاق</span>
            </button>
          </form>
        )}

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold">
            {validationError}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-bold">جاري تحميل إحصاءات الزيارات الفعلية...</p>
        </div>
      )}

      {/* Error State (Strict: never fall back to fake/demo numbers) */}
      {!loading && error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 rounded-3xl border border-rose-200 dark:border-rose-900/70 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-black text-rose-900 dark:text-rose-200">
                تعذّر جلب إحصاءات الزيارات
              </h3>
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 font-medium">
                {error}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              void fetchTrafficReport(
                filter,
                filter === "custom" ? appliedCustom : undefined
              )
            }
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Real Report Data */}
      {!loading && !error && report && (
        <>
          {/* Notice when tracking tables are not yet initialized */}
          {!report.trackingStartDate && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-indigo-50 to-purple-50 dark:from-amber-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border-2 border-dashed border-amber-300 dark:border-amber-700/60 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      تفعيل تتبّع الزيارات في Supabase (خطوة واحدة سريعة)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      جداول التتبّع اليومي الآمنة لم تُفعّل بعد في قاعدة البيانات. اضغط الزر لنسخ سكربت الـ SQL الجاهز، ثم الصقه في Supabase SQL Editor واضغط Run.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-all shadow-md active:scale-95"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>تم نسخ كود SQL بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ كود الـ SQL بالكامل 📋</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  عدد الزيارات (جلسات التصفّح)
                </span>
                <div className="text-4xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {report.totals.visits.toLocaleString("en-US")}
                </div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  النطاق: <span className="font-mono">{report.from}</span> إلى{" "}
                  <span className="font-mono">{report.to}</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  مشاهدات الصفحات (فتح الصفحات)
                </span>
                <div className="text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {report.totals.pageviews.toLocaleString("en-US")}
                </div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {report.trackingStartDate
                    ? `بداية التتبّع: ${report.trackingStartDate}`
                    : "بانتظار أول حدث إنتاجي"}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Eye className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Explicit Zero Activity Caption when Tracked Period is Empty */}
          {hasZeroActivity && !report.fullyBeforeTrackingStart && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                هذه الفترة متتبَّعة ولكن لم يُسجّل فيها نشاط حتى الآن (القيمة الفعلية: 0 زيارة و0 مشاهدة).
              </span>
            </div>
          )}

          {/* Chart Card */}
          {chartData && (
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    المخطط البياني للزيارات والمشاهدات
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {chartData.mode === "monthly"
                      ? "تجميع شهري دقيق مستخرج من المجاميع اليومية الفعلية"
                      : `عرض يومي لعدد ${chartData.buckets.length} يوم بتوقيت بغداد`}
                  </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                    <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                    <span>الزيارات</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                    <span>المشاهدات</span>
                  </div>
                </div>
              </div>

              {/* Hover Inspector Bar */}
              <div className="min-h-[40px] px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                {hoveredBucket ? (
                  <>
                    <span className="font-black text-slate-800 dark:text-slate-100 font-mono">
                      {hoveredBucket.rangeLabel}
                    </span>
                    <div className="flex items-center gap-4 font-bold">
                      <span className="text-indigo-600 dark:text-indigo-400">
                        الزيارات: {hoveredBucket.visits.toLocaleString("en-US")}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        المشاهدات: {hoveredBucket.pageviews.toLocaleString("en-US")}
                      </span>
                      {!hoveredBucket.tracked && (
                        <span className="text-amber-600 dark:text-amber-400">
                          (قبل بدء التتبّع)
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    مرّر المؤشر أو اضغط على أي عمود لعرض تفاصيل الزيارات والمشاهدات الدقيقة.
                  </span>
                )}
              </div>

              {/* Responsive Dual-Bar Chart */}
              <div className="overflow-x-auto pb-2">
                <div
                  className="h-56 flex items-end gap-1.5 sm:gap-2 px-2 pt-4 border-b border-slate-200 dark:border-slate-800 min-w-[320px]"
                  onMouseLeave={() => setHoveredBucket(null)}
                >
                  {chartData.buckets.map((bucket) => {
                    const visitPct =
                      bucket.visits === 0
                        ? 0
                        : Math.max(4, Math.round((bucket.visits / chartData.maxVal) * 100));
                    const pvPct =
                      bucket.pageviews === 0
                        ? 0
                        : Math.max(4, Math.round((bucket.pageviews / chartData.maxVal) * 100));

                    return (
                      <button
                        key={bucket.key}
                        type="button"
                        onMouseEnter={() => setHoveredBucket(bucket)}
                        onFocus={() => setHoveredBucket(bucket)}
                        onClick={() => setHoveredBucket(bucket)}
                        aria-label={`${bucket.rangeLabel}: ${bucket.visits} زيارات، ${bucket.pageviews} مشاهدات`}
                        className={`flex-1 min-w-[20px] h-full flex flex-col justify-end items-center group rounded-lg px-0.5 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/50 focus:outline-none ${
                          !bucket.tracked ? "opacity-55" : ""
                        }`}
                      >
                        <div className="w-full flex-1 flex items-end justify-center gap-0.5 sm:gap-1 pb-1">
                          <div
                            style={{ height: `${visitPct}%` }}
                            className={`w-1/2 max-w-[16px] rounded-t-md transition-all ${
                              bucket.visits > 0
                                ? "bg-indigo-500 group-hover:bg-indigo-400"
                                : "h-[2px] bg-slate-200 dark:bg-slate-700"
                            }`}
                          />
                          <div
                            style={{ height: `${pvPct}%` }}
                            className={`w-1/2 max-w-[16px] rounded-t-md transition-all ${
                              bucket.pageviews > 0
                                ? "bg-emerald-500 group-hover:bg-emerald-400"
                                : "h-[2px] bg-slate-200 dark:bg-slate-700"
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 truncate max-w-full py-1">
                          {bucket.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
