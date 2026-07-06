import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

// Max number of entries allowed per list field (goals / frustrations / needs).
const MAX_LIST_ITEMS = 4;

// An editor for a list field rendered as separate input rows. The "+" button adds an
// empty row (up to MAX_LIST_ITEMS); whatever is typed is read on Save — no need to
// "commit" each row. `values` always holds at least one row.
function FieldListEditor({ label, values, onChange, placeholder, accent }) {
  const updateRow = (idx, val) => {
    const next = [...values];
    next[idx] = val;
    onChange(next);
  };

  const addRow = () => {
    if (values.length >= MAX_LIST_ITEMS) return;
    onChange([...values, ""]);
  };

  const removeRow = (idx) => {
    const next = values.filter((_, i) => i !== idx);
    onChange(next.length ? next : [""]); // always keep at least one row to type in
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        {label}
      </Label>
      <div className="space-y-2">
        {values.map((value, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`h-6 w-1 shrink-0 rounded-full ${accent}`} />
            <Input
              value={value}
              onChange={(e) => updateRow(idx, e.target.value)}
              placeholder={placeholder}
              className="h-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="p-1.5 shrink-0 text-zinc-400 hover:text-rose-500 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                aria-label="Remove row"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {values.length < MAX_LIST_ITEMS && (
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another
        </button>
      )}
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
  // List fields always keep at least one (possibly empty) row for typing.
  const [goals, setGoals] = useState(initialPersona?.goals?.length ? initialPersona.goals : [""]);
  const [frustrations, setFrustrations] = useState(initialPersona?.frustrations?.length ? initialPersona.frustrations : [""]);
  const [needs, setNeeds] = useState(initialPersona?.needs?.length ? initialPersona.needs : [""]);
  const [error, setError] = useState("");

  const handleSave = () => {
    // Read the typed rows now (Save is what commits them), dropping any blank rows.
    const cleanGoals = goals.map((s) => s.trim()).filter(Boolean);
    const cleanFrustrations = frustrations.map((s) => s.trim()).filter(Boolean);
    const cleanNeeds = needs.map((s) => s.trim()).filter(Boolean);

    // Every field is required.
    if (!name.trim()) return setError("Give the persona a name.");
    if (!age.trim()) return setError("Add the persona's age.");
    if (!role.trim()) return setError("Add the persona's role or occupation.");
    if (!bio.trim()) return setError("Add a short background for the persona.");
    if (cleanGoals.length === 0) return setError("Add at least one goal.");
    if (cleanFrustrations.length === 0) return setError("Add at least one frustration.");
    if (cleanNeeds.length === 0) return setError("Add at least one need.");

    onSave({
      // Preserve identity when editing; mint a new one when adding.
      id: initialPersona?.id || (crypto.randomUUID?.() ?? `persona-${Date.now()}`),
      createdAt: initialPersona?.createdAt || new Date().toISOString(),
      name: name.trim(),
      age: age.trim(),
      role: role.trim(),
      bio: bio.trim(),
      goals: cleanGoals,
      frustrations: cleanFrustrations,
      needs: cleanNeeds,
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

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">All fields are required.</p>

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
                onChange={(e) => { setAge(e.target.value); setError(""); }}
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
              onChange={(e) => { setRole(e.target.value); setError(""); }}
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
              onChange={(e) => { setBio(e.target.value); setError(""); }}
              rows={3}
              placeholder="A short narrative about who they are and their context..."
              className="w-full rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 p-2.5 resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <FieldListEditor
            label="Goals"
            values={goals}
            onChange={(v) => { setGoals(v); setError(""); }}
            placeholder="What are they trying to achieve?"
            accent="bg-emerald-400 dark:bg-emerald-500"
          />
          <FieldListEditor
            label="Frustrations"
            values={frustrations}
            onChange={(v) => { setFrustrations(v); setError(""); }}
            placeholder="What gets in their way?"
            accent="bg-rose-400 dark:bg-rose-500"
          />
          <FieldListEditor
            label="Needs"
            values={needs}
            onChange={(v) => { setNeeds(v); setError(""); }}
            placeholder="What do they need to succeed?"
            accent="bg-blue-400 dark:bg-blue-500"
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
