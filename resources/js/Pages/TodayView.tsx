import { useMemo, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Progress } from "@/Components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/Components/ui/dropdown-menu";
import { PomodoroTimer } from "./Pomodoro";
import TareasForm from "./TareasForm";
import { TaskMetaBar } from "./TaskMetaBar";
import { CheckCircle2, Circle, Star, Clock, DollarSign, Play, Plus, Zap, AlertTriangle, Flame, Edit, MoreHorizontal, TrendingUp, Target, } from "lucide-react";

// Tip: ajusta el tipo si quieres tipado estricto de Tarea
type AnyTask = any;

type Catalogo = { id: number; nombre: string };

interface DashboardPageProps {
  tasksToday: AnyTask[];
  capacidadDia?: number;
  errors?: any;
  deferred?: Record<string, string[] | undefined>;
  [key: string]: any;
}

export function TodayView() {
  // 1) Datos reales desde el servidor (pasados en Inertia::render)
  //    Espera que tu controlador comparta: tasksToday (array) y, opcionalmente, capacidadDia (número)
  const { tasksToday = [], capacidadDia: capacidadDiaProp } = usePage<DashboardPageProps>().props;
  const { areas = [], contextos = [] } = usePage().props as { areas?: Catalogo[]; contextos?: Catalogo[] };
  // 2) UI local (solo para modal del form)
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<AnyTask | null>(null);

  // 3) Capacidad del día (si no llega del server, 480)
  const capacidadDia = capacidadDiaProp ?? 480; // 8 hours in minutes

  // 4) Acciones rápidas al backend (POST a rutas cortas). Sin axios.
  const toggleTask = (id: number) => { router.post(route("tareas.quick.toggle-complete", id), {}, { preserveScroll: true }); };

  const handleEditTask = (task: AnyTask) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleMarkFrog = (taskId: number) => { router.post(route("tareas.quick.mark-frog", taskId), {}, { preserveScroll: true }); };
  const handleToggleRock = (taskId: number) => { router.post(route("tareas.quick.toggle-rock", taskId), {}, { preserveScroll: true }); };
  const handleBoost24h = (taskId: number) => { router.post(route("tareas.quick.boost-24h", taskId), {}, { preserveScroll: true }); };

  // 5) Helpers visuales
  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case "Q1": return "bg-red-100 text-red-800 border-red-200";
      case "Q2": return "bg-green-100 text-green-800 border-green-200";
      case "Q3": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Q4": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMoscowColor = (moscow: string) => {
    switch (moscow) {
      case "M": return "bg-red-500";
      case "S": return "bg-orange-500";
      case "C": return "bg-blue-500";
      case "W": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getKashIcon = (kash: string) => {
    switch (kash) {
      case "K": return "🧠";
      case "A": return "💪";
      case "S": return "🎯";
      case "H": return "🔄";
      default: return "";
    }
  };

  const hasBoost = (task: AnyTask) => task.score_boost_until && new Date(task.score_boost_until) > new Date();

  // 6) Derivados (memo para no recalcular en cada render)
  const { frogTask, rockTasks, normalTasks, blockedTasks, completedTasks, totalTasks, progressPercentage, costoSeleccion, capacidadRestante, semaforoCapacidad, } = useMemo(() => {
    const tareas = Array.isArray(tasksToday) ? tasksToday : [];

    const frog = tareas.find((t) => t.frog && t.estado === "hoy");
    const rocks = tareas.filter((t) => t.is_rock && t.estado === "hoy");
    const normals = tareas.filter((t) => !t.frog && !t.is_rock && t.estado === "hoy" && !t.bloqueada).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const blocked = tareas.filter((t) => t.bloqueada && t.estado === "hoy");

    const completed = tareas.filter((t) => t.completed && t.estado === "hoy").length;
    const total = tareas.filter((t) => t.estado === "hoy").length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    const costo = tareas.filter((t) => t.estado === "hoy" && !t.completed).reduce((acc, t) => acc + (t.pomos_estimados ?? 0) * 25, 0);

    const capRest = capacidadDia - costo;
    const semaforo = capRest >= 15 ? "verde" : capRest >= 0 ? "amarillo" : "rojo";

    return {
      frogTask: frog,
      rockTasks: rocks,
      normalTasks: normals,
      blockedTasks: blocked,
      completedTasks: completed,
      totalTasks: total,
      progressPercentage: progress,
      costoSeleccion: costo,
      capacidadRestante: capRest,
      semaforoCapacidad: semaforo,
    };
  }, [tasksToday, capacidadDia]);

  // === Helpers de fecha/tiempo
  const daysDiff = (d?: string | null) => {
    if (!d) return null;
    const a = new Date(new Date(d).toDateString()).getTime();
    const b = new Date(new Date().toDateString()).getTime();
    return Math.floor((a - b) / (1000 * 60 * 60 * 24));
  };

  const sinceDays = (d?: string | null) => {
    if (!d) return null;
    const ms = Date.now() - new Date(d).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  };

  // Eisenhower (Q1..Q4) derivado de flags
  const getQuadrant = (t: AnyTask) => {
    const imp = !!t.eisen_importante;
    const urg = !!t.eisen_urgente;
    if (imp && urg) return "Q1";
    if (imp && !urg) return "Q2";
    if (!imp && urg) return "Q3";
    return "Q4";
  };

  // Color del chip Q*
  const quadrantColor = (q: string) => {
    switch (q) {
      case "Q1": return "bg-red-100 text-red-800 border-red-200";
      case "Q2": return "bg-green-100 text-green-800 border-green-200";
      case "Q3": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // SLA semáforo por sla_fecha
  const slaSemaforo = (t: AnyTask) => {
    const d = daysDiff(t.sla_fecha);
    if (d === null) return { label: "sin SLA", className: "bg-gray-100 text-gray-700" };
    if (d < 0) return { label: "SLA vencido", className: "bg-red-100 text-red-700" };
    if (d <= 2) return { label: `SLA ${d}d`, className: "bg-amber-100 text-amber-800" };
    return { label: `SLA OK (${d}d)`, className: "bg-emerald-100 text-emerald-800" };
  };

  // Due D-? por fecha_limite
  const dueBadge = (t: AnyTask) => {
    const d = daysDiff(t.fecha_limite);
    if (d === null) return null;
    if (d < 0) return { label: `Vencida ${Math.abs(d)}d`, className: "bg-red-100 text-red-700" };
    if (d === 0) return { label: "Hoy", className: "bg-amber-100 text-amber-800" };
    return { label: `D-${d}`, className: "bg-blue-100 text-blue-800" };
  };



  // Etiquetas legibles de relaciones (con fallback a *_id)
  const projectLabel = (t: AnyTask) =>
    t.proyecto?.nombre ?? (t.proyecto_id ? `Proyecto #${t.proyecto_id}` : null);
  const areaLabel = (t: AnyTask) =>
    t.area?.nombre ?? (t.area_id ? `Área #${t.area_id}` : null);
  const ctxLabel = (t: AnyTask) =>
    t.contexto?.nombre ?? (t.contexto_id ? `Ctx #${t.contexto_id}` : null);
  const respLabel = (t: AnyTask) =>
    t.responsable?.nombre ?? (t.responsable_id ? `Resp #${t.responsable_id}` : null);

  const logPomodoro = (taskId: number, minutos = 25) => {
    router.post(route("tareas.pomodoro", taskId), { minutos }, { preserveScroll: true });
  };
  const addInteres = (taskId: number) => {
    router.post(route("tareas.interes", taskId), {}, { preserveScroll: true });
  };

  // 7) Card de tarea (respetando tu UI)
  const TaskCard = ({ task, showActions = true }: { task: AnyTask; showActions?: boolean; }) => (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:shadow-sm transition-shadow">
      <Button variant="ghost" size="sm" onClick={() => toggleTask(task.id)} className="p-0 h-auto">
        {task.completed ? (<CheckCircle2 className="h-5 w-5 text-accent" />) : (<Circle className="h-5 w-5" />)}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-medium text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.titulo}</p>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                  <Edit className="h-3 w-3 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMarkFrog(task.id)}>
                  <Star className="h-3 w-3 mr-2" />
                  Marcar Frog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleRock(task.id)}>
                  <Zap className="h-3 w-3 mr-2" />
                  {task.is_rock ? "Quitar" : "Marcar"} Rock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBoost24h(task.id)}>
                  <TrendingUp className="h-3 w-3 mr-2" />
                  Boost 24h
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <TaskMetaBar
          task={task}
          onDivide={(t) => {
            // abre modal para crear subtareas
            // por ahora: console.log; cámbialo por tu flujo
            console.log("Dividir tarea", t.id);
          }}
          onReestimate={(t) => {
            // abre UI para ajustar pomos_estimados
            console.log("Re-estimar tarea", t.id);
          }}
        />

        {/* SLA + Due + Delegación + Interés */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* SLA */}
          {(() => {
            const sla = slaSemaforo(task);
            return <Badge variant="secondary" className={`text-xs ${sla.className}`}>{sla.label}</Badge>;
          })()}

          {/* Due */}
          {(() => {
            const due = dueBadge(task);
            return due ? <Badge variant="outline" className={`text-xs ${due.className}`}>{due.label}</Badge> : null;
          })()}

          {/* Delegación */}
          {(task.delegation_level_applied || task.delegation_level_rec) && (
            <Badge variant="outline" className="text-xs">
              Lvl {task.delegation_level_applied ?? "—"}{/* */}{task.delegation_level_rec ? ` (rec ${task.delegation_level_rec})` : ""}
            </Badge>
          )}

          {/* Responsable */}
          {respLabel(task) && (<Badge variant="outline" className="text-xs">{respLabel(task)}</Badge>)}

          {/* Proyecto / Área / Contexto */}
          {projectLabel(task) && (<Badge variant="outline" className="text-xs">{projectLabel(task)}</Badge>)}
          {areaLabel(task) && (<Badge variant="outline" className="text-xs">{areaLabel(task)}</Badge>)}
          {ctxLabel(task) && (<Badge variant="secondary" className="text-xs">{ctxLabel(task)}</Badge>)}

          {/* 👀 Interés */}
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span>👀 {task.interest_hits ?? 0}</span>
            {task.interest_last_at && (
              <Badge variant="outline" className="text-[10px]">
                preguntaron hace {sinceDays(task.interest_last_at)}d
              </Badge>
            )}
            <Button type="button" size="sm" variant="ghost" onClick={() => addInteres(task.id)}>+</Button>
            {/* Botón “–” solo si implementas ruta */}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {task.pomos_realizados ?? 0}/{task.pomos_estimados ?? 0} pomos
          </Badge>

          <Badge className={`text-xs ${quadrantColor(getQuadrant(task))}`}>
            {getQuadrant(task)}
          </Badge>

          <div className={`w-2 h-2 rounded-full ${getMoscowColor(task.moscow)}`} title={`MoSCoW: ${task.moscow ?? "-"}`} />

          {task.horizon && (<Badge variant="outline" className="text-xs">{task.horizon}</Badge>)}

          {typeof task.score === "number" && (<Badge variant="outline" className="text-xs font-mono">{task.score.toFixed(1)}</Badge>)}

          {task.kash && (<span className="text-xs" title={`KASH: ${task.kash}`}>{getKashIcon(task.kash)}</span>)}

          {task.pareto && (
            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
              <Zap className="h-3 w-3 mr-1" />
              20%
            </Badge>)}

          {hasBoost(task) && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
              <Flame className="h-3 w-3 mr-1" />
              Boost
            </Badge>)}

          {task.family_friendly && (<Badge variant="outline" className="text-xs">👨‍👩‍👧‍👦</Badge>)}

          {task.riesgo_oportunidad !== 0 && (
            <Badge variant="outline" className={`text-xs ${task.riesgo_oportunidad > 0 ? "text-green-600" : "text-red-600"}`}>
              {task.riesgo_oportunidad > 0 ? "📈" : "📉"}
            </Badge>)}
        </div>

        {projectLabel(task) && (<p className="text-xs text-muted-foreground mt-1">📁 {projectLabel(task)}</p>)}

        {task.detalle_md && (<p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.detalle_md}</p>)}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => logPomodoro(task.id, 25)} title="Log 25 min">
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const openCreate = () => { setEditingTask(null); setShowTaskForm(true); };


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Hoy</h1>
          <p className="text-muted-foreground">{new Date().toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", })}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progreso del día</p>
            <p className="text-lg font-semibold">{completedTasks}/{totalTasks} tareas</p>
          </div>
          <Progress value={progressPercentage} className="w-24" />
        </div>
      </div>

      <Card className={`border-l-4 ${semaforoCapacidad === "verde" ? "border-l-green-500 bg-green-50/50" : semaforoCapacidad === "amarillo" ? "border-l-yellow-500 bg-yellow-50/50" : "border-l-red-500 bg-red-50/50"}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Capacidad del día</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Costo selección: {Math.floor(costoSeleccion / 60)}h {costoSeleccion % 60}m</p>
              <p className={`font-semibold ${semaforoCapacidad === "verde" ? "text-green-600" : semaforoCapacidad === "amarillo" ? "text-yellow-600" : "text-red-600"}`}>
                {capacidadRestante >= 0 ? `Te quedan ${Math.floor(capacidadRestante / 60)}h ${capacidadRestante % 60}m` : `Sobrepasas por ${Math.floor(Math.abs(capacidadRestante) / 60)}h ${Math.abs(capacidadRestante) % 60}m`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal formulario (crear/editar) */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <TareasForm initial={editingTask ?? undefined} submitRoute={editingTask ? "tareas.update" : "tareas.store"} method={editingTask ? "put" : "post"} onClose={() => { setShowTaskForm(false); setEditingTask(null); }} areas={areas} contextos={contextos} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                Frog del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              {frogTask ? (<TaskCard task={frogTask} />) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tienes un Frog del día asignado</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={openCreate}>Crear Frog</Button>
                </div>)}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-chart-4" />
                3 Rocas (Alto Impacto)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rockTasks.map((task: AnyTask) => (<TaskCard key={task.id} task={task} />))}
              {rockTasks.length < 3 && (
                <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p className="text-sm">Tienes {rockTasks.length}/3 rocas del día</p>
                  <Button variant="ghost" size="sm" className="mt-1" onClick={openCreate}>
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar Rock
                  </Button>
                </div>)}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle>Cola de Tareas (Por Score)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {normalTasks.map((task: AnyTask) => (<TaskCard key={task.id} task={task} />))}
            </CardContent>
          </Card>

          {blockedTasks.length > 0 && (
            <Card className="mt-4 border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  Tareas Bloqueadas ({blockedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {blockedTasks.map((task: AnyTask) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-orange-100/50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">{task.titulo}</p>
                      {task.bloqueo_motivo && (<p className="text-xs text-orange-700">{task.bloqueo_motivo}</p>)}
                      {task.seguimiento_proximo && (<p className="text-xs text-orange-600 mt-1">Próximo seguimiento: {new Date(task.seguimiento_proximo).toLocaleDateString()}</p>)}
                    </div>
                    <Button size="sm" variant="outline" className="text-orange-700 border-orange-300 bg-transparent">Ping</Button>
                  </div>))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          <PomodoroTimer />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Próximos Cobros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Cliente XYZ</p>
                  <p className="text-xs text-muted-foreground">Vence hoy</p>
                </div>
                <Badge variant="destructive" className="text-xs">$15,000</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Proyecto ABC</p>
                  <p className="text-xs text-muted-foreground">Vence mañana</p>
                </div>
                <Badge variant="secondary" className="text-xs">$8,500</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hábitos de Hoy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span className="text-sm">Ejercicio matutino</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  <Flame className="h-3 w-3 mr-1" /> 15
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                <span className="text-sm">Leer 30 min</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  <Flame className="h-3 w-3 mr-1" /> 8
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                <span className="text-sm">Meditar 10 min</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  <Flame className="h-3 w-3 mr-1" /> 22
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leyenda de Priorización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>M = Must (Crítico)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>S = Should (Importante)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>C = Could (Deseable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-yellow-600" />
                  <span>20% = Top Pareto</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-3 w-3 text-orange-600" />
                  <span>Boost 24h activo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🧠</span>
                  <span>K=Conocimiento A=Actitud S=Skill H=Hábito</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📈📉</span>
                  <span>Riesgo/Oportunidad</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}