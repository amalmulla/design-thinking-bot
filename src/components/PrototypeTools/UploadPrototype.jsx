import React from "react";
import { Upload } from "lucide-react";
import { Button } from "../ui/button";

export default function UploadPrototype({ isReadOnly }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-500">
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full mb-4">
        <Upload className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 select-none">Upload Prototype Artifacts</h3>
      <p className="text-xs mt-1 text-center max-w-sm text-zinc-500 dark:text-zinc-400 select-none">
        Drag and drop wireframes, photos of physical models, or links to digital prototypes here.
      </p>
      <Button disabled={isReadOnly} variant="outline" className="mt-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300">
        {isReadOnly ? "File Upload Disabled" : "Browse Files"}
      </Button>
    </div>
  );
}
