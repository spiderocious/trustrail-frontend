import type { ApplicationStatusType } from "../types";

export function getStatusMessage(status: ApplicationStatusType): string {
  const messages: Record<ApplicationStatusType, string> = {
    PENDING: "We're reviewing your application...",
    PENDING_ANALYSIS:
      "Your application is being analyzed. This typically takes 2-5 minutes.",
    ANALYZING:
      "Analyzing your bank statement... This may take up to 2 minutes.",
    AUTO_APPROVED: "Congratulations! Your application has been approved.",
    FLAGGED_FOR_REVIEW:
      "Your application is under manual review. We'll notify you within 24 hours.",
    AUTO_DECLINED:
      "Unfortunately, your application doesn't meet our requirements at this time.",
    APPROVED: "Congratulations! Your application has been approved.",
    DECLINED: "Your application has been declined.",
    MANDATE_CREATED:
      "Please make your down payment to activate your installment plan.",
    MANDATE_ACTIVE: "Down payment received! Your installment plan is active.",
    ACTIVE: "Your payments are in progress.",
    COMPLETED: "Congratulations! All payments completed.",
    DEFAULTED: "Your account is in default due to missed payments.",
  };

  return messages[status] || "Processing your application...";
}
