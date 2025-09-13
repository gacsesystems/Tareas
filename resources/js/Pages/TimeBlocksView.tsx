import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { Progress } from "@/Components/ui/progress";
import { Clock, Plus, AlertTriangle, Calendar } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";

interface TimeBlock {
    id: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    categoria: string;
    descripcion: string;
    disponible: boolean;
    capacidad_min: number;
    usado_min: number;
    parkinson_enforce: boolean;
    parkinson_max_min?: number;
    evento_id?: string;
}

export function TimeBlocksView() {
    const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
        {
            id: "1",
            fecha: "2025-01-09",
            hora_inicio: "09:00",
            hora_fin: "11:00",
            categoria: "Deep Work",
            descripcion: "Bloque de trabajo profundo",
            disponible: true,
            capacidad_min: 120,
            usado_min: 75,
            parkinson_enforce: false,
        },
        {
            id: "2",
            fecha: "2025-01-09",
            hora_inicio: "14:00",
            hora_fin: "15:30",
            categoria: "Admin",
            descripcion: "Tareas administrativas",
            disponible: true,
            capacidad_min: 90,
            usado_min: 45,
            parkinson_enforce: true,
            parkinson_max_min: 60,
        },
        {
            id: "3",
            fecha: "2025-01-09",
            hora_inicio: "16:00",
            hora_fin: "17:30",
            categoria: "Familia",
            descripcion: "Ballet de Sofía",
            disponible: false,
            capacidad_min: 0,
            usado_min: 0,
            parkinson_enforce: false,
            evento_id: "2",
        },
    ]);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newTimeBlock, setNewTimeBlock] = useState({
        fecha: new Date().toISOString().split("T")[0],
        hora_inicio: "",
        hora_fin: "",
        categoria: "",
        descripcion: "",
        disponible: true,
        capacidad_min: 60,
        parkinson_enforce: false,
        parkinson_max_min: 0,
    });

    const categorias = [
        "Deep Work",
        "Admin",
        "Reuniones",
        "Aprendizaje",
        "Familia",
        "Personal",
        "Ejercicio",
    ];

    const calcularDuracion = (inicio: string, fin: string) => {
        const [horaI, minI] = inicio.split(":").map(Number);
        const [horaF, minF] = fin.split(":").map(Number);
        return horaF * 60 + minF - (horaI * 60 + minI);
    };

    const getCapacidadColor = (usado: number, total: number) => {
        const porcentaje = (usado / total) * 100;
        if (porcentaje >= 100) return "text-red-600";
        if (porcentaje >= 80) return "text-orange-600";
        return "text-green-600";
    };

    const handleCreateTimeBlock = () => {
        if (
            !newTimeBlock.hora_inicio ||
            !newTimeBlock.hora_fin ||
            !newTimeBlock.categoria
        )
            return;

        const duracion = calcularDuracion(
            newTimeBlock.hora_inicio,
            newTimeBlock.hora_fin
        );
        if (duracion <= 0) return;

        const timeBlock: TimeBlock = {
            id: Date.now().toString(),
            fecha: newTimeBlock.fecha,
            hora_inicio: newTimeBlock.hora_inicio,
            hora_fin: newTimeBlock.hora_fin,
            categoria: newTimeBlock.categoria,
            descripcion: newTimeBlock.descripcion,
            disponible: newTimeBlock.disponible,
            capacidad_min: newTimeBlock.disponible
                ? newTimeBlock.capacidad_min
                : 0,
            usado_min: 0,
            parkinson_enforce: newTimeBlock.parkinson_enforce,
            parkinson_max_min: newTimeBlock.parkinson_enforce
                ? newTimeBlock.parkinson_max_min
                : undefined,
        };

        setTimeBlocks([...timeBlocks, timeBlock]);
        setNewTimeBlock({
            fecha: new Date().toISOString().split("T")[0],
            hora_inicio: "",
            hora_fin: "",
            categoria: "",
            descripcion: "",
            disponible: true,
            capacidad_min: 60,
            parkinson_enforce: false,
            parkinson_max_min: 0,
        });
        setShowCreateDialog(false);
    };

    const blocksHoy = timeBlocks.filter((block) => {
        const today = new Date().toISOString().split("T")[0];
        return block.fecha === today;
    });

    const capacidadTotal = blocksHoy
        .filter((block) => block.disponible)
        .reduce((total, block) => total + block.capacidad_min, 0);

    const capacidadUsada = blocksHoy
        .filter((block) => block.disponible)
        .reduce((total, block) => total + block.usado_min, 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Time Blocks</h1>
                    <p className="text-muted-foreground">
                        Gestiona tu tiempo y capacidad diaria
                    </p>
                </div>
                <Dialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Bloque
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Time Block</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="fecha">Fecha</Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    value={newTimeBlock.fecha}
                                    onChange={(e) =>
                                        setNewTimeBlock({
                                            ...newTimeBlock,
                                            fecha: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="hora_inicio">
                                        Hora de Inicio
                                    </Label>
                                    <Input
                                        id="hora_inicio"
                                        type="time"
                                        value={newTimeBlock.hora_inicio}
                                        onChange={(e) =>
                                            setNewTimeBlock({
                                                ...newTimeBlock,
                                                hora_inicio: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="hora_fin">
                                        Hora de Fin
                                    </Label>
                                    <Input
                                        id="hora_fin"
                                        type="time"
                                        value={newTimeBlock.hora_fin}
                                        onChange={(e) =>
                                            setNewTimeBlock({
                                                ...newTimeBlock,
                                                hora_fin: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="categoria">Categoría</Label>
                                <Select
                                    value={newTimeBlock.categoria}
                                    onValueChange={(value) =>
                                        setNewTimeBlock({
                                            ...newTimeBlock,
                                            categoria: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorias.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Input
                                    id="descripcion"
                                    placeholder="Ej: Deep Work proyecto X"
                                    value={newTimeBlock.descripcion}
                                    onChange={(e) =>
                                        setNewTimeBlock({
                                            ...newTimeBlock,
                                            descripcion: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="disponible"
                                    checked={newTimeBlock.disponible}
                                    onCheckedChange={(checked) =>
                                        setNewTimeBlock({
                                            ...newTimeBlock,
                                            disponible: checked,
                                        })
                                    }
                                />
                                <Label htmlFor="disponible">
                                    Disponible para encajar tareas
                                </Label>
                            </div>

                            {newTimeBlock.disponible && (
                                <div>
                                    <Label htmlFor="capacidad">
                                        Capacidad (minutos)
                                    </Label>
                                    <Input
                                        id="capacidad"
                                        type="number"
                                        min="0"
                                        value={newTimeBlock.capacidad_min}
                                        onChange={(e) =>
                                            setNewTimeBlock({
                                                ...newTimeBlock,
                                                capacidad_min:
                                                    Number.parseInt(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="parkinson"
                                    checked={newTimeBlock.parkinson_enforce}
                                    onCheckedChange={(checked) =>
                                        setNewTimeBlock({
                                            ...newTimeBlock,
                                            parkinson_enforce: checked,
                                        })
                                    }
                                />
                                <Label htmlFor="parkinson">
                                    Aplicar límite Parkinson
                                </Label>
                            </div>

                            {newTimeBlock.parkinson_enforce && (
                                <div>
                                    <Label htmlFor="parkinson_max">
                                        Límite máximo (minutos)
                                    </Label>
                                    <Input
                                        id="parkinson_max"
                                        type="number"
                                        min="0"
                                        value={newTimeBlock.parkinson_max_min}
                                        onChange={(e) =>
                                            setNewTimeBlock({
                                                ...newTimeBlock,
                                                parkinson_max_min:
                                                    Number.parseInt(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleCreateTimeBlock}>
                                    Crear Bloque
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Resumen de Capacidad */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Capacidad de Hoy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Capacidad Total</span>
                            <span className="font-medium">
                                {capacidadTotal} min
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Capacidad Usada</span>
                            <span
                                className={`font-medium ${getCapacidadColor(
                                    capacidadUsada,
                                    capacidadTotal
                                )}`}
                            >
                                {capacidadUsada} min
                            </span>
                        </div>
                        <Progress
                            value={(capacidadUsada / capacidadTotal) * 100}
                            className="h-2"
                        />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                Disponible: {capacidadTotal - capacidadUsada}{" "}
                                min
                            </span>
                            <span>
                                {Math.round(
                                    (capacidadUsada / capacidadTotal) * 100
                                )}
                                % usado
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Time Blocks de Hoy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Bloques de Hoy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {blocksHoy.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                            No hay bloques programados para hoy
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {blocksHoy
                                .sort((a, b) =>
                                    a.hora_inicio.localeCompare(b.hora_inicio)
                                )
                                .map((block) => {
                                    const duracion = calcularDuracion(
                                        block.hora_inicio,
                                        block.hora_fin
                                    );
                                    const porcentajeUso =
                                        block.capacidad_min > 0
                                            ? (block.usado_min /
                                                  block.capacidad_min) *
                                              100
                                            : 0;

                                    return (
                                        <div
                                            key={block.id}
                                            className="border rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            block.disponible
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {block.categoria}
                                                    </Badge>
                                                    {block.parkinson_enforce && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Parkinson
                                                        </Badge>
                                                    )}
                                                    {block.evento_id && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            Evento
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {block.hora_inicio} -{" "}
                                                    {block.hora_fin} ({duracion}{" "}
                                                    min)
                                                </div>
                                            </div>

                                            <h3 className="font-medium mb-2">
                                                {block.descripcion}
                                            </h3>

                                            {block.disponible && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span>Capacidad</span>
                                                        <span
                                                            className={getCapacidadColor(
                                                                block.usado_min,
                                                                block.capacidad_min
                                                            )}
                                                        >
                                                            {block.usado_min} /{" "}
                                                            {
                                                                block.capacidad_min
                                                            }{" "}
                                                            min
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={porcentajeUso}
                                                        className="h-1"
                                                    />
                                                    {block.parkinson_enforce &&
                                                        block.parkinson_max_min && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Límite
                                                                Parkinson:{" "}
                                                                {
                                                                    block.parkinson_max_min
                                                                }{" "}
                                                                min
                                                            </div>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
