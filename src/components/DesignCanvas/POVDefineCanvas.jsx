import React from "react";
import { Target } from "lucide-react";
import { Input } from "../ui/input";

export default function POVDefineCanvas({ isReadOnly }) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full mt-4">
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2 select-none">
          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Problem Statement (POV)
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-550 dark:text-zinc-400 select-none">USER (Who)</label>
            <Input disabled={isReadOnly} className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-850 dark:text-zinc-100 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700" placeholder="e.g., A busy college student..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-555 dark:text-zinc-400 select-none">NEEDS (What)</label>
            <Input disabled={isReadOnly} className="bg-white dark:bg-zinc-955 border-zinc-200 dark:border-zinc-800 text-zinc-850 dark:text-zinc-100 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700" placeholder="e.g., Needs a quick way to recycle..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-555 dark:text-zinc-400 select-none">INSIGHT (Why)</label>
            <textarea 
              disabled={isReadOnly}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-850 dark:text-zinc-100 p-3 text-sm focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 outline-none min-h-[100px] disabled:opacity-80" 
              placeholder="e.g., Because they feel guilty but prioritize getting to class on time..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
