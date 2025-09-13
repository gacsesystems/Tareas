// prettier-ignore
import { useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/Components/ui/select";
import { Calendar as CmpCalendar } from "@/Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/Components/ui/popover";
import { Calendar as CalendarIcon, Save, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { route } from "ziggy-js";

type Tarea = {
  id?: number;
  titulo: string;
  detalle_md?: string;
  proyecto_id?: number | string | null;
  estado?: string; // backlog/siguiente/hoy/en_curso/en_revision/hecha/bloqueada
  fecha_limite?: string | null;
  responsable_id?: number | string | null;
  tipo?: string; // tarea/bug/mejora/investigacion/consumo
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
  pomos_estimados?: number;
  ranking?: number;
  pareto?: boolean;
  bloqueada?: boolean;
  bloqueo_motivo?: string | null;
};

export default function TareasForm({ initial, onClose, submitRoute, // string route name (store/update)
  method = "post", }: {// "post" | "put"
    initial?: Partial<Tarea>; onClose?: () => void; submitRoute: string; method?: "post" | "put";
  }) {
  const isEdit = !!initial?.id;

  const { data, setData, post, put, processing, errors, clearErrors } =
    useForm<Tarea>({
      titulo: initial?.titulo ?? "",
      detalle_md: initial?.detalle_md ?? "",
      proyecto_id: initial?.proyecto_id ?? "",
      estado: initial?.estado ?? "hoy",
      fecha_limite: initial?.fecha_limite ?? null,
      responsable_id: initial?.responsable_id ?? "",
      tipo: initial?.tipo ?? "tarea",
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
      is_rock: initial?.is_rock ?? false,
      frog: initial?.frog ?? false,
      pomos_estimados: initial?.pomos_estimados ?? 1,
      ranking: initial?.ranking ?? 1000,
      pareto: initial?.pareto ?? false,
      bloqueada: initial?.bloqueada ?? false,
      bloqueo_motivo: initial?.bloqueo_motivo ?? "",
    });

  useEffect(() => () => clearErrors(), []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "put" && initial?.id) {
      router.put(route(submitRoute, initial.id), data, { onSuccess: () => onClose?.(), });
    } else {
      router.post(route(submitRoute), data, { onSuccess: () => onClose?.(), });
    }
  };

  const deleteTarea = () => {
    if (initial?.id && confirm("¿Eliminar tarea? Esta acción no se puede deshacer.")) {
      router.delete(route("tareas.destroy", initial.id), { onSuccess: () => onClose?.(), });
    }
  };

  return (
    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{initial?.id ? "Editar Tarea" : "Nueva Tarea"}</CardTitle>
        {isEdit && (
          <Button variant="destructive" size="sm" onClick={deleteTarea} title="Eliminar tarea" className="mr-2">
            <Trash2 className="h-4 w-4" />
          </Button>)}
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Título *</Label>
              <Input value={data.titulo || ""} onChange={(e) => setData("titulo", e.target.value)} required maxLength={300} />
              {errors.titulo && (<p className="text-xs text-red-600 mt-1">{errors.titulo}</p>)}
            </div>

            <div className="md:col-span-2">
              <Label>Detalle</Label>
              <Textarea value={data.detalle_md || ""} onChange={(e) => setData("detalle_md", e.target.value)} rows={3} />
            </div>

            <div>
              <Label>Proyecto</Label>
              <Input value={(data.proyecto_id as any) ?? ""} onChange={(e) => setData("proyecto_id", e.target.value)} placeholder="ID o nombre" />
            </div>

            <div>
              <Label>Responsable</Label>
              <Input value={(data.responsable_id as any) ?? ""} onChange={(e) => setData("responsable_id", e.target.value)} />
            </div>
          </div>

          {/* Estado/Tipo/Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Estado</Label>
              <Select value={data.estado || "hoy"} onValueChange={(v) => setData("estado", v)} >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="siguiente">Siguiente</SelectItem>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="en_curso">En curso</SelectItem>
                  <SelectItem value="en_revision">En revisión</SelectItem>
                  <SelectItem value="hecha">Hecha</SelectItem>
                  <SelectItem value="bloqueada">Bloqueada</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && (<p className="text-xs text-red-600 mt-1">{errors.estado}</p>)}
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={data.tipo || "tarea"} onValueChange={(v) => setData("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tarea">Tarea</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="mejora">Mejora</SelectItem>
                  <SelectItem value="investigacion">Investigación</SelectItem>
                  <SelectItem value="consumo">Consumo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha límite</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.fecha_limite ? format(new Date(data.fecha_limite), "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CmpCalendar mode="single" selected={data.fecha_limite ? new Date(data.fecha_limite) : undefined}
                    onSelect={(d) => setData("fecha_limite", d ? d.toISOString().substring(0, 10) : null)}
                    initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Toggles cortos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={!!data.is_rock} onCheckedChange={(c) => setData("is_rock", c)} />
              <Label>Rock</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={!!data.frog} onCheckedChange={(c) => setData("frog", c)} />
              <Label>Frog</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={!!data.pareto} onCheckedChange={(c) => setData("pareto", c)} />
              <Label>Pareto</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={!!data.bloqueada} onCheckedChange={(c) => setData("bloqueada", c)} />
              <Label>Bloqueada</Label>
            </div>
          </div>

          {/* Campos simples */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Pomodoros</Label>
              <Input type="number" min={0} value={data.pomos_estimados ?? 1} onChange={(e) => setData("pomos_estimados", Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Ranking</Label>
              <Input type="number" value={data.ranking ?? 1000} onChange={(e) => setData("ranking", Number(e.target.value) || 1000)} />
            </div>
            {data.bloqueada && (
              <div className="md:col-span-1">
                <Label>Motivo bloqueo</Label>
                <Input value={data.bloqueo_motivo ?? ""} onChange={(e) => setData("bloqueo_motivo", e.target.value)} />
              </div>)}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={processing}><Save className="h-4 w-4 mr-2" />{initial?.id ? "Actualizar" : "Crear"} Tarea</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
