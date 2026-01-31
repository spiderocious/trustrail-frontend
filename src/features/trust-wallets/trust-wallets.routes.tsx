import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const TrustWalletsListScreen = lazy(() =>
  import("./screen/trust-wallets-list-screen").then((module) => ({
    default: module.TrustWalletsListScreen,
  })),
);

const CreateTrustWalletScreen = lazy(() =>
  import("./screen/create-trust-wallet-screen").then((module) => ({
    default: module.CreateTrustWalletScreen,
  })),
);

const TrustWalletDetailsScreen = lazy(() =>
  import("./screen/trust-wallet-details-screen").then((module) => ({
    default: module.TrustWalletDetailsScreen,
  })),
);

const TrustWalletApplicationsScreen = lazy(() =>
  import("./screen/trust-wallet-applications-screen").then((module) => ({
    default: module.TrustWalletApplicationsScreen,
  })),
);

export const trustWalletsRoutes: RouteObject[] = [
  {
    path: "/trustwallets",
    element: <TrustWalletsListScreen />,
  },
  {
    path: "/trustwallets/create",
    element: <CreateTrustWalletScreen />,
  },
  {
    path: "/trustwallets/:id",
    element: <TrustWalletDetailsScreen />,
  },
  {
    path: "/trustwallets/:id/applications",
    element: <TrustWalletApplicationsScreen />,
  },
];
