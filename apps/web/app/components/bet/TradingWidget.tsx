"use client";

import React, { useState } from "react";
import { GlassPanel } from "../ui/GlassPanel";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Activity, TrendingUp, AlertCircle } from "lucide-react";
import { formatWildCoins, isValidBetAmount, MIN_BET_AMOUNT } from "../../lib/currency";

interface TradingWidgetProps {
  betId: number | string;
  yesPrice: number;
  noPrice: number;
}

export function TradingWidget({ betId, yesPrice, noPrice }: TradingWidgetProps) {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [selectedSide, setSelectedSide] = useState<"yes" | "no">("yes");
  const [amountType, setAmountType] = useState<"wildcoin" | "shares">("wildcoin");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = selectedSide === "yes" ? yesPrice : noPrice;
  const numAmount = parseFloat(amount) || 0;
  const shares = amountType === "wildcoin" ? Math.floor((numAmount * 100) / price) : numAmount;
  const cost = amountType === "shares" ? (numAmount * price) / 100 : numAmount;
  const potentialReturn = (shares * 100) / 100;
  const maxLoss = cost;
  const priceImpact = 0.5; // Mock value

  const hasPositiveAmount = amount && parseFloat(amount) > 0;
  const isAmountRuleValid =
    amountType === "shares" || isValidBetAmount(parseFloat(amount));
  const isValid = Boolean(hasPositiveAmount && isAmountRuleValid);

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/bet/${betId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          side: selectedSide,
          amount: parseFloat(amount),
          shares,
        }),
      });

      if (!response.ok) throw new Error("Failed to place bet");

      // Reset form on success
      setAmount("");
      alert("Bet placed successfully!");
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Failed to place bet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:sticky lg:top-24">
      <GlassPanel blur="normal" className="p-6">
        {/* BUY/SELL Tabs */}
        <div className="flex gap-2 mb-6 bg-surface rounded-lg p-1">
          <button
            onClick={() => setMode("buy")}
            className={`flex-1 py-2.5 rounded font-medium transition-all ${
              mode === "buy"
                ? "bg-success text-white"
                : "text-on-variant hover:text-on-surface"
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => setMode("sell")}
            className={`flex-1 py-2.5 rounded font-medium transition-all ${
              mode === "sell"
                ? "bg-error text-white"
                : "text-on-variant hover:text-on-surface"
            }`}
          >
            SELL
          </button>
        </div>

        {/* YES/NO Selection */}
        <div className="mb-6">
          <div className="text-xs text-on-variant mb-2">SELECT OUTCOME</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedSide("yes")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedSide === "yes"
                  ? "border-success bg-success/10"
                  : "border-surface-variant hover:border-success/50"
              }`}
            >
              <div className="text-xs text-on-variant mb-1">YES</div>
              <div className="text-2xl font-bold text-success">{yesPrice}¢</div>
            </button>
            <button
              onClick={() => setSelectedSide("no")}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedSide === "no"
                  ? "border-error bg-error/10"
                  : "border-surface-variant hover:border-error/50"
              }`}
            >
              <div className="text-xs text-on-variant mb-1">NO</div>
              <div className="text-2xl font-bold text-error">{noPrice}¢</div>
            </button>
          </div>
        </div>

        {/* Amount Input with Tokens/Shares Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-on-variant">AMOUNT</div>
            <div className="flex gap-1 bg-surface rounded p-0.5">
                <button
                  onClick={() => setAmountType("wildcoin")}
                  className={`px-2 py-1 rounded text-xs transition-all ${
                    amountType === "wildcoin"
                      ? "bg-primary text-on-primary"
                      : "text-on-variant hover:text-on-surface"
                  }`}
                >
                  WildCoin
                </button>
              <button
                onClick={() => setAmountType("shares")}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  amountType === "shares"
                    ? "bg-primary text-on-primary"
                    : "text-on-variant hover:text-on-surface"
                }`}
              >
                Shares
              </button>
            </div>
          </div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min: ${MIN_BET_AMOUNT} WC`}
            step={MIN_BET_AMOUNT}
            min={MIN_BET_AMOUNT}
            className="w-full"
          />
          {amount && !isAmountRuleValid && amountType === "wildcoin" && (
            <div className="flex items-center gap-1 mt-2 text-error text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Amount must be a multiple of {MIN_BET_AMOUNT} WC</span>
            </div>
          )}
        </div>

        {/* Breakdown */}
        <div className="mb-6 space-y-2 text-sm">
          <div className="flex justify-between text-on-variant">
            <span>Shares</span>
            <span className="text-on-surface font-medium">{shares}</span>
          </div>
          <div className="flex justify-between text-success">
            <span>Potential Return</span>
            <span className="font-medium">{formatWildCoins(potentialReturn)}</span>
          </div>
          <div className="flex justify-between text-error">
            <span>Max Loss</span>
            <span className="font-medium">{formatWildCoins(maxLoss)}</span>
          </div>
          <div className="flex justify-between text-on-variant">
            <span>Price Impact</span>
            <span className="text-on-surface font-medium">{priceImpact}%</span>
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          variant="primary"
          className="w-full py-3 text-base font-semibold"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "PLACING BET..." : `CONFIRM ${mode.toUpperCase()}`}
        </Button>

        {/* Activity Footer */}
        <div className="mt-4 pt-4 border-t border-surface-variant">
          <div className="flex items-center gap-2 text-xs text-on-variant">
            <Activity className="w-4 h-4 text-success" />
            <span>Activity rising in this market</span>
            <TrendingUp className="w-4 h-4 text-success ml-auto" />
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
