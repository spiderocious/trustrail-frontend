// Validation helper functions

export function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function validatePasswordConfirm(
  password: string,
  confirm: string,
): string | null {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return null;
}

export function validatePhoneNumber(phone: string): string | null {
  if (!phone) return "Phone number is required";
  // Nigerian format: 234XXXXXXXXXX
  const phoneRegex = /^234\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return "Invalid Nigerian phone number (format: 234XXXXXXXXXX)";
  }
  return null;
}

export function validateAccountNumber(accountNumber: string): string | null {
  if (!accountNumber) return "Account number is required";
  if (!/^\d{10}$/.test(accountNumber)) {
    return "Account number must be exactly 10 digits";
  }
  return null;
}

export function validateBankCode(bankCode: string): string | null {
  if (!bankCode) return "Bank selection is required";
  if (!/^\d{3}$/.test(bankCode)) {
    return "Invalid bank code";
  }
  return null;
}

export function validateBusinessName(name: string): string | null {
  if (!name) return "Business name is required";
  if (name.length < 2) return "Business name is too short";
  if (name.length > 200) return "Business name is too long";
  return null;
}

export function validateRcNumber(rcNumber: string): string | null {
  if (!rcNumber) return "RC/CAC number is required";
  if (rcNumber.length < 2) return "RC/CAC number is too short";
  if (rcNumber.length > 50) return "RC/CAC number is too long";
  return null;
}

export function getPasswordStrength(password: string): {
  strength: "weak" | "medium" | "strong";
  percentage: number;
} {
  if (!password) return { strength: "weak", percentage: 0 };

  let score = 0;

  // Length check
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 10;
  if (/[^a-zA-Z\d]/.test(password)) score += 10;

  const percentage = Math.min(score, 100);

  if (percentage < 50) return { strength: "weak", percentage };
  if (percentage < 80) return { strength: "medium", percentage };
  return { strength: "strong", percentage };
}
