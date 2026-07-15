import { Users, Target, Lightbulb, Layers, FlaskConical } from "lucide-react";

// Central config for the five Design Thinking phases: display label, icon, and the
// Tailwind color classes used to render phase badges/cards consistently across screens.
export const PHASE_MAP = {
  empathize: { label: "Empathize", icon: Users, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
  define: { label: "Define", icon: Target, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  ideate: { label: "Ideate", icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  prototype: { label: "Prototype", icon: Layers, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  test: { label: "Test", icon: FlaskConical, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

/**
 * Computes how complete the project's CURRENT phase is (0-100), based on how many
 * of that phase's canvas sections the student has filled in.
 *
 * @param {Object} project - Project with `currentPhase` and `canvasData`
 * @returns {number} Rounded completion percentage for the active phase
 */
export const calculatePhaseProgress = (project) => {
  if (!project || !project.canvasData) return 0;
  const phase = project.currentPhase?.toLowerCase();
  const data = project.canvasData;
  let percent;

  switch (phase) {
    case 'empathize': {
      const e = data.empathize || {};
      let filled = 0;
      if (e.says?.length > 0) filled++;
      if (e.thinks?.length > 0) filled++;
      if (e.does?.length > 0) filled++;
      if (e.feels?.length > 0) filled++;
      percent = (filled / 4) * 100;
      break;
    }
    case 'define': {
      const d = data.define || {};
      let filled = 0;
      if (d.user?.trim()) filled++;
      if (d.needs?.trim()) filled++;
      if (d.insight?.trim()) filled++;
      percent = (filled / 3) * 100;
      break;
    }
    case 'ideate': {
      const i = Array.isArray(data.ideate) ? data.ideate : [];
      percent = Math.min((i.length / 3) * 100, 100);
      break;
    }
    case 'prototype': {
      const p = Array.isArray(data.prototypeData) ? data.prototypeData : (Array.isArray(data.prototype) ? data.prototype : []);
      percent = p.length > 0 ? 100 : 0;
      break;
    }
    case 'test': {
      const t = data.test || {};
      let filled = 0;
      if (t.worked?.trim()) filled++;
      if (t.improved?.trim()) filled++;
      if (t.questions?.trim()) filled++;
      if (t.ideas?.trim()) filled++;
      percent = (filled / 4) * 100;
      break;
    }
    default:
      percent = 0;
  }
  return Math.round(percent);
};
