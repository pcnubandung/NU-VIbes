const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./koperasi.db');

db.serialize(() => {
  // Create pengumuman table
  db.run(`
    CREATE TABLE IF NOT EXISTS pengumuman (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT NOT NULL,
      konten TEXT,
      gambar TEXT NOT NULL,
      status TEXT DEFAULT 'aktif',
      tanggal_mulai DATE,
      tanggal_selesai DATE,
      urutan INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating pengumuman table:', err);
    } else {
      console.log('✅ Tabel pengumuman berhasil dibuat!');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database connection closed.');
  }
});
