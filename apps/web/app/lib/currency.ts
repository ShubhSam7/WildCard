/**
 * Currency utilities for WildCoin system
 */

export const WILDCOINS_PER_DOLLAR = 1; // 1:1 ratio for now
export const MIN_BET_AMOUNT = 50; // Minimum bet in WildCoins

/**
 * Format number as WildCoins
 * @param amount - Amount in WildCoins
 * @param showSymbol - Whether to show WC symbol (default: true)
 */
export function formatWildCoins(amount: number, showSymbol: boolean = true): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return showSymbol ? `${formatted} WC` : formatted;
}

/**
 * Validate if amount is a multiple of 50
 * @param amount - Amount to validate
 */
export function isValidBetAmount(amount: number): boolean {
  return amount > 0 && amount % MIN_BET_AMOUNT === 0;
}

/**
 * Get the nearest valid bet amount (multiple of 50)
 * @param amount - Input amount
 */
export function getNearestValidBetAmount(amount: number): number {
  return Math.round(amount / MIN_BET_AMOUNT) * MIN_BET_AMOUNT;
}

/**
 * Parse WildCoin string to number
 * @param value - String value like "1,250 WC" or "1250"
 */
export function parseWildCoins(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}
