"use client";

import React from "react";
import { Flame, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import Link from "next/link";

/**
 * TrendingNow - Hot markets list
 * 
 * Features:
 * - List of 3-5 trending market topics
 * - Each item: icon, truncated question, percentage
 * - Skeleton loading state
 * - Hover states for preview
 * - Links to market page
 */

interface TrendingNowProps {
  loading?: boolean;
  className?: string;
}

const mockTrendingMarkets = [
  { id: 1, question: "Will Bitcoin hit $100k before 2026?", percentage: 67, trend: "up" },
  { id: 2, question: "Will OpenAI release GPT-5 in Q2?", percentage: 42, trend: "down" },
  { id: 3, question: "Will Tesla stock reach $500?", percentage: 38, trend: "up" },
  { id: 4, question: "Will SpaceX land humans on Mars?", percentage: 22, trend: "up" },
];

export function TrendingNow({ loading = true, className }: TrendingNowProps) {
  if (loading) {
    return (
      <div className={cn("p-4 bg-surface-high rounded-lg border border-surface-variant", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-error" />
          <h3 className="label-sm text-on-variant">TRENDING NOW</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-surface-variant rounded w-full mb-2" />
              <div className="h-3 bg-surface-variant rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-surface-high rounded-lg border border-surface-variant", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-error" />
        <h3 className="label-sm text-on-variant">TRENDING NOW</h3>
      </div>
      <div className="space-y-2">
        {mockTrendingMarkets.map((market) => (
          <Link
            key={market.id}
            href={`/dashboard/market/${market.id}`}
            className="block p-3 rounded-lg hover:bg-surface-low transition-colors group"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2 flex-1">
                {market.question}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={cn(
                  "text-sm font-bold",
                  market.percentage > 50 ? "text-secondary" : "text-error"
                )}>
                  {market.percentage}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
