import { useEffect, useState, useCallback, useRef } from 'react';

function Admin() {
  const [places, setPlaces] = useState([]);
  const initialFormState = {
    id: '',
    name: '',
    description: '',
    category: '',
    location: '',
    image: '',
    mapsEmbed: ''
  };
  const [form, setForm] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  
  const fileInputRef = useRef(null);

  const API_URL = 'http://localhost:6543/api/places';

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPlaces(data);
    } catch (err) {
      setError(err.message);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setCurrentImageUrl(isEditing && form.image ? getDisplayImageUrl(form.image) : '');
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setImageFile(null);
    setIsEditing(false);
    setSubmitError(null);
    setCurrentImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.name || !form.category || !form.location) {
      alert('Nama, Kategori, dan Lokasi harus diisi!');
      return;
    }

    // Untuk tempat baru (bukan mode edit), gambar wajib diisi
    if (!isEditing && !imageFile) {
      alert('Silakan pilih gambar untuk tempat baru.');
      return;
    }

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      alert('Sesi admin tidak ditemukan. Silakan login kembali.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description || '');
    formData.append('category', form.category);
    formData.append('location', form.location);
    formData.append('mapsEmbed', form.mapsEmbed || '');

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }
    // Jika sedang mengedit dan tidak ada file gambar baru,
    // backend tidak akan mengubah gambar yang sudah ada. Tidak perlu mengirim field image lama.

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/${form.id}` : API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          // 'Content-Type': 'multipart/form-data' TIDAK PERLU di-set manual untuk FormData,
          // browser akan menanganinya secara otomatis termasuk boundary.
        },
        body: formData,
      });

      // Cek apakah respons OK (status 200-299)
      if (response.ok) { // response.ok mencakup status 200, 201, dll.
        const result = await response.json(); // Asumsikan sukses selalu mengembalikan JSON
        alert(isEditing ? 'Tempat berhasil diperbarui!' : `Tempat "${result.name}" berhasil ditambahkan!`);
        fetchPlaces(); // Muat ulang daftar tempat
        resetForm();   // Reset form
      } else {
        // Jika respons tidak OK, baca body sebagai teks dulu (sekali saja)
        let errorDetailMessage = `Gagal menyimpan data. Status: ${response.status} ${response.statusText}`;
        const responseText = await response.text(); // Baca body sebagai teks

        if (responseText) {
          try {
            // Coba parse teks tersebut sebagai JSON
            const errorData = JSON.parse(responseText);
            if (errorData && (errorData.detail || errorData.message)) {
              errorDetailMessage = errorData.detail || errorData.message;
            } else if (typeof errorData === 'string' && errorData.length > 0) {
              errorDetailMessage = errorData; // Jika errorData adalah string non-kosong
            } else if (responseText) { // Fallback ke responseText jika parsing JSON tidak menghasilkan pesan yang berguna
              errorDetailMessage = responseText.substring(0, 200); // Batasi panjang untuk error HTML
            }
          } catch (e_parse) {
            // Jika gagal parse sebagai JSON, gunakan teks respons (mungkin HTML error dari server)
            console.warn("Response error body is not valid JSON:", responseText);
            errorDetailMessage = responseText.substring(0, 200); // Batasi panjangnya
          }
        }
        throw new Error(errorDetailMessage);
      }
    } catch (err) {
      // err.message di sini akan berisi pesan error yang sudah diproses atau error jaringan
      setSubmitError(err.message);
      alert(`Terjadi Kesalahan: ${err.message}`);
      console.error('Submit error details:', err);
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tempat ini?')) {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('Sesi admin tidak ditemukan. Silakan login kembali.');
        return;
      }
      
      console.log('Deleting place with id:', id); // Tetap untuk debugging
      const deleteUrl = `${API_URL}/${id}`;
      console.log('DELETE URL:', deleteUrl); // Tetap untuk debugging

      try {
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });

        if (response.status === 200) { // Jika backend mengembalikan data setelah berhasil (misal: pesan sukses)
          const result = await response.json(); // Coba parse JSON jika ada body
          alert(result.message || 'Tempat berhasil dihapus!');
          fetchPlaces();
          if (isEditing && form.id === id) {
            resetForm();
          }
        } else if (response.status === 204) { // No Content, sukses tanpa body
          alert('Tempat berhasil dihapus!');
          fetchPlaces();
          if (isEditing && form.id === id) {
            resetForm();
          }
        } else if (response.status === 404) {
          // Pesan khusus untuk 404 Not Found
          alert('Tempat tidak ditemukan di database atau mungkin sudah dihapus sebelumnya.');
          fetchPlaces(); // Segarkan daftar untuk konsistensi
          if (isEditing && form.id === id) {
            resetForm(); // Reset form jika item yang diedit ternyata tidak ada
          }
        } else {
          // Untuk error lainnya
          let errorDetail = `Gagal menghapus tempat. Status: ${response.status}`;
          try {
            // Coba baca detail error dari body respons
            const errorData = await response.json();
            if (errorData && (errorData.detail || errorData.message)) {
              errorDetail = errorData.detail || errorData.message;
            }
          } catch (e) {
            // Jika body bukan JSON atau tidak ada detail, gunakan pesan status saja
            console.warn("Respons error penghapusan bukan JSON atau tidak memiliki field 'detail'. Status:", response.status);
          }
          throw new Error(errorDetail);
        }
      } catch (err) {
        alert(`Error: ${err.message}`);
        console.error('Delete error details:', err); // Lebih detail untuk debugging
      }
    }
  };

  const handleEdit = (place) => {
    setForm({ ...place, description: place.description || '', mapsEmbed: place.mapsEmbed || '' });
    setIsEditing(true);
    setImageFile(null);
    setCurrentImageUrl(place.image ? getDisplayImageUrl(place.image) : '');
    setSubmitError(null);
    window.scrollTo(0, 0);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const getDisplayImageUrl = (imagePath) => {
    if (!imagePath) return '/images/default-placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/images/')) return imagePath;
    return `http://localhost:6543/uploads/${imagePath.split('/').pop()}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Tempat Wisata</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-sky-700">
          {isEditing ? 'Edit Tempat Wisata' : 'Tambah Tempat Wisata Baru'}
        </h2>
        {submitError && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {submitError}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Nama Tempat Wisata"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
          <input
            name="category"
            placeholder="Kategori (contoh: Wisata Pantai)"
            value={form.category}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
          <input
            name="location"
            placeholder="Lokasi (contoh: Sungailiat, Bangka)"
            value={form.location}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />

          <div className="md:col-span-2">
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
              Gambar Tempat {isEditing && form.image && !imageFile ? '(Biarkan kosong jika tidak ingin diubah)' : (isEditing ? '' : '(Wajib diisi)')}
            </label>
            <input
              ref={fileInputRef}
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 border border-gray-300 rounded-lg cursor-pointer p-2.5"
            />
            {currentImageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Preview / Gambar Saat Ini:</p>
                <img src={currentImageUrl} alt="Preview" className="mt-1 max-h-40 rounded border" />
              </div>
            )}
            {!currentImageUrl && isEditing && form.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Gambar saat ini: {form.image ? form.image.split('/').pop() : 'Tidak ada'}</p>
                <img
                  src={getDisplayImageUrl(form.image)}
                  alt="Current"
                  className="mt-1 max-h-40 rounded border"
                  onError={(e) => { e.currentTarget.src = '/images/default-placeholder.jpg'; }}
                />
              </div>
            )}
          </div>

          <textarea
            name="description"
            placeholder="Deskripsi Tempat Wisata"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="md:col-span-2 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <textarea
            name="mapsEmbed"
            placeholder="Embed Code Google Maps (opsional)"
            value={form.mapsEmbed}
            onChange={handleChange}
            rows={3}
            className="md:col-span-2 border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <div className="md:col-span-2 flex gap-4 justify-end">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-6 rounded"
            >
              {isEditing ? 'Update' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-sky-700">Daftar Tempat Wisata</h2>
        {loading && <p>Loading tempat wisata...</p>}
        {error && <p className="text-red-600">Error saat mengambil data: {error}</p>}
        {!loading && !error && places.length === 0 && <p>Belum ada data tempat wisata.</p>}

        <ul className="space-y-4">
          {places.map((place) => (
            <li
              key={place.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white rounded shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={getDisplayImageUrl(place.image)}
                  alt={place.name}
                  className="w-24 h-16 object-cover rounded"
                  onError={(e) => { e.currentTarget.src = '/images/default-placeholder.jpg'; }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{place.name}</h3>
                  <p className="text-sm text-gray-600">{place.category}</p>
                  <p className="text-sm text-gray-600">{place.location}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  onClick={() => handleEdit(place)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(place.id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Admin;
