"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { TradingModal } from "./TradingModal";
import { cn } from "../../lib/utils";

/**
 * MarketCard - Individual prediction market card
 * 
 * Features:
 * - Asymmetric layout
 * - YES/NO buttons with glows
 * - Volume and liquidity badges
 * - Trending indicator
 */

interface MarketCardProps {
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
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  return (
    <>
      <Card hoverable className={cn("group", className)}>
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <Badge variant="tertiary" size="sm">
            {category}
          </Badge>
          {trending && (
            <Badge variant="tertiary" size="sm">
              🔥 TRENDING
            </Badge>
          )}
        </div>
        <CardTitle className="group-hover:text-primary transition-colors duration-200">
          {question}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Price Display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <PriceBox label="YES" price={yesPrice} variant="yes" />
          <PriceBox label="NO" price={noPrice} variant="no" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-on-variant">
          <StatItem label="VOLUME" value={volume24h} />
          <div className="h-4 w-px bg-surface-high" />
          <StatItem label="LIQUIDITY" value={liquidity} />
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex items-center gap-3 w-full">
          <Button 
            variant="yes" 
            size="sm" 
            fullWidth
            onClick={() => setIsTradeModalOpen(true)}
          >
            Trade YES
          </Button>
          <Button 
            variant="no" 
            size="sm" 
            fullWidth
            onClick={() => setIsTradeModalOpen(true)}
          >
            Trade NO
          </Button>
        </div>
        <span className="body-sm text-on-variant">
          Ends {endDate}
        </span>
      </CardFooter>
    </Card>

    <TradingModal
      isOpen={isTradeModalOpen}
      onClose={() => setIsTradeModalOpen(false)}
      market={{
        question,
        category,
        yesPrice,
        noPrice,
        volume24h,
        liquidity,
      }}
    />
    </>
  );
}

function PriceBox({ 
  label, 
  price, 
  variant 
}: { 
  label: string; 
  price: number; 
  variant: "yes" | "no"; 
}) {
  return (
    <div className={cn(
      "p-3 rounded-lg transition-all duration-200",
      variant === "yes" ? "bg-secondary bg-opacity-10" : "bg-error bg-opacity-10"
    )}>
      <p className="label-sm mb-1">
        {label}
      </p>
      <p className={cn(
        "title-lg font-bold",
        variant === "yes" ? "text-secondary" : "text-error"
      )}>
        {price}¢
      </p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-sm mb-1">{label}</p>
      <p className="body-md text-on-surface">{value}</p>
    </div>
  );
}
