"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  negocioNombre: string;
}

export function DashboardLayoutClient({
  children,
  negocioNombre,
}: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#16213e] to-[#0f1729] text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        negocioNombre={negocioNombre}
      />
      <div className="min-h-screen lg:pl-72">
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <div className="px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
