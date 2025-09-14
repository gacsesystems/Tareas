import { useMemo, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Star, Clock, Calendar, GripVertical, Edit3, Play, UserRound, Zap, Plus } from "lucide-react";
import {
  // tipos
  AnyTask, Estado,
  // helpers de negocio/fechas/ui
  slaBadge, dueBadge, hasOverrun, getQuadrant, quadrantColor,
  projectLabel, areaLabel, ctxLabel, respLabel, initials,
  hoursLeft,
  // acciones backend
  toggleComplete, addInteres, logPomodoro, applyBoost24h,
  moveEstado, reassignTo, saveTitle,
  // mini-components ui
  PriorityIcon, TypeIcon, PomosDots,
} from "@/Components/task.helpers";
import TareasForm from "@/Pages/TareasForm";

type KanbanProps = {
  tareas: AnyTask[];
  columns?: { id: Estado; title: string; color?: string }[];
  ultimosResponsables?: { id: number; nombre: string }[];
};

const DEFAULT_COLUMNS: { id: Estado; title: string; color?: string }[] = [
  { id: "backlog", title: "Backlog", color: "bg-gray-50" },
  { id: "siguiente", title: "Siguiente", color: "bg-slate-50" },
  { id: "hoy", title: "Hoy", color: "bg-amber-50" },
  { id: "en_curso", title: "En Progreso", color: "bg-blue-50" },
  { id: "en_revision", title: "En Revisión", color: "bg-fuchsia-50" },
  { id: "bloqueada", title: "Esperando", color: "bg-orange-50" },
  { id: "hecha", title: "Completadas", color: "bg-green-50" },
];

export default function TareasKanban() {
  const { tareas = [], columns = DEFAULT_COLUMNS, ultimosResponsables = [] } = usePage<KanbanProps>().props;

  // Inline edit título
  const [editingId, setEditingId] = useState<number | null>(null);
  const [titleDraft, setTitleDraft] = useState("");

  // Agrupar por estado (basado en columnas visibles)
  const grouped = useMemo(() => {
    const map = new Map<Estado, AnyTask[]>();
    for (const c of columns) map.set(c.id, []);
    for (const t of tareas) {
      const est = (t.estado ?? "backlog") as Estado;
      if (!map.has(est)) map.set(est, []);
      map.get(est)!.push(t);
    }
    return map;
  }, [tareas, columns]);

  // Drag & Drop mínimo
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const onDragStart = (_e: React.DragEvent, id: number) => setDraggedId(id);
  const onDrop = (e: React.DragEvent, est: Estado) => {
    e.preventDefault();
    if (!draggedId) return;
    const t = tareas.find(x => x.id === draggedId);
    if (t && t.estado !== est) moveEstado(t, est);
    setDraggedId(null);
  };

  // Guardar título inline
  const commitTitle = async (t: AnyTask) => {
    const trimmed = titleDraft.trim();
    if (!trimmed) { setEditingId(null); return; }
    await saveTitle(t, trimmed);
    setEditingId(null);
  };

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const openCreate = () => { setEditingTask(null); setShowTaskForm(true); };
  const closeForm = () => { setShowTaskForm(false); setEditingTask(null); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Tablero Kanban</h1>
          <p className="text-muted-foreground">Drag & drop entre columnas. Acciones rápidas en cada tarjeta.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nueva Tarea</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {columns.map((col) => {
          const list = grouped.get(col.id) ?? [];
          return (
            <div
              key={col.id}
              className={`${col.color ?? "bg-gray-50"} rounded-lg p-4 min-h-[560px]`}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">{col.title}</h2>
                <Badge variant="secondary">{list.length}</Badge>
              </div>

              <div className="space-y-3">
                {list.map((task) => {
                  const q = getQuadrant(task);
                  const qClass = quadrantColor(q);
                  const sla = slaBadge(task);
                  const due = dueBadge(task);
                  const boostH = hoursLeft(task.score_boost_until);
                  const over = hasOverrun(task);

                  return (
                    <Card
                      key={task.id}
                      className={`cursor-move hover:shadow-md transition-shadow bg-white ${task.bloqueada ? "border-orange-300" : ""}`}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />

                          <div className="flex-1 space-y-2">
                            {/* Título + iconos + inline edit */}
                            <div className="flex items-center gap-2">
                              <TypeIcon t={task.tipo} isFrog={task.frog} isRock={task.is_rock} />

                              {editingId === task.id ? (
                                <input
                                  autoFocus
                                  className="text-sm font-medium border rounded px-1 py-0.5 w-full"
                                  value={titleDraft}
                                  onChange={(e) => setTitleDraft(e.target.value)}
                                  onBlur={() => commitTitle(task)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") commitTitle(task);
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                />
                              ) : (
                                <h3
                                  className={`font-medium text-sm leading-tight ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                  title={task.titulo}
                                >
                                  {task.titulo}
                                </h3>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-1"
                                onClick={() => { setEditingId(task.id); setTitleDraft(task.titulo ?? ""); }}
                                title="Editar título"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>

                              {/* Avatar responsable + reasignar rápido (3 últimos) */}
                              <div className="ml-auto flex items-center gap-1">
                                <div
                                  className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]"
                                  title={respLabel(task) ?? "—"}
                                >
                                  {initials(respLabel(task))}
                                </div>
                                {Array.isArray(ultimosResponsables) && ultimosResponsables.slice(0, 3).map(u => (
                                  <Button
                                    key={u.id}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-1"
                                    onClick={() => reassignTo(task, u.id)}
                                    title={`Reasignar a ${u.nombre}`}
                                  >
                                    <UserRound className="h-3 w-3" />
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Descripción breve si existe */}
                            {task.detalle_md && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{task.detalle_md}</p>
                            )}

                            {/* Chips principales */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Prioridad (si la usas) */}
                              <div className="flex items-center gap-1">
                                <PriorityIcon p={task.priority} />
                                <span className="text-[11px] capitalize">{task.priority ?? ""}</span>
                              </div>

                              {/* Pomos: puntos ●●○○ */}
                              <PomosDots
                                done={task?.pomos_realizados ?? 0}
                                est={task?.pomos_estimados ?? 0}
                                onAdd={() => logPomodoro(task.id, 25)}
                              />

                              {/* Score */}
                              {typeof task.score === "number" && (
                                <Badge variant="outline" className="text-[11px] font-mono">
                                  Score {task.score.toFixed(1)}
                                </Badge>
                              )}

                              {/* Eisenhower */}
                              <Badge variant="outline" className={`text-[11px] ${qClass}`}>{q}</Badge>

                              {/* SLA */}
                              <Badge variant="secondary" className={`text-[11px] ${sla.className}`}>{sla.label}</Badge>

                              {/* Due */}
                              {due && (
                                <Badge variant="outline" className={`text-[11px] ${due.className}`}>{due.label}</Badge>
                              )}

                              {/* Delegación */}
                              {(task.delegation_level_applied || task.delegation_level_rec) && (
                                <Badge variant="outline" className="text-[11px]">
                                  Lvl {task.delegation_level_applied ?? "—"}{task.delegation_level_rec ? ` (rec ${task.delegation_level_rec})` : ""}
                                </Badge>
                              )}

                              {/* Proyecto / Área / Contexto */}
                              {projectLabel(task) && (<Badge variant="outline" className="text-[11px]">{projectLabel(task)}</Badge>)}
                              {areaLabel(task) && (<Badge variant="outline" className="text-[11px]">{areaLabel(task)}</Badge>)}
                              {ctxLabel(task) && (<Badge variant="secondary" className="text-[11px]">{ctxLabel(task)}</Badge>)}

                              {/* Boost countdown */}
                              {boostH && (
                                <Badge variant="destructive" className="text-[11px]">Boost {boostH}h</Badge>
                              )}

                              {/* 👀 Interés */}
                              <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <span>👀 {task.interest_hits ?? 0}</span>
                                {task.interest_last_at && (
                                  <Badge variant="outline" className="text-[10px]">
                                    hace {Math.max(0, Math.floor((Date.now() - new Date(task.interest_last_at).getTime()) / (1000 * 60 * 60 * 24)))}d
                                  </Badge>
                                )}
                                <Button size="sm" variant="ghost" className="h-5 px-1" onClick={() => addInteres(task.id)} title="Registrar interés (+1)">+</Button>
                              </div>
                            </div>

                            {/* Overrun */}
                            {over && (
                              <div className="text-[11px] rounded border border-amber-300 bg-amber-50 px-2 py-1 text-amber-800">
                                ⚠️ Overrun &gt;30% vs estimado — sugiere dividir / re-estimar.
                              </div>
                            )}

                            {/* Footer: acciones rápidas */}
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => toggleComplete(task.id)}>
                                  Completar
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => logPomodoro(task.id, 25)} title="Log 25 min">
                                  <Play className="h-3 w-3 mr-1" /> 25'
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => applyBoost24h(task.id)} title="Boost 24h">
                                  <Zap className="h-3 w-3 mr-1" /> Boost
                                </Button>
                              </div>

                              {/* Due visual si existe */}
                              {task.fecha_limite && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(task.fecha_limite).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {list.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">Arrastra tareas aquí</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <TareasForm initial={undefined} submitRoute="tareas.store" method="post" onClose={closeForm} areas={(usePage().props as any).areas ?? []} contextos={(usePage().props as any).contextos ?? []} />
        </div>
      )}
    </div>
  );
}