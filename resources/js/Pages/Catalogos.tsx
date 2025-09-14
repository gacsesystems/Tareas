import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import { route } from "ziggy-js";

type Item = { id: number; nombre: string };

export default function Catalogos() {
  const { areas = [], contextos = [] } = usePage().props as {
    areas?: Item[];
    contextos?: Item[];
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Catálogos</h1>

      <Tabs defaultValue="areas" className="w-full">
        <TabsList>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
          <TabsTrigger value="contextos">Contextos</TabsTrigger>
        </TabsList>

        <TabsContent value="areas">
          <CrudList title="Áreas" items={areas} onCreate={(nombre) => router.post(route("areas.store"), { nombre })} onUpdate={(id, nombre) => router.put(route("areas.update", id), { nombre })} onDelete={(id) => router.delete(route("areas.destroy", id))} />
        </TabsContent>

        <TabsContent value="contextos">
          <CrudList title="Contextos" items={contextos} onCreate={(nombre) => router.post(route("contextos.store"), { nombre })} onUpdate={(id, nombre) => router.put(route("contextos.update", id), { nombre })} onDelete={(id) => router.delete(route("contextos.destroy", id))} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CrudList({ title, items, onCreate, onUpdate, onDelete, }: {
  title: string;
  items: Item[];
  onCreate: (nombre: string) => void;
  onUpdate: (id: number, nombre: string) => void;
  onDelete: (id: number) => void;
}) {
  const [nuevo, setNuevo] = useState("");
  const [editing, setEditing] = useState<{ id: number; nombre: string } | null>(null);

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder={`Nombre de ${title.slice(0, -1).toLowerCase()}`} value={nuevo} onChange={(e) => setNuevo(e.target.value)} />
          <Button onClick={() => { if (nuevo.trim()) { onCreate(nuevo.trim()); setNuevo(""); } }}>Agregar</Button>
        </div>

        <ul className="divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="py-2 flex gap-2 items-center">
              {editing?.id === it.id ? (
                <>
                  <Input value={editing.nombre} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
                  <Button variant="secondary" onClick={() => onUpdate(it.id, editing.nombre)}>Guardar</Button>
                  <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
                </>
              ) : (
                <>
                  <span className="flex-1">{it.nombre}</span>
                  <Button variant="ghost" onClick={() => setEditing({ id: it.id, nombre: it.nombre })}>Editar</Button>
                  <Button variant="destructive" onClick={() => onDelete(it.id)}>Eliminar</Button>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export { Catalogos };