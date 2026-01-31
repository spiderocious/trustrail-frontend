// Pure functions for token management in localStorage

import { Anything } from "../../../shared/types";

const TOKEN_KEY = "trustrail_auth_token";
const BUSINESS_ID_KEY = "trustrail_business_id";
const USER_DATA_KEY = "trustrail_user_data";

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
  return getToken() !== null && getAuthData() !== null;
}

export function clearAuth(): void {
  removeToken();
  removeBusinessId();
}

export function saveAuthData(data: Anything) {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
}

export function getAuthData(): Anything | null {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export function businessName(): string {
  const data = getAuthData();
  return data?.businessName || "";
}

export function setAuth(
  token: string,
  businessId: string,
  data: Anything,
): void {
  setToken(token);
  setBusinessId(businessId);
  saveAuthData(data);
}
