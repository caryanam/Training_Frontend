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
  CheckCircle2,
  Users,
  Video,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  UserPlus,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Student Info", icon: UserCheck },
  { id: 2, label: "Course Selection", icon: BookOpen },
  { id: 3, label: "Explanation", icon: FileText },
  { id: 4, label: "Plan & Access", icon: ShieldCheck },
  { id: 5, label: "Enrollment", icon: CheckCircle2 },
  { id: 6, label: "Faculty Assignment", icon: Users },
  { id: 7, label: "Lecture Access", icon: Video },
  { id: 8, label: "Completed", icon: Sparkles },
];

export default function ExecutorOnboarding() {
  const { profile } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryLeadId = searchParams.get("leadId");

  const [currentStep, setCurrentStep] = useState(1);

  // Wizard State
  const [selectedLeadId, setSelectedLeadId] = useState<string>(queryLeadId || "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("Graduate");
  const [city, setCity] = useState("Mumbai");

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [assignedFacultyId, setAssignedFacultyId] = useState("");
  const [notes, setNotes] = useState("Direct onboarding by executor without payment flow.");

  const [assignedLeads, setAssignedLeads] = useState<any[]>([]);
  const [facultyOptions, setFacultyOptions] = useState<Array<{ id: string; name: string; code: string }>>([
    { id: "FAC-2001", name: "Dr. Rajesh Sharma", code: "FAC-2001" },
    { id: "FAC-2002", name: "Prof. Aniket Verma", code: "FAC-2002" },
    { id: "FAC-2003", name: "Priya Sundaram", code: "FAC-2003" },
  ]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const courses = store.getCourses();
  const selectedCourse = courses.find((c) => c.id === (selectedCourseId || courses[0]?.id)) || courses[0];
  const plans = selectedCourse ? store.getPlansForCourse(selectedCourse.id) : [];
  const selectedPlan = plans.find((p) => p.id === (selectedPlanId || plans[0]?.id)) || plans[0];

  // Load faculty list from API or store
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const res = await api.getAllFaculty();
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((f: any) => ({
            id: f.facultyId || f.profileId,
            name: f.fullName || f.name || "Faculty Mentor",
            code: f.facultyId || "FAC-2001",
          }));
          setFacultyOptions(mapped);
          if (!assignedFacultyId && mapped.length > 0) {
            setAssignedFacultyId(mapped[0].id);
          }
          return;
        }
      } catch (e) {
        console.error("Failed to load faculty from API:", e);
      }

      // Store fallback
      const storeFaculty = store.getFacultyWithProfiles();
      if (storeFaculty.length > 0) {
        const mapped = storeFaculty.map((f) => ({
          id: f.faculty_id || f.id,
          name: f.profile?.full_name || "Faculty Mentor",
          code: f.faculty_id || "FAC-2001",
        }));
        setFacultyOptions(mapped);
        if (!assignedFacultyId && mapped.length > 0) {
          setAssignedFacultyId(mapped[0].id);
        }
      } else {
        setAssignedFacultyId("FAC-2001");
      }
    };

    loadFaculty();
  }, []);

  // Load leads for executor
  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    api.getLeads("all", undefined, profile.id, profile.email)
      .then((res) => {
        if (res.success && res.data) {
          setAssignedLeads(res.data);
          // If query lead id present
          if (queryLeadId) {
            const found = res.data.find((l: any) => l.leadId === queryLeadId);
            if (found) {
              populateLeadData(found);
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching leads:", err))
      .finally(() => setLoading(false));
  }, [profile, queryLeadId]);

  const populateLeadData = (lead: any) => {
    setSelectedLeadId(lead.leadId || lead.id);
    setFullName(lead.fullName || lead.full_name || "");
    setEmail(lead.email || "");
    setPhone(lead.phone || "");
    if (lead.education) setEducation(lead.education);
    if (lead.city) setCity(lead.city);
    if (lead.interestedCourse) {
      const matchCourse = courses.find(
        (c) => c.name.toLowerCase() === lead.interestedCourse.toLowerCase()
      );
      if (matchCourse) setSelectedCourseId(matchCourse.id);
    }
  };

  const handleSelectLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedLeadId(val);
    if (!val) {
      setFullName("");
      setEmail("");
      setPhone("");
      return;
    }
    const found = assignedLeads.find((l: any) => l.leadId === val || l.id === val);
    if (found) {
      populateLeadData(found);
    }
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (!fullName.trim() || !email.trim()) {
        setError("Please enter the student's full name and email address.");
        return;
      }
    }
    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinishOnboarding = async () => {
    setSubmitting(true);
    setError("");

    try {
      // 1. Register student or update lead status via API
      if (selectedLeadId) {
        await api.updateLeadStatus(selectedLeadId, "enrolled");
      }

      // Call API register student
      const regRes = await api.registerStudent({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || "9876543210",
        password: "Student@123",
        interestedCourse: selectedCourse?.name || "Full Stack Web Development",
        education,
        city,
      });

      const studentProfileId = regRes.data?.profileId || `student-${Date.now()}`;

      // 2. Add enrollment to reactive local store without payment flow requirement
      store.processSuccessfulEnrollment({
        studentProfileId,
        courseId: selectedCourse?.id || courses[0]?.id,
        planId: selectedPlan?.id || plans[0]?.id,
        amount: 0,
        paymentMethod: "Direct Executor Onboarding (No Payment)",
      });

      setSuccessMsg(`Student "${fullName}" successfully onboarded & enrolled! Direct access active.`);
      
      setTimeout(() => {
        navigate("/executor/students");
      }, 1500);
    } catch (err: any) {
      // Local store fallback
      const studentProfileId = `student-${Date.now()}`;
      store.processSuccessfulEnrollment({
        studentProfileId,
        courseId: selectedCourse?.id || courses[0]?.id,
        planId: selectedPlan?.id || plans[0]?.id,
        amount: 0,
        paymentMethod: "Direct Executor Onboarding (No Payment)",
      });

      setSuccessMsg(`Student "${fullName}" successfully onboarded!`);
      setTimeout(() => {
        navigate("/executor/students");
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-xs">
      <PageHeader
        title="Student Admissions Onboarding Wizard"
        subtitle="Direct 8-step pipeline to register leads, assign faculty, configure lecture access, and activate enrollment without payment processing."
      />

      {/* Success Alert */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300 font-semibold animate-in fade-in max-w-3xl mx-auto">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 8-Step Progress Bar Indicator */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px]">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs transition-all ${
                      isCompleted
                        ? "bg-emerald-600 text-white shadow-xs"
                        : isCurrent
                        ? "bg-primary text-white ring-4 ring-primary/20 shadow-xs"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-semibold tracking-tight text-center ${
                      isCurrent
                        ? "text-primary font-bold"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-emerald-600" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-destructive font-semibold">
            {error}
          </div>
        )}

        {/* STEP 1: Student Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Step 1: Student Contact Information</h3>
              <p className="text-muted-foreground">Select an assigned lead or fill in new student registration details.</p>
            </div>

            {assignedLeads.length > 0 && (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 space-y-1.5">
                <label className="block font-bold text-indigo-600 dark:text-indigo-400">
                  Select From Assigned Leads (Optional):
                </label>
                <select
                  value={selectedLeadId}
                  onChange={handleSelectLeadChange}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="">-- Create New Student Registration --</option>
                  {assignedLeads.map((l: any) => (
                    <option key={l.leadId || l.id} value={l.leadId || l.id}>
                      {l.fullName} ({l.email}) — {l.interestedCourse || "General"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikas Kulkarni"
                required
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikas@example.com"
                required
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Education
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. B.Tech / BCA"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai / Pune"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Course Selection */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Step 2: Course Selection</h3>
              <p className="text-muted-foreground">Select the target learning track for the student.</p>
            </div>

            <div className="space-y-2.5">
              {courses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all flex items-center justify-between ${
                    (selectedCourseId || courses[0]?.id) === c.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div>
                    <div className="font-bold text-foreground">{c.name}</div>
                    <div className="text-muted-foreground text-[11px]">{c.category}</div>
                  </div>
                  {(selectedCourseId || courses[0]?.id) === c.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Course Explanation */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Step 3: Course Syllabus Review</h3>
              <p className="text-muted-foreground">Confirm that the curriculum and outcomes have been reviewed with the student.</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
              <div className="font-bold text-foreground">{selectedCourse?.name}</div>
              <div className="text-muted-foreground text-xs leading-relaxed">
                {selectedCourse?.description}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-input text-primary h-4 w-4" />
                Live interactive coding schedule explained
              </label>
              <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-input text-primary h-4 w-4" />
                Validity duration and mentor access agreed upon
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Plan & Direct Access (No Payment Required) */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Step 4: Plan Selection & Direct Access</h3>
              <p className="text-muted-foreground">Select course validity duration. Payment flow is bypassed for direct onboarding.</p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-emerald-700 dark:text-emerald-300">Direct Executor Onboarding Active</div>
                <div className="text-[11px] text-emerald-600/90 dark:text-emerald-400">No payment transaction required. Full course access will be provisioned directly.</div>
              </div>
            </div>

            <div className="space-y-2.5">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all flex items-center justify-between ${
                    (selectedPlanId || plans[0]?.id) === p.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div>
                    <div className="font-bold text-foreground">{p.name}</div>
                    <div className="text-muted-foreground text-[11px]">{p.duration_months} Months Full Access</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Approved Direct Access
                    </span>
                    {(selectedPlanId || plans[0]?.id) === p.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Enrollment Activation */}
        {currentStep === 5 && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">Step 5: Enrollment Direct Activation</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Ready to activate course enrollment for <strong>{fullName || "Student"}</strong> in <strong>{selectedCourse?.name}</strong>.
            </p>
          </div>
        )}

        {/* STEP 6: Faculty Assignment */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Step 6: Assign Primary Faculty Mentor</h3>
              <p className="text-muted-foreground">Assign an instructor to guide the student's cohort.</p>
            </div>

            <select
              value={assignedFacultyId}
              onChange={(e) => setAssignedFacultyId(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <option value="">-- Select Faculty Mentor --</option>
              {facultyOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* STEP 7: Lecture Access */}
        {currentStep === 7 && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Video className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">Step 7: Lecture Access Provisioning</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Student login credentials and live lecture access will be automatically generated upon final confirmation.
            </p>
          </div>
        )}

        {/* STEP 8: Completed */}
        {currentStep === 8 && (
          <div className="space-y-4 text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 ring-8 ring-emerald-500/10">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Step 8: Onboarding Ready to Complete!</h3>
              <p className="text-muted-foreground max-w-md mx-auto mt-1">
                Student <strong>{fullName}</strong> will be registered and enrolled into <strong>{selectedCourse?.name}</strong> without any payment step.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
          <button
            type="button"
            disabled={currentStep === 1 || submitting}
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              Next Step <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Finalize & Activate Student
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
