"use client";

import React, { useState } from "react";
import { GlassPanel } from "../ui/GlassPanel";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";
import { formatWildCoins, isValidBetAmount, MIN_BET_AMOUNT } from "../../lib/currency";

/**
 * TradingModal - Individual market trading interface
 * 
 * Features:
 * - WildCoin currency system
 * - Betting in multiples of 50
 * - Market-specific API integration
 * - Discussion section
 */

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id?: number;
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
  const [amount, setAmount] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const price = selectedSide === "YES" ? market.yesPrice : market.noPrice;
  const numAmount = parseFloat(amount) || 0;
  const shares = numAmount > 0 ? Math.floor((numAmount * 100) / price) : 0;
  const cost = numAmount;

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const num = parseFloat(value) || 0;
    
    if (num > 0 && !isValidBetAmount(num)) {
      setValidationError(`Amount must be a multiple of ${MIN_BET_AMOUNT} WildCoins`);
    } else {
      setValidationError("");
    }
  };

  const handleSubmit = async () => {
    if (!isValidBetAmount(numAmount)) {
      setValidationError(`Amount must be a multiple of ${MIN_BET_AMOUNT} WildCoins`);
      return;
    }

    setIsSubmitting(true);
    try {
      const betId = market.id || 1;
      const response = await fetch(`/api/bet/${betId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side: selectedSide,
          amount: numAmount,
          shares: shares,
        }),
      });

      if (response.ok) {
        // Success - close modal
        onClose();
        // TODO: Show success toast
      } else {
        setValidationError('Failed to place bet. Please try again.');
      }
    } catch (error) {
      setValidationError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="mb-4">
            <label className="label-sm text-on-variant mb-2 block">BET AMOUNT (WildCoins)</label>
            <input
              type="number"
              placeholder="Enter amount (multiples of 50)"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              step={MIN_BET_AMOUNT}
              min={MIN_BET_AMOUNT}
              className={cn(
                "w-full px-4 py-3 rounded-lg bg-surface-high border text-on-surface placeholder:text-on-variant focus:outline-none focus:ring-2 focus:ring-primary font-manrope",
                validationError ? "border-error" : "border-surface-variant"
              )}
            />
            <p className="text-xs text-on-variant mt-1">Bet in multiples of {MIN_BET_AMOUNT} WildCoins</p>
            {validationError && (
              <p className="text-xs text-error mt-1">{validationError}</p>
            )}
          </div>

          {/* Cost Summary */}
          <div className="bg-surface-high p-4 rounded-lg mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="body-md text-on-variant">Price per share</p>
              <p className="body-md text-on-surface font-medium">{price}%</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="body-md text-on-variant">Shares</p>
              <p className="body-md text-on-surface font-medium">
                {shares}
              </p>
            </div>
            <div className="h-px bg-surface-low my-2" />
            <div className="flex items-center justify-between">
              <p className="title-sm text-on-surface">Total Cost</p>
              <p className="title-lg text-primary font-bold">
                {formatWildCoins(cost)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-4">
            <Button variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant={selectedSide === "YES" ? "yes" : "no"}
              fullWidth
              disabled={!amount || parseFloat(amount) <= 0 || !!validationError || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Placing Bet...' : `Buy ${selectedSide} Shares`}
            </Button>
          </div>

          {/* Potential Return Info */}
          <div className="mb-6 text-center">
            <p className="body-sm text-on-variant">
              Potential max return: {formatWildCoins(shares > 0 ? (shares - cost) : 0)}
            </p>
          </div>

          {/* Discussion Section */}
          <div className="border-t border-surface-variant pt-4">
            <h3 className="title-sm text-on-surface mb-3">Discussion</h3>
            <div className="bg-surface-low rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
              {/* Placeholder comments */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-sm">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-on-surface font-medium">Anonymous</p>
                  <p className="text-xs text-on-variant mt-1">I think YES has strong fundamentals. The market indicators are pointing upward.</p>
                  <p className="text-xs text-on-variant opacity-60 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary text-sm">B</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-on-surface font-medium">BetMaster</p>
                  <p className="text-xs text-on-variant mt-1">Not sure about this one. Historical data suggests otherwise.</p>
                  <p className="text-xs text-on-variant opacity-60 mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-tertiary bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <span className="text-tertiary text-sm">C</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-on-surface font-medium">Trader123</p>
                  <p className="text-xs text-on-variant mt-1">Great odds right now! 🚀</p>
                  <p className="text-xs text-on-variant opacity-60 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
            
            {/* Add Comment */}
            <div className="mt-3">
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full px-4 py-2 rounded-lg bg-surface-high border border-surface-variant text-on-surface placeholder:text-on-variant focus:outline-none focus:ring-1 focus:ring-primary font-manrope text-sm"
              />
            </div>
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
