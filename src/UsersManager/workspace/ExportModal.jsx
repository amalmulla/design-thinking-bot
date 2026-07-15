import React from "react";
import { Button } from "../../components/ui/button";

/**
 * Export configuration dialog: pick the scope (full / chat / canvases), the
 * format (PDF / Markdown / JSON), and optionally attach a fresh AI-generated
 * progress summary. The actual export runs in lib/projectExport.js.
 */
export default function ExportModal({
  isOpen,
  exportScope, setExportScope,
  exportFormat, setExportFormat,
  includeAISummary, setIncludeAISummary,
  isExporting,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Export Project Data</h3>

        <div className="space-y-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Content to Export</label>
            <select
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              <option value="full">Full Project (Chat + Canvases)</option>
              <option value="chat">Chat Conversation Only</option>
              <option value="canvas">Canvases Only</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              <option value="pdf">PDF Document</option>
              <option value="md">Markdown File (.md)</option>
              <option value="json">Raw JSON</option>
            </select>
          </div>

          {exportFormat !== 'json' && (
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="includeSummary"
                checked={includeAISummary}
                onChange={(e) => setIncludeAISummary(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="includeSummary" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                Include AI Progress Summary
                <p className="text-xs font-normal text-zinc-500 dark:text-zinc-400 mt-0.5">Generates a fresh summary of the student's progress and insights (takes a few seconds).</p>
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isExporting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>
    </div>
  );
}
