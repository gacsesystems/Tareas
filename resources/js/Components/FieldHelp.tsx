import * as React from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/Components/ui/tooltip";

type FieldHelpProps = {
  label: string;
  fieldKey: keyof typeof QUESTIONS_ES;
  requiredMark?: boolean;
  className?: string;
};

export function FieldLabel({
  label,
  fieldKey,
  requiredMark = false,
  className = "",
}: FieldHelpProps) {
  const text = QUESTIONS_ES[fieldKey] ?? "";
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-sm font-medium">
        {label} {requiredMark ? <span className="text-red-500">*</span> : null}
      </span>
      {text ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" aria-label={`Ayuda: ${label}`} className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[320px] text-[12px] leading-4">
              {text}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}

/** ===== Preguntas guía (ES) ===== */
export const QUESTIONS_ES = {
  // Core / flujo
  estado:
    "¿En qué etapa real del flujo está? (¿Backlog, Siguiente, Hoy, En curso, En revisión, Hecha o Bloqueada?)",
  proyecto_id:
    "¿Pertenece a un proyecto/épica existente o debo crearlo ahora?",
  proyecto_etapa_id:
    "¿Esta tarea forma parte de una etapa específica del proyecto (Planificación, Desarrollo, QA…)?",

  // Fechas
  fecha:
    "¿Cuándo se pidió/creó esta tarea? (¿Necesito ajustar para reflejar realidad?)",
  fecha_limite:
    "¿Existe una fecha tope (vencimiento) externa o de compromiso con alguien?",
  sla_fecha:
    "¿Necesito una fecha de compromiso interna/anticipada distinta al due date para no llegar al límite?",
  seguimiento_proximo:
    "¿Cuándo debo volver a pinguear o revisar avances si depende de terceros?",

  // Asignación
  responsable_id:
    "¿Quién es la persona responsable de ejecutar o dar seguimiento a esta tarea?",

  // Clasificación
  tipo:
    "¿Qué naturaleza tiene? (¿Tarea normal, Bug, Mejora, Investigación o Consumo rutinario?)",
  area_id:
    "¿Bajo qué área de la organización cae (Empresa, Ventas, Finanzas, Personal…)?",
  contexto_id:
    "¿En qué contexto se puede ejecutar mejor (PC, Teléfono, Casa, Oficina…)?",

  // Metodologías
  moscow:
    "¿Es un Must (debe), Should (debería) o Could (podría) en este ciclo?",
  horizon:
    "¿En qué horizonte temporal impacta (H1 corto, H2 medio, H3 largo)?",
  eisen_importante:
    "¿Esto contribuye de forma importante a objetivos/KPIs significativos?",
  eisen_urgente:
    "¿Necesita atención inmediata por tiempo/compromisos? (urgente)",

  // MCDA (0–10)
  impacto:
    "Si completo esto, ¿cuánto mueve la aguja estratégica (0–10)?",
  valor:
    "¿Qué valor/ROI aporta (0–10)?",
  eficiencia:
    "¿Qué tan poco esfuerzo relativo requiere (0–10: menos esfuerzo = mayor puntaje)?",
  stakeholders:
    "¿Qué tan fuerte lo piden/apoyan stakeholders clave (0–10)?",
  urgencia_manual:
    "¿Necesito forzar una urgencia (0–10) distinta a la derivada por fechas? (Úsalo sólo si hace falta)",

  // KASH / hábitos / especiales
  kash:
    "¿Esta tarea refuerza Conocimiento, Actitud, Skill o Hábito clave ahora?",
  is_rock:
    "¿Es una Roca de esta semana (algo que sí o sí debo empujar)?",
  frog:
    "¿Es la Rana del día (lo más importante/temido que desbloquea todo)?",
  frog_date:
    "¿Para qué día exacto quiero comprometer esta Rana?",

  // Pomodoros / tiempo
  pomos_estimados:
    "¿Cuántos pomodoros (25’) estimo requerirá? (0 si no estoy seguro)",
  pomos_realizados:
    "¿Cuántos pomodoros llevo realmente ejecutados?",
  tiempo_total_min:
    "¿Cuántos minutos totales reales lleva? (tracking opcional)",

  // Orden / señales
  ranking:
    "¿Quiero empujar manualmente su posición en la lista (drag & drop)?",
  pareto:
    "¿Pertenece al 20% de tareas que generan el 80% del valor de este proyecto?",
  bloqueada:
    "¿Está detenida por un impedimento externo/insumo pendiente?",
  bloqueo_motivo:
    "¿Qué falta o quién bloquea el avance (motivo breve)?",

  // Boost & ajustes
  score_boost_until:
    "¿Quiero empujarla artificialmente por ~24h (ventana corta) para que suba en la lista?",
  score_boost_factor:
    "¿Con qué intensidad subirla temporalmente (p.ej. 1.10–1.20)?",
  riesgo_oportunidad:
    "¿Hay riesgo que me haga bajarla o una oportunidad para subirla (−0.20 a +0.20)?",

  // Dificultad / Kaizen
  dificultad:
    "¿El nivel de demanda cognitiva es bajo, medio (pensar/leer) o muy exigente (deep work)?",
  kaizen:
    "¿Es un micro-mejora del sistema que quiero cultivar como hábito diario?",

  // Delegación
  delegation_level_rec:
    "¿Qué nivel de delegación sugiere el sistema (1–5) dadas skill/will y criticidad?",
  delegation_level_applied:
    "¿Qué nivel aplicaré efectivamente (1–5)?",
  skill_override:
    "¿Esta tarea requiere o se beneficia de una skill distinta al baseline del responsable?",
  will_override:
    "¿La motivación/voluntad para esta tarea difiere del baseline del responsable?",

  // Actividad / interés
  ultimo_movimiento_at:
    "¿Hace cuánto no pasa nada con esta tarea? (sirve para decidir si pinguear)",
  interest_hits:
    "¿Cuántas veces me han preguntado por esta tarea (interés externo)?",
  interest_last_at:
    "¿Cuándo fue la última vez que preguntaron por esto?",


  family_friendly:
    "¿Es apropiada para hacer con la familia (p.ej. con niños)?",

  // Extra de contenido
  titulo:
    "¿Empieza con un verbo y describe claramente la acción a realizar?",
  detalle_md:
    "¿Qué contexto, criterios de listo y enlaces necesito para empezar sin fricción?",
  // ...continúa con el resto de campos que te dejé antes
} as const;