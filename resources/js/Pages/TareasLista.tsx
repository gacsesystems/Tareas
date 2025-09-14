import { useMemo, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Search, Star, Clock, Calendar as CalIcon, User, CheckCircle2, Circle, AlertTriangle, Zap, Target, Flame, Eye, Pencil } from "lucide-react";
import { slaBadge, dueBadge, hasOverrun, getQuadrant, quadrantColor, initials, hoursLeft as hoursLeftBoost, toggleComplete, addInteres, logPomodoro, applyBoost24h, saveTitle, } from "../Components/task.helpers";
import TareasForm from "./TareasForm";

type Catalogo = { id: number; nombre: string };
type Tarea = {
  id: number;
  titulo: string;
  detalle_md?: string | null;

  estado: "backlog" | "siguiente" | "hoy" | "en_curso" | "en_revision" | "hecha" | "bloqueada";

  proyecto_id?: number | null;
  proyecto?: { id: number; nombre: string } | null;

  contexto_id?: number | null;
  contexto?: { id: number; nombre: string } | null;

  area_id?: number | null;
  area?: { id: number; nombre: string } | null;

  responsable_id?: number | null;
  responsable?: { id: number; nombre: string } | null;

  fecha_limite?: string | null;
  sla_fecha?: string | null;

  pomos_estimados?: number | null;
  pomos_realizados?: number | null;
  tiempo_total_min?: number | null;

  score?: number | null;
  moscow?: "M" | "S" | "C" | "W" | null;
  horizon?: "H1" | "H2" | "H3" | null;
  eisen_importante?: boolean;
  eisen_urgente?: boolean;

  is_rock?: boolean;
  frog?: boolean;

  bloqueada?: boolean;
  bloqueo_motivo?: string | null;

  score_boost_until?: string | null;
  score_boost_factor?: number | null;

  interest_hits?: number;
  interest_last_at?: string | null;

  quadrant?: "Q1" | "Q2" | "Q3" | "Q4" | null;
};

type PageProps = {
  tareas: {
    data: Tarea[];
    links: { url: string | null; label: string; active: boolean }[];
  };
  filters: Partial<{
    estado: string;
    proyecto_id: string | number | null;
    responsable_id: string | number | null;
    area_id: string | number | null;
    contexto_id: string | number | null;
  }>;
  proyectos: Catalogo[];
  personas: Catalogo[];
  areas: Catalogo[];
  contextos: Catalogo[];
};

export default function TareasLista() {
  const { tareas: tareasProp, filters = {}, proyectos = [], personas = [], areas = [], contextos = [], } = usePage<PageProps>().props as Partial<PageProps> & { tareas?: PageProps["tareas"] };

  const tareas = {
    data: Array.isArray(tareasProp?.data) ? tareasProp!.data.filter(Boolean) : [],
    links: Array.isArray(tareasProp?.links) ? tareasProp!.links : [],
  };

  // ====== estado local (filtros + edición de título) ======
  const [q, setQ] = useState("");
  const [fEstado, setFEstado] = useState(filters.estado ?? "all");
  const [fProyecto, setFProyecto] = useState(filters.proyecto_id ? String(filters.proyecto_id) : "all");
  const [fResponsable, setFResponsable] = useState(filters.responsable_id ? String(filters.responsable_id) : "all");
  const [fArea, setFArea] = useState(filters.area_id ? String(filters.area_id) : "all");
  const [fContexto, setFContexto] = useState(filters.contexto_id ? String(filters.contexto_id) : "all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState<string>("");

  // ====== acciones filtros (server-side) ======
  const applyFilters = () => {
    const params: Record<string, any> = {};
    if (fEstado !== "all") params.estado = fEstado;
    if (fProyecto !== "all") params.proyecto_id = fProyecto;
    if (fResponsable !== "all") params.responsable_id = fResponsable;
    if (fArea !== "all") params.area_id = fArea;
    if (fContexto !== "all") params.contexto_id = fContexto;

    router.get(route("tareas.index"), params, { preserveState: true, preserveScroll: true });
  };

  const clearFilters = () => {
    setFEstado("all"); setFProyecto("all"); setFResponsable("all"); setFArea("all"); setFContexto("all");
    router.get(route("tareas.index"), {}, { preserveState: false, preserveScroll: true });
  };

  // ====== filtro client-side por texto (opcional) ======
  const filtered = useMemo(() => {
    const base = Array.isArray(tareas.data) ? tareas.data.filter(Boolean) : [];
    const txt = q.trim().toLowerCase();
    if (!txt) return base;
    return base.filter((t) =>
      (t?.titulo ?? "").toLowerCase().includes(txt) ||
      (t?.detalle_md ?? "").toLowerCase().includes(txt) ||
      (t?.proyecto?.nombre ?? "").toLowerCase().includes(txt)
    );
  }, [q, tareas.data]);

  // ====== tabs (agrupaciones) ======
  const groups = useMemo(() => {
    const all = filtered
      .filter(Boolean)
      .map((t) => ({ ...t, quadrant: (t.quadrant ?? getQuadrant(t)) as "Q1" | "Q2" | "Q3" | "Q4" }));

    return {
      all,
      hoy: all.filter((t) => t && t.estado === "hoy"),
      waiting: all.filter((t) => t && (t.estado === "bloqueada" || t.estado === "en_revision")),
      proyectos: all.filter((t) => t && !!t.proyecto_id),
      contextos: all.filter((t) => t && !!t.contexto_id),
      prioridad: all
        .slice()
        .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
        .slice(0, 30),
    };
  }, [filtered]);
  const [active, setActive] = useState<keyof typeof groups>("all");

  // ====== UI helpers locales ======
  const priorityIconFromQ = (q?: "Q1" | "Q2" | "Q3" | "Q4") => {
    switch (q) {
      case "Q1": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "Q2": return <Target className="h-4 w-4 text-green-600" />;
      case "Q3": return <Zap className="h-4 w-4 text-yellow-600" />;
      case "Q4": return <Circle className="h-4 w-4 text-gray-400" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  // ====== edición inline de título ======
  const startEdit = (t: Tarea) => {
    setEditingId(t.id);
    setDraftTitle(t.titulo);
  };
  const cancelEdit = () => { setEditingId(null); setDraftTitle(""); };
  const commitEdit = async (t: Tarea) => {
    const title = draftTitle.trim();
    if (!title) return cancelEdit();
    // Validación simple: no vacío (si quieres “empieza con verbo”, mételo aquí)
    await saveTitle(t, title);
    cancelEdit();
  };

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const openCreate = () => { setEditingTask(null); setShowTaskForm(true); };
  const closeForm = () => { setShowTaskForm(false); setEditingTask(null); };

  // ====== UI ======
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
          <p className="text-muted-foreground">Lista conectada al backend</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreate}>Nueva Tarea</Button>
          <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 items-center">
            {/* búsqueda local */}
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por título, detalle o proyecto…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
            </div>

            {/* estado */}
            <Select value={fEstado} onValueChange={setFEstado}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {["backlog", "siguiente", "hoy", "en_curso", "en_revision", "hecha", "bloqueada"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* proyecto */}
            <Select value={fProyecto} onValueChange={setFProyecto}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Proyecto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {proyectos.map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>))}
              </SelectContent>
            </Select>

            {/* responsable */}
            <Select value={fResponsable} onValueChange={setFResponsable}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Responsable" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {personas.map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>))}
              </SelectContent>
            </Select>

            {/* área */}
            <Select value={fArea} onValueChange={setFArea}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Área" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {areas.map(a => (<SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>))}
              </SelectContent>
            </Select>

            {/* contexto */}
            <Select value={fContexto} onValueChange={setFContexto}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Contexto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {contextos.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>))}
              </SelectContent>
            </Select>

            <Button onClick={applyFilters}>Aplicar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Secciones */}
      <Tabs value={active} onValueChange={(v) => setActive(v as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas ({groups.all.length})</TabsTrigger>
          <TabsTrigger value="hoy">Hoy ({groups.hoy.length})</TabsTrigger>
          <TabsTrigger value="prioridad">Por Score ({groups.prioridad.length})</TabsTrigger>
          <TabsTrigger value="proyectos">Con Proyecto ({groups.proyectos.length})</TabsTrigger>
          <TabsTrigger value="contextos">Con Contexto ({groups.contextos.length})</TabsTrigger>
        </TabsList>

        {Object.entries(groups).map(([key, list]) => (
          <TabsContent key={key} value={key} className="space-y-3">
            {list.length === 0 ? (
              <Card><CardContent className="pt-6 text-muted-foreground text-center">Sin tareas</CardContent></Card>
            ) : (
              list.map(t => {
                if (!t) return null;
                const sla = slaBadge(t);
                const due = dueBadge(t);
                const over = hasOverrun(t);
                const hoursLeft = hoursLeftBoost(t.score_boost_until);
                const qColor = quadrantColor(t.quadrant ?? getQuadrant(t));

                return (
                  <Card key={t.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {/* iconos principales */}
                        <div className="pt-1 flex flex-col items-center gap-2">
                          {t.frog ? <Star className="h-4 w-4 text-yellow-500" /> : null}
                          {t.is_rock ? <Target className="h-4 w-4 text-purple-600" /> : null}
                          {priorityIconFromQ(t.quadrant as any)}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* título + badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {editingId === t.id ? (
                              <div className="flex items-center gap-2">
                                <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} onKeyDown={(e) => {
                                  if (e.key === "Enter") commitEdit(t);
                                  if (e.key === "Escape") cancelEdit();
                                }}
                                  autoFocus className="h-7" />
                                <Button size="sm" onClick={() => commitEdit(t)}>Guardar</Button>
                                <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancelar</Button>
                              </div>
                            ) : (
                              <>
                                <h3 className={`font-semibold ${t.estado === 'hecha' ? 'line-through text-muted-foreground' : ''}`} title="Doble clic para editar" onDoubleClick={() => startEdit(t)}>
                                  {t.titulo}
                                </h3>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(t)} title="Editar título">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}

                            {typeof t.score === "number" && (
                              <Badge variant="outline" className="text-xs font-mono">Score {t.score.toFixed(1)}</Badge>
                            )}
                            {t.moscow && <Badge variant="outline" className="text-xs">{t.moscow}</Badge>}
                            {t.horizon && <Badge variant="outline" className="text-xs">{t.horizon}</Badge>}

                            {/* cuadrante (derivado) */}
                            <Badge variant="outline" className={`text-xs ${qColor}`}>{t.quadrant ?? getQuadrant(t)}</Badge>

                            {/* Boost */}
                            {hoursLeft && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                <Flame className="h-3 w-3 mr-1" /> Boost {hoursLeft}h
                              </Badge>
                            )}

                            {/* Bloqueo */}
                            {t.bloqueada && (<Badge variant="destructive" className="text-xs">Bloqueada</Badge>)}

                            {/* SLA / Due */}
                            {sla && <Badge className={`text-[10px] ${sla.className}`}>{sla.label}</Badge>}
                            {due && <Badge className={`text-[10px] ${due.className}`}>{due.label}</Badge>}

                            {/* Overrun */}
                            {over && (
                              <Badge variant="destructive" className="text-[10px]">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Overrun &gt;30% — sugerir dividir / re-estimar
                              </Badge>
                            )}
                          </div>

                          {/* detalle */}
                          {t.detalle_md && (<p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.detalle_md}</p>)}

                          {/* meta */}
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            {t.proyecto && <Badge variant="outline">{t.proyecto.nombre}</Badge>}
                            {t.contexto && <Badge variant="secondary">{t.contexto.nombre}</Badge>}
                            {t.area && <Badge variant="outline">{t.area.nombre}</Badge>}

                            {t.responsable && (
                              <span className="inline-flex items-center gap-1" title={t.responsable.nombre}>
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold">
                                  {initials(t.responsable.nombre)}
                                </div>
                                <User className="h-3 w-3" />
                                {t.responsable.nombre}
                              </span>
                            )}

                            {t.fecha_limite && (
                              <span className="inline-flex items-center gap-1">
                                <CalIcon className="h-3 w-3" />
                                {new Date(t.fecha_limite).toLocaleDateString()}
                              </span>
                            )}

                            {/* Pomos: puntos ●●○○ (click = +1 pomo) */}
                            <button
                              onClick={() => logPomodoro(t.id, 25)}
                              title="+1 pomo (25')"
                              className="font-mono"
                            >
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Array.from({ length: Math.max(t.pomos_estimados ?? 0, 4) })
                                  .map((_, i) => i < (t.pomos_realizados ?? 0) ? "●" : "○")
                                  .join("")}
                                <span className="opacity-70">({t.pomos_realizados ?? 0}/{t.pomos_estimados ?? 0})</span>
                              </span>
                            </button>

                            {/* 👀 interés */}
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {t.interest_hits ?? 0}
                              <Button size="sm" variant="ghost" onClick={() => addInteres(t.id)} className="h-5 px-1" title="Registrar interés (+1)">+</Button>
                              {t.interest_last_at && (
                                <Badge variant="outline" className="text-[10px]">
                                  preguntaron hace&nbsp;
                                  {Math.max(0, Math.floor((Date.now() - new Date(t.interest_last_at).getTime()) / (1000 * 60 * 60 * 24)))}d
                                </Badge>
                              )}
                            </span>
                          </div>

                          {/* acciones rápidas */}
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => applyBoost24h(t.id)}>
                              <Flame className="h-4 w-4 mr-1" /> Boost 24h
                            </Button>
                            <Button
                              size="sm"
                              variant={t.bloqueada ? "destructive" : "outline"}
                              onClick={() =>
                                router.post(route("tareas.bloqueo", t.id),
                                  { bloqueada: !t.bloqueada, motivo: t.bloqueo_motivo ?? "" },
                                  { preserveScroll: true }
                                )
                              }
                            >
                              {t.bloqueada ? "Desbloquear" : "Bloquear"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => router.post(route('tareas.quick.mark-frog', t.id), {}, { preserveScroll: true })}>Frog</Button>
                            <Button size="sm" variant="ghost" onClick={() => router.post(route('tareas.quick.toggle-rock', t.id), {}, { preserveScroll: true })}>{t.is_rock ? 'Quitar Rock' : 'Rock'}</Button>
                          </div>
                        </div>

                        {/* completar */}
                        <Button variant="ghost" size="sm" className="mt-1" onClick={() => toggleComplete(t.id)} title="Marcar completada">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <TareasForm initial={editingTask ?? undefined} submitRoute={editingTask ? "tareas.update" : "tareas.store"} method={editingTask ? "put" : "post"} onClose={closeForm} areas={areas} contextos={contextos} />
        </div>
      )}
      {/* Paginación nativa de Laravel */}
      {tareas.links?.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {tareas.links.map((l, i) => (<Button key={i} variant={l.active ? "default" : "outline"} size="sm" disabled={!l.url} onClick={() => l.url && router.visit(l.url, { preserveScroll: true })} dangerouslySetInnerHTML={{ __html: l.label }} />))}
        </div>
      )}
    </div>
  );
}