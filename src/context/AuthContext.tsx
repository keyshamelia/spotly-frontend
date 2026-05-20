import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<number>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, token: null, isLoggedIn: false, isAdmin: false,
  login: async () => 0, logout: () => {}, loading: true,
});

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(() => localStorage.getItem('token'));
  // ← ambil role_id dari localStorage langsung, tidak tunggu /api/user
  const [roleId, setRoleId]   = useState<number>(() => Number(localStorage.getItem('role_id') ?? 0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) { setLoading(false); return; }

    axios.get('http://127.0.0.1:8000/api/user', {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then(res => {
        const userData: User = res.data?.data ?? res.data;
        setUser(userData);
        setToken(savedToken);
        setRoleId(userData.role_id);
        localStorage.setItem('role_id', String(userData.role_id)); // sync
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role_id');
        setToken(null);
        setRoleId(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<number> => {
    const res = await axios.post('http://127.0.0.1:8000/api/login', { email, password });

    const { token: newToken, user: userData } = res.data.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('role_id', String(userData.role_id)); // ← simpan role_id
    setToken(newToken);
    setUser(userData);
    setRoleId(userData.role_id);

    return userData.role_id;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role_id'); // ← hapus juga saat logout
    setToken(null);
    setUser(null);
    setRoleId(0);
    toast.success('Berhasil logout!');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoggedIn: !!token,
      isAdmin: roleId === 2, // ← pakai roleId, bukan user?.role_id
      login,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   role_id: number;
// }

// interface AuthContextValue {
//   user: User | null;
//   token: string | null;
//   isLoggedIn: boolean;
//   isAdmin: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextValue>({
//   user: null, token: null, isLoggedIn: false, isAdmin: false,
//   login: async () => {}, logout: () => {}, loading: true,
// });

// export function useAuth() { return useContext(AuthContext); }

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser]   = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const savedToken = localStorage.getItem('token');
//     if (!savedToken) { setLoading(false); return; }

//     axios.get('http://127.0.0.1:8000/api/user', {
//       headers: { Authorization: `Bearer ${savedToken}` },
//     })
//       .then(res => { setUser(res.data); setToken(savedToken); })
//       .catch(() => { localStorage.removeItem('token'); setToken(null); })
//       .finally(() => setLoading(false));
//   }, []);

//   const login = async (email: string, password: string) => {
//     const res = await axios.post('http://127.0.0.1:8000/api/login', { email, password });
//     const { token: newToken, user: userData } = res.data.data;
//     localStorage.setItem('token', newToken);
//     setToken(newToken);
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{
//       user, token,
//       isLoggedIn: !!token,
//       isAdmin: user?.role_id === 2, // FIXED: ADMIN ROLE_ID 2
//       login, logout, loading,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   role_id: number;
// }

// interface AuthContextValue {
//   user: User | null;
//   token: string | null;
//   isLoggedIn: boolean;
//   isAdmin: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextValue>({
//   user: null, token: null, isLoggedIn: false, isAdmin: false,
//   login: async () => {}, logout: () => {}, loading: true,
// });

// export function useAuth() { return useContext(AuthContext); }

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser]   = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
//   const [loading, setLoading] = useState(true);

//   // Fetch user profile saat app load
//   useEffect(() => {
//     const savedToken = localStorage.getItem('token');
//     if (!savedToken) { setLoading(false); return; }

//     axios.get('http://127.0.0.1:8000/api/user', {
//       headers: { Authorization: `Bearer ${savedToken}` },
//     })
//       .then(res => { setUser(res.data); setToken(savedToken); })
//       .catch(() => { localStorage.removeItem('token'); setToken(null); })
//       .finally(() => setLoading(false));
//   }, []);

//   const login = async (email: string, password: string) => {
//     const res = await axios.post('http://127.0.0.1:8000/api/login', { email, password });
//     const newToken = res.data.data.token;
//     const userData = res.data.data.user;
//     localStorage.setItem('token', newToken);
//     setToken(newToken);
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{
//       user, token,
//       isLoggedIn: !!token,
//       isAdmin: user?.role_id === 1,
//       login, logout, loading,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }