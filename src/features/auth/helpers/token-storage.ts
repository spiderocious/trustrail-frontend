// Pure functions for token management in localStorage

const TOKEN_KEY = "trustrail_auth_token";
const BUSINESS_ID_KEY = "trustrail_business_id";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getBusinessId(): string | null {
  return localStorage.getItem(BUSINESS_ID_KEY);
}

export function setBusinessId(businessId: string): void {
  localStorage.setItem(BUSINESS_ID_KEY, businessId);
}

export function removeBusinessId(): void {
  localStorage.removeItem(BUSINESS_ID_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function clearAuth(): void {
  removeToken();
  removeBusinessId();
}

export function setAuth(token: string, businessId: string): void {
  setToken(token);
  setBusinessId(businessId);
}
