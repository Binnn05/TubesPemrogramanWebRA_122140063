// frontend/src/pages/PlaceDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

function PlaceDetail() {
  const { id } = useParams(); // Mengambil ID dari URL
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaceData = async () => {
      setLoading(true);
      setError(null);
      setPlace(null); // Reset place setiap kali fetch baru
      try {
        const response = await fetch(`http://localhost:6543/api/places/${id}`); 
        if (!response.ok) {
          let errorDetailMessage;
          if (response.status === 404) {
            errorDetailMessage = 'Tempat tidak ditemukan.';
          } else {
            // Coba baca detail error dari body respons untuk status error lainnya
            errorDetailMessage = `Gagal memuat data tempat. Status: ${response.status}`;
            try {
                const errorData = await response.json(); // Coba parse sebagai JSON
                if (errorData && (errorData.detail || errorData.message)) {
                    errorDetailMessage = errorData.detail || errorData.message;
                } else if (typeof errorData === 'string' && errorData.length > 0) {
                    errorDetailMessage = errorData;
                }
            } catch (e) {
                // Jika body bukan JSON atau parse gagal, coba baca sebagai teks
                try {
                    const textError = await response.text();
                    if (textError && textError.length < 200) { // Batasi panjang teks error
                        errorDetailMessage = textError;
                    }
                } catch (textE) {
                    console.warn("Tidak bisa membaca body error sebagai JSON maupun teks:", textE)
                }
            }
          }
          throw new Error(errorDetailMessage);
        }
        const data = await response.json();
        setPlace(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching place detail:', err);
        // setPlace(null); sudah di-set di awal try
      } finally {
        setLoading(false);
      }
    };

    // Hanya fetch jika ID adalah angka yang valid (opsional, backend juga memvalidasi)
    if (id && /^\d+$/.test(id)) {
        fetchPlaceData();
    } else {
        setError("ID tempat tidak valid.");
        setLoading(false);
    }
  }, [id]); // Dependensi pada 'id' sudah benar

  // Fungsi untuk mendapatkan URL gambar yang aman (sudah konsisten)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/default-placeholder.jpg'; 
    if (imagePath.startsWith('http')) return imagePath; 
    
    const imageName = imagePath.split('/').pop();
    return `http://localhost:6543/uploads/${imageName}`;
  };

  if (loading) {
    return <p className="p-4 text-center pt-20">Memuat detail tempat...</p>;
  }

  if (error) {
    return <p className="p-4 text-center pt-20 text-red-600">Error: {error}</p>;
  }

  if (!place) {
    // Ini seharusnya sudah ditangani oleh 'error' jika fetch gagal atau tidak ditemukan
    // Namun, sebagai fallback jika 'error' null tapi 'place' juga null.
    return <p className="p-4 text-center pt-20">Detail tempat tidak tersedia atau tidak ditemukan.</p>;
  }

  const imageUrl = getImageUrl(place.image);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pt-20"> 
      <Link to="/" className="text-blue-500 hover:text-blue-700 underline mb-4 block transition-colors duration-200">
        &larr; Kembali ke Beranda
      </Link>
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">{place.name || "Nama Tempat Tidak Tersedia"}</h1>
      <img 
        src={imageUrl} 
        alt={place.name || 'Gambar tempat'} 
        className="w-full h-auto max-h-[400px] md:max-h-[500px] object-cover rounded-lg mb-6 shadow-lg" 
        onError={(e) => { 
          e.currentTarget.src = '/images/default-placeholder.jpg'; 
          e.currentTarget.alt = 'Gambar tidak tersedia'; 
        }}
      />
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 text-sm mb-1">
          <strong>Kategori:</strong> {place.category || 'Tidak ada kategori'}
        </p>
        <p className="text-gray-600 text-sm mb-3">
          <strong>Lokasi:</strong> {place.location || 'Tidak ada lokasi'}
        </p>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2 mt-4 border-b pb-1">Deskripsi</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
          {place.description || 'Tidak ada deskripsi.'}
        </p>
        
        {place.mapsEmbed && place.mapsEmbed.startsWith('http') ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 mt-6 border-b pb-1">Lokasi di Peta</h2>
            <div className="aspect-w-16 aspect-h-9 border rounded-lg overflow-hidden shadow-md">
              <iframe
                src={place.mapsEmbed} // Pastikan URL ini aman dan dari sumber tepercaya
                width="100%"
                height="450" // Anda bisa menyesuaikan tinggi ini
                style={{ border: 0 }} // style={{border:0}} lebih umum daripada allowFullScreen=""
                allowFullScreen={true} // Ganti dengan boolean
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Peta Lokasi ${place.name || 'Tempat Wisata'}`}
              />
            </div>
          </>
        ) : place.mapsEmbed ? ( // Tambahkan ini jika mapsEmbed ada tapi bukan URL valid
            <>
             <h2 className="text-xl font-semibold text-gray-800 mb-2 mt-6 border-b pb-1">Lokasi di Peta</h2>
             <p className="text-gray-500">Data peta tidak valid atau tidak tersedia.</p>
            </>
        ) : null }
      </div>
    </div>
  );
}

export default PlaceDetail;