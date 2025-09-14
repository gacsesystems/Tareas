import { Button } from "@/Components/ui/button";
import { Calendar, DollarSign, FolderOpen, Home, Inbox, PenTool, Target, Users, Clock, FileText, BookOpen, ExternalLink } from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: "today", label: "Hoy", icon: Home },
    { id: "weekly", label: "Plan Semanal", icon: Calendar },
    { id: "inbox", label: "Inbox", icon: Inbox },
    // 🔸 Bloque Proyectos (dos entradas)
    { id: "projects_dashboard", label: "Dashboard Proyectos", icon: FolderOpen, onClick: () => onViewChange("projects") },
    { id: "projects_crud", label: "Proyectos (CRUD)", icon: ExternalLink, onClick: () => router.visit(route("proyectos.index")) },

    { id: "habits", label: "Hábitos", icon: Target },
    { id: "events", label: "Eventos", icon: Calendar },
    { id: "timeblocks", label: "Time Blocks", icon: Clock },
    { id: "files", label: "Archivos", icon: FileText },
    { id: "resources", label: "Recursos", icon: BookOpen },
    { id: "finances", label: "Finanzas", icon: DollarSign },
    { id: "calendar", label: "Calendario", icon: Calendar },
    { id: "journal", label: "Diario", icon: PenTool },
    { id: "delegation", label: "Delegación", icon: Users },
    { id: "people", label: "Personas", icon: Users },
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-sidebar-foreground">Centro de Mando</h1>
        <p className="text-sm text-muted-foreground">Tu productividad personal</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // activa el estado para "Dashboard Proyectos" cuando activeView === 'projects'
          const isActive =
            (item.id === "projects_dashboard" && activeView === "projects") ||
            (item.id !== "projects_dashboard" && item.id === activeView);
          return (
            <Button key={item.id} variant={activeView === item.id ? "default" : "ghost"} className="w-full justify-start" onClick={item.onClick ? item.onClick : () => onViewChange(item.id)}>
              <Icon className="mr-3 h-4 w-4" /> {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
