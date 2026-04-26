"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Button Component - Neon Noir Pulse Design System
 * 
 * Variants:
 * - primary: Gradient fill (purple), high contrast
 * - secondary: Ghost border, no fill, primary text
 * - yes: Green glow for YES/Long positions
 * - no: Red glow for NO/Short positions
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center font-grotesk font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "gradient-primary text-on-primary hover:shadow-glow-primary",
        secondary:
          "bg-transparent ghost-border text-primary hover:bg-primary hover:bg-opacity-10",
        yes: "bg-secondary text-on-secondary glow-secondary-hover",
        no: "bg-error text-on-error glow-error-hover",
      },
      size: {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
