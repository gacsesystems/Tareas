import React from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { AlertTriangle, Zap, Target, Circle, Star, Brain, Lightbulb, Clock } from "lucide-react";

/* =======================
 * Tipos livianos
 * ======================= */
export type Estado =
  | "backlog" | "siguiente" | "hoy"
  | "en_curso" | "en_revision" | "bloqueada" | "hecha";

export type AnyTask = Record<string, any>;

/* =======================
 * Fechas / Duraciones
 * ======================= */
export const daysDiff = (d?: string | null) => {
  if (!d) return null;
  const A = new Date(new Date(d).toDateString()).getTime();
  const B = new Date(new Date().toDateString()).getTime();
  return Math.floor((A - B) / (1000 * 60 * 60 * 24));
};

export const sinceDays = (d?: string | null) => {
  if (!d) return null;
  const ms = Date.now() - new Date(d).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

export const hoursLeft = (until?: string | null) => {
  if (!until) return null;
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return null;
  return Math.ceil(ms / (1000 * 60 * 60));
};

/* =======================
 * SLA / Due / Overrun
 * ======================= */
export const slaBadge = (t: AnyTask) => {
  const d = daysDiff(t.sla_fecha);
  if (d === null) return { label: "sin SLA", className: "bg-gray-100 text-gray-700" };
  if (d < 0) return { label: "SLA vencido", className: "bg-red-100 text-red-700" };
  if (d <= 2) return { label: `SLA ${d}d`, className: "bg-amber-100 text-amber-800" };
  return { label: `SLA OK (${d}d)`, className: "bg-emerald-100 text-emerald-800" };
};

export const dueBadge = (t: AnyTask) => {
  const d = daysDiff(t.fecha_limite);
  if (d === null) return null;
  if (d < 0) return { label: `Vencida ${Math.abs(d)}d`, className: "bg-red-100 text-red-700" };
  if (d === 0) return { label: "Hoy", className: "bg-amber-100 text-amber-800" };
  return { label: `D-${d}`, className: "bg-blue-100 text-blue-800" };
};

export const hasOverrun = (t: AnyTask) => {
  const est = Math.max(0, (t.pomos_estimados ?? 0) * 25);
  if (est === 0) return false;
  const real = Math.max(0, t.tiempo_total_min ?? 0);
  return real > est * 1.3;
};

/* =======================
 * Eisenhower
 * ======================= */
export const getQuadrant = (t: AnyTask) => {
  const imp = !!t.eisen_importante;
  const urg = !!t.eisen_urgente;
  if (imp && urg) return "Q1";
  if (imp && !urg) return "Q2";
  if (!imp && urg) return "Q3";
  return "Q4";
};

export const quadrantColor = (q: string) => {
  switch (q) {
    case "Q1": return "bg-red-100 text-red-800 border-red-200";
    case "Q2": return "bg-green-100 text-green-800 border-green-200";
    case "Q3": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/* =======================
 * Labels relaciones
 * ======================= */
export const projectLabel = (t: AnyTask) => t.proyecto?.nombre ?? (t.proyecto_id ? `Proyecto #${t.proyecto_id}` : null);
export const areaLabel = (t: AnyTask) => t.area?.nombre ?? (t.area_id ? `Área #${t.area_id}` : null);
export const ctxLabel = (t: AnyTask) => t.contexto?.nombre ?? (t.contexto_id ? `Ctx #${t.contexto_id}` : null);
export const respLabel = (t: AnyTask) => t.responsable?.nombre ?? (t.responsable_id ? `Resp #${t.responsable_id}` : null);

export const initials = (name?: string | null) =>
  name ? name.split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase() : "?";

/* =======================
 * Wrappers de acciones (rutas)
 * ======================= */
export const toggleComplete = (id: number) =>
  router.post(route("tareas.quick.toggle-complete", id), {}, { preserveScroll: true });

export const addInteres = (id: number) =>
  router.post(route("tareas.interes", id), {}, { preserveScroll: true });

export const logPomodoro = (id: number, minutos = 25) =>
  router.post(route("tareas.pomodoro", id), { minutos }, { preserveScroll: true });

export const applyBoost24h = (id: number, factor = 1.15) =>
  router.post(route("tareas.boost", id), { factor }, { preserveScroll: true });

export const moveEstado = (t: AnyTask, newEstado: Estado) =>
  router.put(route("tareas.update", t.id), { ...t, estado: newEstado }, { preserveScroll: true });

export const reassignTo = (t: AnyTask, responsable_id: number) =>
  router.put(route("tareas.update", t.id), { ...t, responsable_id }, { preserveScroll: true });

export const saveTitle = (t: AnyTask, title: string) =>
  router.put(route("tareas.update", t.id), { ...t, titulo: title.trim() }, { preserveScroll: true });

/* =======================
 * UI mini-components reutilizables
 * ======================= */
export const PriorityIcon = ({ p }: { p?: string }) => {
  switch (p) {
    case "urgent": return <AlertTriangle className="h-3 w-3 text-red-500" />;
    case "high": return <Zap className="h-3 w-3 text-orange-500" />;
    case "medium": return <Target className="h-3 w-3 text-yellow-500" />;
    case "low": return <Circle className="h-3 w-3 text-green-500" />;
    default: return <Circle className="h-3 w-3 text-gray-400" />;
  }
};

export const TypeIcon = ({ t, isFrog, isRock }: {
  t?: string; isFrog?: boolean; isRock?: boolean;
}) => {
  if (isFrog) return <Star className="h-3 w-3 text-yellow-500" />;
  if (isRock) return <Brain className="h-3 w-3 text-purple-500" />;
  if (t === "quick_win") return <Lightbulb className="h-3 w-3 text-blue-500" />;
  return <Circle className="h-3 w-3 text-gray-400" />;
};

export const PomosDots = ({
  done = 0, est = 0, onAdd,
}: { done?: number; est?: number; onAdd?: () => void }) => {
  const total = Math.max(est, 4);
  const dots = Array.from({ length: total }).map((_, i) => (i < (done ?? 0) ? "●" : "○")).join("");
  return (
    <button onClick={onAdd} className="font-mono text-xs" title="+1 pomo" >
      <span className="inline-flex items-center gap-1" >
        <Clock className="h-3 w-3" />
        {dots}
      </span>
    </button>
  );
};