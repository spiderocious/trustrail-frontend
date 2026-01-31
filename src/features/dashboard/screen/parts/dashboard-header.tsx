import { getAuthData } from "../../../auth/helpers/token-storage";

export function DashboardHeader() {
  // Get initials from business name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  const businessData = getAuthData();
  const businessDisplayName = businessData?.businessName || "Business";

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Business Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
          <span className="text-sm font-semibold text-gray-700">
            {getInitials(businessDisplayName)}
          </span>
          <span className="text-sm text-gray-600">{businessDisplayName}</span>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          {/* <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications, wallets, or payments..."
              className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}

          {/* Notifications */}
          {/* <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <FaBell className="text-xl" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button> */}

          {/* User Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {getInitials(businessDisplayName)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
