// frontend/src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from 'react';

function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-sky-500 shadow-lg py-3' : 'bg-sky-400 py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-extrabold tracking-wide">
          Sungailiat Wisata
        </Link>

        <div className="flex gap-8 items-center text-white text-lg">
          <Link to="/" className="hover:underline">Beranda</Link>
          <Link to="/about" className="hover:underline">Tentang Kami</Link>
          <Link to="/gallery" className="hover:underline">Galeri</Link>
        </div>

        <div className="flex gap-4 items-center text-white text-lg">
          {user ? (
            <>
              <Link to="/admin" className="hover:underline">Admin</Link>
              <button onClick={logout} className="hover:underline">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;