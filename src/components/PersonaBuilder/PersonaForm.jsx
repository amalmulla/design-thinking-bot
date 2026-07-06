import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

// A small add/remove list editor used for goals, frustrations, and needs.
function ChipListEditor({ label, items, onChange, placeholder, accent }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${accent}`}
          >
            {item}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-current opacity-60 hover:opacity-100 cursor-pointer"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="h-9 shrink-0 border-zinc-200 dark:border-zinc-800 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Modal form for creating or editing a single persona.
// `initialPersona` is null when adding; otherwise the persona being edited.
export default function PersonaForm({ initialPersona, onSave, onCancel }) {
  const [name, setName] = useState(initialPersona?.name || "");
  const [age, setAge] = useState(initialPersona?.age || "");
  const [role, setRole] = useState(initialPersona?.role || "");
  const [bio, setBio] = useState(initialPersona?.bio || "");
  const [goals, setGoals] = useState(initialPersona?.goals || []);
  const [frustrations, setFrustrations] = useState(initialPersona?.frustrations || []);
  const [needs, setNeeds] = useState(initialPersona?.needs || []);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      setError("Give the persona a name.");
      return;
    }
    onSave({
      // Preserve identity when editing; mint a new one when adding.
      id: initialPersona?.id || (crypto.randomUUID?.() ?? `persona-${Date.now()}`),
      createdAt: initialPersona?.createdAt || new Date().toISOString(),
      name: name.trim(),
      age: age.trim(),
      role: role.trim(),
      bio: bio.trim(),
      goals,
      frustrations,
      needs,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {initialPersona ? "Edit Persona" : "New Persona"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="persona-name" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Name
              </Label>
              <Input
                id="persona-name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="e.g. Maya"
                className="h-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="persona-age" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Age
              </Label>
              <Input
                id="persona-age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 19"
                className="h-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="persona-role" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Role / Occupation
            </Label>
            <Input
              id="persona-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. First-year commuter student"
              className="h-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="persona-bio" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Background
            </Label>
            <textarea
              id="persona-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A short narrative about who they are and their context..."
              className="w-full rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 p-2.5 resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <ChipListEditor
            label="Goals"
            items={goals}
            onChange={setGoals}
            placeholder="What are they trying to achieve?"
            accent="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400"
          />
          <ChipListEditor
            label="Frustrations"
            items={frustrations}
            onChange={setFrustrations}
            placeholder="What gets in their way?"
            accent="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400"
          />
          <ChipListEditor
            label="Needs"
            items={needs}
            onChange={setNeeds}
            placeholder="What do they need to succeed?"
            accent="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold cursor-pointer"
          >
            {initialPersona ? "Save Changes" : "Add Persona"}
          </Button>
        </div>
      </div>
    </div>
  );
}
