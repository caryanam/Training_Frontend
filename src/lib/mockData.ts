import type {
  Profile,
  Student,
  Faculty,
  Executor,
  Course,
  CoursePlan,
  Lecture,
  CourseEnrollment,
  Payment,
  Followup,
  Notification,
  
  StudentLead,
  DemoSession,
  LeadActivity,
} from "@/types/database";

export const MOCK_PROFILES: Record<string, Profile> = {};
export const MOCK_STUDENTS: Student[] = [];
export const MOCK_FACULTY: Faculty[] = [];
export const MOCK_EXECUTORS: Executor[] = [];
export const MOCK_COURSES: Course[] = [];
export const MOCK_COURSE_PLANS: CoursePlan[] = [];
export const MOCK_LECTURES: Lecture[] = [];
export const MOCK_ENROLLMENTS: CourseEnrollment[] = [];
export const MOCK_PAYMENTS: Payment[] = [];
export const MOCK_FOLLOWUPS: Followup[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];

export const MOCK_STUDENT_LEADS: StudentLead[] = [];
export const MOCK_DEMO_SESSIONS: DemoSession[] = [];
export const MOCK_LEAD_ACTIVITY: LeadActivity[] = [];
