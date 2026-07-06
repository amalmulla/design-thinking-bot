import { useState } from "react";
import { Plus, Pencil, Trash2, UserSearch } from "lucide-react";
import { Button } from "../ui/button";
import PersonaForm from "./PersonaForm";

// Renders a compact list of chips for one persona attribute (goals/frustrations/needs).
function AttrRow({ title, items, accent }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span key={idx} className={`text-xs font-medium px-2 py-0.5 rounded-md border ${accent}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function PersonaCard({ persona, isReadOnly, onEdit, onDelete }) {
  const initials = (persona.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{persona.name}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {[persona.age, persona.role].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800 cursor-pointer"
              title="Edit persona"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800 cursor-pointer"
              title="Delete persona"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {persona.bio && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-snug">{persona.bio}</p>
      )}

      <AttrRow title="Goals" items={persona.goals} accent="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400" />
      <AttrRow title="Frustrations" items={persona.frustrations} accent="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400" />
      <AttrRow title="Needs" items={persona.needs} accent="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400" />
    </div>
  );
}

// Step 0 of the workspace: the student defines one or more personas before the
// Design Thinking phases unlock. `onUpdate` receives the full new personas array.
export default function PersonaPanel({ personas = [], isReadOnly, onUpdate }) {
  const [formState, setFormState] = useState(null); // null = closed; { persona } = open (persona null when adding)

  const openAdd = () => setFormState({ persona: null });
  const openEdit = (persona) => setFormState({ persona });
  const closeForm = () => setFormState(null);

  const handleSave = (persona) => {
    const existingIdx = personas.findIndex((p) => p.id === persona.id);
    const next = existingIdx >= 0
      ? personas.map((p) => (p.id === persona.id ? persona : p))
      : [...personas, persona];
    onUpdate(next);
    closeForm();
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this persona?")) return;
    onUpdate(personas.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-5 pb-4">
      {/* Intro / gating explainer */}
      <div className="flex items-start gap-3 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/30 p-4">
        <UserSearch className="h-5 w-5 shrink-0 text-indigo-500 dark:text-indigo-400 mt-0.5" />
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Who are you designing for?</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Add at least one persona before starting the five Design Thinking phases. Your personas give the
            AI facilitator real context, so it can push your thinking about each user throughout the project.
            {!isReadOnly && personas.length === 0 && " The phases stay locked until you add one."}
          </p>
        </div>
      </div>

      {personas.length === 0 && isReadOnly && (
        <p className="text-sm italic text-zinc-400 dark:text-zinc-500">No personas were added to this project.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            isReadOnly={isReadOnly}
            onEdit={() => openEdit(persona)}
            onDelete={() => handleDelete(persona.id)}
          />
        ))}
      </div>

      {!isReadOnly && (
        <Button
          onClick={openAdd}
          variant="outline"
          className="w-full border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Persona
        </Button>
      )}

      {formState && (
        <PersonaForm
          initialPersona={formState.persona}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
