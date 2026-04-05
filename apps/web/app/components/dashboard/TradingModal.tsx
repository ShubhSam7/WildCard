"use client";

import React, { useState } from "react";
import { GlassPanel } from "../ui/GlassPanel";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";

/**
 * TradingModal - Individual market trading interface
 * 
 * Features:
 * - GlassPanel for modal overlay
 * - Order book with tonal layers
 * - Quick trade interface
 * - Position indicators
 */

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    question: string;
    category: string;
    yesPrice: number;
    noPrice: number;
    volume24h: string;
    liquidity: string;
  };
}

export function TradingModal({ isOpen, onClose, market }: TradingModalProps) {
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO">("YES");
  const [shares, setShares] = useState("");

  if (!isOpen) return null;

  const price = selectedSide === "YES" ? market.yesPrice : market.noPrice;
  const cost = shares ? (parseInt(shares) * price) / 100 : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-void bg-opacity-80 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <GlassPanel
          blur="strong"
          className="w-full max-w-2xl pointer-events-auto p-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <Badge variant="tertiary" size="sm" className="mb-3">
                {market.category}
              </Badge>
              <h2 className="title-lg text-on-surface mb-2">
                {market.question}
              </h2>
              <div className="flex items-center gap-4 text-on-variant">
                <span className="label-sm">VOL: {market.volume24h}</span>
                <span className="label-sm">LIQ: {market.liquidity}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-on-variant hover:text-on-surface transition-colors p-2"
            >
              ✕
            </button>
          </div>

          {/* Price Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setSelectedSide("YES")}
              className={cn(
                "p-4 rounded-lg transition-all duration-200",
                selectedSide === "YES"
                  ? "bg-secondary bg-opacity-20 outline outline-2 outline-secondary"
                  : "bg-secondary bg-opacity-5 hover:bg-opacity-10"
              )}
            >
              <p className="label-sm text-on-variant mb-1">YES</p>
              <p className="display-sm text-secondary font-bold">
                {market.yesPrice}¢
              </p>
            </button>
            <button
              onClick={() => setSelectedSide("NO")}
              className={cn(
                "p-4 rounded-lg transition-all duration-200",
                selectedSide === "NO"
                  ? "bg-error bg-opacity-20 outline outline-2 outline-error"
                  : "bg-error bg-opacity-5 hover:bg-opacity-10"
              )}
            >
              <p className="label-sm text-on-variant mb-1">NO</p>
              <p className="display-sm text-error font-bold">
                {market.noPrice}¢
              </p>
            </button>
          </div>

          {/* Trade Input */}
          <div className="mb-6">
            <Input
              label="NUMBER OF SHARES"
              type="number"
              placeholder="0"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              variant="etched"
            />
          </div>

          {/* Cost Summary */}
          <div className="bg-surface-high p-4 rounded-lg mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="body-md text-on-variant">Price per share</p>
              <p className="body-md text-on-surface font-medium">{price}¢</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="body-md text-on-variant">Shares</p>
              <p className="body-md text-on-surface font-medium">
                {shares || "0"}
              </p>
            </div>
            <div className="h-px bg-surface-low my-2" />
            <div className="flex items-center justify-between">
              <p className="title-sm text-on-surface">Total Cost</p>
              <p className="title-lg text-primary font-bold">
                ${cost.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button
              variant={selectedSide === "YES" ? "yes" : "no"}
              fullWidth
              disabled={!shares || parseInt(shares) <= 0}
            >
              Buy {selectedSide} Shares
            </Button>
          </div>

          {/* Potential Return Info */}
          <div className="mt-4 text-center">
            <p className="body-sm text-on-variant">
              Potential max return: ${shares ? (parseInt(shares) - cost).toFixed(2) : "0.00"}
            </p>
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
