// API configuration constants

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3030",
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
  },
  TRUSTWALLETS: {
    LIST: "/api/trustwallets",
    CREATE: "/api/trustwallets",
    GET: (id: string) => `/api/trustwallets/${id}`,
    UPDATE: (id: string) => `/api/trustwallets/${id}`,
    DELETE: (id: string) => `/api/trustwallets/${id}`,
  },
  DASHBOARD: {
    OVERVIEW: "/api/dashboard/overview",
    REPORTS: "/api/dashboard/reports",
    TRUSTWALLET_ANALYTICS: (id: string) =>
      `/api/dashboard/trustwallet/${id}/analytics`,
  },
  APPLICATIONS: {
    LIST: "/api/applications",
    GET: (id: string) => `/api/applications/${id}`,
    APPROVE: (id: string) => `/api/applications/${id}/approve`,
    DECLINE: (id: string) => `/api/applications/${id}/decline`,
  },
  PAYMENTS: {
    LIST: "/api/payments",
    GET: (id: string) => `/api/payments/${id}`,
  },
  WITHDRAWALS: {
    LIST: "/api/withdrawals",
    CREATE: "/api/withdrawals",
  },
  PUBLIC: {
    TRUSTWALLET: (id: string) => `/public/trustwallet/${id}`,
    APPLY: (id: string) => `/public/trustwallet/${id}/apply`,
    APPLICATION_STATUS: (id: string) => `/public/application/${id}/status`,
  },
} as const;
