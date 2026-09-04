import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatCurrency, getDaysRemaining, formatDate, formatExternalUrl } from "@/lib/utils";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { FollowupReportsList } from "@/components/shared/FollowupReportsList";
import {
  BookOpen,
  Calendar,
  Clock,
  Video,
  Download,
  AlertCircle,
  Sparkles,
  ArrowRight,
  PlayCircle,
  CreditCard,
  Users,
  Mail,
  UserCheck,
} from "lucide-react";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [upcomingDemos, setUpcomingDemos] = useState<any[]>([]);
  const [demoHistory, setDemoHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [secureEnrolledCourses, setSecureEnrolledCourses] = useState<any[]>([]);
  const [secureUpcomingMeetings, setSecureUpcomingMeetings] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    api.getStudentUpcomingGroupDemos().then((res) => {
      if (res && res.success && res.data) {
        setUpcomingDemos(res.data);
      }
    }).catch(() => { });

    api.getStudentGroupDemoHistory().then((res) => {
      if (res && res.success && res.data) {
        setDemoHistory(res.data);
      }
    }).catch(() => { });

    // Fetch secure enrolled courses (Requirement 1 & 8)
    api.getStudentEnrolledCourses().then((res) => {
      if (res && res.success && res.data) {
        setSecureEnrolledCourses(res.data);
      }
    }).catch(() => { });

    // Fetch secure upcoming meetings (Requirement 1 & 8)
    api.getStudentUpcomingMeetings().then((res) => {
      if (res && res.success && res.data) {
        setSecureUpcomingMeetings(res.data);
      }
    }).catch(() => { });
  }, [profile]);

  const enrollments = profile ? store.getEnrollmentsForProfile(profile.id) : [];
  const activeEnrollment = enrollments.find(
    (e) => e.status === "active" || e.status === "expiring_soon"
  );
  
  // Use backend enrolled course as source of truth if available, otherwise store active enrollment
  const activeCourse = secureEnrolledCourses.length > 0
    ? {
        id: String(secureEnrolledCourses[0].courseId || secureEnrolledCourses[0].courseCode),
        name: secureEnrolledCourses[0].courseName,
        category: secureEnrolledCourses[0].category,
        description: secureEnrolledCourses[0].description,
        faculty_name: secureEnrolledCourses[0].facultyName,
        faculty_email: secureEnrolledCourses[0].facultyEmail,
      }
    : (activeEnrollment ? store.getCourse(activeEnrollment.course_id) : null);

  const isActuallyEnrolled = secureEnrolledCourses.length > 0 || !!activeEnrollment;

  const lectures = isActuallyEnrolled && activeCourse ? store.getLecturesForCourse(activeCourse.id) : [];
  const upcomingLecture = lectures.find((l) => l.status === "scheduled" || l.status === "live");
  const completedLectures = lectures.filter((l) => l.status === "completed").length;

  const lead = profile ? store.getLeadForProfile(profile.id) : undefined;
  const storeDemos = lead ? store.getDemosByLeadId(lead.id) : [];
  const latestDemo = storeDemos[0];

  // Resolve assigned faculty mentor dynamically
  const facultyList = store.getFacultyWithProfiles();
  const studentRecord = profile ? store.getStudentsWithProfiles().find((s) => s.profile_id === profile.id || s.id === profile.id) : null;
  const assignedFacultyObj = studentRecord?.assigned_faculty_id
    ? facultyList.find((f) => f.id === studentRecord.assigned_faculty_id || f.faculty_id === studentRecord.assigned_faculty_id)
    : (activeCourse && (activeCourse as any).faculty_id ? facultyList.find((f) => f.id === (activeCourse as any).faculty_id) : null);

  const assignedFaculty = (activeCourse && (activeCourse as any).faculty_name)
    ? {
        name: (activeCourse as any).faculty_name,
        code: "FACULTY",
        email: (activeCourse as any).faculty_email || "faculty@nexorastudent.in",
        department: "Curriculum Track Lead",
        isAssigned: true,
      }
    : assignedFacultyObj
      ? {
        name: assignedFacultyObj.profile.full_name,
        code: assignedFacultyObj.faculty_id || "FAC-2001",
        email: assignedFacultyObj.profile.email,
        department: (assignedFacultyObj as any).department || "Software Engineering & Full Stack",
        isAssigned: true,
      }
      : isActuallyEnrolled
        ? {
          name: "Dr. Rajesh Sharma",
          code: "FAC-2001",
          email: "rajesh.sharma@codextechnology.com",
          department: "Software Engineering & Full Stack",
          isAssigned: true,
        }
        : {
          name: "Faculty Mentor Assignment Pending",
          code: "PENDING",
          email: "admissions@nexorastudent.in",
          department: "Assigned by admissions team upon course onboarding",
          isAssigned: false,
        };

  const activeUpcomingDemo = upcomingDemos.length > 0 ? upcomingDemos[0] : (latestDemo && latestDemo.status === "scheduled" ? {
    courseName: "Full Stack Web Development",
    demoDate: latestDemo.demo_date,
    startTime: latestDemo.demo_time || "11:00",
    endTime: "12:00",
    meetLink: latestDemo.meeting_link,
    status: "SCHEDULED",
    notes: latestDemo.notes || "Live course introduction & curriculum demo",
  } : null);

  // Active upcoming live session (strictly from backend-enrolled meetings or assigned group demo)
  const activeLiveMeeting = secureUpcomingMeetings.length > 0
    ? {
        lectureId: secureUpcomingMeetings[0].lectureId,
        title: secureUpcomingMeetings[0].title,
        courseName: secureUpcomingMeetings[0].courseName || activeCourse?.name || "Enrolled Curriculum Session",
        date: secureUpcomingMeetings[0].meetingDate,
        startTime: secureUpcomingMeetings[0].startTime || "18:00",
        endTime: secureUpcomingMeetings[0].endTime || "19:30",
        meetLink: secureUpcomingMeetings[0].meetingLink,
        status: secureUpcomingMeetings[0].status || "SCHEDULED",
        notes: secureUpcomingMeetings[0].description || "Live interactive coding & Q&A session with faculty.",
        isLecture: true,
      }
    : (activeUpcomingDemo ? {
        lectureId: undefined,
        title: activeUpcomingDemo.courseName || "Interactive Course Demo",
        courseName: activeUpcomingDemo.courseName,
        date: activeUpcomingDemo.demoDate,
        startTime: activeUpcomingDemo.startTime,
        endTime: activeUpcomingDemo.endTime || "12:00",
        meetLink: activeUpcomingDemo.meetLink,
        status: activeUpcomingDemo.status || "SCHEDULED",
        notes: activeUpcomingDemo.notes,
        isLecture: false,
      } : null);

  const daysRemaining = (secureEnrolledCourses[0]?.expiryDate || activeEnrollment?.expiry_date)
    ? getDaysRemaining(secureEnrolledCourses[0]?.expiryDate || activeEnrollment!.expiry_date!)
    : 0;

  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = (secureEnrolledCourses[0]?.expiryDate || activeEnrollment?.expiry_date)
    ? new Date() > new Date(secureEnrolledCourses[0]?.expiryDate || activeEnrollment!.expiry_date!)
    : false;

  return (
    <div className="space-y-6">
      {/* Active Live Session / Google Meet Card for Student */}
      {activeLiveMeeting && (
        <div className="rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-6 shadow-xl text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 border border-emerald-300/50 px-3 py-1 text-xs font-extrabold text-emerald-100">
                  <Video className="h-3.5 w-3.5 text-emerald-200" />
                  {activeLiveMeeting.isLecture ? "Scheduled Live Lecture" : "Upcoming Demo"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 border border-emerald-300/50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-200 uppercase">
                  {activeLiveMeeting.status || "Live"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeLiveMeeting.title}
              </h2>
              <div className="text-xs font-semibold text-emerald-300">
                Track: {activeLiveMeeting.courseName}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white pt-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-4 w-4 text-amber-300" />
                  <span>Date: <strong className="text-white font-bold">{activeLiveMeeting.date ? formatDate(activeLiveMeeting.date) : "Today"}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-4 w-4 text-emerald-300" />
                  <span>Time: <strong className="text-white font-bold">{activeLiveMeeting.startTime} - {activeLiveMeeting.endTime || "19:30"}</strong></span>
                </div>
              </div>

              {activeLiveMeeting.notes && (
                <p className="text-xs text-slate-100 font-medium italic bg-white/10 p-3 rounded-lg border border-white/20 mt-2 max-w-xl">
                  Instructions: "{activeLiveMeeting.notes}"
                </p>
              )}
            </div>

            {activeLiveMeeting.isLecture ? (
              <Link
                to={`/student/lectures/${activeLiveMeeting.lectureId}/live`}
                className="shrink-0 inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-400 px-6 py-3.5 text-xs font-black text-slate-950 hover:bg-emerald-300 transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
              >
                <Video className="h-4 w-4 text-slate-950" /> Join Live Classroom
              </Link>
            ) : activeLiveMeeting.meetLink ? (
              <a
                href={formatExternalUrl(activeLiveMeeting.meetLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-400 px-6 py-3.5 text-xs font-black text-slate-950 hover:bg-emerald-300 transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
              >
                <Video className="h-4 w-4 text-slate-950" /> Join Demo Session
              </a>
            ) : null}
          </div>
        </div>
      )}

      {/* Registration Received Banner for Unenrolled Students - BUG-STU-002: High Contrast */}
      {!activeEnrollment && !activeUpcomingDemo && (
        <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-7 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950 shadow-xs">
                <Clock className="h-3.5 w-3.5 text-slate-950" /> Registration Received
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                An admissions executor will contact you shortly for your free demo!
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-100 max-w-2xl leading-relaxed">
                Thank you for registering with Nexora. Our admissions officer will get in touch with you to explain the course curriculum and schedule your free interactive live demo session.
              </p>

              {lead && (
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-white">
                  <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                    Lead Status: <span className="font-extrabold text-amber-300 uppercase">{lead.status.replace("_", " ")}</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                    Assigned Executor: <span className="font-extrabold text-white">{lead.assigned_executor_id ? "Assigned" : "Pending Assignment"}</span>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/student/courses"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-slate-950 hover:bg-amber-300 transition-all shadow-lg hover:shadow-amber-400/20"
            >
              <BookOpen className="h-4 w-4" /> Explore Course Catalog
            </Link>
          </div>
        </div>
      )}

      {/* Welcome Banner - BUG-STU-002: High Contrast */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-emerald-500/30">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Student Learning Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {profile?.full_name || "Student"}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
            {activeCourse
              ? `You are currently making progress in ${activeCourse.name}. Keep going!`
              : "Explore our catalog of industry-grade courses to start learning."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/student/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-emerald-950 shadow-md hover:bg-slate-100 transition-all"
            >
              <BookOpen className="h-4 w-4 text-emerald-900" /> Browse Courses
            </Link>
            {upcomingLecture && (
              <Link
                to={`/student/lecture/${upcomingLecture.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 border border-emerald-300/40 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-500 transition-all shadow-md"
              >
                <PlayCircle className="h-4 w-4 text-white" /> Next Lecture
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Faculty Mentor Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-card p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-lg border border-emerald-500/20 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Faculty Mentor</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${assignedFaculty.isAssigned ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                {assignedFaculty.isAssigned ? "Active Mentor" : "Pending Assignment"}
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground mt-0.5">{assignedFaculty.name}</h3>
            <p className="text-xs text-muted-foreground">{assignedFaculty.department} • Code: <span className="font-mono text-emerald-500 font-semibold">{assignedFaculty.code}</span></p>
          </div>
        </div>

        <a
          href={`mailto:${assignedFaculty.email}`}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all shrink-0 cursor-pointer"
        >
          <Mail className="h-4 w-4" /> {assignedFaculty.isAssigned ? `Email Mentor (${assignedFaculty.email})` : `Contact Admissions`}
        </a>
      </div>

      {/* Course Expiry Warning Alert (Req 32: 7 days, 3 days, 1 day, Expired) */}
      {isExpiringSoon && !isExpired && (
        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <div className="text-sm font-bold">
                ⚠️ Course Access Expiring Soon! ({daysRemaining} Days Left)
              </div>
              <div className="text-xs opacity-90">
                Your course validity expires on {formatDate(activeEnrollment!.expiry_date!)}. Renew your plan to retain lecture access.
              </div>
            </div>
          </div>
          <Link
            to="/student/courses"
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors shrink-0"
          >
            Renew Plan
          </Link>
        </div>
      )}

      {isExpired && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-900 dark:text-rose-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <div className="text-sm font-bold">Access Expired</div>
              <div className="text-xs opacity-90">
                Your validity ended on {formatDate(activeEnrollment!.expiry_date!)}. Renew now to restore lecture streaming and downloads.
              </div>
            </div>
          </div>
          <Link
            to="/student/courses"
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shrink-0"
          >
            Renew Course
          </Link>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={activeCourse ? "Active Course" : "Interested Course"}
          value={
            activeCourse
              ? (activeCourse.name.length > 18 ? activeCourse.name.substring(0, 18) + "..." : activeCourse.name)
              : (lead?.interested_course ? (lead.interested_course.length > 18 ? lead.interested_course.substring(0, 18) + "..." : lead.interested_course) : "None")
          }
          subtitle={activeCourse ? (activeCourse.category || "General") : (lead?.interested_course ? "Awaiting Onboarding" : "Enroll to start")}
          icon={<BookOpen className="h-5 w-5" />}
          variant="primary"
        />
        <StatsCard
          title="Days Remaining"
          value={isExpired ? "0 Days" : `${daysRemaining} Days`}
          subtitle={activeEnrollment?.expiry_date ? `Valid till ${formatDate(activeEnrollment.expiry_date)}` : "No active plan"}
          icon={<Calendar className="h-5 w-5" />}
          trend={isExpired ? { value: "Expired", isPositive: false } : { value: "Active Calendar", isPositive: true }}
          variant={isExpired ? "rose" : daysRemaining <= 7 ? "amber" : "emerald"}
        />
        <StatsCard
          title="Lectures Completed"
          value={`${completedLectures} / ${lectures.length}`}
          subtitle={`${Math.round((completedLectures / (lectures.length || 1)) * 100)}% Progress`}
          icon={<Video className="h-5 w-5" />}
          variant="purple"
        />
        <StatsCard
          title="Upcoming Session"
          value={activeLiveMeeting ? activeLiveMeeting.title.substring(0, 14) + "..." : (upcomingLecture ? upcomingLecture.title.substring(0, 14) + "..." : "No live class")}
          subtitle={activeLiveMeeting ? `${activeLiveMeeting.startTime}` : (upcomingLecture ? `${upcomingLecture.start_time}` : "All done")}
          icon={<Clock className="h-5 w-5" />}
          variant="amber"
        />
      </div>

      {/* Upcoming Lecture Banner & Recent Lectures List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Lecture Card */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Upcoming Session
              </span>
              {activeLiveMeeting?.status === "live" || activeLiveMeeting?.status === "SCHEDULED" ? (
                <StatusBadge status={activeLiveMeeting.status?.toLowerCase() || "scheduled"} />
              ) : (
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Next Scheduled
                </span>
              )}
            </div>

            {activeLiveMeeting ? (
              <div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {activeLiveMeeting.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
                  {activeLiveMeeting.notes || "Live interactive coding & Q&A session."}
                </p>

                <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span className="font-semibold text-foreground">
                      {activeLiveMeeting.date ? formatDate(activeLiveMeeting.date) : "Today"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time:</span>
                    <span className="font-semibold text-foreground">
                      {activeLiveMeeting.startTime} - {activeLiveMeeting.endTime || "19:30"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No upcoming lectures scheduled today.
              </div>
            )}
          </div>

          {activeLiveMeeting ? (
            <Link
              to={activeLiveMeeting.isLecture ? `/student/lectures/${activeLiveMeeting.lectureId}/live` : (activeLiveMeeting.meetLink || "#")}
              target={activeLiveMeeting.isLecture ? undefined : "_blank"}
              className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 font-medium text-xs text-white hover:bg-emerald-500 transition-all shadow-xs cursor-pointer"
            >
              <Video className="h-4 w-4" /> {activeLiveMeeting.isLecture ? "Enter Live Classroom" : "Join Demo"}
            </Link>
          ) : upcomingLecture ? (
            <Link
              to={`/student/lectures/${upcomingLecture.id}/live`}
              className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-xs text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <Video className="h-4 w-4" />
              {upcomingLecture.status === "live" ? "Join Live Stream" : "View Live Classroom"}
            </Link>
          ) : null}
        </div>

        {/* Recent & Course Curriculum Lectures */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Course Lectures</h2>
              <p className="text-xs text-muted-foreground">All modules and recordings in your active course</p>
            </div>
            <Link
              to="/student/lectures"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {lectures.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No lectures found. Enroll in a course to get access.
              </div>
            ) : (
              lectures.slice(0, 4).map((lec, idx) => (
                <div
                  key={lec.id}
                  className="flex items-center justify-between py-3.5 hover:bg-accent/40 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground line-clamp-1">
                        {lec.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lec.lecture_date ? formatDate(lec.lecture_date) : "Scheduled"} • {lec.start_time || "18:00"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={lec.status} />
                    <Link
                      to={`/student/lecture/${lec.id}`}
                      className="rounded-md border border-border bg-background p-1.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      title="Access Lecture"
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" /> Mentor Feedback & Follow-ups
          </h2>
          <FollowupReportsList isStudent={true} />
        </div>
      </div>
    </div>
  );
}
