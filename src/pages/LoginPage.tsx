import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AtSign, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface FormLogin {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const from = (location.state as any)?.from?.pathname ?? null;

  const [form, setForm]                 = useState<FormLogin>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roleId = await login(form.email, form.password); // ← langsung dapat role_id

      toast.success('Login berhasil! Selamat datang 👋');

      if (from) {
        navigate(from, { replace: true });
      } else if (roleId === 2) {
        navigate('/dashboard', { replace: true }); // admin
      } else {
        navigate('/', { replace: true }); // customer
      }

    } catch (err: any) {
      const msg = err.response?.data?.message;
      const errorText = typeof msg === 'object'
        ? Object.values(msg).flat().join(', ')
        : msg ?? 'Login gagal. Cek email & password.';

      toast.error(errorText);
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
              <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1">Welcome Back</h1>
              <p className="text-sm text-gray-500">Masuk ke akun SPOTLY kamu</p>
            </div>

            {from && (
              <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                Login dulu untuk melanjutkan.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Email"
                type="email"
                name="email"
                id="email"
                placeholder="name@spotly.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                leftIcon={<AtSign size={16} />}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="text-gray-400 hover:text-gray-600 pointer-events-auto"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Sign In
              </Button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              Belum punya akun?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-[#0D1B2A] font-semibold hover:underline"
              >
                Daftar sekarang
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

export default LoginPage;

// // import React, { useState } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import { AtSign, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
// // import axios from 'axios';
// // import { useAuth } from '../context/AuthContext';
// // import { Button } from '../components/ui/Button';
// // import { Input } from '../components/ui/Input';

// // export const LoginPage: React.FC = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const { login } = useAuth();

// //   const from = (location.state as any)?.from?.pathname ?? null;

// //   const [form, setForm] = useState({ email: '', password: '' });
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setError(null);
// //     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError(null);

// //     try {
// //       // HIT API SEKALI AJA
// //       const res = await axios.post('http://127.0.0.1:8000/api/login', form);
// //       const { token, user } = res.data.data;
      
// //       // SIMPAN KE CONTEXT
// //       login(token, user);
      
// //       // REDIRECT BERDASARKAN ROLE_ID
// //       // 2 ADALAH ADMIN, SELAIN ITU ADALAH CUSTOMER
// //       const targetPath = user.role_id === 2 ? '/dashboard' : '/';
      
// //       if (from) {
// //         navigate(from, { replace: true });
// //       } else {
// //         navigate(targetPath, { replace: true });
// //       }
// //     } catch (err: any) {
// //       setError(err.response?.data?.message ?? 'Login gagal. Cek email & password.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50 flex flex-col">
// //       <header className="w-full py-5 flex justify-center border-b border-gray-100 bg-white">
// //         <div className="flex items-center gap-2">
// //           <div className="w-7 h-7 bg-[#0D1B2A] rounded-lg flex items-center justify-center">
// //             <LayoutDashboard size={14} className="text-white" />
// //           </div>
// //           <span className="font-extrabold text-xl tracking-wider text-[#0D1B2A]">SPOTLY</span>
// //         </div>
// //       </header>

// //       <main className="flex-1 flex items-center justify-center px-4 py-10">
// //         <div className="w-full max-w-md">
// //           <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
// //             <div className="text-center mb-8">
// //               <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1">Welcome Back</h1>
// //             </div>
// //             {error && (
// //               <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
// //                 {error}
// //               </div>
// //             )}
// //             <form onSubmit={handleSubmit} className="flex flex-col gap-5">
// //               <Input label="Email" type="email" name="email" id="email"
// //                 placeholder="name@spotly.com" value={form.email}
// //                 onChange={handleChange} required leftIcon={<AtSign size={16} />} />
// //               <Input label="Password" type={showPassword ? 'text' : 'password'}
// //                 name="password" id="password" placeholder="••••••••"
// //                 value={form.password} onChange={handleChange} required
// //                 leftIcon={<Lock size={16} />}
// //                 rightIcon={
// //                   <button type="button" onClick={() => setShowPassword(p => !p)}
// //                     className="text-gray-400 hover:text-gray-600 pointer-events-auto" tabIndex={-1}>
// //                     {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
// //                   </button>
// //                 } />
// //               <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
// //                 Sign In
// //               </Button>
// //             </form>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default LoginPage;

// // import React, { useState } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import { AtSign, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
// // import { useAuth } from '../context/AuthContext';
// // import { Button } from '../components/ui/Button';
// // import { Input } from '../components/ui/Input';

// // export const LoginPage: React.FC = () => {
// //   const navigate  = useNavigate();
// //   const location  = useLocation();
// //   const { login } = useAuth();

// //   const from = (location.state as any)?.from?.pathname ?? null;

// //   const [form, setForm]               = useState({ email: '', password: '' });
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading]         = useState(false);
// //   const [error, setError]             = useState<string | null>(null);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setError(null);
// //     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError(null);

// //     try {
// //       // PROSES LOGIN
// //       await login(form.email, form.password);
      
// //       // KITA BUTUH DATA USER HASIL LOGIN, TAPI KARENA LOGIN FUNGSI ASYNC, 
// //       // KITA TANGKAP RESPONS-NYA DI SINI (ATAU BISA PAKE RE-FETCH)
// //       // BIAR SIMPLE, KITA PAKE LOGIKA ROLE_ID 2
// //       const res = await import('axios').then(a => a.default.post('http://127.0.0.1:8000/api/login', form));
// //       const { user } = res.data.data;

// //       if (from) {
// //         navigate(from, { replace: true });
// //       } else {
// //         navigate(user.role_id === 2 ? '/dashboard' : '/', { replace: true });
// //       }
// //     } catch (err: any) {
// //       setError(err.response?.data?.message ?? 'Login gagal. Cek email & password.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50 flex flex-col">
// //       <header className="w-full py-5 flex justify-center border-b border-gray-100 bg-white">
// //         <div className="flex items-center gap-2">
// //           <div className="w-7 h-7 bg-[#0D1B2A] rounded-lg flex items-center justify-center">
// //             <LayoutDashboard size={14} className="text-white" />
// //           </div>
// //           <span className="font-extrabold text-xl tracking-wider text-[#0D1B2A]">SPOTLY</span>
// //         </div>
// //       </header>

// //       <main className="flex-1 flex items-center justify-center px-4 py-10">
// //         <div className="w-full max-w-md">
// //           <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
// //             <div className="text-center mb-8">
// //               <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1">Welcome Back</h1>
// //             </div>
// //             {error && (
// //               <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
// //                 {error}
// //               </div>
// //             )}
// //             <form onSubmit={handleSubmit} className="flex flex-col gap-5">
// //               <Input label="Email" type="email" name="email" id="email"
// //                 placeholder="name@spotly.com" value={form.email}
// //                 onChange={handleChange} required leftIcon={<AtSign size={16} />} />
// //               <Input label="Password" type={showPassword ? 'text' : 'password'}
// //                 name="password" id="password" placeholder="••••••••"
// //                 value={form.password} onChange={handleChange} required
// //                 leftIcon={<Lock size={16} />}
// //                 rightIcon={
// //                   <button type="button" onClick={() => setShowPassword(p => !p)}
// //                     className="text-gray-400 hover:text-gray-600 pointer-events-auto" tabIndex={-1}>
// //                     {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
// //                   </button>
// //                 } />
// //               <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
// //                 Sign In
// //               </Button>
// //             </form>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default LoginPage;

// // import React, { useState } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import { AtSign, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
// // import axios from 'axios';
// // import { useAuth } from '../context/AuthContext';
// // import { Button } from '../components/ui/Button';
// // import { Input } from '../components/ui/Input';

// // export const LoginPage: React.FC = () => {
// //   const navigate  = useNavigate();
// //   const location  = useLocation();
// //   const { login } = useAuth(); // KITA PAKE FUNGSI LOGIN DARI CONTEXT

// //   const from = (location.state as any)?.from?.pathname ?? null;

// //   const [form, setForm]               = useState({ email: '', password: '' });
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading]         = useState(false);
// //   const [error, setError]             = useState<string | null>(null);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setError(null);
// //     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError(null);

// //     try {
// //       // 1. HIT API LOGIN
// //       const response = await axios.post('http://127.0.0.1:8000/api/login', form);
// //       const { token, user } = response.data.data;

// //       // 2. PANGGIL FUNGSI LOGIN DARI CONTEXT
// //       login(token, user);

// //       // 3. LOGIKA REDIRECT: ADMIN (ROLE_ID 2) KE DASHBOARD, CUSTOMER KE HOME
// //       if (from) {
// //         navigate(from, { replace: true });
// //       } else {
// //         const isAdmin = user.role_id === 2;
// //         navigate(isAdmin ? '/dashboard' : '/', { replace: true });
// //       }
// //     } catch (err: any) {
// //       setError(err.response?.data?.message ?? 'Login gagal. Cek email & password.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50 flex flex-col">
// //       <header className="w-full py-5 flex justify-center border-b border-gray-100 bg-white">
// //         <div className="flex items-center gap-2">
// //           <div className="w-7 h-7 bg-[#0D1B2A] rounded-lg flex items-center justify-center">
// //             <LayoutDashboard size={14} className="text-white" />
// //           </div>
// //           <span className="font-extrabold text-xl tracking-wider text-[#0D1B2A]">SPOTLY</span>
// //         </div>
// //       </header>

// //       <main className="flex-1 flex items-center justify-center px-4 py-10">
// //         <div className="w-full max-w-md">
// //           <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
// //             <div className="text-center mb-8">
// //               <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1">Welcome Back</h1>
// //               <p className="text-sm text-gray-500">Masuk ke akun SPOTLY kamu</p>
// //             </div>

// //             {error && (
// //               <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
// //                 {error}
// //               </div>
// //             )}

// //             <form onSubmit={handleSubmit} className="flex flex-col gap-5">
// //               <Input label="Email" type="email" name="email" id="email"
// //                 placeholder="name@spotly.com" value={form.email}
// //                 onChange={handleChange} required autoComplete="email"
// //                 leftIcon={<AtSign size={16} />} />

// //               <Input label="Password" type={showPassword ? 'text' : 'password'}
// //                 name="password" id="password" placeholder="••••••••"
// //                 value={form.password} onChange={handleChange} required
// //                 autoComplete="current-password" leftIcon={<Lock size={16} />}
// //                 rightIcon={
// //                   <button type="button" onClick={() => setShowPassword(p => !p)}
// //                     className="text-gray-400 hover:text-gray-600 pointer-events-auto" tabIndex={-1}>
// //                     {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
// //                   </button>
// //                 } />

// //               <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
// //                 Sign In
// //               </Button>
// //             </form>
// //           </div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default LoginPage;

// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { AtSign, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';

// export const LoginPage: React.FC = () => {
//   const navigate  = useNavigate();
//   const location  = useLocation();
//   const { login, isAdmin } = useAuth();

//   const from = (location.state as any)?.from?.pathname ?? null;

//   const [form, setForm]               = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading]         = useState(false);
//   const [error, setError]             = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setError(null);
//     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       await login(form.email, form.password);
//       // Redirect ke halaman sebelumnya, atau dashboard/home sesuai role
//       if (from) { navigate(from, { replace: true }); return; }
//       navigate(isAdmin ? '/dashboard' : '/', { replace: true });
//     } catch (err: any) {
//       setError(err.response?.data?.message ?? 'Login gagal. Cek email & password.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       <header className="w-full py-5 flex justify-center border-b border-gray-100 bg-white">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 bg-[#0D1B2A] rounded-lg flex items-center justify-center">
//             <LayoutDashboard size={14} className="text-white" />
//           </div>
//           <span className="font-extrabold text-xl tracking-wider text-[#0D1B2A]">SPOTLY</span>
//         </div>
//       </header>

//       <main className="flex-1 flex items-center justify-center px-4 py-10">
//         <div className="w-full max-w-md">
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
//             <div className="text-center mb-8">
//               <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1">Welcome Back</h1>
//               <p className="text-sm text-gray-500">Masuk ke akun SPOTLY kamu</p>
//             </div>

//             {from && (
//               <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
//                 Login dulu untuk melanjutkan.
//               </div>
//             )}

//             {error && (
//               <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//               <Input label="Email" type="email" name="email" id="email"
//                 placeholder="name@spotly.com" value={form.email}
//                 onChange={handleChange} required autoComplete="email"
//                 leftIcon={<AtSign size={16} />} />

//               <Input label="Password" type={showPassword ? 'text' : 'password'}
//                 name="password" id="password" placeholder="••••••••"
//                 value={form.password} onChange={handleChange} required
//                 autoComplete="current-password" leftIcon={<Lock size={16} />}
//                 rightIcon={
//                   <button type="button" onClick={() => setShowPassword(p => !p)}
//                     className="text-gray-400 hover:text-gray-600 pointer-events-auto" tabIndex={-1}>
//                     {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                   </button>
//                 } />

//               <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
//                 Sign In
//               </Button>
//             </form>

//             <div className="mt-4 flex items-center gap-3">
//               <div className="flex-1 h-px bg-gray-100" />
//               <span className="text-xs text-gray-400">OR</span>
//               <div className="flex-1 h-px bg-gray-100" />
//             </div>

//             <div className="mt-4 text-center text-sm text-gray-500">
//               Belum punya akun?{' '}
//               <button onClick={() => navigate('/register')}
//                 className="text-[#0D1B2A] font-semibold hover:underline">
//                 Daftar sekarang
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>

//       <footer className="py-4 border-t border-gray-100 bg-white text-center">
//         <p className="text-xs text-gray-400">© 2024 SPOTLY ENTERPRISE CONTROL.</p>
//       </footer>
//     </div>
//   );
// };

// export default LoginPage;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AtSign, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
// import axios from 'axios';
// import { Button } from '../components/ui/Button';
// import { Input } from '../components/ui/Input';
// import type { LoginFormData } from '../types';

// export const LoginPage: React.FC = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState<LoginFormData>({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setError(null);
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       // AXIOS — POST /api/login
//       const response = await axios.post('http://127.0.0.1:8000/api/login', form);
//       localStorage.setItem('token', response.data.data.token);
//       navigate('/dashboard');
//     } catch (err: any) {
//       setError(err.response?.data?.message ?? 'Login gagal. Cek email & password.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       <header className="w-full py-5 flex justify-center border-b border-gray-100 bg-white">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 bg-[#0D1B2A] rounded-lg flex items-center justify-center">
//             <LayoutDashboard size={14} className="text-white" />
//           </div>
//           <span className="font-extrabold text-xl tracking-wider text-[#0D1B2A]">SPOTLY</span>
//         </div>
//       </header>

//       <main className="flex-1 flex items-center justify-center px-4 py-10">
//         <div className="w-full max-w-md">
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8">
//             <div className="text-center mb-8">
//               <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1">Welcome Back</h1>
//               <p className="text-sm text-gray-500">Please enter your administrative credentials</p>
//             </div>

//             {error && (
//               <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//               <Input
//                 label="Work Email"
//                 type="email"
//                 name="email"
//                 id="email"
//                 placeholder="name@spotly.com"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//                 autoComplete="email"
//                 leftIcon={<AtSign size={16} />}
//               />

//               <Input
//                 label="Password"
//                 type={showPassword ? 'text' : 'password'}
//                 name="password"
//                 id="password"
//                 placeholder="••••••••"
//                 value={form.password}
//                 onChange={handleChange}
//                 required
//                 autoComplete="current-password"
//                 leftIcon={<Lock size={16} />}
//                 rightIcon={
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((p) => !p)}
//                     className="text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
//                     tabIndex={-1}
//                   >
//                     {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                   </button>
//                 }
//               />

//               <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
//                 Sign In
//               </Button>
//             </form>

//             <div className="mt-5 text-center">
//               <button className="text-sm text-gray-400 hover:text-[#0D1B2A] transition-colors">
//                 Forgot Password?
//               </button>
//             </div>

//             <div className="mt-4 flex items-center gap-3">
//               <div className="flex-1 h-px bg-gray-100" />
//               <span className="text-xs text-gray-400 font-medium">OR</span>
//               <div className="flex-1 h-px bg-gray-100" />
//             </div>

//             <div className="mt-4 text-center text-sm text-gray-500">
//               Need access?{' '}
//               <button
//                 onClick={() => navigate('/register')}
//                 className="text-[#0D1B2A] font-semibold hover:underline"
//               >
//                 Register New Account
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>

//       <footer className="py-4 border-t border-gray-100 bg-white text-center">
//         <p className="text-xs text-gray-400">© 2024 SPOTLY ENTERPRISE CONTROL. ALL RIGHTS RESERVED.</p>
//         <div className="flex justify-center gap-4 mt-1">
//           {['Privacy Policy', 'Terms of Service', 'Help Center'].map((t) => (
//             <button key={t} className="text-xs text-gray-400 hover:text-[#0D1B2A] transition-colors">
//               {t}
//             </button>
//           ))}
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default LoginPage;