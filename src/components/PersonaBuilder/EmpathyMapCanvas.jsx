import React, { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export default function EmpathyMapCanvas({ 
  isReadOnly, 
  says = [], 
  thinks = [], 
  does = [], 
  feels = [], 
  onUpdate 
}) {
  const [activeInputQuadrant, setActiveInputQuadrant] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");

  const quadrants = [
    { key: "says", title: "SAYS", color: "border-blue-500/30", items: says },
    { key: "thinks", title: "THINKS", color: "border-purple-500/30", items: thinks },
    { key: "does", title: "DOES", color: "border-emerald-500/30", items: does },
    { key: "feels", title: "FEELS", color: "border-rose-500/30", items: feels },
  ];

  const handleAddNote = (key, currentItems) => {
    if (!newNoteText.trim()) return;
    const updated = [...currentItems, newNoteText.trim()];
    onUpdate && onUpdate(key, updated);
    setNewNoteText("");
    setActiveInputQuadrant(null);
  };

  const handleRemoveNote = (key, currentItems, indexToRemove) => {
    const updated = currentItems.filter((_, idx) => idx !== indexToRemove);
    onUpdate && onUpdate(key, updated);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 content-start">
      {quadrants.map((quadrant) => (
        <Card key={quadrant.key} className={`bg-zinc-50 dark:bg-zinc-900/50 border ${quadrant.color} shadow-sm rounded-xl flex flex-col`}>
          <CardHeader className="pb-2 pt-4 px-4 border-b border-zinc-200 dark:border-zinc-800/30 select-none flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold tracking-widest text-zinc-500 dark:text-zinc-400">{quadrant.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              {quadrant.items.length === 0 ? (
                <p className="text-xs italic text-zinc-400 dark:text-zinc-650 py-2 select-none">No observations added yet.</p>
              ) : (
                quadrant.items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="text-sm text-zinc-800 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 leading-snug relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <span className="pr-4">"{item}"</span>
                    {!isReadOnly && (
                      <button 
                        onClick={() => handleRemoveNote(quadrant.key, quadrant.items, idx)}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {!isReadOnly && (
              <div className="pt-2">
                {activeInputQuadrant === quadrant.key ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Type observation..."
                      className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded px-2.5 py-1 text-xs text-zinc-850 dark:text-zinc-150 outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddNote(quadrant.key, quadrant.items);
                      }}
                      autoFocus
                    />
                    <button 
                      onClick={() => handleAddNote(quadrant.key, quadrant.items)}
                      className="p-1 text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-350 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => { setActiveInputQuadrant(null); setNewNoteText(""); }}
                      className="p-1 text-zinc-400 hover:text-zinc-550 dark:hover:text-zinc-350 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveInputQuadrant(quadrant.key); setNewNoteText(""); }}
                    className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-350 flex items-center font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add note
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
