import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api";
import { dataStore } from "@/lib/store";
import {
  UserPlus,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface ExecutorItem {
  profileId: string;
  executorId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

export default function AdminExecutors() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExecutor, setEditingExecutor] = useState<ExecutorItem | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("ACTIVE");

  const [executors, setExecutors] = useState<ExecutorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const fetchExecutors = async () => {
    try {
      const res = await api.getAllExecutors();
      if (res.success && res.data) {
        setExecutors(res.data);
      } else {
        setError(res.error || "Failed to load executors.");
        setExecutors([]);
      }
    } catch (err) {
      console.error("Failed to load executors:", err);
      setError("Unable to connect to server.");
      setExecutors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutors();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanPhone = phone.replace(/[\s\-\+]/g, "").replace(/^91(?=\d{10}$)/, "");
    if (cleanPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Mobile number must be a valid 10-digit number starting with 6, 7, 8, or 9.");
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await api.createExecutor({ fullName, email, phone, password });
      if (res.success) {
        setModalOpen(false);
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setError("");
        fetchExecutors();
        showSuccess("Admissions Executor created successfully!");
      } else {
        setError(typeof res.error === "string" ? res.error : "Failed to create executor account.");
      }
    } catch (err: any) {
      setError("Failed to connect to the backend server.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenEdit = (exe: ExecutorItem) => {
    setEditingExecutor(exe);
    setFullName(exe.fullName);
    setEmail(exe.email);
    setPhone(exe.phone);
    setPassword("");
    setStatus(exe.status || "ACTIVE");
    setError("");
    setEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExecutor) return;
    setError("");

    const cleanPhone = phone.replace(/[\s\-\+]/g, "").replace(/^91(?=\d{10}$)/, "");
    if (cleanPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Mobile number must be a valid 10-digit number starting with 6, 7, 8, or 9.");
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await api.updateExecutor(editingExecutor.executorId, {
        fullName,
        email,
        phone,
        password: password.trim() ? password : undefined,
      });

      if (res.success || res.data) {
        // Also update status if changed
        if (status.toUpperCase() !== editingExecutor.status.toUpperCase()) {
          await api.updateExecutorStatus(editingExecutor.executorId, status);
        }

        dataStore.updateExecutor(editingExecutor.executorId, {
          fullName,
          email,
          phone,
          status,
        });

        setEditModalOpen(false);
        setEditingExecutor(null);
        fetchExecutors();
        showSuccess("Admissions Executor updated successfully!");
      } else {
        setError(typeof res.error === "string" ? res.error : "Failed to update executor.");
      }
    } catch (err: any) {
      // Local fallback update
      dataStore.updateExecutor(editingExecutor.executorId, {
        fullName,
        email,
        phone,
        status,
      });
      setEditModalOpen(false);
      setEditingExecutor(null);
      fetchExecutors();
      showSuccess("Admissions Executor updated successfully!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (exe: ExecutorItem) => {
    if (!confirm(`Are you sure you want to delete admissions executor "${exe.fullName}" (${exe.executorId})?`)) {
      return;
    }

    setDeleteLoadingId(exe.executorId);
    try {
      const res = await api.deleteExecutor(exe.executorId);
      if (res.success || !res.error) {
        dataStore.deleteExecutor(exe.executorId);
        setExecutors((prev) => prev.filter((item) => item.executorId !== exe.executorId));
        showSuccess(`Executor "${exe.fullName}" deleted successfully.`);
      } else {
        alert(typeof res.error === "string" ? res.error : "Failed to delete executor.");
      }
    } catch {
      dataStore.deleteExecutor(exe.executorId);
      setExecutors((prev) => prev.filter((item) => item.executorId !== exe.executorId));
      showSuccess(`Executor "${exe.fullName}" deleted successfully.`);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleStatusChange = async (exe: ExecutorItem, newStatus: string) => {
    if (newStatus.toLowerCase() === exe.status.toLowerCase()) return;
    setStatusLoadingId(exe.executorId);

    try {
      const res = await api.updateExecutorStatus(exe.executorId, newStatus);
      if (!res.success) {
        dataStore.updateExecutorStatus(exe.executorId, newStatus);
      }
    } catch {
      dataStore.updateExecutorStatus(exe.executorId, newStatus);
    }

    setExecutors((prev) =>
      prev.map((e) =>
        e.executorId === exe.executorId ? { ...e, status: newStatus } : e
      )
    );
    setStatusLoadingId(null);
    showSuccess(`${exe.fullName} status changed to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}.`);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading admissions executors...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs">
      <PageHeader
        title="Admissions Executors Management"
        subtitle="Manage admissions counseling staff, assign prospective cohorts, and monitor conversion metrics."
        actions={
          <button
            type="button"
            onClick={() => {
              setFullName("");
              setEmail("");
              setPhone("");
              setPassword("");
              setError("");
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Admissions Executor
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
                <th className="px-5 py-3.5">Executor Lead</th>
                <th className="px-5 py-3.5">Work Contact</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {executors.map((exe) => (
                <tr key={exe.executorId} className="hover:bg-accent/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-foreground">{exe.fullName}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{exe.executorId}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <div>{exe.email}</div>
                    <div className="text-[11px]">{exe.phone}</div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-foreground">
                    {exe.role}
                  </td>
                  <td className="px-5 py-4">
                    {statusLoadingId === exe.executorId ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <select
                        value={exe.status.toLowerCase()}
                        onChange={(e) => handleStatusChange(exe, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer outline-none transition-colors ${
                          exe.status.toLowerCase() === "active"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        }`}
                      >
                        <option value="active">● Active</option>
                        <option value="inactive">● Inactive</option>
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(exe)}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                        title="Update Executor Details"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(exe)}
                        disabled={deleteLoadingId === exe.executorId}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                        title="Delete Executor"
                      >
                        {deleteLoadingId === exe.executorId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {executors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                    No executors registered in the system. Click "Add Admissions Executor" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Executor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">Add Admissions Executor</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent cursor-pointer">
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
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Saxena"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@codextechnology.com"
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
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter initial password"
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-3.5 pr-10 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitLoading}
                  className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create Executor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Update Executor Modal */}
      {editModalOpen && editingExecutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditModalOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Update Admissions Executor</h3>
                <p className="text-[11px] text-muted-foreground">ID: {editingExecutor.executorId}</p>
              </div>
              <button type="button" onClick={() => setEditModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Saxena"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@codextechnology.com"
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
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">New Password (Optional)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep existing password"
                    className="h-10 w-full rounded-xl border border-input bg-background px-3.5 pr-10 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={submitLoading}
                  className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Update Executor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
