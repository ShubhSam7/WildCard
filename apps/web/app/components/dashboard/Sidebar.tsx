"use client";

import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Trophy,
  Briefcase,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { formatWildCoins } from "../../lib/currency";

/**
 * Sidebar - Collapsible Navigation
 *
 * Features:
 * - Collapsible (256px expanded → 80px icon-only)
 * - Mobile slide-out drawer
 * - Smooth transitions with Framer Motion
 * - Icon-based navigation with Lucide React
 */

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
  {
    id: "leaderboard",
    icon: Trophy,
    label: "Leaderboard",
    href: "/dashboard/leaderboard",
  },
  {
    id: "portfolio",
    icon: Briefcase,
    label: "Portfolio",
    href: "/dashboard/portfolio",
  },
  { id: "profile", icon: User, label: "Profile", href: "/dashboard/profile" },
];

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${BACKEND}/user/stats`, {
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as {
          wildCoins: number;
          activePositions: number;
        };
        setWildCoins(data.wildCoins);
        setActivePositions(data.activePositions);
      } catch (error) {
        console.error("Failed to fetch sidebar stats:", error);
      }
    };

    fetchStats();
  }, [getToken]);

  const sidebarContent = (
    <>
      {/* Navigation Items */}
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
                  : "text-on-variant hover:bg-surface-high hover:text-on-surface",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-primary",
                )}
              />

              {/* Text Label - Hidden when collapsed on desktop */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-surface-high rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-surface-variant">
                  <span className="text-sm text-on-surface">{item.label}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats - Only show when expanded */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-surface-high rounded-lg">
              <h3 className="label-sm text-on-variant mb-3">QUICK STATS</h3>
              <div className="space-y-2">
                <StatRow
                  label="Active Positions"
                  value={
                    activePositions !== null ? String(activePositions) : "—"
                  }
                />
                <StatRow
                  label="Balance"
                  value={wildCoins !== null ? formatWildCoins(wildCoins) : "—"}
                  accent="secondary"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle Button - Desktop only */}
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
            <span className="text-sm text-on-variant font-manrope">
              Collapse
            </span>
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
          className,
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-[72px] bottom-0 w-64 bg-surface-low flex flex-col p-4 z-40 border-r border-surface-variant"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function StatRow({
  label,
  value,
  accent,
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
          !accent && "text-on-surface",
        )}
      >
        {value}
      </span>
    </div>
  );
}
