import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Slider } from "@/Components/ui/slider";
import {
    PenTool,
    Plus,
    Search,
    ArrowRight,
    Heart,
    Brain,
    Target,
    Lightbulb,
    TrendingUp,
    BookOpen,
    Filter,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";

interface JournalEntry {
    id: string;
    fecha: string;
    contenido_md: string;
    mood_score: number;
    energia_score: number;
    productividad_score: number;
    tags: string[];
    mejoras_identificadas: string[];
    gratitud: string[];
    aprendizajes: string[];
    tipo_entrada:
        | "diario"
        | "reflexion"
        | "aprendizaje"
        | "gratitud"
        | "revision";
    template_usado?: string;
    archivos_adjuntos?: string[];
    tiempo_escritura_min?: number;
}

interface Template {
    id: string;
    nombre: string;
    descripcion: string;
    prompts: string[];
    tipo: "diario" | "reflexion" | "aprendizaje" | "gratitud" | "revision";
}

export function JournalView() {
    const [entries, setEntries] = useState<JournalEntry[]>([
        {
            id: "1",
            fecha: "2025-01-09",
            contenido_md:
                "Hoy fue un día productivo. Completé la propuesta para el cliente ABC y tuve una excelente reunión con el equipo.\n\n**Logros del día:**\n- Propuesta ABC finalizada\n- Reunión exitosa con equipo\n- 2 horas de deep work\n\n**Desafíos:**\n- Interrupciones constantes en la mañana\n- Dificultad para concentrarme después del almuerzo",
            mood_score: 8,
            energia_score: 7,
            productividad_score: 9,
            tags: ["productividad", "trabajo", "equipo"],
            mejoras_identificadas: [
                "Bloquear tiempo sin interrupciones en la mañana",
                "Cambiar rutina post-almuerzo",
            ],
            gratitud: [
                "Equipo colaborativo",
                "Cliente que confía en mi trabajo",
            ],
            aprendizajes: [
                "La planificación inicial es clave para el éxito del proyecto",
            ],
            tipo_entrada: "diario",
            tiempo_escritura_min: 15,
        },
        {
            id: "2",
            fecha: "2025-01-08",
            contenido_md:
                "**Reflexión semanal**\n\nEsta semana logré avanzar significativamente en mis objetivos principales. Sin embargo, noté que mi energía baja considerablemente los miércoles.\n\n**Patrones identificados:**\n- Lunes y martes: alta energía y productividad\n- Miércoles: bajón energético\n- Jueves y viernes: recuperación gradual\n\n**Hipótesis:** Sobrecarga de reuniones los martes afecta el miércoles.",
            mood_score: 7,
            energia_score: 6,
            productividad_score: 7,
            tags: ["reflexion", "patrones", "energia"],
            mejoras_identificadas: [
                "Redistribuir reuniones a lo largo de la semana",
            ],
            gratitud: [
                "Tiempo para reflexionar",
                "Capacidad de autoobservación",
            ],
            aprendizajes: [
                "Los patrones de energía son predecibles y optimizables",
            ],
            tipo_entrada: "reflexion",
            template_usado: "revision_semanal",
        },
    ]);

    const [templates] = useState<Template[]>([
        {
            id: "diario_basico",
            nombre: "Diario Básico",
            descripcion: "Reflexión diaria simple",
            prompts: [
                "¿Qué pasó hoy?",
                "¿Cómo me siento?",
                "¿Qué aprendí?",
                "¿Qué puedo mejorar mañana?",
            ],
            tipo: "diario",
        },
        {
            id: "revision_semanal",
            nombre: "Revisión Semanal",
            descripcion: "Análisis profundo de la semana",
            prompts: [
                "¿Cuáles fueron mis principales logros esta semana?",
                "¿Qué desafíos enfrenté y cómo los resolví?",
                "¿Qué patrones noto en mi comportamiento/energía?",
                "¿Qué ajustes haré la próxima semana?",
            ],
            tipo: "revision",
        },
        {
            id: "gratitud_diaria",
            nombre: "Gratitud Diaria",
            descripcion: "Enfoque en lo positivo",
            prompts: [
                "¿Por qué 3 cosas estoy agradecido hoy?",
                "¿Qué persona me ayudó o inspiró hoy?",
                "¿Qué momento del día me trajo más alegría?",
                "¿Cómo puedo expresar gratitud mañana?",
            ],
            tipo: "gratitud",
        },
        {
            id: "aprendizaje_profundo",
            nombre: "Sesión de Aprendizaje",
            descripción: "Reflexión sobre nuevo conocimiento",
            prompts: [
                "¿Qué concepto nuevo aprendí hoy?",
                "¿Cómo se conecta con lo que ya sabía?",
                "¿Dónde puedo aplicar este conocimiento?",
                "¿Qué preguntas me surgen ahora?",
            ],
            tipo: "aprendizaje",
        },
    ]);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [newEntry, setNewEntry] = useState({
        contenido_md: "",
        mood_score: 5,
        energia_score: 5,
        productividad_score: 5,
        tags: "",
        mejoras_identificadas: "",
        gratitud: "",
        aprendizajes: "",
        tipo_entrada: "diario" as const,
    });

    const handleCreateEntry = () => {
        if (!newEntry.contenido_md.trim()) return;

        const entry: JournalEntry = {
            id: Date.now().toString(),
            fecha: new Date().toISOString().split("T")[0],
            contenido_md: newEntry.contenido_md,
            mood_score: newEntry.mood_score,
            energia_score: newEntry.energia_score,
            productividad_score: newEntry.productividad_score,
            tags: newEntry.tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t),
            mejoras_identificadas: newEntry.mejoras_identificadas
                .split("\n")
                .filter((m) => m.trim()),
            gratitud: newEntry.gratitud.split("\n").filter((g) => g.trim()),
            aprendizajes: newEntry.aprendizajes
                .split("\n")
                .filter((a) => a.trim()),
            tipo_entrada: newEntry.tipo_entrada,
            template_usado: selectedTemplate || undefined,
            tiempo_escritura_min: Math.floor(Math.random() * 20) + 5, // Simulado
        };

        setEntries([entry, ...entries]);
        setNewEntry({
            contenido_md: "",
            mood_score: 5,
            energia_score: 5,
            productividad_score: 5,
            tags: "",
            mejoras_identificadas: "",
            gratitud: "",
            aprendizajes: "",
            tipo_entrada: "diario",
        });
        setSelectedTemplate("");
        setShowCreateDialog(false);
    };

    const loadTemplate = (templateId: string) => {
        const template = templates.find((t) => t.id === templateId);
        if (template) {
            const promptsText = template.prompts
                .map((p) => `**${p}**\n\n`)
                .join("\n");
            setNewEntry({
                ...newEntry,
                contenido_md: promptsText,
                tipo_entrada: template.tipo,
            });
            setSelectedTemplate(templateId);
        }
    };

    const createTaskFromImprovement = (improvement: string) => {
        // Integración con sistema de tareas
        console.log("Crear tarea:", improvement);
    };

    const getTypeIcon = (tipo: string) => {
        switch (tipo) {
            case "diario":
                return PenTool;
            case "reflexion":
                return Brain;
            case "aprendizaje":
                return BookOpen;
            case "gratitud":
                return Heart;
            case "revision":
                return Target;
            default:
                return PenTool;
        }
    };

    const getTypeColor = (tipo: string) => {
        switch (tipo) {
            case "diario":
                return "bg-blue-100 text-blue-800";
            case "reflexion":
                return "bg-purple-100 text-purple-800";
            case "aprendizaje":
                return "bg-green-100 text-green-800";
            case "gratitud":
                return "bg-pink-100 text-pink-800";
            case "revision":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const filteredEntries = entries.filter((entry) => {
        const matchesSearch =
            entry.contenido_md
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            entry.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            );
        const matchesType =
            filterType === "all" || entry.tipo_entrada === filterType;
        return matchesSearch && matchesType;
    });

    const promedioMood =
        entries.length > 0
            ? entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length
            : 0;
    const promedioEnergia =
        entries.length > 0
            ? entries.reduce((sum, e) => sum + e.energia_score, 0) /
              entries.length
            : 0;
    const promedioProductividad =
        entries.length > 0
            ? entries.reduce((sum, e) => sum + e.productividad_score, 0) /
              entries.length
            : 0;
    const totalMejoras = entries.reduce(
        (sum, e) => sum + e.mejoras_identificadas.length,
        0
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Diario Personal</h1>
                    <p className="text-muted-foreground">
                        Reflexiona, aprende y crece cada día
                    </p>
                </div>
                <Dialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Entrada
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Nueva Entrada del Diario</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            {/* Selección de Template */}
                            <div>
                                <Label>Template (opcional)</Label>
                                <Select
                                    value={selectedTemplate}
                                    onValueChange={loadTemplate}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un template o escribe libremente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map((template) => (
                                            <SelectItem
                                                key={template.id}
                                                value={template.id}
                                            >
                                                <div>
                                                    <div className="font-medium">
                                                        {template.nombre}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {template.descripcion}
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tipo de Entrada */}
                            <div>
                                <Label>Tipo de Entrada</Label>
                                <Select
                                    value={newEntry.tipo_entrada}
                                    onValueChange={(value: any) =>
                                        setNewEntry({
                                            ...newEntry,
                                            tipo_entrada: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="diario">
                                            📝 Diario
                                        </SelectItem>
                                        <SelectItem value="reflexion">
                                            🧠 Reflexión
                                        </SelectItem>
                                        <SelectItem value="aprendizaje">
                                            📚 Aprendizaje
                                        </SelectItem>
                                        <SelectItem value="gratitud">
                                            ❤️ Gratitud
                                        </SelectItem>
                                        <SelectItem value="revision">
                                            🎯 Revisión
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Contenido Principal */}
                            <div>
                                <Label>Contenido (Markdown soportado)</Label>
                                <Textarea
                                    placeholder="Escribe tu reflexión del día..."
                                    value={newEntry.contenido_md}
                                    onChange={(e) =>
                                        setNewEntry({
                                            ...newEntry,
                                            contenido_md: e.target.value,
                                        })
                                    }
                                    rows={12}
                                    className="font-mono"
                                />
                            </div>

                            {/* Scores */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>
                                        Estado de Ánimo: {newEntry.mood_score}
                                        /10
                                    </Label>
                                    <Slider
                                        value={[newEntry.mood_score]}
                                        onValueChange={(value) =>
                                            setNewEntry({
                                                ...newEntry,
                                                mood_score: value[0],
                                            })
                                        }
                                        max={10}
                                        min={1}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Nivel de Energía:{" "}
                                        {newEntry.energia_score}/10
                                    </Label>
                                    <Slider
                                        value={[newEntry.energia_score]}
                                        onValueChange={(value) =>
                                            setNewEntry({
                                                ...newEntry,
                                                energia_score: value[0],
                                            })
                                        }
                                        max={10}
                                        min={1}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Productividad:{" "}
                                        {newEntry.productividad_score}/10
                                    </Label>
                                    <Slider
                                        value={[newEntry.productividad_score]}
                                        onValueChange={(value) =>
                                            setNewEntry({
                                                ...newEntry,
                                                productividad_score: value[0],
                                            })
                                        }
                                        max={10}
                                        min={1}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            {/* Secciones Adicionales */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>
                                        Mejoras Identificadas (una por línea)
                                    </Label>
                                    <Textarea
                                        placeholder="Qué puedo mejorar..."
                                        value={newEntry.mejoras_identificadas}
                                        onChange={(e) =>
                                            setNewEntry({
                                                ...newEntry,
                                                mejoras_identificadas:
                                                    e.target.value,
                                            })
                                        }
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label>Gratitud (una por línea)</Label>
                                    <Textarea
                                        placeholder="Por qué estoy agradecido..."
                                        value={newEntry.gratitud}
                                        onChange={(e) =>
                                            setNewEntry({
                                                ...newEntry,
                                                gratitud: e.target.value,
                                            })
                                        }
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Aprendizajes (uno por línea)</Label>
                                    <Textarea
                                        placeholder="Qué aprendí hoy..."
                                        value={newEntry.aprendizajes}
                                        onChange={(e) =>
                                            setNewEntry({
                                                ...newEntry,
                                                aprendizajes: e.target.value,
                                            })
                                        }
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label>Tags (separados por comas)</Label>
                                    <Input
                                        placeholder="productividad, trabajo, reflexión..."
                                        value={newEntry.tags}
                                        onChange={(e) =>
                                            setNewEntry({
                                                ...newEntry,
                                                tags: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleCreateEntry}>
                                    Guardar Entrada
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="entradas" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="entradas">Entradas</TabsTrigger>
                    <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="entradas" className="space-y-6">
                    {/* Estadísticas Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <PenTool className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {entries.length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Total Entradas
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-pink-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {promedioMood.toFixed(1)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Ánimo Promedio
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {promedioProductividad.toFixed(1)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Productividad
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {totalMejoras}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Mejoras ID
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filtros y Búsqueda */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar en entradas..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select
                            value={filterType}
                            onValueChange={setFilterType}
                        >
                            <SelectTrigger className="w-48">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos los tipos
                                </SelectItem>
                                <SelectItem value="diario">Diario</SelectItem>
                                <SelectItem value="reflexion">
                                    Reflexión
                                </SelectItem>
                                <SelectItem value="aprendizaje">
                                    Aprendizaje
                                </SelectItem>
                                <SelectItem value="gratitud">
                                    Gratitud
                                </SelectItem>
                                <SelectItem value="revision">
                                    Revisión
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lista de Entradas */}
                    <div className="space-y-4">
                        {filteredEntries.map((entry) => {
                            const TypeIcon = getTypeIcon(entry.tipo_entrada);
                            return (
                                <Card key={entry.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <TypeIcon className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <CardTitle className="text-lg">
                                                        {new Date(
                                                            entry.fecha
                                                        ).toLocaleDateString(
                                                            "es-ES",
                                                            {
                                                                weekday: "long",
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge
                                                            className={getTypeColor(
                                                                entry.tipo_entrada
                                                            )}
                                                        >
                                                            {entry.tipo_entrada}
                                                        </Badge>
                                                        {entry.template_usado && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                Template
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Heart className="h-3 w-3" />
                                                    {entry.mood_score}/10
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {entry.productividad_score}
                                                    /10
                                                </div>
                                                {entry.tiempo_escritura_min && (
                                                    <span>
                                                        {
                                                            entry.tiempo_escritura_min
                                                        }
                                                        min
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="prose prose-sm max-w-none">
                                            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                                {entry.contenido_md}
                                            </div>
                                        </div>

                                        {entry.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {entry.tags.map(
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

                                        {entry.gratitud.length > 0 && (
                                            <div className="p-3 bg-pink-50 rounded-lg">
                                                <h4 className="font-medium text-pink-800 mb-2 flex items-center gap-1">
                                                    <Heart className="h-3 w-3" />
                                                    Gratitud
                                                </h4>
                                                <ul className="text-sm space-y-1">
                                                    {entry.gratitud.map(
                                                        (item, index) => (
                                                            <li
                                                                key={index}
                                                                className="text-pink-700"
                                                            >
                                                                • {item}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {entry.aprendizajes.length > 0 && (
                                            <div className="p-3 bg-green-50 rounded-lg">
                                                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-1">
                                                    <BookOpen className="h-3 w-3" />
                                                    Aprendizajes
                                                </h4>
                                                <ul className="text-sm space-y-1">
                                                    {entry.aprendizajes.map(
                                                        (item, index) => (
                                                            <li
                                                                key={index}
                                                                className="text-green-700"
                                                            >
                                                                • {item}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {entry.mejoras_identificadas.length >
                                            0 && (
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                                                    <ArrowRight className="h-3 w-3" />
                                                    Mejoras Identificadas
                                                </h4>
                                                <div className="space-y-2">
                                                    {entry.mejoras_identificadas.map(
                                                        (mejora, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between"
                                                            >
                                                                <span className="text-sm text-blue-700">
                                                                    • {mejora}
                                                                </span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        createTaskFromImprovement(
                                                                            mejora
                                                                        )
                                                                    }
                                                                    className="text-xs"
                                                                >
                                                                    Crear Tarea
                                                                </Button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="estadisticas" className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    Estadísticas y gráficos de progreso
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Análisis de patrones de ánimo, productividad
                                    y crecimiento personal
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((template) => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge
                                            className={getTypeColor(
                                                template.tipo
                                            )}
                                        >
                                            {template.tipo}
                                        </Badge>
                                        {template.nombre}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {template.descripcion}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">
                                            Prompts incluidos:
                                        </h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            {template.prompts.map(
                                                (prompt, index) => (
                                                    <li key={index}>
                                                        • {prompt}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                    <Button
                                        className="w-full mt-4 bg-transparent"
                                        variant="outline"
                                        onClick={() => {
                                            loadTemplate(template.id);
                                            setShowCreateDialog(true);
                                        }}
                                    >
                                        Usar Template
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    Insights y análisis de patrones
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    IA para identificar patrones en tu
                                    crecimiento personal
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
