import React from "react";
import { Target, Brain, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

/**
 * Shared create/edit modal:
 *  - Teacher: create or edit a Design Challenge (title + brief).
 *  - Student: start a new project, either from an enrolled course's challenge
 *    ("Course Project" path) or standalone ("Independent Project" path).
 *
 * All state lives in the Dashboard; this component only renders and delegates.
 */
export default function ProjectModal({
  isOpen,
  isTeacher,
  editingChallengeId,
  challenges,
  courses,
  newTitle, setNewTitle,
  newDesc, setNewDesc,
  projectPath, setProjectPath,
  selectedCourseId, setSelectedCourseId,
  selectedChallengeId, setSelectedChallengeId,
  onSaveChallenge,
  onDeleteChallenge,
  onCreateProject,
  onCancel,
}) {
  if (!isOpen) return null;

  // Teachers may only delete a challenge no team is working on.
  const canDeleteChallenge = isTeacher && editingChallengeId && (() => {
    const ec = challenges.find(c => c.id === editingChallengeId);
    return ec && ec.teamCount === 0;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md lg:max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-between items-center select-none">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            {isTeacher ? <Target className="h-5 w-5 text-indigo-500" /> : <Brain className="h-5 w-5 text-pink-500" />}
            {isTeacher ? (editingChallengeId ? "Edit Design Challenge" : "New Design Challenge") : "Start New Project"}
          </h3>
        </div>

        <div className="p-6 space-y-5">
          {isTeacher && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">
                Challenge Title
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Eco-Packaging Design"
                className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-blue-500 h-10"
              />
            </div>
          )}

          {isTeacher ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Brief & Objectives</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full h-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 text-zinc-800 dark:text-zinc-200 text-sm focus:ring-1 focus:ring-indigo-500 dark:focus:ring-zinc-700 outline-none resize-none"
                placeholder="Enter challenge description, constraints, and learning goals..."
              />
            </div>
          ) : (
            <>
              <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg mb-4">
                <button
                  onClick={() => setProjectPath("A")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${projectPath === "A" ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                  Course Project
                </button>
                <button
                  onClick={() => setProjectPath("B")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${projectPath === "B" ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                  Independent Project
                </button>
              </div>

              {projectPath === "B" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">
                    Project Title
                  </label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Smart Bins sorting system"
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-blue-500 h-10"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Enrolled Course</label>
                    {courses.length === 0 ? (
                      <p className="text-xs text-rose-500 font-semibold select-none">You are not enrolled in any courses.</p>
                    ) : (
                      <select
                        value={selectedCourseId}
                        onChange={(e) => {
                          setSelectedCourseId(e.target.value);
                          setSelectedChallengeId("");
                        }}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      >
                        <option value="">— Choose a course —</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Design Challenge</label>
                    {!selectedCourseId ? (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 italic select-none">Choose a course first to see its challenges.</p>
                    ) : (() => {
                      const course = courses.find(c => c.id === selectedCourseId);
                      const courseChalls = course ? challenges.filter(c => (course.challenges || []).includes(c.id)) : [];
                      if (courseChalls.length === 0) return <p className="text-xs text-rose-500 font-semibold select-none">This course has no challenges.</p>;

                      const selectedChallenge = courseChalls.find(c => c.id === selectedChallengeId);

                      return (
                        <div className="space-y-3">
                          <select
                            value={selectedChallengeId}
                            onChange={(e) => setSelectedChallengeId(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                          >
                            <option value="">— Choose a challenge —</option>
                            {courseChalls.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>

                          {selectedChallenge && selectedChallenge.description && (
                            <div className="p-3 bg-blue-50 dark:bg-zinc-800/50 rounded-lg border border-blue-100 dark:border-zinc-700/50">
                              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {selectedChallenge.description}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-end gap-3">
          {canDeleteChallenge && (
            <Button
              variant="destructive"
              onClick={onDeleteChallenge}
              className="mr-auto cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Challenge
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={isTeacher ? onSaveChallenge : onCreateProject}
            disabled={isTeacher ? !newTitle.trim() : (projectPath === "A" ? (!selectedCourseId || !selectedChallengeId) : !newTitle.trim())}
            className={`${isTeacher ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-sm h-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isTeacher ? (editingChallengeId ? "Save Changes" : "Save Challenge") : "Launch Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}
