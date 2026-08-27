import { useState, useEffect, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useDataStore } from "@/lib/store";
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  Video,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  Users,
  Search,
  CheckSquare,
  Square,
  BookOpen,
} from "lucide-react";

interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: {
    id: string;
    fullName: string;
    student_id?: string;
    email?: string;
    interestedCourse?: string;
    course_id?: string;
  } | null;
  preselectedStudentIds?: string[];
  existingDemo?: any;
  onSuccess?: () => void;
}

const COURSES_LIST = [
  "Full Stack Web Development",
  "Data Science & AI",
  "Cyber Security & Ethical Hacking",
  "Cloud Computing & DevOps",
  "Mobile App Development (Flutter/React Native)",
  "UI/UX Design & Frontend Engineering",
];

const EMPTY_STUDENT_IDS: string[] = [];

export function ScheduleDemoModal({
  isOpen,
  onClose,
  lead,
  preselectedStudentIds = EMPTY_STUDENT_IDS,
  existingDemo,
  onSuccess,
}: ScheduleDemoModalProps) {
  const store = useDataStore();
  const todayStr = new Date().toISOString().split("T")[0];

  const [availableLeads, setAvailableLeads] = useState<any[]>([]);

  const [courseName, setCourseName] = useState(
    lead?.interestedCourse || "Full Stack Web Development"
  );
  const [demoDate, setDemoDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("12:00");
  const [meetLink, setMeetLink] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchStudentQuery, setSearchStudentQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const existingDemoId = existingDemo?.id || existingDemo?.sessionId;
  const leadId = lead?.id;
  const preselectedKey = (preselectedStudentIds || []).join(",");

  useEffect(() => {
    if (!isOpen) return;

    api.getLeads("all")
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((l: any) => ({
            id: l.leadId || l.id,
            full_name: l.fullName || l.full_name || "Student",
            email: l.email || "",
            phone: l.phone || "",
            interestedCourse: l.interestedCourse || l.interested_course || "Full Stack Web Development",
          }));
          setAvailableLeads(mapped);

          if (!existingDemo && preselectedStudentIds.length === 0 && !lead?.id && mapped.length > 0) {
            setSelectedStudentIds(mapped.slice(0, 3).map((m: any) => m.id));
          }
        } else {
          // Fallback to store
          const fallbackLeads = store.getStudentLeadsWithProfiles().map((l) => ({
            id: l.id,
            full_name: l.profile.full_name,
            email: l.profile.email,
            phone: l.profile.phone || "",
            interestedCourse: l.interested_course || "Full Stack Web Development",
          }));
          setAvailableLeads(fallbackLeads);
          if (!existingDemo && preselectedStudentIds.length === 0 && !lead?.id && fallbackLeads.length > 0) {
            setSelectedStudentIds(fallbackLeads.slice(0, 3).map((m: any) => m.id));
          }
        }
      })
      .catch(() => {
        const fallbackLeads = store.getStudentLeadsWithProfiles().map((l) => ({
          id: l.id,
          full_name: l.profile.full_name,
          email: l.profile.email,
          phone: l.profile.phone || "",
          interestedCourse: l.interested_course || "Full Stack Web Development",
        }));
        setAvailableLeads(fallbackLeads);
        if (!existingDemo && preselectedStudentIds.length === 0 && !lead?.id && fallbackLeads.length > 0) {
          setSelectedStudentIds(fallbackLeads.slice(0, 3).map((m: any) => m.id));
        }
      });

    if (existingDemo) {
      setCourseName(existingDemo.courseName || "Full Stack Web Development");
      setDemoDate(existingDemo.demoDate || existingDemo.demo_date || todayStr);
      setStartTime(existingDemo.startTime || existingDemo.demo_time || "11:00");
      setEndTime(existingDemo.endTime || "12:00");
      setMeetLink(existingDemo.meetLink || existingDemo.meeting_link || "");
      setNotes(existingDemo.notes || "");
      if (existingDemo.participants) {
        setSelectedStudentIds(
          existingDemo.participants.map((p: any) => p.leadId || p.studentId)
        );
      }
    } else {
      setCourseName(lead?.interestedCourse || "Full Stack Web Development");
      setDemoDate(todayStr);
      setStartTime("11:00");
      setEndTime("12:00");
      setMeetLink("");
      setNotes("");

      if (preselectedStudentIds.length > 0) {
        setSelectedStudentIds(preselectedStudentIds);
      } else if (lead?.id) {
        setSelectedStudentIds([lead.id]);
      }
    }
    setError("");
    setSuccessMsg("");
  }, [isOpen, existingDemoId, leadId, preselectedKey]);

  if (!isOpen) return null;

  const filteredLeads = availableLeads.filter(
    (l: any) =>
      l.full_name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      (l.phone && l.phone.includes(searchStudentQuery))
  );

  const toggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredLeads.map((l: any) => l.id);
    setSelectedStudentIds(Array.from(new Set([...selectedStudentIds, ...allFilteredIds])));
  };

  const handleClearAll = () => {
    setSelectedStudentIds([]);
  };

  const validateGoogleMeetUrl = (url: string) => {
    if (!url || !url.trim()) return false;
    const clean = url.trim().toLowerCase();
    return (
      clean.includes("meet.google.com") ||
      clean.includes("meet.google") ||
      clean.startsWith("http")
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!demoDate) {
      setError("Please select a demo date.");
      return;
    }
    if (demoDate < todayStr) {
      setError("Demo date cannot be in the past.");
      return;
    }

    if (!startTime) {
      setError("Please select a start time.");
      return;
    }
    if (!endTime) {
      setError("Please select an end time.");
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    if (!meetLink || !meetLink.trim()) {
      setError("Please enter a valid Google Meet link.");
      return;
    }
    if (!validateGoogleMeetUrl(meetLink)) {
      setError(
        "Invalid meeting link format. Please provide a valid meeting link (e.g. https://meet.google.com/abc-defg-hij)"
      );
      return;
    }

    if (!existingDemo && selectedStudentIds.length === 0) {
      setError("Please select at least one student for the group demo session.");
      return;
    }

    setLoading(true);

    try {
      if (existingDemo) {
        const res = await api.editGroupDemo(existingDemo.id || existingDemo.sessionId, {
          courseName,
          demoDate,
          startTime,
          endTime,
          meetLink: meetLink.trim(),
          notes: notes.trim(),
        });

        if (res.success || res.data) {
          setSuccessMsg("Group demo session updated successfully!");
        } else {
          // Update in local store fallback
          store.updateDemoSession(existingDemo.id || existingDemo.sessionId, {
            demo_date: demoDate,
            demo_time: startTime,
            meeting_link: meetLink.trim(),
            notes: notes.trim(),
          });
          setSuccessMsg("Group demo session updated successfully!");
        }

        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      } else {
        const res = await api.createGroupDemo({
          courseName,
          demoDate,
          startTime,
          endTime,
          meetLink: meetLink.trim(),
          notes: notes.trim(),
          studentIds: selectedStudentIds,
        });

        if (res.success || res.data) {
          setSuccessMsg(
            `Group demo scheduled for ${selectedStudentIds.length} student(s) successfully!`
          );

          // Update local store leads reactive state
          selectedStudentIds.forEach((studentId) => {
            store.updateLeadStatus(studentId, "demo_scheduled");
          });
        } else {
          // Local fallback creation
          selectedStudentIds.forEach((studentId) => {
            store.createDemoSession({
              lead_id: studentId,
              student_id: studentId,
              executor_id: "exe-rec-1",
              course_id: "course-1",
              demo_date: demoDate,
              demo_time: startTime,
              meeting_link: meetLink.trim(),
              status: "scheduled",
              notes: notes.trim(),
              feedback: null,
            });
            store.updateLeadStatus(studentId, "demo_scheduled");
          });

          setSuccessMsg(
            `Group demo scheduled for ${selectedStudentIds.length} student(s) successfully!`
          );
        }

        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      // Fallback on network/fetch exception
      selectedStudentIds.forEach((studentId) => {
        store.createDemoSession({
          lead_id: studentId,
          student_id: studentId,
          executor_id: "exe-rec-1",
          course_id: "course-1",
          demo_date: demoDate,
          demo_time: startTime,
          meeting_link: meetLink.trim(),
          status: "scheduled",
          notes: notes.trim(),
          feedback: null,
        });
        store.updateLeadStatus(studentId, "demo_scheduled");
      });

      setSuccessMsg(
        `Group demo scheduled for ${selectedStudentIds.length} student(s) successfully!`
      );
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {existingDemo ? "Edit Group Demo Session" : "Schedule Group Demo Session"}
              </h3>
              <p className="text-xs text-slate-400">
                {existingDemo
                  ? "Update session time and Google Meet link for all participants"
                  : "One Google Meet link accessible by all selected students"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Course Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Course Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {COURSES_LIST.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Demo Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  min={todayStr}
                  value={demoDate}
                  onChange={(e) => setDemoDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Start Time <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                End Time <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Google Meet Link */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Google Meet Link <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="url"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Paste an existing Google Meet link (e.g., https://meet.google.com/abc-defg-hij). All selected students will receive this exact link.
            </p>
          </div>

          {/* Student Selection Section */}
          {!existingDemo && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Select Students</span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                    {selectedStudentIds.length} student(s) selected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    <CheckSquare className="h-3.5 w-3.5" /> Select All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:underline"
                  >
                    <Square className="h-3.5 w-3.5" /> Clear All
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or phone..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Student Checkbox List */}
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/50">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No matching student leads found.
                  </div>
                ) : (
                  filteredLeads.map((student) => {
                    const isChecked = selectedStudentIds.includes(student.id);
                    return (
                      <label
                        key={student.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-emerald-950/40 border border-emerald-500/30"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectStudent(student.id)}
                            className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                          />
                          <div>
                            <p className="text-xs font-bold text-white">{student.full_name}</p>
                            <p className="text-[10px] text-slate-400">
                              {student.email} • {student.phone}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {student.interestedCourse || "Web Dev"}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Full Stack Web Development group demo instructions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : existingDemo ? (
                "Update Group Demo"
              ) : (
                `Schedule Group Demo (${selectedStudentIds.length})`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
