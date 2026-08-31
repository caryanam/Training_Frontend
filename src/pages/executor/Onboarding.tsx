import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  UserCheck,
  BookOpen,
  FileText,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Clock,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface BackendCoursePlan {
  id: number;
  duration: string;
  durationLabel: string;
  price: number;
  currency: string;
}

interface BackendCourse {
  id: number;
  courseCode: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
  facultyId?: string;
  facultyName?: string;
  plans: BackendCoursePlan[];
}

const STEPS = [
  { id: 1, label: "Student Info", icon: UserCheck },
  { id: 2, label: "Course & Plan", icon: BookOpen },
  { id: 3, label: "Syllabus Confirmation", icon: FileText },
  { id: 4, label: "Payment Summary", icon: ShieldCheck },
  { id: 5, label: "Dummy Payment", icon: CreditCard },
  { id: 6, label: "Enrollment Confirmed", icon: Sparkles },
];

export default function ExecutorOnboarding() {
  const { profile } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryLeadId = searchParams.get("leadId");

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedLeadId, setSelectedLeadId] = useState<string>(queryLeadId || "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("Graduate");
  const [city, setCity] = useState("Mumbai");

  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");

  // Confirmation Checkboxes
  const [syllabusExplained, setSyllabusExplained] = useState(false);
  const [scheduleExplained, setScheduleExplained] = useState(false);
  const [validityExplained, setValidityExplained] = useState(false);

  // Notes
  const [notes, setNotes] = useState("");

  // Leads & Loading State
  const [assignedLeads, setAssignedLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  // Dummy Payment State
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: number | null;
    transactionId: string;
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | null;
    message?: string;
  } | null>(null);

  // Onboarding Submission & Result State
  const [submitting, setSubmitting] = useState(false);
  const [onboardingResult, setOnboardingResult] = useState<any | null>(null);

  // 1. Fetch Backend Courses, Assigned Leads & Faculty List
  useEffect(() => {
    async function initData() {
      setLoading(true);
      setErrorMsg("");
      try {
        const [coursesRes, leadsRes, facultyRes] = await Promise.all([
          api.getAllCourses(),
          api.getLeads("all", "", profile?.id, profile?.email),
          api.getAllFaculty(),
        ]);

        if (coursesRes.success && coursesRes.data) {
          setCourses(coursesRes.data as BackendCourse[]);
          if (coursesRes.data.length > 0 && !selectedCourseId) {
            const firstCourse = coursesRes.data[0];
            setSelectedCourseId(String(firstCourse.id));
            if (firstCourse.plans && firstCourse.plans.length > 0) {
              setSelectedPlanId(String(firstCourse.plans[0].id));
            }
          }
        }

        if (facultyRes.success && Array.isArray(facultyRes.data)) {
          setFacultyList(facultyRes.data);
          if (facultyRes.data.length > 0 && !selectedFacultyId) {
            setSelectedFacultyId(facultyRes.data[0].facultyId || String(facultyRes.data[0].profileId || ""));
          }
        }

        if (leadsRes.success && leadsRes.data) {
          setAssignedLeads(leadsRes.data);
          if (queryLeadId) {
            const foundLead = leadsRes.data.find(
              (l: any) => l.leadId === queryLeadId || String(l.id) === queryLeadId
            );
            if (foundLead) {
              prefillFromLead(foundLead);
            }
          }
        }
      } catch (err: any) {
        setErrorMsg("Failed to connect to backend server. Please verify backend connection.");
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, [profile, queryLeadId]);

  // Helper to prefill fields from a selected lead
  const prefillFromLead = (lead: any) => {
    setSelectedLeadId(lead.leadId || String(lead.id));
    setFullName(lead.fullName || "");
    setEmail(lead.email || "");
    setPhone(lead.phone || "");
    if (lead.education) setEducation(lead.education);
    if (lead.city) setCity(lead.city);
    setFieldErrors({});
  };

  // Selected Course & Plan objects
  const selectedCourse = courses.find((c) => String(c.id) === selectedCourseId) || courses[0];
  const availablePlans = selectedCourse?.plans || [];
  const selectedPlan = availablePlans.find((p) => String(p.id) === selectedPlanId) || availablePlans[0];

  // Helper to get safely verified backend facultyId
  const getVerifiedFacultyId = (): string | undefined => {
    // 1. Check if selectedFacultyId is in facultyList
    if (selectedFacultyId) {
      const match = facultyList.find(
        (f) =>
          f.facultyId === selectedFacultyId ||
          f.profileId === selectedFacultyId ||
          String(f.id) === selectedFacultyId ||
          f.facultyId?.toLowerCase() === selectedFacultyId.toLowerCase()
      );
      if (match) return match.facultyId || match.profileId || String(match.id);
    }

    // 2. Check if course has a valid backend faculty
    const courseFacultyCode = selectedCourse?.facultyId;
    if (courseFacultyCode) {
      const match = facultyList.find(
        (f) =>
          f.facultyId === courseFacultyCode ||
          f.profileId === courseFacultyCode ||
          String(f.id) === courseFacultyCode ||
          f.facultyId?.toLowerCase() === courseFacultyCode.toLowerCase()
      );
      if (match) return match.facultyId || match.profileId || String(match.id);
    }

    // 3. If first active faculty exists in database, use it
    if (facultyList.length > 0) {
      return facultyList[0].facultyId || facultyList[0].profileId || String(facultyList[0].id);
    }

    return undefined;
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || (cleanPhone.length !== 10 && cleanPhone.length !== 12)) {
      errors.phone = "Phone number must be a valid 10-digit mobile number.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation (Confirmations)
  const isConfirmationsComplete = syllabusExplained && scheduleExplained && validityExplained;

  // Step 5: Initiate Dummy Payment (Calls POST /api/v1/payments/dummy/create)
  const handleCreateDummyPayment = async () => {
    if (!selectedCourse || !selectedPlan) {
      setErrorMsg("Please select a course and pricing plan first.");
      return;
    }

    setPaymentLoading(true);
    setErrorMsg("");

    try {
      const res = await api.createDummyPayment({
        studentId: selectedLeadId || email || "STU-1001",
        courseId: String(selectedCourse.id),
        planId: String(selectedPlan.id),
      });

      if (res.success && res.data) {
        setPaymentData({
          paymentId: res.data.paymentId,
          transactionId: res.data.transactionId,
          amount: res.data.amount || selectedPlan.price,
          currency: res.data.currency || "INR",
          status: "PENDING",
          message: res.data.message,
        });
      } else {
        setErrorMsg(res.error || "Failed to create dummy payment order.");
      }
    } catch (err: any) {
      setErrorMsg("Server error creating payment order.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Step 5: Simulate Payment Result (Calls POST /api/v1/payments/dummy/complete)
  const handleSimulatePayment = async (result: "SUCCESS" | "FAILED" | "CANCELLED") => {
    if (!paymentData?.paymentId && !paymentData?.transactionId) {
      setErrorMsg("No active payment transaction found.");
      return;
    }

    setPaymentLoading(true);
    setErrorMsg("");

    try {
      const res = await api.completeDummyPayment({
        paymentId: paymentData.paymentId ? String(paymentData.paymentId) : undefined,
        transactionId: paymentData.transactionId,
        result,
      });

      if (res.success && res.data) {
        setPaymentData((prev) => ({
          ...prev!,
          status: result,
          transactionId: res.data?.transactionId || prev!.transactionId,
          message: res.data?.message || `Payment simulated as ${result}`,
        }));
      } else {
        setErrorMsg(res.error || `Payment simulation for ${result} failed.`);
      }
    } catch (err: any) {
      setErrorMsg("Error completing payment simulation.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Step 6: Submit Final Onboarding to Backend (Calls POST /api/v1/onboarding/students)
  const handleSubmitOnboarding = async () => {
    if (!paymentData || paymentData.status !== "SUCCESS") {
      setErrorMsg("Payment must be confirmed SUCCESS before completing onboarding.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const verifiedFaculty = getVerifiedFacultyId();
      const res = await api.onboardStudent({
        leadId: selectedLeadId || undefined,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        education: education.trim(),
        city: city.trim(),
        courseId: String(selectedCourse.id),
        planId: String(selectedPlan.id),
        syllabusExplained,
        scheduleExplained,
        validityExplained,
        facultyId: verifiedFaculty,
        paymentId: paymentData.paymentId ? String(paymentData.paymentId) : undefined,
        transactionId: paymentData.transactionId,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        setOnboardingResult(res.data);
        store.createPayment({
          id: `pay-${res.data.paymentId || Date.now()}`,
          transaction_id: res.data.transactionId || paymentData.transactionId,
          student_id: res.data.studentId || res.data.profileId || email,
          course_id: String(selectedCourse.id),
          plan_id: String(selectedPlan.id),
          amount: res.data.amount || selectedPlan.price,
          status: "success",
          payment_method: "dummy_payment",
          created_at: new Date().toISOString(),
        });
        setCurrentStep(6);
      } else {
        setErrorMsg(res.error || "Backend rejected onboarding request.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to backend onboarding endpoint.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center gap-3 text-sm font-semibold text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-[#014122]" /> Loading onboarding workspace...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-xs pb-12">
      <PageHeader
        title="Student Onboarding Console"
        subtitle="Production-grade multi-step admissions workflow with live course verification and dummy payment simulation."
      />

      {/* STEPPER PROGRESS HEADER */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? "border-[#014122] bg-[#014122]/10 text-[#014122] font-black shadow-xs"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 font-semibold"
                    : "border-border/60 bg-muted/20 text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs shrink-0 ${
                    isCurrent
                      ? "bg-[#014122] text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold opacity-70">Step {step.id}</div>
                  <div className="truncate text-[11px] font-extrabold">{step.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          STEP 1: STUDENT INFORMATION
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-foreground">Step 1: Student Information</h3>
            <p className="text-muted-foreground text-xs">
              Select an assigned lead to auto-prefill information or enter student details directly.
            </p>
          </div>

          {/* Lead Selector Pill */}
          {assignedLeads.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Prefill from Assigned Student Leads (Optional)
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  const leadId = e.target.value;
                  setSelectedLeadId(leadId);
                  const found = assignedLeads.find(
                    (l: any) => l.leadId === leadId || String(l.id) === leadId
                  );
                  if (found) prefillFromLead(found);
                }}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">-- Choose an assigned lead to prefill --</option>
                {assignedLeads.map((l: any) => (
                  <option key={l.id || l.leadId} value={l.leadId || String(l.id)}>
                    {l.fullName} ({l.email}) — Status: {l.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                placeholder="Student full name"
                className={`h-10 w-full rounded-xl border ${
                  fieldErrors.fullName ? "border-rose-500" : "border-input"
                } bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-[11px] text-rose-500 font-semibold">{fieldErrors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="student@example.com"
                className={`h-10 w-full rounded-xl border ${
                  fieldErrors.email ? "border-rose-500" : "border-input"
                } bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-rose-500 font-semibold">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
                Phone Number (Indian 10-digit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="9876543210"
                className={`h-10 w-full rounded-xl border ${
                  fieldErrors.phone ? "border-rose-500" : "border-input"
                } bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-[11px] text-rose-500 font-semibold">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
                Highest Education
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Tech Computer Science, B.Sc"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune, Mumbai, Bangalore"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) {
                  setCurrentStep(2);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#014122] hover:bg-[#026637] text-white px-6 py-2.5 font-bold shadow-xs cursor-pointer transition-all"
            >
              Continue to Course Selection <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          STEP 2: COURSE & PRICING PLAN SELECTION
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-foreground">Step 2: Course & Plan Selection</h3>
            <p className="text-muted-foreground text-xs">
              Choose an active course from the backend catalog and select the authorized plan duration.
            </p>
          </div>

          {/* Courses Grid */}
          <div className="space-y-2">
            <label className="block font-black uppercase tracking-wider text-muted-foreground text-[10px]">
              Available Training Courses (From Spring Boot Catalog)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courses.map((c) => {
                const isSelected = String(c.id) === selectedCourseId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCourseId(String(c.id));
                      if (c.plans && c.plans.length > 0) {
                        setSelectedPlanId(String(c.plans[0].id));
                      } else {
                        setSelectedPlanId("");
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#014122] bg-[#014122]/10 ring-2 ring-[#014122]/20 shadow-xs"
                        : "border-border hover:border-[#014122]/40 bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-extrabold text-foreground text-sm">{c.title}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                          {c.category?.replace("_", " ")}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                        {c.courseCode || `ID-${c.id}`}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-muted-foreground text-[11px] mt-2 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                    {c.facultyName && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" /> Faculty: {c.facultyName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Plans for Selected Course */}
          {selectedCourse && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="block font-black uppercase tracking-wider text-muted-foreground text-[10px]">
                Select Plan Duration (Authoritative Server Pricing)
              </label>
              {availablePlans.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-amber-700 text-xs">
                  No pricing plans configured for this course. Please configure plans in Course Management.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {availablePlans.map((plan) => {
                    const isSelected = String(plan.id) === selectedPlanId;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(String(plan.id))}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#014122] bg-[#014122]/10 ring-2 ring-[#014122]/20 shadow-xs"
                            : "border-border hover:border-[#014122]/40 bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">
                            {plan.durationLabel || plan.duration}
                          </span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-[#014122]" />}
                        </div>
                        <div className="mt-2 font-black text-lg text-[#014122] dark:text-emerald-400">
                          ₹{plan.price.toLocaleString("en-IN")}{" "}
                          <span className="text-[10px] font-bold text-muted-foreground">INR</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Exact calendar validity
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Faculty Mentor Assignment */}
          {facultyList.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="block font-black uppercase tracking-wider text-muted-foreground text-[10px]">
                Assigned Faculty Mentor (From Spring Boot Database)
              </label>
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {facultyList.map((f) => (
                  <option key={f.facultyId || f.id} value={f.facultyId || String(f.id)}>
                    {f.fullName} {f.department ? `(${f.department})` : ""} — Code: {f.facultyId}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 font-bold hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              disabled={!selectedPlanId}
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#014122] hover:bg-[#026637] disabled:opacity-50 text-white px-6 py-2.5 font-bold shadow-xs cursor-pointer transition-all"
            >
              Continue to Confirmations <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          STEP 3: SYLLABUS & SCHEDULE CONFIRMATIONS
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-foreground">Step 3: Course Explanation Checklist</h3>
            <p className="text-muted-foreground text-xs">
              The executor must confirm that the course roadmap, schedule, and calendar validity have been explained.
            </p>
          </div>

          <div className="space-y-3">
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                syllabusExplained
                  ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <input
                type="checkbox"
                checked={syllabusExplained}
                onChange={(e) => setSyllabusExplained(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-[#014122] accent-[#014122] cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-foreground">Syllabus & Modules Explained</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  "I have explained the comprehensive module curriculum, project roadmaps, and assignments to the student."
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                scheduleExplained
                  ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <input
                type="checkbox"
                checked={scheduleExplained}
                onChange={(e) => setScheduleExplained(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-[#014122] accent-[#014122] cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-foreground">Lecture Timings & Schedule Explained</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  "I have informed the student about live Google Meet lecture streaming hours, timezone, and faculty availability."
                </div>
              </div>
            </label>

            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                validityExplained
                  ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <input
                type="checkbox"
                checked={validityExplained}
                onChange={(e) => setValidityExplained(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-[#014122] accent-[#014122] cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-xs text-foreground">Calendar Validity Explained</div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  "I have explained that course access follows strict calendar months (Start Date + Duration Months)."
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1 text-[10px]">
              Internal Onboarding Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special remarks or student requirements..."
              className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 font-bold hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              disabled={!isConfirmationsComplete}
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#014122] hover:bg-[#026637] disabled:opacity-50 text-white px-6 py-2.5 font-bold shadow-xs cursor-pointer transition-all"
            >
              Continue to Payment Summary <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          STEP 4: PAYMENT SUMMARY
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-bold text-foreground">Step 4: Payment Summary</h3>
            <p className="text-muted-foreground text-xs">
              Review student enrollment and authoritative backend plan pricing before launching dummy payment simulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Student Profile
              </span>
              <div className="space-y-1 text-xs">
                <div className="font-extrabold text-foreground text-sm">{fullName}</div>
                <div className="text-muted-foreground">{email}</div>
                <div className="text-muted-foreground">{phone}</div>
                <div className="text-muted-foreground">Education: {education} • City: {city}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Course & Plan Details
              </span>
              <div className="space-y-1 text-xs">
                <div className="font-extrabold text-foreground text-sm">{selectedCourse?.title}</div>
                <div className="text-muted-foreground">
                  Plan: <span className="font-bold text-foreground">{selectedPlan?.durationLabel || selectedPlan?.duration}</span>
                </div>
                <div className="text-muted-foreground">
                  Faculty Mentor: {selectedCourse?.facultyName || "Assigned by System"}
                </div>
                <div className="text-muted-foreground">
                  Payment Method: <span className="font-bold text-foreground">Dummy Payment Gateway (Test Mode)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="rounded-2xl border border-[#014122]/30 bg-[#014122]/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                Authoritative Payable Amount
              </span>
              <p className="text-muted-foreground text-xs">
                Payment amount is determined directly by the backend course pricing plan.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-[#014122] dark:text-emerald-400">
                ₹{selectedPlan?.price.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-bold text-muted-foreground">INR</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 font-bold hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentStep(5);
                handleCreateDummyPayment();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#014122] hover:bg-[#026637] text-white px-6 py-2.5 font-bold shadow-xs cursor-pointer transition-all"
            >
              Proceed to Dummy Payment <CreditCard className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          STEP 5: DUMMY PAYMENT SIMULATION SCREEN
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          {/* Test Mode Top Warning Banner */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300 font-bold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600" />
              <span>TEST ENVIRONMENT — DUMMY PAYMENT GATEWAY SIMULATION</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20">
              No Real Money Charged
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground">Step 5: Dummy Payment Terminal</h3>
            <p className="text-muted-foreground text-xs">
              Simulate the student's transaction result to test backend payment processing and enrollment activation.
            </p>
          </div>

          {paymentLoading && !paymentData && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground font-semibold">
              <Loader2 className="h-6 w-6 animate-spin text-[#014122]" />
              <span>Creating backend payment order...</span>
            </div>
          )}

          {paymentData && (
            <div className="rounded-2xl border border-border bg-muted/15 p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-border/80">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Transaction ID</span>
                  <div className="font-mono text-xs font-bold text-foreground mt-0.5 truncate">
                    {paymentData.transactionId}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Amount</span>
                  <div className="font-extrabold text-sm text-[#014122] dark:text-emerald-400 mt-0.5">
                    ₹{paymentData.amount.toLocaleString("en-IN")} {paymentData.currency}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Payment Status</span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        paymentData.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
                          : paymentData.status === "FAILED"
                          ? "bg-rose-500/10 text-rose-700 border border-rose-500/30"
                          : paymentData.status === "CANCELLED"
                          ? "bg-slate-500/10 text-slate-700 border border-slate-500/30"
                          : "bg-amber-500/10 text-amber-700 border border-amber-500/30 animate-pulse"
                      }`}
                    >
                      {paymentData.status === "PENDING" && <Clock className="h-3 w-3" />}
                      {paymentData.status === "SUCCESS" && <CheckCircle2 className="h-3 w-3" />}
                      {paymentData.status === "FAILED" && <XCircle className="h-3 w-3" />}
                      {paymentData.status || "PENDING"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Order ID</span>
                  <div className="font-mono text-xs text-muted-foreground mt-0.5">
                    PAY-ORD-#{paymentData.paymentId || "TEMP"}
                  </div>
                </div>
              </div>

              {/* Simulation Action Buttons */}
              {paymentData.status === "PENDING" && (
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground block text-center">
                    Select Simulated Payment Result
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      disabled={paymentLoading}
                      onClick={() => handleSimulatePayment("SUCCESS")}
                      className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Simulate Success
                    </button>

                    <button
                      type="button"
                      disabled={paymentLoading}
                      onClick={() => handleSimulatePayment("FAILED")}
                      className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Simulate Failure
                    </button>

                    <button
                      type="button"
                      disabled={paymentLoading}
                      onClick={() => handleSimulatePayment("CANCELLED")}
                      className="h-11 rounded-xl border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Cancel Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Result State Alert */}
              {paymentData.status === "SUCCESS" && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <div>Payment Verified Successfully!</div>
                    <div className="text-[11px] font-normal text-muted-foreground mt-0.5">
                      Transaction <span className="font-mono">{paymentData.transactionId}</span> confirmed by backend. Ready to activate enrollment.
                    </div>
                  </div>
                </div>
              )}

              {(paymentData.status === "FAILED" || paymentData.status === "CANCELLED") && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-300 font-bold flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 shrink-0 text-rose-600" />
                    <div>
                      <div>Payment {paymentData.status}</div>
                      <div className="text-[11px] font-normal text-muted-foreground mt-0.5">
                        Enrollment was not activated. You can retry creating a new payment order.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateDummyPayment}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-rose-700 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Retry Payment
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 font-bold hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Summary
            </button>

            {paymentData?.status === "SUCCESS" && (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitOnboarding}
                className="inline-flex items-center gap-2 rounded-xl bg-[#014122] hover:bg-[#026637] text-white px-7 py-2.5 font-extrabold shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Activating Enrollment...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Student Onboarding</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          STEP 6: BACKEND ENROLLMENT CONFIRMATION & ONBOARDING RESULT
      ───────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 6 && onboardingResult && (
        <div className="rounded-2xl border border-emerald-500/30 bg-card p-6 sm:p-8 shadow-lg space-y-6 animate-in zoom-in-95">
          <div className="text-center space-y-2 pb-4 border-b border-border/80">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mx-auto ring-8 ring-emerald-500/5 shadow-xs">
              <Sparkles className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              Student Onboarded Successfully!
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              The student profile, active course enrollment, and calendar validity dates have been confirmed by the backend server.
            </p>
          </div>

          {/* Confirmed Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Onboarding Code</span>
              <div className="font-mono text-xs font-black text-foreground">
                {onboardingResult.onboardingCode}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Student ID</span>
              <div className="font-mono text-xs font-black text-foreground">
                {onboardingResult.studentId}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Enrollment Status</span>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase">
                  <CheckCircle2 className="h-3 w-3" /> {onboardingResult.enrollmentStatus || "ACTIVE"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Enrolled Course</span>
              <div className="font-bold text-xs text-foreground">
                {onboardingResult.courseName}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Plan & Duration</span>
              <div className="font-bold text-xs text-foreground">
                {onboardingResult.planDuration?.replace("_", " ")} (₹{onboardingResult.amount?.toLocaleString("en-IN")})
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Assigned Faculty</span>
              <div className="font-bold text-xs text-foreground">
                {onboardingResult.facultyName || "Assigned by System"}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Enrollment Start Date</span>
              <div className="font-semibold text-xs text-foreground">
                {onboardingResult.startDate}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Enrollment Expiry Date</span>
              <div className="font-semibold text-xs text-[#014122] dark:text-emerald-400 font-mono">
                {onboardingResult.expiryDate}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Transaction Ref</span>
              <div className="font-mono text-xs text-muted-foreground truncate">
                {onboardingResult.transactionId}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#014122]/5 border border-[#014122]/20 flex items-center gap-3 text-xs text-foreground">
            <CheckCircle2 className="h-5 w-5 text-[#014122] shrink-0" />
            <span>
              The student can now log in with their credentials to access course materials and live Google Meet lectures.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setOnboardingResult(null);
                setPaymentData(null);
                setCurrentStep(1);
                setFullName("");
                setEmail("");
                setPhone("");
                setSyllabusExplained(false);
                setScheduleExplained(false);
                setValidityExplained(false);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#014122] text-white px-6 py-2.5 text-xs font-bold shadow-xs hover:bg-[#026637] transition-all cursor-pointer"
            >
              Onboard Another Student <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/executor/leads"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-border px-6 py-2.5 text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              View Student Leads Pipeline
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
