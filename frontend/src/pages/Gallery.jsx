// frontend/src/pages/Gallery.jsx
import React, { useState, useEffect } from 'react';

// Data dummy untuk galeri
const galleryImages = [
  { id: 'g1', src: '/images/pantai-tikus.jpg', alt: 'Pantai Tikus Emas', description: 'Keindahan Pantai Tikus Emas yang memukau.' },
  { id: 'g2', src: '/images/padepokan.jpg', alt: 'Padepokan Puri Tri Agung', description: 'Arsitektur megah Padepokan Puri Tri Agung.' },
  { id: 'g3', src: '/images/cafe-tungtau.jpg', alt: 'Kedai Kopi Tung Tau', description: 'Suasana klasik Kedai Kopi Tung Tau.' },
  { id: 'g4', src: '/images/seafood.jpg', alt: 'Restoran Seafood Pak Janggut', description: 'Hidangan laut segar khas Sungailiat.' },
  { id: 'g5', src: '/images/penginapan.jpg', alt: 'Penginapan Pantai Indah', description: 'Pemandangan dari Penginapan Pantai Indah.' },
  // Tambahkan lebih banyak gambar jika Anda punya!
  // Pastikan path gambar sudah benar dan file gambar ada di public/images
];

function Gallery() {
  // State untuk menyimpan ID gambar yang disukai pengguna
  // Mengambil dari localStorage saat inisialisasi
  const [likedImages, setLikedImages] = useState(() => {
    try {
      const storedLikes = localStorage.getItem('galleryLikes');
      return storedLikes ? JSON.parse(storedLikes) : {};
    } catch (error) {
      console.error("Failed to parse liked images from localStorage", error);
      return {};
    }
  });

  // Simpan perubahan likedImages ke localStorage setiap kali ada perubahan
  useEffect(() => {
    localStorage.setItem('galleryLikes', JSON.stringify(likedImages));
  }, [likedImages]);

  const handleLikeToggle = (id) => {
    setLikedImages(prevLikedImages => {
      const newLikedImages = { ...prevLikedImages };
      if (newLikedImages[id]) {
        // Jika sudah disukai, batalkan suka
        delete newLikedImages[id];
      } else {
        // Jika belum disukai, suka
        newLikedImages[id] = true;
      }
      return newLikedImages;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-20"> {/* pt-20 untuk kompensasi navbar */}
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Galeri Wisata Sungailiat</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {galleryImages.map(image => (
          <div key={image.id} className="relative bg-white rounded-lg shadow-lg overflow-hidden group">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{image.alt}</h2>
              <p className="text-sm text-gray-600">{image.description}</p>
            </div>
            {/* Tombol Like/Suka */}
            <button
              onClick={() => handleLikeToggle(image.id)}
              className={`absolute top-3 right-3 p-2 rounded-full ${likedImages[image.id] ? 'bg-red-500 text-white' : 'bg-white text-gray-500'} shadow-md hover:scale-110 transition-transform duration-200 focus:outline-none`}
              aria-label={likedImages[image.id] ? "Unlike this image" : "Like this image"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill={likedImages[image.id] ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;