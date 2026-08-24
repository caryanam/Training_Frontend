-- ============================================================
-- Lead Management: student_leads, demo_sessions, lead_activity
-- ============================================================

-- ============================================================
-- STUDENT LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.student_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interested_course TEXT,
  education TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN (
      'new', 'assigned', 'contacted', 'demo_scheduled', 'demo_completed',
      'interested', 'payment_pending', 'enrolled', 'not_interested',
      'follow_up_required', 'closed'
    )
  ),
  assigned_executor_id UUID REFERENCES public.executors(id) ON DELETE SET NULL,
  followup_date DATE,
  last_activity TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DEMO SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.student_leads(id) ON DELETE CASCADE,
  executor_id UUID NOT NULL REFERENCES public.executors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  demo_date DATE NOT NULL,
  demo_time TIME,
  meeting_link TEXT,
  notes TEXT,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'completed', 'cancelled', 'no_show')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- LEAD ACTIVITY LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.student_leads(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE TRIGGER set_student_leads_updated_at BEFORE UPDATE ON public.student_leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_demo_sessions_updated_at BEFORE UPDATE ON public.demo_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_student_leads_status ON public.student_leads(status);
CREATE INDEX IF NOT EXISTS idx_student_leads_executor ON public.student_leads(assigned_executor_id);
CREATE INDEX IF NOT EXISTS idx_student_leads_profile ON public.student_leads(profile_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_lead ON public.demo_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_executor ON public.demo_sessions(executor_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_date ON public.demo_sessions(demo_date);
CREATE INDEX IF NOT EXISTS idx_lead_activity_lead ON public.lead_activity(lead_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.student_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activity ENABLE ROW LEVEL SECURITY;

-- student_leads: Admin full access
CREATE POLICY student_leads_admin ON public.student_leads
  FOR ALL USING (public.get_user_role() = 'admin');

-- student_leads: Executor can see assigned leads
CREATE POLICY student_leads_executor ON public.student_leads
  FOR SELECT USING (
    assigned_executor_id IN (
      SELECT e.id FROM public.executors e WHERE e.profile_id = (SELECT auth.uid())
    )
  );

-- student_leads: Executor can update assigned leads
CREATE POLICY student_leads_executor_update ON public.student_leads
  FOR UPDATE USING (
    assigned_executor_id IN (
      SELECT e.id FROM public.executors e WHERE e.profile_id = (SELECT auth.uid())
    )
  );

-- student_leads: Student can see own lead
CREATE POLICY student_leads_student ON public.student_leads
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

-- demo_sessions: Admin full access
CREATE POLICY demo_sessions_admin ON public.demo_sessions
  FOR ALL USING (public.get_user_role() = 'admin');

-- demo_sessions: Executor can manage their demos
CREATE POLICY demo_sessions_executor ON public.demo_sessions
  FOR ALL USING (
    executor_id IN (
      SELECT e.id FROM public.executors e WHERE e.profile_id = (SELECT auth.uid())
    )
  );

-- demo_sessions: Student can see own demos
CREATE POLICY demo_sessions_student ON public.demo_sessions
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s WHERE s.profile_id = (SELECT auth.uid())
    )
  );

-- lead_activity: Admin full access
CREATE POLICY lead_activity_admin ON public.lead_activity
  FOR ALL USING (public.get_user_role() = 'admin');

-- lead_activity: Executor can see activity for assigned leads
CREATE POLICY lead_activity_executor ON public.lead_activity
  FOR SELECT USING (
    lead_id IN (
      SELECT sl.id FROM public.student_leads sl
      JOIN public.executors e ON sl.assigned_executor_id = e.id
      WHERE e.profile_id = (SELECT auth.uid())
    )
  );

-- Executor can insert activity
CREATE POLICY lead_activity_executor_insert ON public.lead_activity
  FOR INSERT WITH CHECK (performed_by = (SELECT auth.uid()));

-- Update handle_new_user to also create student_lead
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id UUID;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    'active'
  );
  
  -- Create role-specific record
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'student') = 'student' THEN
    INSERT INTO public.students (profile_id, student_id, status)
    VALUES (NEW.id, 'STU-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'), 'active')
    RETURNING id INTO v_student_id;

    -- Auto-create student lead with NEW status
    INSERT INTO public.student_leads (student_id, profile_id, interested_course, education, city, status)
    VALUES (
      v_student_id,
      NEW.id,
      NEW.raw_user_meta_data ->> 'interested_course',
      NEW.raw_user_meta_data ->> 'education',
      NEW.raw_user_meta_data ->> 'city',
      'new'
    );

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
