import { ROUTES } from "@shared/constants/routes/routes";
import { ApiClientError } from "@shared/helpers/api-client";
import { useEffect, useState } from "react";
import { FaDiamond } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "../api/use-login";
import { useAuth } from "../providers/auth-provider";

export function AutoLoginScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const loginMutation = useLogin();

  useEffect(() => {
    handleAutoLogin();
  }, []);

  async function handleAutoLogin() {
    const token = searchParams.get("token");

    if (!token) {
      setError("Missing token parameter");
      return;
    }

    try {
      // Decode the base64 token
      const decoded = atob(token);

      // Split by -&- to get email and password
      const parts = decoded.split("-&-");

      if (parts.length !== 2) {
        setError("Invalid token format");
        return;
      }

      const [email, password] = parts;

      if (!email || !password) {
        setError("Invalid credentials in token");
        return;
      }

      // Call the login API
      loginMutation.mutate(
        { email, password },
        {
          onSuccess: (response) => {
            login(response.data.token, response.data);
          },
          onError: (err: unknown) => {
            if (err instanceof ApiClientError) {
              setError(err.message);
            } else {
              setError("Login failed. Please try again.");
            }
          },
        },
      );
    } catch {
      setError("Invalid token encoding");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaDiamond className="text-blue-600 text-2xl" />
          <span className="text-xl font-bold text-gray-900">TrustRail</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FaDiamond className="text-blue-600 text-2xl" />
              </div>
            </div>

            {error ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Login Failed
                </h1>
                <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-6">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
                <button
                  onClick={() => navigate(ROUTES.AUTH.LOGIN)}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Signing you in...
                </h1>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-gray-500">
          © 2024 TrustRail Inc. All rights reserved. Professional installment
          payments for Nigeria.
        </p>
      </footer>
    </div>
  );
}
