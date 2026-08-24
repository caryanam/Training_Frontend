import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  UserCheck,
  BookOpen,
  FileText,
  CreditCard,
  CheckCircle2,
  Users,
  Video,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Student Info", icon: UserCheck },
  { id: 2, label: "Course Selection", icon: BookOpen },
  { id: 3, label: "Explanation", icon: FileText },
  { id: 4, label: "Payment", icon: CreditCard },
  { id: 5, label: "Enrollment", icon: CheckCircle2 },
  { id: 6, label: "Faculty Assignment", icon: Users },
  { id: 7, label: "Lecture Access", icon: Video },
  { id: 8, label: "Completed", icon: Sparkles },
];

export default function ExecutorOnboarding() {
  const { profile } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  // Wizard State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [assignedFacultyId, setAssignedFacultyId] = useState("");
  const [notes, setNotes] = useState("Onboarded by executor via admissions portal.");

  const courses = store.getCourses();
  const selectedCourse = courses.find((c) => c.id === (selectedCourseId || courses[0]?.id)) || courses[0];
  const plans = selectedCourse ? store.getPlansForCourse(selectedCourse.id) : [];
  const selectedPlan = plans.find((p) => p.id === (selectedPlanId || plans[0]?.id)) || plans[0];
  const facultyList = store.getFacultyWithProfiles();

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinishOnboarding = () => {
    // Generate verified enrollment in store
    const studentProfileId = `student-${Date.now()}`;
    const finalAmount = Math.max(0, (selectedPlan?.price || 5000) - (selectedPlan?.discount || 0));

    store.processSuccessfulEnrollment({
      studentProfileId,
      courseId: selectedCourse?.id || courses[0]?.id,
      planId: selectedPlan?.id || plans[0]?.id,
      amount: finalAmount,
      paymentMethod: "Onboarding Assisted Payment",
    });

    navigate("/executor/students");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Admissions Onboarding Wizard"
        subtitle="Step-by-step pipeline to register, explain curriculum, collect payment verification, and configure lecture permissions."
      />

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
                        ? "text-primary"
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
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
        {/* STEP 1: Student Information */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-foreground">Step 1: Student Contact Information</h3>
            <p className="text-muted-foreground">Enter the lead's personal contact details.</p>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikas Kulkarni"
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vikas@example.com"
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Course Selection */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-foreground">Step 2: Course Selection</h3>
            <p className="text-muted-foreground">Select the target learning track for the student.</p>

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
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Course Explanation */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-foreground">Step 3: Course Explanation Check</h3>
            <p className="text-muted-foreground">Confirm that the syllabus and outcomes have been reviewed with the student.</p>

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
                Calendar-based validity duration agreed upon
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Payment */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-foreground">Step 4: Plan Selection & Payment</h3>
            <p className="text-muted-foreground">Select the validity duration plan.</p>

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
                    <div className="text-muted-foreground text-[11px]">{p.duration_months} Months Access</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{formatCurrency(p.price - p.discount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Enrollment Activation */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">Step 5: Enrollment Verification</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Ready to activate course enrollment for <strong>{fullName || "Student"}</strong> in <strong>{selectedCourse?.name}</strong>.
            </p>
          </div>
        )}

        {/* STEP 6: Faculty Assignment */}
        {currentStep === 6 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-foreground">Step 6: Assign Primary Faculty Mentor</h3>
            <p className="text-muted-foreground">Assign instructor to guide the student's cohort.</p>

            <select
              value={assignedFacultyId}
              onChange={(e) => setAssignedFacultyId(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.profile.full_name} ({f.faculty_id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* STEP 7: Lecture Access */}
        {currentStep === 7 && (
          <div className="space-y-4 text-xs text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Video className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">Step 7: Lecture Access Provisioning</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              System access credentials and lecture room links will be immediately provisioned for the student profile upon final confirmation.
            </p>
          </div>
        )}

        {/* STEP 8: Completed */}
        {currentStep === 8 && (
          <div className="space-y-4 text-xs text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-500/10">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Step 8: Onboarding Ready to Complete!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              All 8 validation checkpoints verified. Click below to complete registration and log student admission.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-border pt-6 mt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              Next Step <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" /> Finalize & Activate Student
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
