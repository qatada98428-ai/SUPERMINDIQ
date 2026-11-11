-- =========================================================================
-- SUPER MIND | العقل الخارق — Database Schema & Advanced Security Policies
-- الإصدار 2.1 المعتمد — حماية متعددة الطبقات ضد تصعيد الصلاحيات وتسريب البيانات
-- تاريخ التحديث: 2026-11-11
-- التغييرات: تقوية RLS على profiles + حماية UPDATE على الطلبات + منع حذف التقدم
-- =========================================================================

-- =========================================================================
-- 1. EXTENSIONS
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 2. ENUMS (Safe Idempotent Creation)
-- =========================================================================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('student', 'trainer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('pending', 'active', 'expired', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =========================================================================
-- 3. PROFILES TABLE (بيانات المستخدمين والصلاحيات)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL DEFAULT 'مستخدم جديد',
  role public.user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =========================================================================
-- 4. USER PROGRESS TABLE (سجل تقدم الطالب والنتائج)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_level TEXT NOT NULL DEFAULT 'المستوى الأول',
  last_exercise TEXT NOT NULL DEFAULT 'فلاش أنزان - تمهيدي',
  total_answers INT NOT NULL DEFAULT 0 CHECK (total_answers >= 0),
  correct_answers INT NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  wrong_answers INT NOT NULL DEFAULT 0 CHECK (wrong_answers >= 0),
  accuracy_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (accuracy_rate >= 0 AND accuracy_rate <= 100),
  completed_exercises INT NOT NULL DEFAULT 0 CHECK (completed_exercises >= 0),
  training_duration_seconds INT NOT NULL DEFAULT 0 CHECK (training_duration_seconds >= 0),
  best_score INT NOT NULL DEFAULT 0 CHECK (best_score >= 0),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);

-- =========================================================================
-- 5. TRAINING SESSIONS TABLE (سجل الجلسات التدريبية السابقة)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('flash_anzan', 'abacus', 'multiplication', 'quiz', 'teams_battle')),
  level TEXT NOT NULL DEFAULT 'المستوى الأول',
  total_questions INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  wrong_answers INT NOT NULL DEFAULT 0,
  accuracy_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  duration_seconds INT NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_user_id ON public.training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_created_at ON public.training_sessions(created_at);

-- =========================================================================
-- 6. TRAINER APPLICATIONS TABLE (طلبات إدراج المدربين - 25,000 د.ع)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.trainer_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  governorate TEXT NOT NULL DEFAULT 'الأنبار - الرمادي',
  country TEXT NOT NULL DEFAULT 'العراق',
  bio TEXT NOT NULL,
  photo_url TEXT,
  annual_fee_iqd INT NOT NULL DEFAULT 25000,
  status public.application_status NOT NULL DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 7. SCHOOL APPLICATIONS TABLE (طلبات إدراج المدارس - 75,000 د.ع)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.school_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  governorate TEXT NOT NULL DEFAULT 'الأنبار - الرمادي',
  country TEXT NOT NULL DEFAULT 'العراق',
  address TEXT NOT NULL DEFAULT 'العراق — الأنبار — الرمادي',
  curriculum_stage TEXT NOT NULL DEFAULT 'المستوى التمهيدي والمستوى الأول',
  bio TEXT NOT NULL,
  book_cover_url TEXT,
  annual_fee_iqd INT NOT NULL DEFAULT 75000,
  status public.application_status NOT NULL DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 8. SUPPORTERS TABLE (شركاء في صناعة العقول)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.supporters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 9. ADMIN AUDIT LOGS TABLE (سجل الرقابة والعمليات الإدارية)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'trainer', 'school', 'supporter', 'settings')),
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 10. SECURITY FUNCTIONS & PRIVILEGE ENFORCEMENT
-- =========================================================================

-- ---------------------------------------------------------------------------
-- A) is_admin(): التحقق من صلاحيات المدير بدون Infinite Recursion
--    SECURITY DEFINER = تعمل بصلاحيات المالك (يتجاوز RLS داخلياً فقط)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
  v_status text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role, status INTO v_role, v_status
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN (v_role = 'admin'::public.user_role AND v_status = 'active');
END;
$$;

-- ---------------------------------------------------------------------------
-- B) handle_profile_update(): درع الحماية — يمنع تعديل الصلاحيات قهراً
--    يعمل كـ BEFORE UPDATE trigger على profiles
--    حتى لو تجاوز المستخدم RLS بطريقة ما، هذا التريغر يُعيد القيم الحساسة
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إذا لم يكن المتصل مديراً، نُلغي أي محاولة لتعديل الحقول الحساسة
  IF NOT public.is_admin() THEN
    NEW.id          := OLD.id;
    NEW.email       := OLD.email;
    NEW.role        := OLD.role;
    NEW.status      := OLD.status;
    NEW.created_at  := OLD.created_at;
  END IF;

  -- تحديث آخر نشاط دائماً
  NEW.last_activity := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_update ON public.profiles;
CREATE TRIGGER trg_protect_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_update();

-- ---------------------------------------------------------------------------
-- C) handle_new_application(): تعقيم طلبات المدربين/المدارس عند الإدراج
--    يفرض status='pending' ويحذف التواريخ والملاحظات من غير الإداريين
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.status     := 'pending'::public.application_status;
    NEW.start_date := NULL;
    NEW.end_date   := NULL;
    NEW.notes      := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- تريغر INSERT للمدربين
DROP TRIGGER IF EXISTS trg_sanitize_trainer_app ON public.trainer_applications;
CREATE TRIGGER trg_sanitize_trainer_app
  BEFORE INSERT ON public.trainer_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_application();

-- تريغر INSERT للمدارس
DROP TRIGGER IF EXISTS trg_sanitize_school_app ON public.school_applications;
CREATE TRIGGER trg_sanitize_school_app
  BEFORE INSERT ON public.school_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_application();

-- ---------------------------------------------------------------------------
-- D) handle_application_update(): حماية UPDATE على الطلبات
--    يمنع أي شخص غير الإدارة من تعديل status أو التواريخ أو الملاحظات
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_application_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    -- يُعيد الحقول الحساسة إلى قيمها القديمة
    NEW.status      := OLD.status;
    NEW.start_date  := OLD.start_date;
    NEW.end_date    := OLD.end_date;
    NEW.notes       := OLD.notes;
    NEW.annual_fee_iqd := OLD.annual_fee_iqd;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- تريغر UPDATE للمدربين
DROP TRIGGER IF EXISTS trg_protect_trainer_app_update ON public.trainer_applications;
CREATE TRIGGER trg_protect_trainer_app_update
  BEFORE UPDATE ON public.trainer_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_application_update();

-- تريغر UPDATE للمدارس
DROP TRIGGER IF EXISTS trg_protect_school_app_update ON public.school_applications;
CREATE TRIGGER trg_protect_school_app_update
  BEFORE UPDATE ON public.school_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_application_update();

-- ---------------------------------------------------------------------------
-- E) handle_new_user(): إنشاء الملف الشخصي وسجل التقدم تلقائياً عند التسجيل
--    دائماً يُعيّن role='student' — لا يمكن تجاوزه من الواجهة
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar_url, phone, status, created_at, last_activity)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    'student'::public.user_role,       -- دائماً طالب، لا يمكن تجاوزه
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    last_activity = NOW();

  INSERT INTO public.user_progress (
    user_id, current_level, last_exercise,
    total_answers, correct_answers, wrong_answers,
    accuracy_rate, completed_exercises, training_duration_seconds,
    best_score, last_activity, updated_at
  )
  VALUES (
    NEW.id,
    'المستوى الأول',
    'فلاش أنزان - تمهيدي',
    0, 0, 0, 0.00, 0, 0, 0, NOW(), NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 11. COLUMN PRIVILEGES (حماية الأعمدة على مستوى PostgreSQL)
-- =========================================================================

-- سحب صلاحية UPDATE الشاملة من المستخدمين العاديين والزوار
REVOKE UPDATE ON public.profiles FROM anon, authenticated;

-- السماح للمستخدمين المسجلين فقط بتعديل بياناتهم الشخصية الآمنة
-- role, status, email, id, created_at = محظورة تماماً حتى مع GRANT
GRANT UPDATE (name, avatar_url, phone) ON public.profiles TO authenticated;

-- منع الإدراج المباشر في profiles — يتم حصراً عبر التريغر الآمن
REVOKE INSERT ON public.profiles FROM anon, authenticated;

-- =========================================================================
-- 12. ROW LEVEL SECURITY (RLS) — تفعيل على جميع الجداول
-- =========================================================================
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs    ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 13. RLS POLICIES
-- =========================================================================

-- -------------------------------------------------------------------------
-- A) PROFILES — سياسات جدول الملفات الشخصية
-- -------------------------------------------------------------------------

-- المستخدم يرى ملفه الشخصي فقط
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- المدير يرى جميع الملفات
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- المستخدم يعدّل فقط ملفه الشخصي (الحقول المسموحة محددة بـ GRANT في §11)
-- التريغر trg_protect_profile_update يضمن عدم تعديل role/status حتى لو تجاوز RLS
DROP POLICY IF EXISTS "Users can update their own safe profile" ON public.profiles;
CREATE POLICY "Users can update their own safe profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- المدير يعدّل أي ملف (بما فيها role و status)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- المدير فقط يستطيع حذف الملفات
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- -------------------------------------------------------------------------
-- B) USER PROGRESS — سياسات سجل التقدم
-- -------------------------------------------------------------------------

-- المستخدم يرى تقدمه فقط / المدير يرى الكل
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- المستخدم يحدّث تقدمه فقط / المدير يحدّث الكل
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- المستخدم يُدرج سجل تقدمه فقط (المدير أيضاً)
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ⛔ لا يستطيع المستخدم العادي حذف سجل تقدمه — المدير فقط
DROP POLICY IF EXISTS "Only admins can delete progress" ON public.user_progress;
CREATE POLICY "Only admins can delete progress"
  ON public.user_progress FOR DELETE
  USING (public.is_admin());

-- -------------------------------------------------------------------------
-- C) TRAINING SESSIONS — سياسات الجلسات التدريبية
-- -------------------------------------------------------------------------

-- المستخدم يرى جلساته فقط / المدير يرى الكل
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.training_sessions;
CREATE POLICY "Users can view their own sessions"
  ON public.training_sessions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- المستخدم يُدرج جلساته فقط
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.training_sessions;
CREATE POLICY "Users can insert their own sessions"
  ON public.training_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ⛔ المستخدم العادي لا يستطيع تعديل أو حذف الجلسات — المدير فقط
DROP POLICY IF EXISTS "Only admins can update sessions" ON public.training_sessions;
CREATE POLICY "Only admins can update sessions"
  ON public.training_sessions FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete sessions" ON public.training_sessions;
CREATE POLICY "Only admins can delete sessions"
  ON public.training_sessions FOR DELETE
  USING (public.is_admin());

-- -------------------------------------------------------------------------
-- D) TRAINER APPLICATIONS — سياسات طلبات المدربين
-- -------------------------------------------------------------------------

-- ✅ المدير: كامل الصلاحيات (يشمل SELECT للبيانات الحساسة)
DROP POLICY IF EXISTS "Admins full access to trainer_applications" ON public.trainer_applications;
CREATE POLICY "Admins full access to trainer_applications"
  ON public.trainer_applications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ✅ العامة: يستطيعون تقديم طلب جديد فقط (يعقمه التريغر → pending)
DROP POLICY IF EXISTS "Public can submit trainer application" ON public.trainer_applications;
CREATE POLICY "Public can submit trainer application"
  ON public.trainer_applications FOR INSERT
  WITH CHECK (true);

-- ✅ العامة: يرون فقط المدربين المعتمدين والنشطين (status='active')
--    ⛔ لا يمكنهم رؤية الطلبات قيد الانتظار أو المرفوضة (بيانات شخصية خاصة)
DROP POLICY IF EXISTS "Public can view active trainers only" ON public.trainer_applications;
CREATE POLICY "Public can view active trainers only"
  ON public.trainer_applications FOR SELECT
  USING (status = 'active');

-- -------------------------------------------------------------------------
-- E) SCHOOL APPLICATIONS — سياسات طلبات المدارس
-- -------------------------------------------------------------------------

-- ✅ المدير: كامل الصلاحيات
DROP POLICY IF EXISTS "Admins full access to school_applications" ON public.school_applications;
CREATE POLICY "Admins full access to school_applications"
  ON public.school_applications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ✅ العامة: تقديم طلب فقط (يعقمه التريغر → pending)
DROP POLICY IF EXISTS "Public can submit school application" ON public.school_applications;
CREATE POLICY "Public can submit school application"
  ON public.school_applications FOR INSERT
  WITH CHECK (true);

-- ✅ العامة: يرون المدارس المعتمدة والنشطة فقط (status='active')
DROP POLICY IF EXISTS "Public can view active schools only" ON public.school_applications;
CREATE POLICY "Public can view active schools only"
  ON public.school_applications FOR SELECT
  USING (status = 'active');

-- -------------------------------------------------------------------------
-- F) SUPPORTERS — سياسات الداعمين والشركاء
-- -------------------------------------------------------------------------

-- العامة يرون الداعمين النشطين فقط
DROP POLICY IF EXISTS "Public can view active supporters" ON public.supporters;
CREATE POLICY "Public can view active supporters"
  ON public.supporters FOR SELECT
  USING (is_active = true OR public.is_admin());

-- المدير فقط يستطيع إضافة وتعديل وحذف الداعمين
DROP POLICY IF EXISTS "Admins can manage supporters" ON public.supporters;
CREATE POLICY "Admins can manage supporters"
  ON public.supporters FOR ALL
  USING (public.is_admin());

-- -------------------------------------------------------------------------
-- G) ADMIN AUDIT LOGS — سجل الرقابة (للإدارة العليا حصراً)
-- -------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- =========================================================================
-- 14. GRANT ADMIN ROLE (تشغيل هذا الأمر مرة واحدة بعد إنشاء حسابك)
-- =========================================================================
-- بعد تسجيل دخولك للمرة الأولى، شغّل هذا في Supabase SQL Editor:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE email = 'YOUR_EMAIL_HERE';
--
-- ⚠️ استبدل YOUR_EMAIL_HERE بعنوان بريدك الإلكتروني الفعلي
-- ⚠️ هذا الأمر يعمل فقط من SQL Editor في Supabase Dashboard (service_role)
-- =========================================================================
