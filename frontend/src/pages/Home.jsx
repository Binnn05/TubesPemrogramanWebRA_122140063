// frontend/src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import { Link } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
// HAPUS: import { dummyPlaces as initialDummyPlaces } from "../data/placesData";

function Home() {
  const [places, setPlaces] = useState([]);
  const [carouselPlaces, setCarouselPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlacesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:6543/api/places'); // URL API Backend
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPlaces(data);
        // Ambil beberapa data pertama untuk carousel, misalnya 5.
        // Pastikan data memiliki ID unik dan properti yang dibutuhkan carousel.
        setCarouselPlaces(data.slice(0, Math.min(data.length, 5)));
      } catch (err) {
        setError(err.message);
        console.error('Error fetching places:', err);
        setPlaces([]); // Kosongkan jika error
        setCarouselPlaces([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlacesData();
  }, []);

  const filtered = places.filter(p => {
    const nameMatch = p.name ? p.name.toLowerCase().includes(search.toLowerCase()) : false;
    const descriptionMatch = p.description ? p.description.toLowerCase().includes(search.toLowerCase()) : false;
    const categoryMatch = p.category ? p.category.toLowerCase().includes(filter.toLowerCase()) : false;

    const matchesSearch = nameMatch || descriptionMatch;
    const matchesFilter = filter === "all" || categoryMatch;
    return matchesSearch && matchesFilter;
  });

  // Fungsi untuk mendapatkan URL gambar yang aman
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/default-placeholder.jpg'; // Gambar default jika path kosong
    if (imagePath.startsWith('http')) return imagePath; // URL absolut sudah benar
    
    // Jika imagePath adalah nama file atau path relatif dari backend,
    // kita akan mengarahkannya ke endpoint /uploads/ di backend.
    // Asumsi: backend menyajikan gambar dari http://localhost:6543/uploads/NAMA_FILE_GAMBAR
    // dan imagePath yang diterima dari API adalah NAMA_FILE_GAMBAR (atau path yang bisa di-split).
    const imageName = imagePath.split('/').pop(); // Ambil hanya nama file
    return `http://localhost:6543/uploads/${imageName}`; 
  };


  return (
    <div className="min-h-screen">
      {/* Bagian Header Utama dengan Gambar Latar Belakang Penuh */}
      <div
        className="relative w-full h-[500px] bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center text-white p-4"
        style={{ backgroundImage: `url('/images/pantai-tikus.jpg')` }} // Pastikan gambar ini ada di public/images
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
            Temukan Destinasi Pilihan Anda di Sungailiat
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
            Beragam Pilihan Tempat Wisata Terbaik untuk Liburan Anda
          </p>
        </div>
      </div>

      {/* Konten Utama Halaman Home (setelah header), dengan padding top untuk navbar */}
      <div className="pt-16"> {/* Padding top untuk navbar fixed */}
        {/* Bagian Carousel dengan Deskripsi Mengapit di Samping */}
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Kolom Kiri: Deskripsi Ringkas Kota Sungailiat */}
          <div className="lg:col-span-1 bg-sky-50 p-6 rounded-lg shadow-md self-start text-center lg:text-left">
            <h2 className="text-xl font-bold mb-3 text-sky-800">Tentang Sungailiat</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Sungailiat, sebuah kota menawan di pesisir timur Pulau Bangka, adalah permata tersembunyi yang kaya akan keindahan alam, sejarah, dan budaya.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">
              Terkenal dengan pantai-pantainya yang memukau dan ragam kuliner laut segar.
            </p>
             <Link to="/about" className="mt-4 inline-block text-blue-600 hover:underline text-sm font-semibold">Baca Selengkapnya →</Link>
          </div>

          {/* Kolom Tengah (Carousel) */}
          <div className="lg:col-span-1 w-full flex justify-center">
            {loading && <p className="text-center">Memuat carousel...</p>}
            {error && <p className="text-center text-red-500">Gagal memuat data carousel.</p>}
            {!loading && !error && carouselPlaces.length > 0 && (
              <Carousel
                autoPlay
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                interval={3000}
                className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg"
              >
                {carouselPlaces.map(place => (
                  <div key={place.id}>
                    <img 
                      src={getImageUrl(place.image)}
                      alt={place.name || 'Gambar tempat'} 
                      className="h-80 w-full object-cover" // Sesuaikan tinggi carousel
                    />
                    <p className="legend">{place.name}</p>
                  </div>
                ))}
              </Carousel>
            )}
            {!loading && !error && carouselPlaces.length === 0 && (
                <div className="w-full max-w-sm h-80 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg">
                    <p className="text-gray-500">Tidak ada gambar untuk ditampilkan.</p>
                </div>
            )}
          </div>

          {/* Kolom Kanan: Deskripsi Lanjutan Kota Sungailiat */}
          <div className="lg:col-span-1 bg-sky-50 p-6 rounded-lg shadow-md self-start text-center lg:text-left">
            <h2 className="text-xl font-bold mb-3 text-sky-800">Pesona Alam & Kuliner</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Dari masakan seafood lezat hingga kopi legendaris, setiap sudut Sungailiat siap memberikan pengalaman liburan yang tak hanya indah di mata, tetapi juga kaya rasa dan budaya.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">
              Selamat datang di Sungailiat, tempat di mana petualangan Anda dimulai!
            </p>
             <Link to="/about" className="mt-4 inline-block text-blue-600 hover:underline text-sm font-semibold">Baca Selengkapnya →</Link>
          </div>
        </div> {/* Akhir Bagian Carousel dengan Deskripsi Mengapit */}

        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 w-full max-w-4xl mx-auto">
              <input
                type="text"
                placeholder="Cari tempat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full md:max-w-md"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full md:max-w-xs"
              >
                <option value="all">Semua Kategori</option>
                {/* Anda bisa membuat daftar kategori dinamis dari data `places` jika perlu */}
                <option value="pantai">Wisata Pantai</option>
                <option value="kuliner">Kuliner</option>
                <option value="ibadah">Tempat Ibadah</option>
                <option value="penginapan">Penginapan</option>
                <option value="resto">Resto</option>
                {/* Tambahkan kategori lain yang relevan */}
              </select>
            </div>

            {/* Daftar Tempat */}
            {loading && <p className="text-center col-span-full text-lg mt-8">Memuat tempat wisata...</p>}
            {error && <p className="text-center col-span-full text-red-600 text-lg mt-8">Gagal memuat data tempat: {error}</p>}
            
            {!loading && !error && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full max-w-4xl mx-auto">
                {filtered.length > 0 ? filtered.map((place) => (
                  <Link to={`/place/${place.id}`} key={place.id} className="block group">
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:scale-102 duration-300 bg-white">
                      <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                        <img
                          src={getImageUrl(place.image)}
                          alt={place.name || 'Gambar tempat'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                          <span className="text-xs font-semibold uppercase">{place.category}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{place.location}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 truncate" title={place.name}>{place.name}</h2>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {place.description && place.description.length > 100
                            ? `${place.description.substring(0, 100)}...`
                            : place.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-center col-span-full text-gray-500 mt-8">Tidak ada tempat ditemukan sesuai filter atau pencarian Anda.</p>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Home;