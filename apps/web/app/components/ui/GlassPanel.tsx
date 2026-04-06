"use client";

import React from "react";
import { cn } from "../../lib/utils";

/**
 * GlassPanel Component - Neon Noir Pulse Design System
 * 
 * Features:
 * - surface-variant at 60% opacity + 20px backdrop blur
 * - Ambient shadow (0px 24px 48px rgba(0,0,0,0.5))
 * - For modals, trade confirmations, floating panels
 */

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: "light" | "normal" | "strong";
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, blur = "normal", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg shadow-ambient",
          blur === "light" && "glass opacity-40",
          blur === "normal" && "glass",
          blur === "strong" && "glass-strong",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
