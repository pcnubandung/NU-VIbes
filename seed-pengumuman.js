const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./koperasi.db');

// Sample pengumuman data
const pengumumanData = [
  {
    judul: 'Selamat Datang di Koperasi NU Vibes',
    konten: 'Terima kasih telah menjadi bagian dari keluarga besar Koperasi NU Vibes. Mari bersama membangun ekonomi yang lebih baik.',
    gambar: 'banner-welcome.jpg',
    status: 'aktif',
    urutan: 1
  },
  {
    judul: 'Rapat Anggota Tahunan 2024',
    konten: 'Akan dilaksanakan pada tanggal 15 Desember 2024. Kehadiran seluruh anggota sangat diharapkan.',
    gambar: 'banner-rat.jpg',
    status: 'aktif',
    tanggal_mulai: '2024-11-01',
    tanggal_selesai: '2024-12-15',
    urutan: 2
  },
  {
    judul: 'Promo Simpanan Sukarela',
    konten: 'Dapatkan bunga spesial 8% untuk simpanan sukarela minimal Rp 5.000.000. Promo terbatas!',
    gambar: 'banner-promo.jpg',
    status: 'aktif',
    tanggal_mulai: '2024-11-01',
    tanggal_selesai: '2024-12-31',
    urutan: 3
  }
];

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO pengumuman (judul, konten, gambar, status, tanggal_mulai, tanggal_selesai, urutan)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  pengumumanData.forEach(item => {
    stmt.run(
      item.judul,
      item.konten,
      item.gambar,
      item.status,
      item.tanggal_mulai || null,
      item.tanggal_selesai || null,
      item.urutan
    );
  });
  
  stmt.finalize((err) => {
    if (err) {
      console.error('Error seeding pengumuman:', err);
    } else {
      console.log('✅ Sample pengumuman berhasil ditambahkan!');
      console.log(`   Total: ${pengumumanData.length} pengumuman`);
      console.log('\n📝 Catatan:');
      console.log('   - Gambar banner masih placeholder (banner-*.jpg)');
      console.log('   - Silakan upload gambar asli melalui admin dashboard');
      console.log('   - Atau ganti dengan gambar yang sudah ada di folder uploads/');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('\nDatabase connection closed.');
  }
});
