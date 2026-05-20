import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, MapPin, Calendar, Clock, X } from 'lucide-react';
import axios from 'axios';

// ── TYPES ────────────────────────────────────────────────────
type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

interface Booking {
  id: number;
  room_id: number;
  user_id: number;
  customer_name: string;
  customer_phone: string;
  pricing_type: 'harian' | 'bulanan' | 'tahunan';
  qty: number;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  room?: {
    id: number;
    name: string;
    location: string | null;
    image_url: string | null;
  };
}

// ── AXIOS INSTANCE ───────────────────────────────────────────
const api = axios.create({ baseURL: 'http://localhost:8000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── HELPERS ──────────────────────────────────────────────────
function formatRp(n: number) {
  return 'Rp ' + (n ? Number(n).toLocaleString('id-ID') : '0');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function pricingLabel(type: string) {
  if (type === 'harian') return 'hari';
  if (type === 'bulanan') return 'bulan';
  return 'tahun';
}

// ── STATUS CONFIG ─────────────────────────────────────────────
const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:   { label: 'Menunggu',     bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  confirmed: { label: 'Dikonfirmasi', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  rejected:  { label: 'Ditolak',      bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400'     },
  cancelled: { label: 'Dibatalkan',   bg: 'bg-gray-100',   text: 'text-gray-500',    dot: 'bg-gray-400'    },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── BOOKING DETAIL MODAL ──────────────────────────────────────
function BookingDetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';

  const rows = [
    { label: 'ID Booking',   value: `#${booking.id}` },
    { label: 'Nama',         value: booking.customer_name },
    { label: 'No. WhatsApp', value: booking.customer_phone },
    { label: 'Ruangan',      value: booking.room?.name ?? `Room #${booking.room_id}` },
    { label: 'Lokasi',       value: booking.room?.location ?? '-' },
    { label: 'Paket',        value: <span className="capitalize">{booking.pricing_type}</span> },
    { label: 'Durasi',       value: `${booking.qty} ${pricingLabel(booking.pricing_type)}` },
    { label: 'Tanggal',      value: formatDate(booking.created_at) },
    { label: 'Total Harga',  value: <span className="font-bold text-[#0F1C2C]">{formatRp(booking.total_price)}</span> },
    { label: 'Status',       value: <StatusBadge status={booking.status} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative h-40">
          <img
            src={booking.room?.image_url || FALLBACK_IMG}
            alt={booking.room?.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"
          >
            <X size={16} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-bold text-base leading-tight">
              {booking.room?.name ?? `Room #${booking.room_id}`}
            </p>
            {booking.room?.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-white/70" />
                <span className="text-white/70 text-xs">{booking.room.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Detail Pesanan</p>
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-xs text-right text-gray-700">{value}</span>
            </div>
          ))}
        </div>

        <div className="px-5 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#0F1C2C] text-white rounded-2xl text-sm font-semibold hover:bg-[#162437] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BOOKING CARD ──────────────────────────────────────────────
function BookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.99]"
    >
      <div className="flex gap-4 p-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <img
            src={booking.room?.image_url || FALLBACK_IMG}
            alt={booking.room?.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-[#0F1C2C] text-sm leading-tight truncate">
              {booking.room?.name ?? `Room #${booking.room_id}`}
            </h3>
            <StatusBadge status={booking.status} />
          </div>
          {booking.room?.location && (
            <div className="flex items-center gap-1 mb-2">
              <MapPin size={11} className="text-gray-400 shrink-0" />
              <span className="text-[11px] text-gray-400 truncate">{booking.room.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Clock size={11} />
            <span>{booking.qty} {pricingLabel(booking.pricing_type)}</span>
            <span className="text-gray-300 mx-0.5">·</span>
            <span className="capitalize">{booking.pricing_type}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 bg-gray-50/50">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Calendar size={11} />
          <span>{formatDate(booking.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-bold text-[#0F1C2C] text-sm">{formatRp(booking.total_price)}</p>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Lihat Detail →</span>
        </div>
      </div>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <span className="text-5xl mb-4">📭</span>
      <h3 className="text-lg font-bold text-[#0F1C2C] mb-1">Belum ada booking</h3>
      <p className="text-xs text-gray-400 max-w-xs">
        Kamu belum pernah memesan ruangan. Yuk, explore dan booking sekarang!
      </p>
    </div>
  );
}

// ── MAIN: MY BOOKINGS ─────────────────────────────────────────
const POLL_INTERVAL = 30_000;

export default function MyBookings() {
  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const [selected, setSelected]         = useState<Booking | null>(null);
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'all'>('all');

  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError(null);
    try {
      const res = await api.get('/bookings');
      const data: Booking[] = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.status === 401 ? 'Sesi kamu habis. Silakan login ulang.' : 'Gagal mengambil data booking.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => fetchBookings(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchBookings(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchBookings]);

  const filters: { key: BookingStatus | 'all'; label: string }[] = [
    { key: 'all',       label: 'Semua'     },
    { key: 'pending',   label: 'Pending'   },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'rejected',  label: 'Rejected'  },
  ];

  const filtered = activeFilter === 'all' ? bookings : bookings.filter(b => b.status === activeFilter);

  return (
    <div className="bg-gray-50 pb-24">

      {/* Header — TIDAK sticky, biar ga nabrak TopNav */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-[#0F1C2C]">Bookings Saya</h1>
            {lastUpdated && (
              <p className="text-[10px] text-gray-400">
                Update terakhir: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchBookings()}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={`text-[#0F1C2C] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="max-w-2xl mx-auto px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeFilter === f.key ? 'bg-[#0F1C2C] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1 opacity-70">({bookings.filter(b => b.status === f.key).length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <Loader2 className="animate-spin text-[#0F1C2C]" size={28} />
            <p className="text-xs text-gray-400">Mengambil data booking...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={() => fetchBookings()} className="px-5 py-2 bg-[#0F1C2C] text-white rounded-xl text-sm font-semibold">
              Coba Lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map(booking => (
            <BookingCard key={booking.id} booking={booking} onClick={() => setSelected(booking)} />
          ))
        )}
      </div>

      {selected && <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}