"use client";

import React, { useState } from "react";
import { X, Gift, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

/**
 * CallToAction - Promotional card
 * 
 * Features:
 * - Eye-catching gradient background
 * - CTA button with glow effect
 * - Dismissible functionality
 * - "Refer a friend" or promotional content
 */

interface CallToActionProps {
  className?: string;
}

export function CallToAction({ className }: CallToActionProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div 
      className={cn(
        "relative p-6 rounded-lg overflow-hidden border border-primary border-opacity-30",
        "bg-gradient-to-br from-primary/20 via-secondary/10 to-tertiary/10",
        className
      )}
    >
      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 hover:bg-surface-high rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-on-variant" />
      </button>

      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mb-4">
        <Gift className="w-6 h-6 text-primary" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-on-surface mb-2 font-grotesk">
        Refer & Earn
      </h3>
      <p className="text-sm text-on-variant mb-4">
        Share WildCard with friends and earn 100 coins for every signup!
      </p>

      {/* CTA Button */}
      <Button 
        variant="primary" 
        size="sm" 
        fullWidth
        className="shadow-glow-primary"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Get Referral Link
      </Button>
    </div>
  );
}
