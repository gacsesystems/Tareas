// resources/js/Pages/Projects/Index.tsx
import React, { useMemo, useState } from "react";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Progress } from "@/Components/ui/progress";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
import { FolderOpen, Plus, Calendar, CheckCircle2, Star, Baseline as Timeline, ArrowUpRightFromCircle as ArrowRightFromCircle, Target, AlertTriangle, Clock, Pencil, Trash2, RefreshCw, Settings2, ChevronLeft, ChevronRight, } from "lucide-react";
import { route } from "ziggy-js";

// Tip: si usas shadcn/ui para Dialog, puedes reemplazar el modal casero por <Dialog/>
function Modal({ open, onClose, children, title, }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-2 hover:bg-muted/50">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

type Area = { id: number; nombre: string };
type Persona = { id: number; nombre: string };

type Etapa = {
  id: number;
  nombre: string;
  progreso_pct: number | null;
  done: boolean;
  orden: number;
  fecha_inicio_plan?: string | null;
  fecha_fin_plan?: string | null;
  fecha_inicio_real?: string | null;
  fecha_fin_real?: string | null;
};

type Objetivo = {
  id: number;
  descripcion: string;
  cumplido: boolean;
  fecha_objetivo?: string | null;
  orden?: number;
};

type ProximaTarea = {
  id: number;
  titulo: string;
  estado: string;
  score: number;
  frog: boolean;
  is_rock: boolean;
  ranking: number;
};

type Proyecto = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  area_id?: number | null;
  area?: { id: number; nombre: string };
  status: "abierto" | "cerrado";
  prioridad: "baja" | "media" | "alta";
  estrategico: boolean;

  fec_inicio_plan?: string | null;
  fec_fin_plan?: string | null;
  fec_inicio_real?: string | null;
  fec_fin_real?: string | null;

  criterio_cierre: "tareas" | "objetivos";
  objetivo_principal?: string | null;

  proxima_accion_modo: "auto" | "manual";
  proxima_accion_tarea_id?: number | null;
  proxima_accion_updated_at?: string | null;
  proxima_accion_tarea?: ProximaTarea; // opcional si lo devuelves ya cargado

  owner_id?: number | null;
  owner?: Persona | null;

  delegation_level_applied: number;
  interest_hits: number;
  interest_last_at?: string | null;

  progreso_pct?: number | null;

  etapas?: Etapa[];
  objetivos?: Objetivo[];
};

type Paginator<T> = {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
  current_page: number;
  last_page: number;
  from?: number | null;
  to?: number | null;
  total: number;
};

type PageProps = {
  filters: Record<string, any>;
  proyectos: Paginator<Proyecto>;
  areas: Area[];
  owners?: Persona[];
};

export default function ProjectsIndex() {
  const { proyectos, areas, filters } = usePage<PageProps>().props;

  // ---------- UI State ----------
  const [showGantt, setShowGantt] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Proyecto | null>(null);
  const [proximaFormOpen, setProximaFormOpen] = useState<Proyecto | null>(null);

  // ---------- Forms ----------
  // Tipo base para los campos comunes del proyecto
  type BaseProyectoFormData = {
    nombre: string;
    descripcion: string;
    area_id: string | null;
    prioridad: "baja" | "media" | "alta";
    estrategico: boolean;
    fec_inicio_plan: string | null;
    fec_fin_plan: string | null;
    fec_inicio_real: string | null;
    fec_fin_real: string | null;
    criterio_cierre: "tareas" | "objetivos";
    objetivo_principal: string;
    owner_id: string;
  };

  // Tipo para crear (sin id y status)
  type CreateFormData = BaseProyectoFormData;

  // Tipo para editar (con id y status)
  type EditFormData = BaseProyectoFormData & {
    id: number;
    status: "abierto" | "cerrado";
  };

  // Valores iniciales base
  const baseInitialValues: BaseProyectoFormData = {
    nombre: "",
    descripcion: "",
    area_id: "",
    prioridad: "media",
    estrategico: false,
    fec_inicio_plan: "",
    fec_fin_plan: "",
    fec_inicio_real: "",
    fec_fin_real: "",
    criterio_cierre: "tareas",
    objetivo_principal: "",
    owner_id: "",
  };

  // Formularios
  const createForm = useForm<CreateFormData>(baseInitialValues);

  const editForm = useForm<EditFormData>({
    id: 0,
    status: "abierto",
    ...baseInitialValues,
  });


  const proximaForm = useForm({
    modo: "auto" as "auto" | "manual",
    tarea_id: 0,
  } satisfies {
    modo: "auto" | "manual";
    tarea_id: number;
  });

  // ---------- Helpers ----------
  const list = useMemo(() => proyectos.data, [proyectos]);

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta": return "bg-red-100 text-red-800 border-red-200";
      case "media": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "baja": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (s?: string | null) => s ? new Date(s).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", }) : "";

  const daysLeft = (fechaFin?: string | null) => {
    if (!fechaFin) return null;
    const today = new Date();
    const fin = new Date(fechaFin);
    return Math.ceil((fin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const healthOf = (p: Proyecto) => {
    const fin = p.fec_fin_plan ? new Date(p.fec_fin_plan) : null;
    const today = new Date();
    if (p.status === "cerrado")
      return { status: "completado", color: "text-green-600", icon: CheckCircle2 };
    if (fin && today > fin)
      return { status: "vencido", color: "text-red-600", icon: AlertTriangle };

    const progress = p.progreso_pct ?? 0;
    if (progress >= 75) return { status: "bien", color: "text-green-600", icon: CheckCircle2 };
    return { status: "normal", color: "text-blue-600", icon: Clock };
  };

  const avgProgress = useMemo(() => {
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, p) => acc + (p.progreso_pct ?? 0), 0);
    return Math.round(sum / list.length);
  }, [list]);

  // ---------- Actions ----------
  const openCreate = () => {
    createForm.reset();
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Proyecto) => {
    editForm.setData({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      area_id: p.area_id?.toString() ?? "", // Convertir a string
      prioridad: p.prioridad,
      estrategico: !!p.estrategico,
      fec_inicio_plan: p.fec_inicio_plan ?? "",
      fec_fin_plan: p.fec_fin_plan ?? "",
      fec_inicio_real: p.fec_inicio_real ?? "",
      fec_fin_real: p.fec_fin_real ?? "",
      criterio_cierre: p.criterio_cierre,
      objetivo_principal: p.objetivo_principal ?? "",
      owner_id: p.owner_id?.toString() ?? "", // Convertir a string
      status: p.status,
    });
    setEditing(p);
    setModalOpen(true);
  };

  const submitCreate = () => {
    createForm.post(route("proyectos.store"), {
      preserveScroll: true,
      onSuccess: () => setModalOpen(false),
    });
  };

  const submitEdit = () => {
    editForm.put(route("proyectos.update", editForm.data.id), {
      preserveScroll: true,
      onSuccess: () => setModalOpen(false),
    });
  };

  const destroyProj = (p: Proyecto) => {
    if (!confirm(`¿Eliminar proyecto "${p.nombre}"?`)) return;
    router.delete(route("proyectos.destroy", p.id), { preserveScroll: true });
  };

  const recompute = (p: Proyecto) => {
    router.post(route("proyectos.recompute", p.id), {}, { preserveScroll: true });
  };

  const cerrar = (p: Proyecto) => {
    router.post(route("proyectos.cerrar", p.id), {}, { preserveScroll: true });
  };

  const abrir = (p: Proyecto) => {
    router.post(route("proyectos.abrir", p.id), {}, { preserveScroll: true });
  };

  const openProxima = (p: Proyecto) => {
    proximaForm.reset();
    proximaForm.setData("modo", p.proxima_accion_modo ?? "auto");
    proximaForm.setData("tarea_id", p.proxima_accion_tarea_id ?? 0);
    setProximaFormOpen(p);
  };

  const submitProxima = () => {
    if (!proximaFormOpen) return;
    router.post(
      route("proyectos.proxima", proximaFormOpen.id),
      {
        modo: proximaForm.data.modo,
        tarea_id: proximaForm.data.tarea_id || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => setProximaFormOpen(null),
      }
    );
  };

  // ---------- Filters (opcionales) ----------
  const setFilter = (key: string, value: any) => {
    router.get(route("proyectos.index"), { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
  };

  // ---------- Render ----------
  return (
    <div className="p-6 space-y-6">
      <Head title="Proyectos" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona tus proyectos y su progreso</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGantt(!showGantt)}>
            <Timeline className="mr-2 h-4 w-4" />
            {showGantt ? "Vista Cards" : "Vista Gantt"}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={filters.status === "abierto" ? "default" : "outline"} onClick={() => setFilter("status", filters.status === "abierto" ? undefined : "abierto")}>
          Abiertos
        </Button>
        <Button size="sm" variant={filters.status === "cerrado" ? "default" : "outline"} onClick={() => setFilter("status", filters.status === "cerrado" ? undefined : "cerrado")}>
          Cerrados
        </Button>
        <Button size="sm" variant={filters.estrategico ? "default" : "outline"} onClick={() => setFilter("estrategico", filters.estrategico ? undefined : 1)}>
          ⭐ Estratégicos
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{list.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Estratégicos</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{list.filter((p) => p.estrategico).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-chart-3" />
              <span className="text-sm text-muted-foreground">Completados</span>
            </div>
            <p className="text-2xl font-bold text-chart-3">{list.filter((p) => p.status === "cerrado").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-chart-4" />
              <span className="text-sm text-muted-foreground">En progreso</span>
            </div>
            <p className="text-2xl font-bold text-chart-4">{list.filter((p) => p.status === "abierto").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Progreso promedio</span>
            </div>
            <p className="text-2xl font-bold">{avgProgress}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Listado */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {list.map((project) => {
          const health = healthOf(project);
          const HealthIcon = health.icon;
          const dleft = daysLeft(project.fec_fin_plan);
          return (
            <Card key={project.id} className={`${project.status === "cerrado" ? "opacity-75" : ""} ${project.estrategico ? "border-yellow-200 bg-yellow-50/30" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {project.estrategico && <Star className="h-4 w-4 fill-yellow-600 text-yellow-600" />}
                      <CardTitle className="text-lg">{project.nombre}</CardTitle>
                    </div>
                    {project.descripcion && (<p className="mb-3 text-sm text-muted-foreground">{project.descripcion}</p>)}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={project.area?.nombre === "Empresa" ? "default" : "secondary"}>{project.area?.nombre ?? "—"}</Badge>
                      <Badge className={getPriorityColor(project.prioridad)}>{project.prioridad}</Badge>
                      <Badge variant={project.status === "cerrado" ? "default" : "outline"}>{project.status === "cerrado" ? "Completado" : "En progreso"}</Badge>
                      <div className={`flex items-center gap-1 ${health.color}`}>
                        <HealthIcon className="h-3 w-3" />
                        <span className="text-xs font-medium">{health.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex shrink-0 items-center gap-1">
                    {project.status === "abierto" ? (
                      <Button size="icon" variant="outline" title="Cerrar proyecto" onClick={() => cerrar(project)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="outline" title="Reabrir proyecto" onClick={() => abrir(project)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      title="Recalcular progreso"
                      onClick={() => recompute(project)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" title="Editar" onClick={() => openEdit(project)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" title="Eliminar" onClick={() => destroyProj(project)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Progreso General</span>
                    <span>{(project.progreso_pct ?? 0).toFixed(1)}%</span>
                  </div>
                  <Progress value={project.progreso_pct ?? 0} className="mb-3" />

                  {/* Etapas mini-progress (si estás cargando etapas) */}
                  {project.etapas && project.etapas.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {project.etapas.slice(0, 4).map((et) => (
                        <div key={et.id} className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${et.done ? "bg-green-500" : (et.progreso_pct ?? 0) > 0 ? "bg-blue-500" : "bg-gray-300"}`} />
                          <span className={et.done ? "line-through text-muted-foreground" : ""}>{et.nombre}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {project.objetivo_principal && (
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="mb-1 text-xs text-muted-foreground">Objetivo Principal:</p>
                    <p className="text-sm font-medium">{project.objetivo_principal}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {project.status === "cerrado" ? `Completado: ${formatDate(project.fec_fin_real)}` : project.fec_fin_plan ? `Vence: ${formatDate(project.fec_fin_plan)}` : "Sin fecha fin plan"}
                    </span>
                  </div>
                  {project.status === "abierto" && project.fec_fin_plan && dleft !== null && (
                    <Badge variant={dleft < 0 ? "destructive" : dleft <= 7 ? "secondary" : "outline"} className="text-xs">
                      {dleft < 0 ? `${Math.abs(dleft)}d vencido` : `${dleft}d restantes`}
                    </Badge>
                  )}
                </div>

                {/* Próxima acción */}
                {(project.proxima_accion_tarea_id || project.proxima_accion_tarea) && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2">
                    <ArrowRightFromCircle className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-600">Próxima Acción</p>
                      <p className="text-xs text-muted-foreground">
                        {project.proxima_accion_tarea ? `#${project.proxima_accion_tarea.id} • ${project.proxima_accion_tarea.titulo}` : `Tarea #${project.proxima_accion_tarea_id}`}
                      </p>
                    </div>
                    {project.proxima_accion_tarea_id && (
                      <Link href={route("tareas.edit", project.proxima_accion_tarea_id)} className="rounded-lg border border-blue-200 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50">
                        Ir
                      </Link>)}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => openProxima(project)}>
                    Configurar Próxima Acción
                  </Button>
                  {project.etapas && project.etapas.length > 0 && (
                    <Link href={route("proyectos.etapas.index", project.id)} className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted/50">
                      <Timeline className="h-4 w-4" />
                    </Link>)}
                  {project.status === "abierto" && (
                    <Link href={route("proyectos.edit", project.id)} className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted/50">
                      <Target className="h-4 w-4" />
                    </Link>)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Paginación */}
      {proyectos.links.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {proyectos.links.map((l, idx) =>
            l.url ? (<Link key={idx} href={l.url} className={`rounded px-3 py-1 text-sm ${l.active ? "bg-primary text-white" : "border hover:bg-muted/50"}`} dangerouslySetInnerHTML={{ __html: l.label }} />) : (
              <span key={idx} className="rounded border px-3 py-1 text-sm text-muted-foreground opacity-50" dangerouslySetInnerHTML={{ __html: l.label }} />)
          )}
        </div>
      )}

      {/* Vista Gantt simple */}
      {showGantt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timeline className="h-5 w-5" />
              Vista Gantt - Cronograma de Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {list.filter((p) => p.status === "abierto").map((p) => (
                <div key={p.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {p.estrategico && <Star className="h-4 w-4 fill-yellow-600 text-yellow-600" />}
                    <h4 className="font-medium">{p.nombre}</h4>
                    <Badge className={getPriorityColor(p.prioridad)}>{p.prioridad}</Badge>
                  </div>
                  <div className="ml-6 space-y-1">
                    {/* Barra de proyecto si no hay etapas */}
                    {(!p.etapas || p.etapas.length === 0) && (<RowBar label="Proyecto" progress={p.progreso_pct ?? 0} />)}
                    {/* Barras por etapa */}
                    {p.etapas?.map((e) => (
                      <div key={e.id} className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${e.done ? "bg-green-500" : "bg-blue-500"}`} />
                        <span className={`text-sm ${e.done ? "line-through text-muted-foreground" : ""}`}>{e.nombre}</span>
                        <div className="mx-2 flex-1">
                          <Progress value={e.progreso_pct ?? 0} className="h-2" />
                        </div>
                        <span className="text-xs text-muted-foreground">{Math.round(e.progreso_pct ?? 0)}%</span>
                      </div>))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Crear/Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Proyecto" : "Nuevo Proyecto"}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input value={editing ? editForm.data.nombre : createForm.data.nombre} onChange={(e) => (editing ? editForm.setData("nombre", e.target.value) : createForm.setData("nombre", e.target.value))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea value={editing ? (editForm.data.descripcion as any) : (createForm.data.descripcion as any)} onChange={(e) => editing ? editForm.setData("descripcion", e.target.value) : createForm.setData("descripcion", e.target.value)} rows={3} />
          </div>

          <div>
            <label className="text-sm font-medium">Área</label>
            <select className="mt-1 w-full rounded-md border p-2" value={(editing ? editForm.data.area_id : createForm.data.area_id) ?? ""} onChange={(e) => editing ? editForm.setData("area_id", e.target.value || null) : createForm.setData("area_id", e.target.value || null)}>
              <option value="">—</option>
              {areas.map((a) => (<option key={a.id} value={a.id}>{a.nombre}</option>))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Prioridad</label>
            <select className="mt-1 w-full rounded-md border p-2" value={editing ? editForm.data.prioridad : createForm.data.prioridad} onChange={(e) => editing ? editForm.setData("prioridad", e.target.value as any) : createForm.setData("prioridad", e.target.value as any)}>
              <option value="baja">baja</option>
              <option value="media">media</option>
              <option value="alta">alta</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={editing ? !!editForm.data.estrategico : !!createForm.data.estrategico} onCheckedChange={(v) => (editing ? editForm.setData("estrategico", !!v) : createForm.setData("estrategico", !!v))} id="estrategico" />
            <label htmlFor="estrategico" className="text-sm">Estratégico</label>
          </div>

          <div>
            <label className="text-sm font-medium">Inicio plan</label>
            <Input type="date" value={(editing ? editForm.data.fec_inicio_plan : createForm.data.fec_inicio_plan) ?? ""} onChange={(e) => editing ? editForm.setData("fec_inicio_plan", e.target.value || null) : createForm.setData("fec_inicio_plan", e.target.value || null)} />
          </div>
          <div>
            <label className="text-sm font-medium">Fin plan</label>
            <Input type="date" value={(editing ? editForm.data.fec_fin_plan : createForm.data.fec_fin_plan) ?? ""} onChange={(e) => editing ? editForm.setData("fec_fin_plan", e.target.value || null) : createForm.setData("fec_fin_plan", e.target.value || null)} />
          </div>

          <div>
            <label className="text-sm font-medium">Inicio real</label>
            <Input type="date" value={(editing ? editForm.data.fec_inicio_real : createForm.data.fec_inicio_real) ?? ""} onChange={(e) => editing ? editForm.setData("fec_inicio_real", e.target.value || null) : createForm.setData("fec_inicio_real", e.target.value || null)} />
          </div>
          <div>
            <label className="text-sm font-medium">Fin real</label>
            <Input type="date" value={(editing ? editForm.data.fec_fin_real : createForm.data.fec_fin_real) ?? ""} onChange={(e) => editing ? editForm.setData("fec_fin_real", e.target.value || null) : createForm.setData("fec_fin_real", e.target.value || null)} />
          </div>

          <div>
            <label className="text-sm font-medium">Criterio de cierre</label>
            <select className="mt-1 w-full rounded-md border p-2" value={editing ? editForm.data.criterio_cierre : createForm.data.criterio_cierre} onChange={(e) => editing ? editForm.setData("criterio_cierre", e.target.value as any) : createForm.setData("criterio_cierre", e.target.value as any)}>
              <option value="tareas">tareas</option>
              <option value="objetivos">objetivos</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Objetivo principal</label>
            <Input value={(editing ? editForm.data.objetivo_principal : createForm.data.objetivo_principal) ?? ""} onChange={(e) => editing ? editForm.setData("objetivo_principal", e.target.value) : createForm.setData("objetivo_principal", e.target.value)} />
          </div>

          {editing && (
            <div>
              <label className="text-sm font-medium">Estado</label>
              <select className="mt-1 w-full rounded-md border p-2" value={editForm.data.status} onChange={(e) => editForm.setData("status", e.target.value as any)}>
                <option value="abierto">abierto</option>
                <option value="cerrado">cerrado</option>
              </select>
            </div>)}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
          {editing ? (
            <Button onClick={submitEdit} disabled={editForm.processing}>Guardar cambios</Button>) : (
            <Button onClick={submitCreate} disabled={createForm.processing}>Crear proyecto</Button>)}
        </div>
      </Modal>

      {/* Modal Próxima acción */}
      <Modal open={!!proximaFormOpen} onClose={() => setProximaFormOpen(null)} title={`Próxima acción – ${proximaFormOpen?.nombre ?? ""}`}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Modo</label>
            <select className="mt-1 w-full rounded-md border p-2" value={proximaForm.data.modo} onChange={(e) => proximaForm.setData("modo", e.target.value as any)}>
              <option value="auto">auto</option>
              <option value="manual">manual</option>
            </select>
          </div>

          {proximaForm.data.modo === "manual" && (
            <div>
              <label className="text-sm font-medium">Tarea (ID)</label>
              <Input placeholder="Ej. 123" value={proximaForm.data.tarea_id ?? ""} onChange={(e) => {
                const value = e.target.value;
                proximaForm.setData("tarea_id", value === "" ? 0 : parseInt(value, 10));
              }} />
              {/* Si quieres, añade aquí un autocomplete con tareas del proyecto.
                  Para mantener Inertia puro y sin endpoints extra, dejamos el input por ID. */}
              <div className="mt-2 text-xs text-muted-foreground">
                Sugerencia: abre{" "}
                <Link className="underline" href={route("tareas.index", { proyecto_id: proximaFormOpen?.id })}>Tareas del proyecto</Link>
                y copia el ID.
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setProximaFormOpen(null)}>Cancelar</Button>
          <Button onClick={submitProxima} disabled={proximaForm.processing}>Guardar</Button>
        </div>
      </Modal>
    </div>
  );
}

function RowBar({ label, progress }: { label: string; progress: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded-full bg-blue-500" />
      <span className="text-sm">{label}</span>
      <div className="mx-2 flex-1">
        <Progress value={progress ?? 0} className="h-2" />
      </div>
      <span className="text-xs text-muted-foreground">{Math.round(progress ?? 0)}%</span>
    </div>
  );
}
