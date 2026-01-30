# TrustRail Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** January 30, 2025  
**Document Owner:** Product Team  
**Status:** Final - Ready for Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [User Personas](#user-personas)
4. [User Journeys](#user-journeys)
5. [Feature Specifications](#feature-specifications)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Success Metrics](#success-metrics)
8. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### Product Name
TrustRail - AI-Powered Installment Payment Platform for Nigerian Businesses

### Product Vision
Enable any Nigerian business to offer installment payment plans to their customers without technical complexity, credit bureau integration, or upfront risk.

### Target Market
- Nigerian educational institutions (universities, polytechnics, secondary schools)
- Healthcare providers (hospitals, clinics, medical centers)
- E-commerce platforms
- Professional services (legal firms, consulting agencies)
- Real estate agencies
- SMEs wanting to increase sales through flexible payment options

### Core Value Proposition
**For Businesses:**
- Offer installment payments without building payment infrastructure
- Zero technical integration required
- Automated creditworthiness assessment via bank statement analysis
- Risk-free (only approved customers get installments)
- Automated payment collection
- Real-time payment tracking

**For Customers:**
- Get approved for installments based on actual financial capacity (not credit history)
- No credit bureau checks
- Quick approval (2-5 minutes)
- Transparent process (see trust score and decision rationale)

### Business Model
Platform charges businesses a percentage fee on successful payments (future monetization - not in MVP scope).

---

## Product Overview

### What is TrustRail?

TrustRail is a white-label Buy Now Pay Later (BNPL) platform that sits between Nigerian businesses and payment infrastructure (PayWithAccount/NIBSS). It solves the critical problem of determining **who should be allowed to defer payment** through automated bank statement analysis.

Unlike traditional BNPL services that rely on:
- Credit bureaus (unavailable/unreliable in Nigeria)
- Payment history with the platform (not available for new customers)
- Manual approval processes (slow and inconsistent)

TrustRail uses **bank statement pattern recognition** to assess a customer's ability to afford monthly installments.

### How It Works

**Business Side:**
1. Business registers on TrustRail (multi-stage approval process)
2. Business creates "TrustWallets" - embeddable payment collection widgets
3. Each TrustWallet has its own installment plan and approval rules
4. Business shares TrustWallet public URL with customers
5. Business monitors payments and withdraws collected funds

**Customer Side:**
1. Customer visits TrustWallet public URL
2. Customer submits bank account details + 3-month bank statement (CSV)
3. TrustRail analyzes statement and generates trust score (0-100)
4. Customer receives instant decision (approved/declined/under review)
5. If approved: Customer pays down payment to activate installments
6. Installments auto-debit from customer's account monthly

**Technical Side:**
- TrustRail acts as trust orchestrator (decides IF, WHEN, and HOW much)
- PayWithAccount (PWA) acts as payment executor (handles actual money movement via NIBSS)
- Bank statement analysis happens in background (2-5 minutes)
- Direct debits are automated via NIBSS mandate system

---

## User Personas

### Persona 1: Business Owner (Primary User)

**Name:** Dr. Adewale Okonkwo  
**Role:** Bursar, Lagos State University  
**Age:** 45  
**Location:** Lagos, Nigeria

**Background:**
- Manages fee collection for 20,000+ students
- Receives hundreds of installment requests per semester
- Currently processes installment requests manually with Excel spreadsheets
- Spends 20+ hours/week reviewing applications and tracking payments

**Goals:**
- Automate installment approval process
- Reduce default risk
- Improve cash flow visibility
- Reduce administrative workload
- Offer fair payment plans to students

**Pain Points:**
- Manual approval process is time-consuming and inconsistent
- No systematic way to assess student's ability to pay
- Payment tracking via Excel is error-prone
- Students default and don't complete payments
- No automated payment collection system

**Technical Proficiency:** Medium (comfortable with web apps, not a developer)

**Quote:** *"I need a system that tells me which students can actually afford installments, not just who promises to pay."*

---

### Persona 2: End Customer (Secondary User)

**Name:** Chidinma Nwosu  
**Role:** Computer Science Student  
**Age:** 21  
**Location:** Lagos, Nigeria

**Background:**
- Second-year university student
- Parents pay fees but struggle with lump-sum payments
- Has consistent allowance deposited monthly
- Wants to spread fee payments over semester

**Goals:**
- Get approved for installment plan
- Avoid rejection due to lack of credit history
- Understand why she was approved/declined
- Complete payments conveniently

**Pain Points:**
- Traditional loan applications require credit history (which she doesn't have)
- Banks reject her for student loans
- Manual approval processes take weeks
- Unclear approval criteria

**Technical Proficiency:** High (digital native, comfortable with online forms)

**Quote:** *"I receive money consistently every month, but banks won't approve me because I'm a student with no loan history."*

---

### Persona 3: Platform Admin (Tertiary User)

**Name:** Tunde Bakare  
**Role:** TrustRail Operations Manager  
**Age:** 32  
**Location:** Lagos, Nigeria

**Background:**
- Manages TrustRail platform operations
- Approves/rejects business registrations
- Monitors system health
- Investigates payment failures
- Handles escalations

**Goals:**
- Efficiently review and approve business applications
- Monitor platform health and uptime
- Identify and resolve integration issues (PWA API)
- Maintain audit trails for compliance

**Pain Points:**
- Need visibility into all platform activities
- Need to quickly diagnose payment failures
- Manual business approval process slows onboarding

**Technical Proficiency:** High (technical operations background)

**Quote:** *"I need a single dashboard to see everything happening on the platform and quickly approve businesses."*

---

## User Journeys

### Journey 1: Business Owner Registration & Setup

**Actor:** Business Owner (Dr. Adewale)

**Trigger:** Business wants to start offering installment payments

**Steps:**

**Stage 1: Initial Registration**
1. Business owner visits TrustRail homepage
2. Clicks "Register Your Business"
3. Fills registration form:
   - Business name (e.g., "Lagos State University")
   - Business email
   - Password (min 8 characters)
   - Phone number (Nigerian format: 234XXXXXXXXXX)
   - RC (Registration Certificate) number
   - Settlement account details (where funds will be sent):
     - Account number
     - Bank code (3-digit)
     - Account name
4. Submits form
5. System validates:
   - Email uniqueness
   - RC number uniqueness
   - Phone number format
   - Account details format
6. If valid: Account created with status `PENDING_DOCUMENT_UPLOAD`
7. System generates JWT token (limited access)
8. Business owner lands on document upload page

**Stage 2: Document Upload**
1. Business owner sees instructions: "Upload required documents for verification"
2. Uploads CAC (Corporate Affairs Commission) certificate (required):
   - Accepted formats: PDF, JPG, PNG
   - Max size: 5MB
   - System validates file format
3. Optionally uploads supporting documents:
   - Business license
   - Utility bill
   - Tax clearance certificate
4. Submits documents
5. System stores documents securely
6. Account status changes to `PENDING_APPROVAL`
7. Business owner sees message: "Your application is under review. You'll receive an email notification within 24 hours."
8. Business owner can check status via "Check Application Status" page

**Stage 3: Waiting for Approval**
1. Business owner receives email: "Your TrustRail application is under review"
2. Business owner can login to see status dashboard:
   - Status: Pending Approval
   - Submitted on: [Date]
   - Estimated review time: 24 hours
   - Cannot access TrustWallet creation yet

**Stage 4: Admin Approval**
1. Admin reviews application in admin panel
2. Admin checks:
   - Business details validity
   - CAC certificate authenticity
   - Supporting documents (if provided)
3. Admin approves application
4. System triggers:
   - Call PWA `create merchant` API
   - Receive and store `billerCode`
   - Update account status to `ACTIVE`
   - Send approval email to business owner
5. Business owner receives email: "Your TrustRail account is approved! Login to get started."

**Stage 5: First Login After Approval**
1. Business owner logs in
2. Lands on welcome dashboard
3. Sees onboarding guide: "Create Your First TrustWallet"
4. Proceeds to create first TrustWallet

**Alternate Flow: Rejection**
- Admin rejects application with reason
- Business owner receives email with rejection reason
- Business owner can re-apply after addressing issues

**Success Criteria:**
- Business registration completed in under 10 minutes
- Document upload successful
- Admin approval within 24 hours
- Business can create TrustWallets immediately after approval

---

### Journey 2: Creating a TrustWallet

**Actor:** Business Owner (Dr. Adewale)

**Trigger:** Business wants to create installment payment option for a specific use case

**Precondition:** Business account is ACTIVE

**Steps:**

1. Business owner clicks "Create TrustWallet" from dashboard
2. Sees TrustWallet creation form with three sections:

**Section 1: Basic Information**
- **Name** (required): "Computer Science De…