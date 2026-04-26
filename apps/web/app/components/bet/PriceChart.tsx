"use client";

import React, { useState } from "react";
import { GlassPanel } from "../ui/GlassPanel";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceChartProps {
  currentProbability: number;
}

export function PriceChart({ currentProbability }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState("1D");
  const timeframes = ["1H", "1D", "1W", "1M", "ALL"];

  const isPositiveTrend = currentProbability >= 50;

  return (
    <GlassPanel blur="normal" className="p-6">
      {/* Header with Probability and Timeframe */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-on-variant mb-1">
            CURRENT PROBABILITY
          </div>
          <div
            className={`text-5xl font-bold flex items-center gap-2 ${
              isPositiveTrend ? "text-success" : "text-error"
            }`}
          >
            {currentProbability}%
            {isPositiveTrend ? (
              <TrendingUp className="w-8 h-8" />
            ) : (
              <TrendingDown className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Timeframe Toggle */}
        <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                timeframe === tf
                  ? "bg-primary text-on-primary"
                  : "text-on-variant hover:text-on-surface hover:bg-surface-high"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Placeholder with Gradient */}
      <div className="relative h-64 bg-surface-low rounded-lg overflow-hidden">
        {/* Gradient background */}
        <div
          className={`absolute inset-0 opacity-20 ${
            isPositiveTrend
              ? "bg-gradient-to-t from-success/40 to-transparent"
              : "bg-gradient-to-t from-error/40 to-transparent"
          }`}
        />

        {/* Simulated line chart using SVG */}
        <svg
          className="w-full h-full"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="chartGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={isPositiveTrend ? "#10b981" : "#ef4444"}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={isPositiveTrend ? "#10b981" : "#ef4444"}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Area under the line */}
          <path
            d="M 0 160 L 50 140 L 100 145 L 150 120 L 200 110 L 250 105 L 300 90 L 350 85 L 400 80 L 400 200 L 0 200 Z"
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <path
            d="M 0 160 L 50 140 L 100 145 L 150 120 L 200 110 L 250 105 L 300 90 L 350 85 L 400 80"
            fill="none"
            stroke={isPositiveTrend ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing dot at end */}
          <circle
            cx="400"
            cy="80"
            r="4"
            fill={isPositiveTrend ? "#10b981" : "#ef4444"}
          >
            <animate
              attributeName="r"
              values="4;6;4"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        {/* Chart labels placeholder */}
        <div className="absolute bottom-2 left-4 text-xs text-on-variant">
          {timeframe} Price History
        </div>
      </div>
    </GlassPanel>
  );
}
