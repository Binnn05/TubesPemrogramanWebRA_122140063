// frontend/src/pages/Admin.jsx
import { useEffect, useState } from 'react';
import { dummyPlaces as initialDummyPlaces } from '../data/placesData'; //

function Admin() {
  const [places, setPlaces] = useState([]); //
  const [form, setForm] = useState({ 
    id: '', 
    name: '', 
    description: '',
    category: '', 
    location: '', 
    image: '', 
    mapsEmbed: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchPlaces = () => { //
    setPlaces([...initialDummyPlaces]); //
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.description || !form.category || !form.location || !form.image) {
      alert('Nama, Deskripsi, Kategori, Lokasi, dan URL Gambar harus diisi!');
      return;
    }

    if (isEditing) {
      const updatedPlaces = places.map(p => 
        p.id === form.id ? { ...form } : p 
      );
      setPlaces(updatedPlaces); 
      alert('Tempat berhasil diperbarui!');
      setIsEditing(false); 
    } else {
      const newId = String(places.length > 0 ? Math.max(...places.map(p => Number(p.id))) + 1 : 1);
      const newPlace = { 
        ...form, 
        id: newId
      };
      setPlaces([...places, newPlace]); 
      alert('Tempat berhasil ditambahkan!');
    }
    
    setForm({ 
      id: '', name: '', description: '', category: '', location: '', image: '', mapsEmbed: '' 
    });
  };

  const handleDelete = async id => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tempat ini?')) {
      const updatedPlaces = places.filter(p => p.id !== id);
      setPlaces(updatedPlaces);
      alert('Tempat berhasil dihapus!');
    }
  };

  const handleEdit = (place) => {
    setForm({ ...place }); 
    setIsEditing(true); 
  };

  const handleCancelEdit = () => {
    setForm({ 
      id: '', name: '', description: '', category: '', location: '', image: '', mapsEmbed: '' 
    });
    setIsEditing(false);
  };

  return (
    // Tambahkan pt-20 di sini
    <div className="max-w-4xl mx-auto p-4 pt-20"> 
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Tempat Wisata</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-sky-700">
          {isEditing ? 'Edit Tempat Wisata' : 'Tambah Tempat Wisata Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Nama Tempat Wisata"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
          <input
            name="category"
            placeholder="Kategori (contoh: Wisata Pantai, Kuliner)"
            value={form.category}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
          <input
            name="location"
            placeholder="Lokasi (contoh: Sungailiat, Bangka)"
            value={form.location}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
          <input
            name="image"
            placeholder="URL Gambar (contoh: /images/nama-gambar.jpg)"
            value={form.image}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
          <input
            name="mapsEmbed"
            placeholder="URL Google Maps Embed (opsional)"
            value={form.mapsEmbed}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <textarea
            name="description"
            placeholder="Deskripsi Lengkap Tempat"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded md:col-span-2 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[100px]"
            required
          />
          
          <div className="md:col-span-2 flex gap-4 mt-2">
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex-1"
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambah Tempat'}
            </button>
            {isEditing && (
              <button
                type="button" 
                onClick={handleCancelEdit}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Daftar Tempat Wisata</h2>
        <ul className="divide-y divide-gray-200">
          {places.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada tempat wisata. Silakan tambahkan!</p>
          ) : (
            places.map(p => (
              <li key={p.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-1 mb-2 md:mb-0">
                  <span className="font-semibold text-lg text-gray-900">{p.name}</span>
                  <p className="text-sm text-gray-600 line-clamp-1">{p.description}</p>
                  <p className="text-xs text-gray-500">{p.category} | {p.location}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition duration-300"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default Admin;