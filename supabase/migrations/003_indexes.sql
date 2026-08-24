-- ============================================================
-- Database Indexes
-- ============================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- students
CREATE INDEX IF NOT EXISTS idx_students_profile ON public.students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_executor ON public.students(assigned_executor_id);
CREATE INDEX IF NOT EXISTS idx_students_faculty ON public.students(assigned_faculty_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- executors
CREATE INDEX IF NOT EXISTS idx_executors_profile ON public.executors(profile_id);
CREATE INDEX IF NOT EXISTS idx_executors_status ON public.executors(status);

-- faculty
CREATE INDEX IF NOT EXISTS idx_faculty_profile ON public.faculty(profile_id);
CREATE INDEX IF NOT EXISTS idx_faculty_status ON public.faculty(status);

-- courses
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

-- course_plans
CREATE INDEX IF NOT EXISTS idx_course_plans_course ON public.course_plans(course_id);
CREATE INDEX IF NOT EXISTS idx_course_plans_status ON public.course_plans(status);

-- course_enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_expiry ON public.course_enrollments(expiry_date);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment ON public.course_enrollments(payment_id);

-- lectures
CREATE INDEX IF NOT EXISTS idx_lectures_course ON public.lectures(course_id);
CREATE INDEX IF NOT EXISTS idx_lectures_faculty ON public.lectures(faculty_id);
CREATE INDEX IF NOT EXISTS idx_lectures_date ON public.lectures(lecture_date);
CREATE INDEX IF NOT EXISTS idx_lectures_status ON public.lectures(status);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_course ON public.payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON public.payments(transaction_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- followups
CREATE INDEX IF NOT EXISTS idx_followups_executor ON public.followups(executor_id);
CREATE INDEX IF NOT EXISTS idx_followups_student ON public.followups(student_id);
CREATE INDEX IF NOT EXISTS idx_followups_date ON public.followups(followup_date);
CREATE INDEX IF NOT EXISTS idx_followups_status ON public.followups(status);

-- downloads
CREATE INDEX IF NOT EXISTS idx_downloads_student ON public.downloads(student_id);
CREATE INDEX IF NOT EXISTS idx_downloads_lecture ON public.downloads(lecture_id);

-- lecture_links
CREATE INDEX IF NOT EXISTS idx_lecture_links_lecture ON public.lecture_links(lecture_id);
CREATE INDEX IF NOT EXISTS idx_lecture_links_shared_with ON public.lecture_links(shared_with);
CREATE INDEX IF NOT EXISTS idx_lecture_links_shared_by ON public.lecture_links(shared_by);

-- enrollment_access_adjustments
CREATE INDEX IF NOT EXISTS idx_adjustments_enrollment ON public.enrollment_access_adjustments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_admin ON public.enrollment_access_adjustments(admin_id);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);

-- permissions
CREATE INDEX IF NOT EXISTS idx_permissions_role ON public.permissions(role);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON public.permissions(resource, action);
