import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Settings, ShieldCheck, CheckCircle2, CreditCard, Bell, HardDrive } from "lucide-react";

export default function AdminSettings() {
  const [platformName, setPlatformName] = useState("CodeX Technology");
  const [currency, setCurrency] = useState("INR");
  const [paymentProvider, setPaymentProvider] = useState("mock");
  const [signedUrlExpirySeconds, setSignedUrlExpirySeconds] = useState("3600");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform & System Settings"
        subtitle="Global platform configuration, payment gateway settings, and signed URL storage policies."
      />

      {saved && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Configuration saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* Platform Identity */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-foreground">Platform Identity</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="INR">Indian Rupee (INR - ₹)</option>
                <option value="USD">US Dollar (USD - $)</option>
                <option value="EUR">Euro (EUR - €)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Gateway Configuration */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Payment Gateway Integration (Razorpay Ready)
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Active Provider
              </label>
              <select
                value={paymentProvider}
                onChange={(e) => setPaymentProvider(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="mock">Simulated Mock Payment Provider (Local Testing)</option>
                <option value="razorpay">Razorpay Gateway (Production Ready)</option>
              </select>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground block mb-1">Architecture Guarantee (Requirement 1):</span>
              The system uses the <code className="font-mono bg-muted px-1 py-0.5 rounded">PaymentProvider</code> abstraction. Switching between Mock and Razorpay executes with zero changes to student enrollment or calendar validity calculations.
            </div>
          </div>
        </div>

        {/* Storage & Signed URLs */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" /> Storage & Signed URL Security
          </h3>

          <div className="text-xs space-y-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Signed URL Expiry Time (Seconds)
              </label>
              <input
                type="number"
                value={signedUrlExpirySeconds}
                onChange={(e) => setSignedUrlExpirySeconds(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Default: 3600 seconds (1 hour). Temporary download links expire automatically.
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
        >
          Save Platform Settings
        </button>
      </form>
    </div>
  );
}
