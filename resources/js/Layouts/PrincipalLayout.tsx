import { useState } from "react";
import React from "react";
import { Sidebar } from "@/Pages/Sidebar";

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  const [activeView, setActiveView] = useState("today");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar fijo */}
      <aside className="w-64 border-r bg-white">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}