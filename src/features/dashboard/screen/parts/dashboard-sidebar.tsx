import { useAuth } from "@features/auth/providers/auth-provider";
import { ROUTES } from "@shared/constants/routes/routes";
import {
  FaArrowRightFromBracket,
  FaFile,
  FaTableCells,
  FaWallet,
  FaXmark,
} from "react-icons/fa6";
import { NavLink } from "react-router-dom";

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({
  isOpen = true,
  onClose,
}: DashboardSidebarProps) {
  const { logout } = useAuth();

  const navItems = [
    {
      to: ROUTES.DASHBOARD.ROOT,
      icon: FaTableCells,
      label: "Dashboard",
      badge: null,
    },
    { to: "/trustwallets", icon: FaWallet, label: "TrustWallets", badge: null },
    {
      to: "/applications",
      icon: FaFile,
      label: "Applications",
      badge: null,
    },
    // { to: "/payments", icon: FaMoneyBillWave, label: "Payments", badge: null },
    // {
    //   to: "/withdrawals",
    //   icon: FaArrowDown,
    //   label: "Withdrawals",
    //   badge: null,
    // },
    // { to: "/analytics", icon: FaChartLine, label: "Analytics", badge: null },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 flex flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                T
              </div>
              <span className="text-xl font-bold text-gray-900">TrustRail</span>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              <FaXmark className="text-xl" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              <item.icon className="text-xl" />
              <span className="font-medium">{item.label}</span>
              {item.badge !== null && (
                <span className="ml-auto bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-1">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <FaArrowRightFromBracket className="text-xl" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
