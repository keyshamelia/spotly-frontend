import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PlaceholderPage } from './pages/PlaceholderPage';
import CustomerPage from './pages/CustomerPage';
import ManageBookings from './pages/ManageBookings';
import RoomManagementPage from './pages/RoomManagementPage';
import MyBookings from './pages/MyBookings';
import LoginLogPage from './pages/LoginLogPage'; // ← tambah

// ── Guard: harus login ───────────────────────────────────────
function RequireAuth() {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      Loading...
    </div>
  );
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

// ── Guard: harus admin (role_id === 2) ───────────────────────
function RequireAdmin() {
  const { isAdmin, isLoggedIn, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      Loading...
    </div>
  );
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

// ── Guard: tamu saja ─────────────────────────────────────────
function GuestOnly() {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      Loading...
    </div>
  );
  if (isLoggedIn) return <Navigate to={isAdmin ? '/dashboard' : '/'} replace />;
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Customer — public */}
      <Route path="/" element={<CustomerPage />} />

      {/* Guest only */}
      <Route element={<GuestOnly />}>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Harus login dulu (customer & admin) */}
      <Route element={<RequireAuth />}>
        <Route path="/my-bookings" element={<MyBookings />} />
      </Route>

      {/* Admin only — role_id 2 */}
      <Route element={<RequireAdmin />}>
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index                element={<AdminDashboard />} />
          <Route path="rooms"         element={<RoomManagementPage />} />
          <Route path="bookings"      element={<ManageBookings />} />
          <Route path="login-logs"    element={<LoginLogPage />} /> {/* ← tambah */}
          <Route path="analytics"     element={<PlaceholderPage title="Analytics" />} />
          <Route path="users"         element={<PlaceholderPage title="Users" />} />
          <Route path="settings"      element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
            success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
            error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}