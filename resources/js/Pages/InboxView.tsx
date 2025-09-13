import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Textarea } from "@/Components/ui/textarea";
import TareasForm from "./TareasForm";
import { Inbox, Plus, FileText, DollarSign, Link as LinkIcon, ImageIcon, Mic, Code, CheckCircle2, X, ArrowRight, } from "lucide-react";

export function InboxView() {
  const [items, setItems] = useState([
    { id: 1, type: "task", content: "Revisar contrato con cliente nuevo", processed: false, createdAt: "Hace 2 horas" },
    { id: 2, type: "idea", content: "Implementar sistema de notificaciones push", processed: false, createdAt: "Hace 4 horas" },
    { id: 3, type: "expense", content: "Compra de software - $299", processed: false, createdAt: "Ayer" },
    { id: 4, type: "link", content: "https://ejemplo.com/articulo-productividad", processed: true, createdAt: "Ayer" },
    { id: 5, type: "note", content: "Reunión con equipo: discutir nuevas funcionalidades", processed: false, createdAt: "Hace 1 día" },
  ]);

  const [newItem, setNewItem] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // modal de creación directa de tarea desde inbox
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [seedTask, setSeedTask] = useState<any>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task": return <CheckCircle2 className="h-4 w-4" />;
      case "idea": return <FileText className="h-4 w-4" />;
      case "expense": return <DollarSign className="h-4 w-4" />;
      case "link": return <LinkIcon className="h-4 w-4" />;
      case "note": return <FileText className="h-4 w-4" />;
      case "image": return <ImageIcon className="h-4 w-4" />;
      case "audio": return <Mic className="h-4 w-4" />;
      case "code": return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task": return "default";
      case "idea": return "secondary";
      case "expense": return "destructive";
      case "link": return "outline";
      default: return "secondary";
    }
  };

  const processItem = (id: number) => { setItems(items.map((i) => (i.id === id ? { ...i, processed: true } : i))); };

  const deleteItem = (id: number) => { setItems(items.filter((i) => i.id !== id)); };

  const convertToTask = (item: any) => {
    setSeedTask({
      titulo: item.content ?? "",
      estado: "hoy",
      tipo: "tarea",
      pomos_estimados: 1,
    });
    setShowTaskForm(true);
  };

  const handleTaskCreated = () => {
    if (seedTask) {
      // marca como procesado el item usado
      const found = items.find((i) => i.content === seedTask.titulo);
      if (found) processItem(found.id);
    }
    setShowTaskForm(false);
    setSeedTask(null);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const newId = (items.length ? Math.max(...items.map((i) => i.id)) : 0) + 1;
    setItems([
      { id: newId, type: "task", content: newItem, processed: false, createdAt: "Ahora" },
      ...items,
    ]);
    setNewItem("");
    setShowAddForm(false);
  };

  const unprocessedItems = items.filter((i) => !i.processed);
  const processedItems = items.filter((i) => i.processed);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Inbox</h1>
          <p className="text-muted-foreground">Captura rápida y procesamiento de elementos</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Capturar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sin procesar</span>
            </div>
            <p className="text-2xl font-bold text-chart-4">{unprocessedItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-chart-3" />
              <span className="text-sm text-muted-foreground">Procesados</span>
            </div>
            <p className="text-2xl font-bold text-chart-3">{processedItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de captura rápida */}
      {showAddForm && (
        <Card>
          <CardHeader><CardTitle>Captura Rápida</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Escribe aquí tu tarea, idea, nota o cualquier cosa que quieras capturar..." value={newItem} onChange={(e) => setNewItem(e.target.value)} className="min-h-[100px]" />
            <div className="flex gap-2">
              <Button onClick={addItem}>Capturar</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal -> Crear tarea (con tu TareasForm e Inertia) */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <TareasForm initial={seedTask ?? undefined} submitRoute="tareas.store" method="post" onClose={handleTaskCreated} />
        </div>
      )}

      {/* Items sin procesar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Sin Procesar ({unprocessedItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {unprocessedItems.length === 0 ? (<p className="text-muted-foreground text-center py-8">¡Excelente! No tienes elementos sin procesar.</p>
          ) : (
            unprocessedItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mt-1">{getTypeIcon(item.type)}</div>
                <div className="flex-1">
                  <p className="text-sm">{item.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getTypeColor(item.type) as any} className="text-xs">{item.type}</Badge>
                    <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {item.type === "task" && (
                    <Button size="sm" variant="outline" onClick={() => convertToTask(item)}>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => processItem(item.id)}>
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteItem(item.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Items procesados */}
      {processedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-chart-3" />
              Procesados Recientemente ({processedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {processedItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 opacity-60">
                <div className="flex items-center gap-2">{getTypeIcon(item.type)}</div>
                <div className="flex-1">
                  <p className="text-sm line-through">{item.content}</p>
                </div>
                <Badge variant="outline" className="text-xs">Procesado</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}