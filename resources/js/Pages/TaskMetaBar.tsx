import * as React from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { AlertTriangle, Clock, Minus, Plus, User2 } from "lucide-react";

type Persona = {
  id: number;
  nombre: string;
  avatar_url?: string | null;
};

type Task = {
  id: number;
  titulo: string;
  interest_hits: number;
  interest_last_at?: string | null;
  sla_fecha?: string | null;
  responsable?: Persona | null;
  responsable_id?: number | string | null;
  delegation_level_applied?: number | null; // 1..5
  delegation_level_rec?: number | null;     // 1..5
  pomos_estimados?: number | null;
  pomos_realizados?: number | null;
  bloqueada?: boolean;
  tiempo_total_min?: number | null;
};

type Props = {
  task: Task;
  onDivide?: (task: Task) => void;
  onReestimate?: (task: Task) => void;
};

export function TaskMetaBar({ task, onDivide, onReestimate }: Props) {
  const daysSince = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - d) / (1000 * 60 * 60 * 24)));
  };

  const daysUntil = (iso?: string | null) => {
    if (!iso) return null;
    const end = new Date(iso).getTime();
    const now = Date.now();
    return Math.floor((end - now) / (1000 * 60 * 60 * 24)); // puede ser negativo
  };

  // --- 👀 Interés
  const lastAskDays = daysSince(task.interest_last_at);
  const incInterest = (delta: number) => {
    // Ajusta este endpoint a tu controlador: espera { delta: +1|-1 }
    router.post(route("tareas.interes", task.id), { delta }, { preserveScroll: true });
  };

  // --- SLA semáforo
  const dToSLA = daysUntil(task.sla_fecha);
  let slaColor: "green" | "amber" | "red" | null = null;
  if (dToSLA !== null) {
    if (dToSLA < 0) slaColor = "red";          // vencido
    else if (dToSLA <= 2) slaColor = "red";    // ≤2 días → rojo + sugerir ping
    else if (dToSLA <= 7) slaColor = "amber";  // 3–7 días → ámbar
    else slaColor = "green";                   // >7 días → verde
  }

  // --- Delegación
  const level = task.delegation_level_applied ?? task.delegation_level_rec ?? null;

  // --- Overrun >30%
  const est = Math.max(0, task.pomos_estimados ?? 0);
  const done = Math.max(0, task.pomos_realizados ?? 0);
  const overrun = est > 0 ? done - est : 0;
  const isOverrun30 = est > 0 ? done > est * 1.3 : false;

  // --- Helpers UI
  const slaBadgeClass =
    slaColor === "red"
      ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300"
      : slaColor === "amber"
        ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300"
        : slaColor === "green"
          ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300"
          : "bg-muted text-muted-foreground";

  const initials = (name?: string) =>
    (name ?? "")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  function overrunRatio(t: Task) {
    const est = Number(t.pomos_estimados ?? 0);
    const done = Number(t.pomos_realizados ?? 0);
    if (!est) return 0;
    return (done - est) / Math.max(est, 1);
  }
  function slaSemaforoClass(sla?: string | null) {
    if (!sla) return "bg-gray-200 text-gray-800"; // sin SLA
    const diff = daysSince(sla);
    // rojo si vencido o hoy, ámbar si en ≤2 días, verde si >2 días
    if (diff !== null && diff <= 0) return "bg-red-100 text-red-800 border-red-200";
    const diasRest = Math.ceil((new Date(sla).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diasRest <= 0) return "bg-red-100 text-red-800 border-red-200";
    if (diasRest <= 2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  }
  function fmtDaysAgoLabel(iso?: string | null) {
    const d = daysSince(iso);
    if (d === null) return "—";
    if (d === 0) return "hoy";
    if (d === 1) return "ayer";
    return `hace ${d} días`;
  }

  const ratio = overrunRatio(task); // > 0.30 => alerta
  const slaClass = slaSemaforoClass(task.sla_fecha);

  // Overrun >30%
  const hasOverrun = (t: Task) => {
    const est = Math.max(0, (t.pomos_estimados ?? 0) * 25);
    if (est === 0) return false;
    const real = Math.max(0, t.tiempo_total_min ?? 0);
    return real > est * 1.3;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* FILA 1: Interés + SLA + Delegación */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 👀 Interés */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <span>👀</span>
            <span className="font-medium">{task.interest_hits ?? 0}</span>
          </Badge>

          <div className="flex items-center gap-1">
            <Button type="button" size="icon" variant="outline" className="h-6 w-6" onClick={() => incInterest(-1)} title="Disminuir interés">
              <Minus className="h-3 w-3" />
            </Button>
            <Button type="button" size="icon" variant="outline" className="h-6 w-6" onClick={() => incInterest(+1)} title="Aumentar interés">
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Badge “preguntaron hace X días” */}
          {lastAskDays !== null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    preguntaron hace {lastAskDays} {lastAskDays === 1 ? "día" : "días"}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="text-[12px]">
                  Último registro de interés: {new Date(task.interest_last_at as string).toLocaleString()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* SLA */}
        {dToSLA !== null && (
          <div className="flex items-center gap-2">
            <Badge className={slaBadgeClass + " text-xs border"}>
              <Clock className="h-3 w-3 mr-1" />
              {dToSLA < 0 ? `SLA vencido hace ${Math.abs(dToSLA)}d` : dToSLA === 0 ? "SLA hoy" : `SLA en ${dToSLA}d`}
            </Badge>

            {/* Auto-sugerencia de ping si ≤2 días */}
            {dToSLA <= 2 && (
              <Button size="sm" variant="outline" className="h-7 bg-transparent" onClick={() => {
                // Pon aquí tu acción de “ping”: ex. abrir modal, enviar notificación, etc.
                router.post(route("tareas.bloqueo", task.id), {
                  // ejemplo: podrías registrar un “follow-up” o comentario
                  // motive: "Recordatorio automático SLA ≤ 2 días"
                }, { preserveScroll: true });
              }}>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Sugerir ping
              </Button>
            )}
          </div>
        )}

        {/* Delegación (avatar + nivel) */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {task.responsable?.avatar_url ? (<AvatarImage src={task.responsable.avatar_url} alt={task.responsable?.nombre ?? "Responsable"} />) : (
                <AvatarFallback className="text-[10px]">{task.responsable?.nombre ? initials(task.responsable.nombre) : <User2 className="h-3.5 w-3.5" />}</AvatarFallback>)}
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[160px]">{task.responsable?.nombre ?? "Sin responsable"}</span>
          </div>

          {level && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[11px]">
                    Delegación: <span className="ml-1 font-semibold">N{level}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="text-[12px]">
                  {task.delegation_level_applied ? "Nivel aplicado" : "Nivel recomendado (aplica si lo confirmas)"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* FILA 2: Overrun >30% (sugerir dividir o re-estimar) */}
      {isOverrun30 && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-yellow-900 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">
              Llevas {done} pomos vs {est} estimados (+{Math.round((overrun / Math.max(1, est)) * 100)}%). Sugerencia: dividir en subtareas o re-estimar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 bg-transparent" onClick={() => onDivide?.(task)}>Dividir</Button>
            <Button size="sm" variant="outline" className="h-7 bg-transparent" onClick={() => onReestimate?.(task)}>Re-estimar</Button>
          </div>
        </div>
      )}

      {hasOverrun(task) && (
        <div className="mt-2 text-[12px] rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-amber-800 flex items-center gap-2">
          ⚠️ Overrun &gt;30% vs estimado. Sugerido:
          <Button size="sm" variant="outline" onClick={() => /* abre modal subtareas */ onDivide?.(task)}>Dividir</Button>
          <Button size="sm" variant="outline" onClick={() => /* ui re-estimar */ onReestimate?.(task)}>Re-estimar</Button>
        </div>
      )}
    </div>
  );
}
