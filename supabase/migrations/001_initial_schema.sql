-- ============================================================
-- Course & Lecture Management Platform
-- Initial Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'executor', 'faculty', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- EXECUTORS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.executors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  executor_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- FACULTY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  faculty_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL UNIQUE,
  assigned_executor_id UUID REFERENCES public.executors(id) ON DELETE SET NULL,
  assigned_faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  curriculum JSONB DEFAULT '[]'::jsonb,
  faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- COURSE PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_months INT NOT NULL CHECK (duration_months > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES public.course_plans(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT,
  payment_provider TEXT NOT NULL DEFAULT 'mock' CHECK (payment_provider IN ('mock', 'razorpay')),
  provider_order_id TEXT,
  provider_payment_id TEXT,
  provider_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  course_start_date DATE,
  course_expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- COURSE ENROLLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES public.course_plans(id) ON DELETE RESTRICT,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  start_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'expiring_soon', 'expired', 'suspended', 'cancelled')
  ),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ENROLLMENT ACCESS ADJUSTMENTS (Admin manual extensions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.enrollment_access_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  previous_expiry_date DATE NOT NULL,
  new_expiry_date DATE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- LECTURES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  lecture_date DATE,
  start_time TIME,
  end_time TIME,
  lecture_url TEXT,
  recording_url TEXT,
  downloadable_file_path TEXT,
  is_downloadable BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'live', 'completed', 'cancelled', 'disabled')
  ),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- LECTURE LINKS (sharing tracker — NOT access control)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lecture_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES public.profiles(id),
  shared_with UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DOWNLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  lecture_id UUID NOT NULL REFERENCES public.lectures(id) ON DELETE CASCADE,
  file_name TEXT,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'completed', 'expired')),
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lecture', 'payment', 'course', 'system', 'followup')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- FOLLOWUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executor_id UUID NOT NULL REFERENCES public.executors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  followup_date DATE NOT NULL,
  followup_time TIME,
  followup_type TEXT NOT NULL CHECK (followup_type IN ('call', 'email', 'whatsapp', 'in-person')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'contacted', 'interested', 'payment_pending', 'enrolled', 'not_interested', 'follow_up_required')
  ),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role, resource, action)
);

-- ============================================================
-- AUDIT LOGS (append-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_executors_updated_at BEFORE UPDATE ON public.executors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_faculty_updated_at BEFORE UPDATE ON public.faculty
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_course_plans_updated_at BEFORE UPDATE ON public.course_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_course_enrollments_updated_at BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_lectures_updated_at BEFORE UPDATE ON public.lectures
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_followups_updated_at BEFORE UPDATE ON public.followups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_permissions_updated_at BEFORE UPDATE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    'active'
  );
  
  -- Create role-specific record
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'student') = 'student' THEN
    INSERT INTO public.students (profile_id, student_id, status)
    VALUES (NEW.id, 'STU-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'), 'active');
  ELSIF NEW.raw_user_meta_data ->> 'role' = 'executor' THEN
    INSERT INTO public.executors (profile_id, executor_id, status)
    VALUES (NEW.id, 'EXE-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'), 'active');
  ELSIF NEW.raw_user_meta_data ->> 'role' = 'faculty' THEN
    INSERT INTO public.faculty (profile_id, faculty_id, status)
    VALUES (NEW.id, 'FAC-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'), 'active');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: create profile on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CALCULATE COURSE DATES (calendar-based, single source of truth)
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_course_dates(
  p_start_date DATE,
  p_duration_months INT
)
RETURNS TABLE (course_start_date DATE, course_expiry_date DATE) AS $$
BEGIN
  RETURN QUERY SELECT
    p_start_date,
    (p_start_date + (p_duration_months || ' months')::INTERVAL)::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- VERIFY LECTURE ACCESS (8-step validation)
-- ============================================================
CREATE OR REPLACE FUNCTION public.verify_lecture_access(
  p_user_id UUID,
  p_lecture_id UUID
)
RETURNS TABLE (
  has_access BOOLEAN,
  reason TEXT,
  lecture_url TEXT,
  recording_url TEXT
) AS $$
DECLARE
  v_role TEXT;
  v_student_id UUID;
  v_course_id UUID;
  v_enrollment RECORD;
  v_payment RECORD;
  v_lecture RECORD;
BEGIN
  -- Step 1: Check authentication (caller must provide valid user_id)
  IF p_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Not authenticated'::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Step 2: Check user role
  SELECT p.role INTO v_role FROM public.profiles p WHERE p.id = p_user_id;
  
  -- Admin and faculty have special access
  IF v_role = 'admin' THEN
    SELECT l.lecture_url, l.recording_url, l.course_id, l.status
    INTO v_lecture
    FROM public.lectures l WHERE l.id = p_lecture_id;
    
    IF v_lecture IS NULL THEN
      RETURN QUERY SELECT false, 'Lecture not found'::TEXT, NULL::TEXT, NULL::TEXT;
      RETURN;
    END IF;
    
    RETURN QUERY SELECT true, 'Admin access'::TEXT, v_lecture.lecture_url, v_lecture.recording_url;
    RETURN;
  END IF;
  
  IF v_role != 'student' THEN
    RETURN QUERY SELECT false, 'Only students can access lectures through this route'::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Get student record
  SELECT s.id INTO v_student_id FROM public.students s WHERE s.profile_id = p_user_id;
  IF v_student_id IS NULL THEN
    RETURN QUERY SELECT false, 'Student record not found'::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Get lecture details
  SELECT l.* INTO v_lecture FROM public.lectures l WHERE l.id = p_lecture_id;
  IF v_lecture IS NULL THEN
    RETURN QUERY SELECT false, 'Lecture not found'::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Step 7: Check lecture not disabled
  IF v_lecture.status = 'disabled' OR v_lecture.status = 'cancelled' THEN
    RETURN QUERY SELECT false, 'This lecture is currently unavailable'::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Step 3: Check enrollment
  SELECT ce.* INTO v_enrollment
  FROM public.course_enrollments ce
  WHERE ce.student_id = v_student_id
    AND ce.course_id = v_lecture.course_id
    AND ce.status IN ('active', 'expiring_soon')
  ORDER BY ce.expiry_date DESC
  LIMIT 1;
  
  IF v_enrollment IS NULL THEN
    -- Check if expired
    SELECT ce.* INTO v_enrollment
    FROM public.course_enrollments ce
    WHERE ce.student_id = v_student_id
      AND ce.course_id = v_lecture.course_id
    ORDER BY ce.expiry_date DESC
    LIMIT 1;
    
    IF v_enrollment IS NOT NULL AND v_enrollment.status = 'expired' THEN
      RETURN QUERY SELECT false, 
        ('Your course access has expired on ' || v_enrollment.expiry_date::TEXT)::TEXT, 
        NULL::TEXT, NULL::TEXT;
      RETURN;
    END IF;
    
    RETURN QUERY SELECT false, 'You are not enrolled in this course'::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Step 4: Check payment
  SELECT pay.* INTO v_payment
  FROM public.payments pay
  WHERE pay.id = v_enrollment.payment_id;
  
  IF v_payment IS NULL OR v_payment.status != 'success' THEN
    RETURN QUERY SELECT false, 'Payment verification required'::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Step 5: Check enrollment is active (already done above in WHERE clause)

  -- Step 6: Check date validity
  IF CURRENT_DATE > v_enrollment.expiry_date THEN
    RETURN QUERY SELECT false, 
      ('Your course access has expired on ' || v_enrollment.expiry_date::TEXT)::TEXT, 
      NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Step 8: All checks passed
  RETURN QUERY SELECT true, 'Access granted'::TEXT, v_lecture.lecture_url, v_lecture.recording_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- UPDATE ENROLLMENT STATUS (expiry automation)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_enrollment_statuses()
RETURNS void AS $$
BEGIN
  -- ACTIVE → EXPIRING_SOON (7 days or less)
  UPDATE public.course_enrollments
  SET status = 'expiring_soon'
  WHERE status = 'active'
    AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'
    AND expiry_date > CURRENT_DATE;

  -- EXPIRING_SOON/ACTIVE → EXPIRED
  UPDATE public.course_enrollments
  SET status = 'expired'
  WHERE status IN ('active', 'expiring_soon')
    AND expiry_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
