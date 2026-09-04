import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute, RoleRoute, PublicOnlyRoute } from "./guards";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// Common Pages
import NotFound from "@/pages/common/NotFound";
import Unauthorized from "@/pages/common/Unauthorized";

// Student Pages
import StudentDashboard from "@/pages/student/Dashboard";
import StudentMyCourses from "@/pages/student/MyCourses";
import StudentCourseDetail from "@/pages/student/CourseDetail";
import StudentLectures from "@/pages/student/Lectures";
import StudentLectureAccess from "@/pages/student/LectureAccess";
import StudentLiveClassroom from "@/pages/student/LiveClassroom";
import StudentDownloads from "@/pages/student/Downloads";
import StudentPayments from "@/pages/student/Payments";
import StudentNotifications from "@/pages/student/Notifications";
import StudentProfile from "@/pages/student/Profile";

// Faculty Pages
import FacultyDashboard from "@/pages/faculty/Dashboard";
import FacultyCourses from "@/pages/faculty/MyCourses";
import FacultyLectures from "@/pages/faculty/Lectures";
import FacultyLiveClassroom from "@/pages/faculty/LiveClassroom";
import FacultyStudents from "@/pages/faculty/Students";
import FacultySchedule from "@/pages/faculty/Schedule";
import FacultyLectureLinks from "@/pages/faculty/LectureLinks";
import FacultyNotifications from "@/pages/faculty/Notifications";
import FacultyProfile from "@/pages/faculty/Profile";

// Executor Pages
import ExecutorDashboard from "@/pages/executor/Dashboard";
import ExecutorStudentLeads from "@/pages/executor/StudentLeads";
import ExecutorFreeDemo from "@/pages/executor/FreeDemo";
import ExecutorStudents from "@/pages/executor/Students";
import ExecutorCourseIntro from "@/pages/executor/CourseIntroduction";
import ExecutorFollowups from "@/pages/executor/Followups";
import ExecutorOnboarding from "@/pages/executor/Onboarding";
import ExecutorLectureLinks from "@/pages/executor/LectureLinks";
import ExecutorNotifications from "@/pages/executor/Notifications";
import ExecutorProfile from "@/pages/executor/Profile";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminStudentLeads from "@/pages/admin/StudentLeads";
import AdminStudents from "@/pages/admin/Students";
import AdminStudentDetail from "@/pages/admin/StudentDetail";
import AdminFollowupReports from "@/pages/admin/FollowupReports";
import AdminExecutors from "@/pages/admin/Executors";
import AdminFaculty from "@/pages/admin/Faculty";
import AdminCourses from "@/pages/admin/Courses";
import AdminLectures from "@/pages/admin/Lectures";
import AdminPayments from "@/pages/admin/Payments";
import AdminDemoSessions from "@/pages/admin/DemoSessions";
import { RouteErrorBoundary } from "@/components/shared/RouteErrorBoundary";
import LandingPage from "@/pages/public/LandingPage";


export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <RouteErrorBoundary />,
    children: [
      // Public Routes
      { path: "/", element: <LandingPage /> },
      { path: "/landing", element: <LandingPage /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },

      // Protected Dashboard Layout Tree
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
          // Student Route Tree
          {
            element: <RoleRoute allowedRoles={["student", "admin"]} />,
            children: [
              { path: "/student", element: <StudentDashboard /> },
              { path: "/student/courses", element: <StudentMyCourses /> },
              { path: "/student/course/:courseId", element: <StudentCourseDetail /> },
              { path: "/student/lectures", element: <StudentLectures /> },
              { path: "/student/lecture/:lectureId", element: <StudentLectureAccess /> },
              { path: "/student/lectures/:lectureId/live", element: <StudentLiveClassroom /> },
              { path: "/student/downloads", element: <StudentDownloads /> },
              { path: "/student/payments", element: <StudentPayments /> },
              { path: "/student/notifications", element: <StudentNotifications /> },
              { path: "/student/profile", element: <StudentProfile /> },
            ],
          },

          // Faculty Route Tree
          {
            element: <RoleRoute allowedRoles={["faculty", "admin"]} />,
            children: [
              { path: "/faculty", element: <FacultyDashboard /> },
              { path: "/faculty/courses", element: <FacultyCourses /> },
              { path: "/faculty/lectures", element: <FacultyLectures /> },
              { path: "/faculty/lectures/:lectureId/live", element: <FacultyLiveClassroom /> },
              { path: "/faculty/students", element: <FacultyStudents /> },
              { path: "/faculty/schedule", element: <FacultySchedule /> },
              { path: "/faculty/links", element: <FacultyLectureLinks /> },
              { path: "/faculty/notifications", element: <FacultyNotifications /> },
              { path: "/faculty/profile", element: <FacultyProfile /> },
            ],
          },

          // Executor Route Tree
          {
            element: <RoleRoute allowedRoles={["executor", "admin"]} />,
            children: [
              { path: "/executor", element: <ExecutorDashboard /> },
              { path: "/executor/leads", element: <ExecutorStudentLeads /> },
              { path: "/executor/demo", element: <ExecutorFreeDemo /> },
              { path: "/executor/students", element: <ExecutorStudents /> },
              { path: "/executor/courses", element: <ExecutorCourseIntro /> },
              { path: "/executor/followups", element: <ExecutorFollowups /> },
              { path: "/executor/onboarding", element: <ExecutorOnboarding /> },
              { path: "/executor/links", element: <ExecutorLectureLinks /> },
              { path: "/executor/notifications", element: <ExecutorNotifications /> },
              { path: "/executor/profile", element: <ExecutorProfile /> },
            ],
          },

          // Admin Route Tree
          {
            element: <RoleRoute allowedRoles={["admin"]} />,
            children: [
              { path: "/admin", element: <AdminDashboard /> },
              { path: "/admin/leads", element: <AdminStudentLeads /> },
              { path: "/admin/demos", element: <AdminDemoSessions /> },
              { path: "/admin/students", element: <AdminStudents /> },
              { path: "/admin/student/:studentId", element: <AdminStudentDetail /> },
              { path: "/admin/followups", element: <AdminFollowupReports /> },
              { path: "/admin/executors", element: <AdminExecutors /> },
              { path: "/admin/faculty", element: <AdminFaculty /> },
              { path: "/admin/courses", element: <AdminCourses /> },
              { path: "/admin/lectures", element: <AdminLectures /> },
              { path: "/admin/payments", element: <AdminPayments /> },
            ],
          },

          // Common protected routes
          { path: "/unauthorized", element: <Unauthorized /> },
        ],
      },
    ],
  },
  ],
  },

  // 404
  { path: "*", element: <NotFound /> },
]);


