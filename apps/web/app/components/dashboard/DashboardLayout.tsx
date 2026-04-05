"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

/**
 * DashboardLayout - Neon Noir Pulse
 * 
 * Features:
 * - Asymmetric 7-5 grid (main content vs sidebar)
 * - Fixed navbar + sidebar
 * - Proper spacing from edges
 */

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="lg:ml-64 pt-24 px-6 pb-12">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
