// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // State untuk loading autentikasi awal

  // Cek token saat aplikasi pertama kali dimuat
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Di aplikasi nyata, Anda mungkin ingin memvalidasi token ini ke backend
      // atau bahkan melakukan panggilan /api/me (jika ada) untuk mendapatkan data user
      setUser({ username: 'admin' }); // Asumsikan username admin jika token ada
    }
    setLoadingAuth(false); // Selesai cek auth awal
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:6543/api/login', { // URL API Login Backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
          setUser({ username }); // Set user setelah login berhasil
          return true;
        }
      }
      // Jika login gagal atau tidak ada token
      // Coba baca respons error sebagai JSON, jika gagal, berikan pesan default
      let errorDetail = 'Login gagal: Username atau password salah.';
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
            errorDetail = errorData.detail;
        }
      } catch (e) {
        // Biarkan errorDetail default jika respons bukan JSON atau tidak ada field detail
        console.warn("Respons error login bukan JSON atau tidak memiliki field 'detail'. Status:", response.status);
      }
      alert(errorDetail);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      alert('Terjadi kesalahan saat mencoba login. Pastikan backend berjalan dan dapat diakses.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
    // Anda mungkin ingin mengarahkan pengguna ke halaman login atau beranda di sini
    // misalnya menggunakan navigate() dari react-router-dom jika hook tersedia di context ini.
  };

  // Jangan render children sebelum loadingAuth selesai
  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Memuat autentikasi...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);