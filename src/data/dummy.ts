// ============================================================
// SPOTLY — Dummy Data (API-ready placeholders)
// TODO: INTEGRATE WITH AXIOS — replace all exports with real API calls
// ============================================================

import type { Room, Booking } from '../types';

export const dummyRooms: Room[] = [
  {
    id: 'SF-0012',
    name: 'Studio Foto A',
    category: 'Creative Space',
    pricingModel: { daily: 45, monthly: 1200 },
    status: 'Confirmed',
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&q=80',
  },
  {
    id: 'MR-0045',
    name: 'Meeting Room VIP',
    category: 'Corporate',
    pricingModel: { daily: 120, monthly: 3500, yearly: 36000 },
    status: 'Confirmed',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80',
  },
  {
    id: 'CW-0089',
    name: 'Co-working Hub',
    category: 'Shared Workspace',
    pricingModel: { daily: 15, monthly: 250 },
    status: 'Maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&q=80',
  },
  {
    id: 'MR-0052',
    name: 'Elite Executive Boardroom',
    category: 'Corporate',
    pricingModel: { daily: 350, monthly: 8000, yearly: 85000 },
    status: 'Confirmed',
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=300&q=80',
  },
  {
    id: 'CS-0031',
    name: 'Nexus Boardroom',
    category: 'Meeting Room',
    pricingModel: { daily: 200, monthly: 5000 },
    status: 'Inactive',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&q=80',
  },
];

export const dummyBookings: Booking[] = [
  {
    id: 'BK-001',
    userName: 'Alex Rivera',
    roomName: 'Studio Foto A',
    amount: 45,
    createdAt: '2 mins ago',
  },
  {
    id: 'BK-002',
    userName: 'Sarah Chen',
    roomName: 'Meeting Room VIP',
    amount: 120,
    createdAt: '15 mins ago',
  },
  {
    id: 'BK-003',
    userName: 'Marcus Jordan',
    roomName: 'Co-working Hub',
    amount: 15,
    createdAt: '1 hour ago',
  },
  {
    id: 'BK-004',
    userName: 'Priya Nair',
    roomName: 'Elite Executive Boardroom',
    amount: 350,
    createdAt: '3 hours ago',
  },
];
