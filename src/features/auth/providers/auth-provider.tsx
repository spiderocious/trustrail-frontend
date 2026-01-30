import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  getBusinessId,
  setAuth,
  clearAuth,
} from "../helpers/token-storage";
import { ROUTES } from "@shared/constants/routes/routes";

interface AuthContextValue {
  isAuthenticated: boolean;
  businessId: string | null;
  login: (token: string, businessId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authenticated, setAuthenticated] =
    useState<boolean>(isAuthenticated());
  const [businessId, setBusinessIdState] = useState<string | null>(
    getBusinessId(),
  );
  const navigate = useNavigate();

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setBusinessIdState(getBusinessId());
  }, []);

  const login = (token: string, businessId: string) => {
    setAuth(token, businessId);
    setAuthenticated(true);
    setBusinessIdState(businessId);
    navigate(ROUTES.DASHBOARD.ROOT);
  };

  const logout = () => {
    clearAuth();
    setAuthenticated(false);
    setBusinessIdState(null);
    navigate(ROUTES.AUTH.LOGIN);
  };

  const value: AuthContextValue = {
    isAuthenticated: authenticated,
    businessId,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
