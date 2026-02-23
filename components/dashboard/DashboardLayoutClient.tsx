"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageHeaderProvider } from "@/contexts/PageHeaderContext";

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
    <PageHeaderProvider>
      <div 
        className="min-h-screen transition-colors duration-theme"
        style={{ 
          background: "var(--bg-gradient)",
          color: "var(--text-primary)"
        }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          negocioNombre={negocioNombre}
        />
        <div 
          className="min-h-screen transition-all duration-300 ease-in-out"
          style={{
            marginLeft: isSidebarOpen ? '288px' : '0px'
          }}
        >
          <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
          <div className="px-6 py-8">{children}</div>
        </div>
      </div>
    </PageHeaderProvider>
  );
}
