import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Users,
  Video,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CoursePlan = {
  id: number;
  duration: string;
  durationLabel: string;
  price: number;
  currency: string;
};

type Course = {
  id: number;
  courseCode: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
  facultyId?: string;
  facultyName?: string;
  lectureCount: number;
  activeStudentCount: number;
  plans: CoursePlan[];
};

const CATEGORY_OPTIONS = [
  { value: "SOFTWARE_ENGINEERING", label: "Software Engineering" },
  { value: "WEB_DEVELOPMENT", label: "Web Development" },
  { value: "DATA_SCIENCE", label: "Data Science" },
  { value: "DEVOPS_CLOUD", label: "DevOps & Cloud" },
  { value: "CYBER_SECURITY", label: "Cyber Security" },
  { value: "MOBILE_DEVELOPMENT", label: "Mobile Development" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "INACTIVE", label: "Inactive" },
];

const DEFAULT_PLANS = [
  { duration: "ONE_MONTH", label: "1 Month Plan", price: "7000" },
  { duration: "TWO_MONTHS", label: "2 Months Plan", price: "14000" },
  { duration: "THREE_MONTHS", label: "3 Months Plan", price: "21000" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function categoryLabel(raw?: string) {
  return (
    CATEGORY_OPTIONS.find((c) => c.value === raw)?.label ||
    raw?.replace(/_/g, " ") ||
    "—"
  );
}

function shortDuration(duration: string) {
  switch (duration) {
    case "ONE_MONTH": return "1M";
    case "TWO_MONTHS": return "2M";
    case "THREE_MONTHS": return "3M";
    default: return duration;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [facultyOptions, setFacultyOptions] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [facultyId, setFacultyId] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // delete state
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("SOFTWARE_ENGINEERING");
  const [status, setStatus] = useState("ACTIVE");
  const [description, setDescription] = useState("");
  const [plan1Price, setPlan1Price] = useState("7000");
  const [plan2Price, setPlan2Price] = useState("14000");
  const [plan3Price, setPlan3Price] = useState("21000");

  useEffect(() => {
    api.getAllFaculty().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setFacultyOptions(
          res.data.map((f: any) => ({
            id: f.facultyId || `FAC-${2000 + f.id}`,
            name: f.fullName,
            code: f.facultyId || `FAC-${2000 + f.id}`,
          }))
        );
      } else {
        setFacultyOptions([
          { id: "FAC-2001", name: "Dr. Rajesh Sharma", code: "FAC-2001" },
          { id: "FAC-2002", name: "Prof. Ananya Roy", code: "FAC-2002" },
          { id: "FAC-2003", name: "Vikramaditya Verma", code: "FAC-2003" },
        ]);
      }
    });
  }, []);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCourses = useCallback(async () => {
    setPageError("");
    try {
      const res = await api.getAllCourses();
      if (res.success && res.data) {
        setCourses(res.data as Course[]);
      } else {
        setCourses([]);
        setPageError(res.error || res.message || "Failed to load courses from backend.");
      }
    } catch {
      setCourses([]);
      setPageError("Cannot connect to backend. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ─── Modal helpers ───────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle("");
    setCategory("SOFTWARE_ENGINEERING");
    setStatus("ACTIVE");
    setFacultyId(facultyOptions[0]?.id || "FAC-2001");
    setDescription("");
    setPlan1Price("7000");
    setPlan2Price("14000");
    setPlan3Price("21000");
    setSubmitError("");
    setModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setCategory(c.category || "SOFTWARE_ENGINEERING");
    setStatus(c.status);
    setFacultyId((c as any).facultyId || facultyOptions[0]?.id || "FAC-2001");
    setDescription(c.description || "");
    // Populate prices from current plans
    const p1 = c.plans.find((p) => p.duration === "ONE_MONTH");
    const p2 = c.plans.find((p) => p.duration === "TWO_MONTHS");
    const p3 = c.plans.find((p) => p.duration === "THREE_MONTHS");
    setPlan1Price(p1 ? String(p1.price) : "7000");
    setPlan2Price(p2 ? String(p2.price) : "14000");
    setPlan3Price(p3 ? String(p3.price) : "21000");
    setSubmitError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSubmitError("");
  };

  // ─── Validation ──────────────────────────────────────────────────────────────

  function validateForm(): string | null {
    if (!title.trim()) return "Course title is required.";
    if (!description.trim()) return "Description is required.";
    if (!category) return "Category is required.";
    const p1 = Number(plan1Price);
    const p2 = Number(plan2Price);
    const p3 = Number(plan3Price);
    if (!p1 || p1 <= 0) return "1 Month plan price must be greater than zero.";
    if (!p2 || p2 <= 0) return "2 Months plan price must be greater than zero.";
    if (!p3 || p3 <= 0) return "3 Months plan price must be greater than zero.";
    return null;
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitLoading(true);
    setSubmitError("");

    const plans = [
      { duration: "ONE_MONTH", price: Number(plan1Price) },
      { duration: "TWO_MONTHS", price: Number(plan2Price) },
      { duration: "THREE_MONTHS", price: Number(plan3Price) },
    ];

    try {
      let res;
      if (editingCourse) {
        res = await api.updateCourse(editingCourse.id, {
          title: title.trim(),
          category,
          description: description.trim(),
          status,
          facultyId,
          plans,
        });
      } else {
        res = await api.createCourse({
          title: title.trim(),
          category,
          description: description.trim(),
          status,
          facultyId,
          plans,
        });
      }

      if (res.success) {
        closeModal();
        setLoading(true);
        await fetchCourses();
      } else {
        setSubmitError(res.error || res.message || "Operation failed.");
      }
    } catch {
      setSubmitError("Cannot connect to backend server.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.deleteCourse(deleteTarget.id);
      if (res.success) {
        setDeleteTarget(null);
        setLoading(true);
        await fetchCourses();
      } else {
        setDeleteTarget(null);
      }
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management & Pricing"
        subtitle="Create IT courses, configure 1/2/3 month pricing plans, and manage course lifecycle."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" /> Create Course Track
          </button>
        }
      />

      {/* Error Banner */}
      {pageError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {pageError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Loading courses...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !pageError && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">No courses available</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Create your first course to get started.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Create Course Track
          </button>
        </div>
      )}

      {/* Course Cards Grid */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card shadow-xs overflow-hidden"
            >
              {/* Card Header */}
              <div>
                <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                      {categoryLabel(c.category)}
                    </span>
                    <StatusBadge status={c.status.toLowerCase()} />
                  </div>
                  <h3 className="text-lg font-bold text-white line-clamp-1">{c.title}</h3>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 text-xs">
                  <p className="text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {c.description || "No description provided."}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 border-t border-b border-border py-3 text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Video className="h-3.5 w-3.5 text-primary" />
                      {c.lectureCount} Lectures
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Users className="h-3.5 w-3.5 text-emerald-600" />
                      {c.activeStudentCount} Active Students
                    </span>
                  </div>

                  {/* Plans */}
                  {c.plans && c.plans.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Configured Plans ({c.plans.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.plans.map((p) => (
                          <span
                            key={p.id}
                            className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground"
                          >
                            {shortDuration(p.duration)} {formatINR(p.price)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(c)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Course
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(c)}
                  className="rounded-xl border border-border p-2 text-muted-foreground hover:text-rose-600 hover:border-rose-300 transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create / Edit Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl z-50 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">
                {editingCourse ? "Edit Course Track" : "Create New Course Track"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitLoading}
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error */}
            {submitError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Java Full Stack Development"
                  required
                  disabled={submitLoading}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                />
              </div>

              {/* Assign Faculty Instructor */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Assign Faculty / Lead Instructor *
                </label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  disabled={submitLoading}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 cursor-pointer"
                >
                  <option value="">-- Select Faculty Instructor --</option>
                  {facultyOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={submitLoading}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={submitLoading}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of what students will master in this course..."
                  required
                  disabled={submitLoading}
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                />
              </div>

              {/* Pricing Plans */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <div className="font-bold text-foreground text-xs">
                  Configure Pricing Tiers (INR ₹)
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "1 Month Plan", price: plan1Price, setPrice: setPlan1Price },
                    { label: "2 Months Plan", price: plan2Price, setPrice: setPlan2Price },
                    { label: "3 Months Plan", price: plan3Price, setPrice: setPlan3Price },
                  ].map(({ label, price, setPrice }) => (
                    <div key={label}>
                      <label className="block text-[11px] text-muted-foreground mb-1">
                        {label}
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          disabled={submitLoading}
                          className="h-9 w-full rounded-lg border border-input bg-background pl-6 pr-2 text-xs disabled:opacity-60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitLoading}
                  className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {editingCourse ? "Saving..." : "Creating..."}
                    </>
                  ) : editingCourse ? (
                    "Save Changes"
                  ) : (
                    "Create Course & Plans"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => !deleteLoading && setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Delete Course?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-foreground">"{deleteTarget.title}"</span>
                  <br />
                  {deleteTarget.activeStudentCount > 0 || deleteTarget.lectureCount > 0
                    ? "This course has students or lectures — it will be set to Inactive to preserve historical data."
                    : "This course will be permanently deleted."}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleteLoading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...</>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
