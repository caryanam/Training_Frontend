// ============================================================
// Database & Domain Entity Schemas
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string; email: string; role: Profile["role"] };
        Update: Partial<Profile>;
        Relationships: [];
      };
      students: {
        Row: Student;
        Insert: Partial<Student> & { profile_id: string; student_id: string };
        Update: Partial<Student>;
        Relationships: [];
      };
      executors: {
        Row: Executor;
        Insert: Partial<Executor> & { profile_id: string; executor_id: string };
        Update: Partial<Executor>;
        Relationships: [];
      };
      faculty: {
        Row: Faculty;
        Insert: Partial<Faculty> & { profile_id: string; faculty_id: string };
        Update: Partial<Faculty>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Partial<Course> & { name: string };
        Update: Partial<Course>;
        Relationships: [];
      };
      course_plans: {
        Row: CoursePlan;
        Insert: Partial<CoursePlan> & { course_id: string; name: string; duration_months: number; price: number };
        Update: Partial<CoursePlan>;
        Relationships: [];
      };
      course_enrollments: {
        Row: CourseEnrollment;
        Insert: Partial<CourseEnrollment> & { student_id: string; course_id: string; plan_id: string };
        Update: Partial<CourseEnrollment>;
        Relationships: [];
      };
      enrollment_access_adjustments: {
        Row: EnrollmentAccessAdjustment;
        Insert: { enrollment_id: string; admin_id: string; previous_expiry_date: string; new_expiry_date: string; reason: string };
        Update: Partial<EnrollmentAccessAdjustment>;
        Relationships: [];
      };
      lectures: {
        Row: Lecture;
        Insert: Partial<Lecture> & { course_id: string; faculty_id: string; title: string };
        Update: Partial<Lecture>;
        Relationships: [];
      };
      lecture_links: {
        Row: LectureLink;
        Insert: Partial<LectureLink> & { lecture_id: string; shared_by: string; shared_with: string };
        Update: Partial<LectureLink>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Partial<Payment> & { transaction_id: string; student_id: string; course_id: string; plan_id: string; amount: number };
        Update: Partial<Payment>;
        Relationships: [];
      };
      downloads: {
        Row: Download;
        Insert: Partial<Download> & { student_id: string; lecture_id: string };
        Update: Partial<Download>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & { user_id: string; title: string; message: string; type: Notification["type"] };
        Update: Partial<Notification>;
        Relationships: [];
      };
      followups: {
        Row: Followup;
        Insert: Partial<Followup> & { executor_id: string; student_id: string; followup_date: string; followup_type: Followup["followup_type"] };
        Update: Partial<Followup>;
        Relationships: [];
      };
      permissions: {
        Row: Permission;
        Insert: Partial<Permission> & { role: string; resource: string; action: string };
        Update: Partial<Permission>;
        Relationships: [];
      };
      
      student_leads: {
        Row: StudentLead;
        Insert: Partial<StudentLead> & { student_id: string; profile_id: string };
        Update: Partial<StudentLead>;
        Relationships: [];
      };
      demo_sessions: {
        Row: DemoSession;
        Insert: Partial<DemoSession> & { lead_id: string; executor_id: string; student_id: string; demo_date: string };
        Update: Partial<DemoSession>;
        Relationships: [];
      };
      lead_activity: {
        Row: LeadActivity;
        Insert: Partial<LeadActivity> & { lead_id: string; action: string };
        Update: Partial<LeadActivity>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      calculate_course_dates: {
        Args: { p_start_date: string; p_duration_months: number };
        Returns: { course_start_date: string; course_expiry_date: string }[];
      };
      verify_lecture_access: {
        Args: { p_user_id: string; p_lecture_id: string };
        Returns: {
          has_access: boolean;
          reason: string;
          lecture_url: string | null;
          recording_url: string | null;
        }[];
      };
      update_enrollment_statuses: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ============================================================
// Table Row Types
// ============================================================

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: "student" | "executor" | "faculty" | "admin";
  status: "active" | "inactive" | "suspended";
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  profile_id: string;
  student_id: string;
  assigned_executor_id: string | null;
  assigned_faculty_id: string | null;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

export interface Executor {
  id: string;
  profile_id: string;
  executor_id: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: string;
  profile_id: string;
  faculty_id: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  curriculum: unknown;
  faculty_id: string | null;
  status: "active" | "inactive" | "archived";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoursePlan {
  id: string;
  course_id: string;
  name: string;
  duration_months: number;
  price: number;
  discount: number;
  currency: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  plan_id: string;
  payment_id: string | null;
  start_date: string | null;
  expiry_date: string | null;
  status: "pending" | "active" | "expiring_soon" | "expired" | "suspended" | "cancelled";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentAccessAdjustment {
  id: string;
  enrollment_id: string;
  admin_id: string;
  previous_expiry_date: string;
  new_expiry_date: string;
  reason: string;
  created_at: string;
}

export interface Lecture {
  id: string;
  course_id: string;
  faculty_id: string;
  title: string;
  description: string | null;
  lecture_date: string | null;
  start_time: string | null;
  end_time: string | null;
  lecture_url: string | null;
  meeting_link?: string | null;
  recording_url: string | null;
  downloadable_file_path: string | null;
  is_downloadable: boolean;
  status: "scheduled" | "live" | "completed" | "cancelled" | "disabled";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LectureLink {
  id: string;
  lecture_id: string;
  shared_by: string;
  shared_with: string;
  status: "active" | "revoked";
  shared_at: string;
}

export interface Payment {
  id: string;
  transaction_id: string;
  student_id: string;
  course_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_provider: "mock" | "razorpay";
  provider_order_id: string | null;
  provider_payment_id: string | null;
  provider_signature: string | null;
  status: "pending" | "success" | "failed" | "refunded";
  payment_date: string | null;
  verified_at: string | null;
  verified_by: string | null;
  course_start_date: string | null;
  course_expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Download {
  id: string;
  student_id: string;
  lecture_id: string;
  file_name: string | null;
  file_size: number | null;
  status: "available" | "completed" | "expired";
  downloaded_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "lecture" | "payment" | "course" | "system" | "followup";
  is_read: boolean;
  metadata: unknown;
  created_at: string;
}

export interface Followup {
  id: string;
  executor_id: string;
  student_id: string;
  followup_date: string;
  followup_time: string | null;
  followup_type: "call" | "email" | "whatsapp" | "in-person";
  notes: string | null;
  status:
    | "new"
    | "contacted"
    | "interested"
    | "payment_pending"
    | "enrolled"
    | "not_interested"
    | "follow_up_required";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  role: string;
  resource: string;
  action: string;
  granted: boolean;
  created_at: string;
  updated_at: string;
}



export type LeadStatusType =
  | "new"
  | "assigned"
  | "contacted"
  | "demo_scheduled"
  | "demo_completed"
  | "interested"
  | "payment_pending"
  | "enrolled"
  | "not_interested"
  | "follow_up_required"
  | "closed";

export type DemoStatusType = "scheduled" | "completed" | "cancelled" | "no_show";

export interface StudentLead {
  id: string;
  student_id: string;
  profile_id: string;
  interested_course: string | null;
  education: string | null;
  city: string | null;
  status: LeadStatusType;
  assigned_executor_id: string | null;
  followup_date: string | null;
  last_activity: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemoSession {
  id: string;
  lead_id: string;
  executor_id: string;
  student_id: string;
  course_id: string | null;
  demo_date: string;
  demo_time: string | null;
  meeting_link: string | null;
  notes: string | null;
  feedback: string | null;
  status: DemoStatusType;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  action: string;
  performed_by: string | null;
  details: unknown;
  created_at: string;
}

// ============================================================
// Extended/Joined Types for UI
// ============================================================

export interface StudentWithProfile extends Student {
  profile: Profile;
}

export interface ExecutorWithProfile extends Executor {
  profile: Profile;
}

export interface FacultyWithProfile extends Faculty {
  profile: Profile;
}

export interface CourseWithFaculty extends Course {
  faculty: (Faculty & { profile: Profile }) | null;
}

export interface EnrollmentWithDetails extends CourseEnrollment {
  course: Course;
  plan: CoursePlan;
  student: StudentWithProfile;
}

export interface LectureWithCourse extends Lecture {
  course: Course;
}

export interface PaymentWithDetails extends Payment {
  student: StudentWithProfile;
  course: Course;
  plan: CoursePlan;
}

export interface FollowupWithStudent extends Followup {
  student: StudentWithProfile;
}

export interface StudentLeadWithProfile extends StudentLead {
  profile: Profile;
  executor?: ExecutorWithProfile | null;
}

export interface DemoSessionWithDetails extends DemoSession {
  lead: StudentLead;
  student: StudentWithProfile;
  course?: Course | null;
}

export interface FollowupReport {
  id: number;
  leadId: number;
  leadName: string;
  executorId: string;
  executorName: string;
  rating: number;
  interested: boolean;
  expectedJoiningDate: string | null;
  demoDiscussion: string | null;
  projectCapability: string | null;
  additionalComments: string | null;
  createdAt: string;
}
