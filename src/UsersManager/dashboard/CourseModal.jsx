import React from "react";
import { BookOpen, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

/**
 * Teacher-only modal for creating or editing a course: set the title and pick
 * which of the teacher's challenges belong to it. Deleting is only offered for
 * courses with no enrolled students.
 */
export default function CourseModal({
  isOpen,
  editingCourseId,
  courses,
  challenges,
  courseTitle, setCourseTitle,
  courseChallenges, setCourseChallenges,
  onSave,
  onDelete,
  onClose,
}) {
  if (!isOpen) return null;

  const canDelete = editingCourseId && (() => {
    const ec = courses.find(c => c.id === editingCourseId);
    return ec && (ec.enrolledStudents || []).length === 0;
  })();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-between items-center select-none">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            {editingCourseId ? "Edit Course" : "New Course"}
          </h3>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Course Title</label>
            <Input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g. Intro to Design Thinking"
              className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-blue-500 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Assign Challenges</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {challenges.map(c => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md">
                  <input
                    type="checkbox"
                    checked={courseChallenges.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) setCourseChallenges([...courseChallenges, c.id]);
                      else setCourseChallenges(courseChallenges.filter(id => id !== c.id));
                    }}
                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {c.title}
                </label>
              ))}
              {challenges.length === 0 && (
                <p className="text-xs text-zinc-500 italic">No challenges available to assign.</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-end gap-3">
          {canDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              className="mr-auto cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Course
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!courseTitle.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingCourseId ? "Save Changes" : "Save Course"}
          </Button>
        </div>
      </div>
    </div>
  );
}
