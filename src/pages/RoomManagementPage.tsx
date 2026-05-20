import React, { useEffect, useState } from 'react';
import {
  Plus, ChevronLeft, ChevronRight,
  X, Save, Trash2, Pencil, AlertTriangle,
} from 'lucide-react';
import axios from 'axios';
import { Badge, statusVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

// ── Types ────────────────────────────────────────────────────
interface Room {
  id: number;
  name: string;
  category_id: number;
  location: string;
  description: string;
  price_daily: number;
  price_monthly: number;
  price_yearly: number;
  image_url: string;
  status: 'Confirmed' | 'Maintenance' | 'Inactive';
}

interface Category {
  id: number;
  name: string;
}

interface RoomForm {
  name: string;
  category_id: number;
  location: string;
  description: string;
  price_daily: number;
  price_monthly: number;
  price_yearly: number;
  image_url: string;
  status: 'Confirmed' | 'Maintenance' | 'Inactive';
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop';
const ITEMS_PER_PAGE = 10;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ── Room Modal ───────────────────────────────────────────────
function RoomModal({
  room,
  categories,
  onSave,
  onClose,
}: {
  room?: Room | null;
  categories: Category[];
  onSave: () => void;
  onClose: () => void;
}) {
  const isEdit = !!room;

  const [form, setForm] = useState<RoomForm>({
    name:          room?.name          ?? '',
    category_id:   room?.category_id   ?? (categories[0]?.id ?? 1),
    location:      room?.location      ?? '',
    description:   room?.description   ?? '',
    price_daily:   room?.price_daily   ?? 200000,
    price_monthly: room?.price_monthly ?? 5000000,
    price_yearly:  room?.price_yearly  ?? 50000000,
    image_url:     room?.image_url     ?? '',
    status:        room?.status        ?? 'Confirmed',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: ['category_id', 'price_daily', 'price_monthly', 'price_yearly'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.location.trim()) {
      setError('Nama dan lokasi wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        category_id:   Number(form.category_id),
        price_daily:   Number(form.price_daily),
        price_monthly: Number(form.price_monthly),
        price_yearly:  Number(form.price_yearly),
        image_url:     form.image_url.trim() || DEFAULT_IMAGE,
      };

      const config = { headers: getHeaders() };

      if (isEdit) {
        await axios.put(`http://127.0.0.1:8000/api/rooms/${room!.id}`, payload, config);
      } else {
        await axios.post('http://127.0.0.1:8000/api/rooms', payload, config);
      }

      onSave();
      onClose();
    } catch (err: any) {
      const errorData = err.response?.data;
      const msg =
        errorData?.message ??
        (typeof errorData?.error === 'string' ? errorData.error : 'Gagal menyimpan.');
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#0D1B2A]">{isEdit ? 'Edit Room' : 'Add New Room'}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
                Nama Ruangan *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Elite Boardroom"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Kategori</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
              >
                {(['Confirmed', 'Maintenance', 'Inactive'] as const).map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Lokasi *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. SCBD, Jakarta"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Deskripsi ruangan..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20 resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">URL Gambar</label>
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
                Harga Harian (Rp)
              </label>
              <input
                name="price_daily"
                type="number"
                value={form.price_daily}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
                Harga Bulanan (Rp)
              </label>
              <input
                name="price_monthly"
                type="number"
                value={form.price_monthly}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">
                Harga Tahunan (Rp)
              </label>
              <input
                name="price_yearly"
                type="number"
                value={form.price_yearly}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#162437] disabled:opacity-50"
          >
            <Save size={14} /> {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function RoomManagementPage() {
  const [rooms,         setRooms]         = useState<Room[]>([]);
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [showModal,     setShowModal]     = useState(false);
  const [editRoom,      setEditRoom]      = useState<Room | null>(null);
  const [roomToDelete,  setRoomToDelete]  = useState<Room | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search,        setSearch]        = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/rooms');
      const raw = res.data.data ?? [];
      setRooms(Array.isArray(raw) ? raw : []);
    } catch (err: any) {
      console.error('[fetchRooms]', err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/categories');
      setCategories(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchCategories();
  }, []);

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/rooms/${roomToDelete.id}`, {
        headers: getHeaders(),
      });
      await fetchRooms();
      setCurrentPage(1);
      setRoomToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Gagal menghapus ruangan.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryName = (id: number) =>
    categories.find(c => c.id === id)?.name ?? `Category ${id}`;

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages    = Math.max(1, Math.ceil(filteredRooms.length / ITEMS_PER_PAGE));
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Room Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola semua ruangan yang tersedia</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => { setEditRoom(null); setShowModal(true); }}
        >
          Add New Room
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Cari nama ruangan atau lokasi..."
          className="flex-1 bg-transparent text-sm text-[#0D1B2A] outline-none"
        />
      </div>

      {/* Table */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
          ) : paginatedRooms.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tidak ada ruangan ditemukan.</div>
          ) : (
            paginatedRooms.map(room => (
              <div key={room.id} className="p-4 flex gap-3">
                <img
                  src={room.image_url}
                  alt={room.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                  onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-semibold text-[#0D1B2A]">{room.name}</p>
                      <p className="text-xs text-gray-400">
                        {getCategoryName(room.category_id)} · {room.location}
                      </p>
                    </div>
                    <Badge variant={statusVariant(room.status)} size="sm">{room.status}</Badge>
                  </div>
                  <p className="text-xs font-bold text-[#0D1B2A]">
                    Rp {room.price_daily.toLocaleString('id-ID')}/hari
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Pencil size={12} />}
                      onClick={() => { setEditRoom(room); setShowModal(true); }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Trash2 size={12} />}
                      onClick={() => setRoomToDelete(room)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ROOM SPACE', 'CATEGORY', 'PRICING', 'STATUS', 'ACTIONS'].map(col => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedRooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Tidak ada ruangan ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedRooms.map(room => (
                  <tr key={room.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={room.image_url}
                          alt={room.name}
                          className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                          onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#0D1B2A]">{room.name}</p>
                          <p className="text-xs text-gray-400">{room.location} · ID: {room.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {getCategoryName(room.category_id)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#0D1B2A]">
                        Rp {room.price_daily.toLocaleString('id-ID')} / Hari
                      </p>
                      <p className="text-xs text-gray-400">
                        Rp {room.price_monthly.toLocaleString('id-ID')} / Bulan
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant(room.status)}>{room.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Pencil size={12} />}
                          onClick={() => { setEditRoom(room); setShowModal(true); }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Trash2 size={12} />}
                          onClick={() => setRoomToDelete(room)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing{' '}
            {filteredRooms.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredRooms.length)} of {filteredRooms.length} rooms
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === page ? 'bg-[#0D1B2A] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Modal Add/Edit */}
      {showModal && (
        <RoomModal
          room={editRoom}
          categories={categories}
          onSave={() => { fetchRooms(); setCurrentPage(1); }}
          onClose={() => { setShowModal(false); setEditRoom(null); }}
        />
      )}

      {/* Modal Delete Confirm */}
      {roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[#0D1B2A] mb-1">Hapus Ruangan?</h3>
            <p className="text-xs text-gray-500 px-2">
              Yakin mau hapus{' '}
              <span className="font-semibold text-gray-800">"{roomToDelete.name}"</span>?
              Ini tidak bisa dibatalkan.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setRoomToDelete(null)}
                disabled={deleteLoading}
                className="py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs disabled:opacity-50"
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}