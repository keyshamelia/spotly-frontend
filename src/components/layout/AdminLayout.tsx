import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { Navbar } from './Navbar';

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default AdminLayout;