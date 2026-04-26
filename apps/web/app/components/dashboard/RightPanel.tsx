"use client";

import React from "react";
import { PerformanceMatrix } from "./PerformanceMatrix";
import { TrendingNow } from "./TrendingNow";
import { CallToAction } from "./CallToAction";
import { cn } from "../../lib/utils";

/**
 * RightPanel - Fixed insights panel
 *
 * Features:
 * - Contains performance metrics, trending markets, and CTA
 * - Fixed/sticky positioning
 * - Hidden on tablet/mobile (<1280px)
 */

interface RightPanelProps {
  className?: string;
}

export function RightPanel({ className }: RightPanelProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <PerformanceMatrix loading={true} />
      <TrendingNow loading={true} />
      <CallToAction />
    </div>
  );
}
