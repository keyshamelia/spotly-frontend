// ============================================================
// SPOTLY — Navbar.tsx  (src/components/layout/Navbar.tsx)
// Top header bar — visible on desktop admin pages
// ============================================================

import React, { useState } from 'react';
import { Search, Bell, Settings } from 'lucide-react';

interface NavbarProps {
  adminName?: string;
  adminRole?: string;
  adminAvatarUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  adminName = 'Key',
  adminRole = 'Admin',
  adminAvatarUrl,
}) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 gap-4">
        {/* Search bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for rooms, bookings, or users..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200
                         rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20
                         focus:border-[#0D1B2A] focus:bg-white transition-all duration-150
                         placeholder:text-gray-400 text-[#0D1B2A]"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100
                       hover:text-[#0D1B2A] transition-colors duration-150"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* Settings */}
          <button
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100
                       hover:text-[#0D1B2A] transition-colors duration-150"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Admin profile */}
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0D1B2A] leading-none">{adminName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{adminRole}</p>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0D1B2A] flex items-center justify-center
                            ring-2 ring-transparent group-hover:ring-[#0D1B2A]/20 transition-all duration-150">
              {adminAvatarUrl ? (
                <img src={adminAvatarUrl} alt={adminName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">
                  {adminName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
