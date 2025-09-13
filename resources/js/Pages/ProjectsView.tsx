import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Progress } from "@/Components/ui/progress";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    FolderOpen,
    Plus,
    Calendar,
    CheckCircle2,
    Star,
    Baseline as Timeline,
    ArrowUpRightFromCircle as ArrowRightFromCircle,
    Target,
    AlertTriangle,
    Clock,
} from "lucide-react";

export function ProjectsView() {
    const [projects, setProjects] = useState([
        {
            id: 1,
            nombre: "Rediseño Web Corporativa",
            descripcion:
                "Modernización completa del sitio web corporativo con nuevo diseño y funcionalidades",
            progreso_pct: 75.5,
            totalTasks: 12,
            completedTasks: 9,
            fec_inicio_plan: "2025-08-01",
            fec_fin_plan: "2025-09-15",
            fec_inicio_real: "2025-08-03",
            fec_fin_real: null,
            status: "abierto",
            prioridad: "alta",
            estrategico: true,
            area: "Empresa",
            criterio_cierre: "tareas",
            objetivo_principal:
                "Lanzar nueva web antes del Q4 con mejora del 40% en conversión",
            proxima_accion_tarea_id: 45,
            proxima_accion_modo: "auto",
            proxima_accion_updated_at: "2025-09-02T14:30:00Z",
            etapas: [
                {
                    id: 1,
                    nombre: "Descubrimiento",
                    progreso_pct: 100,
                    done: true,
                    orden: 1,
                },
                {
                    id: 2,
                    nombre: "Diseño",
                    progreso_pct: 85,
                    done: false,
                    orden: 2,
                },
                {
                    id: 3,
                    nombre: "Desarrollo",
                    progreso_pct: 60,
                    done: false,
                    orden: 3,
                },
                {
                    id: 4,
                    nombre: "Testing",
                    progreso_pct: 0,
                    done: false,
                    orden: 4,
                },
            ],
            objetivos: [
                {
                    id: 1,
                    descripcion: "Mejorar velocidad de carga en 50%",
                    cumplido: true,
                    fecha_objetivo: "2025-09-10",
                },
                {
                    id: 2,
                    descripcion: "Implementar diseño responsive",
                    cumplido: false,
                    fecha_objetivo: "2025-09-12",
                },
                {
                    id: 3,
                    descripcion: "Integrar sistema de analytics",
                    cumplido: false,
                    fecha_objetivo: "2025-09-15",
                },
            ],
        },
        {
            id: 2,
            nombre: "Sistema CRM Interno",
            descripcion:
                "Desarrollo de CRM personalizado para gestión de clientes y ventas",
            progreso_pct: 45.2,
            totalTasks: 20,
            completedTasks: 9,
            fec_inicio_plan: "2025-07-15",
            fec_fin_plan: "2025-09-30",
            fec_inicio_real: "2025-07-20",
            fec_fin_real: null,
            status: "abierto",
            prioridad: "alta",
            estrategico: true,
            area: "Empresa",
            criterio_cierre: "objetivos",
            objetivo_principal:
                "Sistema CRM operativo con migración completa de datos",
            proxima_accion_tarea_id: 67,
            proxima_accion_modo: "manual",
            proxima_accion_updated_at: "2025-09-01T09:15:00Z",
            etapas: [
                {
                    id: 5,
                    nombre: "Análisis",
                    progreso_pct: 100,
                    done: true,
                    orden: 1,
                },
                {
                    id: 6,
                    nombre: "Backend",
                    progreso_pct: 70,
                    done: false,
                    orden: 2,
                },
                {
                    id: 7,
                    nombre: "Frontend",
                    progreso_pct: 30,
                    done: false,
                    orden: 3,
                },
                {
                    id: 8,
                    nombre: "Integración",
                    progreso_pct: 0,
                    done: false,
                    orden: 4,
                },
            ],
            objetivos: [
                {
                    id: 4,
                    descripcion: "Migrar 100% de datos de clientes",
                    cumplido: false,
                    fecha_objetivo: "2025-09-20",
                },
                {
                    id: 5,
                    descripcion: "Capacitar equipo de ventas",
                    cumplido: false,
                    fecha_objetivo: "2025-09-25",
                },
            ],
        },
        {
            id: 3,
            nombre: "Curso de Productividad Personal",
            descripcion:
                "Desarrollo de habilidades de gestión del tiempo y productividad",
            progreso_pct: 30.0,
            totalTasks: 8,
            completedTasks: 2,
            fec_inicio_plan: "2025-08-15",
            fec_fin_plan: "2025-10-10",
            fec_inicio_real: "2025-08-18",
            fec_fin_real: null,
            status: "abierto",
            prioridad: "media",
            estrategico: false,
            area: "Personal",
            criterio_cierre: "tareas",
            objetivo_principal:
                "Completar certificación en metodologías de productividad",
            proxima_accion_tarea_id: null,
            proxima_accion_modo: "auto",
            proxima_accion_updated_at: null,
            etapas: [
                {
                    id: 9,
                    nombre: "Módulo 1: GTD",
                    progreso_pct: 80,
                    done: false,
                    orden: 1,
                },
                {
                    id: 10,
                    nombre: "Módulo 2: Pomodoro",
                    progreso_pct: 20,
                    done: false,
                    orden: 2,
                },
                {
                    id: 11,
                    nombre: "Módulo 3: Time Blocking",
                    progreso_pct: 0,
                    done: false,
                    orden: 3,
                },
            ],
            objetivos: [
                {
                    id: 6,
                    descripcion: "Completar todos los módulos",
                    cumplido: false,
                    fecha_objetivo: "2025-10-01",
                },
                {
                    id: 7,
                    descripcion: "Implementar sistema personal",
                    cumplido: false,
                    fecha_objetivo: "2025-10-10",
                },
            ],
        },
        {
            id: 4,
            nombre: "Optimización Procesos Financieros",
            descripcion:
                "Automatización y mejora de procesos de facturación y cobranza",
            progreso_pct: 100.0,
            totalTasks: 6,
            completedTasks: 6,
            fec_inicio_plan: "2025-07-01",
            fec_fin_plan: "2025-09-01",
            fec_inicio_real: "2025-07-01",
            fec_fin_real: "2025-08-28",
            status: "cerrado",
            prioridad: "alta",
            estrategico: false,
            area: "Empresa",
            criterio_cierre: "tareas",
            objetivo_principal: "Reducir tiempo de cobranza en 60%",
            proxima_accion_tarea_id: null,
            proxima_accion_modo: "auto",
            proxima_accion_updated_at: "2025-08-28T16:00:00Z",
            etapas: [
                {
                    id: 12,
                    nombre: "Análisis",
                    progreso_pct: 100,
                    done: true,
                    orden: 1,
                },
                {
                    id: 13,
                    nombre: "Implementación",
                    progreso_pct: 100,
                    done: true,
                    orden: 2,
                },
                {
                    id: 14,
                    nombre: "Validación",
                    progreso_pct: 100,
                    done: true,
                    orden: 3,
                },
            ],
            objetivos: [
                {
                    id: 8,
                    descripcion: "Automatizar 80% de facturas",
                    cumplido: true,
                    fecha_objetivo: "2025-08-15",
                },
                {
                    id: 9,
                    descripcion: "Reducir días de cobranza",
                    cumplido: true,
                    fecha_objetivo: "2025-08-30",
                },
            ],
        },
    ]);

    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [showGantt, setShowGantt] = useState(false);

    const getPriorityColor = (prioridad: string) => {
        switch (prioridad) {
            case "alta":
                return "bg-red-100 text-red-800 border-red-200";
            case "media":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "baja":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getHealthStatus = (project: any) => {
        const today = new Date();
        const finPlan = new Date(project.fec_fin_plan);
        const daysLeft = Math.ceil(
            (finPlan.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (project.status === "cerrado")
            return {
                status: "completado",
                color: "text-green-600",
                icon: CheckCircle2,
            };
        if (daysLeft < 0)
            return {
                status: "vencido",
                color: "text-red-600",
                icon: AlertTriangle,
            };
        if (daysLeft <= 7 && project.progreso_pct < 80)
            return {
                status: "riesgo",
                color: "text-orange-600",
                icon: AlertTriangle,
            };
        if (project.progreso_pct >= 75)
            return {
                status: "bien",
                color: "text-green-600",
                icon: CheckCircle2,
            };
        return { status: "normal", color: "text-blue-600", icon: Clock };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getDaysLeft = (fechaFin: string) => {
        const today = new Date();
        const fin = new Date(fechaFin);
        const diff = Math.ceil(
            (fin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diff;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-balance">
                        Proyectos
                    </h1>
                    <p className="text-muted-foreground">
                        Gestiona tus proyectos y su progreso
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowGantt(!showGantt)}
                    >
                        <Timeline className="h-4 w-4 mr-2" />
                        {showGantt ? "Vista Cards" : "Vista Gantt"}
                    </Button>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Proyecto
                    </Button>
                </div>
            </div>

            {/* Resumen de proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Total
                            </span>
                        </div>
                        <p className="text-2xl font-bold">{projects.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-muted-foreground">
                                Estratégicos
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                            {projects.filter((p) => p.estrategico).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-chart-3" />
                            <span className="text-sm text-muted-foreground">
                                Completados
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-chart-3">
                            {
                                projects.filter((p) => p.status === "cerrado")
                                    .length
                            }
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-chart-4" />
                            <span className="text-sm text-muted-foreground">
                                En progreso
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-chart-4">
                            {
                                projects.filter((p) => p.status === "abierto")
                                    .length
                            }
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Progreso promedio
                            </span>
                        </div>
                        <p className="text-2xl font-bold">
                            {Math.round(
                                projects.reduce(
                                    (acc, p) => acc + p.progreso_pct,
                                    0
                                ) / projects.length
                            )}
                            %
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project) => {
                    const health = getHealthStatus(project);
                    const daysLeft = getDaysLeft(project.fec_fin_plan);
                    const HealthIcon = health.icon;

                    return (
                        <Card
                            key={project.id}
                            className={`${
                                project.status === "cerrado" ? "opacity-75" : ""
                            } ${
                                project.estrategico
                                    ? "border-yellow-200 bg-yellow-50/30"
                                    : ""
                            }`}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {project.estrategico && (
                                                <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                                            )}
                                            <CardTitle className="text-lg">
                                                {project.nombre}
                                            </CardTitle>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {project.descripcion}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge
                                                variant={
                                                    project.area === "Empresa"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {project.area}
                                            </Badge>
                                            <Badge
                                                className={getPriorityColor(
                                                    project.prioridad
                                                )}
                                            >
                                                {project.prioridad}
                                            </Badge>
                                            <Badge
                                                variant={
                                                    project.status === "cerrado"
                                                        ? "default"
                                                        : "outline"
                                                }
                                            >
                                                {project.status === "cerrado"
                                                    ? "Completado"
                                                    : "En progreso"}
                                            </Badge>
                                            <div
                                                className={`flex items-center gap-1 ${health.color}`}
                                            >
                                                <HealthIcon className="h-3 w-3" />
                                                <span className="text-xs font-medium">
                                                    {health.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Progreso General</span>
                                        <span>
                                            {project.progreso_pct.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={project.progreso_pct}
                                        className="mb-3"
                                    />

                                    {/* Etapas mini-progress */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {project.etapas
                                            .slice(0, 4)
                                            .map((etapa) => (
                                                <div
                                                    key={etapa.id}
                                                    className="flex items-center gap-1"
                                                >
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${
                                                            etapa.done
                                                                ? "bg-green-500"
                                                                : etapa.progreso_pct >
                                                                  0
                                                                ? "bg-blue-500"
                                                                : "bg-gray-300"
                                                        }`}
                                                    />
                                                    <span
                                                        className={
                                                            etapa.done
                                                                ? "line-through text-muted-foreground"
                                                                : ""
                                                        }
                                                    >
                                                        {etapa.nombre}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {project.objetivo_principal && (
                                    <div className="p-2 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Objetivo Principal:
                                        </p>
                                        <p className="text-sm font-medium">
                                            {project.objetivo_principal}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {project.status === "cerrado"
                                                ? `Completado: ${formatDate(
                                                      project.fec_fin_real!
                                                  )}`
                                                : `Vence: ${formatDate(
                                                      project.fec_fin_plan
                                                  )}`}
                                        </span>
                                    </div>
                                    {project.status === "abierto" && (
                                        <Badge
                                            variant={
                                                daysLeft < 0
                                                    ? "destructive"
                                                    : daysLeft <= 7
                                                    ? "secondary"
                                                    : "outline"
                                            }
                                            className="text-xs"
                                        >
                                            {daysLeft < 0
                                                ? `${Math.abs(
                                                      daysLeft
                                                  )}d vencido`
                                                : `${daysLeft}d restantes`}
                                        </Badge>
                                    )}
                                </div>

                                {project.proxima_accion_tarea_id && (
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                        <ArrowRightFromCircle className="h-4 w-4 text-blue-600" />
                                        <div className="flex-1">
                                            <p className="text-xs text-blue-600 font-medium">
                                                Próxima Acción
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Tarea #
                                                {
                                                    project.proxima_accion_tarea_id
                                                }
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-600 border-blue-200 bg-transparent"
                                        >
                                            Ir
                                        </Button>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 bg-transparent"
                                    >
                                        Ver Detalles
                                    </Button>
                                    {project.etapas.length > 0 && (
                                        <Button variant="outline" size="sm">
                                            <Timeline className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {project.status === "abierto" && (
                                        <Button variant="outline" size="sm">
                                            <Target className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

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
                            {projects
                                .filter((p) => p.status === "abierto")
                                .map((project) => (
                                    <div key={project.id} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {project.estrategico && (
                                                <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                                            )}
                                            <h4 className="font-medium">
                                                {project.nombre}
                                            </h4>
                                            <Badge
                                                className={getPriorityColor(
                                                    project.prioridad
                                                )}
                                            >
                                                {project.prioridad}
                                            </Badge>
                                        </div>
                                        <div className="ml-6 space-y-1">
                                            {project.etapas.map((etapa) => (
                                                <div
                                                    key={etapa.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div
                                                        className={`w-3 h-3 rounded-full ${
                                                            etapa.done
                                                                ? "bg-green-500"
                                                                : "bg-blue-500"
                                                        }`}
                                                    />
                                                    <span
                                                        className={`text-sm ${
                                                            etapa.done
                                                                ? "line-through text-muted-foreground"
                                                                : ""
                                                        }`}
                                                    >
                                                        {etapa.nombre}
                                                    </span>
                                                    <div className="flex-1 mx-2">
                                                        <Progress
                                                            value={
                                                                etapa.progreso_pct
                                                            }
                                                            className="h-2"
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {etapa.progreso_pct.toFixed(
                                                            0
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
