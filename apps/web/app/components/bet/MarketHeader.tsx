"use client";

import React from "react";
import { Badge } from "../ui/Badge";
import { GlassPanel } from "../ui/GlassPanel";
import { Calendar, TrendingUp } from "lucide-react";

interface MarketHeaderProps {
  question: string;
  category: string;
  endDate: string;
  trending?: boolean;
}

export function MarketHeader({
  question,
  category,
  endDate,
  trending,
}: MarketHeaderProps) {
  return (
    <GlassPanel blur="normal" className="p-6">
      {/* Category and Meta Info */}
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="primary" size="sm" className="uppercase font-semibold">
          {category}
        </Badge>
        {trending && (
          <Badge
            variant="tertiary"
            size="sm"
            className="flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            <span>Trending</span>
          </Badge>
        )}
        <div className="flex items-center gap-1.5 text-xs text-on-variant ml-auto">
          <Calendar className="w-3.5 h-3.5" />
          <span>Ends {endDate}</span>
        </div>
      </div>

      {/* Market Question */}
      <h1 className="text-3xl md:text-4xl font-bold text-on-surface leading-tight">
        {question}
      </h1>
    </GlassPanel>
  );
}
