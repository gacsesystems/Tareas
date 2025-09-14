import { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { DndContext, closestCenter, DragStartEvent, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";
import { Switch } from "@/Components/ui/switch";
import { GripVertical, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { route } from "ziggy-js";

type Tarea = {
  id: number;
  titulo: string;
  estado: "backlog" | "siguiente" | "hoy" | "en_curso" | "en_revision" | "hecha" | "bloqueada";
  bloqueada: boolean;
  fecha_limite?: string | null;
  proyecto_etapa_id?: number | null;
};

export function KanbanEtapas({ columnas, initialCols, onServerMove, }: {
  columnas: { id: number | null; nombre?: string | null }[];
  initialCols: Record<string, Tarea[]>;
  onServerMove: (tareaId: number, etapaId: number | null, newIndex: number) => Promise<void>;
}) {
  const [cols, setCols] = useState<Record<string, Tarea[]>>(initialCols);
  const [activeTask, setActiveTask] = useState<Tarea | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  );

  // --- filtros/contadores ---
  const [hideBlocked, setHideBlocked] = useState(false);
  const [stateFilter, setStateFilter] = useState<string[]>([]);
  const allTasksFlat = useMemo(() => Object.values(cols).flat(), [cols]);

  const countsByEstado = useMemo(() => {
    const map: Record<string, number> = { backlog: 0, siguiente: 0, hoy: 0, en_curso: 0, en_revision: 0, hecha: 0, bloqueada: 0 };
    allTasksFlat.forEach(t => { map[t.estado] = (map[t.estado] ?? 0) + 1; });
    return map;
  }, [allTasksFlat]);

  const blockedCount = useMemo(() => allTasksFlat.filter(t => t.bloqueada).length, [allTasksFlat]);
  const toggleStateFilter = (key: string) =>
    setStateFilter(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  // --- DnD helpers ---
  const findColumnIdByTask = (taskId: number) => {
    for (const [colId, arr] of Object.entries(cols)) if (arr.some(t => t.id === taskId)) return colId;
    return null;
  };

  const onDragStart = (e: DragStartEvent) => {
    const id = e.active.id as number;
    const colId = findColumnIdByTask(id);
    const task = colId ? cols[colId].find(t => t.id === id) ?? null : null;
    setActiveTask(task);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;
    const activeId = active.id as number;
    const overId = over.id as number | string;

    const originColId = findColumnIdByTask(activeId);
    if (!originColId) return;

    let targetColId: string;
    let overIndex: number;

    if (String(overId).startsWith("col-")) {
      targetColId = String(overId);
      overIndex = cols[targetColId]?.length ?? 0;
    } else {
      const overColId = findColumnIdByTask(Number(overId));
      if (!overColId) return;
      targetColId = overColId;
      overIndex = cols[targetColId].findIndex(t => t.id === Number(overId));
      if (overIndex < 0) overIndex = (cols[targetColId]?.length ?? 0);
    }

    if (!cols[targetColId]) return;

    // UI optimista
    setCols(prev => {
      const copy: Record<string, Tarea[]> = structuredClone(prev);
      const fromArr = copy[originColId];
      const toArr = copy[targetColId];
      const fromIndex = fromArr.findIndex(t => t.id === activeId);
      const [moved] = fromArr.splice(fromIndex, 1);
      toArr.splice(overIndex, 0, moved);
      return copy;
    });

    const etapaId = targetColId === "col-null" ? null : Number(String(targetColId).replace("col-", ""));
    try {
      await onServerMove(activeId, etapaId, overIndex);
    } catch {
      router.reload({ only: ["proyecto"] });
    }
  };

  // --- subcomponentes ---
  function KanbanColumn({ columnId, title, count, children }: {
    columnId: string; title: string; count: number; children: React.ReactNode
  }) {
    return (
      <div className="rounded-lg border bg-muted/20 p-2">
        <div className="flex items-center justify-between px-1 pb-2">
          <div className="font-medium text-sm">{title}</div>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <div id={columnId} className="space-y-2 min-h-[12px]" />
        {children}
      </div>
    );
  }

  function SortableCard({ id, children, className = "" }: {
    id: number | string;
    children: (args: { handleProps: any }) => React.ReactNode;
    className?: string;
  }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
      useSortable({ id });

    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };
    const handleProps = { ref: setActivatorNodeRef, ...attributes, ...listeners };

    return (
      <div ref={setNodeRef} style={style as any} className={`rounded-lg border bg-background p-3 shadow-sm ${isDragging ? "opacity-80 ring-2 ring-primary/30" : ""} ${className}`}>
        {children({ handleProps })}
      </div>
    );
  }

  const columnasNorm = useMemo(() => {
    const withNull = [{ id: null, nombre: "Sin etapa" }, ...columnas.filter(c => c.id !== null)];
    return withNull.map(c => ({ id: c.id, nombre: c.nombre ?? "Sin etapa" }));
  }, [columnas]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Kanban por etapa
          <Badge variant="secondary">{allTasksFlat.length} tareas</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>

        {/* Toolbar filtros */}
        <div className="mb-3 rounded-lg border p-3 bg-muted/30">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-medium mr-2">Filtrar:</div>

            {(["hoy", "en_curso", "en_revision", "siguiente", "backlog", "hecha", "bloqueada"] as const).map(key => (
              <Badge key={key} variant={stateFilter.includes(key) ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => toggleStateFilter(key)}>
                {key.replace("_", " ")} {countsByEstado[key] ? `• ${countsByEstado[key]}` : ""}
              </Badge>
            ))}

            <Separator orientation="vertical" className="mx-2 h-6" />

            <div className="flex items-center gap-2">
              <Switch checked={hideBlocked} onCheckedChange={setHideBlocked} id="hideBlocked" />
              <label htmlFor="hideBlocked" className="text-sm text-muted-foreground select-none">
                Ocultar bloqueadas {blockedCount ? `(${blockedCount})` : ""}
              </label>
            </div>

            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => { setHideBlocked(false); setStateFilter([]); }}>
              Limpiar
            </Button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {columnasNorm.map((col) => {
              const colId = col.id === null ? "col-null" : `col-${col.id}`;
              const tareas = (cols[colId] ?? []).filter(t => {
                if (hideBlocked && t.bloqueada) return false;
                if (stateFilter.length > 0 && !stateFilter.includes(t.estado)) return false;
                return true;
              });

              return (
                <KanbanColumn key={colId} columnId={colId} title={col.nombre ?? "Sin etapa"} count={tareas.length}>
                  <SortableContext items={tareas.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 min-h-[12px]">
                      {tareas.map((t) => (
                        <SortableCard key={t.id} id={t.id}>
                          {({ handleProps }) => (
                            <div className="flex items-start gap-2">
                              {/* HANDLE: solo este botón arrastra */}
                              <button className="mt-0.5 h-5 w-5 text-muted-foreground/70 cursor-grab active:cursor-grabbing" aria-label="Drag" {...handleProps}>
                                <GripVertical className="h-4 w-4" />
                              </button>

                              <div className="flex-1">
                                <div className="font-medium text-sm">{t.titulo}</div>
                                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                                  {t.bloqueada ? (
                                    <span className="flex items-center gap-1 text-red-600">
                                      <AlertTriangle className="h-3 w-3" /> bloqueada
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> {t.estado}
                                    </span>
                                  )}
                                  {t.fecha_limite && (
                                    <Badge variant="outline" className="h-5 px-1.5">
                                      vence {new Date(t.fecha_limite).toLocaleDateString()}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => router.visit(route("tareas.edit", t.id))}>
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </SortableCard>
                      ))}
                    </div>
                  </SortableContext>
                </KanbanColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rounded-lg border bg-background p-3 shadow-lg w-[280px]">
                <div className="font-medium text-sm">{activeTask.titulo}</div>
                <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {activeTask.estado}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}
