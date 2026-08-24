import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Key, ShieldCheck, Check, X } from "lucide-react";

interface RolePermissionItem {
  resource: string;
  student: boolean;
  executor: boolean;
  faculty: boolean;
  admin: boolean;
}

const DEFAULT_PERMISSIONS: RolePermissionItem[] = [
  { resource: "View Public Courses", student: true, executor: true, faculty: true, admin: true },
  { resource: "Enroll in Course & Checkout", student: true, executor: true, faculty: false, admin: true },
  { resource: "Access Valid Lectures & Stream", student: true, executor: false, faculty: true, admin: true },
  { resource: "Download Lecture Handouts", student: true, executor: false, faculty: true, admin: true },
  { resource: "Create & Schedule Lectures", student: false, executor: false, faculty: true, admin: true },
  { resource: "Delete & Cancel Lectures", student: false, executor: false, faculty: true, admin: true },
  { resource: "Share Lecture Links", student: false, executor: true, faculty: true, admin: true },
  { resource: "Student Onboarding Pipeline", student: false, executor: true, faculty: false, admin: true },
  { resource: "Log Outreach Follow-ups", student: false, executor: true, faculty: false, admin: true },
  { resource: "Manual Validity Extension", student: false, executor: false, faculty: false, admin: true },
  { resource: "Modify Payment / Refund", student: false, executor: false, faculty: false, admin: true },
  { resource: "Manage Staff (Executors / Faculty)", student: false, executor: false, faculty: false, admin: true },
  { resource: "View Immutable Audit Logs", student: false, executor: false, faculty: false, admin: true },
  { resource: "Export Business Reports", student: false, executor: false, faculty: false, admin: true },
];

export default function AdminRolesPermissions() {
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [saved, setSaved] = useState(false);

  const handleToggle = (index: number, role: "student" | "executor" | "faculty") => {
    const updated = [...permissions];
    updated[index][role] = !updated[index][role];
    setPermissions(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role-Based Access Control (RBAC) Matrix"
        subtitle="Manage granual authorizations across Student, Executor, Faculty, and Admin roles."
      />

      {saved && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" /> Permission policy updated successfully.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">System Resource / Action</th>
                <th className="px-5 py-3.5 text-center">Student</th>
                <th className="px-5 py-3.5 text-center">Executor</th>
                <th className="px-5 py-3.5 text-center">Faculty</th>
                <th className="px-5 py-3.5 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {permissions.map((item, idx) => (
                <tr key={item.resource} className="hover:bg-accent/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-foreground">
                    {item.resource}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(idx, "student")}
                      className={`h-7 w-7 rounded-lg inline-flex items-center justify-center transition-colors ${
                        item.student
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.student ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(idx, "executor")}
                      className={`h-7 w-7 rounded-lg inline-flex items-center justify-center transition-colors ${
                        item.executor
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.executor ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggle(idx, "faculty")}
                      className={`h-7 w-7 rounded-lg inline-flex items-center justify-center transition-colors ${
                        item.faculty
                          ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.faculty ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="h-7 w-7 rounded-lg inline-flex items-center justify-center bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold">
                      <Check className="h-4 w-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
