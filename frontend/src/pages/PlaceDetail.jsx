// frontend/src/pages/PlaceDetail.jsx
import { useParams, Link } from "react-router-dom";
import { dummyPlaces } from "../data/placesData"; //

function PlaceDetail() {
  const { id } = useParams();

  const place = dummyPlaces.find(p => p.id === id); //

  if (!place) {
    return <p className="p-4 text-center">Tempat tidak ditemukan.</p>;
  }

  return (
    // Tambahkan pt-20 di sini
    <div className="max-w-3xl mx-auto px-4 py-6 pt-20"> 
      <Link to="/" className="text-blue-500 underline mb-4 block">← Kembali</Link>
      <h1 className="text-3xl font-bold mb-4">{place.name}</h1>
      <img src={place.image} alt={place.name} className="w-full h-64 object-cover rounded mb-4" />
      <p className="text-gray-700 mb-6">{place.description}</p>
      {place.mapsEmbed && (
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={place.mapsEmbed}
            width="100%"
            height="400"
            allowFullScreen=""
            loading="lazy"
            className="rounded"
          />
        </div>
      )}
    </div>
  );
}

export default PlaceDetail;