# TubesPemrogramanWebRA_122140063
# Website Wisata Sungailiat

## Deskripsi Aplikasi Web

Website Wisata Sungailiat adalah platform digital yang bertujuan untuk mempromosikan keindahan alam, kekayaan budaya, dan kuliner khas Sungailiat, Bangka. Aplikasi ini menyediakan informasi detail mengenai berbagai destinasi wisata, kuliner, dan akomodasi yang ada di Sungailiat, serta memudahkan pengguna untuk mencari dan merencanakan perjalanan mereka. Website ini juga dilengkapi dengan sistem manajemen konten (CMS) untuk admin guna mengelola data tempat wisata.

Proyek ini terdiri dari dua bagian utama:
* **Frontend**: Dibangun menggunakan React JS, bertanggung jawab untuk tampilan antarmuka pengguna yang interaktif dan responsif.
* **Backend**: Dibangun menggunakan Python dengan framework Pyramid, menyediakan RESTful API untuk pengelolaan data dan logika bisnis.

## Dependensi Paket (Library)

Berikut adalah daftar dependensi utama yang dibutuhkan untuk menjalankan aplikasi ini:

### Frontend ()

* `react`: Library utama untuk membangun antarmuka pengguna.
* `react-dom`: Untuk rendering React ke DOM.
* `react-router-dom`: Untuk navigasi dan routing antar halaman.
* `tailwindcss`: Framework CSS utility-first untuk styling.
* `@tailwindcss/vite`: Plugin Tailwind CSS untuk Vite.
* `vite`: Build tool frontend modern.
* `react-responsive-carousel`: Komponen carousel untuk slider gambar.
* (Opsional, tercantum di `package.json` namun tidak aktif digunakan untuk peta utama di `PlaceDetail`): `leaflet`, `react-leaflet`.

Untuk menjalankan frontend, pastikan Anda memiliki Node.js dan npm terinstal. Instal dependensi dengan menjalankan `npm install` di direktori `frontend`
kemudian menjalankan `npm run dev` website otomatis akan berjalan di localhost:5173

### Backend ()

* `pyramid`: Framework web utama.
* `cornice`: Untuk membangun RESTful API di atas Pyramid.
* `SQLAlchemy`: ORM untuk interaksi dengan database.
* `psycopg2-binary` atau driver PostgreSQL lainnya (tidak eksplisit di `setup.py` tapi dibutuhkan untuk koneksi ke PostgreSQL yang dikonfigurasi di `development.ini`).
* `waitress`: Server WSGI production-ready.
* `alembic`: Untuk migrasi skema database.
* `transaction`, `pyramid_tm`, `zope.sqlalchemy`: Untuk manajemen transaksi.
* `passlib`: Untuk hashing password.

Untuk menjalankan backend, pastikan Anda memiliki Python dan pip terinstal. Instal dependensi dengan menjalankan `pip install -e .` (atau `pip install -r requirements.txt` jika ada) di direktori `backend/wisata_api`. Anda juga memerlukan server database PostgreSQL yang berjalan dan dikonfigurasi sesuai `development.ini`. 
setelah menginstall dependensi jalankan `pserve development.ini --reload` untuk memulai backend yang otomatis terbuka di halaman localhost:6543

## Fitur pada Aplikasi

* **Beranda Informatif**: Menampilkan carousel tempat wisata unggulan dan deskripsi singkat mengenai Sungailiat.
* **Daftar Tempat Wisata**: Menampilkan daftar semua tempat wisata yang tersedia dengan gambar mini dan informasi dasar.
* **Detail Tempat Wisata**: Halaman individual untuk setiap tempat wisata yang menampilkan nama, deskripsi lengkap, kategori, lokasi, gambar, dan peta Google Maps (jika tersedia).
* **Pencarian dan Filter**: Pengguna dapat mencari tempat berdasarkan nama atau deskripsi, dan memfilter berdasarkan kategori (misalnya: Wisata Pantai, Kuliner, Tempat Ibadah, dll.).
* **Galeri Foto**: Halaman khusus untuk menampilkan koleksi gambar-gambar dari berbagai destinasi wisata di Sungailiat, dengan fitur "like".
* **Halaman Tentang Kami**: Informasi mengenai misi dan tim pengembang aplikasi.
* **Panel Admin (Terproteksi)**:
    * Login untuk admin.
    * Kemampuan untuk Membuat (Create), Membaca (Read), Memperbarui (Update), dan Menghapus (Delete) data tempat wisata.
    * Formulir untuk menambah dan mengedit detail tempat, termasuk nama, deskripsi, kategori, lokasi, gambar, dan URL embed Google Maps.
* **Desain Responsif**: Tampilan website dapat menyesuaikan diri dengan baik pada berbagai ukuran layar (desktop, tablet, mobile).

## Referensi

* Dokumentasi React JS: [https://react.dev/](https://react.dev/)
* Dokumentasi Vite: [https://vitejs.dev/](https://vitejs.dev/)
* Dokumentasi Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
* Dokumentasi React Router DOM: [https://reactrouter.com/](https://reactrouter.com/)
* Dokumentasi Pyramid Framework: [https://docs.pylonsproject.org/projects/pyramid/en/latest/](https://docs.pylonsproject.org/projects/pyramid/en/latest/)
* Dokumentasi SQLAlchemy: [https://www.sqlalchemy.org/](https://www.sqlalchemy.org/)
* Dokumentasi Cornice: [https://cornice.readthedocs.io/](https://cornice.readthedocs.io/)
* Dokumentasi Alembic: [https://alembic.sqlalchemy.org/](https://alembic.sqlalchemy.org/)
