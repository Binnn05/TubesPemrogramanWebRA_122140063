import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-sky-400 text-white p-4 flex gap-6 items-center shadow-md">
      <Link to="/" className="font-bold text-lg">Beranda</Link>
      <Link to="/place/1" className="hover:underline">Wisata</Link> {/* Contoh link ke detail */}
      
      <div className="ml-auto flex gap-4">
        {user ? (
          <>
            <Link to="/admin" className="hover:underline">Admin</Link>
            <button onClick={logout} className="hover:underline">Logout</button>
          </>
        ) : (
          <Link to="/login" className="hover:underline">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
