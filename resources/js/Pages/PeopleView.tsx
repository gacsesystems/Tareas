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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Users,
    Plus,
    Search,
    Calendar,
    MessageCircle,
    Briefcase,
    Phone,
    Mail,
    Star,
    Clock,
    Target,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";

interface Persona {
    id: string;
    nombre: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    empresa?: string;
    cargo?: string;
    ubicacion?: string;
    tipo_relacion:
        | "familia"
        | "amigo"
        | "colega"
        | "cliente"
        | "mentor"
        | "otro";
    nivel_cercania: 1 | 2 | 3 | 4 | 5;
    frecuencia_contacto_dias?: number;
    ultimo_contacto?: string;
    proximo_contacto_sugerido?: string;
    notas_md?: string;
    tags: string[];
    cumpleanos?: string;
    redes_sociales?: { [key: string]: string };
    activa: boolean;
}

interface Interaccion {
    id: string;
    persona_id: string;
    fecha: string;
    tipo: "reunion" | "llamada" | "mensaje" | "email" | "evento" | "otro";
    descripcion: string;
    duracion_min?: number;
    resultado?: string;
    seguimiento_requerido: boolean;
    fecha_seguimiento?: string;
    notas_md?: string;
}

interface TareaDelegada {
    id: string;
    persona_id: string;
    titulo: string;
    descripcion?: string;
    fecha_asignacion: string;
    fecha_limite?: string;
    status: "asignada" | "en_progreso" | "completada" | "cancelada";
    prioridad: "baja" | "media" | "alta";
    notas_seguimiento?: string;
}

export function PeopleView() {
    const [personas, setPersonas] = useState<Persona[]>([
        {
            id: "1",
            nombre: "Ana",
            apellido: "García",
            email: "ana.garcia@empresa.com",
            telefono: "+52 55 1234 5678",
            empresa: "TechCorp",
            cargo: "Directora de Producto",
            tipo_relacion: "colega",
            nivel_cercania: 4,
            frecuencia_contacto_dias: 14,
            ultimo_contacto: "2025-01-05",
            proximo_contacto_sugerido: "2025-01-19",
            tags: ["producto", "tech", "mentora"],
            cumpleanos: "1985-03-15",
            activa: true,
        },
        {
            id: "2",
            nombre: "Carlos",
            apellido: "Mendoza",
            email: "carlos@startup.io",
            empresa: "StartupXYZ",
            cargo: "CEO",
            tipo_relacion: "cliente",
            nivel_cercania: 3,
            frecuencia_contacto_dias: 7,
            ultimo_contacto: "2025-01-08",
            tags: ["cliente", "startup", "ceo"],
            activa: true,
        },
        {
            id: "3",
            nombre: "María",
            apellido: "López",
            tipo_relacion: "familia",
            nivel_cercania: 5,
            frecuencia_contacto_dias: 3,
            ultimo_contacto: "2025-01-07",
            tags: ["familia", "hermana"],
            cumpleanos: "1990-07-22",
            activa: true,
        },
    ]);

    const [interacciones, setInteracciones] = useState<Interaccion[]>([
        {
            id: "1",
            persona_id: "1",
            fecha: "2025-01-05",
            tipo: "reunion",
            descripcion: "Revisión de roadmap de producto Q1",
            duracion_min: 60,
            resultado: "Alineados en prioridades, definir métricas",
            seguimiento_requerido: true,
            fecha_seguimiento: "2025-01-12",
        },
        {
            id: "2",
            persona_id: "2",
            fecha: "2025-01-08",
            tipo: "llamada",
            descripcion: "Follow-up propuesta desarrollo MVP",
            duracion_min: 30,
            resultado: "Aprobada propuesta, iniciar en febrero",
            seguimiento_requerido: false,
        },
    ]);

    const [tareasDelegadas, setTareasDelegadas] = useState<TareaDelegada[]>([
        {
            id: "1",
            persona_id: "1",
            titulo: "Definir métricas de producto Q1",
            descripcion: "Establecer KPIs y dashboard de seguimiento",
            fecha_asignacion: "2025-01-05",
            fecha_limite: "2025-01-15",
            status: "en_progreso",
            prioridad: "alta",
        },
    ]);

    const [showCreatePersonDialog, setShowCreatePersonDialog] = useState(false);
    const [showCreateInteractionDialog, setShowCreateInteractionDialog] =
        useState(false);
    const [selectedPersonaId, setSelectedPersonaId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [newPersona, setNewPersona] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        empresa: "",
        cargo: "",
        tipo_relacion: "colega" as const,
        nivel_cercania: 3 as const,
        frecuencia_contacto_dias: 30,
        tags: "",
        cumpleanos: "",
        notas_md: "",
    });

    const [newInteraccion, setNewInteraccion] = useState({
        persona_id: "",
        tipo: "reunion" as const,
        descripcion: "",
        duracion_min: 30,
        resultado: "",
        seguimiento_requerido: false,
        fecha_seguimiento: "",
        notas_md: "",
    });

    const handleCreatePersona = () => {
        if (!newPersona.nombre) return;

        const persona: Persona = {
            id: Date.now().toString(),
            nombre: newPersona.nombre,
            apellido: newPersona.apellido || undefined,
            email: newPersona.email || undefined,
            telefono: newPersona.telefono || undefined,
            empresa: newPersona.empresa || undefined,
            cargo: newPersona.cargo || undefined,
            tipo_relacion: newPersona.tipo_relacion,
            nivel_cercania: newPersona.nivel_cercania,
            frecuencia_contacto_dias: newPersona.frecuencia_contacto_dias,
            tags: newPersona.tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t),
            cumpleanos: newPersona.cumpleanos || undefined,
            notas_md: newPersona.notas_md || undefined,
            activa: true,
        };

        setPersonas([...personas, persona]);
        setNewPersona({
            nombre: "",
            apellido: "",
            email: "",
            telefono: "",
            empresa: "",
            cargo: "",
            tipo_relacion: "colega",
            nivel_cercania: 3,
            frecuencia_contacto_dias: 30,
            tags: "",
            cumpleanos: "",
            notas_md: "",
        });
        setShowCreatePersonDialog(false);
    };

    const handleCreateInteraccion = () => {
        if (!newInteraccion.persona_id || !newInteraccion.descripcion) return;

        const interaccion: Interaccion = {
            id: Date.now().toString(),
            persona_id: newInteraccion.persona_id,
            fecha: new Date().toISOString().split("T")[0],
            tipo: newInteraccion.tipo,
            descripcion: newInteraccion.descripcion,
            duracion_min: newInteraccion.duracion_min,
            resultado: newInteraccion.resultado || undefined,
            seguimiento_requerido: newInteraccion.seguimiento_requerido,
            fecha_seguimiento: newInteraccion.fecha_seguimiento || undefined,
            notas_md: newInteraccion.notas_md || undefined,
        };

        setInteracciones([...interacciones, interaccion]);

        // Actualizar último contacto de la persona
        setPersonas((prev) =>
            prev.map((p) =>
                p.id === newInteraccion.persona_id
                    ? { ...p, ultimo_contacto: interaccion.fecha }
                    : p
            )
        );

        setNewInteraccion({
            persona_id: "",
            tipo: "reunion",
            descripcion: "",
            duracion_min: 30,
            resultado: "",
            seguimiento_requerido: false,
            fecha_seguimiento: "",
            notas_md: "",
        });
        setShowCreateInteractionDialog(false);
    };

    const getRelationColor = (tipo: string) => {
        const colors = {
            familia: "bg-pink-100 text-pink-800",
            amigo: "bg-blue-100 text-blue-800",
            colega: "bg-green-100 text-green-800",
            cliente: "bg-purple-100 text-purple-800",
            mentor: "bg-orange-100 text-orange-800",
            otro: "bg-gray-100 text-gray-800",
        };
        return colors[tipo as keyof typeof colors] || colors.otro;
    };

    const getInteractionIcon = (tipo: string) => {
        switch (tipo) {
            case "reunion":
                return Calendar;
            case "llamada":
                return Phone;
            case "mensaje":
                return MessageCircle;
            case "email":
                return Mail;
            case "evento":
                return Calendar;
            default:
                return MessageCircle;
        }
    };

    const filteredPersonas = personas.filter(
        (persona) =>
            persona.activa &&
            (persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                persona.apellido
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                persona.empresa
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                persona.tags.some((tag) =>
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                ))
    );

    const personasContactoPendiente = personas.filter((persona) => {
        if (!persona.frecuencia_contacto_dias || !persona.ultimo_contacto)
            return false;
        const ultimoContacto = new Date(persona.ultimo_contacto);
        const hoy = new Date();
        const diasSinContacto = Math.floor(
            (hoy.getTime() - ultimoContacto.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diasSinContacto >= persona.frecuencia_contacto_dias;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Personas</h1>
                    <p className="text-muted-foreground">
                        Gestiona tu red de contactos y relaciones
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog
                        open={showCreateInteractionDialog}
                        onOpenChange={setShowCreateInteractionDialog}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Nueva Interacción
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Registrar Interacción</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Persona</Label>
                                    <Select
                                        value={newInteraccion.persona_id}
                                        onValueChange={(value) =>
                                            setNewInteraccion({
                                                ...newInteraccion,
                                                persona_id: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una persona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {personas
                                                .filter((p) => p.activa)
                                                .map((persona) => (
                                                    <SelectItem
                                                        key={persona.id}
                                                        value={persona.id}
                                                    >
                                                        {persona.nombre}{" "}
                                                        {persona.apellido}{" "}
                                                        {persona.empresa &&
                                                            `(${persona.empresa})`}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Tipo de Interacción</Label>
                                    <Select
                                        value={newInteraccion.tipo}
                                        onValueChange={(value: any) =>
                                            setNewInteraccion({
                                                ...newInteraccion,
                                                tipo: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="reunion">
                                                📅 Reunión
                                            </SelectItem>
                                            <SelectItem value="llamada">
                                                📞 Llamada
                                            </SelectItem>
                                            <SelectItem value="mensaje">
                                                💬 Mensaje
                                            </SelectItem>
                                            <SelectItem value="email">
                                                📧 Email
                                            </SelectItem>
                                            <SelectItem value="evento">
                                                🎉 Evento
                                            </SelectItem>
                                            <SelectItem value="otro">
                                                📝 Otro
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Descripción</Label>
                                    <Input
                                        placeholder="¿De qué hablaron?"
                                        value={newInteraccion.descripcion}
                                        onChange={(e) =>
                                            setNewInteraccion({
                                                ...newInteraccion,
                                                descripcion: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Duración (minutos)</Label>
                                    <Input
                                        type="number"
                                        value={newInteraccion.duracion_min}
                                        onChange={(e) =>
                                            setNewInteraccion({
                                                ...newInteraccion,
                                                duracion_min:
                                                    Number.parseInt(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Resultado/Conclusiones</Label>
                                    <Textarea
                                        placeholder="¿Qué se acordó o concluyó?"
                                        value={newInteraccion.resultado}
                                        onChange={(e) =>
                                            setNewInteraccion({
                                                ...newInteraccion,
                                                resultado: e.target.value,
                                            })
                                        }
                                        rows={2}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowCreateInteractionDialog(
                                                false
                                            )
                                        }
                                    >
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleCreateInteraccion}>
                                        Registrar
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={showCreatePersonDialog}
                        onOpenChange={setShowCreatePersonDialog}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Persona
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Agregar Nueva Persona</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Nombre *</Label>
                                        <Input
                                            placeholder="Nombre"
                                            value={newPersona.nombre}
                                            onChange={(e) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    nombre: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Apellido</Label>
                                        <Input
                                            placeholder="Apellido"
                                            value={newPersona.apellido}
                                            onChange={(e) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    apellido: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="email@ejemplo.com"
                                            value={newPersona.email}
                                            onChange={(e) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Teléfono</Label>
                                        <Input
                                            placeholder="+52 55 1234 5678"
                                            value={newPersona.telefono}
                                            onChange={(e) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    telefono: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Empresa</Label>
                                        <Input
                                            placeholder="Nombre de la empresa"
                                            value={newPersona.empresa}
                                            onChange={(e) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    empresa: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Cargo</Label>
                                        <Input
                                            placeholder="Director, CEO, etc."
                                            value={newPersona.cargo}
                                            onChange={(e) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    cargo: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Tipo de Relación</Label>
                                        <Select
                                            value={newPersona.tipo_relacion}
                                            onValueChange={(value: any) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    tipo_relacion: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="familia">
                                                    👨‍👩‍👧‍👦 Familia
                                                </SelectItem>
                                                <SelectItem value="amigo">
                                                    👥 Amigo
                                                </SelectItem>
                                                <SelectItem value="colega">
                                                    💼 Colega
                                                </SelectItem>
                                                <SelectItem value="cliente">
                                                    🤝 Cliente
                                                </SelectItem>
                                                <SelectItem value="mentor">
                                                    🎓 Mentor
                                                </SelectItem>
                                                <SelectItem value="otro">
                                                    📝 Otro
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Nivel de Cercanía (1-5)</Label>
                                        <Select
                                            value={newPersona.nivel_cercania.toString()}
                                            onValueChange={(value) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    nivel_cercania:
                                                        Number.parseInt(
                                                            value
                                                        ) as any,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">
                                                    1 - Conocido
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    2 - Contacto
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    3 - Relación
                                                </SelectItem>
                                                <SelectItem value="4">
                                                    4 - Cercano
                                                </SelectItem>
                                                <SelectItem value="5">
                                                    5 - Muy Cercano
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>
                                            Frecuencia de Contacto (días)
                                        </Label>
                                        <Input
                                            type="number"
                                            placeholder="30"
                                            value={
                                                newPersona.frecuencia_contacto_dias
                                            }
                                            onChange={(e) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    frecuencia_contacto_dias:
                                                        Number.parseInt(
                                                            e.target.value
                                                        ) || 30,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Cumpleaños</Label>
                                        <Input
                                            type="date"
                                            value={newPersona.cumpleanos}
                                            onChange={(e) =>
                                                setNewPersona({
                                                    ...newPersona,
                                                    cumpleanos: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Tags (separados por comas)</Label>
                                    <Input
                                        placeholder="cliente, tech, mentor..."
                                        value={newPersona.tags}
                                        onChange={(e) =>
                                            setNewPersona({
                                                ...newPersona,
                                                tags: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Notas</Label>
                                    <Textarea
                                        placeholder="Información adicional, contexto, etc."
                                        value={newPersona.notas_md}
                                        onChange={(e) =>
                                            setNewPersona({
                                                ...newPersona,
                                                notas_md: e.target.value,
                                            })
                                        }
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowCreatePersonDialog(false)
                                        }
                                    >
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleCreatePersona}>
                                        Agregar Persona
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="contactos" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="contactos">Contactos</TabsTrigger>
                    <TabsTrigger value="interacciones">
                        Interacciones
                    </TabsTrigger>
                    <TabsTrigger value="delegacion">Delegación</TabsTrigger>
                    <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
                </TabsList>

                <TabsContent value="contactos" className="space-y-6">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {
                                                personas.filter((p) => p.activa)
                                                    .length
                                            }
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Total Contactos
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {personasContactoPendiente.length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Contacto Pendiente
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {
                                                personas.filter(
                                                    (p) =>
                                                        p.tipo_relacion ===
                                                        "cliente"
                                                ).length
                                            }
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Clientes
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {
                                                tareasDelegadas.filter(
                                                    (t) =>
                                                        t.status !==
                                                        "completada"
                                                ).length
                                            }
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Tareas Delegadas
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Búsqueda */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar personas..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lista de Personas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPersonas.map((persona) => {
                            const diasSinContacto = persona.ultimo_contacto
                                ? Math.floor(
                                      (new Date().getTime() -
                                          new Date(
                                              persona.ultimo_contacto
                                          ).getTime()) /
                                          (1000 * 60 * 60 * 24)
                                  )
                                : null;
                            const necesitaContacto =
                                persona.frecuencia_contacto_dias &&
                                diasSinContacto &&
                                diasSinContacto >=
                                    persona.frecuencia_contacto_dias;

                            return (
                                <Card
                                    key={persona.id}
                                    className={
                                        necesitaContacto
                                            ? "border-orange-200 bg-orange-50"
                                            : ""
                                    }
                                >
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium">
                                                        {persona.nombre}{" "}
                                                        {persona.apellido}
                                                    </h3>
                                                    {persona.cargo &&
                                                        persona.empresa && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {persona.cargo}{" "}
                                                                en{" "}
                                                                {
                                                                    persona.empresa
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({
                                                        length: persona.nivel_cercania,
                                                    }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    className={getRelationColor(
                                                        persona.tipo_relacion
                                                    )}
                                                >
                                                    {persona.tipo_relacion}
                                                </Badge>
                                                {necesitaContacto && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-orange-600 border-orange-600"
                                                    >
                                                        Contactar
                                                    </Badge>
                                                )}
                                            </div>

                                            {persona.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {persona.tags.map(
                                                        (tag, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                #{tag}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                {persona.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3" />
                                                        <span className="truncate">
                                                            {persona.email}
                                                        </span>
                                                    </div>
                                                )}
                                                {persona.telefono && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-3 w-3" />
                                                        <span>
                                                            {persona.telefono}
                                                        </span>
                                                    </div>
                                                )}
                                                {persona.ultimo_contacto && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            Último contacto:{" "}
                                                            {new Date(
                                                                persona.ultimo_contacto
                                                            ).toLocaleDateString(
                                                                "es-ES"
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 bg-transparent"
                                                    onClick={() => {
                                                        setNewInteraccion({
                                                            ...newInteraccion,
                                                            persona_id:
                                                                persona.id,
                                                        });
                                                        setShowCreateInteractionDialog(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    <MessageCircle className="h-3 w-3 mr-1" />
                                                    Contactar
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="interacciones" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interacciones Recientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {interacciones.map((interaccion) => {
                                    const persona = personas.find(
                                        (p) => p.id === interaccion.persona_id
                                    );
                                    const InteractionIcon = getInteractionIcon(
                                        interaccion.tipo
                                    );

                                    return (
                                        <div
                                            key={interaccion.id}
                                            className="border rounded-lg p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-muted rounded-full">
                                                    <InteractionIcon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-medium">
                                                            {persona?.nombre}{" "}
                                                            {persona?.apellido}
                                                        </h3>
                                                        <div className="text-sm text-muted-foreground">
                                                            {new Date(
                                                                interaccion.fecha
                                                            ).toLocaleDateString(
                                                                "es-ES"
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {
                                                            interaccion.descripcion
                                                        }
                                                    </p>
                                                    {interaccion.resultado && (
                                                        <div className="p-2 bg-green-50 rounded text-sm">
                                                            <strong>
                                                                Resultado:
                                                            </strong>{" "}
                                                            {
                                                                interaccion.resultado
                                                            }
                                                        </div>
                                                    )}
                                                    {interaccion.seguimiento_requerido && (
                                                        <Badge
                                                            variant="outline"
                                                            className="mt-2 text-orange-600"
                                                        >
                                                            Seguimiento
                                                            requerido
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="delegacion" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tareas Delegadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {tareasDelegadas.map((tarea) => {
                                    const persona = personas.find(
                                        (p) => p.id === tarea.persona_id
                                    );

                                    return (
                                        <div
                                            key={tarea.id}
                                            className="border rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-medium">
                                                        {tarea.titulo}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Delegada a:{" "}
                                                        {persona?.nombre}{" "}
                                                        {persona?.apellido}
                                                    </p>
                                                </div>
                                                <Badge
                                                    className={
                                                        tarea.status ===
                                                        "completada"
                                                            ? "bg-green-100 text-green-800"
                                                            : tarea.status ===
                                                              "en_progreso"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }
                                                >
                                                    {tarea.status}
                                                </Badge>
                                            </div>
                                            {tarea.descripcion && (
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {tarea.descripcion}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>
                                                    Asignada:{" "}
                                                    {new Date(
                                                        tarea.fecha_asignacion
                                                    ).toLocaleDateString(
                                                        "es-ES"
                                                    )}
                                                </span>
                                                {tarea.fecha_limite && (
                                                    <span>
                                                        Límite:{" "}
                                                        {new Date(
                                                            tarea.fecha_limite
                                                        ).toLocaleDateString(
                                                            "es-ES"
                                                        )}
                                                    </span>
                                                )}
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        tarea.prioridad ===
                                                        "alta"
                                                            ? "text-red-600"
                                                            : tarea.prioridad ===
                                                              "media"
                                                            ? "text-orange-600"
                                                            : "text-gray-600"
                                                    }
                                                >
                                                    {tarea.prioridad}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="seguimiento" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Personas que Necesitan Contacto
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {personasContactoPendiente.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">
                                    ¡Excelente! Estás al día con todos tus
                                    contactos.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {personasContactoPendiente.map(
                                        (persona) => {
                                            const diasSinContacto =
                                                persona.ultimo_contacto
                                                    ? Math.floor(
                                                          (new Date().getTime() -
                                                              new Date(
                                                                  persona.ultimo_contacto
                                                              ).getTime()) /
                                                              (1000 *
                                                                  60 *
                                                                  60 *
                                                                  24)
                                                      )
                                                    : 0;

                                            return (
                                                <div
                                                    key={persona.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg bg-orange-50"
                                                >
                                                    <div>
                                                        <h3 className="font-medium">
                                                            {persona.nombre}{" "}
                                                            {persona.apellido}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {diasSinContacto}{" "}
                                                            días sin contacto
                                                            (frecuencia: cada{" "}
                                                            {
                                                                persona.frecuencia_contacto_dias
                                                            }{" "}
                                                            días)
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setNewInteraccion({
                                                                ...newInteraccion,
                                                                persona_id:
                                                                    persona.id,
                                                            });
                                                            setShowCreateInteractionDialog(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        Contactar Ahora
                                                    </Button>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
