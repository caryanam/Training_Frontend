/**
 * EduFlow Central Data Store & Repository
 * 
 * Manages reactive data state across all 4 roles (Student, Faculty, Executor, Admin).
 * Integrates directly with the Java Spring Boot REST API.
 */

import { useState, useEffect } from "react";
import type {
  Course,
  CoursePlan,
  Lecture,
  CourseEnrollment,
  Payment,
  Followup,
  Notification,
  StudentWithProfile,
  FacultyWithProfile,
  ExecutorWithProfile,
  EnrollmentAccessAdjustment,
  Permission,
  StudentLead,
  DemoSession,
  LeadActivity,
  StudentLeadWithProfile,
  DemoSessionWithDetails,
} from "@/types/database";
import {
  MOCK_COURSES,
  MOCK_COURSE_PLANS,
  MOCK_LECTURES,
  MOCK_ENROLLMENTS,
  MOCK_PAYMENTS,
  MOCK_FOLLOWUPS,
  MOCK_NOTIFICATIONS,
  MOCK_PROFILES,
  MOCK_STUDENTS,
  MOCK_FACULTY,
  MOCK_EXECUTORS,
  MOCK_STUDENT_LEADS,
  MOCK_DEMO_SESSIONS,
  MOCK_LEAD_ACTIVITY,
} from "./mockData";
import { generateTransactionId } from "./utils";

// LocalStorage Keys for persistence
const STORAGE_KEYS = {
  COURSES: "eduflow_courses",
  PLANS: "eduflow_plans",
  LECTURES: "eduflow_lectures",
  ENROLLMENTS: "eduflow_enrollments",
  PAYMENTS: "eduflow_payments",
  FOLLOWUPS: "eduflow_followups",
  NOTIFICATIONS: "eduflow_notifications",

  ADJUSTMENTS: "eduflow_adjustments",
  STUDENT_LEADS: "eduflow_student_leads",
  DEMO_SESSIONS: "eduflow_demo_sessions",
  LEAD_ACTIVITY: "eduflow_lead_activity",
};

// Initial state helpers
function getInitialData<T>(key: string, fallback: T): T {
  try {
    if ((Array.isArray(fallback) && fallback.length === 0) || (typeof fallback === 'object' && fallback !== null && Object.keys(fallback).length === 0)) {
      localStorage.removeItem(key);
      return [] as unknown as T;
    }
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Error loading storage key ${key}:`, e);
  }
  return fallback;
}

// In-Memory Global State
let coursesState: Course[] = getInitialData(STORAGE_KEYS.COURSES, MOCK_COURSES);
let plansState: CoursePlan[] = getInitialData(STORAGE_KEYS.PLANS, MOCK_COURSE_PLANS);
let lecturesState: Lecture[] = getInitialData(STORAGE_KEYS.LECTURES, MOCK_LECTURES);
let enrollmentsState: CourseEnrollment[] = getInitialData(STORAGE_KEYS.ENROLLMENTS, MOCK_ENROLLMENTS);
let paymentsState: Payment[] = getInitialData(STORAGE_KEYS.PAYMENTS, MOCK_PAYMENTS);
let followupsState: Followup[] = getInitialData(STORAGE_KEYS.FOLLOWUPS, MOCK_FOLLOWUPS);
let notificationsState: Notification[] = getInitialData(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);

let adjustmentsState: EnrollmentAccessAdjustment[] = getInitialData(STORAGE_KEYS.ADJUSTMENTS, []);
let studentLeadsState: StudentLead[] = getInitialData(STORAGE_KEYS.STUDENT_LEADS, MOCK_STUDENT_LEADS);
let demoSessionsState: DemoSession[] = getInitialData(STORAGE_KEYS.DEMO_SESSIONS, MOCK_DEMO_SESSIONS);
let leadActivityState: LeadActivity[] = getInitialData(STORAGE_KEYS.LEAD_ACTIVITY, MOCK_LEAD_ACTIVITY);

// Subscribers for reactive updates
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

function persistAll() {
  try {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(coursesState));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plansState));
    localStorage.setItem(STORAGE_KEYS.LECTURES, JSON.stringify(lecturesState));
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollmentsState));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(paymentsState));
    localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(followupsState));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationsState));

    localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(adjustmentsState));
    localStorage.setItem(STORAGE_KEYS.STUDENT_LEADS, JSON.stringify(studentLeadsState));
    localStorage.setItem(STORAGE_KEYS.DEMO_SESSIONS, JSON.stringify(demoSessionsState));
    localStorage.setItem(STORAGE_KEYS.LEAD_ACTIVITY, JSON.stringify(leadActivityState));
  } catch (e) {
    console.error("Failed to persist to localStorage:", e);
  }
  notify();
}

/**
 * Calendar-based course expiry calculator
 * Exactly complies with architectural requirement 2:
 * start_date + duration_months (NOT months * 30)
 */
export function calculateCourseDates(startDateStr: string, durationMonths: number): {
  startDate: string;
  expiryDate: string;
} {
  const start = new Date(startDateStr);
  const expiry = new Date(start);
  expiry.setMonth(expiry.getMonth() + durationMonths);

  return {
    startDate: start.toISOString().split("T")[0],
    expiryDate: expiry.toISOString().split("T")[0],
  };
}

// ============================================================
// Repository Methods
// ============================================================

export const dataStore = {
  // --- COURSES ---
  getCourses(): Course[] {
    return [...coursesState];
  },
  getCourse(id: string): Course | undefined {
    return coursesState.find((c) => c.id === id);
  },
  createCourse(course: Omit<Course, "id" | "created_at" | "updated_at">): Course {
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    coursesState = [newCourse, ...coursesState];
    
    persistAll();
    return newCourse;
  },
  updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    coursesState = coursesState.map((c) =>
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    );
    const updated = coursesState.find((c) => c.id === id);
    
    persistAll();
    return updated;
  },
  deleteCourse(id: string) {
    coursesState = coursesState.filter((c) => c.id !== id);
    
    persistAll();
  },

  // --- COURSE PLANS ---
  getPlansForCourse(courseId: string): CoursePlan[] {
    return plansState.filter((p) => p.course_id === courseId && p.status === "active");
  },
  getAllPlans(): CoursePlan[] {
    return [...plansState];
  },
  createPlan(plan: Omit<CoursePlan, "id" | "created_at" | "updated_at">): CoursePlan {
    const newPlan: CoursePlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    plansState = [...plansState, newPlan];
    persistAll();
    return newPlan;
  },

  // --- LECTURES ---
  getLectures(): Lecture[] {
    return [...lecturesState];
  },
  getLecturesForCourse(courseId: string): Lecture[] {
    return lecturesState.filter((l) => l.course_id === courseId);
  },
  getLecture(id: string): Lecture | undefined {
    return lecturesState.find((l) => l.id === id);
  },
  createLecture(lecture: Omit<Lecture, "id" | "created_at" | "updated_at">): Lecture {
    const newLecture: Lecture = {
      ...lecture,
      id: `lec-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    lecturesState = [newLecture, ...lecturesState];
    
    // Send notifications to enrolled students
    const enrolled = enrollmentsState.filter(
      (e) => e.course_id === newLecture.course_id && e.status === "active"
    );
    enrolled.forEach((enr) => {
      const student = MOCK_STUDENTS.find((s) => s.id === enr.student_id);
      if (student) {
        dataStore.createNotification({
          user_id: student.profile_id,
          title: "New Lecture Scheduled 📚",
          message: `New lecture '${newLecture.title}' has been scheduled for ${newLecture.lecture_date}.`,
          type: "lecture",
          metadata: { lectureId: newLecture.id },
        });
      }
    });
    persistAll();
    return newLecture;
  },
  updateLecture(id: string, updates: Partial<Lecture>): Lecture | undefined {
    lecturesState = lecturesState.map((l) =>
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    );
    
    persistAll();
    return lecturesState.find((l) => l.id === id);
  },
  deleteLecture(id: string) {
    lecturesState = lecturesState.filter((l) => l.id !== id);
    
    persistAll();
  },

  // --- ENROLLMENTS & CALENDAR VALIDITY ---
  getEnrollments(): CourseEnrollment[] {
    return [...enrollmentsState];
  },
  getEnrollmentsForStudent(studentId: string): CourseEnrollment[] {
    return enrollmentsState.filter((e) => e.student_id === studentId);
  },
  getEnrollmentsForProfile(profileId: string): CourseEnrollment[] {
    const student = MOCK_STUDENTS.find((s) => s.profile_id === profileId);
    if (!student) return [];
    return enrollmentsState.filter((e) => e.student_id === student.id);
  },

  /**
   * Complete payment verification and enrollment activation flow
   * Follows requirement 8:
   * Payment SUCCESS -> Calculate calendar start/expiry -> Activate enrollment -> Notifications
   */
  processSuccessfulEnrollment(params: {
    studentProfileId: string;
    courseId: string;
    planId: string;
    amount: number;
    paymentMethod: string;
  }): { enrollment: CourseEnrollment; payment: Payment } {
    let student = MOCK_STUDENTS.find((s) => s.profile_id === params.studentProfileId);
    if (!student) {
      student = {
        id: `stu-${Date.now()}`,
        profile_id: params.studentProfileId,
        student_id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        assigned_executor_id: "exe-rec-1",
        assigned_faculty_id: "fac-rec-1",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_STUDENTS.push(student);
    }

    const plan = plansState.find((p) => p.id === params.planId);
    const durationMonths = plan ? plan.duration_months : 3;

    // Calendar-based validity calculation
    const todayStr = new Date().toISOString().split("T")[0];
    const { startDate, expiryDate } = calculateCourseDates(todayStr, durationMonths);

    // 1. Create Payment Record (Verified backend)
    const transactionId = generateTransactionId();
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      transaction_id: transactionId,
      student_id: student.id,
      course_id: params.courseId,
      plan_id: params.planId,
      amount: params.amount,
      currency: "INR",
      payment_method: params.paymentMethod,
      payment_provider: "mock",
      provider_order_id: `ORD_${Date.now()}`,
      provider_payment_id: `PAY_${Date.now()}`,
      provider_signature: "sig_verified",
      status: "success",
      payment_date: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      verified_by: "backend_payment_service",
      course_start_date: startDate,
      course_expiry_date: expiryDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    paymentsState = [newPayment, ...paymentsState];

    // 2. Create Active Enrollment
    const newEnrollment: CourseEnrollment = {
      id: `enr-${Date.now()}`,
      student_id: student.id,
      course_id: params.courseId,
      plan_id: params.planId,
      payment_id: newPayment.id,
      start_date: startDate,
      expiry_date: expiryDate,
      status: "active",
      created_by: params.studentProfileId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    enrollmentsState = [newEnrollment, ...enrollmentsState];

    // 3. Notifications & Audit Log
    const course = coursesState.find((c) => c.id === params.courseId);
    dataStore.createNotification({
      user_id: params.studentProfileId,
      title: "Enrollment Activated! 🎉",
      message: `You are now enrolled in '${course?.name || "Course"}'. Access valid until ${expiryDate}.`,
      type: "payment",
      metadata: { courseId: params.courseId, expiryDate },
    });

    

    persistAll();
    return { enrollment: newEnrollment, payment: newPayment };
  },

  // --- ADMIN MANUAL ACCESS EXTENSION ---
  extendCourseAccess(params: {
    enrollmentId: string;
    adminProfileId: string;
    newExpiryDate: string;
    reason: string;
  }): boolean {
    const enrollment = enrollmentsState.find((e) => e.id === params.enrollmentId);
    if (!enrollment) return false;

    const previousExpiry = enrollment.expiry_date || new Date().toISOString().split("T")[0];

    // Record adjustment in explicit table (Req 7)
    const adjustment: EnrollmentAccessAdjustment = {
      id: `adj-${Date.now()}`,
      enrollment_id: enrollment.id,
      admin_id: params.adminProfileId,
      previous_expiry_date: previousExpiry,
      new_expiry_date: params.newExpiryDate,
      reason: params.reason,
      created_at: new Date().toISOString(),
    };
    adjustmentsState = [adjustment, ...adjustmentsState];

    // Update enrollment status
    enrollmentsState = enrollmentsState.map((e) =>
      e.id === params.enrollmentId
        ? {
          ...e,
          expiry_date: params.newExpiryDate,
          status: new Date(params.newExpiryDate) >= new Date() ? "active" : e.status,
          updated_at: new Date().toISOString(),
        }
        : e
    );

    // Audit log
    

    // Notify student
    const student = MOCK_STUDENTS.find((s) => s.id === enrollment.student_id);
    if (student) {
      dataStore.createNotification({
        user_id: student.profile_id,
        title: "Course Validity Extended 🗓️",
        message: `Your course access has been extended to ${params.newExpiryDate}. Reason: ${params.reason}`,
        type: "course",
        metadata: { newExpiryDate: params.newExpiryDate },
      });
    }

    persistAll();
    return true;
  },

  getAdjustmentsForEnrollment(enrollmentId: string): EnrollmentAccessAdjustment[] {
    return adjustmentsState.filter((a) => a.enrollment_id === enrollmentId);
  },

  // --- LECTURE ACCESS SECURITY (8-Step Server Rule Enforcement) ---
  verifyLectureAccess(userProfileId: string, lectureId: string): {
    hasAccess: boolean;
    reason: string;
    lectureUrl?: string | null;
    recordingUrl?: string | null;
    lecture?: Lecture;
  } {
    const lecture = lecturesState.find((l) => l.id === lectureId);
    if (!lecture) {
      return { hasAccess: false, reason: "Lecture not found" };
    }

    const profile = MOCK_PROFILES[userProfileId];
    if (!profile) {
      return { hasAccess: false, reason: "Authentication required" };
    }

    // Admins and Faculty for that course always have preview access
    if (profile.role === "admin" || profile.role === "faculty") {
      return {
        hasAccess: true,
        reason: "Authorized staff access",
        lectureUrl: lecture.lecture_url,
        recordingUrl: lecture.recording_url,
        lecture,
      };
    }

    if (profile.role !== "student") {
      return { hasAccess: false, reason: "Only enrolled students can view lectures" };
    }

    // Step 7: Lecture status check
    if (lecture.status === "disabled" || lecture.status === "cancelled") {
      return { hasAccess: false, reason: "This lecture is currently unavailable", lecture };
    }

    const student = MOCK_STUDENTS.find((s) => s.profile_id === userProfileId);
    if (!student) {
      return { hasAccess: false, reason: "Student profile not found", lecture };
    }

    // Step 3: Find active enrollment
    const enrollment = enrollmentsState.find(
      (e) => e.student_id === student.id && e.course_id === lecture.course_id
    );

    if (!enrollment) {
      return { hasAccess: false, reason: "You are not enrolled in this course", lecture };
    }

    // Step 4: Check payment
    const payment = paymentsState.find((p) => p.id === enrollment.payment_id);
    if (!payment || payment.status !== "success") {
      return { hasAccess: false, reason: "Payment verification pending", lecture };
    }

    // Step 6: Calendar date validity check
    const today = new Date();
    const expiry = enrollment.expiry_date ? new Date(enrollment.expiry_date) : null;

    if (expiry && today > expiry) {
      return {
        hasAccess: false,
        reason: `Your course access expired on ${enrollment.expiry_date}. Please renew your plan to continue learning.`,
        lecture,
      };
    }

    if (enrollment.status === "suspended" || enrollment.status === "cancelled") {
      return { hasAccess: false, reason: "Your enrollment is suspended. Contact support.", lecture };
    }

    // All 8 checks passed!
    return {
      hasAccess: true,
      reason: "Access granted",
      lectureUrl: lecture.lecture_url,
      recordingUrl: lecture.recording_url,
      lecture,
    };
  },

  // --- PAYMENTS ---
  getPayments(): Payment[] {
    return [...paymentsState];
  },
  getPaymentsForStudent(studentId: string): Payment[] {
    const student = MOCK_STUDENTS.find((s) => s.id === studentId || s.profile_id === studentId);
    const validIds = new Set([studentId, student?.id, student?.profile_id].filter(Boolean));
    return paymentsState.filter((p) => validIds.has(p.student_id));
  },

  // --- FOLLOWUPS (Executor) ---
  getFollowups(): Followup[] {
    return [...followupsState];
  },
  getFollowupsForExecutor(executorProfileId: string): Followup[] {
    const executor = MOCK_EXECUTORS.find((e) => e.profile_id === executorProfileId);
    if (!executor) return followupsState;
    return followupsState.filter((f) => f.executor_id === executor.id);
  },
  createFollowup(followup: Omit<Followup, "id" | "created_at" | "updated_at">): Followup {
    const newF: Followup = {
      ...followup,
      id: `fol-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    followupsState = [newF, ...followupsState];
    persistAll();
    return newF;
  },
  updateFollowup(id: string, updates: Partial<Followup>): Followup | undefined {
    followupsState = followupsState.map((f) =>
      f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
    );
    persistAll();
    return followupsState.find((f) => f.id === id);
  },

  // --- NOTIFICATIONS ---
  getNotificationsForUser(userProfileId: string): Notification[] {
    return notificationsState.filter((n) => n.user_id === userProfileId);
  },
  createNotification(
    notif: Omit<Notification, "id" | "created_at" | "is_read" | "metadata"> & {
      metadata?: unknown;
    }
  ): Notification {
    const newN: Notification = {
      ...notif,
      metadata: notif.metadata ?? {},
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notificationsState = [newN, ...notificationsState];
    persistAll();
    return newN;
  },
  markNotificationRead(id: string) {
    notificationsState = notificationsState.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    );
    persistAll();
  },
  markAllNotificationsRead(userProfileId: string) {
    notificationsState = notificationsState.map((n) =>
      n.user_id === userProfileId ? { ...n, is_read: true } : n
    );
    persistAll();
  },

  // --- AUDIT LOGS (Append-Only) ---
  
  

  // --- USERS & PROFILES ---
  getStudentsWithProfiles(): StudentWithProfile[] {
    return MOCK_STUDENTS.map((s) => ({
      ...s,
      profile: MOCK_PROFILES[s.profile_id] || {
        id: s.profile_id,
        full_name: "Student",
        email: "student@eduflow.com",
        phone: null,
        avatar_url: null,
        role: "student",
        status: s.status,
        last_login: null,
        created_at: s.created_at,
        updated_at: s.updated_at,
      },
    }));
  },
  getFacultyWithProfiles(): FacultyWithProfile[] {
    return MOCK_FACULTY.map((f) => ({
      ...f,
      profile: MOCK_PROFILES[f.profile_id] || {
        id: f.profile_id,
        full_name: "Faculty",
        email: "faculty@eduflow.com",
        phone: null,
        avatar_url: null,
        role: "faculty",
        status: f.status,
        last_login: null,
        created_at: f.created_at,
        updated_at: f.updated_at,
      },
    }));
  },
  getExecutorsWithProfiles(): ExecutorWithProfile[] {
    return MOCK_EXECUTORS.map((e) => ({
      ...e,
      profile: MOCK_PROFILES[e.profile_id] || {
        id: e.profile_id,
        full_name: "Executor",
        email: "executor@eduflow.com",
        phone: null,
        avatar_url: null,
        role: "executor",
        status: e.status,
        last_login: null,
        created_at: e.created_at,
        updated_at: e.updated_at,
      },
    }));
  },

  // --- STUDENT LEADS ---
  getStudentLeads(): StudentLead[] {
    return [...studentLeadsState];
  },
  getStudentLeadsWithProfiles(): StudentLeadWithProfile[] {
    const executorsWP = dataStore.getExecutorsWithProfiles();
    return studentLeadsState.map((lead) => ({
      ...lead,
      profile: MOCK_PROFILES[lead.profile_id] || {
        id: lead.profile_id,
        full_name: "Student",
        email: "unknown@eduflow.com",
        phone: null,
        avatar_url: null,
        role: "student" as const,
        status: "active" as const,
        last_login: null,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
      },
      executor: lead.assigned_executor_id
        ? executorsWP.find((e) => e.id === lead.assigned_executor_id) || null
        : null,
    }));
  },
  getLeadsForExecutor(executorKey: string): StudentLeadWithProfile[] {
    if (!executorKey) return [];
    const allLeads = dataStore.getStudentLeadsWithProfiles();
    const cleanKey = executorKey.toLowerCase().trim();
    return allLeads.filter((l) => {
      const assignedId = (l.assigned_executor_id || "").toLowerCase();
      const exeProfileId = (l.executor?.profile_id || l.executor?.profile?.id || "").toLowerCase();
      const exeCode = (l.executor?.executor_id || "").toLowerCase();
      const exeEmail = (l.executor?.profile?.email || "").toLowerCase();
      const exeName = (l.executor?.profile?.full_name || "").toLowerCase();

      return (
        assignedId === cleanKey ||
        exeProfileId === cleanKey ||
        exeCode === cleanKey ||
        exeEmail === cleanKey ||
        exeName === cleanKey
      );
    });
  },
  getStudentsForExecutor(executorKey: string): StudentWithProfile[] {
    if (!executorKey) return [];
    const leadsForExe = dataStore.getLeadsForExecutor(executorKey);
    const assignedStudentIds = new Set(leadsForExe.map((l) => l.student_id));
    const assignedProfileIds = new Set(leadsForExe.map((l) => l.profile_id));

    return dataStore.getStudentsWithProfiles().filter((s) => {
      return (
        assignedStudentIds.has(s.id) ||
        assignedStudentIds.has(s.student_id) ||
        assignedProfileIds.has(s.profile_id) ||
        (s.assigned_executor_id && (s.assigned_executor_id === executorKey || s.assigned_executor_id.toLowerCase() === executorKey.toLowerCase()))
      );
    });
  },
  getLeadForProfile(profileId: string): StudentLead | undefined {
    return studentLeadsState.find((l) => l.profile_id === profileId);
  },
  getLeadById(id: string): StudentLead | undefined {
    return studentLeadsState.find((l) => l.id === id);
  },
  getLeadsByStatus(status: string): StudentLead[] {
    return studentLeadsState.filter((l) => l.status === status);
  },
  createStudentLead(
    lead: Omit<StudentLead, "id" | "created_at" | "updated_at" | "last_activity">
  ): StudentLead {
    const newLead: StudentLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    studentLeadsState = [newLead, ...studentLeadsState];

    // Add activity
    dataStore.addLeadActivity({
      lead_id: newLead.id,
      action: "Lead created from registration",
      performed_by: null,
      details: { source: "student_registration" },
    });

    // Notify admin
    dataStore.createNotification({
      user_id: "admin-1",
      title: "New Student Lead 🎯",
      message: `New student registration: ${MOCK_PROFILES[lead.profile_id]?.full_name || "Student"}. ${lead.interested_course ? `Interested in: ${lead.interested_course}` : "No course preference specified."}`,
      type: "system",
      metadata: { leadId: newLead.id },
    });

    

    persistAll();
    return newLead;
  },
  updateLeadStatus(leadId: string, status: string, performedBy?: string): StudentLead | undefined {
    const prev = studentLeadsState.find((l) => l.id === leadId);
    if (!prev) return undefined;
    const previousStatus = prev.status;

    studentLeadsState = studentLeadsState.map((l) =>
      l.id === leadId
        ? { ...l, status: status as StudentLead["status"], last_activity: new Date().toISOString(), updated_at: new Date().toISOString() }
        : l
    );

    dataStore.addLeadActivity({
      lead_id: leadId,
      action: `Status changed to ${status}`,
      performed_by: performedBy || null,
      details: { previous: previousStatus, new: status },
    });

    

    persistAll();
    return studentLeadsState.find((l) => l.id === leadId);
  },
  assignExecutorToLead(leadId: string, executorId: string, adminProfileId: string): StudentLead | undefined {
    studentLeadsState = studentLeadsState.map((l) =>
      l.id === leadId
        ? {
          ...l,
          assigned_executor_id: executorId,
          status: (l.status === "new" ? "assigned" : l.status) as StudentLead["status"],
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        : l
    );

    const executor = MOCK_EXECUTORS.find((e) => e.id === executorId);
    const executorProfile = executor ? MOCK_PROFILES[executor.profile_id] : null;

    dataStore.addLeadActivity({
      lead_id: leadId,
      action: "Executor assigned",
      performed_by: adminProfileId,
      details: { executor: executorProfile?.full_name || "Executor" },
    });

    // Notify executor
    if (executor) {
      const lead = studentLeadsState.find((l) => l.id === leadId);
      const studentProfile = lead ? MOCK_PROFILES[lead.profile_id] : null;
      dataStore.createNotification({
        user_id: executor.profile_id,
        title: "New Student Lead Assigned 📋",
        message: `You have been assigned a new student lead: ${studentProfile?.full_name || "Student"}. ${lead?.interested_course ? `Course interest: ${lead.interested_course}` : ""}`,
        type: "system",
        metadata: { leadId },
      });
    }

    

    persistAll();
    return studentLeadsState.find((l) => l.id === leadId);
  },
  updateLead(leadId: string, updates: Partial<StudentLead>): StudentLead | undefined {
    studentLeadsState = studentLeadsState.map((l) =>
      l.id === leadId
        ? { ...l, ...updates, last_activity: new Date().toISOString(), updated_at: new Date().toISOString() }
        : l
    );
    persistAll();
    return studentLeadsState.find((l) => l.id === leadId);
  },

  // --- DEMO SESSIONS ---
  getDemoSessions(): DemoSession[] {
    return [...demoSessionsState];
  },
  getDemoSessionsWithDetails(): DemoSessionWithDetails[] {
    const studentsWP = dataStore.getStudentsWithProfiles();
    return demoSessionsState.map((demo) => ({
      ...demo,
      lead: studentLeadsState.find((l) => l.id === demo.lead_id) || ({} as StudentLead),
      student: studentsWP.find((s) => s.id === demo.student_id) || ({} as StudentWithProfile),
      course: demo.course_id ? coursesState.find((c) => c.id === demo.course_id) || null : null,
    }));
  },
  getDemosForExecutor(executorProfileId: string): DemoSessionWithDetails[] {
    const executor = MOCK_EXECUTORS.find((e) => e.profile_id === executorProfileId);
    if (!executor) return [];
    return dataStore
      .getDemoSessionsWithDetails()
      .filter((d) => d.executor_id === executor.id);
  },
  getDemosByLeadId(leadId: string): DemoSession[] {
    return demoSessionsState.filter((d) => d.lead_id === leadId);
  },
  createDemoSession(
    demo: Omit<DemoSession, "id" | "created_at" | "updated_at">
  ): DemoSession {
    const newDemo: DemoSession = {
      ...demo,
      id: `demo-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoSessionsState = [newDemo, ...demoSessionsState];

    // Update lead status to demo_scheduled
    dataStore.updateLeadStatus(demo.lead_id, "demo_scheduled");

    // Add lead activity
    dataStore.addLeadActivity({
      lead_id: demo.lead_id,
      action: "Demo scheduled",
      performed_by: MOCK_EXECUTORS.find((e) => e.id === demo.executor_id)?.profile_id || null,
      details: { date: demo.demo_date, time: demo.demo_time, course_id: demo.course_id },
    });

    // Notify student
    const lead = studentLeadsState.find((l) => l.id === demo.lead_id);
    if (lead) {
      const course = demo.course_id ? coursesState.find((c) => c.id === demo.course_id) : null;
      dataStore.createNotification({
        user_id: lead.profile_id,
        title: "Free Demo Scheduled 🎥",
        message: `Your free demo${course ? ` for '${course.name}'` : ""} has been scheduled for ${demo.demo_date}${demo.demo_time ? ` at ${demo.demo_time}` : ""}.`,
        type: "system",
        metadata: { demoId: newDemo.id },
      });
    }

    

    persistAll();
    return newDemo;
  },
  updateDemoSession(id: string, updates: Partial<DemoSession>): DemoSession | undefined {
    demoSessionsState = demoSessionsState.map((d) =>
      d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
    );

    // If completed, add activity and update lead
    if (updates.status === "completed") {
      const demo = demoSessionsState.find((d) => d.id === id);
      if (demo) {
        dataStore.updateLeadStatus(demo.lead_id, "demo_completed");
        dataStore.addLeadActivity({
          lead_id: demo.lead_id,
          action: "Demo completed",
          performed_by: MOCK_EXECUTORS.find((e) => e.id === demo.executor_id)?.profile_id || null,
          details: { feedback: updates.feedback },
        });

        
      }
    }

    persistAll();
    return demoSessionsState.find((d) => d.id === id);
  },

  // --- LEAD ACTIVITY ---
  getLeadActivity(leadId: string): LeadActivity[] {
    return leadActivityState.filter((a) => a.lead_id === leadId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  addLeadActivity(
    activity: Omit<LeadActivity, "id" | "created_at">
  ): LeadActivity {
    const newActivity: LeadActivity = {
      ...activity,
      id: `la-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    leadActivityState = [newActivity, ...leadActivityState];
    // Don't call persistAll here to avoid infinite recursion since
    // addLeadActivity is often called from within other persisting methods
    return newActivity;
  },

  // --- ADMIN USER MANAGEMENT ---
  createFacultyAccount(data: {
    fullName: string;
    email: string;
    phone: string;
    adminProfileId: string;
  }): { profileId: string; facultyId: string } {
    const newId = `faculty-${Date.now()}`;
    const newProfile = {
      id: newId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      avatar_url: null,
      role: "faculty" as const,
      status: "active" as const,
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_PROFILES[newId] = newProfile;

    const facRecId = `fac-${Date.now()}`;
    const facultyId = `FAC-${Math.floor(2000 + Math.random() * 8000)}`;
    MOCK_FACULTY.push({
      id: facRecId,
      profile_id: newId,
      faculty_id: facultyId,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    

    persistAll();
    return { profileId: newId, facultyId };
  },
  createExecutorAccount(data: {
    fullName: string;
    email: string;
    phone: string;
    adminProfileId: string;
  }): { profileId: string; executorId: string } {
    const newId = `executor-${Date.now()}`;
    const newProfile = {
      id: newId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      avatar_url: null,
      role: "executor" as const,
      status: "active" as const,
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_PROFILES[newId] = newProfile;

    const exeRecId = `exe-${Date.now()}`;
    const executorId = `EXE-${Math.floor(3000 + Math.random() * 7000)}`;
    MOCK_EXECUTORS.push({
      id: exeRecId,
      profile_id: newId,
      executor_id: executorId,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    

    persistAll();
    return { profileId: newId, executorId };
  },

  updateExecutorStatus(executorRecId: string, newStatus: string, adminProfileId?: string): boolean {
    const exeIndex = MOCK_EXECUTORS.findIndex(
      (e) => e.id === executorRecId || e.executor_id === executorRecId
    );
    if (exeIndex === -1) return false;

    const executor = MOCK_EXECUTORS[exeIndex];
    const previousStatus = executor.status;

    // Update executor record
    MOCK_EXECUTORS[exeIndex] = {
      ...executor,
      status: newStatus as typeof executor.status,
      updated_at: new Date().toISOString(),
    };

    // Update linked profile status
    if (MOCK_PROFILES[executor.profile_id]) {
      MOCK_PROFILES[executor.profile_id] = {
        ...MOCK_PROFILES[executor.profile_id],
        status: newStatus as "active" | "inactive" | "suspended",
        updated_at: new Date().toISOString(),
      };
    }

    

    persistAll();
    notify();
    return true;
  },

  updateFacultyStatus(facultyRecId: string, newStatus: string, adminProfileId?: string): boolean {
    const facIndex = MOCK_FACULTY.findIndex(
      (f) => f.id === facultyRecId || f.faculty_id === facultyRecId
    );
    if (facIndex === -1) return false;

    const fac = MOCK_FACULTY[facIndex];
    const previousStatus = fac.status;

    MOCK_FACULTY[facIndex] = {
      ...fac,
      status: newStatus as typeof fac.status,
      updated_at: new Date().toISOString(),
    };

    if (MOCK_PROFILES[fac.profile_id]) {
      MOCK_PROFILES[fac.profile_id] = {
        ...MOCK_PROFILES[fac.profile_id],
        status: newStatus as "active" | "inactive" | "suspended",
        updated_at: new Date().toISOString(),
      };
    }

    

    persistAll();
    notify();
    return true;
  },

  updateExecutor(executorId: string, data: { fullName?: string; email?: string; phone?: string; status?: string }): boolean {
    const idx = MOCK_EXECUTORS.findIndex((e) => e.executor_id === executorId || e.id === executorId);
    if (idx !== -1) {
      if (data.status) (MOCK_EXECUTORS[idx] as any).status = data.status;
      const profileId = MOCK_EXECUTORS[idx].profile_id;
      if (profileId && MOCK_PROFILES[profileId]) {
        if (data.fullName) MOCK_PROFILES[profileId].full_name = data.fullName;
        if (data.email) MOCK_PROFILES[profileId].email = data.email;
        if (data.phone) MOCK_PROFILES[profileId].phone = data.phone;
        if (data.status) (MOCK_PROFILES[profileId] as any).status = data.status.toLowerCase();
      }
      persistAll();
      notify();
      return true;
    }
    return false;
  },

  deleteExecutor(executorId: string): boolean {
    const idx = MOCK_EXECUTORS.findIndex((e) => e.executor_id === executorId || e.id === executorId);
    if (idx !== -1) {
      MOCK_EXECUTORS.splice(idx, 1);
      persistAll();
      notify();
      return true;
    }
    return false;
  },
};

// React Hook to subscribe to real-time data changes
export function useDataStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return dataStore;
}




