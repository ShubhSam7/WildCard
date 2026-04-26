"use client";

import React, { useState } from "react";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a1520]">
      <AppHeader
        onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
      />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content shifts with sidebar */}
      <main
        className="pt-2 px-6 pb-12 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? "5rem" : "16rem" }}
      >
        <div className="max-w-[1400px] mx-auto pt-6">{children}</div>
      </main>
    </div>
  );
}
