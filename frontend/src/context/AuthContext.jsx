import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setUser({ username: 'admin' });
    }
    setLoadingAuth(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:6543/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
          setUser({ username });
          return true;
        }
      }
      let errorDetail = 'Login gagal: Username atau password salah.';
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
            errorDetail = errorData.detail;
        }
      } catch (e) {
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
  };

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