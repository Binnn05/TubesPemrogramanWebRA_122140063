// frontend/src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import { Link } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { dummyPlaces as initialDummyPlaces } from "../data/placesData";

function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setPlaces(initialDummyPlaces);
  }, []);

  const filtered = places.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.category.toLowerCase().includes(filter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen">

      {/* Bagian Header Utama dengan Gambar Latar Belakang Penuh */}
      <div
        className="relative w-full h-[500px] bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center text-white p-4"
        style={{ backgroundImage: `url('/images/pantai-tikus.jpg')` }}
      >
        {/* Overlay untuk transparansi */}
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
          <div className="lg:col-span-1 w-full flex justify-center"> {/* Mengambil 1 kolom untuk Carousel, dan menengahkan */}
            <Carousel
              autoPlay
              infiniteLoop
              showThumbs={false}
              showStatus={false}
              interval={3000}
              className="w-full max-w-sm rounded-lg overflow-hidden" // Atur max-w-sm atau max-w-md untuk membatasi ukuran carousel
            >
              {initialDummyPlaces.slice(0, 3).map(place => (
                <div key={place.id}>
                  <img src={place.image} alt={place.name} className="h-100 w-full object-cover" />
                  <p className="legend">{place.name}</p>
                </div>
              ))}
            </Carousel>
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

        <div className="max-w-7xl mx-auto px-4 py-8"> {/* Container untuk filter & daftar tempat agar terpusat */}
            {/* Filter & Search */}
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
                <option value="wisata">Wisata</option>
                <option value="resto">Resto</option>
                <option value="penginapan">Penginapan</option>
                <option value="kuliner">Kuliner</option>
                <option value="wisata pantai">Wisata Pantai</option>
                <option value="tempat ibadah">Tempat Ibadah</option>
              </select>
            </div>

            {/* Daftar Tempat */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full max-w-4xl mx-auto">
              {filtered.map((place) => (
                <Link to={`/place/${place.id}`} key={place.id} className="block group">
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform transform hover:scale-102 duration-300 bg-white">
                    <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
                      <img
                        src={place.image}
                        alt={place.name}
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
                      <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{place.name}</h2>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {place.description.length > 100
                          ? `${place.description.substring(0, 100)}...`
                          : place.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && (
                  <p className="text-center col-span-full text-gray-500">Tidak ada tempat ditemukan.</p>
              )}
            </div>
        </div> {/* Akhir Container untuk filter & daftar tempat */}

      </div> {/* Akhir Div padding top untuk navbar fixed */}
    </div>
  );
}

export default Home;