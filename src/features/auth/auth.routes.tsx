import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { ROUTES } from "@shared/constants/routes/routes";

const LoginScreen = lazy(() =>
  import("./screen/login-screen").then((module) => ({
    default: module.LoginScreen,
  })),
);

const RegisterScreen = lazy(() =>
  import("./screen/register-screen").then((module) => ({
    default: module.RegisterScreen,
  })),
);

export const authRoutes: RouteObject[] = [
  {
    path: ROUTES.AUTH.LOGIN,
    element: <LoginScreen />,
  },
  {
    path: ROUTES.AUTH.REGISTER,
    element: <RegisterScreen />,
  },
];
