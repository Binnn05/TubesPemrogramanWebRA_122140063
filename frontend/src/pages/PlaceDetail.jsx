import { useParams, Link } from "react-router-dom";

function PlaceDetail() {
  const { id } = useParams();

  // Dummy data 
  const data = {
    1: {
      name: "Kedai Kopi Tung Tau",
      description: `Kedai Kopi Tung Tau adalah tempat legendaris di Sungailiat yang dikenal dengan roti bakar dan kopi khas Bangka. Tempat ini menjadi salah satu destinasi favorit wisatawan lokal maupun luar daerah.`,
      image: "/images/cafe-tungtau.jpg",
      mapsEmbed: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.73930694422!2d106.11436257496686!3d-1.84973099813336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e22f2c000000001%3A0x91813cab036a8ac9!2sKedai%20Kopi%20Tung%20Tau!5e0!3m2!1sen!2sid!4v1747253138191!5m2!1sen!2sid`
    }
  };

  const place = data[id];

  if (!place) {
    return <p className="p-4">Tempat tidak ditemukan.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/" className="text-blue-500 underline mb-4 block">← Kembali</Link>
      <h1 className="text-3xl font-bold mb-4">{place.name}</h1>
      <img src={place.image} alt={place.name} className="w-full h-64 object-cover rounded mb-4" />
      <p className="text-gray-700 mb-6">{place.description}</p>
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
    </div>
  );
}

export default PlaceDetail;
