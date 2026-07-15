import React from "react";
import { Users, X, Crown, Trash2, LogOut, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";

/**
 * Project team management dialog: shows the owner and collaborators, lets the
 * owner invite teammates by email and remove members, and lets a collaborator
 * leave the project themselves.
 */
export default function TeamModal({
  isOpen,
  project,
  currentUserId,
  isProjectOwner,
  inviteEmail, setInviteEmail,
  teamError,
  teamBusy,
  onInvite,
  onRemoveMember,
  onClose,
}) {
  if (!isOpen || !project) return null;

  const memberRows = project.memberList
    || (project.members || []).map((id, i) => ({ id, name: (project.memberNames || [])[i] || 'Unknown' }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Project Team
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Collaborators can co-edit the canvases and chat on this project.
        </p>

        {/* Member list */}
        <div className="space-y-2 mb-5 max-h-56 overflow-y-auto">
          {/* Owner row */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <Crown className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {project.studentName || "Owner"}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-amber-600 border-amber-300/40 bg-amber-50 dark:bg-amber-950/30">
              Owner
            </Badge>
          </div>

          {/* Collaborators */}
          {memberRows.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2">{m.name}</span>
              {(isProjectOwner || m.id === currentUserId) && (
                <button
                  onClick={() => onRemoveMember(m.id)}
                  disabled={teamBusy}
                  className="p-1 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer disabled:opacity-50"
                  title={m.id === currentUserId ? "Leave project" : "Remove collaborator"}
                >
                  {m.id === currentUserId ? <LogOut className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                </button>
              )}
            </div>
          ))}

          {memberRows.length === 0 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic px-1 py-2 select-none">
              No collaborators yet. {isProjectOwner ? "Invite a teammate by email below." : "Only the owner can invite teammates."}
            </p>
          )}
        </div>

        {/* Invite form (owner only) */}
        {isProjectOwner && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">
              Invite a teammate
            </label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onInvite()}
                placeholder="student@email.com"
                className="flex-1 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-blue-500 h-10"
              />
              <Button
                onClick={onInvite}
                disabled={teamBusy || !inviteEmail.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed gap-1.5"
              >
                <UserPlus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        )}

        {teamError && (
          <p className="text-xs text-rose-500 font-medium mt-3">{teamError}</p>
        )}
      </div>
    </div>
  );
}
