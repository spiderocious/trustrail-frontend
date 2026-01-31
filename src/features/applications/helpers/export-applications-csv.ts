import { formatDateTime } from "@features/dashboard/helpers/format-date";
import { ApplicationListItem } from "../api/use-applications-list";

export function exportApplicationsToCSV(
  applications: ApplicationListItem[],
  filename?: string,
) {
  if (!applications || applications.length === 0) {
    alert("No applications to export");
    return;
  }

  // Define CSV headers
  const headers = [
    "Application ID",
    "Customer Name",
    "Email",
    "Phone",
    "Status",
    "Decision",
    "Trust Score",
    "Total Amount",
    "Down Payment",
    "Installment Amount",
    "Installment Count",
    "Frequency",
    "TrustWallet",
    "Submitted At",
    "Monthly Income",
    "Monthly Spending",
    "Average Balance",
    "Disposable Income",
    "Can Afford",
    "Debt to Income Ratio",
  ];

  // Build CSV rows
  const csvRows: string[] = [];
  csvRows.push(headers.join(","));

  applications.forEach((app) => {
    const customerName = `${app.customerDetails.firstName} ${app.customerDetails.lastName}`;
    const analysis = app.trustEngineOutput?.statementAnalysis;

    const row = [
      app.applicationId,
      `"${customerName}"`,
      app.customerDetails.email,
      app.customerDetails.phoneNumber,
      app.status,
      app.trustEngineOutput?.decision || "N/A",
      app.trustEngineOutput?.trustScore || "N/A",
      app.totalAmount,
      app.downPaymentRequired,
      app.installmentAmount,
      app.installmentCount,
      app.frequency,
      `"${app.trustWalletName || "N/A"}"`,
      formatDateTime(app.submittedAt),
      analysis?.incomeAnalysis?.avgMonthlyIncome || "N/A",
      analysis?.spendingAnalysis?.avgMonthlySpending || "N/A",
      analysis?.balanceAnalysis?.avgBalance || "N/A",
      analysis?.affordabilityAssessment?.disposableIncome || "N/A",
      analysis?.affordabilityAssessment?.canAffordInstallment !== undefined
        ? analysis.affordabilityAssessment.canAffordInstallment
          ? "Yes"
          : "No"
        : "N/A",
      analysis?.debtProfile?.debtToIncomeRatio !== undefined
        ? ((analysis.debtProfile.debtToIncomeRatio || 0) * 100).toFixed(1) + "%"
        : "N/A",
    ];

    csvRows.push(row.join(","));
  });

  // Create CSV content
  const csvContent = csvRows.join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename ||
      `TrustRail_Applications_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
