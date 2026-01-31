// Helper functions for TrustWallet calculations

export function calculateDownPaymentAmount(
  totalAmount: number,
  downPaymentPercentage: number,
): number {
  return Math.round((totalAmount * downPaymentPercentage) / 100);
}

export function calculateInstallmentAmount(
  totalAmount: number,
  downPaymentPercentage: number,
  installmentCount: number,
): number {
  const downPayment = calculateDownPaymentAmount(
    totalAmount,
    downPaymentPercentage,
  );
  const remainingAmount = totalAmount - downPayment;
  return Math.round(remainingAmount / installmentCount);
}

export function getFrequencyLabel(frequency: "weekly" | "monthly"): string {
  const labels = {
    weekly: "Weekly",
    monthly: "Monthly",
  };
  return labels[frequency];
}

export function getStatusColor(isActive: boolean): {
  bg: string;
  text: string;
} {
  return isActive
    ? { bg: "bg-green-100", text: "text-green-700" }
    : { bg: "bg-gray-100", text: "text-gray-700" };
}
