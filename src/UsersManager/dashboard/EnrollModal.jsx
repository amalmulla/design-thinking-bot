import React from "react";
import { BookOpen } from "lucide-react";
import { Button } from "../../components/ui/button";

/**
 * Student-only modal for enrolling in a course. Courses the student already
 * belongs to are shown disabled with an "(Enrolled)" marker.
 */
export default function EnrollModal({
  isOpen,
  allCourses,
  enrolledCourses,
  enrollCourseId, setEnrollCourseId,
  onEnroll,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Enroll in a Course
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Available Courses</label>
            {allCourses.length === 0 ? (
              <p className="text-xs text-rose-500 font-semibold select-none">No courses available.</p>
            ) : (
              <select
                value={enrollCourseId}
                onChange={(e) => setEnrollCourseId(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                <option value="">— Choose a course to enroll —</option>
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id} disabled={enrolledCourses.some(ec => ec.id === c.id)}>
                    {c.title} {enrolledCourses.some(ec => ec.id === c.id) ? "(Enrolled)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onEnroll}
            disabled={!enrollCourseId}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enroll
          </Button>
        </div>
      </div>
    </div>
  );
}
