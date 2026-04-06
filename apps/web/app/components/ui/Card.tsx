"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Card Component - Neon Noir Pulse Design System
 * 
 * Features:
 * - Tonal layering (no borders)
 * - Asymmetric padding (24px top/left, 32px bottom/right)
 * - Surface hierarchy variants
 */

const cardVariants = cva(
  "rounded-lg transition-power-up",
  {
    variants: {
      surface: {
        low: "bg-surface-low",
        high: "bg-surface-high",
        bright: "bg-surface-bright",
      },
      padding: {
        none: "",
        symmetric: "p-6",
        asymmetric: "pt-6 pl-6 pb-8 pr-8", // The editorial asymmetry
      },
      hoverable: {
        true: "cursor-pointer hover:outline hover:outline-1 hover:outline-primary hover:outline-opacity-30",
      },
    },
    defaultVariants: {
      surface: "high",
      padding: "asymmetric",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, surface, padding, hoverable, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ surface, padding, hoverable, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Sub-components for structure
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("title-lg text-on-surface", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("body-md", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-6 flex items-center justify-between", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
