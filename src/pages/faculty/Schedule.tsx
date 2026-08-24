import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  PlayCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FacultySchedule() {
  const store = useDataStore();
  const lectures = store.getLectures();

  // Group lectures by date
  const groupedLectures: Record<string, typeof lectures> = {};
  lectures.forEach((lec) => {
    const key = lec.lecture_date || "Upcoming";
    if (!groupedLectures[key]) groupedLectures[key] = [];
    groupedLectures[key].push(lec);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teaching Calendar & Schedule"
        subtitle="Chronological timeline of upcoming live classes, Q&A sessions, and scheduled releases."
      />

      <div className="space-y-6">
        {Object.entries(groupedLectures).map(([dateStr, lecs]) => (
          <div key={dateStr} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span>{dateStr !== "Upcoming" ? formatDate(dateStr) : "To Be Announced"}</span>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs divide-y divide-border">
              {lecs.map((lec) => {
                const course = store.getCourse(lec.course_id);

                return (
                  <div
                    key={lec.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-accent/40 gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{lec.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {course?.name} • Time: {lec.start_time} - {lec.end_time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <StatusBadge status={lec.status} />
                      <Link
                        to="/faculty/lectures"
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                      >
                        Manage Session
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
