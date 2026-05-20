// ============================================================
// SPOTLY — Shared TypeScript Types
// ============================================================

export interface Room {
  id: string;
  name: string;
  category: 'Creative Space' | 'Corporate' | 'Shared Workspace' | 'Meeting Room';
  pricingModel: {
    daily: number;
    monthly?: number;
    yearly?: number;
  };
  status: 'Confirmed' | 'Maintenance' | 'Inactive';
  imageUrl: string;
}

export interface Booking {
  id: string;
  userName: string;
  userAvatar?: string;
  roomName: string;
  amount: number;
  createdAt: string; // e.g. "2 mins ago"
}

export interface StatCardData {
  title: string;
  value: string | number;
  trend: string;   // e.g. "+12%"
  trendLabel: string; // e.g. "from last month"
  isPositive: boolean;
  icon: React.ReactNode;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface AdminUser {
  name: string;
  role: string;
  avatarUrl?: string;
}

// ---- Form Types ----
export interface LoginFormData {
  email: string;
  password: string;
}
