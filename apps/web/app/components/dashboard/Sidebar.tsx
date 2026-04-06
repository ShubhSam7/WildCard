"use client";

import React from "react";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar - Neon Noir Pulse Dashboard
 * 
 * Features:
 * - Fixed left sidebar
 * - Tonal layering (surface-low background)
 * - Active state with primary accent
 */

interface SidebarProps {
  className?: string;
}

const navItems = [
  { icon: "📊", label: "All Markets", href: "/dashboard" },
  { icon: "🔥", label: "Trending", href: "/dashboard/trending" },
  { icon: "⭐", label: "Favorites", href: "/dashboard/favorites" },
  { icon: "💼", label: "My Positions", href: "/dashboard/portfolio" },
  { icon: "🏆", label: "Leaderboard", href: "/dashboard/leaderboard" },
  { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-20 bottom-0 w-64 bg-surface-low px-4 py-6 hidden lg:block",
        className
      )}
    >
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "font-manrope font-medium text-sm",
                isActive
                  ? "bg-primary bg-opacity-10 text-primary outline outline-1 outline-primary outline-opacity-30"
                  : "text-on-variant hover:bg-surface-high hover:text-on-surface"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="mt-8 p-4 bg-surface-high rounded-lg">
        <h3 className="label-sm text-on-variant mb-3">QUICK STATS</h3>
        <div className="space-y-2">
          <StatRow label="Active Positions" value="8" />
          <StatRow label="24h Volume" value="$12.4K" />
          <StatRow label="Win Rate" value="67%" accent="secondary" />
        </div>
      </div>
    </aside>
  );
}

function StatRow({ 
  label, 
  value, 
  accent 
}: { 
  label: string; 
  value: string; 
  accent?: "secondary" | "error"; 
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="body-sm text-on-variant">{label}</span>
      <span 
        className={cn(
          "title-sm font-bold",
          accent === "secondary" && "text-secondary",
          accent === "error" && "text-error",
          !accent && "text-on-surface"
        )}
      >
        {value}
      </span>
    </div>
  );
}
