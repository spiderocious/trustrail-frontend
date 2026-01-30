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
} as const;
