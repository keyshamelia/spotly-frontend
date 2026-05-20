import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DoorOpen, CalendarCheck, DollarSign, BarChart2,
  TrendingUp, TrendingDown, ArrowRight, Clock,
  CheckCircle2, AlertCircle, MapPin, Search,
} from 'lucide-react';
import axios from 'axios';

// ── Types ───────────────────────────────────────────────────
interface Booking {
  id: string;
  customer_name: string;
  room?: { name: string };
  total_price: number;
  created_at: string;
  status?: string;
}

interface Room {
  id: number;
  name: string;
  status: string;
  price_daily: number;
  location: string;
  image_url?: string;
}

// ── Helpers ─────────────────────────────────────────────────
const fmt = (n: number) => {
  if (!n || isNaN(n)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n).replace('IDR', 'Rp').trim();
};

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ── Sparkline SVG ────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Revenue Bar Chart ────────────────────────────────────────
const revenueData = [42, 58, 45, 70, 63, 88, 72];
const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const RevenueChart: React.FC = () => {
  const max = Math.max(...revenueData);
  return (
    <div className="flex items-end gap-[7px] h-36 pt-2">
      {revenueData.map((v, i) => {
        const pct = Math.round((v / max) * 100);
        const isToday = i === 5;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[9px] font-bold text-gray-400" style={{ opacity: isToday ? 1 : 0 }}>
              Peak
            </span>
            <div className="relative w-full flex flex-col justify-end" style={{ height: '112px' }}>
              <div
                style={{ height: `${pct}%` }}
                className={`w-full rounded-t-lg transition-all duration-700 ${
                  isToday
                    ? 'bg-gradient-to-t from-[#0D1B2A] to-[#1e3a5f]'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              />
              {isToday && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </div>
            <span className={`text-[10px] font-semibold ${isToday ? 'text-[#0D1B2A]' : 'text-gray-400'}`}>
              {days[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Occupancy Ring ───────────────────────────────────────────
const OccupancyRing: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 36, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke="#0D1B2A" strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-black text-[#0D1B2A] leading-none">{pct}%</p>
        <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Occupied</p>
      </div>
    </div>
  );
};

// ── Status Pill ──────────────────────────────────────────────
const StatusPill: React.FC<{ status?: string }> = ({ status }) => {
  const s = status?.toLowerCase() ?? 'pending';
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Confirmed' },
    pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   label: 'Pending' },
    cancelled: { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400',     label: 'Cancelled' },
  };
  const cfg = map[s] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ── Admin Dashboard ──────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [bookings,       setBookings]       = useState<Booking[]>([]);
  const [rooms,          setRooms]          = useState<Room[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [bookingSearch,  setBookingSearch]  = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/bookings', { headers: getHeaders() }),
          axios.get('http://127.0.0.1:8000/api/rooms'),
        ]);
        setBookings(bRes.data.data ?? []);
        setRooms(rRes.data.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRevenue  = bookings.reduce((s, b) => s + (parseFloat(String(b.total_price)) || 0), 0);
  const activeRooms   = rooms.filter(r => r.status === 'Confirmed').length;
  const occupancyPct  = rooms.length ? Math.round((activeRooms / rooms.length) * 100) : 0;

  // Search filter — applied to recent bookings list
  const filteredBookings = bookings
    .filter(b => {
      const q = bookingSearch.toLowerCase();
      return (
        b.customer_name?.toLowerCase().includes(q) ||
        b.room?.name?.toLowerCase().includes(q) ||
        b.status?.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  const topRooms = rooms.filter(r => r.status === 'Confirmed').slice(0, 3);

  const stats = [
    {
      label: 'Total Revenue',
      value: fmt(totalRevenue),
      sub: 'Semua booking',
      trend: '+18%',
      up: true,
      spark: [30, 42, 35, 58, 48, 72, 65],
      accent: '#0D1B2A',
      icon: <DollarSign size={18} />,
    },
    {
      label: 'Active Bookings',
      value: bookings.length,
      sub: 'Transaksi masuk',
      trend: '+8%',
      up: true,
      spark: [12, 18, 14, 22, 19, 28, 24],
      accent: '#1e40af',
      icon: <CalendarCheck size={18} />,
    },
    {
      label: 'Total Rooms',
      value: rooms.length,
      sub: `${activeRooms} aktif`,
      trend: '+2',
      up: true,
      spark: [8, 8, 9, 9, 10, 10, rooms.length || 10],
      accent: '#065f46',
      icon: <DoorOpen size={18} />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            SPOTLY — Admin Console
          </p>
          <h1 className="text-[28px] font-black text-[#0D1B2A] leading-tight tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">Sistem Online</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: s.accent }}
              >
                {s.icon}
              </div>
              <Sparkline data={s.spark} color={s.accent} />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-black text-[#0D1B2A] leading-none mb-2">{loading ? '—' : s.value}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{s.sub}</span>
              <span className={`flex items-center gap-0.5 text-xs font-bold ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {s.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid: Chart + Occupancy ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue Chart — 2 cols */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#0D1B2A]">Revenue Minggu Ini</h2>
              <p className="text-xs text-gray-400">Performa harian 7 hari terakhir</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/bookings')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <BarChart2 size={12} /> Lihat Bookings
            </button>
          </div>
          <RevenueChart />
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total periode ini</p>
              <p className="text-lg font-black text-[#0D1B2A]">{loading ? '—' : fmt(totalRevenue)}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <TrendingUp size={12} /> +18% dari minggu lalu
            </div>
          </div>
        </section>

        {/* Occupancy Panel — 1 col */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h2 className="text-base font-bold text-[#0D1B2A] mb-1">Occupancy Rate</h2>
          <p className="text-xs text-gray-400 mb-5">Persentase ruangan aktif</p>

          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <OccupancyRing pct={loading ? 0 : occupancyPct} />

            <div className="w-full space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-gray-600 font-medium">Aktif</span>
                </div>
                <span className="font-bold text-[#0D1B2A]">{activeRooms} ruang</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-400" />
                  <span className="text-gray-600 font-medium">Maintenance</span>
                </div>
                <span className="font-bold text-[#0D1B2A]">
                  {rooms.filter(r => r.status === 'Maintenance').length} ruang
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Inactive</span>
                </div>
                <span className="font-bold text-[#0D1B2A]">
                  {rooms.filter(r => r.status === 'Inactive').length} ruang
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/rooms')}
            className="mt-5 w-full py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Kelola Ruangan →
          </button>
        </section>
      </div>

      {/* ── Bottom Grid: Recent Bookings + Top Rooms ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent Bookings — 3 cols */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-base font-bold text-[#0D1B2A]">Booking Terbaru</h2>
              <p className="text-xs text-gray-400">5 transaksi terakhir</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/bookings')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0D1B2A] hover:underline"
            >
              Lihat Semua <ArrowRight size={12} />
            </button>
          </div>

          {/* Search bar booking */}
          <div className="px-5 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                placeholder="Cari nama pelanggan, ruangan, atau status..."
                className="flex-1 bg-transparent text-sm text-[#0D1B2A] outline-none placeholder:text-gray-400"
              />
              {bookingSearch && (
                <button
                  onClick={() => setBookingSearch('')}
                  className="text-gray-400 hover:text-gray-600 text-xs font-semibold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              {bookingSearch ? `Tidak ada hasil untuk "${bookingSearch}"` : 'Belum ada booking masuk'}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredBookings.map(b => (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-black text-[#0D1B2A] shrink-0">
                    {b.customer_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D1B2A] truncate">{b.customer_name}</p>
                    <p className="text-xs text-gray-400 truncate">{b.room?.name ?? 'Unknown Room'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-sm font-bold text-[#0D1B2A]">{fmt(parseFloat(String(b.total_price)) || 0)}</p>
                    <StatusPill status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top Rooms — 2 cols */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-bold text-[#0D1B2A]">Ruangan Aktif</h2>
            <p className="text-xs text-gray-400">Preview ruangan berstatus Confirmed</p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat...</div>
          ) : topRooms.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Belum ada ruangan aktif</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {topRooms.map(room => (
                <div key={room.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {room.image_url ? (
                      <img
                        src={room.image_url}
                        alt={room.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <DoorOpen size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D1B2A] truncate">{room.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={10} /> {room.location ?? '-'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#0D1B2A]">{fmt(room.price_daily ?? 0)}</p>
                    <p className="text-[10px] text-gray-400">/hari</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 pb-5 pt-3">
            <button
              onClick={() => navigate('/dashboard/rooms')}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#0D1B2A] text-white rounded-xl text-xs font-bold hover:bg-[#162437] transition-colors"
            >
              Kelola Semua Ruangan <ArrowRight size={12} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

// import React, { useEffect, useState } from 'react';
// import {
//   DoorOpen, CalendarCheck, DollarSign, Plus,
//   ChevronLeft, ChevronRight, BarChart2,
//   X, Save, Trash2, Pencil, AlertTriangle
// } from 'lucide-react';
// import axios from 'axios';
// import { StatCard } from '../components/ui/StatCard';
// import { Badge, statusVariant } from '../components/ui/Badge';
// import { Button } from '../components/ui/Button';

// // ── Types ───────────────────────────────────────────────────
// interface Room {
//   id: number;
//   name: string;
//   category_id: number;
//   location: string;
//   description: string;
//   price_daily: number;
//   price_monthly: number;
//   price_yearly: number;
//   image_url: string;
//   status: 'Confirmed' | 'Maintenance' | 'Inactive';
// }

// interface Booking {
//   id: string;
//   customer_name: string;
//   room?: { name: string };
//   total_price: number;
//   created_at: string;
// }

// // ── Category map ───────────────────────────────────────────
// const CATEGORIES: { id: number; label: string }[] = [
//   { id: 1, label: 'Studio Foto' },
//   { id: 2, label: 'Meeting Room' },
//   { id: 3, label: 'Coworking' },
//   { id: 4, label: 'Boardroom' },
// ];

// const getCategoryLabel = (id: number) =>
//   CATEGORIES.find(c => c.id === id)?.label ?? `Category ${id}`;

// // ── Revenue Chart ───────────────────────────────────────────
// const revenueData = [32, 45, 38, 60, 52, 78, 65];
// const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// const RevenueChart: React.FC = () => (
//   <div className="flex items-end gap-2 h-28 px-1 pt-2">
//     {revenueData.map((v, i) => {
//       const height = Math.round((v / Math.max(...revenueData)) * 100);
//       return (
//         <div key={i} className="flex flex-col items-center gap-1 flex-1">
//           <div
//             style={{ height: `${height}%` }}
//             className={`w-full rounded-t-lg transition-all duration-300 ${
//               i === 5 ? 'bg-[#0D1B2A]' : 'bg-gray-200 hover:bg-gray-300'
//             }`}
//           />
//           <span className="text-[10px] text-gray-400">{days[i]}</span>
//         </div>
//       );
//     })}
//   </div>
// );

// // ── Room Modal (Add & Edit) ─────────────────────────────────
// interface RoomForm {
//   name: string;
//   category_id: number;
//   location: string;
//   description: string;
//   price_daily: number;
//   price_monthly: number;
//   price_yearly: number;
//   image_url: string;
//   status: 'Confirmed' | 'Maintenance' | 'Inactive';
// }

// function RoomModal({
//   room,
//   onSave,
//   onClose,
// }: {
//   room?: Room | null;
//   onSave: () => void;
//   onClose: () => void;
// }) {
//   const isEdit = !!room;
//   const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop';

//   const [form, setForm] = useState<RoomForm>({
//     name:          room?.name          ?? '',
//     category_id:   room?.category_id   ?? CATEGORIES[0].id,
//     location:      room?.location      ?? '',
//     description:   room?.description   ?? '',
//     price_daily:   room?.price_daily   ?? 200000,
//     price_monthly: room?.price_monthly ?? 5000000,
//     price_yearly:  room?.price_yearly  ?? 50000000,
//     image_url:     room?.image_url     ?? '',
//     status:        room?.status        ?? 'Confirmed',
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError]     = useState('');

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setForm(f => ({
//       ...f,
//       [name]: ['category_id', 'price_daily', 'price_monthly', 'price_yearly'].includes(name)
//         ? Number(value)
//         : value,
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!form.name.trim() || !form.location.trim()) {
//       setError('Nama dan lokasi wajib diisi.');
//       return;
//     }
//     setLoading(true);
//     setError('');

//     try {
//       const token   = localStorage.getItem('token');
//       const headers = { Authorization: `Bearer ${token}` };

//       const payload = {
//         name:          form.name,
//         category_id:   Number(form.category_id),
//         location:      form.location,
//         location_room: form.location, 
//         description:   form.description,
//         price_daily:   Number(form.price_daily),
//         price_monthly: Number(form.price_monthly),
//         price_yearly:  Number(form.price_yearly),
//         image_url:     form.image_url.trim() || DEFAULT_IMAGE,
//         status:        form.status,
//       };

//       if (isEdit) {
//         await axios.put(
//           `http://127.0.0.1:8000/api/rooms/${room!.id}`,
//           payload,
//           { headers }
//         );
//       } else {
//         await axios.post('http://127.0.0.1:8000/api/rooms', payload, { headers });
//       }

//       onSave();
//       onClose();
//     } catch (err: any) {
//       const msg =
//         err.response?.data?.message ??
//         err.response?.data?.error ??
//         'Gagal menyimpan. Cek koneksi backend atau token.';
//       setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <h3 className="font-bold text-[#0D1B2A]">
//             {isEdit ? 'Edit Room' : 'Add New Room'}
//           </h3>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
//           >
//             <X size={18} className="text-gray-500" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-4 space-y-4">
//           {error && (
//             <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 whitespace-pre-wrap">
//               {error}
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-4">
//             <div className="col-span-2">
//               <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
//                 Nama Ruangan *
//               </label>
//               <input
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 placeholder="e.g. Elite Boardroom"
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
//               />
//             </div>

//             <div>
//               <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
//                 Kategori
//               </label>
//               <select
//                 name="category_id"
//                 value={form.category_id}
//                 onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
//               >
//                 {CATEGORIES.map(c => (
//                   <option key={c.id} value={c.id}>
//                     {c.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
//                 Status
//               </label>
//               <select
//                 name="status"
//                 value={form.status}
//                 onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
//               >
//                 {(['Confirmed', 'Maintenance', 'Inactive'] as const).map(s => (
//                   <option key={s}>{s}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="col-span-2">
//               <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
//                 Lokasi *
//               </label>
//               <input
//                 name="location"
//                 value={form.location}
//                 onChange={handleChange}
//                 placeholder="e.g. SCBD, Jakarta"
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
//               />
//             </div>

//             <div className="col-span-2">
//               <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
//                 Deskripsi
//               </label>
//               <textarea
//                 name="description"
//                 value={form.description}
//                 onChange={handleChange}
//                 rows={3}
//                 placeholder="Deskripsi ruangan..."
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20 resize-none"
//               />
//             </div>

//             <div className="col-span-2">
//               <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
//                 URL Gambar
//               </label>
//               <input
//                 name="image_url"
//                 value={form.image_url}
//                 onChange={handleChange}
//                 placeholder="https://images.unsplash.com/..."
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
//               />
//             </div>

//             <div>
//               <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
//                 Harga Harian (Rp)
//               </label>
//               <input
//                 name="price_daily"
//                 type="number"
//                 value={form.price_daily}
//                 onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
//               />
//             </div>

//             <div>
//               <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
//                 Harga Bulanan (Rp)
//               </label>
//               <input
//                 name="price_monthly"
//                 type="number"
//                 value={form.price_monthly}
//                 onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
//               />
//             </div>

//             <div>
//               <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
//                 Harga Tahunan (Rp)
//               </label>
//               <input
//                 name="price_yearly"
//                 type="number"
//                 value={form.price_yearly}
//                 onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 pb-5 flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50"
//           >
//             Batal
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="flex-1 py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#162437] disabled:opacity-50"
//           >
//             <Save size={14} /> {loading ? 'Menyimpan...' : 'Simpan'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Admin Dashboard ─────────────────────────────────────────
// export const AdminDashboard: React.FC = () => {
//   const [rooms,         setRooms]       = useState<Room[]>([]);
//   const [bookings,      setBookings]    = useState<Booking[]>([]);
//   const [loading,       setLoading]     = useState(true);
//   const [currentPage,   setCurrentPage] = useState(1);
//   const [showModal,     setShowModal]   = useState(false);
//   const [editRoom,      setEditRoom]    = useState<Room | null>(null);
//   const [roomToDelete,  setRoomToDelete] = useState<Room | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   const ITEMS_PER_PAGE = 5;

//   const getHeaders = () => ({
//     Authorization: `Bearer ${localStorage.getItem('token')}`,
//   });

//   const fetchRooms = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get('http://127.0.0.1:8000/api/rooms');
//       const raw: any[] = res.data.data ?? [];

//       const mapped: Room[] = raw.map(r => ({
//         id:            r.id,
//         name:          r.name          ?? '',
//         category_id:   r.category_id   ?? 1,
//         location:      r.location      ?? r.location_room ?? r.room_location ?? '-', 
//         description:   r.description   ?? '',
//         price_daily:   r.price_daily   ?? 0,
//         price_monthly: r.price_monthly ?? 0,
//         price_yearly:  r.price_yearly  ?? 0,
//         image_url:     r.image_url     ?? r.image ?? 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
//         status:        r.status        ?? 'Confirmed',
//       }));

//       setRooms(mapped);
//     } catch (err: any) {
//       console.error('[fetchRooms]', err.response?.data ?? err.message);
//       setRooms([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBookings = async () => {
//     try {
//       const res = await axios.get('http://127.0.0.1:8000/api/bookings', {
//         headers: getHeaders(),
//       });
//       setBookings(res.data.data?.slice(0, 4) ?? []);
//     } catch (err: any) {
//       console.error('[fetchBookings]', err.response?.data ?? err.message);
//       setBookings([]);
//     }
//   };

//   useEffect(() => {
//     fetchRooms();
//     fetchBookings();
//   }, []);

//   const handleConfirmDelete = async () => {
//     if (!roomToDelete) return;
//     setDeleteLoading(true);
//     try {
//       await axios.delete(`http://127.0.0.1:8000/api/rooms/${roomToDelete.id}`, {
//         headers: getHeaders(),
//       });
      
//       setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
//       setCurrentPage(1);
//       fetchRooms();
//       setRoomToDelete(null);
//     } catch (err: any) {
//       const msg =
//         err.response?.data?.message ??
//         err.response?.data?.error ??
//         'Gagal menghapus ruangan.';
//       alert(`Error: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
//       console.error('[handleDeleteRoom]', err.response?.data ?? err.message);
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   const totalPages     = Math.max(1, Math.ceil(rooms.length / ITEMS_PER_PAGE));
//   const paginatedRooms = rooms.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );

//   const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price ?? 0), 0);
//   const statCards = [
//     {
//       title: 'Total Rooms',
//       value: rooms.length,
//       trend: '+12%', trendLabel: 'from last month', isPositive: true,
//       icon: <DoorOpen size={20} />,
//     },
//     {
//       title: 'Active Bookings',
//       value: bookings.length,
//       trend: '+8%', trendLabel: 'since yesterday', isPositive: true,
//       icon: <CalendarCheck size={20} />,
//     },
//     {
//       title: 'Monthly Revenue',
//       value: 'Rp ' + totalRevenue.toLocaleString('id-ID'),
//       trend: '+18%', trendLabel: 'target achievement', isPositive: true,
//       icon: <DollarSign size={20} />,
//     },
//   ];

//   return (
//     <div className="max-w-7xl mx-auto space-y-6">
//       {/* Title */}
//       <div>
//         <h1 className="text-2xl font-bold text-[#0D1B2A] tracking-tight">Dashboard Overview</h1>
//         <p className="text-sm text-gray-500 mt-0.5">
//           Welcome back, Admin. Here's what's happening today at SPOTLY.
//         </p>
//       </div>

//       {/* Stat Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {statCards.map(card => (
//           <StatCard
//             key={card.title}
//             title={card.title}
//             value={card.value}
//             trend={card.trend}
//             trendLabel={card.trendLabel}
//             isPositive={card.isPositive}
//             icon={card.icon}
//           />
//         ))}
//       </div>

//       {/* Room Management */}
//       <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//         <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//           <div>
//             <h2 className="text-base font-bold text-[#0D1B2A]">Room Management</h2>
//             <p className="text-xs text-gray-500 mt-0.5">Update and monitor your available spaces</p>
//           </div>
//           <Button
//             variant="primary"
//             size="sm"
//             leftIcon={<Plus size={14} />}
//             onClick={() => { setEditRoom(null); setShowModal(true); }}
//           >
//             Add New Room
//           </Button>
//         </div>

//         {/* Mobile Cards */}
//         <div className="md:hidden divide-y divide-gray-50">
//           {loading ? (
//             <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
//           ) : paginatedRooms.length === 0 ? (
//             <div className="p-8 text-center text-gray-400 text-sm">
//               Belum ada ruangan. Klik Add New Room.
//             </div>
//           ) : (
//             paginatedRooms.map(room => (
//               <div key={room.id} className="p-4 flex gap-3">
//                 <img
//                   src={room.image_url}
//                   alt={room.name}
//                   className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100"
//                   onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56'; }}
//                 />
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between gap-2 mb-1">
//                     <div>
//                       <p className="text-sm font-semibold text-[#0D1B2A]">{room.name}</p>
//                       <p className="text-xs text-gray-400">
//                         {getCategoryLabel(room.category_id)} · {room.location}
//                       </p>
//                     </div>
//                     <Badge variant={statusVariant(room.status)} size="sm">{room.status}</Badge>
//                   </div>
//                   <p className="text-xs font-bold text-[#0D1B2A]">
//                     Rp {room.price_daily.toLocaleString('id-ID')}/hari
//                   </p>
//                   <div className="flex gap-2 mt-2">
//                     <Button
//                       variant="primary"
//                       size="sm"
//                       leftIcon={<Pencil size={12} />}
//                       onClick={() => { setEditRoom(room); setShowModal(true); }}
//                     >
//                       Edit
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       leftIcon={<Trash2 size={12} />}
//                       onClick={() => setRoomToDelete(room)}
//                     >
//                       Hapus
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Desktop Table */}
//         <div className="hidden md:block overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-100">
//                 {['ROOM SPACE', 'CATEGORY', 'PRICING', 'STATUS', 'ACTIONS'].map(col => (
//                   <th
//                     key={col}
//                     className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest"
//                   >
//                     {col}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {loading ? (
//                 <tr>
//                   <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
//                     Memuat data dari server...
//                   </td>
//                 </tr>
//               ) : paginatedRooms.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
//                     Belum ada ruangan. Klik "Add New Room" untuk menambah.
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedRooms.map(room => (
//                   <tr key={room.id} className="hover:bg-gray-50/60 transition-colors">
//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-3">
//                         <img
//                           src={room.image_url}
//                           alt={room.name}
//                           className="w-10 h-10 rounded-xl object-cover bg-gray-100"
//                           onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40'; }}
//                         />
//                         <div>
//                           <p className="text-sm font-semibold text-[#0D1B2A]">{room.name}</p>
//                           <p className="text-xs text-gray-400">{room.location} · ID: {room.id}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-5 py-4 text-sm text-gray-600">
//                       {getCategoryLabel(room.category_id)}
//                     </td>
//                     <td className="px-5 py-4">
//                       <p className="text-sm font-semibold text-[#0D1B2A]">
//                         Rp {room.price_daily.toLocaleString('id-ID')} / Hari
//                       </p>
//                       <p className="text-xs text-gray-400">
//                         Rp {room.price_monthly.toLocaleString('id-ID')} / Bulan
//                       </p>
//                     </td>
//                     <td className="px-5 py-4">
//                       <Badge variant={statusVariant(room.status)}>{room.status}</Badge>
//                     </td>
//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="primary"
//                           size="sm"
//                           leftIcon={<Pencil size={12} />}
//                           onClick={() => { setEditRoom(room); setShowModal(true); }}
//                         >
//                           Edit
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           leftIcon={<Trash2 size={12} />}
//                           onClick={() => setRoomToDelete(room)}
//                         >
//                           Hapus
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
//           <p className="text-xs text-gray-400">
//             Showing{' '}
//             {rooms.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
//             {Math.min(currentPage * ITEMS_PER_PAGE, rooms.length)} of {rooms.length} rooms
//           </p>
//           <div className="flex items-center gap-1">
//             <button
//               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
//             >
//               <ChevronLeft size={15} />
//             </button>
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//               <button
//                 key={page}
//                 onClick={() => setCurrentPage(page)}
//                 className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
//                   currentPage === page
//                     ? 'bg-[#0D1B2A] text-white'
//                     : 'text-gray-500 hover:bg-gray-100'
//                 }`}
//               >
//                 {page}
//               </button>
//             ))}
//             <button
//               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
//             >
//               <ChevronRight size={15} />
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Charts & Recent Bookings */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//           <div className="flex items-center justify-between mb-2">
//             <div>
//               <h2 className="text-base font-bold text-[#0D1B2A]">Revenue Trends</h2>
//               <p className="text-xs text-gray-400 mt-0.5">Weekly performance analysis</p>
//             </div>
//             <div className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer hover:bg-gray-50">
//               <BarChart2 size={13} /> Last 7 Days
//             </div>
//           </div>
//           <RevenueChart />
//         </section>

//         <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//           <h2 className="text-base font-bold text-[#0D1B2A] mb-4">Recent Bookings</h2>
//           {bookings.length === 0 ? (
//             <div className="text-center py-6">
//               <p className="text-sm text-gray-400">Belum ada booking masuk</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {bookings.map(booking => (
//                 <div key={booking.id} className="flex items-center gap-3">
//                   <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-[#0D1B2A] shrink-0">
//                     {booking.customer_name?.charAt(0)?.toUpperCase() ?? '?'}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-[#0D1B2A] truncate">
//                       {booking.customer_name}
//                     </p>
//                     <p className="text-xs text-gray-400 truncate">
//                       Booked {booking.room?.name ?? '-'}
//                     </p>
//                   </div>
//                   <div className="text-right shrink-0">
//                     <p className="text-sm font-bold text-[#0D1B2A]">
//                       Rp {(booking.total_price ?? 0).toLocaleString('id-ID')}
//                     </p>
//                     <p className="text-[11px] text-gray-400">
//                       {new Date(booking.created_at).toLocaleDateString('id-ID')}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//           <Button variant="outline" size="sm" fullWidth className="mt-5">
//             View All Bookings
//           </Button>
//         </section>
//       </div>

//       {/* Modal Add / Edit */}
//       {showModal && (
//         <RoomModal
//           room={editRoom}
//           onSave={() => {
//             fetchRooms();
//             setCurrentPage(1);
//           }}
//           onClose={() => { setShowModal(false); setEditRoom(null); }}
//         />
//       )}

//       {/* ── CUSTOM DELETE CONFIRMATION MODAL ── */}
//       {roomToDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100 text-center animate-fade-in">
//             <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
//               <AlertTriangle size={24} />
//             </div>

//             <h3 className="text-base font-bold text-[#0D1B2A] mb-1">Hapus Ruangan?</h3>
//             <p className="text-xs text-gray-500 leading-relaxed px-2">
//               Apakah kamu yakin ingin menghapus <span className="font-semibold text-gray-800">"{roomToDelete.name}"</span>? Tindakan ini tidak bisa dibatalkan.
//             </p>

//             <div className="grid grid-cols-2 gap-3 mt-6">
//               <button
//                 onClick={() => setRoomToDelete(null)}
//                 disabled={deleteLoading}
//                 className="py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
//               >
//                 Batal
//               </button>
//               <button
//                 onClick={handleConfirmDelete}
//                 disabled={deleteLoading}
//                 className="py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
//               >
//                 {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;