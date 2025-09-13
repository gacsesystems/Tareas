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
import {
    BookOpen,
    Plus,
    Play,
    Clock,
    ExternalLink,
    Calendar,
    CheckCircle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";

interface Recurso {
    id: string;
    titulo: string;
    tipo:
        | "video"
        | "podcast"
        | "libro"
        | "articulo"
        | "pelicula"
        | "curso"
        | "documento"
        | "musica"
        | "otro";
    autor?: string;
    anio?: number;
    genero?: string;
    fuente?:
        | "youtube"
        | "vimeo"
        | "spotify"
        | "web"
        | "pdf"
        | "drive"
        | "local"
        | "otro";
    url?: string;
    duracion_min_est?: number;
    requiere_pantalla: boolean;
    apto_fondo: boolean;
    apto_auto: boolean;
    proposito: "educativo" | "inspirador" | "entretenimiento";
    prioridad: "baja" | "media" | "alta";
    plan_consumo_fecha?: string;
    fecha_caducidad?: string;
    status: "pendiente" | "en_progreso" | "consumido" | "archivado" | "vencido";
    conversion_modo: "manual" | "semi" | "auto";
    ultimo_sugerido_at?: string;
    notas_md?: string;
    tarea_id?: string;
}

export function ResourcesView() {
    const [recursos, setRecursos] = useState<Recurso[]>([
        {
            id: "1",
            titulo: "DDD con Laravel – Módulo 1",
            tipo: "video",
            autor: "CodelyTV",
            anio: 2024,
            genero: "tech",
            fuente: "youtube",
            url: "https://youtube.com/watch?v=example",
            duracion_min_est: 45,
            requiere_pantalla: true,
            apto_fondo: false,
            apto_auto: false,
            proposito: "educativo",
            prioridad: "alta",
            status: "pendiente",
            conversion_modo: "semi",
        },
        {
            id: "2",
            titulo: "Atomic Habits",
            tipo: "libro",
            autor: "James Clear",
            anio: 2018,
            genero: "productividad",
            duracion_min_est: 300,
            requiere_pantalla: true,
            apto_fondo: false,
            apto_auto: false,
            proposito: "educativo",
            prioridad: "media",
            status: "en_progreso",
            conversion_modo: "manual",
            plan_consumo_fecha: "2025-01-15",
        },
    ]);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newRecurso, setNewRecurso] = useState({
        titulo: "",
        tipo: "video" as const,
        autor: "",
        anio: new Date().getFullYear(),
        genero: "",
        fuente: "web" as const,
        url: "",
        duracion_min_est: 0,
        requiere_pantalla: true,
        apto_fondo: false,
        apto_auto: false,
        proposito: "educativo" as const,
        prioridad: "media" as const,
        plan_consumo_fecha: "",
        fecha_caducidad: "",
        conversion_modo: "semi" as const,
        notas_md: "",
    });

    const tipos = [
        { value: "video", label: "Video", icon: "🎥" },
        { value: "podcast", label: "Podcast", icon: "🎧" },
        { value: "libro", label: "Libro", icon: "📚" },
        { value: "articulo", label: "Artículo", icon: "📄" },
        { value: "pelicula", label: "Película", icon: "🎬" },
        { value: "curso", label: "Curso", icon: "🎓" },
        { value: "documento", label: "Documento", icon: "📋" },
        { value: "musica", label: "Música", icon: "🎵" },
        { value: "otro", label: "Otro", icon: "📁" },
    ];

    const getStatusColor = (status: string) => {
        const colors = {
            pendiente: "bg-blue-100 text-blue-800",
            en_progreso: "bg-yellow-100 text-yellow-800",
            consumido: "bg-green-100 text-green-800",
            archivado: "bg-gray-100 text-gray-800",
            vencido: "bg-red-100 text-red-800",
        };
        return colors[status as keyof typeof colors] || colors.pendiente;
    };

    const getPrioridadColor = (prioridad: string) => {
        const colors = {
            baja: "bg-gray-100 text-gray-800",
            media: "bg-blue-100 text-blue-800",
            alta: "bg-red-100 text-red-800",
        };
        return colors[prioridad as keyof typeof colors] || colors.media;
    };

    const getPropositoColor = (proposito: string) => {
        const colors = {
            educativo: "bg-green-100 text-green-800",
            inspirador: "bg-blue-100 text-blue-800",
            entretenimiento: "bg-yellow-100 text-yellow-800",
        };
        return colors[proposito as keyof typeof colors] || colors.educativo;
    };

    const handleCreateRecurso = () => {
        if (!newRecurso.titulo || !newRecurso.tipo) return;

        const recurso: Recurso = {
            id: Date.now().toString(),
            titulo: newRecurso.titulo,
            tipo: newRecurso.tipo,
            autor: newRecurso.autor || undefined,
            anio: newRecurso.anio || undefined,
            genero: newRecurso.genero || undefined,
            fuente: newRecurso.fuente || undefined,
            url: newRecurso.url || undefined,
            duracion_min_est: newRecurso.duracion_min_est || undefined,
            requiere_pantalla: newRecurso.requiere_pantalla,
            apto_fondo: newRecurso.apto_fondo,
            apto_auto: newRecurso.apto_auto,
            proposito: newRecurso.proposito,
            prioridad: newRecurso.prioridad,
            plan_consumo_fecha: newRecurso.plan_consumo_fecha || undefined,
            fecha_caducidad: newRecurso.fecha_caducidad || undefined,
            status: "pendiente",
            conversion_modo: newRecurso.conversion_modo,
            notas_md: newRecurso.notas_md || undefined,
        };

        setRecursos([...recursos, recurso]);
        setNewRecurso({
            titulo: "",
            tipo: "video",
            autor: "",
            anio: new Date().getFullYear(),
            genero: "",
            fuente: "web",
            url: "",
            duracion_min_est: 0,
            requiere_pantalla: true,
            apto_fondo: false,
            apto_auto: false,
            proposito: "educativo",
            prioridad: "media",
            plan_consumo_fecha: "",
            fecha_caducidad: "",
            conversion_modo: "semi",
            notas_md: "",
        });
        setShowCreateDialog(false);
    };

    const handleConvertToTask = (recursoId: string) => {
        setRecursos((prev) =>
            prev.map((r) =>
                r.id === recursoId
                    ? {
                          ...r,
                          tarea_id: `task_${Date.now()}`,
                          status: "en_progreso" as const,
                      }
                    : r
            )
        );
    };

    const recursosPendientes = recursos.filter((r) => r.status === "pendiente");
    const recursosEnProgreso = recursos.filter(
        (r) => r.status === "en_progreso"
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Recursos</h1>
                    <p className="text-muted-foreground">
                        Gestiona tu biblioteca de aprendizaje
                    </p>
                </div>
                <Dialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Recurso
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Recurso</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="titulo">
                                    Título del Recurso
                                </Label>
                                <Input
                                    id="titulo"
                                    placeholder="Ej: DDD con Laravel – Módulo 1"
                                    value={newRecurso.titulo}
                                    onChange={(e) =>
                                        setNewRecurso({
                                            ...newRecurso,
                                            titulo: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="tipo">
                                        Tipo de Recurso
                                    </Label>
                                    <Select
                                        value={newRecurso.tipo}
                                        onValueChange={(value: any) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                tipo: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tipos.map((tipo) => (
                                                <SelectItem
                                                    key={tipo.value}
                                                    value={tipo.value}
                                                >
                                                    {tipo.icon} {tipo.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="autor">Autor/Canal</Label>
                                    <Input
                                        id="autor"
                                        placeholder="Autor o canal"
                                        value={newRecurso.autor}
                                        onChange={(e) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                autor: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="anio">Año</Label>
                                    <Input
                                        id="anio"
                                        type="number"
                                        min="1900"
                                        max="2100"
                                        value={newRecurso.anio}
                                        onChange={(e) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                anio:
                                                    Number.parseInt(
                                                        e.target.value
                                                    ) ||
                                                    new Date().getFullYear(),
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="genero">Género/Tema</Label>
                                    <Input
                                        id="genero"
                                        placeholder="tech, management, salud..."
                                        value={newRecurso.genero}
                                        onChange={(e) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                genero: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="duracion">
                                        Duración (min)
                                    </Label>
                                    <Input
                                        id="duracion"
                                        type="number"
                                        min="0"
                                        value={newRecurso.duracion_min_est}
                                        onChange={(e) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                duracion_min_est:
                                                    Number.parseInt(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="url">URL (opcional)</Label>
                                <Input
                                    id="url"
                                    placeholder="https://..."
                                    value={newRecurso.url}
                                    onChange={(e) =>
                                        setNewRecurso({
                                            ...newRecurso,
                                            url: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="proposito">Propósito</Label>
                                    <Select
                                        value={newRecurso.proposito}
                                        onValueChange={(value: any) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                proposito: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="educativo">
                                                🎓 Educativo
                                            </SelectItem>
                                            <SelectItem value="inspirador">
                                                💡 Inspirador
                                            </SelectItem>
                                            <SelectItem value="entretenimiento">
                                                🎭 Entretenimiento
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="prioridad">Prioridad</Label>
                                    <Select
                                        value={newRecurso.prioridad}
                                        onValueChange={(value: any) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                prioridad: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="baja">
                                                Baja
                                            </SelectItem>
                                            <SelectItem value="media">
                                                Media
                                            </SelectItem>
                                            <SelectItem value="alta">
                                                Alta
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="conversion">
                                        Conversión
                                    </Label>
                                    <Select
                                        value={newRecurso.conversion_modo}
                                        onValueChange={(value: any) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                conversion_modo: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">
                                                Manual
                                            </SelectItem>
                                            <SelectItem value="semi">
                                                Semi-auto
                                            </SelectItem>
                                            <SelectItem value="auto">
                                                Automático
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="requiere_pantalla"
                                        checked={newRecurso.requiere_pantalla}
                                        onCheckedChange={(checked) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                requiere_pantalla: checked,
                                            })
                                        }
                                    />
                                    <Label htmlFor="requiere_pantalla">
                                        Requiere pantalla
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="apto_fondo"
                                        checked={newRecurso.apto_fondo}
                                        onCheckedChange={(checked) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                apto_fondo: checked,
                                            })
                                        }
                                    />
                                    <Label htmlFor="apto_fondo">
                                        Apto para fondo
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="apto_auto"
                                        checked={newRecurso.apto_auto}
                                        onCheckedChange={(checked) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                apto_auto: checked,
                                            })
                                        }
                                    />
                                    <Label htmlFor="apto_auto">
                                        Apto para auto
                                    </Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="plan_fecha">
                                        Fecha planificada
                                    </Label>
                                    <Input
                                        id="plan_fecha"
                                        type="date"
                                        value={newRecurso.plan_consumo_fecha}
                                        onChange={(e) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                plan_consumo_fecha:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="caducidad">
                                        Fecha de caducidad
                                    </Label>
                                    <Input
                                        id="caducidad"
                                        type="date"
                                        value={newRecurso.fecha_caducidad}
                                        onChange={(e) =>
                                            setNewRecurso({
                                                ...newRecurso,
                                                fecha_caducidad: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notas">Notas (Markdown)</Label>
                                <Textarea
                                    id="notas"
                                    placeholder="Por qué, contexto, links adicionales..."
                                    value={newRecurso.notas_md}
                                    onChange={(e) =>
                                        setNewRecurso({
                                            ...newRecurso,
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
                                <Button onClick={handleCreateRecurso}>
                                    Agregar Recurso
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {recursosPendientes.length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Pendientes
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Play className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {recursosEnProgreso.length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    En Progreso
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {
                                        recursos.filter(
                                            (r) => r.status === "consumido"
                                        ).length
                                    }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Consumidos
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {Math.round(
                                        recursos.reduce(
                                            (total, r) =>
                                                total +
                                                (r.duracion_min_est || 0),
                                            0
                                        ) / 60
                                    )}
                                    h
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total Horas
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recursos Pendientes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Recursos Pendientes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recursosPendientes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                            No hay recursos pendientes
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {recursosPendientes.map((recurso) => (
                                <div
                                    key={recurso.id}
                                    className="border rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">
                                                    {
                                                        tipos.find(
                                                            (t) =>
                                                                t.value ===
                                                                recurso.tipo
                                                        )?.icon
                                                    }
                                                </span>
                                                <h3 className="font-medium">
                                                    {recurso.titulo}
                                                </h3>
                                                {recurso.url && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="p-1 h-6 w-6"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge
                                                    className={getPropositoColor(
                                                        recurso.proposito
                                                    )}
                                                >
                                                    {recurso.proposito}
                                                </Badge>
                                                <Badge
                                                    className={getPrioridadColor(
                                                        recurso.prioridad
                                                    )}
                                                >
                                                    {recurso.prioridad}
                                                </Badge>
                                                <Badge
                                                    className={getStatusColor(
                                                        recurso.status
                                                    )}
                                                >
                                                    {recurso.status}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                {recurso.autor && (
                                                    <span>
                                                        Por {recurso.autor}
                                                    </span>
                                                )}
                                                {recurso.duracion_min_est && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {
                                                            recurso.duracion_min_est
                                                        }{" "}
                                                        min
                                                    </span>
                                                )}
                                                {recurso.plan_consumo_fecha && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            recurso.plan_consumo_fecha
                                                        ).toLocaleDateString(
                                                            "es-ES"
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                {recurso.requiere_pantalla && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        📺 Pantalla
                                                    </Badge>
                                                )}
                                                {recurso.apto_fondo && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        🎵 Fondo
                                                    </Badge>
                                                )}
                                                {recurso.apto_auto && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        🚗 Auto
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleConvertToTask(
                                                        recurso.id
                                                    )
                                                }
                                                disabled={!!recurso.tarea_id}
                                            >
                                                {recurso.tarea_id
                                                    ? "En Tarea"
                                                    : "Convertir en Tarea"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
