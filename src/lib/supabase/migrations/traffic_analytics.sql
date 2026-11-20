-- =========================================================================
-- SUPER MIND | العقل الخارق — Traffic Analytics Schema & Atomic RPC
-- يتتبّع الزيارات ومشاهدات الصفحات بتوقيت بغداد (Asia/Baghdad) دون تخزين أسماء أو عناوين IP
-- يُشغَّل في Supabase SQL Editor بعد مراجعة التعديلات والموافقة عليها
-- =========================================================================

-- 1. جدول إعدادات بدء التتبّع (صف واحد فقط id = 1)
CREATE TABLE IF NOT EXISTS public.site_traffic_meta (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tracking_start_date DATE NOT NULL DEFAULT (TIMEZONE('Asia/Baghdad', NOW()))::DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.site_traffic_meta (id, tracking_start_date)
VALUES (1, (TIMEZONE('Asia/Baghdad', NOW()))::DATE)
ON CONFLICT (id) DO NOTHING;

-- 2. جدول المجاميع اليومية (يدعم فلتر آخر سنة والفترات الطويلة بكفاءة عالية)
CREATE TABLE IF NOT EXISTS public.site_traffic_daily (
  traffic_date DATE PRIMARY KEY,
  visits INT NOT NULL DEFAULT 0 CHECK (visits >= 0),
  pageviews INT NOT NULL DEFAULT 0 CHECK (pageviews >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_traffic_daily_date
  ON public.site_traffic_daily(traffic_date DESC);

-- 3. جدول الجلسات لمنع تكرار احتساب الزيارة الواحدة لنفس جلسة التصفّح
-- ملاحظة: لا يخزّن أي اسم، بريد إلكتروني، معرّف مستخدم، أو عنوان IP
CREATE TABLE IF NOT EXISTS public.site_traffic_sessions (
  session_id TEXT PRIMARY KEY,
  first_traffic_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_traffic_sessions_created_at
  ON public.site_traffic_sessions(created_at DESC);

-- 4. جدول الأحداث لمنع التكرار عند إعادة إرسال نفس الحدث (Idempotency)
-- ملاحظة: لا يخزّن أي بيانات شخصية أو عناوين IP
CREATE TABLE IF NOT EXISTS public.site_traffic_events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  traffic_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_traffic_events_created_at
  ON public.site_traffic_events(created_at DESC);

-- 5. تفعيل Row Level Security (حصر القراءة على الأدمن فقط)
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

-- 6. دالة ذرية آمنة لتسجيل الحدث ومنع التكرار (SECURITY DEFINER)
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
  -- التحقق من صحة المعاملات دون تخزين أي بيانات تعريفية
  IF length(v_clean_session) < 8 OR length(v_clean_session) > 128 THEN
    RAISE EXCEPTION 'Invalid session_id';
  END IF;

  IF length(v_clean_event) < 8 OR length(v_clean_event) > 128 THEN
    RAISE EXCEPTION 'Invalid event_id';
  END IF;

  IF p_traffic_date IS NULL OR p_traffic_date < DATE '2026-01-01' OR p_traffic_date > (v_baghdad_today + 1) THEN
    RAISE EXCEPTION 'Invalid traffic_date';
  END IF;

  -- ضمان وجود تاريخ بدء التتبّع (يُحفظ لأول مرة ولا يتغيّر للخلف إلا عند غيابه)
  INSERT INTO public.site_traffic_meta (id, tracking_start_date)
  VALUES (1, LEAST(v_baghdad_today, p_traffic_date))
  ON CONFLICT (id) DO NOTHING;

  -- 1) منع تكرار العدّ عند إعادة إرسال نفس الحدث (event_id فريد)
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

  -- 2) احتساب زيارة واحدة فقط لكل جلسة تصفّح (session_id فريد)
  INSERT INTO public.site_traffic_sessions (session_id, first_traffic_date)
  VALUES (v_clean_session, p_traffic_date)
  ON CONFLICT (session_id) DO NOTHING
  RETURNING session_id INTO v_session_inserted;

  IF v_session_inserted IS NOT NULL THEN
    v_visit_inc := 1;
  END IF;

  -- 3) تحديث المجاميع اليومية بتوقيت بغداد
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
GRANT EXECUTE ON FUNCTION public.record_site_traffic(DATE, TEXT, TEXT) TO anon, authenticated, service_role;
