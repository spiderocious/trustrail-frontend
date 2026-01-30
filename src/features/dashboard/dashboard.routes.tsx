import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import { ROUTES } from "@shared/constants/routes/routes";

const DashboardScreen = lazy(() =>
  import("./screen/dashboard-screen").then((module) => ({
    default: module.DashboardScreen,
  })),
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: ROUTES.DASHBOARD.ROOT,
    element: <DashboardScreen />,
  },
];
