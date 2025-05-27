import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="font-semibold text-lg">Pariwisata Sungailiat</p>
        <p className="text-sm mt-2">📍 Sungailiat, Bangka</p>
        <p className="text-sm">☎️ 0812-3456-7890 | 📧 info@sungailiatwisata.id</p>
        <p className="text-sm mt-2">© {new Date().getFullYear()} Sungailiat Tourism. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
