import { Link } from "react-router-dom";
import { ROUTES } from "@shared/constants/routes/routes";
import { GuestGuard } from "../guards/guest-guard";

function LoginScreenContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            TR
          </div>
          <span className="text-xl font-bold text-gray-900">TrustRail</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Login
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Login page - Authentication form will be implemented here
        </p>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="text-blue-600 font-semibold hover:underline"
            >
              Register your business
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginScreen() {
  return (
    <GuestGuard>
      <LoginScreenContent />
    </GuestGuard>
  );
}
