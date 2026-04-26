"use client";

import React, { useState, useEffect } from "react";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import { AnimatePresence, motion } from "framer-motion";

/**
 * DashboardLayout - 3-Column Application Layout
 *
 * Features:
 * - 3-column CSS Grid: Sidebar (collapsible) | Main Content | Right Panel (insights)
 * - Auto-hide header on scroll down
 * - Fully responsive with mobile hamburger menu
 * - Right panel as a toggleable slide-out drawer
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export function DashboardLayout({
  children,
  rightPanel,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close right panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && rightPanelOpen) {
        setRightPanelOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rightPanelOpen]);

  return (
    <div className="min-h-screen bg-void">
      {/* App Header */}
      <AppHeader
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onRightPanelToggle={
          rightPanel ? () => setRightPanelOpen(!rightPanelOpen) : undefined
        }
        rightPanelOpen={rightPanelOpen}
      />

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
            ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}
          `}
        >
          <div className="max-w-[1200px] mx-auto">{children}</div>
        </main>

        {/* Right Panel - Slide-out Drawer */}
        {rightPanel && mounted && (
          <>
            {/* Backdrop Overlay */}
            <AnimatePresence>
              {rightPanelOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                  onClick={() => setRightPanelOpen(false)}
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>

            {/* Drawer Panel */}
            <aside
              className={`
                fixed right-0 top-[72px] bottom-0 w-80 
                bg-surface-low border-l border-surface-variant 
                overflow-y-auto z-50
                transition-transform duration-300 ease-in-out
                ${rightPanelOpen ? "translate-x-0" : "translate-x-full"}
              `}
            >
              <div className="p-6">{rightPanel}</div>
            </aside>
          </>
        )}
      </div>

      {/* Mobile Overlay for left sidebar - only render on client to avoid hydration mismatch */}
      {mounted && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
