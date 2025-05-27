// frontend/src/pages/About.jsx
import React from 'react';

function About() {
  return (
    // Tambahkan pt-20 di sini
    <div className="max-w-4xl mx-auto px-4 py-8 pt-20"> 
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Tentang Kami</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-sky-700">Misi Kami</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Website Pariwisata Sungailiat ini kami kembangkan dengan misi untuk mempromosikan keindahan alam, kekayaan budaya, dan kuliner khas Sungailiat, Bangka. Kami bertujuan menjadi sumber informasi terlengkap bagi para wisatawan yang ingin menjelajahi pesona kota ini.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Kami percaya bahwa dengan informasi yang akurat dan mudah diakses, setiap pengunjung dapat merencanakan perjalanan yang tak terlupakan dan merasakan keramahan masyarakat Sungailiat.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-sky-700">Siapa Kami?</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Kami adalah tim pengembang yang berdedikasi untuk menciptakan platform digital yang user-friendly dan informatif. Proyek ini merupakan bagian dari tugas akhir mata kuliah Pemrograman Web Lanjut, yang kami kerjakan dengan semangat untuk berkontribusi pada pengembangan pariwisata lokal.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Terima kasih telah mengunjungi website kami. Kami berharap informasi yang kami sajikan bermanfaat bagi perjalanan Anda di Sungailiat!
        </p>
        <div className="mt-6 text-center text-gray-600">
          <p className="font-medium">Tim Pengembang:</p>
          <ul className="list-disc list-inside mx-auto max-w-sm mt-2">
            <li>Nama Anggota 1 (NIM)</li>
            <li>Nama Anggota 2 (NIM)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;