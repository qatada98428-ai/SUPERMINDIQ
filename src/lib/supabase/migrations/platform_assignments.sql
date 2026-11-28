-- =========================================================================
-- SUPER MIND | العقل الخارق — Platform Competitions, Trainer Tournaments & Submissions
-- Supports multi-rule competition simulator settings, targeted student notifications,
-- multi-attempt tracking, and real-time leaderboards across devices.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.platform_assignments (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('trainer_homework', 'admin_competition', 'admin_challenge')),
  title TEXT NOT NULL,
  description TEXT,
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_role TEXT NOT NULL CHECK (creator_role IN ('trainer', 'admin')),
  target_type TEXT NOT NULL DEFAULT 'all_students',
  target_value TEXT,
  target_student_ids TEXT[] NOT NULL DEFAULT '{}',
  config JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notify_students BOOLEAN NOT NULL DEFAULT true,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_assignments_active_created
  ON public.platform_assignments (is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_assignments_creator
  ON public.platform_assignments (creator_id);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id TEXT NOT NULL REFERENCES public.platform_assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  governorate TEXT,
  score INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  accuracy INT NOT NULL DEFAULT 0,
  duration_seconds INT NOT NULL DEFAULT 0,
  attempt_number INT NOT NULL DEFAULT 1,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_leaderboard
  ON public.assignment_submissions (assignment_id, correct_answers DESC, duration_seconds ASC);

ALTER TABLE public.platform_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_assignments_select_public" ON public.platform_assignments;
CREATE POLICY "platform_assignments_select_public"
  ON public.platform_assignments
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    OR creator_id = (SELECT auth.uid())::text
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "platform_assignments_insert_staff" ON public.platform_assignments;
CREATE POLICY "platform_assignments_insert_staff"
  ON public.platform_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (SELECT role FROM public.profiles WHERE id = (SELECT auth.uid())) IN ('trainer', 'admin')
  );

DROP POLICY IF EXISTS "platform_assignments_update_staff" ON public.platform_assignments;
CREATE POLICY "platform_assignments_update_staff"
  ON public.platform_assignments
  FOR UPDATE
  TO authenticated
  USING (
    creator_id = (SELECT auth.uid())::text
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "platform_assignments_delete_staff" ON public.platform_assignments;
CREATE POLICY "platform_assignments_delete_staff"
  ON public.platform_assignments
  FOR DELETE
  TO authenticated
  USING (
    creator_id = (SELECT auth.uid())::text
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "assignment_submissions_select_auth" ON public.assignment_submissions;
CREATE POLICY "assignment_submissions_select_auth"
  ON public.assignment_submissions
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "assignment_submissions_insert_auth" ON public.assignment_submissions;
CREATE POLICY "assignment_submissions_insert_auth"
  ON public.assignment_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = (SELECT auth.uid())::text
    OR public.is_admin()
    OR (SELECT role FROM public.profiles WHERE id = (SELECT auth.uid())) IN ('trainer', 'admin')
  );

DROP POLICY IF EXISTS "assignment_submissions_update_auth" ON public.assignment_submissions;
CREATE POLICY "assignment_submissions_update_auth"
  ON public.assignment_submissions
  FOR UPDATE
  TO authenticated
  USING (
    student_id = (SELECT auth.uid())::text
    OR public.is_admin()
  );
