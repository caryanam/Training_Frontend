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
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-101",
    user_id: "all",
    title: "Welcome to Nexora Enterprise Platform 🎉",
    message: "Your learning workspace is active. Explore live lectures, calendar validity countdowns, and instant course downloads.",
    type: "course",
    is_read: false,
    metadata: {},
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "notif-102",
    user_id: "all",
    title: "Live Google Meet Lecture Available 🎥",
    message: "Spring Boot REST API & React Masterclass live stream is live. Click to verify your 8-step server token and join.",
    type: "lecture",
    is_read: false,
    metadata: {},
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "notif-103",
    user_id: "all",
    title: "Payment Receipt & Enrollment Confirmed 💳",
    message: "Your 3-Month Plan enrollment has been verified. Calendar validity: Start Date + 3 Exact Calendar Months.",
    type: "payment",
    is_read: true,
    metadata: {},
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "notif-104",
    user_id: "all",
    title: "Course Study Materials & Notes 📚",
    message: "New lecture slides and source code repositories have been uploaded to your student portal dashboard.",
    type: "course",
    is_read: false,
    metadata: {},
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const MOCK_STUDENT_LEADS: StudentLead[] = [];
export const MOCK_DEMO_SESSIONS: DemoSession[] = [];
export const MOCK_LEAD_ACTIVITY: LeadActivity[] = [];
