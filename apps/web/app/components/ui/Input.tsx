"use client";

import React from "react";
import { cn } from "../../lib/utils";

/**
 * Input Component - Neon Noir Pulse Design System
 * 
 * Features:
 * - Underline-only or etched style (no four-sided boxes)
 * - Focus: outline-variant → primary with 2px height increase
 * - Manrope font for interface consistency
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "underline" | "etched";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, variant = "etched", type, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block label-md text-on-variant mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            type={type}
            id={inputId}
            ref={ref}
            className={cn(
              "w-full font-manrope text-sm text-on-surface transition-all duration-200",
              "focus:outline-none",
              variant === "underline" && [
                "bg-transparent border-b-2 border-outline-variant",
                "focus:border-primary focus:border-b-[3px] pb-2",
              ],
              variant === "etched" && [
                "bg-surface-low px-4 py-3 rounded-lg",
                "outline outline-1 outline-outline-variant outline-opacity-15",
                "focus:outline-primary focus:outline-2",
              ],
              error && "outline-error",
              className
            )}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-2 body-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
