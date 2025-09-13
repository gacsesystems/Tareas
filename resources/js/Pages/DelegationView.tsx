import { Card, CardContent, CardHeader, CardTitle, } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { Progress } from "../Components/ui/progress";
import { Users, Clock, AlertCircle, CheckCircle2, Plus, MessageCircle, } from "lucide-react";

export function DelegationView() {
  const delegatedTasks = [
    {
      id: 1,
      task: "Diseñar mockups para nueva landing page",
      assignee: "Ana García",
      dueDate: "2025-09-05",
      status: "En progreso",
      progress: 60,
      lastUpdate: "Hace 2 horas",
      nextPing: "2025-09-04",
    },
    {
      id: 2,
      task: "Revisar contenido del blog corporativo",
      assignee: "Carlos López",
      dueDate: "2025-09-06",
      status: "Pendiente",
      progress: 0,
      lastUpdate: "Hace 1 día",
      nextPing: "2025-09-04",
    },
    {
      id: 3,
      task: "Configurar servidor de producción",
      assignee: "María Rodríguez",
      dueDate: "2025-09-03",
      status: "En revisión",
      progress: 90,
      lastUpdate: "Hace 30 min",
      nextPing: null,
    },
    {
      id: 4,
      task: "Actualizar documentación técnica",
      assignee: "Pedro Martín",
      dueDate: "2025-09-02",
      status: "Vencido",
      progress: 30,
      lastUpdate: "Hace 2 días",
      nextPing: "Hoy",
    },
  ];

  const waitingFor = [
    {
      id: 1,
      item: "Aprobación del presupuesto Q4",
      responsible: "Director Financiero",
      since: "2025-08-28",
      nextAction: "Seguimiento por email",
    },
    {
      id: 2,
      item: "Feedback del cliente sobre propuesta",
      responsible: "Cliente ABC Corp",
      since: "2025-09-01",
      nextAction: "Llamada de seguimiento",
    },
    {
      id: 3,
      item: "Entrega de assets de diseño",
      responsible: "Agencia Externa",
      since: "2025-08-30",
      nextAction: "Revisar contrato y plazos",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completado": return "default";
      case "En progreso": return "secondary";
      case "En revisión": return "outline";
      case "Pendiente": return "secondary";
      case "Vencido": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completado": return <CheckCircle2 className="h-4 w-4" />;
      case "En progreso": return <Clock className="h-4 w-4" />;
      case "Vencido": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Delegación & Supervisión</h1>
          <p className="text-muted-foreground">Gestiona tareas asignadas y seguimientos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Delegar Tarea
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tareas delegadas</span>
            </div>
            <p className="text-2xl font-bold">{delegatedTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-chart-4" />
              <span className="text-sm text-muted-foreground">En progreso</span>
            </div>
            <p className="text-2xl font-bold text-chart-4">
              {delegatedTasks.filter((t) => t.status === "En progreso").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Vencidas</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {delegatedTasks.filter((t) => t.status === "Vencido").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-chart-3" />
              <span className="text-sm text-muted-foreground">Esperando respuesta</span>
            </div>
            <p className="text-2xl font-bold text-chart-3">{waitingFor.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tareas delegadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tareas Delegadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {delegatedTasks.map((task) => (
            <div key={task.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{task.task}</h3>
                  <p className="text-sm text-muted-foreground">Asignado a: {task.assignee}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <Badge variant={getStatusColor(task.status) as any}>{task.status}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Vence: {task.dueDate}</span>
                <span>Última actualización: {task.lastUpdate}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Contactar
                </Button>
                {task.nextPing && (
                  <Button size="sm" variant="outline">
                    Ping programado: {task.nextPing}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Waiting For */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Waiting For
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {waitingFor.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">{item.item}</p>
                <p className="text-sm text-muted-foreground">Esperando de: {item.responsible}</p>
                <p className="text-xs text-muted-foreground">Desde: {item.since}</p>
              </div>
              <div className="text-right">
                <Button size="sm" variant="outline">{item.nextAction}</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
