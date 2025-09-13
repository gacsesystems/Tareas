import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Target, DollarSign } from "lucide-react";

export function WeeklyPlanView() {
    const weekDays = [
        {
            day: "Lun",
            date: "2",
            tasks: ["Reunión equipo", "Revisar propuestas"],
            events: ["Cumpleaños Ana"],
        },
        {
            day: "Mar",
            date: "3",
            tasks: ["Llamadas clientes", "Actualizar CRM"],
            events: [],
        },
        {
            day: "Mié",
            date: "4",
            tasks: ["Presentación proyecto", "Revisar finanzas"],
            events: ["Pago proveedor"],
        },
        {
            day: "Jue",
            date: "5",
            tasks: ["Desarrollo app", "Testing"],
            events: [],
        },
        {
            day: "Vie",
            date: "6",
            tasks: ["Cierre semanal", "Planificación"],
            events: ["Cobro Cliente X"],
        },
        { day: "Sáb", date: "7", tasks: ["Tiempo personal"], events: [] },
        { day: "Dom", date: "8", tasks: ["Descanso", "Reflexión"], events: [] },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-balance">
                        Plan Semanal
                    </h1>
                    <p className="text-muted-foreground">
                        Semana del 2 al 8 de Septiembre 2025
                    </p>
                </div>
            </div>

            {/* Metas de la semana */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Metas de la Semana
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-semibold mb-2">Empresa</h3>
                            <p className="text-sm text-muted-foreground">
                                Cerrar 3 propuestas nuevas
                            </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-semibold mb-2">Personal</h3>
                            <p className="text-sm text-muted-foreground">
                                Completar curso de productividad
                            </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-semibold mb-2">Finanzas</h3>
                            <p className="text-sm text-muted-foreground">
                                Cobrar $50,000 pendientes
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vista semanal */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day, index) => (
                    <Card
                        key={index}
                        className={day.day === "Mié" ? "border-accent" : ""}
                    >
                        <CardHeader className="pb-2">
                            <div className="text-center">
                                <p className="text-sm font-medium">{day.day}</p>
                                <p className="text-2xl font-bold">{day.date}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {day.tasks.map((task, taskIndex) => (
                                <div
                                    key={taskIndex}
                                    className="p-2 bg-muted/50 rounded text-xs"
                                >
                                    {task}
                                </div>
                            ))}
                            {day.events.map((event, eventIndex) => (
                                <Badge
                                    key={eventIndex}
                                    variant="secondary"
                                    className="text-xs w-full justify-center"
                                >
                                    {event}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Próximos cobros y pagos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Cobros y Pagos de la Semana
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-3 text-chart-3">
                                Cobros Esperados
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-chart-3/10 rounded">
                                    <span className="text-sm">
                                        Cliente ABC - Miércoles
                                    </span>
                                    <Badge variant="outline">$15,000</Badge>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-chart-3/10 rounded">
                                    <span className="text-sm">
                                        Proyecto XYZ - Viernes
                                    </span>
                                    <Badge variant="outline">$25,000</Badge>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3 text-chart-5">
                                Pagos Programados
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-chart-5/10 rounded">
                                    <span className="text-sm">
                                        Proveedor A - Miércoles
                                    </span>
                                    <Badge variant="outline">$8,000</Badge>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-chart-5/10 rounded">
                                    <span className="text-sm">
                                        Servicios - Viernes
                                    </span>
                                    <Badge variant="outline">$3,500</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
