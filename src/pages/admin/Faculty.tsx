import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api";
import { dataStore } from "@/lib/store";
import {
  Users,
  Plus,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface FacultyItem {
  profileId: string;
  facultyId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  department?: string;
}

export default function AdminFaculty() {
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState<FacultyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.getAllFaculty();
      if (res.success && res.data) {
        setFaculty(res.data);
      } else {
        const mockData = dataStore.getFacultyWithProfiles();
        setFaculty(
          mockData.map((f) => ({
            profileId: f.profile_id,
            facultyId: f.faculty_id,
            fullName: f.profile.full_name,
            email: f.profile.email,
            phone: f.profile.phone || "",
            role: f.profile.role.toUpperCase(),
            status: f.status,
            department: (f as any).department || "General",
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load faculty roster:", err);
      const mockData = dataStore.getFacultyWithProfiles();
      setFaculty(
        mockData.map((f) => ({
          profileId: f.profile_id,
          facultyId: f.faculty_id,
          fullName: f.profile.full_name,
          email: f.profile.email,
          phone: f.profile.phone || "",
          role: f.profile.role.toUpperCase(),
          status: f.status,
          department: (f as any).department || "General",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitLoading(true);

    try {
      const res = await api.createFaculty({ fullName, email, phone, password, department });
      if (res.success) {
        setModalOpen(false);
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setDepartment("");
        fetchFaculty();
      } else {
        setError(res.error || "Failed to create faculty account.");
      }
    } catch (err: any) {
      setError("Failed to connect to the backend server.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStatusChange = async (fac: FacultyItem, newStatus: string) => {
    if (newStatus.toLowerCase() === fac.status.toLowerCase()) return;
    setStatusLoadingId(fac.facultyId);

    try {
      const res = await api.updateFacultyStatus(fac.facultyId, newStatus);
      if (!res.success) {
        dataStore.updateFacultyStatus(fac.facultyId, newStatus);
      }
    } catch {
      dataStore.updateFacultyStatus(fac.facultyId, newStatus);
    }

    // Update local state directly so the UI reflects the change immediately
    setFaculty((prev) =>
      prev.map((f) =>
        f.facultyId === fac.facultyId ? { ...f, status: newStatus } : f
      )
    );
    setStatusLoadingId(null);
    showSuccess(`${fac.fullName} status changed to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}.`);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading training faculty...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs">
      <PageHeader
        title="Faculty & Instructors Roster"
        subtitle="Manage teaching staff, assign curriculum domain ownership, and review delivered lecture sessions."
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Faculty Member
          </button>
        }
      />

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="text-xs font-semibold">{successMessage}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Faculty Lead</th>
                <th className="px-5 py-3.5">Email & Phone</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faculty.map((f) => (
                <tr key={f.facultyId} className="hover:bg-accent/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-foreground">{f.fullName}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{f.facultyId}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <div>{f.email}</div>
                    <div className="text-[11px]">{f.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {f.department || "General"}
                  </td>
                  <td className="px-5 py-4 font-semibold text-foreground">
                    {f.role}
                  </td>
                  <td className="px-5 py-4">
                    {statusLoadingId === f.facultyId ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <select
                        value={f.status.toLowerCase()}
                        onChange={(e) => handleStatusChange(f, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer outline-none transition-colors ${
                          f.status.toLowerCase() === "active"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        <option value="active">● Active</option>
                        <option value="inactive">● Inactive</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {faculty.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No faculty members registered in the system. Click "Add Faculty Member" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Faculty Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">Add Faculty Member</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Full Name & Title</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Prof. Rajesh Khanna"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Academic Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh@codextechnology.com"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9812345678"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Information Technology"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter initial password"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitLoading}
                  className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 flex items-center justify-center gap-1.5"
                >
                  {submitLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
