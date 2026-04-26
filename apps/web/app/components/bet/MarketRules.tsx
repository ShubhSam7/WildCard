"use client";

import React from "react";
import { GlassPanel } from "../ui/GlassPanel";
import { FileText, TrendingUp, Droplets } from "lucide-react";
import { formatWildCoins } from "../../lib/currency";

interface MarketRulesProps {
  resolutionCriteria: string;
  volume24h: string;
  liquidity: string;
}

export function MarketRules({
  resolutionCriteria,
  volume24h,
  liquidity,
}: MarketRulesProps) {
  return (
    <GlassPanel blur="normal" className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-on-surface">MARKET RULES</h2>
      </div>

      {/* Resolution Criteria */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-on-variant mb-2">
          Resolution Criteria:
        </h3>
        <p className="text-sm text-on-surface leading-relaxed">
          {resolutionCriteria}
        </p>
      </div>

      {/* Market Stats */}
      <div className="border-t border-surface-variant pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-on-variant mb-0.5">24h Volume</div>
              <div className="text-lg font-semibold text-on-surface">
                {volume24h}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Droplets className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-on-variant mb-0.5">Liquidity</div>
              <div className="text-lg font-semibold text-on-surface">
                {liquidity}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
