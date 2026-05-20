import React, { useState, useEffect } from 'react';
import {
  MapPin, Star, Wifi, Wind, Monitor, Coffee,
  Heart, ArrowLeft, X, Search,
  LayoutGrid, Calendar, User, Loader2, LayoutDashboard
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MyBookings from './MyBookings';
import ProfilePage from './ProfilePage';

// ── CONSTANTS ─────────────────────────────────────────────────
const API_BASE_URL = 'http://localhost:8000/api';
const ADMIN_WA = '6281216654927';
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';

// ── TYPES ─────────────────────────────────────────────────────
type PricingKey = 'harian' | 'bulanan' | 'tahunan';
type NavTab = 'explore' | 'bookings' | 'profile';

interface Room {
  id: number | string;
  name: string;
  category_id: number;
  category?: string;
  location: string | null;
  description: string;
  image_url: string | null;
  status: string;
  price_daily: number;
  price_monthly: number;
  price_yearly: number;
  rating?: number | string;
  amenities?: string | string[];
}

interface Category {
  id: number;
  name: string;
}

// ── AXIOS INSTANCE ────────────────────────────────────────────
const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── HELPERS ───────────────────────────────────────────────────
function formatRp(n: number) {
  return 'Rp ' + (n ? n.toLocaleString('id-ID') : '0');
}

function getRoomPrice(room: Room, key: PricingKey): number {
  if (!room) return 0;
  if (key === 'harian') return Number(room.price_daily) || 0;
  if (key === 'bulanan') return Number(room.price_monthly) || 0;
  if (key === 'tahunan') return Number(room.price_yearly) || 0;
  return 0;
}

function amenityIcon(name: string) {
  const n = name?.toLowerCase() || '';
  if (n.includes('wi') || n.includes('wifi')) return <Wifi size={16} />;
  if (n.includes('ac') || n.includes('climate')) return <Wind size={16} />;
  if (n.includes('projector') || n.includes('monitor')) return <Monitor size={16} />;
  return <Coffee size={16} />;
}

// ── TOP NAV ───────────────────────────────────────────────────
function TopNav({
  activeTab,
  onTabChange,
}: {
  activeTab: NavTab;
  onTabChange: (t: NavTab) => void;
}) {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6 relative">
        {/* Logo — sama seperti sidebar */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-[#0F1C2C] rounded-lg flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-lg tracking-wider leading-none text-[#0F1C2C]">SPOTLY</p>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-0.5">Find Your Space</p>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => onTabChange('explore')}
            className={`text-sm font-bold ${activeTab === 'explore' ? 'text-[#0F1C2C]' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            Explore
          </button>
          {isLoggedIn && (
            <>
              <button
                onClick={() => onTabChange('bookings')}
                className={`text-sm font-bold ${activeTab === 'bookings' ? 'text-[#0F1C2C]' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Bookings
              </button>
              <button
                onClick={() => onTabChange('profile')}
                className={`text-sm font-bold ${activeTab === 'profile' ? 'text-[#0F1C2C]' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Profile
              </button>
            </>
          )}
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <p className="hidden sm:block text-xs font-semibold text-[#0F1C2C]">{user?.name}</p>
              <div
                className="w-9 h-9 rounded-full bg-[#0F1C2C] flex items-center justify-center cursor-pointer"
                onClick={() => onTabChange('profile')}
              >
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="hidden sm:block text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-semibold text-[#0F1C2C] hover:bg-gray-100 rounded-xl transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-semibold bg-[#0F1C2C] text-white rounded-xl hover:bg-[#162437] transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────
function BottomNav({
  active,
  onChange,
}: {
  active: NavTab;
  onChange: (t: NavTab) => void;
}) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const tabs: { key: NavTab; label: string; icon: React.ReactNode; requireAuth: boolean }[] = [
    { key: 'explore', label: 'Explore', icon: <LayoutGrid size={20} />, requireAuth: false },
    { key: 'bookings', label: 'Bookings', icon: <Calendar size={20} />, requireAuth: true },
    { key: 'profile', label: 'Profile', icon: <User size={20} />, requireAuth: true },
  ];

  const handleTab = (tab: typeof tabs[0]) => {
    if (tab.requireAuth && !isLoggedIn) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    onChange(tab.key);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg md:hidden">
      <div className="flex justify-around items-stretch">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTab(t)}
            className={`flex flex-col items-center justify-center gap-1 py-3 flex-1 transition-colors ${active === t.key ? 'text-[#0F1C2C]' : 'text-gray-400'
              }`}
          >
            {t.icon}
            <span className="text-[10px] font-semibold">{t.label}</span>
            {active === t.key && <span className="w-1 h-1 rounded-full bg-[#0F1C2C]" />}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── AUTH GATE MODAL ───────────────────────────────────────────
function AuthGateModal({
  onClose,
  onGoLogin,
}: {
  onClose: () => void;
  onGoLogin: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 pb-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          🔐
        </div>
        <h3 className="text-lg font-bold text-[#0F1C2C] mb-1">Login Dulu, Ya!</h3>
        <p className="text-xs text-gray-500 mb-6 px-4">
          Kamu perlu login untuk melakukan pemesanan ruangan.
        </p>
        <button
          onClick={onGoLogin}
          className="w-full py-3.5 bg-[#0F1C2C] text-white rounded-2xl font-semibold text-sm hover:bg-[#162437] transition-colors mb-3"
        >
          Login Sekarang
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
        >
          Nanti Dulu
        </button>
      </div>
    </div>
  );
}

// ── BOOKING MODAL ─────────────────────────────────────────────
function BookingModal({
  room,
  selectedPricing,
  qty,
  onClose,
}: {
  room: Room;
  selectedPricing: PricingKey;
  qty: number;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unitLabel =
    selectedPricing === 'harian' ? 'hari' : selectedPricing === 'bulanan' ? 'bulan' : 'tahun';
  const currentPrice = getRoomPrice(room, selectedPricing);
  const totalPrice = currentPrice * qty;

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/bookings', {
        room_id: room.id,
        customer_name: name,
        customer_phone: phone,
        pricing_type: selectedPricing,
        qty,
        total_price: totalPrice,
      });
      const msg = encodeURIComponent(
        `Halo Admin SPOTLY! 👋\n\nSaya ingin memesan:\n` +
        `📌 *${room.name}*\n` +
        `📦 Paket: ${selectedPricing.toUpperCase()} x${qty} ${unitLabel}\n` +
        `💰 Total: ${formatRp(totalPrice)}\n` +
        `👤 Nama: ${name}\n` +
        `📱 WA: ${phone}\n\n` +
        `Mohon konfirmasi pesanan saya. Terima kasih!`
      );
      window.open(`https://wa.me/${ADMIN_WA}?text=${msg}`, '_blank');
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal menyimpan booking. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 pb-8 shadow-2xl">
        {done ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h3 className="text-lg font-bold text-[#0F1C2C] mb-1">Booking Terkirim!</h3>
            <p className="text-xs text-gray-500 mb-6 px-4">
              Data tersimpan & WA admin sudah terbuka. Tunggu konfirmasi ya!
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#0F1C2C] text-white rounded-2xl font-semibold text-sm hover:bg-[#162437] transition-colors"
            >
              Tutup
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F1C2C] text-base">Lengkapi Data Pemesanan</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-5">
              <p className="text-xs text-gray-400 mb-1">Ringkasan Pesanan</p>
              <p className="font-bold text-[#0F1C2C]">{room.name}</p>
              <p className="text-xs text-emerald-600 font-semibold uppercase mt-0.5">
                {selectedPricing}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                <p className="text-xs text-gray-500">
                  {qty} {unitLabel} × {formatRp(currentPrice)}
                </p>
                <p className="font-bold text-[#0F1C2C]">{formatRp(totalPrice)}</p>
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl mb-4">{error}</p>
            )}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-[#0F1C2C] block mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama kamu"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F1C2C]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#0F1C2C] block mb-1.5">
                  Nomor WhatsApp
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F1C2C]/20"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !phone.trim() || loading}
              className="w-full py-3.5 bg-[#0F1C2C] text-white rounded-2xl font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#162437] transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Menyimpan...' : 'Pesan via WhatsApp 🚀'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── ROOM DETAIL ───────────────────────────────────────────────
function RoomDetail({
  room,
  categories,
  onBack,
}: {
  room: Room;
  categories: Category[];
  onBack: () => void;
}) {
  const { isLoggedIn } = useAuth();
  const [selected, setSelected] = useState<PricingKey>('harian');
  const [qty, setQty] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [liked, setLiked] = useState(false);

  const unitLabel =
    selected === 'harian' ? 'hari' : selected === 'bulanan' ? 'bulan' : 'tahun';
  const maxQty = selected === 'harian' ? 30 : selected === 'bulanan' ? 24 : 5;
  const currentPrice = getRoomPrice(room, selected);
  const totalPrice = currentPrice * qty;

  const categoryName =
    categories.find((c) => c.id === room.category_id)?.name ?? 'Ruangan';

  const parsedAmenities =
    typeof room.amenities === 'string'
      ? room.amenities.split(',').map((a) => a.trim()).filter(Boolean)
      : Array.isArray(room.amenities)
        ? room.amenities
        : ['Wifi', 'AC', 'Projector'];

  const handlePesanClick = () => {
    if (!isLoggedIn) setShowAuthGate(true);
    else setShowModal(true);
  };

  const handleGoLogin = () => {
    sessionStorage.setItem('redirect_after_login', window.location.pathname);
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 sm:h-80 w-full">
        <img
          src={room.image_url || FALLBACK_IMG}
          alt={room.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
        >
          <ArrowLeft size={18} className="text-[#0F1C2C]" />
        </button>
        <button
          onClick={() => setLiked((l) => !l)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
        >
          <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
        </button>
        <div className="absolute bottom-5 left-6 right-6">
          <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">
            {categoryName}
          </p>
          <h1 className="text-2xl font-bold text-white drop-shadow">{room.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin size={13} className="text-white/80" />
            <span className="text-sm text-white/80">{room.location || 'Jakarta'}</span>
            <span className="ml-auto flex items-center gap-1">
              <Star size={13} className="fill-emerald-400 text-emerald-400" />
              <span className="text-sm font-bold text-white">{room.rating || '5.0'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="space-y-7">
            {parsedAmenities.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Amenities
                </p>
                <div className="flex gap-2 flex-wrap">
                  {parsedAmenities.map((a) => (
                    <div
                      key={a}
                      className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-2xl px-4 py-3 min-w-[76px] shadow-sm"
                    >
                      <span className="text-[#0F1C2C]">{amenityIcon(a)}</span>
                      <span className="text-[10px] font-medium text-gray-600 text-center">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                About This Space
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {room.description || 'Tidak ada deskripsi.'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Lokasi
              </p>
              <div className="bg-gray-200 rounded-2xl h-40 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={24} className="text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-500 font-medium">{room.location || 'Jakarta'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-6">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Rental Period
              </p>
              <div className="space-y-2.5 mb-5">
                {(['harian', 'bulanan', 'tahunan'] as PricingKey[]).map((key) => {
                  const priceVal = getRoomPrice(room, key);
                  if (priceVal === 0 && key !== 'harian') return null;
                  const active = selected === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setSelected(key); setQty(1); }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all text-left ${active
                        ? 'border-[#0F1C2C] bg-[#0F1C2C]/5'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-[#0F1C2C]' : 'border-gray-300'
                            }`}
                        >
                          {active && <div className="w-2.5 h-2.5 rounded-full bg-[#0F1C2C]" />}
                        </div>
                        <p className="text-sm font-semibold text-[#0F1C2C] capitalize">{key}</p>
                      </div>
                      <p className="text-sm font-bold text-[#0F1C2C]">{formatRp(priceVal)}</p>
                    </button>
                  );
                })}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-[#0F1C2C]">Durasi</p>
                  <p className="text-xs text-gray-400">maks. {maxQty} {unitLabel}</p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-100"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#0F1C2C]">{qty}</p>
                    <p className="text-xs text-gray-400">{unitLabel}</p>
                  </div>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Total Payment</p>
                  <p className="text-2xl font-bold text-[#0F1C2C]">{formatRp(totalPrice)}</p>
                  <p className="text-xs text-gray-400">{qty} {unitLabel}</p>
                </div>
              </div>

              <button
                onClick={handlePesanClick}
                className="w-full bg-[#0F1C2C] text-white py-4 rounded-2xl font-semibold hover:bg-[#162437] transition-colors"
              >
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-30 shadow-lg lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">Total Payment</p>
            <p className="text-xl font-bold text-[#0F1C2C]">{formatRp(totalPrice)}</p>
            <p className="text-xs text-gray-400">{qty} {unitLabel}</p>
          </div>
          <button
            onClick={handlePesanClick}
            className="bg-[#0F1C2C] text-white px-8 py-3.5 rounded-2xl font-semibold text-sm shrink-0"
          >
            Pesan Sekarang
          </button>
        </div>
      </div>

      {showAuthGate && (
        <AuthGateModal onClose={() => setShowAuthGate(false)} onGoLogin={handleGoLogin} />
      )}
      {showModal && (
        <BookingModal
          room={room}
          selectedPricing={selected}
          qty={qty}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ── EXPLORE TAB ───────────────────────────────────────────────
function ExploreTab({
  onBook,
  categories,
}: {
  onBook: (r: Room) => void;
  categories: Category[];
}) {
  const [roomsData, setRoomsData] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/rooms`)
      .then((res) => {
        setRoomsData(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCategoryName = (categoryId: number) =>
    categories.find((c) => c.id === categoryId)?.name ?? 'Ruangan';

  const filteredRooms = roomsData.filter((room) => {
    const matchSearch =
      (room.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (room.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === null || room.category_id === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-black text-[#0F1C2C]">Popular Spaces</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Temukan studio dan workspace terbaik pilihanmu
            </p>
          </div>
          <div className="w-full md:max-w-md">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari studio atau ruang meeting..."
                className="w-full bg-transparent text-sm text-[#0F1C2C] outline-none"
              />
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === null
                ? 'bg-[#0F1C2C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat.id
                  ? 'bg-[#0F1C2C] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="animate-spin text-[#0F1C2C]" size={32} />
            <p className="text-xs text-gray-400">Loading data...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            Tidak ada ruangan ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const harianPrice = getRoomPrice(room, 'harian');
              const categoryName = getCategoryName(room.category_id);
              return (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={room.image_url || FALLBACK_IMG}
                      alt={room.name}
                      className="w-full h-52 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                    />
                    <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold text-[#0F1C2C] px-2.5 py-1 rounded-lg uppercase">
                      {categoryName}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#0F1C2C] text-base">{room.name}</h3>
                    <div className="flex items-center gap-1 mt-1 mb-4">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{room.location || 'Jakarta'}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                          Starts From
                        </p>
                        <p className="text-lg font-bold text-[#0F1C2C]">
                          {formatRp(harianPrice)}
                          <span className="text-xs font-normal text-gray-400">/hari</span>
                        </p>
                      </div>
                      <button
                        onClick={() => onBook(room)}
                        className="bg-[#0F1C2C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162437] transition-colors"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function CustomerPage() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!isLoggedIn && (activeTab === 'bookings' || activeTab === 'profile')) {
      setActiveTab('explore');
    }
  }, [isLoggedIn, activeTab]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/categories`)
      .then((res) => {
        setCategories(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedRoom ? (
        <RoomDetail
          room={selectedRoom}
          categories={categories}
          onBack={() => setSelectedRoom(null)}
        />
      ) : (
        <>
          <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'explore' && <ExploreTab onBook={setSelectedRoom} categories={categories} />}
          {activeTab === 'bookings' && isLoggedIn && <MyBookings />}
          {activeTab === 'profile' && isLoggedIn && <ProfilePage />}
          <BottomNav active={activeTab} onChange={setActiveTab} />
        </>
      )}
    </div>
  );
}