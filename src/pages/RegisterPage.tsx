import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSign, Lock, User, Phone, MapPin, LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    address: '',
    contact: '',
    role: 2, // default role customer
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    // AXIOS — POST /api/register
    await axios.post('http://127.0.0.1:8000/api/register', {
      role: 2,
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
      address: form.address,
      contact: form.contact,
    });
    alert('Registrasi berhasil! Silakan login.');
    navigate('/login');
  } catch (err: any) {
    const msg = err.response?.data?.message;
    if (msg && typeof msg === 'object') {
      const first = Object.values(msg)[0];
      setError(Array.isArray(first) ? first[0] as string : String(first));
    } else {
      setError(msg ?? 'Registrasi gagal.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full py-5 flex justify-center border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0D1B2A] rounded-lg flex items-center justify-center">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-[#0D1B2A]">SPOTLY</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1">Create Account</h1>
              <p className="text-sm text-gray-500">Daftarkan akun admin baru</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Nama Lengkap</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3 text-gray-400" />
                  <input name="name" value={form.name} onChange={handleChange} required
                    placeholder="Nama lengkap"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Email</label>
                <div className="relative flex items-center">
                  <AtSign size={16} className="absolute left-3 text-gray-400" />
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="name@spotly.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Password</label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3 text-gray-400" />
                  <input name="password" type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={handleChange} required
                    placeholder="Min. 8 karakter"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20" />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Konfirmasi Password</label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3 text-gray-400" />
                  <input name="password_confirmation" type={showPassword ? 'text' : 'password'}
                    value={form.password_confirmation} onChange={handleChange} required
                    placeholder="Ulangi password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Alamat</label>
                <div className="relative flex items-center">
                  <MapPin size={16} className="absolute left-3 text-gray-400" />
                  <input name="address" value={form.address} onChange={handleChange} required
                    placeholder="Alamat lengkap"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20" />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="text-xs font-semibold text-[#0D1B2A] block mb-1.5">Nomor HP</label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-3 text-gray-400" />
                  <input name="contact" type="tel" value={form.contact} onChange={handleChange} required
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1B2A]/20" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#0D1B2A] text-white rounded-xl font-semibold text-sm hover:bg-[#162437] disabled:opacity-50 transition-colors mt-2">
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-500">
              Sudah punya akun?{' '}
              <button onClick={() => navigate('/login')}
                className="text-[#0D1B2A] font-semibold hover:underline">
                Login di sini
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-gray-100 bg-white text-center">
        <p className="text-xs text-gray-400">© 2024 SPOTLY ENTERPRISE CONTROL. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

export default RegisterPage;