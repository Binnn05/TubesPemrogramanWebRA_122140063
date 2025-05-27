import { useEffect, useState } from 'react';
import axios from 'axios';

function Admin() {
  const [places, setPlaces] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchPlaces = async () => {
    const res = await axios.get('http://localhost:6543/api/places');
    setPlaces(res.data);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post('http://localhost:6543/api/places', form);
    setForm({ name: '', description: '' });
    fetchPlaces();
  };

  const handleDelete = async id => {
    await axios.delete(`http://localhost:6543/api/places/${id}`);
    fetchPlaces();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Manajemen Tempat Wisata</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input name="name" placeholder="Nama" value={form.name} onChange={handleChange} className="border p-2 mr-2" />
        <input name="description" placeholder="Deskripsi" value={form.description} onChange={handleChange} className="border p-2 mr-2" />
        <button className="bg-blue-500 text-white px-4 py-2">Tambah</button>
      </form>
      <ul>
        {places.map(p => (
          <li key={p.id} className="mb-2">
            <span className="font-semibold">{p.name}</span>: {p.description}
            <button onClick={() => handleDelete(p.id)} className="ml-2 text-red-500">Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;
