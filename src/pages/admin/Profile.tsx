import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Settings,
  Shield,
  User,
  Mail,
  Phone,
} from "lucide-react";

export default function AdminProfile() {
  const { profile, updateProfile } = useAuth();

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fullName, setFullName] = useState(profile?.full_name || "Admin");
  const [phone, setPhone] = useState(profile?.phone || "+91 99999 00000");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "Admin");
      setPhone(profile.phone || "+91 99999 00000");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Full name must be at least 2 characters.");
      return;
    }

    setErrorMsg("");
    setSaving(true);

    try {
      const result = await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });

      if (result.error) {
        setErrorMsg(result.error.message);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      setErrorMsg("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Account Profile"
        subtitle="Manage your system administrator profile details, security preferences, and global permissions."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Overview Card */}
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 text-2xl font-extrabold text-white mb-4 ring-4 ring-rose-500/10 shadow-md">
            {fullName.trim() ? fullName.trim()[0].toUpperCase() : "A"}
          </div>

          <h3 className="text-lg font-bold text-foreground">{fullName || profile?.full_name || "Admin"}</h3>
          <p className="text-xs text-muted-foreground mb-3">{profile?.email || "admin@gmail.com"}</p>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-6">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Administrator
          </span>

          <div className="w-full rounded-xl border border-border bg-muted/40 p-4 text-xs text-left space-y-2.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin Role:</span>
              <span className="font-mono font-bold text-foreground">SUPER_ADMIN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Access Scope:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Full System Root</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status="active" />
            </div>
          </div>
        </div>

        {/* Right Form Card & System Shortcuts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h3 className="text-base font-bold text-foreground mb-4">Edit Administrator Information</h3>

            {saved && (
              <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Admin profile updated successfully!
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive animate-in fade-in">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  minLength={2}
                  placeholder="Enter admin name"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Admin Email (Read-only)
                </label>
                <input
                  type="email"
                  value={profile?.email || "admin@gmail.com"}
                  disabled
                  className="h-10 w-full rounded-xl border border-input bg-muted/50 px-3.5 text-xs text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99999 00000"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Quick System Navigation Shortcuts */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">System Administration Quick Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/admin/settings"
                className="flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-accent hover:border-primary/40 transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Platform Settings</div>
                  <div className="text-[11px] text-muted-foreground">Gateway & system policies</div>
                </div>
              </Link>

              <Link
                to="/admin/roles"
                className="flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-accent hover:border-primary/40 transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Roles & Permissions</div>
                  <div className="text-[11px] text-muted-foreground">Access control management</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
