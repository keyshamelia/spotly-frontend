  // ============================================================
  // SPOTLY — MobileNavigation.tsx  (src/components/layout/MobileNavigation.tsx)
  // Bottom bar — visible on mobile only (lg:hidden)
  // ============================================================

  import React from 'react';
  import { NavLink } from 'react-router-dom';
  import {
    LayoutDashboard,
    DoorOpen,
    Tag,
    CalendarCheck,
    Users,
  } from 'lucide-react';

  interface MobileNavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
  }

  const mobileNavItems: MobileNavItem[] = [
    { label: 'Dashboard', path: '/dashboard',          icon: <LayoutDashboard size={20} /> },
    { label: 'Rooms',     path: '/dashboard/rooms',    icon: <DoorOpen size={20} /> },
    // { label: 'Categories', path: '/dashboard/analytics', icon: <Tag size={20} /> },
    { label: 'Bookings',  path: '/dashboard/bookings', icon: <CalendarCheck size={20} /> },
    { label: 'Login Log',     path: '/dashboard/login-log',    icon: <Users size={20} /> },
  ];

  export const MobileNavigation: React.FC = () => {
    return (
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50
                  bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch justify-around px-1">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              // DISINI PERBAIKANNYA: 
              className={({ isActive }: { isActive: boolean }) =>
                [
                  'flex flex-col items-center justify-center gap-0.5 py-3 px-2 flex-1',
                  'text-[10px] font-semibold tracking-wide transition-colors duration-150',
                  isActive
                    ? 'text-[#0D1B2A]'
                    : 'text-gray-400 hover:text-gray-600',
                ].join(' ')
              }
            >
              {/* NavLink dari react-router-dom juga butuh tipe di render props-nya */}
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <span
                    className={`transition-transform duration-150 ${
                      isActive ? 'scale-110' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {/* Active indicator dot */}
                  <span
                    className={`w-1 h-1 rounded-full transition-opacity duration-150 ${
                      isActive ? 'bg-[#0D1B2A] opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    );
  };

  export default MobileNavigation;
