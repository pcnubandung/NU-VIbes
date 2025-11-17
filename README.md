# Koperasi NU Vibes - Sistem Manajemen Koperasi

Aplikasi web full-stack untuk manajemen koperasi dengan fitur lengkap untuk mengelola anggota, simpanan, transaksi keuangan, dan Sisa Hasil Usaha (SHU).

## Fitur Utama

### Dashboard Admin
1. **Beranda** - Ringkasan statistik dan grafik
   - Total Anggota Koperasi
   - Total Simpanan (Pokok + Wajib + Khusus)
   - Total Penjualan
   - Total Keuntungan
   - Total Pengeluaran
   - Laba/Rugi Koperasi
   - Grafik Komposisi Simpanan
   - Grafik Laba/Rugi

2. **Informasi Data Koperasi**
   - Nama, Alamat, Kontak
   - Nomor Induk Koperasi, NIB, Badan Hukum
   - Upload Logo
   - Edit Informasi

3. **Manajemen Unit Usaha**
   - Data Usaha
   - Aset dan Inventaris
   - Upload Logo Usaha
   - CRUD Unit Usaha

4. **Manajemen Anggota**
   - Data Anggota
   - Data Pengurus
   - Data Karyawan
   - CRUD lengkap
   - Upload Foto
   - Import Excel (template)

5. **Transaksi Simpanan** ⭐ UPDATED!
   - **Unified Interface** - Semua jenis simpanan dalam 1 halaman
   - Dropdown pilihan: Pokok, Wajib, Khusus, Sukarela
   - Metode: Tunai/Transfer/E-Wallet
   - Cetak/Download Struk PDF
   - Input Partisipasi Anggota Harian

6. **Transaksi Keuangan**
   - Hasil Penjualan
   - Keuntungan
   - Pengeluaran/Biaya-biaya
   - Pendapatan Lain ⭐ NEW!
   - Per Unit Usaha
   - Cetak Struk Transaksi

7. **Laporan Keuangan**
   - Laporan Simpanan
   - Laporan Penjualan
   - Laporan Pengeluaran
   - Laporan Laba/Rugi
   - Neraca (Aktiva & Pasiva)
   - **Laporan Arus Kas** ⭐ NEW!
     - Aktivitas Operasional
     - Aktivitas Investasi
     - Aktivitas Pendanaan
     - Kas Akhir Periode
   - Filter: Harian/Bulanan/Tahunan
   - Cetak/Download PDF & Excel

8. **Sisa Hasil Usaha (SHU)**
   - Komponen SHU (Cadangan, Jasa Simpanan, Jasa Transaksi, dll)
   - Perhitungan Otomatis
   - SHU Per Anggota
   - Berdasarkan Indeks Simpanan & Partisipasi

9. **Pengaturan**
   - Manajemen User
   - Multi-level Login (Admin, Pengurus, Kasir)
   - Hak Akses Custom
   - CRUD User

## Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Charts**: Chart.js
- **Authentication**: JWT + bcrypt

## Instalasi

1. Clone atau download repository ini

2. Install dependencies:
```bash
npm install
```

3. Jalankan server:
```bash
npm start
```

4. Buka browser dan akses:
```
http://localhost:3000
```

## Login Default

- **Username**: admin
- **Password**: admin123

## Struktur Folder

```
koperasi-nu-vibes/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── login.js
│   │   └── pages.js
│   ├── index.html
│   └── login.html
├── uploads/          (dibuat otomatis)
├── database.js
├── server.js
├── routes-anggota.js
├── routes-simpanan.js
├── package.json
└── README.md
```

## Fitur Responsif

Aplikasi ini fully responsive dan dapat diakses dari:
- Desktop/PC
- Tablet
- Smartphone

## Tema

- **Warna Dominan**: Hijau (#2d5016, #4a7c2c)
- **Warna Aksen**: Kuning Keemasan (#d4af37, #f4e4a6)
- **Desain**: Modern, Elegan, Clean, Futuristik
- **Border Radius**: Halus dan konsisten

## Keamanan

- Password di-hash menggunakan bcrypt
- JWT untuk autentikasi
- Session management
- Role-based access control

## Catatan Pengembangan

Untuk development dengan auto-reload:
```bash
npm run dev
```

## Fitur Terbaru (v2.2.0)

### Laporan Arus Kas ⭐ NEW!
Laporan keuangan lengkap sesuai standar akuntansi koperasi:
- **Aktivitas Operasional**: Kas dari penjualan dan biaya operasional
- **Aktivitas Investasi**: Kas dari pembelian/penjualan aset
- **Aktivitas Pendanaan**: Kas dari simpanan anggota
- **Kas Akhir Periode**: Saldo kas tersedia
- **Filter Periode**: Harian, Bulanan, Tahunan
- **Indikator Visual**: Warna hijau/merah untuk kas positif/negatif

Lihat dokumentasi lengkap di: `FITUR-LAPORAN-ARUS-KAS.md`

### Transaksi Simpanan - Unified Interface (v2.1.0)
Semua transaksi simpanan kini dalam 1 halaman yang lebih simpel:
- **1 Halaman untuk Semua**: Pokok, Wajib, Khusus, Sukarela
- **Dropdown Jenis**: Pilih jenis simpanan saat input transaksi
- **Tabel Terpadu**: Lihat semua transaksi dengan badge jenis
- **Form Dinamis**: Field otomatis menyesuaikan jenis simpanan
- **Lebih Efisien**: Tidak perlu pindah-pindah halaman

Lihat dokumentasi lengkap di: `UPDATE-SIMPANAN-UNIFIED.md`

### Pendapatan Lain (v2.0.0)
Fitur untuk mencatat pendapatan non-operasional koperasi:
- **Kategori**: Bunga Bank, Sewa Aset, Jasa Konsultasi, Komisi, Hibah, Donasi, Lainnya
- **Integrasi**: Otomatis masuk ke laporan keuangan
- **Formula Baru**: Total Pendapatan = Laba Kotor + Pendapatan Lain
- **Cetak Struk**: Format kwitansi profesional
- **Member Portal**: Transparansi pendapatan lain untuk anggota

Lihat dokumentasi lengkap di: `RINGKASAN-FITUR-PENDAPATAN-LAIN.md`

## Hosting & Deployment 🚀

Aplikasi ini **BISA** di-hosting di website Anda! Pilihan platform:

### 1. VPS (Recommended) ⭐
- **Platform**: DigitalOcean, Vultr, Linode, AWS EC2
- **Harga**: Mulai $5-10/bulan
- **Cocok untuk**: Koperasi menengah-besar (50+ anggota)

### 2. Shared Hosting
- **Platform**: Hostinger, Niagahoster (yang support Node.js)
- **Harga**: Mulai Rp 20.000-50.000/bulan
- **Cocok untuk**: Koperasi kecil (< 50 anggota)

### 3. Platform as a Service (PaaS)
- **Platform**: Heroku, Railway, Render
- **Harga**: Free tier tersedia, mulai $7/bulan
- **Cocok untuk**: Testing atau koperasi kecil

### 4. Hosting Lokal (On-Premise)
- **Platform**: Server sendiri di kantor
- **Harga**: Biaya hardware + listrik + internet
- **Cocok untuk**: Koperasi yang ingin kontrol penuh

**📖 Panduan Lengkap:** Lihat `PANDUAN-HOSTING.md` untuk tutorial step-by-step deploy ke production!

**✅ Checklist Deploy:** Gunakan `DEPLOY-CHECKLIST.md` untuk memastikan deployment sukses!

## Dokumentasi

### Panduan Utama
- `README.md` - Dokumentasi utama (file ini)
- `INSTALASI.md` - Panduan instalasi detail
- `QUICK-START.md` - Panduan cepat memulai
- `PANDUAN-HOSTING.md` - ⭐ Panduan hosting & deployment
- `DEPLOY-CHECKLIST.md` - ⭐ Checklist deploy production

### Dokumentasi Fitur
- `DOKUMENTASI-FINAL.md` - Dokumentasi lengkap semua fitur
- `FITUR.md` - Daftar fitur sistem
- `FITUR-PENDAPATAN-LAIN.md` - Detail fitur Pendapatan Lain
- `FITUR-NERACA-MEMBER.md` - Detail fitur Neraca di Member Portal
- `FIX-NERACA-BALANCE.md` - Perbaikan balance neraca
- `FIX-LAPORAN-LABA-RUGI.md` - Perbaikan formula laba/rugi

### File Konfigurasi
- `.env.example` - Template environment variables
- `Procfile` - Konfigurasi untuk Heroku
- `ecosystem.config.js` - Konfigurasi PM2 untuk production
- `nginx.conf.example` - Template konfigurasi Nginx
- `backup.sh` - Script backup database otomatis

## Support & Bantuan

Butuh bantuan deploy atau kustomisasi? Hubungi developer atau hire freelancer untuk setup awal.

## Lisensi

© 2024 Koperasi NU Vibes. All rights reserved.
