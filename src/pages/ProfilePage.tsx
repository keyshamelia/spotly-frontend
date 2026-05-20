import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Booking {
  id: number;
  room?: { name: string; image_url: string | null };
  pricing_type: string;
  qty: number;
  total_price: number;
  status: string;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  rejected:  'bg-red-50 text-red-600',
  cancelled: 'bg-gray-100 text-gray-500',
};

const FALLBACK = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80';

function formatRp(n: number) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

export default function ProfilePage() {
  const { user, logout, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!token) return;
    axios.get('http://127.0.0.1:8000/api/bookings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setBookings(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-5">
      {/* Profile card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-[#0F1C2C] flex items-center justify-center shrink-0">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F1C2C]">{user?.name ?? '-'}</h2>
            <p className="text-xs text-gray-400">{user?.email ?? '-'}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { icon: <Mail size={14} />,     label: 'Email',   value: user?.email ?? '-' },
            { icon: <User size={14} />,     label: 'Role',    value: user?.role_id === 2 ? 'Admin' : 'Customer' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-400 shrink-0">{row.icon}</span>
              <span className="text-xs text-gray-400 w-16 shrink-0">{row.label}</span>
              <span className="text-sm text-[#0F1C2C] font-medium">{row.value}</span>
            </div>
          ))}
        </div>

        <button onClick={handleLogout}
          className="mt-5 w-full py-3 flex items-center justify-center gap-2 border border-red-200 text-red-500 rounded-2xl text-sm font-semibold hover:bg-red-50 transition-colors">
          <LogOut size={15} /> Keluar
        </button>
      </div>

      {/* Booking history */}
      <div>
        <h3 className="text-base font-bold text-[#0F1C2C] mb-3">Riwayat Booking</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <span className="text-4xl block mb-2">📭</span>
            Belum ada riwayat booking
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
                <img
                  src={b.room?.image_url || FALLBACK}
                  alt={b.room?.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-[#0F1C2C] truncate">
                      {b.room?.name ?? `Room #${b.id}`}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{b.pricing_type} · {b.qty}x</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-bold text-[#0F1C2C]">{formatRp(b.total_price)}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(b.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}