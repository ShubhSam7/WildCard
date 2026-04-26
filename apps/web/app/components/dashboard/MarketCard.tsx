"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/Card";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

/**
 * MarketCard - Compact clickable prediction market card
 *
 * Features:
 * - Compact layout for grid display
 * - Entire card clickable, routes to /bet/[id]
 * - Prominent YES/NO percentage distribution progress bar
 * - Optimized typography and spacing
 */

interface MarketCardProps {
  id?: number;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume24h: string;
  liquidity: string;
  trending?: boolean;
  endDate: string;
  className?: string;
}

export function MarketCard({
  id = 1, // Default ID if not provided
  question,
  category,
  yesPrice,
  noPrice,
  volume24h,
  liquidity,
  trending,
  endDate,
  className,
}: MarketCardProps) {
  return (
    <Link href={`/bet/${id}`} className="block group">
      <Card
        hoverable
        className={cn(
          "h-full min-h-[220px] flex flex-col transition-all duration-200",
          "hover:ring-2 hover:ring-primary/50 hover:-translate-y-1",
          className,
        )}
      >
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <Badge variant="tertiary" size="sm" className="text-xs py-0.5 px-2">
              {category}
            </Badge>
            {trending && (
              <Badge
                variant="tertiary"
                size="sm"
                className="flex items-center gap-1 text-xs py-0.5 px-2"
              >
                <TrendingUp className="w-2.5 h-2.5" />
                HOT
              </Badge>
            )}
          </div>
          <CardTitle className="group-hover:text-primary transition-colors duration-200 text-sm leading-tight line-clamp-2">
            {question}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-2 px-3 flex-grow">
          {/* Prominent YES/NO Distribution Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-secondary">
                YES {yesPrice}%
              </span>
              <span className="text-xs font-medium text-error">
                NO {noPrice}%
              </span>
            </div>
            <div className="h-1.5 bg-surface-high rounded-full overflow-hidden flex">
              <div
                className="bg-secondary transition-all duration-300"
                style={{ width: `${yesPrice}%` }}
              />
              <div
                className="bg-error transition-all duration-300"
                style={{ width: `${noPrice}%` }}
              />
            </div>
          </div>

          {/* Compact Stats */}
          <div className="flex items-center gap-2 text-on-variant text-xs">
            <div className="flex items-center gap-1">
              <span className="text-on-variant">Vol:</span>
              <span className="text-on-surface font-medium">{volume24h}</span>
            </div>
            <div className="h-2.5 w-px bg-surface-variant" />
            <div className="flex items-center gap-1">
              <span className="text-on-variant">Liq:</span>
              <span className="text-on-surface font-medium">{liquidity}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-3 px-3 border-t border-surface-variant mt-auto">
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs text-on-variant">{endDate}</span>
            <span className="text-xs text-primary font-medium group-hover:underline">
              View Details →
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
