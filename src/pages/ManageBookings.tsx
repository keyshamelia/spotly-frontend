import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import axios from 'axios';

// ── AXIOS INSTANCE ───────────────────────────────────────────
const api = axios.create({ baseURL: 'http://localhost:8000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── TYPES ────────────────────────────────────────────────────
type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

interface Booking {
  id: number;
  customer_name: string;
  customer_phone: string;
  pricing_type: string;
  qty: number;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  room?: {
    id: number;
    name: string;
  };
}

// ── HELPERS ──────────────────────────────────────────────────
function formatRp(n: number) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected:  'bg-red-50 text-red-600 border border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
};

// ── COMPONENT ────────────────────────────────────────────────
export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // ── FETCH ALL BOOKINGS (ADMIN) ───────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError(null);
    try {
      // GET /api/bookings — karena admin, controller return semua booking
      const res = await api.get('/bookings');
      const data: Booking[] = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      // Sort newest first
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal mengambil data booking.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── UPDATE STATUS ────────────────────────────────────────
  const updateStatus = async (id: number, newStatus: 'confirmed' | 'rejected') => {
    setUpdatingId(id);
    try {
      // PATCH /api/bookings/{id}/status
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      // Update state lokal langsung, ga perlu refetch
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
      );
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Gagal update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Manage Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pantau dan kelola pesanan dari customer</p>
        </div>
        <button
          onClick={() => load()}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2">
          <Loader2 className="animate-spin text-[#0D1B2A]" size={28} />
          <p className="text-xs text-gray-400">Mengambil data booking...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-red-500 font-medium text-sm">{error}</p>
          <button
            onClick={() => load()}
            className="mt-4 px-5 py-2 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold"
          >
            Coba Lagi
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">Belum ada booking masuk</p>
          <p className="text-sm text-gray-400 mt-1">Booking dari customer akan muncul di sini</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['ID', 'Nama Customer', 'No WA', 'Ruangan', 'Paket', 'Qty', 'Tanggal', 'Total Harga', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-gray-400">#{b.id}</td>
                    <td className="px-5 py-4 font-semibold text-sm text-[#0D1B2A]">{b.customer_name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{b.customer_phone}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{b.room?.name ?? '-'}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 capitalize">{b.pricing_type}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{b.qty}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(b.created_at)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#0D1B2A] whitespace-nowrap">{formatRp(b.total_price)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_BADGE[b.status] ?? STATUS_BADGE.pending}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {b.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(b.id, 'confirmed')}
                            disabled={updatingId === b.id}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {updatingId === b.id ? '...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, 'rejected')}
                            disabled={updatingId === b.id}
                            className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                          >
                            {updatingId === b.id ? '...' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useState, useEffect } from 'react';
// import { RefreshCw } from 'lucide-react';

// interface Booking {
//   id: string;
//   customerName: string;
//   customerPhone: string;
//   roomName: string;
//   pricingType: string;
//   totalPrice: number;
//   status: 'Pending' | 'Confirmed' | 'Rejected';
//   date: string;
// }

// function formatRp(n: number) {
//   return 'Rp ' + Number(n).toLocaleString('id-ID');
// }

// export default function ManageBookings() {
//   const [bookings, setBookings] = useState<Booking[]>([]);

//   const load = () => {
//     // AMBIL DATA DARI LOCALSTORAGE
//     const rawData = JSON.parse(localStorage.getItem('spotly_bookings') || '[]');
    
//     // MAPPING DATA BIAR SESUAI DENGAN INTERFACE BOOKING (MENGATASI PERBEDAAN KEY)
//     const normalizedData = rawData.map((b: any) => ({
//       id: b.id || 'BK-' + Math.random().toString(36).substr(2, 9),
//       customerName: b.customer_name || b.customerName || 'Anonim',
//       customerPhone: b.customer_phone || b.customerPhone || '-',
//       roomName: b.room_name || b.roomName || 'Unknown Room',
//       pricingType: b.pricing_type || b.pricingType || '-',
//       totalPrice: b.total_price || b.totalPrice || 0,
//       status: b.status || 'Pending',
//       date: b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')
//     }));

//     setBookings(normalizedData.reverse());
//   };

//   useEffect(() => { load(); }, []);

//   const updateStatus = (id: string, newStatus: 'Confirmed' | 'Rejected') => {
//     const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
//     setBookings(updated);
//     // SIMPAN KEMBALI KE LOCALSTORAGE
//     localStorage.setItem('spotly_bookings', JSON.stringify([...updated].reverse()));
//   };

//   const statusBadge = (status: string) => {
//     if (status === 'Confirmed') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
//     if (status === 'Rejected')  return 'bg-red-50 text-red-600 border border-red-200';
//     return 'bg-amber-50 text-amber-700 border border-amber-200';
//   };

//   return (
//     <div className="max-w-7xl mx-auto space-y-5 p-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-[#0D1B2A]">Manage Bookings</h1>
//           <p className="text-sm text-gray-500 mt-0.5">Pantau pesanan dari customer secara real-time</p>
//         </div>
//         <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
//           <RefreshCw size={15} /> Refresh
//         </button>
//       </div>

//       {bookings.length === 0 ? (
//         <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
//           <p className="text-4xl mb-3">📭</p>
//           <p className="text-gray-500 font-medium">Belum ada booking masuk</p>
//           <p className="text-sm text-gray-400 mt-1">Data dari CustomerPage akan muncul di sini</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-100">
//                   {['Nama Customer','No WA','Ruangan','Paket','Tanggal','Total Harga','Status','Aksi'].map(h => (
//                     <th key={h} className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {bookings.map(b => (
//                   <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
//                     <td className="px-6 py-4 font-semibold text-sm text-[#0D1B2A]">{b.customerName}</td>
//                     <td className="px-6 py-4 text-sm text-gray-500">{b.customerPhone}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{b.roomName}</td>
//                     <td className="px-6 py-4 text-sm text-gray-500 capitalize">{b.pricingType}</td>
//                     <td className="px-6 py-4 text-sm text-gray-500">{b.date}</td>
//                     <td className="px-6 py-4 text-sm font-bold text-[#0D1B2A]">{formatRp(b.totalPrice)}</td>
//                     <td className="px-6 py-4">
//                       <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(b.status)}`}>
//                         {b.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       {b.status === 'Pending' ? (
//                         <div className="flex gap-2">
//                           <button onClick={() => updateStatus(b.id, 'Confirmed')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700">Confirm</button>
//                           <button onClick={() => updateStatus(b.id, 'Rejected')} className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50">Reject</button>
//                         </div>
//                       ) : <span className="text-xs text-gray-300 italic">No action</span>}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // import React, { useState, useEffect } from 'react';
// // import { RefreshCw } from 'lucide-react';

// // interface Booking {
// //   id: string;
// //   customerName: string;
// //   customerPhone: string;
// //   roomName: string;
// //   pricingType: string;
// //   totalPrice: number;
// //   status: 'Pending' | 'Confirmed' | 'Rejected';
// //   date: string;
// // }

// // function formatRp(n: number) {
// //   return 'Rp ' + n.toLocaleString('id-ID');
// // }

// // export default function ManageBookings() {
// //   const [bookings, setBookings] = useState<Booking[]>([]);

// //   const load = () => {
// //     // TODO: INTEGRATE WITH AXIOS — GET /api/bookings
// //     const data = JSON.parse(localStorage.getItem('spotly_bookings') || '[]');
// //     setBookings(data.reverse());
// //   };

// //   useEffect(() => { load(); }, []);

// //   const confirm = (id: string) => {
// //     // TODO: INTEGRATE WITH AXIOS — PATCH /api/bookings/:id { status: 'Confirmed' }
// //     const updated = bookings.map(b =>
// //       b.id === id ? { ...b, status: 'Confirmed' as const } : b
// //     );
// //     setBookings(updated);
// //     localStorage.setItem('spotly_bookings', JSON.stringify([...updated].reverse()));
// //   };

// //   const reject = (id: string) => {
// //     // TODO: INTEGRATE WITH AXIOS — PATCH /api/bookings/:id { status: 'Rejected' }
// //     const updated = bookings.map(b =>
// //       b.id === id ? { ...b, status: 'Rejected' as const } : b
// //     );
// //     setBookings(updated);
// //     localStorage.setItem('spotly_bookings', JSON.stringify([...updated].reverse()));
// //   };

// //   const statusBadge = (status: string) => {
// //     if (status === 'Confirmed') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
// //     if (status === 'Rejected')  return 'bg-red-50 text-red-600 border border-red-200';
// //     return 'bg-amber-50 text-amber-700 border border-amber-200';
// //   };

// //   return (
// //     <div className="max-w-7xl mx-auto space-y-5">
// //       <div className="flex items-center justify-between">
// //         <div>
// //           <h1 className="text-2xl font-bold text-[#0D1B2A]">Manage Bookings</h1>
// //           <p className="text-sm text-gray-500 mt-0.5">Data dari customer secara real-time</p>
// //         </div>
// //         <button onClick={load}
// //           className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
// //           <RefreshCw size={15} /> Refresh
// //         </button>
// //       </div>

// //       {bookings.length === 0 ? (
// //         <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
// //           <p className="text-4xl mb-3">📭</p>
// //           <p className="text-gray-500 font-medium">Belum ada booking masuk</p>
// //           <p className="text-sm text-gray-400 mt-1">Booking dari customer akan muncul di sini</p>
// //         </div>
// //       ) : (
// //         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
// //           {/* Mobile: cards */}
// //           <div className="md:hidden divide-y divide-gray-50">
// //             {bookings.map(b => (
// //               <div key={b.id} className="p-4 space-y-2">
// //                 <div className="flex items-center justify-between">
// //                   <span className="text-xs font-mono text-gray-400">{b.id}</span>
// //                   <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${statusBadge(b.status)}`}>
// //                     {b.status}
// //                   </span>
// //                 </div>
// //                 <p className="font-semibold text-[#0D1B2A]">{b.customerName}</p>
// //                 <p className="text-sm text-gray-500">{b.roomName} · {b.pricingType}</p>
// //                 <div className="flex items-center justify-between">
// //                   <p className="text-sm font-bold text-[#0D1B2A]">{formatRp(b.totalPrice)}</p>
// //                   <p className="text-xs text-gray-400">{b.date}</p>
// //                 </div>
// //                 {b.status === 'Pending' && (
// //                   <div className="flex gap-2 pt-1">
// //                     <button onClick={() => confirm(b.id)}
// //                       className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold">
// //                       ✓ Confirm
// //                     </button>
// //                     <button onClick={() => reject(b.id)}
// //                       className="flex-1 py-2 border border-red-200 text-red-500 rounded-xl text-xs font-semibold">
// //                       ✗ Reject
// //                     </button>
// //                   </div>
// //                 )}
// //               </div>
// //             ))}
// //           </div>

// //           {/* Desktop: table */}
// //           <div className="hidden md:block overflow-x-auto">
// //             <table className="w-full">
// //               <thead>
// //                 <tr className="bg-gray-50 border-b border-gray-100">
// //                   {['ID Booking','Nama Customer','No WA','Ruangan','Paket','Tanggal','Total Harga','Status','Aksi'].map(h => (
// //                     <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
// //                       {h}
// //                     </th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-gray-50">
// //                 {bookings.map(b => (
// //                   <tr key={b.id} className="hover:bg-gray-50/60">
// //                     <td className="px-4 py-3 text-xs font-mono text-gray-400">{b.id}</td>
// //                     <td className="px-4 py-3 font-semibold text-sm text-[#0D1B2A]">{b.customerName}</td>
// //                     <td className="px-4 py-3 text-sm text-gray-500">{b.customerPhone}</td>
// //                     <td className="px-4 py-3 text-sm text-gray-600">{b.roomName}</td>
// //                     <td className="px-4 py-3 text-sm text-gray-500 capitalize">{b.pricingType}</td>
// //                     <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{b.date}</td>
// //                     <td className="px-4 py-3 text-sm font-bold text-[#0D1B2A] whitespace-nowrap">{formatRp(b.totalPrice)}</td>
// //                     <td className="px-4 py-3">
// //                       <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusBadge(b.status)}`}>
// //                         {b.status}
// //                       </span>
// //                     </td>
// //                     <td className="px-4 py-3">
// //                       {b.status === 'Pending' && (
// //                         <div className="flex gap-2">
// //                           <button onClick={() => confirm(b.id)}
// //                             className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700">
// //                             Confirm
// //                           </button>
// //                           <button onClick={() => reject(b.id)}
// //                             className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50">
// //                             Reject
// //                           </button>
// //                         </div>
// //                       )}
// //                       {b.status !== 'Pending' && (
// //                         <span className="text-xs text-gray-300">—</span>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }