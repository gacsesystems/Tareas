import { useEffect, useMemo, useState } from "react";
import { useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/Components/ui/select";
import { Calendar as CmpCalendar } from "@/Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/Components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Slider } from "@/Components/ui/slider";
import { Badge } from "@/Components/ui/badge";
import { FieldLabel } from "@/Components/FieldHelp";
import { Calendar as CalendarIcon, Save, Trash2, X, Plus, Info } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Tarea = {
  id?: number;
  titulo: string;
  detalle_md?: string;
  proyecto_id?: number | string | null;
  proyecto_etapa_id?: number | string | null;
  estado?: string;
  fecha?: string | null;
  fecha_limite?: string | null;
  seguimiento_proximo?: string | null;
  responsable_id?: number | string | null;
  tipo?: string;
  area_id?: number | string | null;
  contexto_id?: number | string | null;

  moscow?: "M" | "S" | "C" | "W" | "";
  horizon?: "H1" | "H2" | "H3" | "";
  eisen_importante?: boolean;
  eisen_urgente?: boolean;

  impacto?: number;
  valor?: number;
  eficiencia?: number;
  stakeholders?: number;
  urgencia_manual?: number;

  kash?: "K" | "A" | "S" | "H" | "";
  family_friendly?: boolean;
  is_rock?: boolean;
  frog?: boolean;
  frog_date?: string | null;

  pomos_estimados?: number;
  pomos_realizados?: number;
  tiempo_total_min?: number;

  score?: number;
  ranking?: number;
  pareto?: boolean;

  bloqueada?: boolean;
  bloqueo_motivo?: string | null;

  score_boost_until?: string | null;
  score_boost_factor?: number | null;

  riesgo_oportunidad?: number | null;

  habito_id?: number | string | null;

  dificultad?: "trivial/mecánico" | "requiere_pensar_leer_investigar" | "muy_exigente" | "";
  kaizen?: boolean;

  delegation_level_rec?: number | null;
  delegation_level_applied?: number | null;
  skill_override?: number | null;
  will_override?: number | null;

  sla_fecha?: string | null;
};

type Catalogo = { id: number; nombre: string };

export default function TareasForm({ initial, onClose, submitRoute, // string route name (store/update)
  method = "post", areas = [], contextos = [] }: {// "post" | "put"
    initial?: Partial<Tarea>; onClose?: () => void; submitRoute: string; method?: "post" | "put",
    areas?: Catalogo[]; contextos?: Catalogo[];
  }) {
  const isEdit = !!initial?.id;
  const [openWhy, setOpenWhy] = useState(false);

  const { data, setData, processing, errors, clearErrors } = useForm<Tarea>({
    // ===== Básico
    titulo: initial?.titulo ?? "",
    detalle_md: initial?.detalle_md ?? "",
    proyecto_id: initial?.proyecto_id ?? "",
    proyecto_etapa_id: initial?.proyecto_etapa_id ?? "",
    estado: initial?.estado ?? "hoy",
    responsable_id: initial?.responsable_id ?? "",
    tipo: initial?.tipo ?? "tarea",
    area_id: initial?.area_id ?? "",
    contexto_id: initial?.contexto_id ?? "",

    // fechas
    fecha: initial?.fecha ?? new Date().toISOString().substring(0, 10),
    fecha_limite: initial?.fecha_limite ?? null,
    seguimiento_proximo: initial?.seguimiento_proximo ?? null,
    sla_fecha: initial?.sla_fecha ?? null,

    // toggles claves
    is_rock: initial?.is_rock ?? false,
    frog: initial?.frog ?? false,
    pareto: initial?.pareto ?? false,
    bloqueada: initial?.bloqueada ?? false,
    bloqueo_motivo: initial?.bloqueo_motivo ?? "",

    // pomos & ranking
    pomos_estimados: initial?.pomos_estimados ?? 1,
    pomos_realizados: initial?.pomos_realizados ?? 0,
    ranking: initial?.ranking ?? 1000,

    // ===== Avanzado (oculto/tab)
    moscow: (initial?.moscow as any) ?? "",
    horizon: (initial?.horizon as any) ?? "",
    eisen_importante: initial?.eisen_importante ?? false,
    eisen_urgente: initial?.eisen_urgente ?? false,

    impacto: initial?.impacto ?? 5,
    valor: initial?.valor ?? 5,
    eficiencia: initial?.eficiencia ?? 5,
    stakeholders: initial?.stakeholders ?? 5,
    urgencia_manual: initial?.urgencia_manual ?? 0,

    kash: (initial?.kash as any) ?? "",
    family_friendly: initial?.family_friendly ?? false,

    frog_date: initial?.frog_date ?? null,

    score: initial?.score ?? 0,

    // boost (readonly en UI)
    score_boost_until: initial?.score_boost_until ?? null,
    score_boost_factor: initial?.score_boost_factor ?? null,

    riesgo_oportunidad: initial?.riesgo_oportunidad ?? null,

    // opcionales extra
    habito_id: initial?.habito_id ?? "",
    dificultad: (initial?.dificultad as any) ?? "",
    kaizen: initial?.kaizen ?? false,

    delegation_level_rec: initial?.delegation_level_rec ?? null,
    delegation_level_applied: initial?.delegation_level_applied ?? null,
    skill_override: initial?.skill_override ?? null,
    will_override: initial?.will_override ?? null,
  });

  useEffect(() => () => clearErrors(), []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "put" && initial?.id) {
      router.put(route(submitRoute, initial.id), data, { onSuccess: () => onClose?.(), });
    } else {
      router.post(route(submitRoute), data, {
        onSuccess: () => onClose?.(),
        onError: (errs) => console.log('VALIDATION', errs)
      });
    }
  };

  const deleteTarea = () => {
    if (initial?.id && confirm("¿Eliminar tarea? Esta acción no se puede deshacer.")) {
      router.delete(route("tareas.destroy", initial.id), { onSuccess: () => onClose?.(), });
    }
  };

  const quickAddArea = async () => {
    const nombre = prompt("Nombre del área:");
    if (!nombre) return;
    router.post(route("areas.store"), { nombre }, {
      onSuccess: (page) => {
        if (Array.isArray(page?.props?.areas)) {
          const nuevaArea = page.props.areas.find((a: Catalogo) => a.nombre === nombre);
          if (nuevaArea) {
            setData("area_id", String(nuevaArea.id));
          }
        }
      }
    });
  };

  // ===== Score estimado (sólo para el modal “¿Por qué este orden?”)
  const scoreEstimado = useMemo(() => {
    // Urgencia derivada simple
    const hoy = new Date();
    const due = data.fecha_limite ? new Date(data.fecha_limite) : null;
    let urgDeriv = 0;
    if (due) {
      // días restantes (negativo si vencida)
      const ms = due.getTime() - new Date(hoy.toDateString()).getTime();
      const dias = Math.floor(ms / (1000 * 60 * 60 * 24));
      if (dias <= 0) urgDeriv = 10;
      else if (dias <= 1) urgDeriv = 9;
      else if (dias <= 2) urgDeriv = 8;
      else if (dias <= 3) urgDeriv = 7;
      else if (dias <= 5) urgDeriv = 6;
      else if (dias <= 7) urgDeriv = 5;
      else if (dias <= 14) urgDeriv = 4;
      else if (dias <= 30) urgDeriv = 3;
      else urgDeriv = 2;
    } else {
      urgDeriv = data.urgencia_manual ?? 0; // default 3/10 viene de backend, aquí respetamos override si lo ponen
    }

    const impacto = Number(data.impacto ?? 0);
    const valor = Number(data.valor ?? 0);
    const eficiencia = Number(data.eficiencia ?? 0);
    const stakeholders = Number(data.stakeholders ?? 0);

    // MCDA base 0..100
    const mcda =
      0.30 * impacto +
      0.25 * valor +
      0.20 * urgDeriv +
      0.15 * eficiencia +
      0.10 * stakeholders;
    let mult = 1;

    // Multiplicadores principales (aprox a tu modelo)
    if (data.is_rock) mult *= 1.15;
    if (data.frog) mult *= 1.2;
    if (data.pareto) mult *= 1.1;
    if (data.family_friendly) mult *= 1.0; // sólo filtro en vistas
    if (data.kash === "S" || data.kash === "H") mult *= 1.1;

    // boost (si activo y no bloqueada)
    const boostActivo = data.score_boost_until && new Date(data.score_boost_until) > new Date() && !data.bloqueada;
    if (boostActivo) {
      const f = Math.min(Number(data.score_boost_factor ?? 1.15), 1.2);
      mult *= Math.max(1.0, f);
    }

    // Riesgo/Oportunidad
    if (typeof data.riesgo_oportunidad === "number" && !isNaN(data.riesgo_oportunidad)) {
      mult *= 1 + Math.max(-0.2, Math.min(0.2, data.riesgo_oportunidad));
    }

    // Decaimiento por antigüedad (tope 40% de piso en tu modelo real; aquí simplificado)
    // bonus de antigüedad a 6 semanas (hasta +30%) según tu nota:
    const created = data.fecha ? new Date(data.fecha) : null;
    if (created) {
      const semanas = Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 7)));
      const bonusAnt = Math.min(0.05 * semanas, 0.30);
      mult *= 1 + bonusAnt;
    }

    // Bloqueada penaliza fuerte
    if (data.bloqueada) mult *= 0.2;

    const final = Math.round(mcda * mult * 10) / 10; // 1 decimal
    // clamp 0..100 para visual simple
    return Math.max(0, Math.min(100, final));
  }, [data.impacto, data.valor, data.eficiencia, data.stakeholders, data.urgencia_manual, data.fecha_limite, data.fecha, data.is_rock,
  data.frog, data.pareto, data.family_friendly, data.kash, data.score_boost_until, data.score_boost_factor, data.bloqueada, data.riesgo_oportunidad,]);

  return (
    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{isEdit ? "Editar Tarea" : "Nueva Tarea"}</CardTitle>

        <div className="flex items-center gap-2">
          {/* Score simple + modal */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              Score: {Number.isFinite(scoreEstimado) ? scoreEstimado.toFixed(1) : "—"}/100
            </Badge>
            <Dialog open={openWhy} onOpenChange={setOpenWhy}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="bg-transparent">
                  <Info className="h-4 w-4 mr-1" />
                  ¿Por qué este orden?
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                  <DialogTitle>¿Por qué este orden?</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Esto es un <strong>estimado local</strong> para ayudarte a entender el orden. El score real se recalcula en el servidor al guardar.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs uppercase text-muted-foreground">MCDA (0–100)</div>
                      <div>
                        Impacto {data.impacto}/10, Valor {data.valor}/10, Urgencia{" "}
                        {/* urgencia derivada simplificada en cálculo */}
                        {(data.urgencia_manual ?? 0)}?/10, Eficiencia {data.eficiencia}/10, Stake {data.stakeholders}/10
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-muted-foreground">Multiplicadores</div>
                      <ul className="list-disc list-inside">
                        <li>Frog {data.frog ? "+20%" : "—"}</li>
                        <li>Rock {data.is_rock ? "+15%" : "—"}</li>
                        <li>Pareto {data.pareto ? "+10%" : "—"}</li>
                        <li>KASH {data.kash === "S" || data.kash === "H" ? "+10%" : "—"}</li>
                        <li>Boost {data.score_boost_until && !data.bloqueada ? `${Math.round(((data.score_boost_factor ?? 1.15) - 1) * 100)}%` : "—"}</li>
                        <li>Riesgo/Oportunidad {typeof data.riesgo_oportunidad === "number" ? `${Math.round((data.riesgo_oportunidad) * 100)}%` : "—"}</li>
                        <li>Bloqueada {data.bloqueada ? "−80%" : "—"}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Badge className="font-mono">Estimado: {scoreEstimado.toFixed(1)}/100</Badge>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isEdit && (
            <Button variant="destructive" size="sm" onClick={deleteTarea} title="Eliminar tarea">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={submit} className="space-y-6">
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="basico">Básico</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
              <TabsTrigger value="avanzado">Avanzado</TabsTrigger>
            </TabsList>

            {/* ===== TAB: BÁSICO ===== */}
            <TabsContent value="basico" className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Título */}
                <div className="md:col-span-2">
                  <FieldLabel label="Título" fieldKey="titulo" requiredMark />
                  <Input
                    value={data.titulo || ""}
                    onChange={(e) => setData("titulo", e.target.value)}
                    maxLength={300}
                    placeholder="Escribe un resultado concreto"
                    required
                  />
                  {errors.titulo && <p className="text-xs text-red-600 mt-1">{errors.titulo}</p>}
                </div>

                {/* Detalle (Markdown simple → textarea por ahora) */}
                <div className="md:col-span-2">
                  <FieldLabel label="Detalle" fieldKey="detalle_md" />
                  <Textarea
                    rows={4}
                    value={data.detalle_md || ""}
                    onChange={(e) => setData("detalle_md", e.target.value)}
                    placeholder="Contexto, criterio de listo, enlaces…"
                  />
                </div>

                {/* Proyecto (placeholder Autocomplete) */}
                <div>
                  <FieldLabel label="Proyecto" fieldKey="proyecto_id" />
                  <Input
                    value={(data.proyecto_id as any) ?? ""}
                    onChange={(e) => setData("proyecto_id", e.target.value)}
                    placeholder="ID o nombre"
                  />
                </div>

                {/* Responsable (placeholder AvatarPicker) */}
                <div>
                  <FieldLabel label="Responsable" fieldKey="responsable_id" />
                  <Input
                    value={(data.responsable_id as any) ?? ""}
                    onChange={(e) => setData("responsable_id", e.target.value)}
                    placeholder="ID de persona"
                  />
                </div>

                {/* Área */}
                <div>
                  <FieldLabel label="Área" fieldKey="area_id" />
                  <div className="flex items-center gap-2">
                    <Select
                      value={String(data.area_id ?? "")}
                      onValueChange={(v) => setData("area_id", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {areas.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={quickAddArea} title="Crear área rápida">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.area_id && <p className="text-xs text-red-600 mt-1">{errors.area_id}</p>}
                </div>

                {/* Contexto */}
                <div>
                  <FieldLabel label="Contexto" fieldKey="contexto_id" />
                  <Select
                    value={String(data.contexto_id ?? "")}
                    onValueChange={(v) => setData("contexto_id", v)}
                  >
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {contextos.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.contexto_id && <p className="text-xs text-red-600 mt-1">{errors.contexto_id}</p>}
                </div>

                {/* Estado */}
                <div>
                  <FieldLabel label="Estado" fieldKey="estado" />
                  <Select
                    value={data.estado || "hoy"}
                    onValueChange={(v) => setData("estado", v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["backlog", "siguiente", "hoy", "en_curso", "en_revision", "hecha", "bloqueada"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.estado && <p className="text-xs text-red-600 mt-1">{errors.estado}</p>}
                </div>

                {/* Tipo */}
                <div>
                  <FieldLabel label="Tipo" fieldKey="tipo" />
                  <Select value={data.tipo || "tarea"} onValueChange={(v) => setData("tipo", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["tarea", "bug", "mejora", "investigacion", "consumo"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggles clave */}
                <div className="flex items-center gap-3">
                  <Switch checked={!!data.frog} onCheckedChange={(c) => setData("frog", c)} />
                  <FieldLabel label="Frog del día" fieldKey="frog" />
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={!!data.is_rock} onCheckedChange={(c) => setData("is_rock", c)} />
                  <FieldLabel label="Roca semanal" fieldKey="is_rock" />
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={!!data.pareto} onCheckedChange={(c) => setData("pareto", c)} />
                  <FieldLabel label="Top 20% (Pareto)" fieldKey="pareto" />
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={!!data.bloqueada} onCheckedChange={(c) => setData("bloqueada", c)} />
                  <FieldLabel label="Bloqueada" fieldKey="bloqueada" />
                </div>

                {data.bloqueada && (
                  <div className="md:col-span-2">
                    <FieldLabel label="Motivo de bloqueo" fieldKey="bloqueo_motivo" />
                    <Input
                      value={data.bloqueo_motivo ?? ""}
                      onChange={(e) => setData("bloqueo_motivo", e.target.value)}
                      placeholder="Falta insumo de X / espera aprobación"
                    />
                  </div>
                )}

                {/* Pomodoros & Ranking */}
                <div>
                  <FieldLabel label="Pomodoros estimados" fieldKey="pomos_estimados" />
                  <Input
                    type="number"
                    min={0}
                    value={data.pomos_estimados ?? 1}
                    onChange={(e) => setData("pomos_estimados", Number(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <FieldLabel label="Rank (orden manual)" fieldKey="ranking" />
                  <Input
                    type="number"
                    value={data.ranking ?? 1000}
                    onChange={(e) => setData("ranking", Number(e.target.value) || 1000)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* ===== TAB: PLAN ===== */}
            <TabsContent value="plan" className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fecha creación (editable) */}
                <div>
                  <FieldLabel label="Fecha" fieldKey="fecha" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.fecha ? format(new Date(data.fecha), "PPP", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CmpCalendar
                        mode="single"
                        selected={data.fecha ? new Date(data.fecha) : undefined}
                        onSelect={(d) => setData("fecha", d ? d.toISOString().substring(0, 10) : null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.fecha && <p className="text-xs text-red-600 mt-1">{errors.fecha}</p>}
                </div>

                {/* Fecha límite */}
                <div>
                  <FieldLabel label="Fecha límite" fieldKey="fecha_limite" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.fecha_limite ? format(new Date(data.fecha_limite), "PPP", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CmpCalendar
                        mode="single"
                        selected={data.fecha_limite ? new Date(data.fecha_limite) : undefined}
                        onSelect={(d) => setData("fecha_limite", d ? d.toISOString().substring(0, 10) : null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.fecha_limite && <p className="text-xs text-red-600 mt-1">{errors.fecha_limite}</p>}
                </div>

                {/* SLA */}
                <div>
                  <FieldLabel label="SLA (compromiso)" fieldKey="sla_fecha" />
                  <Input
                    type="date"
                    value={(data.sla_fecha as any) ?? ""}
                    onChange={(e) => setData("sla_fecha", e.target.value || null)}
                  />
                </div>

                {/* Seguimiento (waiting for) */}
                <div>
                  <FieldLabel label="Próximo seguimiento" fieldKey="seguimiento_proximo" />
                  <Input
                    type="date"
                    value={(data.seguimiento_proximo as any) ?? ""}
                    onChange={(e) => setData("seguimiento_proximo", e.target.value || null)}
                  />
                </div>

                {/* Frog date (si marcan frog) */}
                {data.frog && (
                  <div>
                    <FieldLabel label="Fecha Frog" fieldKey="frog_date" />
                    <Input
                      type="date"
                      value={(data.frog_date as any) ?? ""}
                      onChange={(e) => setData("frog_date", e.target.value || null)}
                    />
                  </div>
                )}

                {/* Boost (solo lectura visual) */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label="Boost hasta" fieldKey="score_boost_until" />
                    <Input value={data.score_boost_until ?? ""} readOnly placeholder="—" />
                  </div>
                  <div>
                    <FieldLabel label="Factor boost" fieldKey="score_boost_factor" />
                    <Input value={String(data.score_boost_factor ?? "")} readOnly placeholder="—" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ===== TAB: AVANZADO ===== */}
            <TabsContent value="avanzado" className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* MoSCoW */}
                <div>
                  <FieldLabel label="MoSCoW" fieldKey="moscow" />
                  <Select value={data.moscow || ""} onValueChange={(v) => setData("moscow", v as any)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {["M", "S", "C", "W"].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Horizon */}
                <div>
                  <FieldLabel label="Horizon" fieldKey="horizon" />
                  <Select value={data.horizon || ""} onValueChange={(v) => setData("horizon", v as any)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {["H1", "H2", "H3"].map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* KASH */}
                <div>
                  <FieldLabel label="KASH" fieldKey="kash" />
                  <Select value={data.kash || ""} onValueChange={(v) => setData("kash", v as any)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {["K", "A", "S", "H"].map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Eisenhower toggles */}
                <div className="flex items-center gap-3">
                  <Switch checked={!!data.eisen_importante} onCheckedChange={(c) => setData("eisen_importante", c)} />
                  <FieldLabel label="Importante" fieldKey="eisen_importante" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={!!data.eisen_urgente} onCheckedChange={(c) => setData("eisen_urgente", c)} />
                  <FieldLabel label="Urgente" fieldKey="eisen_urgente" />
                </div>

                {/* Family friendly (filtro de vistas, no score) */}
                <div className="flex items-center gap-3">
                  <Switch checked={!!data.family_friendly} onCheckedChange={(c) => setData("family_friendly", c)} />
                  <FieldLabel label="Apta con familia" fieldKey="family_friendly" />
                </div>

                {/* Sliders MCDA */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-5 gap-4">
                  {([
                    ["impacto", "Impacto"],
                    ["valor", "Valor (ROI)"],
                    ["eficiencia", "Eficiencia"],
                    ["stakeholders", "Stakeholders"],
                    ["urgencia_manual", "Urgencia manual"],
                  ] as const).map(([key, label]) => (
                    <div key={key}>
                      <FieldLabel label={label} fieldKey={key as any} />
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[Number((data as any)[key] ?? 0)]}
                          min={0}
                          max={10}
                          step={1}
                          onValueChange={([v]) => setData(key as any, v)}
                          className="w-full"
                        />
                        <Input
                          className="w-16"
                          type="number"
                          min={0}
                          max={10}
                          value={Number((data as any)[key] ?? 0)}
                          onChange={(e) => setData(key as any, Math.max(0, Math.min(10, Number(e.target.value) || 0)))}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Riesgo/Oportunidad */}
                <div>
                  <FieldLabel label="Riesgo/Oportunidad (-0.20..+0.20)" fieldKey="riesgo_oportunidad" />
                  <Input
                    type="number"
                    step="0.05"
                    min={-0.2}
                    max={0.2}
                    value={typeof data.riesgo_oportunidad === "number" ? data.riesgo_oportunidad : ""}
                    onChange={(e) =>
                      setData("riesgo_oportunidad", e.target.value === "" ? null : Number(e.target.value))
                    }
                    placeholder="0.00"
                  />
                </div>

                {/* Dificultad (guía de time blocking) */}
                <div>
                  <FieldLabel label="Dificultad (guía)" fieldKey="dificultad" />
                  <Select value={data.dificultad || ""} onValueChange={(v) => setData("dificultad", v as any)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      <SelectItem value="trivial/mecánico">🟢 Trivial / mecánico</SelectItem>
                      <SelectItem value="requiere_pensar_leer_investigar">🟡 Requiere pensar/leer</SelectItem>
                      <SelectItem value="muy_exigente">🔴 Muy exigente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Kaizen */}
                <div className="flex items-center gap-3">
                  <Switch checked={!!data.kaizen} onCheckedChange={(c) => setData("kaizen", c)} />
                  <FieldLabel label="Kaizen" fieldKey="kaizen" />
                </div>

                {/* Delegación (solo campos; detalles en modal aparte si quieres) */}
                <div>
                  <FieldLabel label="Delegación (recomendado)" fieldKey="delegation_level_rec" />
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={data.delegation_level_rec ?? ""}
                    onChange={(e) => setData("delegation_level_rec", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div>
                  <FieldLabel label="Delegación (aplicado)" fieldKey="delegation_level_applied" />
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={data.delegation_level_applied ?? ""}
                    onChange={(e) =>
                      setData("delegation_level_applied", e.target.value ? Number(e.target.value) : null)
                    }
                  />
                </div>
                <div>
                  <FieldLabel label="Skill override (0–10)" fieldKey="skill_override" />
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={data.skill_override ?? ""}
                    onChange={(e) => setData("skill_override", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div>
                  <FieldLabel label="Will override (0–10)" fieldKey="will_override" />
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={data.will_override ?? ""}
                    onChange={(e) => setData("will_override", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer acciones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? "Actualizar" : "Crear"} Tarea
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}