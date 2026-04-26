"use client";

import React, { useState } from "react";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

/**
 * DashboardLayout - 3-Column Application Layout
 * 
 * Features:
 * - 3-column CSS Grid: Sidebar (collapsible) | Main Content | Right Panel (insights)
 * - Auto-hide header on scroll down
 * - Fully responsive with mobile hamburger menu
 * - Fixed right panel for performance metrics
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export function DashboardLayout({ children, rightPanel }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-void">
      {/* App Header */}
      <AppHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      {/* Main Layout Grid */}
      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        
        {/* Main Content Area */}
        <main 
          className={`
            flex-1 transition-all duration-300 ease-in-out
            px-4 md:px-6 lg:px-8 py-6 md:py-8
            ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
            ${rightPanel ? 'xl:mr-80' : ''}
          `}
        >
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>

        {/* Right Panel - Insights */}
        {rightPanel && (
          <aside className="hidden xl:block fixed right-0 top-[72px] bottom-0 w-80 border-l border-surface-variant bg-surface-low overflow-y-auto">
            <div className="p-6">
              {rightPanel}
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
