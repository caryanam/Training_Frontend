import { useState } from "react";
import { X, Star, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

interface FollowupReportModalProps {
  lead: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function FollowupReportModal({ lead, onClose, onSuccess }: FollowupReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    rating: 3,
    interested: true,
    expectedJoiningDate: "",
    demoDiscussion: "",
    projectCapability: "",
    additionalComments: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const setRating = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        expectedJoiningDate: formData.expectedJoiningDate || null
      };
      const response = await api.submitFollowupReport(lead.id, payload);
      if (!response.success) {
        throw new Error(response.error || response.message || "Failed to submit follow-up report");
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit follow-up report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Follow-up Report for {lead.fullName}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-500 border border-rose-500/20">
              {error}
            </div>
          )}

          <form id="followup-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Rating */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`h-6 w-6 ${formData.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Interested toggle */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Is Interested?</label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="interested"
                      checked={formData.interested}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-foreground">
                      {formData.interested ? "Yes, Interested" : "No"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Expected Joining Date */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expected Joining Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    name="expectedJoiningDate"
                    value={formData.expectedJoiningDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              {/* Demo Discussion */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo Discussion Summary</label>
                <textarea
                  name="demoDiscussion"
                  value={formData.demoDiscussion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                  placeholder="What was discussed during the demo lecture?"
                />
              </div>

              {/* Project Capability */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Capability</label>
                <input
                  type="text"
                  name="projectCapability"
                  value={formData.projectCapability}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g. Excellent, Needs basic training first, Ready for live projects"
                />
              </div>

              {/* Additional Comments */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Additional Comments</label>
                <textarea
                  name="additionalComments"
                  value={formData.additionalComments}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                  placeholder="Any other observations..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border p-4 bg-muted/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="followup-form"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
