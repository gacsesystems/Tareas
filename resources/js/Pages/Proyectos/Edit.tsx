// resources/js/Pages/Projects/Edit.tsx
import * as React from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/Components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, } from "@/Components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
import { Label } from "@/Components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Progress } from "@/Components/ui/progress";
import { ArrowLeft, RefreshCw, CheckCircle2, Target, Settings2, Plus, Pencil, Trash2, ArrowUpRightFromCircle, Calendar, Star } from "lucide-react";
import { route } from "ziggy-js";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanEtapas } from "./KanbanEtapas";

// ===== Tipos =====
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
  area?: Area | null;
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
  proxima_accion_tarea?: ProximaTarea; // si la pasas cargada

  owner_id?: number | null;
  owner?: Persona | null;

  delegation_level_applied: number;
  interest_hits: number;
  interest_last_at?: string | null;

  progreso_pct?: number | null;

  etapas?: Etapa[];
  objetivos?: Objetivo[];
  tareas?: TTarea[];
};

type PageProps = {
  proyecto: Proyecto;
  areas: Area[];
  owners: Persona[];
};

type TEtapa = { id: number; nombre: string; orden: number };
type TTarea = {
  id: number;
  titulo: string;
  estado: "backlog" | "siguiente" | "hoy" | "en_curso" | "en_revision" | "hecha" | "bloqueada";
  bloqueada: boolean;
  ranking: number;
  proyecto_etapa_id: number | null;
  fecha_limite?: string | null;
};

// ===== Custom Hooks =====

// Hook para listas con reordenamiento
function useOrderableList<T extends { id: number; orden?: number }>(initialItems: T[], endpoints: { reorder: string; toggle: string; destroy: string; }) {
  const [items, setItems] = React.useState<T[]>([...initialItems].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));

  const moveItem = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next.map((item, i) => ({ ...item, orden: i + 1 })));
  };

  const persistOrder = () => {
    const payload = items.map((item) => ({ id: item.id, orden: item.orden ?? 0 }));
    const dataKey = endpoints.reorder.includes('etapas') ? 'orden' : 'items';
    router.post(endpoints.reorder, { [dataKey]: payload }, { preserveScroll: true });
  };

  const toggleItem = (item: T, field: keyof T) => {
    setItems((arr) => arr.map((x) => x.id === item.id ? { ...x, [field]: !x[field] } : x));
    router.post(`${endpoints.toggle}/${item.id}`, {}, { preserveScroll: true });
  };

  const deleteItem = (item: T, confirmMessage: string) => {
    if (!confirm(confirmMessage)) return;
    setItems((arr) => arr.filter((x) => x.id !== item.id));
    router.delete(`${endpoints.destroy}/${item.id}`, { preserveScroll: true });
  };

  return { items, setItems, moveItem, persistOrder, toggleItem, deleteItem };
}

// Hook para formularios CRUD
function useCrudDialog<T extends Record<string, any>>(initialData: T, endpoints: { store: string; update: (id: number) => string; }) {
  const form = useForm<T>(initialData);
  const [isOpen, setIsOpen] = React.useState(false);

  const openCreate = () => {
    form.reset();
    setIsOpen(true);
  };

  const openEdit = (data: Partial<T>) => {
    form.setData(data as any);
    setIsOpen(true);
  };

  const submit = (onSuccess?: (data: T) => void) => {
    const isEditing = form.data.id;
    const endpoint = isEditing ? endpoints.update(form.data.id) : endpoints.store;
    const method = isEditing ? 'put' : 'post';

    router[method](endpoint, form.data, {
      preserveScroll: true,
      onSuccess: () => {
        setIsOpen(false);
        onSuccess?.(form.data);
      },
    });
  };

  return { form, isOpen, setIsOpen, openCreate, openEdit, submit };
}

// ===== Util =====
const fmt = (s?: string | null) => s ? new Date(s).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", }) : "";

const prioChip = (p: string) => p === "alta" ? "bg-red-100 text-red-800 border-red-200" : p === "media" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-green-100 text-green-800 border-green-200";

// ===== Página =====
export default function ProjectEditPage() {
  const { proyecto, areas, owners } = usePage<PageProps>().props;

  // ---------- FORM GENERAL ----------
  const generalForm = useForm({
    nombre: proyecto.nombre ?? "",
    descripcion: proyecto.descripcion ?? "",
    area_id: proyecto.area_id ?? null,
    prioridad: proyecto.prioridad ?? "media",
    estrategico: !!proyecto.estrategico,
    fec_inicio_plan: proyecto.fec_inicio_plan ?? "",
    fec_fin_plan: proyecto.fec_fin_plan ?? "",
    fec_inicio_real: proyecto.fec_inicio_real ?? "",
    fec_fin_real: proyecto.fec_fin_real ?? "",
    criterio_cierre: proyecto.criterio_cierre ?? "tareas",
    objetivo_principal: proyecto.objetivo_principal ?? "",
    owner_id: proyecto.owner_id ?? null,
    status: proyecto.status ?? "abierto",
  });

  // Acciones del proyecto
  const projectActions = {
    save: () => generalForm.put(route("proyectos.update", proyecto.id), { preserveScroll: true }),
    recompute: () => router.post(route("proyectos.recompute", proyecto.id), {}, { preserveScroll: true }),
    close: () => router.post(route("proyectos.cerrar", proyecto.id), {}, { preserveScroll: true }),
    open: () => router.post(route("proyectos.abrir", proyecto.id), {}, { preserveScroll: true }),
  };

  // ---------- PROXIMA ACCION ----------
  const proximaForm = useForm({
    modo: proyecto.proxima_accion_modo ?? "auto",
    tarea_id: proyecto.proxima_accion_tarea_id?.toString() ?? "",
  } satisfies {
    modo: "auto" | "manual";
    tarea_id: string;
  });

  const saveProxima = () => router.post(
    route("proyectos.proxima", proyecto.id),
    { modo: proximaForm.data.modo, tarea_id: proximaForm.data.tarea_id || null },
    { preserveScroll: true }
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // ---------- ETAPAS (optimista simple) ----------
  // const [etapas, setEtapas] = React.useState<Etapa[]>([...(proyecto.etapas ?? [])].sort((a, b) => a.orden - b.orden));
  // ---------- ETAPAS ----------
  const etapas = useOrderableList(proyecto.etapas ?? [], {
    reorder: route("proyectos.etapas.sort", proyecto.id),
    toggle: route("proyectos.etapas.toggle"),
    destroy: route("proyectos.etapas.destroy"),
  });

  // Crear / Editar etapa (Dialog)
  type EtapaFormData = {
    id: number;
    proyecto_id: number;
    nombre: string;
    orden: number;
    fecha_inicio_plan: string;
    fecha_fin_plan: string;
    fecha_inicio_real: string;
    fecha_fin_real: string;
    progreso_pct: string;
    done: boolean;
  };

  const etapasDialog = useCrudDialog<EtapaFormData>({
    id: 0,
    proyecto_id: proyecto.id,
    nombre: "",
    orden: (etapas.items[etapas.items.length - 1]?.orden ?? 0) + 1,
    fecha_inicio_plan: "",
    fecha_fin_plan: "",
    fecha_inicio_real: "",
    fecha_fin_real: "",
    progreso_pct: "",
    done: false,
  }, {
    store: route("proyectos.etapas.store"),
    update: (id) => route("proyectos.etapas.update", id),
  });

  const etapaActions = {
    openEdit: (e: Etapa) => etapasDialog.openEdit({
      id: e.id,
      proyecto_id: proyecto.id,
      nombre: e.nombre,
      orden: e.orden,
      fecha_inicio_plan: e.fecha_inicio_plan ?? "",
      fecha_fin_plan: e.fecha_fin_plan ?? "",
      fecha_inicio_real: e.fecha_inicio_real ?? "",
      fecha_fin_real: e.fecha_fin_real ?? "",
      progreso_pct: e.progreso_pct?.toString() ?? "",
      done: e.done,
    }),
    submit: () => etapasDialog.submit((data) => {
      if (data.id) {
        etapas.setItems(arr => arr.map(x => x.id === data.id ? { ...x, ...data } as any : x));
      }
    }),
    toggle: (e: Etapa) => etapas.toggleItem(e, 'done'),
    delete: (e: Etapa) => etapas.deleteItem(e, `¿Eliminar etapa "${e.nombre}"?`),
  };
  const onDragEndEtapas = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = etapas.items.findIndex((e) => String(e.id) === String(active.id));
    const newIndex = etapas.items.findIndex((e) => String(e.id) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reOrdered = arrayMove(etapas.items, oldIndex, newIndex).map((e, idx) => ({
      ...e,
      orden: idx + 1,
    }));

    etapas.setItems(reOrdered); // optimista
    // persiste inmediatamente (o botón aparte, como prefieras)
    etapas.persistOrder();
    router.post(route("proyectos.etapas.sort", proyecto.id), { orden: reOrdered.map((e) => ({ id: e.id, orden: e.orden })) }, { preserveScroll: true });
  };

  // ---------- OBJETIVOS ----------
  const objetivos = useOrderableList(proyecto.objetivos ?? [], {
    reorder: route("proyectos.objetivos.reorder", proyecto.id),
    toggle: route("proyectos.objetivos.toggle"),
    destroy: route("proyectos.objetivos.destroy"),
  });

  // Crear / Editar objetivo (Dialog)
  type ObjetivoFormData = {
    id: number;
    proyecto_id: number;
    descripcion: string;
    fecha_objetivo: string;
    cumplido: boolean;
    orden: number;
  };

  const objetivosDialog = useCrudDialog<ObjetivoFormData>({
    id: 0,
    proyecto_id: proyecto.id,
    descripcion: "",
    fecha_objetivo: "",
    cumplido: false,
    orden: (objetivos.items[objetivos.items.length - 1]?.orden ?? 0) + 1,
  }, {
    store: route("proyectos.objetivos.store"),
    update: (id) => route("proyectos.objetivos.update", id),
  });

  const objetivoActions = {
    openEdit: (o: Objetivo) => objetivosDialog.openEdit({
      id: o.id,
      proyecto_id: proyecto.id,
      descripcion: o.descripcion,
      fecha_objetivo: o.fecha_objetivo ?? "",
      cumplido: o.cumplido,
      orden: o.orden ?? 0,
    }),
    submit: () => objetivosDialog.submit(),
    toggle: (o: Objetivo) => objetivos.toggleItem(o, 'cumplido'),
    delete: (o: Objetivo) => objetivos.deleteItem(o, '¿Eliminar objetivo?'),
  };

  const onDragEndObjetivos = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = objetivos.items.findIndex((o) => String(o.id) === String(active.id));
    const newIndex = objetivos.items.findIndex((o) => String(o.id) === String(over.id));

    if (oldIndex === -1 || newIndex === -1) return;

    const reOrdered = arrayMove(objetivos.items, oldIndex, newIndex).map((o, idx) => ({
      ...o,
      orden: idx + 1,
    }));

    objetivos.setItems(reOrdered); // optimista
    const items = reOrdered.map((o) => ({ id: o.id, orden: o.orden ?? 0 }));
    router.post(route("proyectos.objetivos.reorder", proyecto.id), { items }, { preserveScroll: true });
  }

  // columnas = etapas + "Sin etapa"
  const columnas = React.useMemo(
    () => [{ id: null, nombre: "Sin etapa" }, ...((proyecto.etapas ?? []).sort((a, b) => a.orden - b.orden).map(e => ({ id: e.id, nombre: e.nombre })))],
    [proyecto.etapas]
  );

  // Agrupa tareas por columna ("col-null" o "col-<id>")
  const initialCols = React.useMemo(() => {
    const base: Record<string, any[]> = { ["col-null"]: [] };
    (proyecto.etapas ?? []).forEach(e => base[`col-${e.id}`] = []);
    (proyecto.tareas ?? []).forEach((t: any) => {
      const key = t.proyecto_etapa_id ? `col-${t.proyecto_etapa_id}` : "col-null";
      base[key] ??= [];
      base[key].push(t);
    });
    Object.keys(base).forEach(k => base[k].sort((a, b) => (a.ranking ?? 0) - (b.ranking ?? 0)));
    return base;
  }, [proyecto.etapas, proyecto.tareas]);

  // Persistencia al mover (ajusta a tu ruta real)
  async function onServerMove(tareaId: number, etapaId: number | null, newIndex: number) {
    await router.post(route("proyectos.kanban.reorder", proyecto.id), {
      moves: [{ tarea_id: tareaId, to_etapa_id: etapaId, new_index: newIndex }]
    }, { preserveScroll: true });
  }

  // ======= UI =======
  return (
    <div className="p-6 space-y-6">
      <Head title={`Proyecto · ${proyecto.nombre}`} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={route("proyectos.index")}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{proyecto.nombre}</h1>
          {proyecto.estrategico && <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />}
          <Badge className={prioChip(proyecto.prioridad)}>{proyecto.prioridad}</Badge>
          <Badge variant={proyecto.status === "cerrado" ? "default" : "outline"}>
            {proyecto.status === "cerrado" ? "Completado" : "En progreso"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={projectActions.recompute}>
            <Settings2 className="mr-2 h-4 w-4" />
            Recalcular
          </Button>
          {proyecto.status === "abierto" ? (
            <Button variant="outline" onClick={projectActions.close}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Cerrar
            </Button>) : (
            <Button variant="outline" onClick={projectActions.open}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reabrir
            </Button>
          )}
          <Button onClick={projectActions.save} disabled={generalForm.processing}>Guardar</Button>
        </div>
      </div>

      {/* Resumen arriba */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Progreso
            </div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Progreso General</span>
              <span>{(proyecto.progreso_pct ?? 0).toFixed(1)}%</span>
            </div>
            <Progress value={proyecto.progreso_pct ?? 0} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> Fechas (plan)
            </div>
            <div className="text-sm">
              <div>Inicio: {fmt(proyecto.fec_inicio_plan) || "—"}</div>
              <div>Fin: {fmt(proyecto.fec_fin_plan) || "—"}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> Fechas (real)
            </div>
            <div className="text-sm">
              <div>Inicio: {fmt(proyecto.fec_inicio_real) || "—"}</div>
              <div>Fin: {fmt(proyecto.fec_fin_real) || "—"}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpRightFromCircle className="h-4 w-4" />
              Próxima acción
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Modo</Label>
                <Select value={proximaForm.data.modo} onValueChange={(v) => proximaForm.setData("modo", v as "auto" | "manual")}>
                  <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">auto</SelectItem>
                    <SelectItem value="manual">manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* {prox.data.modo === "manual" && ( */}
              {proximaForm.data.modo === "manual" && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Tarea (ID)</Label>
                    <Input value={proximaForm.data.tarea_id ?? ""} onChange={(e) => proximaForm.setData("tarea_id", e.target.value)} placeholder="Ej. 123" />
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={route("tareas.index", { proyecto_id: proyecto.id })}>Buscar</Link>
                  </Button>
                </div>
              )}
              <div className="flex justify-end">
                <Button size="sm" onClick={saveProxima} disabled={proximaForm.processing}>Guardar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="etapas">Etapas</TabsTrigger>
          <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del proyecto</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Nombre</Label>
                <Input value={generalForm.data.nombre} onChange={(e) => generalForm.setData("nombre", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <Label>Descripción</Label>
                <Textarea rows={3} value={generalForm.data.descripcion ?? ""} onChange={(e) => generalForm.setData("descripcion", e.target.value)} />
              </div>

              <div>
                <Label>Área</Label>
                <Select value={(generalForm.data.area_id ?? "") as any} onValueChange={(v) => {
                  const numValue = v === "" ? null : parseInt(v, 10);
                  generalForm.setData("area_id", numValue);
                }}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    {areas.map((a) => (<SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Owner</Label>
                <Select value={(generalForm.data.owner_id ?? "") as any} onValueChange={(v) => {
                  const numValue = v === "" ? null : parseInt(v, 10);
                  generalForm.setData("owner_id", numValue);
                }}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    {owners.map((o) => (<SelectItem key={o.id} value={String(o.id)}>{o.nombre}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioridad</Label>
                <Select value={generalForm.data.prioridad} onValueChange={(v) => generalForm.setData("prioridad", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">baja</SelectItem>
                    <SelectItem value="media">media</SelectItem>
                    <SelectItem value="alta">alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="estrategico" checked={generalForm.data.estrategico} onCheckedChange={(v) => generalForm.setData("estrategico", !!v)} />
                <Label htmlFor="estrategico">Estratégico</Label>
              </div>

              <div>
                <Label>Inicio plan</Label>
                <Input type="date" value={(generalForm.data.fec_inicio_plan as any) ?? ""} onChange={(e) => generalForm.setData("fec_inicio_plan", e.target.value || "")} />
              </div>
              <div>
                <Label>Fin plan</Label>
                <Input type="date" value={(generalForm.data.fec_fin_plan as any) ?? ""} onChange={(e) => generalForm.setData("fec_fin_plan", e.target.value || "")} />
              </div>

              <div>
                <Label>Inicio real</Label>
                <Input type="date" value={(generalForm.data.fec_inicio_real as any) ?? ""} onChange={(e) => generalForm.setData("fec_inicio_real", e.target.value || "")} />
              </div>
              <div>
                <Label>Fin real</Label>
                <Input type="date" value={(generalForm.data.fec_fin_real as any) ?? ""} onChange={(e) => generalForm.setData("fec_fin_real", e.target.value || "")} />
              </div>

              <div>
                <Label>Criterio de cierre</Label>
                <Select value={generalForm.data.criterio_cierre} onValueChange={(v) => generalForm.setData("criterio_cierre", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tareas">tareas</SelectItem>
                    <SelectItem value="objetivos">objetivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Objetivo principal</Label>
                <Input value={generalForm.data.objetivo_principal ?? ""} onChange={(e) => generalForm.setData("objetivo_principal", e.target.value)} />
              </div>

              <div>
                <Label>Estado</Label>
                <Select value={generalForm.data.status} onValueChange={(v) => generalForm.setData("status", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abierto">abierto</SelectItem>
                    <SelectItem value="cerrado">cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={projectActions.recompute}><Settings2 className="mr-2 h-4 w-4" />Recalcular</Button>
                <Button onClick={projectActions.save} disabled={generalForm.processing}>Guardar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Etapas */}
        <TabsContent value="etapas" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Etapas</CardTitle>
              <div className="flex gap-2">
                <Dialog open={etapasDialog.isOpen} onOpenChange={etapasDialog.setIsOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva etapa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{etapasDialog.form.data.id ? "Editar etapa" : "Nueva etapa"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Label>Nombre</Label>
                        <Input value={etapasDialog.form.data.nombre} onChange={(e) => etapasDialog.form.setData("nombre", e.target.value)} />
                      </div>
                      <div>
                        <Label>Orden</Label>
                        <Input type="number" value={etapasDialog.form.data.orden as any} onChange={(e) => etapasDialog.form.setData("orden", Number(e.target.value))} />
                      </div>
                      <div>
                        <Label>Progreso %</Label>
                        <Input type="number" value={(etapasDialog.form.data.progreso_pct as any) ?? ""} onChange={(e) => etapasDialog.form.setData("progreso_pct", e.target.value)} />
                      </div>
                      <div>
                        <Label>Inicio plan</Label>
                        <Input type="date" value={(etapasDialog.form.data.fecha_inicio_plan as any) ?? ""} onChange={(e) => etapasDialog.form.setData("fecha_inicio_plan", e.target.value || "")} />
                      </div>
                      <div>
                        <Label>Fin plan</Label>
                        <Input type="date" value={(etapasDialog.form.data.fecha_fin_plan as any) ?? ""} onChange={(e) => etapasDialog.form.setData("fecha_fin_plan", e.target.value || "")} />
                      </div>
                      <div>
                        <Label>Inicio real</Label>
                        <Input type="date" value={(etapasDialog.form.data.fecha_inicio_real as any) ?? ""} onChange={(e) => etapasDialog.form.setData("fecha_inicio_real", e.target.value || "")} />
                      </div>
                      <div>
                        <Label>Fin real</Label>
                        <Input type="date" value={(etapasDialog.form.data.fecha_fin_real as any) ?? ""} onChange={(e) => etapasDialog.form.setData("fecha_fin_real", e.target.value || "")} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="done" checked={!!etapasDialog.form.data.done} onCheckedChange={(v) => etapasDialog.form.setData("done", !!v)} />
                        <Label htmlFor="done">Completada</Label>
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button onClick={() => etapasDialog.submit()} disabled={etapasDialog.form.processing}>
                        Guardar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {etapas.items.length === 0 && <p className="text-sm text-muted-foreground">Sin etapas.</p>}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndEtapas}>
                <SortableContext items={etapas.items.map((e) => String(e.id))} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {etapas.items.map((e, i) => (
                      <SortableRow key={e.id} id={String(e.id)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-sm font-medium"> {e.orden}. {e.nombre}</span>
                              <Badge variant={e.done ? "default" : "secondary"}>{e.done ? "done" : "pendiente"}</Badge>
                            </div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span>Progreso: {Math.round(e.progreso_pct ?? 0)}%</span>
                            </div>
                            <Progress value={e.progreso_pct ?? 0} />
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                Plan: {fmt(e.fecha_inicio_plan)} → {fmt(e.fecha_fin_plan)}
                              </div>
                              <div>
                                Real: {fmt(e.fecha_inicio_real)} → {fmt(e.fecha_fin_real)}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col gap-1">
                            <Button size="icon" variant="outline" onClick={() => etapaActions.openEdit(e)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                            <Button size="icon" variant="outline" onClick={() => etapaActions.toggle(e)} title="Toggle done"><CheckCircle2 className="h-4 w-4" /></Button>
                            <Button size="icon" variant="outline" onClick={() => etapaActions.delete(e)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </SortableRow>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Objetivos */}
        < TabsContent value="objetivos" className="mt-4" >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Objetivos</CardTitle>
              <div className="flex gap-2">
                <Dialog open={objetivosDialog.isOpen} onOpenChange={objetivosDialog.setIsOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo objetivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{objetivosDialog.form.data.id ? "Editar objetivo" : "Nuevo objetivo"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label>Descripción</Label>
                        <Input value={objetivosDialog.form.data.descripcion} onChange={(e) => objetivosDialog.form.setData("descripcion", e.target.value)} />
                      </div>
                      <div>
                        <Label>Fecha objetivo</Label>
                        <Input type="date" value={objetivosDialog.form.data.fecha_objetivo || ""} onChange={(e) => objetivosDialog.form.setData("fecha_objetivo", e.target.value)} />
                      </div>
                      <div>
                        <Label>Orden</Label>
                        <Input type="number" value={objetivosDialog.form.data.orden as any} onChange={(e) => objetivosDialog.form.setData("orden", Number(e.target.value))} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="cumplido" checked={!!objetivosDialog.form.data.cumplido} onCheckedChange={(v) => objetivosDialog.form.setData("cumplido", !!v)} />
                        <Label htmlFor="cumplido">Cumplido</Label>
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button onClick={objetivoActions.submit} disabled={objetivosDialog.form.processing}>Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {objetivos.items.length === 0 && <p className="text-sm text-muted-foreground">Sin objetivos.</p>}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndObjetivos}>
                <SortableContext items={objetivos.items.map((o) => String(o.id))} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {objetivos.items.map((o, i) => (
                      <SortableRow key={o.id} id={String(o.id)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <Checkbox checked={!!o.cumplido} onCheckedChange={() => objetivoActions.toggle(o)} />
                              <span className={`text-sm ${o.cumplido ? "line-through text-muted-foreground" : "font-medium"}`}>
                                {o.orden ?? i + 1}. {o.descripcion}
                              </span>
                              {o.fecha_objetivo && (<Badge variant="secondary">{fmt(o.fecha_objetivo)}</Badge>)}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col gap-1">
                            <Button size="icon" variant="outline" onClick={() => objetivoActions.openEdit(o)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                            <Button size="icon" variant="outline" onClick={() => objetivoActions.delete(o)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </SortableRow>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <KanbanEtapas columnas={columnas} initialCols={initialCols} onServerMove={onServerMove} />
    </div >
  );
}

function SortableRow({ id, children, disabled = false, className = "", }: {
  id: string | number; children: React.ReactNode; disabled?: boolean; className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled, });

  const style = { transform: CSS.Transform.toString(transform), transition, };

  return (
    <div ref={setNodeRef} style={style as any} className={`rounded-lg border p-3 bg-background ${isDragging ? "opacity-70 ring-2 ring-primary/30" : ""} ${className}`} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
