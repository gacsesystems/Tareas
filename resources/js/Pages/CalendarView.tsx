import { Card, CardContent, CardHeader, CardTitle, } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export function CalendarView() {
  const currentMonth = "Septiembre 2025";

  // Simulando días del mes con eventos
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const events = {
    3: [{ type: "cobro", title: "Cobro Cliente ABC", amount: "$15,000" }],
    5: [{ type: "cumpleanos", title: "Cumpleaños Ana", amount: null }],
    6: [{ type: "cobro", title: "Cobro Startup XYZ", amount: "$25,000" }],
    10: [{ type: "evento", title: "Reunión equipo", amount: null }],
    15: [{ type: "pago", title: "Pago proveedor", amount: "$8,000" }],
    20: [{ type: "cumpleanos", title: "Cumpleaños Carlos", amount: null }],
    25: [{ type: "evento", title: "Conferencia tech", amount: null }],
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "cobro": return "bg-chart-3/10 text-chart-3 border-chart-3/20";
      case "pago": return "bg-chart-5/10 text-chart-5 border-chart-5/20";
      case "cumpleanos": return "bg-chart-1/10 text-chart-1 border-chart-1/20";
      case "evento": return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Calendario</h1>
          <p className="text-muted-foreground">Vista de eventos, cobros y cumpleaños</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {/* Navegación del calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentMonth}
            </CardTitle>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (<div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">{day}</div>))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {/* Espacios vacíos para el inicio del mes (asumiendo que empieza en domingo) */}
            {Array.from({ length: 0 }, (_, i) => (<div key={`empty-${i}`} className="p-2"></div>))}

            {daysInMonth.map((day) => {
              const dayEvents = events[day as keyof typeof events] || [];
              const isToday = day === 3; // Simulando que hoy es el 3

              return (
                <div key={day} className={`min-h-[80px] p-2 border rounded-lg ${isToday ? "border-accent bg-accent/5" : "border-border"}`}>
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-accent" : ""}`}>{day}</div>
                  <div className="space-y-1">
                    {dayEvents.map((event, index) => (
                      <div key={index} className={`text-xs p-1 rounded border ${getEventColor(event.type)}`}>
                        <div className="font-medium truncate">{event.title}</div>
                        {event.amount && (<div className="text-xs">{event.amount}</div>)}
                      </div>))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Próximos eventos */}
      <Card>
        <CardHeader><CardTitle>Próximos Eventos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-chart-3/10 rounded-lg">
            <div>
              <p className="font-medium">Cobro Cliente ABC</p>
              <p className="text-sm text-muted-foreground">Hoy - 3 de Septiembre</p>
            </div>
            <Badge className="bg-chart-3 text-white">$15,000</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-chart-1/10 rounded-lg">
            <div>
              <p className="font-medium">Cumpleaños Ana</p>
              <p className="text-sm text-muted-foreground">5 de Septiembre</p>
            </div>
            <Badge variant="secondary">Cumpleaños</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-chart-3/10 rounded-lg">
            <div>
              <p className="font-medium">Cobro Startup XYZ</p>
              <p className="text-sm text-muted-foreground">6 de Septiembre</p>
            </div>
            <Badge className="bg-chart-3 text-white">$25,000</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
