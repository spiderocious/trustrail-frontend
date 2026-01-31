import { ApplicationDetails } from "../api/use-application-details";

export function contactCustomer(app: ApplicationDetails) {
  const customerName = `${app.customerDetails.firstName} ${app.customerDetails.lastName}`;
  const email = app.customerDetails.email;
  const applicationId = app.applicationId;
  const status = app.status;

  // Create email subject and body
  const subject = encodeURIComponent(
    `Regarding Your TrustRail Application - ${applicationId}`,
  );

  const body = encodeURIComponent(
    `Dear ${customerName},

Thank you for your application with TrustRail (Application ID: ${applicationId}).

Current Status: ${status}

We wanted to reach out to you regarding your application.

[Please add your message here]

If you have any questions or concerns, please don't hesitate to reach out to us.

Best regards,
TrustRail Team`,
  );

  // Open default email client
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}
