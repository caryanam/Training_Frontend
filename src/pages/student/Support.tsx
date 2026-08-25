import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  CheckCircle2,
  FileQuestion,
} from "lucide-react";

export default function StudentSupport() {
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!subject.trim() || subject.trim().length < 5) {
      errors.subject = "Subject must be at least 5 characters.";
    }
    if (!message.trim() || message.trim().length < 10) {
      errors.message = "Detailed message must be at least 10 characters.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject("");
      setMessage("");
      setFieldErrors({});
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Support & Help Desk"
        subtitle="Need assistance with lecture streaming, download access, or billing? Reach out to us."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Submit Ticket Form */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h3 className="text-base font-bold text-foreground mb-1">Open a Support Ticket</h3>
          <p className="text-xs text-muted-foreground mb-4">Our student success team responds within 24 hours.</p>

          {submitted && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Ticket submitted successfully! An executor will contact you shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Issue Category
              </label>
              <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>Lecture Access / Streaming Issue</option>
                <option>Download & Storage Request</option>
                <option>Payment & Plan Validity Extension</option>
                <option>Course Curriculum Query</option>
                <option>Other Technical Question</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Subject <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setFieldErrors((p) => ({ ...p, subject: "" })); }}
                placeholder="Brief description of the issue (min 5 characters)"
                required
                minLength={5}
                className={`h-10 w-full rounded-xl border ${fieldErrors.subject ? "border-destructive" : "border-input"} bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              />
              {fieldErrors.subject && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.subject}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Detailed Message <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => { setMessage(e.target.value); setFieldErrors((p) => ({ ...p, message: "" })); }}
                placeholder="Provide complete details about your problem (min 10 characters)"
                required
                minLength={10}
                className={`w-full rounded-xl border ${fieldErrors.message ? "border-destructive" : "border-input"} bg-background p-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              />
              {fieldErrors.message && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              Submit Ticket
            </button>
          </form>
        </div>

        {/* Right 1 Col: FAQs & Quick Contacts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-base font-bold text-foreground mb-2">Direct Contacts</h3>

            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>support@codextechnology.com</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <span>+91 1800 200 4000 (Mon-Sat, 9AM-8PM)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs text-xs space-y-3">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <FileQuestion className="h-4 w-4 text-primary" /> Quick FAQs
            </h4>
            <div className="space-y-2 text-muted-foreground">
              <p className="font-medium text-foreground">How does course validity work?</p>
              <p className="text-[11px]">Validity begins exactly on payment confirmation and calculates calendar month duration.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
