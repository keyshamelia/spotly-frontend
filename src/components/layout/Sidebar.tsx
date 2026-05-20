// ============================================================
// SPOTLY — Sidebar.tsx  (src/components/layout/Sidebar.tsx)
// Desktop only — hidden on mobile
// ============================================================

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorOpen,
  CalendarCheck,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard',       path: '/dashboard',            icon: <LayoutDashboard size={18} /> },
  { label: 'Room Management', path: '/dashboard/rooms',      icon: <DoorOpen size={18} /> },
  { label: 'Bookings',        path: '/dashboard/bookings',   icon: <CalendarCheck size={18} /> },
  { label: 'Login Log',       path: '/dashboard/login-logs', icon: <Users size={18} /> },
  { label: 'Settings',        path: '/dashboard/settings',   icon: <Settings size={18} /> },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0D1B2A] text-white h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <LayoutDashboard size={16} className="text-[#0D1B2A]" />
          </div>
          <div>
            <p className="font-bold text-lg tracking-wider leading-none">SPOTLY</p>
            <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }: { isActive: boolean }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-150 group',
                isActive
                  ? 'bg-white text-[#0D1B2A] shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <span className={`flex-shrink-0 ${isActive ? 'text-[#0D1B2A]' : 'text-white/60 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium
                     text-white/60 hover:bg-white/10 hover:text-white transition-all duration-150"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;