-- ============================================================
-- Seed Data: Default Permissions
-- ============================================================

-- Student permissions
INSERT INTO public.permissions (role, resource, action, granted) VALUES
  ('student', 'courses', 'view', true),
  ('student', 'lectures', 'view', true),
  ('student', 'payments', 'view', true),
  ('student', 'downloads', 'view', true),
  ('student', 'downloads', 'create', true),
  ('student', 'notifications', 'view', true),
  ('student', 'profile', 'view', true),
  ('student', 'profile', 'edit', true);

-- Executor permissions
INSERT INTO public.permissions (role, resource, action, granted) VALUES
  ('executor', 'students', 'view', true),
  ('executor', 'courses', 'view', true),
  ('executor', 'followups', 'view', true),
  ('executor', 'followups', 'create', true),
  ('executor', 'followups', 'edit', true),
  ('executor', 'lecture_links', 'view', true),
  ('executor', 'notifications', 'view', true),
  ('executor', 'profile', 'view', true),
  ('executor', 'profile', 'edit', true);

-- Faculty permissions
INSERT INTO public.permissions (role, resource, action, granted) VALUES
  ('faculty', 'courses', 'view', true),
  ('faculty', 'lectures', 'view', true),
  ('faculty', 'lectures', 'create', true),
  ('faculty', 'lectures', 'edit', true),
  ('faculty', 'lectures', 'delete', true),
  ('faculty', 'students', 'view', true),
  ('faculty', 'lecture_links', 'view', true),
  ('faculty', 'lecture_links', 'create', true),
  ('faculty', 'notifications', 'view', true),
  ('faculty', 'profile', 'view', true),
  ('faculty', 'profile', 'edit', true);

-- Admin permissions (full access)
INSERT INTO public.permissions (role, resource, action, granted) VALUES
  ('admin', 'students', 'view', true),
  ('admin', 'students', 'create', true),
  ('admin', 'students', 'edit', true),
  ('admin', 'students', 'delete', true),
  ('admin', 'executors', 'view', true),
  ('admin', 'executors', 'create', true),
  ('admin', 'executors', 'edit', true),
  ('admin', 'executors', 'delete', true),
  ('admin', 'faculty', 'view', true),
  ('admin', 'faculty', 'create', true),
  ('admin', 'faculty', 'edit', true),
  ('admin', 'faculty', 'delete', true),
  ('admin', 'courses', 'view', true),
  ('admin', 'courses', 'create', true),
  ('admin', 'courses', 'edit', true),
  ('admin', 'courses', 'delete', true),
  ('admin', 'lectures', 'view', true),
  ('admin', 'lectures', 'create', true),
  ('admin', 'lectures', 'edit', true),
  ('admin', 'lectures', 'delete', true),
  ('admin', 'payments', 'view', true),
  ('admin', 'payments', 'manage', true),
  ('admin', 'enrollments', 'view', true),
  ('admin', 'enrollments', 'manage', true),
  ('admin', 'reports', 'view', true),
  ('admin', 'audit_logs', 'view', true),
  ('admin', 'settings', 'view', true),
  ('admin', 'settings', 'edit', true),
  ('admin', 'notifications', 'view', true),
  ('admin', 'notifications', 'create', true),
  ('admin', 'users', 'manage', true),
  ('admin', 'profile', 'view', true),
  ('admin', 'profile', 'edit', true);
