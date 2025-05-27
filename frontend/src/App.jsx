import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Admin from './pages/Admin.jsx';
import PlaceDetail from './pages/PlaceDetail.jsx';
import { useAuth } from './context/AuthContext.jsx';

function App() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {user && <Route path="/admin" element={<Admin />} />}
          <Route path="/place/:id" element={<PlaceDetail />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
