export function formatWildCoins(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M WC`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}k WC`;
  return `${amount.toFixed(0)} WC`;
}

export function formatVolume(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M WC`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}k WC`;
  return `${amount.toFixed(0)} WC`;
}
