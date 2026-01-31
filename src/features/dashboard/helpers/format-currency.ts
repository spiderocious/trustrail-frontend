// Format Nigerian Naira currency

export function formatCurrency(amount: number): string {
  // Convert from kobo to Naira
  const nairaAmount = amount / 100;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(nairaAmount);
}

export function formatCurrencyCompact(amount: number): string {
  const nairaAmount = amount / 100;

  if (nairaAmount >= 1_000_000) {
    return `₦${(nairaAmount / 1_000_000).toFixed(1)}M`;
  }

  if (nairaAmount >= 1_000) {
    return `₦${(nairaAmount / 1_000).toFixed(1)}K`;
  }

  return `₦${nairaAmount.toFixed(0)}`;
}
