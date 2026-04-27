"use client";

import React from "react";
import { cn } from "../../lib/utils";

/**
 * CategoryFilterBar - Horizontal chip-based filter
 *
 * Features:
 * - Single-select chip buttons for category filtering
 * - Horizontal scrollable on mobile
 * - Active state with primary color
 * - Smooth transitions
 */

export type CategoryId = "ALL" | "TECH" | "SPORTS" | "CRYPTO" | "CAMPUS";

interface CategoryFilterBarProps {
  selectedCategory?: CategoryId;
  onCategoryChange?: (category: CategoryId) => void;
  className?: string;
}

const categories = [
  { id: "ALL", label: "All Markets" },
  { id: "TECH", label: "Tech" },
  { id: "SPORTS", label: "Sports" },
  { id: "CRYPTO", label: "Crypto" },
  { id: "CAMPUS", label: "Campus" },
] as const;

export function CategoryFilterBar({
  selectedCategory = "ALL",
  onCategoryChange,
  className,
}: CategoryFilterBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide",
        className,
      )}
    >
      {categories.map((category) => {
        const isActive = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id)}
            className={cn(
              "px-4 py-2 rounded-lg font-manrope font-medium text-sm whitespace-nowrap transition-all duration-200",
              "border",
              isActive
                ? "bg-primary text-on-primary border-primary shadow-glow-primary"
                : "bg-surface-high text-on-variant border-surface-variant hover:border-primary hover:text-primary",
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
