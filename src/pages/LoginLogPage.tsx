import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { RefreshCw, Loader2, Users, Clock, Monitor, Smartphone, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface LogEntry {
  id: number;
  logged_in_at: string;
  ip_address: string | null;
  user_agent: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  } | null;
}

interface PaginatedLogs {
  data: LogEntry[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// ── HELPERS ──────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

function parseDevice(ua: string | null): { label: string; icon: 'mobile' | 'desktop' } {
  if (!ua) return { label: 'Unknown', icon: 'desktop' };
  if (/mobile|android|iphone/i.test(ua)) return { label: 'Mobile', icon: 'mobile' };
  if (/tablet|ipad/i.test(ua)) return { label: 'Tablet', icon: 'mobile' };
  return { label: 'Desktop', icon: 'desktop' };
}

function parseBrowser(ua: string | null): string {
  if (!ua) return '-';
  if (/edg/i.test(ua))     return 'Edge';
  if (/chrome/i.test(ua))  return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua))  return 'Safari';
  if (/opera/i.test(ua))   return 'Opera';
  return 'Other';
}

// ── AVATAR ────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function LoginLogPage() {
  const [logs, setLogs]             = useState<LogEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage]             = useState(1);
  const [lastPage, setLastPage]     = useState(1);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchLogs = useCallback(async (p = 1, q = search, silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: String(p) });
      if (q) params.set('search', q);

      const res = await axios.get(`http://127.0.0.1:8000/api/login-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const paginated: PaginatedLogs = res.data.data;
      setLogs(paginated.data);
      setLastPage(paginated.last_page);
      setTotal(paginated.total);
      setPage(p);
    } catch {
      toast.error('Gagal mengambil data login log.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { fetchLogs(1); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchLogs(1, searchInput);
  };

  // stats dari data yang ada
  const adminCount    = logs.filter(l => l.user?.role_id === 2).length;
  const customerCount = logs.filter(l => l.user?.role_id === 1).length;
  const mobileCount   = logs.filter(l => parseDevice(l.user_agent).icon === 'mobile').length;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0D1B2A]">Login Log</h1>
          <p className="text-sm text-gray-400 mt-0.5">Riwayat aktivitas login semua pengguna</p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#162437] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Login"    value={total}         sub="semua waktu"           color="text-[#0D1B2A]" />
        <StatCard label="Di halaman ini" value={logs.length}   sub={`dari ${total} data`}  color="text-blue-600"  />
        <StatCard label="Admin"          value={adminCount}    sub="login di halaman ini"  color="text-violet-600"/>
        <StatCard label="Mobile"         value={mobileCount}   sub="pengguna mobile"       color="text-emerald-600"/>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20 focus:border-[#0D1B2A]"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#0D1B2A] text-white rounded-xl text-sm font-semibold hover:bg-[#162437] transition-colors"
        >
          Cari
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setSearch(''); fetchLogs(1, ''); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-[#0D1B2A]" size={28} />
            <p className="text-sm text-gray-400">Memuat data login log...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <span className="text-5xl mb-4">📋</span>
            <h3 className="text-base font-bold text-[#0D1B2A] mb-1">Tidak ada data</h3>
            <p className="text-sm text-gray-400">{search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada aktivitas login.'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Waktu Login</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">IP Address</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Device</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Browser</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(log => {
                    const device = parseDevice(log.user_agent);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {log.user ? (
                              <Avatar name={log.user.name} />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <Users size={14} className="text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-[#0D1B2A] truncate">
                                {log.user?.name ?? <span className="italic text-gray-300">Deleted</span>}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{log.user?.email ?? '-'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            log.user?.role_id === 2
                              ? 'bg-violet-50 text-violet-700'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {log.user?.role_id === 2 ? '👑 Admin' : '👤 Customer'}
                          </span>
                        </td>

                        {/* Waktu */}
                        <td className="px-6 py-4">
                          <p className="text-[#0D1B2A] text-xs font-medium">{formatDate(log.logged_in_at)}</p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {timeAgo(log.logged_in_at)}
                          </p>
                        </td>

                        {/* IP */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">
                            {log.ip_address ?? '-'}
                          </span>
                        </td>

                        {/* Device */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            {device.icon === 'mobile'
                              ? <Smartphone size={13} className="text-gray-400" />
                              : <Monitor size={13} className="text-gray-400" />
                            }
                            {device.label}
                          </div>
                        </td>

                        {/* Browser */}
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {parseBrowser(log.user_agent)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Halaman <span className="font-semibold text-[#0D1B2A]">{page}</span> dari <span className="font-semibold text-[#0D1B2A]">{lastPage}</span>
                  <span className="ml-2 text-gray-300">·</span>
                  <span className="ml-2">{total} total log</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLogs(page - 1)}
                    disabled={page <= 1 || refreshing}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={13} /> Prev
                  </button>
                  <button
                    onClick={() => fetchLogs(page + 1)}
                    disabled={page >= lastPage || refreshing}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}