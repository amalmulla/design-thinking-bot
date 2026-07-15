import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./button";

/**
 * Generic destructive-action confirmation dialog, shared across the app
 * (delete project, kick student, leave course, ...).
 */
export default function ConfirmModal({ isOpen, title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-500" />
            {title}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-medium"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
