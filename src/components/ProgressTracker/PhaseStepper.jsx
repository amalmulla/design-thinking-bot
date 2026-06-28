import React from "react";
import { Users, Target, Lightbulb, Layers, FlaskConical, Lock } from "lucide-react";

export const DESIGN_PHASES = [
  { id: "empathize", label: "Empathize", icon: Users, color: "text-rose-600 dark:text-rose-400" },
  { id: "define", label: "Define", icon: Target, color: "text-blue-600 dark:text-blue-400" },
  { id: "ideate", label: "Ideate", icon: Lightbulb, color: "text-amber-500 dark:text-yellow-400" },
  { id: "prototype", label: "Prototype", icon: Layers, color: "text-purple-600 dark:text-purple-400" },
  { id: "test", label: "Test", icon: FlaskConical, color: "text-emerald-600 dark:text-emerald-400" },
];

export default function PhaseStepper({ currentPhase, setCurrentPhase, unlockedPhases = ['empathize'] }) {
  return (
    <div className="h-16 shrink-0 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 overflow-x-auto no-scrollbar bg-white dark:bg-zinc-950">
      <div className="flex items-center w-full max-w-4xl mx-auto justify-between">
        {DESIGN_PHASES.map((phase, index) => {
          const Icon = phase.icon;
          const isActive = currentPhase === phase.id;
          
          // Determine if a step is "past"
          const currentIndex = DESIGN_PHASES.findIndex(p => p.id === currentPhase);
          const isCompleted = index < currentIndex;

          const isUnlocked = unlockedPhases.includes(phase.id);

          return (
            <React.Fragment key={phase.id}>
              <button
                onClick={() => {
                  if (isUnlocked) setCurrentPhase(phase.id);
                }}
                disabled={!isUnlocked}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                  isActive 
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold cursor-default" 
                    : isUnlocked 
                      ? "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 cursor-pointer"
                      : "text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-60"
                }`}
              >
                <div className={`p-1.5 rounded-md ${isActive ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}>
                  {!isUnlocked ? (
                    <Lock className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                  ) : (
                    <Icon className={`h-4 w-4 ${isActive ? phase.color : (isCompleted ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400 dark:text-zinc-650')}`} />
                  )}
                </div>
                <span className="text-sm font-semibold tracking-wide">{phase.label}</span>
              </button>
              {/* Connector line between steps */}
              {index < DESIGN_PHASES.length - 1 && (
                <div className="flex-1 max-w-[40px] mx-2 h-[1px] bg-zinc-200 dark:bg-zinc-800" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
