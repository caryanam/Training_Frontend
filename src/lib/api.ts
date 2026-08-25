/**
 * EduFlow LMS — Spring Boot API Integration Service Layer
 * Connects frontend React components to Java Spring Boot REST Backend (http://localhost:8080)
 * with automatic fallback to reactive store in Demo/Mock Mode.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

// Token storage helper
export const getAuthToken = (): string | null => localStorage.getItem("eduflow_jwt_token");
export const setAuthToken = (token: string) => localStorage.setItem("eduflow_jwt_token", token);
export const removeAuthToken = () => localStorage.removeItem("eduflow_jwt_token");

// Generic HTTP Request Handler with Authorization Header
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; data?: T; error?: string }> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || result.error || `HTTP error! Status: ${response.status}`,
      };
    }

    return result;
  } catch (err: unknown) {
    // When Spring Boot backend server is not running on port 8080
    return {
      success: false,
      error: "Spring Boot server offline. Falling back to demo mode.",
    };
  }
}

// API Endpoint Wrappers matching D:\Training Spring Boot Controllers
export const api = {
  // --- 1. AUTHENTICATION ---
  registerStudent: (payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    interestedCourse?: string;
    education?: string;
    city?: string;
  }) =>
    apiRequest<{
      profileId: string;
      studentId: string;
      leadId: string;
      fullName: string;
      email: string;
      phone: string;
      role: string;
      leadStatus: string;
    }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone && payload.phone.trim() ? payload.phone : "",
        password: payload.password,
        interestedCourse: payload.interestedCourse && payload.interestedCourse.trim() ? payload.interestedCourse.trim() : "",
        education: payload.education && payload.education.trim() ? payload.education.trim() : "",
        city: payload.city && payload.city.trim() ? payload.city.trim() : "",
      }),
    }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<{
      token: string;
      tokenType: string;
      user: {
        profileId: string;
        fullName: string;
        email: string;
        role: string;
      };
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // --- 2. LEAD MANAGEMENT ---
  getLeads: (status?: string, search?: string, executorId?: string, executorEmail?: string) => {
    const query = new URLSearchParams();
    if (status && status !== "all") query.append("status", status);
    if (search) query.append("search", search);
    if (executorId) query.append("executorId", executorId);
    if (executorEmail) query.append("executorEmail", executorEmail);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<
      Array<{
        leadId: string;
        studentId: string;
        profileId: string;
        fullName: string;
        email: string;
        phone: string;
        interestedCourse: string;
        education: string;
        city: string;
        status: string;
        assignedExecutor: string | null;
        assignedExecutorId?: string | null;
        assignedExecutorEmail?: string | null;
        createdAt: string;
      }>
    >(`/api/v1/leads${queryString}`, { method: "GET" });
  },

  assignExecutorToLead: (leadId: string, executorId: string) =>
    apiRequest<{
      leadId: string;
      status: string;
      executorId: string;
      executorName: string;
    }>(`/api/v1/leads/${leadId}/assign`, {
      method: "PUT",
      body: JSON.stringify({ executorId }),
    }),

  updateLeadStatus: (leadId: string, status: string) =>
    apiRequest<{
      leadId: string;
      status: string;
      fullName: string;
      email: string;
    }>(`/api/v1/leads/${leadId}/status?status=${encodeURIComponent(status)}`, {
      method: "PUT",
    }),

  // --- 3. FREE DEMOS ---
  scheduleDemo: (payload: {
    leadId?: string;
    studentId?: string;
    courseId?: string;
    demoDate: string;
    startTime: string;
    endTime?: string;
    meetLink: string;
    notes?: string;
  }) =>
    apiRequest<{
      id: string;
      demoId: string;
      leadId: string;
      studentId: string;
      studentName: string;
      courseName?: string;
      demoDate: string;
      startTime: string;
      endTime?: string;
      meetLink: string;
      notes?: string;
      status: string;
    }>("/api/v1/demos", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createDemo: (payload: {
    leadId?: string;
    studentId?: string;
    courseId?: string;
    demoDate: string;
    startTime: string;
    endTime?: string;
    meetLink: string;
    notes?: string;
  }) =>
    apiRequest<{
      id: string;
      demoId: string;
      leadId: string;
      studentId: string;
      studentName: string;
      courseName?: string;
      demoDate: string;
      startTime: string;
      endTime?: string;
      meetLink: string;
      notes?: string;
      status: string;
    }>("/api/v1/demos", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getExecutorDemos: (status?: string, date?: string, studentId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (date) params.append("date", date);
    if (studentId) params.append("studentId", studentId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<
      Array<{
        id: string;
        demoId: string;
        leadId: string;
        studentId: string;
        studentName: string;
        studentEmail?: string;
        courseId?: string;
        courseName: string;
        demoDate: string;
        startTime: string;
        endTime: string;
        meetLink: string;
        notes?: string;
        status: string;
        createdAt?: string;
      }>
    >(`/api/v1/demos/executor${query}`, { method: "GET" });
  },

  getUpcomingStudentDemos: () =>
    apiRequest<
      Array<{
        id: string;
        demoId: string;
        leadId: string;
        studentId: string;
        studentName: string;
        courseName: string;
        demoDate: string;
        startTime: string;
        endTime: string;
        meetLink: string;
        notes?: string;
        status: string;
      }>
    >("/api/v1/demos/student/upcoming", { method: "GET" }),

  // --- Group Demo Sessions APIs ---
  createGroupDemo: (payload: {
    courseId?: string;
    courseName?: string;
    demoDate: string;
    startTime: string;
    endTime?: string;
    meetLink: string;
    notes?: string;
    studentIds: string[];
  }) =>
    apiRequest<any>("/api/v1/demo-sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getExecutorGroupDemos: (status?: string, date?: string, courseId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (date) params.append("date", date);
    if (courseId) params.append("courseId", courseId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<any[]>(`/api/v1/demo-sessions/executor${query}`, { method: "GET" });
  },

  getStudentUpcomingGroupDemos: () =>
    apiRequest<any[]>("/api/v1/demo-sessions/student/upcoming", { method: "GET" }),

  getStudentGroupDemoHistory: () =>
    apiRequest<any[]>("/api/v1/demo-sessions/student/history", { method: "GET" }),

  addParticipantsToGroupDemo: (sessionId: string, studentIds: string[]) =>
    apiRequest<any>(`/api/v1/demo-sessions/${sessionId}/participants`, {
      method: "POST",
      body: JSON.stringify({ studentIds }),
    }),

  removeParticipantFromGroupDemo: (sessionId: string, studentId: string) =>
    apiRequest<any>(`/api/v1/demo-sessions/${sessionId}/participants/${studentId}`, {
      method: "DELETE",
    }),

  editGroupDemo: (
    sessionId: string,
    payload: {
      courseId?: string;
      courseName?: string;
      demoDate?: string;
      startTime?: string;
      endTime?: string;
      meetLink?: string;
      notes?: string;
    }
  ) =>
    apiRequest<any>(`/api/v1/demo-sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  cancelGroupDemo: (sessionId: string) =>
    apiRequest<any>(`/api/v1/demo-sessions/${sessionId}/cancel`, {
      method: "PUT",
    }),

  getStudentDemoHistory: () =>
    apiRequest<
      Array<{
        id: string;
        demoId: string;
        leadId: string;
        studentId: string;
        studentName: string;
        courseName: string;
        demoDate: string;
        startTime: string;
        endTime: string;
        meetLink: string;
        notes?: string;
        status: string;
      }>
    >("/api/v1/demos/student/history", { method: "GET" }),

  rescheduleDemo: (
    demoId: string,
    payload: {
      demoDate: string;
      startTime: string;
      endTime?: string;
      meetLink: string;
      notes?: string;
    }
  ) =>
    apiRequest<{
      id: string;
      demoId: string;
      demoDate: string;
      startTime: string;
      endTime?: string;
      meetLink: string;
      notes?: string;
      status: string;
    }>(`/api/v1/demos/${demoId}/reschedule`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  cancelDemo: (demoId: string) =>
    apiRequest<{
      id: string;
      demoId: string;
      status: string;
    }>(`/api/v1/demos/${demoId}/cancel`, {
      method: "PUT",
    }),

  completeDemo: (demoId: string, payload: { feedback?: string; markInterested: boolean }) =>
    apiRequest<{
      demoId: string;
      demoStatus: string;
      leadStatus: string;
    }>(`/api/v1/demos/${demoId}/complete`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // --- 4. ADMIN USER CREATION & RETRIEVAL ---
  createFaculty: (payload: { fullName: string; email: string; phone: string; password?: string; department?: string }) =>
    apiRequest<{
      profileId: string;
      facultyId: string;
      fullName: string;
      email: string;
      status: string;
      department?: string;
    }>("/api/v1/admin/faculty", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAllFaculty: () =>
    apiRequest<
      Array<{
        profileId: string;
        facultyId: string;
        fullName: string;
        email: string;
        phone: string;
        role: string;
        status: string;
        department?: string;
      }>
    >("/api/v1/admin/faculty", { method: "GET" }),

  updateFacultyStatus: (facultyId: string, status: string) =>
    apiRequest<{
      profileId: string;
      facultyId: string;
      status: string;
    }>(`/api/v1/admin/faculty/${facultyId}/status?status=${encodeURIComponent(status)}`, {
      method: "PUT",
    }),

  createExecutor: (payload: { fullName: string; email: string; phone: string; password?: string }) =>
    apiRequest<{
      profileId: string;
      executorId: string;
      fullName: string;
      email: string;
      status: string;
    }>("/api/v1/admin/executors", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAllExecutors: () =>
    apiRequest<
      Array<{
        profileId: string;
        executorId: string;
        fullName: string;
        email: string;
        phone: string;
        role: string;
        status: string;
      }>
    >("/api/v1/admin/executors", { method: "GET" }),

  updateExecutorStatus: (executorId: string, status: string) =>
    apiRequest<{
      profileId: string;
      executorId: string;
      status: string;
    }>(`/api/v1/admin/executors/${executorId}/status?status=${encodeURIComponent(status)}`, {
      method: "PUT",
    }),

  updateExecutor: (executorId: string, payload: { fullName?: string; email?: string; phone?: string; password?: string }) =>
    apiRequest<{
      profileId: string;
      executorId: string;
      fullName: string;
      email: string;
      phone: string;
      role: string;
      status: string;
    }>(`/api/v1/admin/executors/${executorId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteExecutor: (executorId: string) =>
    apiRequest<void>(`/api/v1/admin/executors/${executorId}`, {
      method: "DELETE",
    }),

  getDashboardStats: () =>
    apiRequest<{
      totalStudents: number;
      newLeads: number;
      totalExecutors: number;
      totalFaculty: number;
    }>("/api/v1/admin/dashboard/stats", { method: "GET" }),

  // --- 5. COURSES & PLANS ---
  getAllCourses: () =>
    apiRequest<
      Array<{
        id: number;
        courseCode: string;
        title: string;
        description?: string;
        category?: string;
        status: string;
        lectureCount: number;
        activeStudentCount: number;
        facultyId?: string;
        facultyName?: string;
        facultyEmail?: string;
        facultyPhone?: string;
        plans: Array<{
          id: number;
          duration: string;
          durationLabel: string;
          price: number;
          currency: string;
        }>;
      }>
    >("/api/v1/admin/courses", { method: "GET" }),

  getCourseById: (id: number) =>
    apiRequest<{
      id: number;
      courseCode: string;
      title: string;
      description?: string;
      category?: string;
      status: string;
      lectureCount: number;
      activeStudentCount: number;
      facultyId?: string;
      facultyName?: string;
      facultyEmail?: string;
      facultyPhone?: string;
      plans: Array<{
        id: number;
        duration: string;
        durationLabel: string;
        price: number;
        currency: string;
      }>;
    }>(`/api/v1/admin/courses/${id}`, { method: "GET" }),

  createCourse: (payload: {
    title: string;
    category: string;
    description: string;
    status: string;
    facultyId?: string;
    plans: Array<{ duration: string; price: number }>;
  }) =>
    apiRequest<{
      id: number;
      courseCode: string;
      title: string;
      status: string;
    }>("/api/v1/admin/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCourse: (
    id: number,
    payload: {
      title?: string;
      category?: string;
      description?: string;
      status?: string;
      facultyId?: string;
      plans?: Array<{ duration: string; price: number }>;
    }
  ) =>
    apiRequest<{
      id: number;
      title: string;
      status: string;
    }>(`/api/v1/admin/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteCourse: (id: number) =>
    apiRequest<void>(`/api/v1/admin/courses/${id}`, { method: "DELETE" }),

  // --- 6. PAYMENTS ---
  verifyPayment: (payload: {
    studentProfileId: string;
    courseId: string;
    planId: string;
    amount: number;
    paymentMethod: string;
    providerOrderId?: string;
    providerPaymentId?: string;
    providerSignature?: string;
  }) =>
    apiRequest<{
      transactionId: string;
      amount: number;
      paymentStatus: string;
      enrollment: {
        enrollmentId: string;
        startDate: string;
        expiryDate: string;
        status: string;
      };
    }>("/api/v1/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // --- 7. LECTURES & 8-STEP VALIDATION ---
  createLecture: (payload: {
    courseId: string;
    facultyId: string;
    title: string;
    description?: string;
    lectureDate: string;
    startTime?: string;
    endTime?: string;
    lectureUrl?: string;
    recordingUrl?: string;
    isDownloadable?: boolean;
  }) =>
    apiRequest<{
      lectureId: string;
      title: string;
      status: string;
    }>("/api/v1/lectures", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getLectureAccess: (lectureId: string) =>
    apiRequest<{
      hasAccess: boolean;
      reason: string;
      lectureUrl?: string | null;
      recordingUrl?: string | null;
    }>(`/api/v1/lectures/${lectureId}/access`, {
      method: "GET",
    }),
};
