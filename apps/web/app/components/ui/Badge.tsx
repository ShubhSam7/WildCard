"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Badge Component - Neon Noir Pulse Design System
 * 
 * Features:
 * - Pill-shaped (full radius)
 * - Label-md uppercase style
 * - Light backgrounds (20% opacity)
 */

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-grotesk font-semibold uppercase tracking-wide transition-all duration-200",
  {
    variants: {
      variant: {
        primary: "bg-primary bg-opacity-20 text-primary",
        secondary: "bg-secondary bg-opacity-20 text-secondary",
        tertiary: "bg-tertiary bg-opacity-20 text-tertiary",
        error: "bg-error bg-opacity-20 text-error",
        outline: "ghost-border text-on-variant",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.625rem] leading-tight", // label-sm
        md: "px-3 py-1 text-[0.75rem]", // label-md
        lg: "px-4 py-1.5 text-[0.875rem]", // label-lg
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
