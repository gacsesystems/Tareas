import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Progress } from "@/Components/ui/progress";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { CheckCircle2, Circle, Target, Flame, Calendar } from "lucide-react";

export function HabitsView() {
    const habits = [
        {
            id: 1,
            name: "Ejercicio matutino",
            streak: 15,
            completedToday: true,
            weeklyGoal: 5,
            weeklyCompleted: 3,
            category: "Salud",
        },
        {
            id: 2,
            name: "Leer 30 minutos",
            streak: 8,
            completedToday: false,
            weeklyGoal: 7,
            weeklyCompleted: 4,
            category: "Desarrollo",
        },
        {
            id: 3,
            name: "Meditar 10 minutos",
            streak: 22,
            completedToday: false,
            weeklyGoal: 7,
            weeklyCompleted: 5,
            category: "Bienestar",
        },
        {
            id: 4,
            name: "Revisar finanzas",
            streak: 5,
            completedToday: true,
            weeklyGoal: 3,
            weeklyCompleted: 2,
            category: "Finanzas",
        },
        {
            id: 5,
            name: "Escribir en diario",
            streak: 12,
            completedToday: false,
            weeklyGoal: 5,
            weeklyCompleted: 3,
            category: "Reflexión",
        },
    ];

    const routines = [
        {
            id: 1,
            name: "Rutina Matutina",
            tasks: [
                "Ejercicio",
                "Ducha",
                "Desayuno saludable",
                "Revisar agenda",
            ],
            completedTasks: 3,
            totalTasks: 4,
        },
        {
            id: 2,
            name: "Cierre del Día",
            tasks: [
                "Revisar tareas completadas",
                "Planificar mañana",
                "Meditar",
                "Leer",
            ],
            completedTasks: 1,
            totalTasks: 4,
        },
    ];

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Salud":
                return "bg-chart-3/10 text-chart-3";
            case "Desarrollo":
                return "bg-chart-1/10 text-chart-1";
            case "Bienestar":
                return "bg-chart-2/10 text-chart-2";
            case "Finanzas":
                return "bg-chart-4/10 text-chart-4";
            case "Reflexión":
                return "bg-chart-5/10 text-chart-5";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-balance">
                        Hábitos & Rutinas
                    </h1>
                    <p className="text-muted-foreground">
                        Construye consistencia día a día
                    </p>
                </div>
            </div>

            {/* Resumen de hábitos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Hábitos totales
                            </span>
                        </div>
                        <p className="text-2xl font-bold">{habits.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-chart-3" />
                            <span className="text-sm text-muted-foreground">
                                Completados hoy
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-chart-3">
                            {habits.filter((h) => h.completedToday).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-chart-4" />
                            <span className="text-sm text-muted-foreground">
                                Mejor racha
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-chart-4">
                            {Math.max(...habits.map((h) => h.streak))} días
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Promedio semanal
                            </span>
                        </div>
                        <p className="text-2xl font-bold">
                            {Math.round(
                                (habits.reduce(
                                    (acc, h) =>
                                        acc + h.weeklyCompleted / h.weeklyGoal,
                                    0
                                ) /
                                    habits.length) *
                                    100
                            )}
                            %
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Hábitos diarios */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Hábitos de Hoy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {habits.map((habit) => (
                        <div
                            key={habit.id}
                            className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-auto"
                            >
                                {habit.completedToday ? (
                                    <CheckCircle2 className="h-6 w-6 text-accent" />
                                ) : (
                                    <Circle className="h-6 w-6" />
                                )}
                            </Button>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3
                                        className={`font-medium ${
                                            habit.completedToday
                                                ? "line-through text-muted-foreground"
                                                : ""
                                        }`}
                                    >
                                        {habit.name}
                                    </h3>
                                    <Badge
                                        className={getCategoryColor(
                                            habit.category
                                        )}
                                    >
                                        {habit.category}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Flame className="h-3 w-3 text-chart-4" />
                                        <span>{habit.streak} días</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>Esta semana</span>
                                            <span>
                                                {habit.weeklyCompleted}/
                                                {habit.weeklyGoal}
                                            </span>
                                        </div>
                                        <Progress
                                            value={
                                                (habit.weeklyCompleted /
                                                    habit.weeklyGoal) *
                                                100
                                            }
                                            className="h-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Rutinas */}
            <Card>
                <CardHeader>
                    <CardTitle>Rutinas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {routines.map((routine) => (
                        <div key={routine.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium">{routine.name}</h3>
                                <Badge variant="outline">
                                    {routine.completedTasks}/
                                    {routine.totalTasks}
                                </Badge>
                            </div>

                            <Progress
                                value={
                                    (routine.completedTasks /
                                        routine.totalTasks) *
                                    100
                                }
                                className="mb-3"
                            />

                            <div className="grid grid-cols-2 gap-2">
                                {routine.tasks.map((task, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        {index < routine.completedTasks ? (
                                            <CheckCircle2 className="h-3 w-3 text-accent" />
                                        ) : (
                                            <Circle className="h-3 w-3" />
                                        )}
                                        <span
                                            className={
                                                index < routine.completedTasks
                                                    ? "line-through text-muted-foreground"
                                                    : ""
                                            }
                                        >
                                            {task}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
