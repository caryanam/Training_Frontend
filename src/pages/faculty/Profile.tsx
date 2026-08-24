import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Award,
  CheckCircle2,
} from "lucide-react";

export default function FacultyProfile() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [fullName, setFullName] = useState(profile?.full_name || "Dr. Ananya Verma");
  const [phone, setPhone] = useState(profile?.phone || "+91 98111 22334");
  const [saved, setSaved] = useState(false);

  const courses = store.getCourses();
  const lectures = store.getLectures();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      profile.full_name = fullName;
      profile.phone = phone;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Academic Profile"
        subtitle="Manage your instructor bio, credentials, course assignments, and contact details."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Overview Card */}
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-2xl font-extrabold text-white mb-4 ring-4 ring-emerald-500/10">
            {profile?.full_name ? profile.full_name[0].toUpperCase() : "F"}
          </div>

          <h3 className="text-lg font-bold text-foreground">{profile?.full_name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{profile?.email}</p>

          <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-6">
            Senior Lead Faculty
          </span>

          <div className="w-full rounded-xl border border-border bg-muted/40 p-4 text-xs text-left space-y-2.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Faculty ID:</span>
              <span className="font-mono font-bold text-foreground">FAC-2001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned Tracks:</span>
              <span className="font-bold text-foreground">{courses.length} Courses</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Lectures:</span>
              <span className="font-bold text-foreground">{lectures.length} Sessions</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h3 className="text-base font-bold text-foreground mb-4">Instructor Profile Details</h3>

          {saved && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Instructor details updated!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Full Name & Title
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="h-10 w-full rounded-xl border border-input bg-muted/50 px-3.5 text-xs text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Direct Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
