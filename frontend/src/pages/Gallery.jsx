import React, { useState, useEffect } from 'react';

function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [likedImages, setLikedImages] = useState(() => {
    try {
      const storedLikes = localStorage.getItem('galleryLikes');
      return storedLikes ? JSON.parse(storedLikes) : {};
    } catch (error) {
      console.error("Failed to parse liked images from localStorage", error);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('galleryLikes', JSON.stringify(likedImages));
  }, [likedImages]);

  useEffect(() => {
    const fetchGalleryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:6543/api/places');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const items = data.map(place => ({
          id: place.id.toString(), // Pastikan ID adalah string untuk konsistensi dengan likedImages
          src: getDisplayImageUrl(place.image),
          alt: place.name,
          description: place.description ? place.description.substring(0, 100) + (place.description.length > 100 ? '...' : '') : 'Deskripsi tidak tersedia.',
          originalImageSrc: place.image // Simpan path original jika diperlukan
        }));
        setGalleryItems(items);
      } catch (err) {
        setError(err.message);
        setGalleryItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  const getDisplayImageUrl = (imagePath) => {
    if (!imagePath) return '/images/default-placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/images/')) return imagePath;
    return `http://localhost:6543/uploads/${imagePath.split('/').pop()}`;
  };

  const handleLikeToggle = (id) => {
    setLikedImages(prevLikedImages => {
      const newLikedImages = { ...prevLikedImages };
      if (newLikedImages[id]) {
        delete newLikedImages[id];
      } else {
        newLikedImages[id] = true;
      }
      return newLikedImages;
    });
  };

  if (loading) {
    return <p className="p-4 text-center pt-20">Memuat galeri...</p>;
  }

  if (error) {
    return <p className="p-4 text-center pt-20 text-red-500">Gagal memuat galeri: {error}</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-20">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Galeri Wisata Sungailiat</h1>

      {galleryItems.length === 0 && !loading && (
        <p className="text-center text-gray-500">Tidak ada gambar dalam galeri.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {galleryItems.map(image => (
          <div key={image.id} className="relative bg-white rounded-lg shadow-lg overflow-hidden group">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.currentTarget.src = '/images/default-placeholder.jpg'; e.currentTarget.alt = 'Gambar tidak tersedia';}}
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={image.alt}>{image.alt}</h2>
              <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>
            </div>
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