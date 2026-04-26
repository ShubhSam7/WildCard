"use client";

import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Trophy, Briefcase, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { formatWildCoins } from "../../lib/currency";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
}

const navItems = [
  { id: "home", icon: Home, label: "Home", href: "/dashboard" },
  { id: "markets", icon: TrendingUp, label: "Markets", href: "/dashboard" },
  { id: "leaderboard", icon: Trophy, label: "Leaderboard", href: "/dashboard/leaderboard" },
  { id: "portfolio", icon: Briefcase, label: "Portfolio", href: "/dashboard/portfolio" },
  { id: "profile", icon: User, label: "Profile", href: "/dashboard/profile" },
];

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const { getToken } = useAuth();
  const [wildCoins, setWildCoins] = useState<number | null>(null);
  const [activePositions, setActivePositions] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchStats = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BACKEND}/user/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWildCoins(data.wildCoins);
          setActivePositions(data.activePositions);
        }
      } catch {
        // silently fail
      }
    };
    fetchStats();
  }, [getToken]);

  const sidebarContent = (
    <>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group",
                "font-manrope font-medium text-sm",
                isActive
                  ? "bg-primary bg-opacity-10 text-primary outline outline-1 outline-primary outline-opacity-30"
                  : "text-on-variant hover:bg-surface-high hover:text-on-surface"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
              {!collapsed && (
                <span className="whitespace-nowrap overflow-hidden transition-all duration-200">
                  {item.label}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-surface-high rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-surface-variant">
                  <span className="text-sm text-on-surface">{item.label}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="overflow-hidden">
          <div className="p-4 bg-surface-high rounded-lg">
            <h3 className="label-sm text-on-variant mb-3">QUICK STATS</h3>
            <div className="space-y-2">
              <StatRow
                label="Active Positions"
                value={activePositions !== null ? String(activePositions) : "—"}
              />
              <StatRow
                label="Balance"
                value={wildCoins !== null ? formatWildCoins(wildCoins) : "—"}
                accent="secondary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex items-center justify-center w-full py-3 hover:bg-surface-high rounded-lg transition-colors mt-4"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5 text-on-variant" />
        ) : (
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-on-variant" />
            <span className="text-sm text-on-variant font-manrope">Collapse</span>
          </div>
        )}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-[72px] bottom-0 bg-surface-low flex-col p-4 transition-all duration-300 ease-in-out z-40 border-r border-surface-variant",
          collapsed ? "w-20" : "w-64",
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <aside className="lg:hidden fixed left-0 top-[72px] bottom-0 w-64 bg-surface-low flex flex-col p-4 z-40 border-r border-surface-variant">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Overlay */}
      {mounted && mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}
    </>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: "secondary" | "error" }) {
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
