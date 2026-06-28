import React, { useState } from "react";
import { Upload, Link, X, FileText, Globe } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function UploadPrototype({ isReadOnly, prototypes = [], onUpdate }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const handleAddPrototype = () => {
    if (!name.trim()) return;
    const newProto = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim() || "",
      url: url.trim() || "#"
    };
    const updated = [...prototypes, newProto];
    onUpdate && onUpdate(updated);
    setName("");
    setDescription("");
    setUrl("");
    setIsAdding(false);
  };

  const handleRemovePrototype = (id) => {
    const updated = prototypes.filter((p) => p.id !== id);
    onUpdate && onUpdate(updated);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto mt-4">
      
      {/* Upload/Add Control Area */}
      {!isReadOnly && (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          {!isAdding ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full mb-3 select-none">
                <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 select-none">Add Prototype Artifacts</h4>
              <p className="text-xs text-zinc-550 dark:text-zinc-450 mt-1 max-w-xs select-none">
                Link digital drafts (Figma, Canva) or list local mockup assets here.
              </p>
              <Button 
                onClick={() => setIsAdding(true)} 
                variant="outline" 
                size="sm"
                className="mt-4 bg-white dark:bg-zinc-950 border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold cursor-pointer"
              >
                + Add Link or File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 select-none">New Prototype Info</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 select-none">Name</label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Figma High-Fidelity Mockups"
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 select-none">Description (Optional)</label>
                  <Input 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Shows the user journey for the new feature"
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-zinc-500 select-none">URL (Optional)</label>
                  <Input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g. https://figma.com/file/..."
                    className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs h-9"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setIsAdding(false); setName(""); setDescription(""); setUrl(""); }}
                  className="text-xs font-medium text-zinc-550 hover:text-zinc-700 h-8"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPrototype} 
                  disabled={!name.trim()}
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8 disabled:opacity-50 cursor-pointer"
                >
                  Save Artifact
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Artifacts List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-450 dark:text-zinc-500 mb-1 select-none">
          Artifacts List ({prototypes.length})
        </h3>
        
        {prototypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-zinc-50/30 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl select-none">
            <p className="text-xs italic text-zinc-400 dark:text-zinc-650">No prototype files or links registered yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {prototypes.map((proto) => (
              <div 
                key={proto.id}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shrink-0 select-none">
                    {proto.url && proto.url !== "#" ? (
                      <Globe className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-zinc-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-250 truncate pr-2 select-text">{proto.name}</p>
                    {proto.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-sm break-words select-text">
                        {proto.description}
                      </p>
                    )}
                    {proto.url && proto.url !== "#" && (
                      <a 
                        href={proto.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] font-medium text-blue-500 hover:underline truncate block max-w-xs"
                      >
                        {proto.url}
                      </a>
                    )}
                  </div>
                </div>
                {!isReadOnly && (
                  <button 
                    onClick={() => handleRemovePrototype(proto.id)}
                    className="text-zinc-400 hover:text-rose-500 cursor-pointer p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
