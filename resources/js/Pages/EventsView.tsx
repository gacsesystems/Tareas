import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { Calendar, Clock, Plus, Repeat, ExternalLink } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";

interface Evento {
    id: string;
    titulo: string;
    tipo_evento: {
        id: string;
        nombre: string;
        color: string;
    };
    fecha_inicio: string;
    fecha_fin?: string;
    all_day: boolean;
    rrule?: string;
    proyecto?: { id: string; nombre: string };
    tarea?: { id: string; titulo: string };
    persona?: { id: string; nombre: string };
    recordatorio_inbox: boolean;
    notas_md?: string;
    external_source?: string;
}

interface TipoEvento {
    id: string;
    nombre: string;
    color: string;
}

export function EventsView() {
    const [eventos, setEventos] = useState<Evento[]>([
        {
            id: "1",
            titulo: "Junta de equipo",
            tipo_evento: { id: "1", nombre: "Trabajo", color: "blue" },
            fecha_inicio: "2025-01-09T10:00:00",
            fecha_fin: "2025-01-09T11:00:00",
            all_day: false,
            recordatorio_inbox: true,
            notas_md: "Revisar avances del sprint",
        },
        {
            id: "2",
            titulo: "Ballet de Sofía",
            tipo_evento: { id: "2", nombre: "Familia", color: "pink" },
            fecha_inicio: "2025-01-09T16:00:00",
            fecha_fin: "2025-01-09T17:30:00",
            all_day: false,
            rrule: "FREQ=WEEKLY;BYDAY=MO,WE",
            recordatorio_inbox: false,
        },
    ]);

    const [tiposEvento] = useState<TipoEvento[]>([
        { id: "1", nombre: "Trabajo", color: "blue" },
        { id: "2", nombre: "Familia", color: "pink" },
        { id: "3", nombre: "Personal", color: "green" },
        { id: "4", nombre: "Médico", color: "red" },
        { id: "5", nombre: "Ejercicio", color: "orange" },
    ]);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newEvento, setNewEvento] = useState({
        titulo: "",
        tipo_evento_id: "1", // Updated default value to be a non-empty string
        fecha_inicio: "",
        fecha_fin: "",
        all_day: false,
        rrule: "none", // Changed empty string to "none" for rrule default value
        recordatorio_inbox: true,
        notas_md: "",
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour:
                date.getHours() !== 0 || date.getMinutes() !== 0
                    ? "2-digit"
                    : undefined,
            minute:
                date.getHours() !== 0 || date.getMinutes() !== 0
                    ? "2-digit"
                    : undefined,
        });
    };

    const getColorClass = (color: string) => {
        const colors = {
            blue: "bg-blue-100 text-blue-800 border-blue-200",
            pink: "bg-pink-100 text-pink-800 border-pink-200",
            green: "bg-green-100 text-green-800 border-green-200",
            red: "bg-red-100 text-red-800 border-red-200",
            orange: "bg-orange-100 text-orange-800 border-orange-200",
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    const handleCreateEvento = () => {
        if (
            !newEvento.titulo ||
            !newEvento.tipo_evento_id ||
            !newEvento.fecha_inicio
        )
            return;

        const tipoEvento = tiposEvento.find(
            (t) => t.id === newEvento.tipo_evento_id
        );
        if (!tipoEvento) return;

        const evento: Evento = {
            id: Date.now().toString(),
            titulo: newEvento.titulo,
            tipo_evento: tipoEvento,
            fecha_inicio: newEvento.fecha_inicio,
            fecha_fin: newEvento.fecha_fin || undefined,
            all_day: newEvento.all_day,
            rrule: newEvento.rrule !== "none" ? newEvento.rrule : undefined, // Only set rrule if it's not "none"
            recordatorio_inbox: newEvento.recordatorio_inbox,
            notas_md: newEvento.notas_md || undefined,
        };

        setEventos([...eventos, evento]);
        setNewEvento({
            titulo: "",
            tipo_evento_id: "1",
            fecha_inicio: "",
            fecha_fin: "",
            all_day: false,
            rrule: "none", // Reset to "none" instead of empty string
            recordatorio_inbox: true,
            notas_md: "",
        });
        setShowCreateDialog(false);
    };

    const eventosHoy = eventos.filter((e) => {
        const today = new Date().toDateString();
        const eventDate = new Date(e.fecha_inicio).toDateString();
        return eventDate === today;
    });

    const proximosEventos = eventos
        .filter((e) => {
            const today = new Date();
            const eventDate = new Date(e.fecha_inicio);
            return eventDate > today;
        })
        .slice(0, 5);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Eventos</h1>
                    <p className="text-muted-foreground">
                        Gestiona tu calendario y eventos
                    </p>
                </div>
                <Dialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Evento
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Evento</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="titulo">
                                    Título del Evento
                                </Label>
                                <Input
                                    id="titulo"
                                    placeholder="Ej: Junta equipo / Ballet Lua / Médico"
                                    value={newEvento.titulo}
                                    onChange={(e) =>
                                        setNewEvento({
                                            ...newEvento,
                                            titulo: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="tipo">Tipo de Evento</Label>
                                <Select
                                    value={newEvento.tipo_evento_id}
                                    onValueChange={(value) =>
                                        setNewEvento({
                                            ...newEvento,
                                            tipo_evento_id: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiposEvento.map((tipo) => (
                                            <SelectItem
                                                key={tipo.id}
                                                value={tipo.id}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`w-3 h-3 rounded-full bg-${tipo.color}-500`}
                                                    />
                                                    {tipo.nombre}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fecha_inicio">
                                        Fecha y Hora de Inicio
                                    </Label>
                                    <Input
                                        id="fecha_inicio"
                                        type="datetime-local"
                                        value={newEvento.fecha_inicio}
                                        onChange={(e) =>
                                            setNewEvento({
                                                ...newEvento,
                                                fecha_inicio: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="fecha_fin">
                                        Fecha y Hora de Fin
                                    </Label>
                                    <Input
                                        id="fecha_fin"
                                        type="datetime-local"
                                        value={newEvento.fecha_fin}
                                        onChange={(e) =>
                                            setNewEvento({
                                                ...newEvento,
                                                fecha_fin: e.target.value,
                                            })
                                        }
                                        disabled={newEvento.all_day}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="all_day"
                                    checked={newEvento.all_day}
                                    onCheckedChange={(checked) =>
                                        setNewEvento({
                                            ...newEvento,
                                            all_day: checked,
                                        })
                                    }
                                />
                                <Label htmlFor="all_day">
                                    Evento de día completo
                                </Label>
                            </div>

                            <div>
                                <Label htmlFor="rrule">
                                    Repetición (opcional)
                                </Label>
                                <Select
                                    value={newEvento.rrule}
                                    onValueChange={(value) =>
                                        setNewEvento({
                                            ...newEvento,
                                            rrule: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sin repetición" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Sin repetición
                                        </SelectItem>{" "}
                                        {/* Changed empty string value to "none" */}
                                        <SelectItem value="FREQ=DAILY">
                                            Diario
                                        </SelectItem>
                                        <SelectItem value="FREQ=WEEKLY">
                                            Semanal
                                        </SelectItem>
                                        <SelectItem value="FREQ=WEEKLY;BYDAY=MO,WE,FR">
                                            Lun, Mié, Vie
                                        </SelectItem>
                                        <SelectItem value="FREQ=MONTHLY">
                                            Mensual
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="recordatorio_inbox"
                                    checked={newEvento.recordatorio_inbox}
                                    onCheckedChange={(checked) =>
                                        setNewEvento({
                                            ...newEvento,
                                            recordatorio_inbox: checked,
                                        })
                                    }
                                />
                                <Label htmlFor="recordatorio_inbox">
                                    Mostrar en Inbox de Hoy
                                </Label>
                            </div>

                            <div>
                                <Label htmlFor="notas">Notas (Markdown)</Label>
                                <Textarea
                                    id="notas"
                                    placeholder="Agenda de reunión, objetivos, etc..."
                                    value={newEvento.notas_md}
                                    onChange={(e) =>
                                        setNewEvento({
                                            ...newEvento,
                                            notas_md: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleCreateEvento}>
                                    Crear Evento
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Eventos de Hoy */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Eventos de Hoy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {eventosHoy.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                No hay eventos programados para hoy
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {eventosHoy.map((evento) => (
                                    <div
                                        key={evento.id}
                                        className="flex items-center gap-3 p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge
                                                    className={getColorClass(
                                                        evento.tipo_evento.color
                                                    )}
                                                >
                                                    {evento.tipo_evento.nombre}
                                                </Badge>
                                                {evento.rrule && (
                                                    <Repeat className="h-3 w-3 text-muted-foreground" />
                                                )}
                                            </div>
                                            <h3 className="font-medium">
                                                {evento.titulo}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(
                                                    evento.fecha_inicio
                                                )}
                                                {evento.fecha_fin &&
                                                    ` - ${formatDate(
                                                        evento.fecha_fin
                                                    )}`}
                                            </div>
                                        </div>
                                        {evento.recordatorio_inbox && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                En Inbox
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Próximos Eventos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Próximos Eventos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {proximosEventos.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                No hay eventos próximos
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {proximosEventos.map((evento) => (
                                    <div
                                        key={evento.id}
                                        className="flex items-center gap-3 p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge
                                                    className={getColorClass(
                                                        evento.tipo_evento.color
                                                    )}
                                                >
                                                    {evento.tipo_evento.nombre}
                                                </Badge>
                                                {evento.rrule && (
                                                    <Repeat className="h-3 w-3 text-muted-foreground" />
                                                )}
                                            </div>
                                            <h3 className="font-medium">
                                                {evento.titulo}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(
                                                    evento.fecha_inicio
                                                )}
                                            </div>
                                        </div>
                                        {evento.external_source && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                <ExternalLink className="h-3 w-3 mr-1" />
                                                {evento.external_source}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Vista de Calendario Mensual */}
            <Card>
                <CardHeader>
                    <CardTitle>Vista Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Vista de calendario mensual próximamente</p>
                        <p className="text-sm">
                            Integración con Google Calendar y otros servicios
                            externos
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
