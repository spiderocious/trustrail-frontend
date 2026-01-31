import { ApplicationDetails } from "../api/use-application-details";
import { formatCurrency } from "@features/dashboard/helpers/format-currency";
import { formatDate, formatDateTime } from "@features/dashboard/helpers/format-date";

export function downloadApplicationReport(app: ApplicationDetails) {
  const analysis = app.trustEngineOutput?.statementAnalysis;
  const trustScore = app.trustEngineOutput?.trustScore || 0;
  const decision = app.trustEngineOutput?.decision || "N/A";
  const customerName = `${app.customerDetails.firstName} ${app.customerDetails.lastName}`;

  // Build CSV content
  const csvRows: string[] = [];

  // Header
  csvRows.push("TrustRail Application Report");
  csvRows.push(`Generated: ${formatDateTime(new Date().toISOString())}`);
  csvRows.push("");

  // Application Information
  csvRows.push("APPLICATION INFORMATION");
  csvRows.push(`Application ID,${app.applicationId}`);
  csvRows.push(`Customer Name,${customerName}`);
  csvRows.push(`Email,${app.customerDetails.email}`);
  csvRows.push(`Phone,${app.customerDetails.phoneNumber}`);
  csvRows.push(`Account Number,${app.customerDetails.accountNumber}`);
  csvRows.push(`Bank Code,${app.customerDetails.bankCode}`);
  csvRows.push(`Status,${app.status}`);
  csvRows.push(`Decision,${decision}`);
  csvRows.push(`Trust Score,${trustScore}`);
  csvRows.push(`Submitted At,${formatDateTime(app.submittedAt)}`);
  if (app.analyzedAt) {
    csvRows.push(`Analyzed At,${formatDateTime(app.analyzedAt)}`);
  }
  csvRows.push("");

  // Loan Details
  csvRows.push("LOAN DETAILS");
  csvRows.push(`Total Amount,${formatCurrency(app.totalAmount)}`);
  csvRows.push(`Down Payment Required,${formatCurrency(app.downPaymentRequired)}`);
  csvRows.push(`Installment Amount,${formatCurrency(app.installmentAmount)}`);
  csvRows.push(`Installment Count,${app.installmentCount}`);
  csvRows.push(`Frequency,${app.frequency}`);
  csvRows.push(`Outstanding Balance,${formatCurrency(app.outstandingBalance)}`);
  csvRows.push(`Total Paid,${formatCurrency(app.totalPaid)}`);
  csvRows.push(`Payments Completed,${app.paymentsCompleted}`);
  csvRows.push("");

  // Financial Analysis
  if (analysis) {
    csvRows.push("FINANCIAL ANALYSIS");
    csvRows.push(
      `Period Analyzed,${analysis.periodCovered?.monthsAnalyzed || 0} month(s)`,
    );
    csvRows.push(
      `Period Start,${formatDate(analysis.periodCovered?.startDate || "")}`,
    );
    csvRows.push(
      `Period End,${formatDate(analysis.periodCovered?.endDate || "")}`,
    );
    csvRows.push("");

    // Income Analysis
    csvRows.push("INCOME ANALYSIS");
    csvRows.push(
      `Total Income,${formatCurrency(analysis.incomeAnalysis?.totalIncome || 0)}`,
    );
    csvRows.push(
      `Average Monthly Income,${formatCurrency(analysis.incomeAnalysis?.avgMonthlyIncome || 0)}`,
    );
    csvRows.push(
      `Income Consistency,${((analysis.incomeAnalysis?.incomeConsistency || 0) * 100).toFixed(1)}%`,
    );

    if (
      analysis.incomeAnalysis?.incomeSources &&
      analysis.incomeAnalysis.incomeSources.length > 0
    ) {
      csvRows.push("");
      csvRows.push("Income Sources");
      csvRows.push("Description,Frequency,Average Amount");
      analysis.incomeAnalysis.incomeSources.forEach((source) => {
        csvRows.push(
          `"${source.description}",${source.frequency},${formatCurrency(source.avgAmount)}`,
        );
      });
    }
    csvRows.push("");

    // Spending Analysis
    csvRows.push("SPENDING ANALYSIS");
    csvRows.push(
      `Total Spending,${formatCurrency(analysis.spendingAnalysis?.totalSpending || 0)}`,
    );
    csvRows.push(
      `Average Monthly Spending,${formatCurrency(analysis.spendingAnalysis?.avgMonthlySpending || 0)}`,
    );

    if (analysis.spendingAnalysis?.spendingCategories) {
      csvRows.push("");
      csvRows.push("Spending Categories");
      csvRows.push("Category,Amount,Percentage");
      Object.entries(analysis.spendingAnalysis.spendingCategories).forEach(
        ([category, amount]) => {
          const percentage = (
            (amount / (analysis.spendingAnalysis?.totalSpending || 1)) *
            100
          ).toFixed(1);
          csvRows.push(
            `${category},${formatCurrency(amount)},${percentage}%`,
          );
        },
      );
    }
    csvRows.push("");

    // Balance Analysis
    csvRows.push("BALANCE ANALYSIS");
    csvRows.push(
      `Average Balance,${formatCurrency(analysis.balanceAnalysis?.avgBalance || 0)}`,
    );
    csvRows.push(
      `Minimum Balance,${formatCurrency(analysis.balanceAnalysis?.minBalance || 0)}`,
    );
    csvRows.push(
      `Maximum Balance,${formatCurrency(analysis.balanceAnalysis?.maxBalance || 0)}`,
    );
    csvRows.push(
      `Closing Balance,${formatCurrency(analysis.balanceAnalysis?.closingBalance || 0)}`,
    );
    csvRows.push("");

    // Behavior Analysis
    csvRows.push("TRANSACTION BEHAVIOR");
    csvRows.push(
      `Total Transactions,${analysis.behaviorAnalysis?.transactionCount || 0}`,
    );
    csvRows.push(
      `Average Daily Transactions,${(analysis.behaviorAnalysis?.avgDailyTransactions || 0).toFixed(1)}`,
    );
    csvRows.push(`Bounce Count,${analysis.behaviorAnalysis?.bounceCount || 0}`);
    csvRows.push(
      `Overdraft Usage,${analysis.behaviorAnalysis?.overdraftUsage ? "Yes" : "No"}`,
    );
    csvRows.push("");

    // Debt Profile
    csvRows.push("DEBT PROFILE");
    csvRows.push(
      `Existing Loan Repayments,${formatCurrency(analysis.debtProfile?.existingLoanRepayments || 0)}`,
    );
    csvRows.push(
      `Debt-to-Income Ratio,${((analysis.debtProfile?.debtToIncomeRatio || 0) * 100).toFixed(1)}%`,
    );
    csvRows.push("");

    // Affordability Assessment
    csvRows.push("AFFORDABILITY ASSESSMENT");
    csvRows.push(
      `Can Afford Installment,${analysis.affordabilityAssessment?.canAffordInstallment ? "Yes" : "No"}`,
    );
    csvRows.push(
      `Monthly Installment Amount,${formatCurrency(analysis.affordabilityAssessment?.monthlyInstallmentAmount || 0)}`,
    );
    csvRows.push(
      `Disposable Income,${formatCurrency(analysis.affordabilityAssessment?.disposableIncome || 0)}`,
    );
    csvRows.push(
      `Affordability Ratio,${(analysis.affordabilityAssessment?.affordabilityRatio || 0).toFixed(2)}`,
    );
    csvRows.push(
      `Cushion,${formatCurrency(analysis.affordabilityAssessment?.cushion || 0)}`,
    );
    csvRows.push("");

    // Risk Flags
    if (analysis.riskFlags && analysis.riskFlags.length > 0) {
      csvRows.push("RISK FLAGS");
      csvRows.push("Flag,Severity,Description");
      analysis.riskFlags.forEach((flag) => {
        csvRows.push(`"${flag.flag}",${flag.severity},"${flag.description}"`);
      });
      csvRows.push("");
    }

    // Rule Compliance
    csvRows.push("RULE COMPLIANCE");
    csvRows.push(
      `Passed Min Trust Score,${analysis.ruleCompliance?.passedMinTrustScore ? "Yes" : "No"}`,
    );
    csvRows.push(
      `Overall Pass,${analysis.ruleCompliance?.overallPass ? "Yes" : "No"}`,
    );
  }

  // Create CSV content
  const csvContent = csvRows.join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `TrustRail_Application_${app.applicationId}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
