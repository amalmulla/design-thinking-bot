import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Check, Edit2 } from "lucide-react";

export const DEFAULT_STICKY_NOTES = [];

const COLORS = [
  "bg-amber-100 dark:bg-yellow-500/20 border-amber-200 dark:border-yellow-500/30 text-amber-900 dark:text-yellow-100",
  "bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-100",
  "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-100",
  "bg-rose-100 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-100",
  "bg-purple-100 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-100",
];

export default function IdeationStickyNotes({ isReadOnly, notes = [], onUpdate }) {
  const activeNotes = Array.isArray(notes) ? notes : [];
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const textareaRef = useRef(null);
  
  useEffect(() => {
    if ((isAdding || editingId) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAdding, editingId]);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    
    if (editingId) {
      const updated = activeNotes.map((n) => 
        n.id === editingId ? { ...n, text: newNoteText.trim(), color: selectedColor } : n
      );
      onUpdate && onUpdate(updated);
      setEditingId(null);
    } else {
      const newNote = {
        id: Date.now().toString(),
        text: newNoteText.trim(),
        color: selectedColor
      };
      const updated = [...activeNotes, newNote];
      onUpdate && onUpdate(updated);
      setIsAdding(false);
    }
    setNewNoteText("");
  };

  const handleRemoveNote = (id) => {
    const updated = activeNotes.filter((note) => note.id !== id);
    onUpdate && onUpdate(updated);
  };
  
  const startEditing = (note) => {
    if (isReadOnly) return;
    setEditingId(note.id);
    setNewNoteText(note.text);
    setSelectedColor(note.color);
    setIsAdding(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-full content-start">
      {activeNotes.map((note) => {
        if (editingId === note.id) {
          return (
            <div 
              key={`edit-${note.id}`}
              className={`${selectedColor} border p-5 rounded-xl shadow-sm aspect-square flex flex-col justify-between`}
            >
              <textarea
                ref={textareaRef}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type your idea..."
                className="w-full bg-transparent text-sm font-semibold placeholder:text-zinc-400 dark:placeholder:text-zinc-550 border-none outline-none resize-none flex-1 leading-relaxed"
                rows={3}
              />
              <div className="flex flex-col gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                <div className="flex gap-1.5 justify-start select-none">
                  {COLORS.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`h-4.5 w-4.5 rounded-full border border-black/10 dark:border-white/10 ${color.split(" ")[0]} cursor-pointer ${
                        selectedColor === color ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-950" : ""
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-end gap-2.5">
                  <button 
                    onClick={() => { setEditingId(null); setNewNoteText(""); }}
                    className="text-xs font-semibold text-zinc-550 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddNote}
                    className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 p-1 px-2.5 rounded text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div 
            key={note.id} 
            onClick={() => startEditing(note)}
            className={`${note.color} border p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer aspect-square flex flex-col justify-between relative group`}
          >
            <p className="font-semibold text-sm leading-relaxed flex-1 select-text">
              {note.text}
            </p>
            {!isReadOnly && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleRemoveNote(note.id); }}
                className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}

      {isAdding && (
        <div 
          className={`${selectedColor} border p-5 rounded-xl shadow-sm aspect-square flex flex-col justify-between`}
        >
          <textarea
            ref={textareaRef}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Type your idea..."
            className="w-full bg-transparent text-sm font-semibold placeholder:text-zinc-400 dark:placeholder:text-zinc-550 border-none outline-none resize-none flex-1 leading-relaxed"
            rows={3}
          />
          <div className="flex flex-col gap-3 pt-2 border-t border-black/5 dark:border-white/5">
            {/* Color Selector */}
            <div className="flex gap-1.5 justify-start select-none">
              {COLORS.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(color)}
                  className={`h-4.5 w-4.5 rounded-full border border-black/10 dark:border-white/10 ${color.split(" ")[0]} cursor-pointer ${
                    selectedColor === color ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-950" : ""
                  }`}
                />
              ))}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button 
                onClick={() => { setIsAdding(false); setNewNoteText(""); }}
                className="text-xs font-semibold text-zinc-550 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddNote}
                className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 p-1 px-2.5 rounded text-xs font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReadOnly && !isAdding && (
        <button 
          onClick={() => { setIsAdding(true); setSelectedColor(COLORS[Math.floor(Math.random() * COLORS.length)]); }}
          className="aspect-square border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 gap-2 cursor-pointer"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-semibold">Add Idea</span>
        </button>
      )}
    </div>
  );
}
