import React from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export const EMPATHY_MAP = [
  { title: "SAYS", color: "border-blue-500/30", items: ["I don't have time to sort trash", "The bins are confusing"] },
  { title: "THINKS", color: "border-purple-500/30", items: ["Why isn't this automated?", "Someone else will do it"] },
  { title: "DOES", color: "border-emerald-500/30", items: ["Throws everything in nearest bin", "Uses reusable bottles"] },
  { title: "FEELS", color: "border-rose-500/30", items: ["Guilty when using plastic", "Rushed between classes"] },
];

export default function EmpathyMapCanvas({ isReadOnly }) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full content-start">
      {EMPATHY_MAP.map((quadrant, i) => (
        <Card key={i} className={`bg-zinc-50 dark:bg-zinc-900/50 border ${quadrant.color} shadow-sm rounded-xl`}>
          <CardHeader className="pb-2 pt-4 px-4 border-b border-zinc-200 dark:border-zinc-800/30 select-none">
            <CardTitle className="text-xs font-bold tracking-widest text-zinc-500 dark:text-zinc-400">{quadrant.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {quadrant.items.map((item, idx) => (
              <div key={idx} className="text-sm text-zinc-800 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 leading-snug">
                "{item}"
              </div>
            ))}
            {!isReadOnly && (
              <button className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-350 flex items-center mt-2 font-medium transition-colors cursor-pointer">
                <Plus className="h-3 w-3 mr-1" /> Add note
              </button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
