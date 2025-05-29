// frontend/src/pages/PlaceDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
// HAPUS: import { dummyPlaces } from "../data/placesData";

function PlaceDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:6543/api/places/${id}`); // URL API Backend
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Tempat tidak ditemukan.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPlace(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching place detail:', err);
        setPlace(null); // Set place jadi null jika ada error
      } finally {
        setLoading(false);
      }
    };
    fetchPlaceData();
  }, [id]); // Tambahkan id sebagai dependensi useEffect

  // Fungsi untuk mendapatkan URL gambar yang aman
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/default-placeholder.jpg'; // Gambar default jika path kosong
    if (imagePath.startsWith('http')) return imagePath; // URL absolut
    if (imagePath.startsWith('/images/')) return imagePath; // Path sudah benar untuk public folder frontend
    // Asumsi backend mengembalikan nama file, dan file tersebut disajikan dari backend
    // pada path /uploads/ (sesuai konfigurasi static view yang akan kita buat di backend nanti)
    return `http://localhost:6543/uploads/${imagePath.split('/').pop()}`; 
    // ATAU, jika frontend juga menyimpan salinan di public/images/
    // return `/images/${imagePath.split('/').pop()}`;
    // Pilih salah satu strategi di atas. Untuk sekarang, kita asumsikan backend akan menyajikan dari /uploads/
  };

  // pt-20 untuk padding atas karena navbar fixed
  if (loading) {
    return <p className="p-4 text-center pt-20">Memuat detail tempat...</p>;
  }

  if (error) {
    return <p className="p-4 text-center pt-20 text-red-600">{error}</p>;
  }

  if (!place) {
    // Ini bisa terjadi jika fetch selesai tapi data place tetap null (misalnya karena error tanpa melempar)
    // atau jika memang tempat tidak ditemukan (seharusnya sudah ditangani oleh error di atas)
    return <p className="p-4 text-center pt-20">Tempat tidak ditemukan.</p>;
  }

  const imageUrl = getImageUrl(place.image);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pt-20"> 
      <Link to="/" className="text-blue-500 underline mb-4 block">← Kembali ke Beranda</Link>
      <h1 className="text-3xl font-bold mb-4">{place.name}</h1>
      <img 
        src={imageUrl} 
        alt={place.name || 'Gambar tempat'} 
        className="w-full h-auto max-h-[500px] object-cover rounded mb-4 shadow-lg" 
        // Tambahkan onError untuk fallback jika gambar dari backend gagal dimuat
        onError={(e) => { e.currentTarget.src = '/images/default-placeholder.jpg'; e.currentTarget.alt = 'Gambar tidak tersedia'; }}
      />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 text-sm mb-1">
          <strong>Kategori:</strong> {place.category || 'Tidak ada kategori'}
        </p>
        <p className="text-gray-500 text-sm mb-3">
          <strong>Lokasi:</strong> {place.location || 'Tidak ada lokasi'}
        </p>
        <h2 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Deskripsi</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
          {place.description || 'Tidak ada deskripsi.'}
        </p>
        
        {place.mapsEmbed && place.mapsEmbed.startsWith('http') && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 mt-6">Lokasi di Peta</h2>
            <div className="aspect-w-16 aspect-h-9 border rounded-lg overflow-hidden shadow-md">
              <iframe
                src={place.mapsEmbed}
                width="100%"
                height="450"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Peta Lokasi ${place.name || 'Tempat Wisata'}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PlaceDetail;