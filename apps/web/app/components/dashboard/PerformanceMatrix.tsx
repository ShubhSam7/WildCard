"use client";

import React from "react";
import { TrendingUp, Award, BarChart3 } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * PerformanceMatrix - User performance stats card
 *
 * Features:
 * - Display Win Rate %, Current Rank, Total Volume
 * - Skeleton/placeholder loading state
 * - Glassmorphic card design
 * - Icon indicators for each metric
 */

interface PerformanceMatrixProps {
  loading?: boolean;
  className?: string;
}

export function PerformanceMatrix({
  loading = true,
  className,
}: PerformanceMatrixProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "p-4 bg-surface-high rounded-lg border border-surface-variant",
          className,
        )}
      >
        <h3 className="label-sm text-on-variant mb-4">PERFORMANCE</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-surface-variant rounded-lg" />
              <div className="flex-1">
                <div className="h-3 bg-surface-variant rounded w-20 mb-2" />
                <div className="h-4 bg-surface-variant rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 bg-surface-high rounded-lg border border-surface-variant",
        className,
      )}
    >
      <h3 className="label-sm text-on-variant mb-4">PERFORMANCE</h3>
      <div className="space-y-4">
        <MetricItem
          icon={TrendingUp}
          label="Win Rate"
          value="67%"
          iconColor="text-secondary"
        />
        <MetricItem
          icon={Award}
          label="Current Rank"
          value="#42"
          iconColor="text-tertiary"
        />
        <MetricItem
          icon={BarChart3}
          label="Total Volume"
          value="$12.4K"
          iconColor="text-primary"
        />
      </div>
    </div>
  );
}

function MetricItem({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center",
          iconColor,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-on-variant">{label}</p>
        <p className="text-lg font-bold text-on-surface font-manrope">
          {value}
        </p>
      </div>
    </div>
  );
}
