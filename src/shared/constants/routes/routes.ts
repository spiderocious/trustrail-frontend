// Route constants following FSD architecture

export const ROUTES = {
  ROOT: "/",
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
  },
  DASHBOARD: {
    ROOT: "/dashboard",
  },
  PUBLIC: {
    TRUSTWALLET: (id: string) => `/apply/${id}`,
    APPLICATION_FORM: (id: string) => `/apply/${id}/form`,
    APPLICATION_SUBMITTED: (id: string) => `/application/${id}/submitted`,
    STATUS: (id?: string) => (id ? `/status/${id}` : "/status"),
  },
} as const;
