# TrustRail Frontend API Integration Guide

**Version:** 1.0.0
**Last Updated:** January 30, 2026
**API Base URL:** `http://localhost:3030`

---

## Table of Contents

1. [Overview](#overview)
2. [API Fundamentals](#api-fundamentals)
3. [Authentication & Authorization](#authentication--authorization)
4. [Business Owner Dashboard APIs](#business-owner-dashboard-apis)
5. [Customer-Facing Public APIs](#customer-facing-public-apis)
6. [Admin Dashboard APIs](#admin-dashboard-apis)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)
9. [Best Practices](#best-practices)
10. [Testing](#testing)

---

## Overview

TrustRail is a Buy Now, Pay Later (BNPL) platform that enables businesses to offer installment payment plans to their customers. The API has three main user types:

1. **Business Owners** - Create installment plans (TrustWallets), manage applications, track payments
2. **Customers** - Apply for installment plans, check application status (no login required)
3. **Admins** - Monitor system health, view audit logs, access all data

---

## API Fundamentals

### Base URL

```
Production: TBD
Staging: TBD
Development: http://localhost:3030
```

### Standard Response Format

All API responses follow this consistent structure:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response payload varies by endpoint
  },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": [  // Only present for validation errors
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

### Content Types

- **JSON Requests:** `Content-Type: application/json`
- **File Uploads:** `Content-Type: multipart/form-data`

---

## Authentication & Authorization

### Business Owner Authentication

#### 1. Register New Business

**Endpoint:** `POST /api/auth/register`
**Auth Required:** No

**Request Body:**
```json
{
  "businessName": "Lagos State University",
  "email": "admin@lasu.edu.ng",
  "password": "SecurePassword123!",
  "phoneNumber": "2348012345678",
  "rcNumber": "RC123456",
  "settlementAccountNumber": "0123456789",
  "settlementBankCode": "058",
  "settlementAccountName": "LASU Payment Account"
}
```

**Validation Rules:**
- `businessName`: 2-200 characters
- `email`: Valid email format
- `password`: Minimum 8 characters
- `phoneNumber`: Nigerian format (234XXXXXXXXXX)
- `rcNumber`: 2-50 characters
- `settlementAccountNumber`: Exactly 10 digits
- `settlementBankCode`: Exactly 3 digits
- `settlementAccountName`: 2-200 characters

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "businessId": "BIZ-1738259123456",
    "billerCode": "BC-1738259123456",
    "business": {
      "businessId": "BIZ-1738259123456",
      "businessName": "Lagos State University",
      "email": "admin@lasu.edu.ng",
      "phoneNumber": "2348012345678",
      "billerCode": "BC-1738259123456",
      "isActive": true
    }
  },
  "message": "Business registered successfully"
}
```

**Implementation Notes:**
- Registration also creates a PWA (Pay with Account) merchant account
- Store the `token` securely (localStorage, secure cookie, or state management)
- Token is valid for 30 days
- Use `businessId` to identify the business in your UI

#### 2. Login

**Endpoint:** `POST /api/auth/login`
**Auth Required:** No

**Request Body:**
```json
{
  "email": "admin@lasu.edu.ng",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "businessId": "BIZ-1738259123456",
    "business": {
      "businessId": "BIZ-1738259123456",
      "businessName": "Lagos State University",
      "email": "admin@lasu.edu.ng",
      "billerCode": "BC-1738259123456"
    }
  },
  "message": "Login successful"
}
```

#### 3. Logout

**Endpoint:** `POST /api/auth/logout`
**Auth Required:** Yes (Bearer token)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully. Please delete your token."
}
```

**Implementation Notes:**
- Backend is stateless (no token blacklist for MVP)
- Delete token from client-side storage
- Redirect user to login page

### Using Authentication Tokens

For all protected endpoints, include the token in the `Authorization` header:

```javascript
fetch('http://localhost:3030/api/trustwallets', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## Business Owner Dashboard APIs

### TrustWallet Management

A **TrustWallet** is an installment plan configuration that customers can apply to.

#### 1. Create TrustWallet

**Endpoint:** `POST /api/trustwallets`
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "Computer Science Department Fees",
  "description": "Installment payment plan for CS students",
  "installmentPlan": {
    "totalAmount": 100000,
    "downPaymentPercentage": 20,
    "installmentCount": 4,
    "frequency": "monthly",
    "interestRate": 0
  },
  "approvalWorkflow": {
    "autoApproveThreshold": 85,
    "autoDeclineThreshold": 40,
    "minTrustScore": 50
  }
}
```

**Field Explanations:**
- `totalAmount`: Total amount to be paid (in Naira, as kobo: 100000 = ₦1,000.00)
- `downPaymentPercentage`: Percentage paid upfront (0-100)
- `installmentCount`: Number of installments (minimum 1)
- `frequency`: "weekly" or "monthly"
- `interestRate`: Interest percentage (0-100, use 0 for interest-free)
- `autoApproveThreshold`: Trust score >= this = auto-approved (0-100)
- `autoDeclineThreshold`: Trust score <= this = auto-declined (0-100)
- `minTrustScore`: Minimum score to be considered (0-100)

**Validation:**
- `autoApproveThreshold` must be > `autoDeclineThreshold`
- `minTrustScore` must be <= `autoApproveThreshold`

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "trustWalletId": "TW-1738259234567",
    "businessId": "BIZ-1738259123456",
    "name": "Computer Science Department Fees",
    "description": "Installment payment plan for CS students",
    "isActive": true,
    "installmentPlan": {
      "totalAmount": 100000,
      "downPaymentPercentage": 20,
      "downPaymentAmount": 20000,
      "installmentCount": 4,
      "installmentAmount": 20000,
      "frequency": "monthly",
      "interestRate": 0
    },
    "approvalWorkflow": {
      "autoApproveThreshold": 85,
      "autoDeclineThreshold": 40,
      "minTrustScore": 50
    },
    "statistics": {
      "totalApplications": 0,
      "approvedApplications": 0,
      "totalRevenue": 0,
      "availableBalance": 0
    },
    "createdAt": "2026-01-30T12:00:00.000Z",
    "updatedAt": "2026-01-30T12:00:00.000Z"
  },
  "message": "TrustWallet created successfully"
}
```

**UI Display Tips:**
- Show calculated `downPaymentAmount` and `installmentAmount`
- Display public application URL: `{frontendUrl}/apply/{trustWalletId}`
- Show QR code for easy sharing

#### 2. List TrustWallets

**Endpoint:** `GET /api/trustwallets`
**Auth Required:** Yes

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `isActive` (optional): Filter by active status (true/false)

**Example:** `GET /api/trustwallets?page=1&limit=20&isActive=true`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trustWallets": [
      {
        "trustWalletId": "TW-1738259234567",
        "name": "Computer Science Department Fees",
        "isActive": true,
        "installmentPlan": { /* ... */ },
        "statistics": {
          "totalApplications": 15,
          "approvedApplications": 12,
          "totalRevenue": 500000,
          "availableBalance": 500000
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  },
  "message": "TrustWallets retrieved successfully"
}
```

#### 3. Get Single TrustWallet

**Endpoint:** `GET /api/trustwallets/{trustWalletId}`
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trustWalletId": "TW-1738259234567",
    "businessId": "BIZ-1738259123456",
    "name": "Computer Science Department Fees",
    "description": "Installment payment plan for CS students",
    "isActive": true,
    "installmentPlan": { /* full details */ },
    "approvalWorkflow": { /* full details */ },
    "statistics": { /* full stats */ },
    "createdAt": "2026-01-30T12:00:00.000Z",
    "updatedAt": "2026-01-30T12:00:00.000Z"
  },
  "message": "TrustWallet retrieved successfully"
}
```

#### 4. Update TrustWallet

**Endpoint:** `PUT /api/trustwallets/{trustWalletId}`
**Auth Required:** Yes

**Request Body (all fields optional):**
```json
{
  "name": "Updated Department Fees",
  "installmentPlan": {
    "totalAmount": 120000,
    "downPaymentPercentage": 25
  },
  "approvalWorkflow": {
    "autoApproveThreshold": 90
  }
}
```

**Notes:**
- Only provided fields are updated
- Cannot update if there are active applications (returns 400 error)

#### 5. Delete TrustWallet (Soft Delete)

**Endpoint:** `DELETE /api/trustwallets/{trustWalletId}`
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "TrustWallet deleted successfully"
}
```

**Notes:**
- Soft delete (sets `isActive: false`)
- Cannot delete if active applications exist

---

### Application Management

An **Application** is a customer's request to use a TrustWallet installment plan.

#### Application Status Flow

```
PENDING → ANALYZING → [AUTO_APPROVED | FLAGGED_FOR_REVIEW | AUTO_DECLINED]
                              ↓                    ↓
                      MANDATE_CREATED  → [APPROVED | DECLINED]
                              ↓
                      MANDATE_ACTIVE
                              ↓
                      ACTIVE (payments in progress)
                              ↓
                      [COMPLETED | DEFAULTED]
```

#### 1. List Applications

**Endpoint:** `GET /api/applications`
**Auth Required:** Yes

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `trustWalletId` (optional): Filter by TrustWallet
- `status` (optional): Filter by status
- `search` (optional): Search by customer name/email

**Example:** `GET /api/applications?page=1&limit=20&status=FLAGGED_FOR_REVIEW`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": "APP-1738259345678",
        "trustWalletId": "TW-1738259234567",
        "trustWalletName": "Computer Science Department Fees",
        "status": "FLAGGED_FOR_REVIEW",
        "customerDetails": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phoneNumber": "2348087654321"
        },
        "trustEngineOutput": {
          "trustScore": 65,
          "decision": "FLAGGED_FOR_REVIEW",
          "riskLevel": "MEDIUM"
        },
        "totalAmount": 100000,
        "downPaymentAmount": 20000,
        "installmentAmount": 20000,
        "installmentCount": 4,
        "createdAt": "2026-01-30T13:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  },
  "message": "Applications retrieved successfully"
}
```

**UI Tips:**
- Use color coding for statuses (green=COMPLETED, yellow=FLAGGED_FOR_REVIEW, red=DEFAULTED)
- Show trust score with visual indicator (progress bar, badge)
- Filter by status to create action queues (e.g., "Needs Review")

#### 2. Get Single Application

**Endpoint:** `GET /api/applications/{applicationId}`
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "applicationId": "APP-1738259345678",
    "trustWalletId": "TW-1738259234567",
    "businessId": "BIZ-1738259123456",
    "status": "ACTIVE",
    "customerDetails": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "2348087654321",
      "accountNumber": "0123456789",
      "bankCode": "058",
      "bvn": "12345678901"
      // Note: Sensitive data is encrypted at rest
    },
    "trustEngineOutput": {
      "trustScore": 85,
      "decision": "AUTO_APPROVED",
      "riskLevel": "LOW",
      "analysisDate": "2026-01-30T13:05:00.000Z",
      "factors": {
        "accountAge": "GOOD",
        "transactionVolume": "HIGH",
        "averageBalance": "ADEQUATE",
        "financialStability": "STABLE"
      }
    },
    "installmentPlan": {
      "totalAmount": 100000,
      "downPaymentAmount": 20000,
      "installmentAmount": 20000,
      "installmentCount": 4,
      "frequency": "monthly"
    },
    "paymentStatus": {
      "totalPaid": 40000,
      "outstandingBalance": 60000,
      "paymentsCompleted": 2,
      "totalPayments": 4,
      "nextPaymentDate": "2026-03-30T00:00:00.000Z"
    },
    "pwaMandateRef": "REF-1738259456789",
    "virtualAccountNumber": "9012345678",
    "createdAt": "2026-01-30T13:00:00.000Z",
    "updatedAt": "2026-01-30T14:00:00.000Z"
  },
  "message": "Application retrieved successfully"
}
```

#### 3. Manually Approve Application

**Endpoint:** `POST /api/applications/{applicationId}/approve`
**Auth Required:** Yes

**Use Case:** Approve applications with status `FLAGGED_FOR_REVIEW`

**Request Body:**
```json
{
  "reason": "Customer has good history with our institution"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "applicationId": "APP-1738259345678",
    "status": "MANDATE_CREATED",
    "pwaMandateRef": "REF-1738259456789",
    "message": "Application approved. PWA mandate created successfully."
  },
  "message": "Application approved successfully"
}
```

**Implementation Notes:**
- After approval, status becomes `MANDATE_CREATED`
- Customer must activate mandate before payments begin
- Webhook notification sent to configured business webhook URL

#### 4. Manually Decline Application

**Endpoint:** `POST /api/applications/{applicationId}/decline`
**Auth Required:** Yes

**Request Body:**
```json
{
  "reason": "Insufficient transaction history"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "applicationId": "APP-1738259345678",
    "status": "DECLINED",
    "declineReason": "Insufficient transaction history"
  },
  "message": "Application declined successfully"
}
```

---

### Payment Management

Payments are automatically created and processed via PWA (Pay with Account) webhooks.

#### 1. List Payments

**Endpoint:** `GET /api/payments`
**Auth Required:** Yes

**Query Parameters:**
- `page`, `limit`: Pagination
- `trustWalletId`: Filter by TrustWallet
- `applicationId`: Filter by application
- `status`: Filter by status (SCHEDULED, PENDING, SUCCESSFUL, FAILED)
- `startDate`, `endDate`: Date range (ISO 8601 format)

**Example:** `GET /api/payments?applicationId=APP-1738259345678&status=SUCCESSFUL`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "transactionId": "INST-PAY-1738259567890",
        "applicationId": "APP-1738259345678",
        "amount": 20000,
        "status": "SUCCESSFUL",
        "paymentNumber": 1,
        "totalPayments": 4,
        "scheduledDate": "2026-02-01T00:00:00.000Z",
        "completedDate": "2026-02-01T10:30:00.000Z",
        "pwaTransactionRef": "PWA-TXN-123456",
        "customerName": "John Doe"
      }
    ],
    "pagination": { /* ... */ }
  },
  "message": "Payments retrieved successfully"
}
```

#### 2. Get Single Payment

**Endpoint:** `GET /api/payments/{transactionId}`
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "INST-PAY-1738259567890",
    "applicationId": "APP-1738259345678",
    "trustWalletId": "TW-1738259234567",
    "businessId": "BIZ-1738259123456",
    "amount": 20000,
    "status": "SUCCESSFUL",
    "paymentNumber": 1,
    "totalPayments": 4,
    "scheduledDate": "2026-02-01T00:00:00.000Z",
    "completedDate": "2026-02-01T10:30:00.000Z",
    "pwaTransactionRef": "PWA-TXN-123456",
    "pwaPaymentId": "PWA-PAY-123456",
    "application": {
      "applicationId": "APP-1738259345678",
      "customerDetails": { /* ... */ }
    },
    "createdAt": "2026-02-01T00:00:00.000Z",
    "updatedAt": "2026-02-01T10:30:00.000Z"
  },
  "message": "Payment retrieved successfully"
}
```

**Payment Status Meanings:**
- `SCHEDULED`: Payment scheduled but not yet attempted
- `PENDING`: Debit in progress
- `SUCCESSFUL`: Payment completed successfully
- `FAILED`: Debit failed (insufficient funds, account issues)

---

### Withdrawal Management

Withdraw collected funds from TrustWallet to settlement account.

#### 1. Request Withdrawal

**Endpoint:** `POST /api/withdrawals`
**Auth Required:** Yes

**Request Body:**
```json
{
  "trustWalletId": "TW-1738259234567",
  "amount": 50000
}
```

**Validation:**
- Amount must not exceed available balance in TrustWallet
- Amount must be > 0

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "withdrawalId": "WTH-1738259678901",
    "trustWalletId": "TW-1738259234567",
    "businessId": "BIZ-1738259123456",
    "amount": 50000,
    "status": "PENDING",
    "requestedAt": "2026-01-30T15:00:00.000Z",
    "settlementAccount": {
      "accountNumber": "0123456789",
      "bankCode": "058",
      "accountName": "LASU Payment Account"
    }
  },
  "message": "Withdrawal requested successfully"
}
```

**Withdrawal Statuses:**
- `PENDING`: Request submitted, awaiting processing
- `PROCESSING`: Being processed by payment provider
- `COMPLETED`: Funds transferred successfully
- `FAILED`: Transfer failed

#### 2. List Withdrawals

**Endpoint:** `GET /api/withdrawals`
**Auth Required:** Yes

**Query Parameters:**
- `page`, `limit`: Pagination
- `trustWalletId`: Filter by TrustWallet
- `status`: Filter by status

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "withdrawals": [
      {
        "withdrawalId": "WTH-1738259678901",
        "trustWalletId": "TW-1738259234567",
        "trustWalletName": "Computer Science Department Fees",
        "amount": 50000,
        "status": "COMPLETED",
        "requestedAt": "2026-01-30T15:00:00.000Z",
        "completedAt": "2026-01-30T15:30:00.000Z"
      }
    ],
    "pagination": { /* ... */ }
  },
  "message": "Withdrawals retrieved successfully"
}
```

---

### Dashboard & Analytics

#### 1. Get Dashboard Overview

**Endpoint:** `GET /api/dashboard/overview`
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTrustWallets": 5,
      "activeTrustWallets": 4,
      "totalApplications": 45,
      "pendingApplications": 3,
      "activeApplications": 15,
      "completedApplications": 20,
      "totalRevenue": 5000000,
      "availableBalance": 3500000,
      "totalWithdrawals": 1500000
    },
    "recentApplications": [
      {
        "applicationId": "APP-1738259345678",
        "customerName": "John Doe",
        "trustWalletName": "CS Fees",
        "status": "FLAGGED_FOR_REVIEW",
        "trustScore": 65,
        "amount": 100000,
        "createdAt": "2026-01-30T13:00:00.000Z"
      }
    ],
    "recentPayments": [
      {
        "transactionId": "INST-PAY-1738259567890",
        "customerName": "Jane Smith",
        "amount": 20000,
        "status": "SUCCESSFUL",
        "completedDate": "2026-01-30T14:00:00.000Z"
      }
    ],
    "trustWalletPerformance": [
      {
        "trustWalletId": "TW-1738259234567",
        "name": "CS Fees",
        "applications": 15,
        "revenue": 1500000,
        "approvalRate": 80
      }
    ]
  },
  "message": "Dashboard overview retrieved successfully"
}
```

**UI Tips:**
- Display summary cards at the top
- Show recent activity feed
- Use charts for TrustWallet performance comparison

#### 2. Generate Reports

**Endpoint:** `GET /api/dashboard/reports`
**Auth Required:** Yes

**Query Parameters:**
- `type` (required): "applications" or "payments"
- `format` (required): "json" or "csv"
- `trustWalletId` (optional): Filter by TrustWallet
- `startDate`, `endDate` (optional): Date range

**Example:** `GET /api/dashboard/reports?type=applications&format=csv&startDate=2026-01-01&endDate=2026-01-31`

**Success Response (200) - JSON:**
```json
{
  "success": true,
  "data": {
    "report": [
      {
        "applicationId": "APP-1738259345678",
        "customerName": "John Doe",
        "customerEmail": "john.doe@example.com",
        "trustWalletName": "CS Fees",
        "status": "COMPLETED",
        "trustScore": 85,
        "totalAmount": 100000,
        "totalPaid": 100000,
        "createdAt": "2026-01-15T10:00:00.000Z",
        "completedAt": "2026-01-30T10:00:00.000Z"
      }
    ],
    "summary": {
      "totalRecords": 1,
      "totalAmount": 100000,
      "averageTrustScore": 85
    }
  },
  "message": "Report generated successfully"
}
```

**Success Response (200) - CSV:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="applications-report-2026-01-30.csv"

Application ID,Customer Name,Email,TrustWallet,Status,Trust Score,Total Amount,Created At
APP-1738259345678,John Doe,john.doe@example.com,CS Fees,COMPLETED,85,100000,2026-01-15T10:00:00.000Z
```

#### 3. Get TrustWallet Analytics

**Endpoint:** `GET /api/dashboard/trustwallet/{trustWalletId}/analytics`
**Auth Required:** Yes

**Query Parameters:**
- `startDate`, `endDate` (optional): Date range

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trustWalletId": "TW-1738259234567",
    "name": "Computer Science Department Fees",
    "dateRange": {
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-31T23:59:59.999Z"
    },
    "summary": {
      "totalApplications": 15,
      "approvedApplications": 12,
      "declinedApplications": 2,
      "pendingApplications": 1,
      "approvalRate": 80,
      "totalRevenue": 1200000,
      "averageTrustScore": 78
    },
    "trustScoreDistribution": {
      "0-20": 0,
      "21-40": 2,
      "41-60": 3,
      "61-80": 5,
      "81-100": 5
    },
    "paymentPerformance": {
      "totalPayments": 48,
      "successfulPayments": 45,
      "failedPayments": 3,
      "successRate": 93.75
    },
    "revenueByMonth": [
      { "month": "2026-01", "revenue": 1200000 }
    ]
  },
  "message": "Analytics retrieved successfully"
}
```

---

### Webhook Configuration

Configure where to receive payment notifications.

**Endpoint:** `POST /api/webhooks/configure`
**Auth Required:** Yes

**Request Body:**
```json
{
  "webhookUrl": "https://your-business.com/webhooks/trustrail"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "webhookUrl": "https://your-business.com/webhooks/trustrail",
    "webhookSecret": "whs_1234567890abcdef",
    "isActive": true
  },
  "message": "Webhook configured successfully"
}
```

**Implementation Notes:**
- Store `webhookSecret` securely on your backend
- Use it to verify webhook signatures
- Webhook events: `application.approved`, `application.declined`, `payment.successful`, `payment.failed`, `application.completed`, `application.defaulted`

---

## Customer-Facing Public APIs

These APIs don't require authentication - they're for customers applying for installment plans.

### 1. Get TrustWallet Information (Public)

**Endpoint:** `GET /public/trustwallet/{trustWalletId}`
**Auth Required:** No

**Use Case:** Display installment plan details on customer application page

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trustWalletId": "TW-1738259234567",
    "businessName": "Lagos State University",
    "name": "Computer Science Department Fees",
    "description": "Installment payment plan for CS students",
    "installmentPlan": {
      "totalAmount": 100000,
      "downPaymentPercentage": 20,
      "downPaymentAmount": 20000,
      "installmentCount": 4,
      "installmentAmount": 20000,
      "frequency": "monthly",
      "interestRate": 0
    },
    "isActive": true
  },
  "message": "TrustWallet information retrieved successfully"
}
```

**UI Tips:**
- Display payment breakdown clearly
- Show payment schedule (e.g., "4 monthly payments of ₦20,000")
- Highlight interest-free if applicable

### 2. Submit Customer Application (Public)

**Endpoint:** `POST /public/trustwallet/{trustWalletId}/apply`
**Auth Required:** No
**Content-Type:** `multipart/form-data`

**Form Fields:**
- `firstName`: string (required)
- `lastName`: string (required)
- `email`: string (required, valid email)
- `phoneNumber`: string (required, format: 234XXXXXXXXXX)
- `accountNumber`: string (required, exactly 10 digits)
- `bankCode`: string (required, exactly 3 digits)
- `bvn`: string (required, exactly 11 digits)
- `bankStatement`: file (required, PDF or CSV, max 5MB)

**Example (JavaScript with FormData):**
```javascript
const formData = new FormData();
formData.append('firstName', 'John');
formData.append('lastName', 'Doe');
formData.append('email', 'john.doe@example.com');
formData.append('phoneNumber', '2348087654321');
formData.append('accountNumber', '0123456789');
formData.append('bankCode', '058');
formData.append('bvn', '12345678901');
formData.append('bankStatement', fileInput.files[0]); // File from <input type="file">

fetch('http://localhost:3030/public/trustwallet/TW-1738259234567/apply', {
  method: 'POST',
  body: formData
  // No Content-Type header - browser sets it automatically with boundary
})
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "applicationId": "APP-1738259345678",
    "status": "PENDING",
    "message": "Application submitted successfully. We'll analyze your bank statement and notify you shortly."
  },
  "message": "Application submitted successfully"
}
```

**Implementation Notes:**
- Application status starts as `PENDING`
- Background job analyzes bank statement (takes 60-100 seconds)
- Status changes to `ANALYZING` then to final decision
- Customer can check status using application ID

### 3. Check Application Status (Public)

**Endpoint:** `GET /public/application/{applicationId}/status`
**Auth Required:** No

**Use Case:** Customer checks their application progress

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "applicationId": "APP-1738259345678",
    "status": "MANDATE_ACTIVE",
    "trustWalletName": "Computer Science Department Fees",
    "businessName": "Lagos State University",
    "customerName": "John Doe",
    "totalAmount": 100000,
    "downPaymentAmount": 20000,
    "installmentAmount": 20000,
    "installmentCount": 4,
    "frequency": "monthly",
    "trustScore": 85,
    "decision": "AUTO_APPROVED",
    "virtualAccountNumber": "9012345678",
    "bankName": "Example Bank",
    "paymentProgress": {
      "paymentsCompleted": 1,
      "totalPayments": 4,
      "totalPaid": 40000,
      "outstandingBalance": 60000,
      "nextPaymentDate": "2026-03-01T00:00:00.000Z"
    },
    "createdAt": "2026-01-30T13:00:00.000Z"
  },
  "message": "Application status retrieved successfully"
}
```

**Status-Specific Messages:**
- `PENDING`: "We're reviewing your application..."
- `ANALYZING`: "Analyzing your bank statement... This may take up to 2 minutes."
- `AUTO_APPROVED`: "Congratulations! Your application has been approved."
- `FLAGGED_FOR_REVIEW`: "Your application is under manual review. We'll notify you within 24 hours."
- `AUTO_DECLINED`: "Unfortunately, your application doesn't meet our requirements at this time."
- `MANDATE_CREATED`: "Please make your down payment to activate your installment plan."
- `MANDATE_ACTIVE`: "Down payment received! Your installment plan is active."
- `ACTIVE`: "Your payments are in progress."
- `COMPLETED`: "Congratulations! All payments completed."
- `DECLINED`: "Your application has been declined."
- `DEFAULTED`: "Your account is in default due to missed payments."

---

## Admin Dashboard APIs

For internal admin users to monitor system health and view all data.

### Admin Authentication

**Endpoint:** `POST /admin/auth/login`
**Auth Required:** No

**Request Body:**
```json
{
  "email": "admin@trustrail.com",
  "password": "admin-password-from-env"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "admin"
  },
  "message": "Admin login successful"
}
```

### 1. System Health Check

**Endpoint:** `GET /admin/health`
**Auth Required:** Yes (Admin token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-30T16:00:00.000Z",
    "database": {
      "connected": true,
      "latency": 5
    },
    "pwaApi": {
      "reachable": true,
      "responseTime": 120
    },
    "backgroundJobs": {
      "statementAnalysis": {
        "running": true,
        "interval": "60 seconds",
        "lastRun": "2026-01-30T15:59:00.000Z"
      },
      "paymentMonitor": {
        "running": true,
        "interval": "5 minutes",
        "lastRun": "2026-01-30T15:55:00.000Z"
      }
    },
    "system": {
      "uptime": 86400,
      "nodeVersion": "v20.11.0",
      "environment": "development"
    }
  },
  "message": "System health check completed"
}
```

### 2. PWA Health Check

**Endpoint:** `GET /admin/pwa-health`
**Auth Required:** Yes (Admin token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "pwaApiStatus": "operational",
    "lastWebhookReceived": "2026-01-30T15:45:00.000Z",
    "webhookStats": {
      "last24Hours": 45,
      "successRate": 98.5
    }
  },
  "message": "PWA health check completed"
}
```

### 3. View Audit Logs

**Endpoint:** `GET /admin/audit-logs`
**Auth Required:** Yes (Admin token)

**Query Parameters:**
- `page`, `limit`: Pagination
- `action`: Filter by action type
- `actorId`: Filter by user
- `resourceType`: Filter by resource (Business, Application, etc.)
- `resourceId`: Filter by specific resource
- `startDate`, `endDate`: Date range

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "logId": "LOG-1738259789012",
        "action": "application.approved",
        "actorId": "BIZ-1738259123456",
        "actorType": "Business",
        "resourceType": "Application",
        "resourceId": "APP-1738259345678",
        "metadata": {
          "reason": "Good customer history"
        },
        "timestamp": "2026-01-30T14:00:00.000Z"
      }
    ],
    "pagination": { /* ... */ }
  },
  "message": "Audit logs retrieved successfully"
}
```

### 4. View All Applications (Cross-Business)

**Endpoint:** `GET /admin/applications`
**Auth Required:** Yes (Admin token)

**Query Parameters:**
- `page`, `limit`: Pagination
- `businessId`: Filter by business
- `trustWalletId`: Filter by TrustWallet
- `status`: Filter by status
- `minTrustScore`, `maxTrustScore`: Filter by trust score range
- `search`: Search customer name/email
- `startDate`, `endDate`: Date range

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": "APP-1738259345678",
        "businessId": "BIZ-1738259123456",
        "businessName": "Lagos State University",
        "trustWalletId": "TW-1738259234567",
        "trustWalletName": "CS Fees",
        "customerName": "John Doe",
        "customerEmail": "john.doe@example.com",
        "status": "ACTIVE",
        "trustScore": 85,
        "totalAmount": 100000,
        "totalPaid": 40000,
        "createdAt": "2026-01-30T13:00:00.000Z"
      }
    ],
    "pagination": { /* ... */ }
  },
  "message": "Applications retrieved successfully"
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    },
    {
      "field": "phoneNumber",
      "message": "Phone number must be in Nigerian format (234XXXXXXXXXX)"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required. Please provide a valid token."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "You don't have permission to access this resource"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "TrustWallet not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "An unexpected error occurred. Please try again later."
}
```

### Frontend Error Handling Best Practices

```javascript
async function fetchWithErrorHandling(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Handle HTTP errors
      if (response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 403) {
        throw new Error('You don\'t have permission to perform this action.');
      }

      if (response.status === 404) {
        throw new Error('Resource not found.');
      }

      if (response.status === 400 && data.details) {
        // Validation errors
        const errorMessages = data.details.map(d => d.message).join(', ');
        throw new Error(errorMessages);
      }

      // Generic error
      throw new Error(data.error || 'Something went wrong');
    }

    return data;

  } catch (error) {
    // Network errors or thrown errors
    console.error('API Error:', error);
    throw error;
  }
}

// Usage
try {
  const data = await fetchWithErrorHandling('http://localhost:3030/api/trustwallets', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  console.log('Success:', data);
} catch (error) {
  alert(error.message); // Show user-friendly error
}
```

---

## Code Examples

### React/Next.js Integration

#### API Service Layer

```javascript
// services/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        ...options.headers,
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(options.body && !(options.body instanceof FormData) && {
          'Content-Type': 'application/json'
        })
      }
    };

    if (config.body && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async register(businessData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: businessData
    });
  }

  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // TrustWallets
  async createTrustWallet(data) {
    return this.request('/api/trustwallets', {
      method: 'POST',
      body: data
    });
  }

  async getTrustWallets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/trustwallets${query ? `?${query}` : ''}`);
  }

  async getTrustWallet(id) {
    return this.request(`/api/trustwallets/${id}`);
  }

  async updateTrustWallet(id, data) {
    return this.request(`/api/trustwallets/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  async deleteTrustWallet(id) {
    return this.request(`/api/trustwallets/${id}`, {
      method: 'DELETE'
    });
  }

  // Applications
  async getApplications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/applications${query ? `?${query}` : ''}`);
  }

  async getApplication(id) {
    return this.request(`/api/applications/${id}`);
  }

  async approveApplication(id, reason) {
    return this.request(`/api/applications/${id}/approve`, {
      method: 'POST',
      body: { reason }
    });
  }

  async declineApplication(id, reason) {
    return this.request(`/api/applications/${id}/decline`, {
      method: 'POST',
      body: { reason }
    });
  }

  // Payments
  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/payments${query ? `?${query}` : ''}`);
  }

  // Withdrawals
  async createWithdrawal(trustWalletId, amount) {
    return this.request('/api/withdrawals', {
      method: 'POST',
      body: { trustWalletId, amount }
    });
  }

  async getWithdrawals(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/withdrawals${query ? `?${query}` : ''}`);
  }

  // Dashboard
  async getDashboardOverview() {
    return this.request('/api/dashboard/overview');
  }

  async getReports(params) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/dashboard/reports?${query}`);
  }

  async getTrustWalletAnalytics(trustWalletId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(
      `/api/dashboard/trustwallet/${trustWalletId}/analytics${query ? `?${query}` : ''}`
    );
  }

  // Public APIs (no auth)
  async getPublicTrustWallet(trustWalletId) {
    return this.request(`/public/trustwallet/${trustWalletId}`);
  }

  async submitApplication(trustWalletId, formData) {
    return this.request(`/public/trustwallet/${trustWalletId}/apply`, {
      method: 'POST',
      body: formData // FormData object
    });
  }

  async checkApplicationStatus(applicationId) {
    return this.request(`/public/application/${applicationId}/status`);
  }
}

export default new ApiService();
```

#### React Hook for Auth

```javascript
// hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = api.getToken();
    if (token) {
      // Decode token or fetch user info
      // For now, just mark as authenticated
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    api.setToken(response.data.token);
    setUser({
      token: response.data.token,
      businessId: response.data.businessId,
      business: response.data.business
    });
    router.push('/dashboard');
  };

  const register = async (businessData) => {
    const response = await api.register(businessData);
    api.setToken(response.data.token);
    setUser({
      token: response.data.token,
      businessId: response.data.businessId,
      business: response.data.business
    });
    router.push('/dashboard');
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

#### Customer Application Form

```javascript
// components/ApplicationForm.jsx
import { useState } from 'react';
import api from '../services/api';

export default function ApplicationForm({ trustWalletId }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    accountNumber: '',
    bankCode: '',
    bvn: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append('bankStatement', file);

      const response = await api.submitApplication(trustWalletId, formDataToSend);
      setApplicationId(response.data.applicationId);
      alert('Application submitted successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="tel"
        placeholder="Phone Number (234XXXXXXXXXX)"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Account Number"
        value={formData.accountNumber}
        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="Bank Code"
        value={formData.bankCode}
        onChange={(e) => setFormData({...formData, bankCode: e.target.value})}
        required
      />
      <input
        type="text"
        placeholder="BVN"
        value={formData.bvn}
        onChange={(e) => setFormData({...formData, bvn: e.target.value})}
        required
      />
      <input
        type="file"
        accept=".pdf,.csv"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>

      {applicationId && (
        <div>
          <p>Application ID: {applicationId}</p>
          <a href={`/status/${applicationId}`}>Check Status</a>
        </div>
      )}
    </form>
  );
}
```

---

## Best Practices

### 1. Token Management

- Store tokens securely (httpOnly cookies preferred, localStorage acceptable for MVP)
- Include token in Authorization header for all protected routes
- Handle 401 errors globally by redirecting to login
- Implement token refresh if needed (not in MVP)

### 2. Loading States

- Show loading indicators during API calls
- Disable buttons during submission to prevent double-clicks
- Use skeleton screens for better UX

### 3. Error Handling

- Display user-friendly error messages
- Show validation errors next to form fields
- Log errors to monitoring service (Sentry, LogRocket, etc.)

### 4. Polling for Status Updates

For application status checking, implement smart polling:

```javascript
async function pollApplicationStatus(applicationId) {
  const maxAttempts = 40; // 40 * 5 seconds = 3 minutes max
  let attempts = 0;

  const poll = async () => {
    try {
      const response = await api.checkApplicationStatus(applicationId);
      const status = response.data.status;

      // Stop polling if status is final
      if (!['PENDING', 'ANALYZING'].includes(status)) {
        return response.data;
      }

      // Continue polling
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        return poll();
      } else {
        throw new Error('Status check timeout');
      }
    } catch (error) {
      console.error('Polling error:', error);
      throw error;
    }
  };

  return poll();
}
```

### 5. File Upload Validation

```javascript
function validateFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['application/pdf', 'text/csv'];

  if (!file) {
    return 'Please select a file';
  }

  if (file.size > maxSize) {
    return 'File size must not exceed 5MB';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'Only PDF and CSV files are allowed';
  }

  return null; // Valid
}
```

### 6. Pagination Handling

```javascript
function usePagination(fetchFunction, initialParams = {}) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, limit: 20, ...initialParams });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetchFunction(params);
        setData(response.data.items || response.data.applications || []);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params]);

  const goToPage = (page) => setParams({ ...params, page });
  const setFilters = (filters) => setParams({ ...params, ...filters, page: 1 });

  return { data, pagination, loading, goToPage, setFilters };
}
```

### 7. Currency Formatting

API uses kobo (smallest unit). Always convert for display:

```javascript
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount / 100); // Convert kobo to Naira
}

// Usage
formatCurrency(100000); // "₦1,000.00"
```

### 8. Date Formatting

```javascript
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

---

## Testing

### Manual Testing Checklist

#### Business Owner Flow
1. ✅ Register new business account
2. ✅ Login with credentials
3. ✅ Create TrustWallet with various configurations
4. ✅ View list of TrustWallets
5. ✅ Update TrustWallet settings
6. ✅ View applications (empty, pending, flagged, approved)
7. ✅ Manually approve/decline flagged applications
8. ✅ View payment history
9. ✅ Request withdrawal
10. ✅ View dashboard overview

#### Customer Flow
1. ✅ View TrustWallet public page
2. ✅ Submit application with PDF bank statement
3. ✅ Submit application with CSV bank statement
4. ✅ Check application status (pending, analyzing, approved, etc.)
5. ✅ View payment progress for active application

#### Error Scenarios
1. ✅ Submit form with invalid data (test each validation)
2. ✅ Upload file exceeding 5MB
3. ✅ Upload invalid file type
4. ✅ Try to access protected route without token
5. ✅ Use expired/invalid token
6. ✅ Try to update TrustWallet with active applications
7. ✅ Request withdrawal exceeding balance

### Test Data

Use these for testing:

**Nigerian Phone Numbers:**
- Valid: `2348012345678`
- Invalid: `08012345678` (missing country code)

**Bank Codes (Nigerian Banks):**
- GTBank: `058`
- Access Bank: `044`
- Zenith Bank: `057`
- First Bank: `011`

**Test Files:**
- Sample PDF: Available at `/docs/testing/statement-docs.pdf`
- Sample CSV: Create one with columns: Date, Description, Debit, Credit, Balance

---

## Support & Resources

### Related Documentation
- [API Verification Report](API-VERIFICATION-REPORT.md) - Detailed endpoint verification
- [Test Results](../testing/TEST-RESULTS.md) - E2E test results
- [Architecture Guide](../ARCHITECTURE.md) - System architecture overview

### Common Issues

**Issue:** 401 Unauthorized after some time
- **Cause:** Token expired (30-day validity)
- **Solution:** Implement auto-redirect to login on 401

**Issue:** File upload returns 400 error
- **Cause:** File size > 5MB or wrong file type
- **Solution:** Validate file before upload

**Issue:** Application status stuck on "ANALYZING"
- **Cause:** OpenAI API slow or background job delayed
- **Solution:** Implement polling with timeout (max 3 minutes)

**Issue:** CORS errors in development
- **Cause:** Frontend and backend on different ports
- **Solution:** Backend already configured with CORS `*` for development

---

## Implementation Checklist

### Phase 1: Business Owner Dashboard
- [ ] Authentication (register, login, logout)
- [ ] TrustWallet CRUD
- [ ] Application list with filters
- [ ] Application detail view
- [ ] Manual approve/decline
- [ ] Payment history
- [ ] Withdrawal management
- [ ] Dashboard overview

### Phase 2: Customer Application
- [ ] Public TrustWallet page
- [ ] Application form with file upload
- [ ] Application status checker
- [ ] Status-specific messaging

### Phase 3: Admin Dashboard (Optional)
- [ ] Admin login
- [ ] System health monitoring
- [ ] Cross-business application view
- [ ] Audit logs

### Phase 4: Polish
- [ ] Error handling & user feedback
- [ ] Loading states & skeletons
- [ ] Responsive design
- [ ] Accessibility (WCAG)
- [ ] Performance optimization

---

**Good luck with the implementation! 🚀**

If you have any questions about specific endpoints or need clarification on any flow, refer back to this guide or check the [API Verification Report](API-VERIFICATION-REPORT.md) for implementation details.
