import React from "react";
import { Plus } from "lucide-react";

export const STICKY_NOTES = [
  { id: 1, text: "Smart bins with AI sorting", color: "bg-amber-100 dark:bg-yellow-500/20 border-amber-200 dark:border-yellow-500/30 text-amber-900 dark:text-yellow-100" },
  { id: 2, text: "Gamified recycling app for students", color: "bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-100" },
  { id: 3, text: "Mandatory campus composting", color: "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-100" },
];

export default function IdeationStickyNotes({ isReadOnly }) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full content-start">
      {STICKY_NOTES.map((note) => (
        <div 
          key={note.id} 
          className={`${note.color} border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default aspect-square flex flex-col`}
        >
          <p className="font-semibold text-sm leading-relaxed flex-1">{note.text}</p>
        </div>
      ))}
      {!isReadOnly && (
        <button className="aspect-square border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 gap-2 cursor-pointer">
          <Plus className="h-6 w-6" />
          <span className="text-sm font-semibold">Add Idea</span>
        </button>
      )}
    </div>
  );
}
