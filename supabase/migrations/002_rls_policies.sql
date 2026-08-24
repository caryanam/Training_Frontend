-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_access_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: Check user role from profiles (performance: use subquery)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- PROFILES
-- ============================================================
-- Users can read their own profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = (SELECT auth.uid()));

-- Admins can read all profiles
CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'admin');

-- Faculty can read student profiles (for their courses)
CREATE POLICY profiles_select_faculty ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'faculty');

-- Executors can read student profiles (for assigned students)
CREATE POLICY profiles_select_executor ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'executor');

-- Users can update their own profile (limited fields)
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Admins can update any profile
CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- ============================================================
-- STUDENTS
-- ============================================================
-- Students can read their own record
CREATE POLICY students_select_own ON public.students
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

-- Executors can see their assigned students
CREATE POLICY students_select_executor ON public.students
  FOR SELECT USING (
    assigned_executor_id IN (
      SELECT e.id FROM public.executors e WHERE e.profile_id = (SELECT auth.uid())
    )
  );

-- Faculty can see students enrolled in their courses
CREATE POLICY students_select_faculty ON public.students
  FOR SELECT USING (public.get_user_role() = 'faculty');

-- Admins can CRUD all students
CREATE POLICY students_select_admin ON public.students
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY students_insert_admin ON public.students
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY students_update_admin ON public.students
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY students_delete_admin ON public.students
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- EXECUTORS
-- ============================================================
CREATE POLICY executors_select_own ON public.executors
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

CREATE POLICY executors_select_admin ON public.executors
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY executors_insert_admin ON public.executors
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY executors_update_admin ON public.executors
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- Faculty can view executors
CREATE POLICY executors_select_faculty ON public.executors
  FOR SELECT USING (public.get_user_role() = 'faculty');

-- ============================================================
-- FACULTY
-- ============================================================
CREATE POLICY faculty_select_own ON public.faculty
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

CREATE POLICY faculty_select_admin ON public.faculty
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY faculty_insert_admin ON public.faculty
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY faculty_update_admin ON public.faculty
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- Students can view faculty
CREATE POLICY faculty_select_student ON public.faculty
  FOR SELECT USING (public.get_user_role() = 'student');

-- Executors can view faculty
CREATE POLICY faculty_select_executor ON public.faculty
  FOR SELECT USING (public.get_user_role() = 'executor');

-- ============================================================
-- COURSES (readable by all authenticated, writable by admin/faculty)
-- ============================================================
CREATE POLICY courses_select_all ON public.courses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY courses_insert_admin ON public.courses
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY courses_update_admin ON public.courses
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY courses_delete_admin ON public.courses
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- COURSE PLANS (readable by all authenticated)
-- ============================================================
CREATE POLICY course_plans_select_all ON public.course_plans
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY course_plans_insert_admin ON public.course_plans
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY course_plans_update_admin ON public.course_plans
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY course_plans_delete_admin ON public.course_plans
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================================
-- PAYMENTS
-- ============================================================
-- Students see own payments
CREATE POLICY payments_select_own ON public.payments
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s WHERE s.profile_id = (SELECT auth.uid())
    )
  );

-- Admins see all payments
CREATE POLICY payments_select_admin ON public.payments
  FOR SELECT USING (public.get_user_role() = 'admin');

-- Executors can see payments for assigned students
CREATE POLICY payments_select_executor ON public.payments
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s
      WHERE s.assigned_executor_id IN (
        SELECT e.id FROM public.executors e WHERE e.profile_id = (SELECT auth.uid())
      )
    )
  );

-- Only system/admin can insert/update payments (via functions)
CREATE POLICY payments_insert_system ON public.payments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY payments_update_admin ON public.payments
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- ============================================================
-- COURSE ENROLLMENTS
-- ============================================================
-- Students see own enrollments
CREATE POLICY enrollments_select_own ON public.course_enrollments
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s WHERE s.profile_id = (SELECT auth.uid())
    )
  );

-- Admins see all
CREATE POLICY enrollments_select_admin ON public.course_enrollments
  FOR SELECT USING (public.get_user_role() = 'admin');

-- Faculty see enrollments for their courses
CREATE POLICY enrollments_select_faculty ON public.course_enrollments
  FOR SELECT USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      WHERE c.faculty_id IN (
        SELECT f.id FROM public.faculty f WHERE f.profile_id = (SELECT auth.uid())
      )
    )
  );

-- Executors see enrollments for assigned students
CREATE POLICY enrollments_select_executor ON public.course_enrollments
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s
      WHERE s.assigned_executor_id IN (
        SELECT e.id FROM public.executors e WHERE e.profile_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY enrollments_insert_system ON public.course_enrollments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY enrollments_update_admin ON public.course_enrollments
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- ============================================================
-- ENROLLMENT ACCESS ADJUSTMENTS
-- ============================================================
CREATE POLICY adjustments_select_admin ON public.enrollment_access_adjustments
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY adjustments_insert_admin ON public.enrollment_access_adjustments
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

-- Students can see adjustments for their enrollments
CREATE POLICY adjustments_select_own ON public.enrollment_access_adjustments
  FOR SELECT USING (
    enrollment_id IN (
      SELECT ce.id FROM public.course_enrollments ce
      WHERE ce.student_id IN (
        SELECT s.id FROM public.students s WHERE s.profile_id = (SELECT auth.uid())
      )
    )
  );

-- ============================================================
-- LECTURES
-- ============================================================
-- Students can see lectures for enrolled courses (metadata only)
CREATE POLICY lectures_select_student ON public.lectures
  FOR SELECT USING (
    public.get_user_role() = 'student' AND
    course_id IN (
      SELECT ce.course_id FROM public.course_enrollments ce
      WHERE ce.student_id IN (
        SELECT s.id FROM public.students s WHERE s.profile_id = (SELECT auth.uid())
      )
    )
  );

-- Faculty can CRUD their own lectures
CREATE POLICY lectures_select_faculty ON public.lectures
  FOR SELECT USING (
    faculty_id IN (
      SELECT f.id FROM public.faculty f WHERE f.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY lectures_insert_faculty ON public.lectures
  FOR INSERT WITH CHECK (
    faculty_id IN (
      SELECT f.id FROM public.faculty f WHERE f.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY lectures_update_faculty ON public.lectures
  FOR UPDATE USING (
    faculty_id IN (
      SELECT f.id FROM public.faculty f WHERE f.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY lectures_delete_faculty ON public.lectures
  FOR DELETE USING (
    faculty_id IN (
      SELECT f.id FROM public.faculty f WHERE f.profile_id = (SELECT auth.uid())
    )
  );

-- Admins have full access
CREATE POLICY lectures_select_admin ON public.lectures
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY lectures_insert_admin ON public.lectures
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY lectures_update_admin ON public.lectures
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY lectures_delete_admin ON public.lectures
  FOR DELETE USING (public.get_user_role() = 'admin');

-- Executors can view lectures (for sharing info)
CREATE POLICY lectures_select_executor ON public.lectures
  FOR SELECT USING (public.get_user_role() = 'executor');

-- ============================================================
-- LECTURE LINKS
-- ============================================================
-- Users can see links shared with them
CREATE POLICY lecture_links_select_own ON public.lecture_links
  FOR SELECT USING (
    shared_with = (SELECT auth.uid()) OR shared_by = (SELECT auth.uid())
  );

-- Admins see all
CREATE POLICY lecture_links_select_admin ON public.lecture_links
  FOR SELECT USING (public.get_user_role() = 'admin');

-- Faculty can insert (share)
CREATE POLICY lecture_links_insert_faculty ON public.lecture_links
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('faculty', 'admin')
  );

-- Faculty can update (revoke) their own shares
CREATE POLICY lecture_links_update_own ON public.lecture_links
  FOR UPDATE USING (shared_by = (SELECT auth.uid()));

-- ============================================================
-- DOWNLOADS
-- ============================================================
CREATE POLICY downloads_select_own ON public.downloads
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s WHERE s.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY downloads_select_admin ON public.downloads
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY downloads_insert_own ON public.downloads
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT s.id FROM public.students s WHERE s.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY downloads_update_own ON public.downloads
  FOR UPDATE USING (
    student_id IN (
      SELECT s.id FROM public.students s WHERE s.profile_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY notifications_insert_system ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can see all notifications
CREATE POLICY notifications_select_admin ON public.notifications
  FOR SELECT USING (public.get_user_role() = 'admin');

-- ============================================================
-- FOLLOWUPS
-- ============================================================
CREATE POLICY followups_select_own ON public.followups
  FOR SELECT USING (
    executor_id IN (
      SELECT e.id FROM public.executors e WHERE e.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY followups_select_admin ON public.followups
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY followups_insert_executor ON public.followups
  FOR INSERT WITH CHECK (
    executor_id IN (
      SELECT e.id FROM public.executors e WHERE e.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY followups_update_executor ON public.followups
  FOR UPDATE USING (
    executor_id IN (
      SELECT e.id FROM public.executors e WHERE e.profile_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- PERMISSIONS
-- ============================================================
CREATE POLICY permissions_select_all ON public.permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY permissions_modify_admin ON public.permissions
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================================
-- AUDIT LOGS (append-only: admin read, system insert)
-- ============================================================
CREATE POLICY audit_logs_select_admin ON public.audit_logs
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY audit_logs_insert_system ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
