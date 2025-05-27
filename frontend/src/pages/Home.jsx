import { useEffect, useState } from "react";
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import { Link } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";

function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios.get("http://localhost:6543/api/places")
      .then(res => setPlaces(res.data))
      .catch(err => console.error("Gagal memuat data:", err));
  }, []);

  const defaultImages = [
    "pantai-tikus.jpg",
    "padepokan.jpg",
    "cafe-tungtau.jpg"
  ];

  const filtered = places.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="px-4 py-6">
      {/* Deskripsi Singkat */}
      <div className="max-w-3xl mx-auto text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Selamat Datang di Website Wisata Sungailiat</h2>
        <p className="text-gray-700">
          Sungailiat adalah kota di pesisir timur Pulau Bangka yang terkenal dengan keindahan pantainya,
          budaya lokal yang kuat, serta kuliner khas lautan. Temukan berbagai destinasi
          menarik untuk liburan Anda di kota ini.
        </p>
      </div>

      {/* Galeri */}
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={3000}
        className="max-w-4xl mx-auto rounded-lg overflow-hidden mb-8"
      >
        <div>
          <img src="/images/pantai-tikus.jpg" alt="Pantai Tikus Emas" className="h-100 w-full object-cover" />
          <p className="legend">Pantai Tikus Emas</p>
        </div>
        <div>
          <img src="/images/padepokan.jpg" alt="Padepokan" className="h-100 w-full object-cover" />
          <p className="legend">Padepokan Putri Tri Agung</p>
        </div>
        <div>
          <img src="/images/cafe-tungtau.jpg" alt="Kedai Kopi" className="h-100 w-full object-cover" />
          <p className="legend">Kedai Kopi Tung Tau</p>
        </div>
      </Carousel>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari tempat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full max-w-md"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full max-w-xs"
        >
          <option value="all">Semua Kategori</option>
          <option value="wisata">Wisata</option>
          <option value="resto">Resto</option>
          <option value="penginapan">Penginapan</option>
        </select>
      </div>

      {/* Daftar Tempat */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((place, index) => (
          <div key={place.id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
            <img
              src={`/images/${defaultImages[index % defaultImages.length]}`}
              alt={place.name}
              className="w-full h-32 object-cover rounded mb-3"
            />
            <h2 className="text-xl font-semibold mb-2">{place.name}</h2>
            <p className="text-sm text-gray-700 mb-3">{place.description}</p>
            <Link
              to={`/place/${place.id}`}
              className="text-blue-600 hover:underline text-sm"
            >
              Lihat Detail →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
