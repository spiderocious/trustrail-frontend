import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const ApplicationsListScreen = lazy(() =>
  import("./screen/applications-list-screen").then((module) => ({
    default: module.ApplicationsListScreen,
  })),
);

const ApplicationDetailsScreen = lazy(() =>
  import("./screen/application-details-screen").then((module) => ({
    default: module.ApplicationDetailsScreen,
  })),
);

export const applicationsRoutes: RouteObject[] = [
  {
    path: "applications",
    element: <ApplicationsListScreen />,
  },
  {
    path: "applications/:id",
    element: <ApplicationDetailsScreen />,
  },
];
