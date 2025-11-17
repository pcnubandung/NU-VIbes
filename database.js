const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database('./koperasi.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database connected successfully');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Tabel Informasi Koperasi
    db.run(`CREATE TABLE IF NOT EXISTS koperasi_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_koperasi TEXT NOT NULL,
      alamat TEXT,
      nomor_telpon TEXT,
      email TEXT,
      nomor_induk_koperasi TEXT,
      nomor_induk_berusaha TEXT,
      nomor_badan_hukum TEXT,
      tanggal_berdiri DATE,
      logo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabel Unit Usaha
    db.run(`CREATE TABLE IF NOT EXISTS unit_usaha (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_usaha TEXT NOT NULL,
      jenis_usaha TEXT,
      deskripsi TEXT,
      logo TEXT,
      status TEXT DEFAULT 'Aktif',
      tanggal_mulai DATE,
      modal_awal REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabel Aset dan Inventaris
    db.run(`CREATE TABLE IF NOT EXISTS aset_inventaris (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_usaha_id INTEGER,
      nama_aset TEXT NOT NULL,
      kategori TEXT,
      nilai REAL DEFAULT 0,
      nilai_sekarang REAL DEFAULT 0,
      tanggal_perolehan DATE,
      kondisi TEXT,
      FOREIGN KEY (unit_usaha_id) REFERENCES unit_usaha(id)
    )`);

    // Tabel Users (untuk login)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nama_lengkap TEXT NOT NULL,
      role TEXT NOT NULL,
      hak_akses TEXT,
      foto TEXT,
      status TEXT DEFAULT 'aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabel Anggota
    db.run(`CREATE TABLE IF NOT EXISTS anggota (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomor_anggota TEXT UNIQUE NOT NULL,
      nama_lengkap TEXT NOT NULL,
      nik TEXT,
      tempat_lahir TEXT,
      tanggal_lahir DATE,
      jenis_kelamin TEXT,
      alamat TEXT,
      nomor_telpon TEXT,
      email TEXT,
      pekerjaan TEXT,
      foto TEXT,
      tanggal_bergabung DATE,
      status TEXT DEFAULT 'aktif',
      username TEXT,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating anggota table:', err);
      } else {
        // Add username and password columns if they don't exist (for existing databases)
        db.run(`ALTER TABLE anggota ADD COLUMN username TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding username column:', err);
          }
        });
        db.run(`ALTER TABLE anggota ADD COLUMN password TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding password column:', err);
          }
        });
        db.run(`ALTER TABLE anggota ADD COLUMN foto_ktp TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding foto_ktp column:', err);
          }
        });
      }
    });

    // Tabel Pengurus
    db.run(`CREATE TABLE IF NOT EXISTS pengurus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anggota_id INTEGER,
      jabatan TEXT NOT NULL,
      periode_mulai DATE,
      periode_selesai DATE,
      status TEXT DEFAULT 'aktif',
      FOREIGN KEY (anggota_id) REFERENCES anggota(id)
    )`);

    // Tabel Karyawan
    db.run(`CREATE TABLE IF NOT EXISTS karyawan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomor_karyawan TEXT UNIQUE NOT NULL,
      nama_lengkap TEXT NOT NULL,
      nik TEXT,
      tempat_lahir TEXT,
      tanggal_lahir DATE,
      jenis_kelamin TEXT,
      alamat TEXT,
      nomor_telpon TEXT,
      email TEXT,
      jabatan TEXT,
      unit_usaha_id INTEGER,
      foto TEXT,
      tanggal_bergabung DATE,
      gaji REAL DEFAULT 0,
      status TEXT DEFAULT 'aktif',
      FOREIGN KEY (unit_usaha_id) REFERENCES unit_usaha(id)
    )`);

    // Tabel Simpanan Pokok
    db.run(`CREATE TABLE IF NOT EXISTS simpanan_pokok (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anggota_id INTEGER NOT NULL,
      jumlah REAL NOT NULL,
      tanggal_transaksi DATE NOT NULL,
      metode_pembayaran TEXT,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (anggota_id) REFERENCES anggota(id)
    )`);

    // Tabel Simpanan Wajib
    db.run(`CREATE TABLE IF NOT EXISTS simpanan_wajib (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anggota_id INTEGER NOT NULL,
      jumlah REAL NOT NULL,
      tanggal_transaksi DATE NOT NULL,
      metode_pembayaran TEXT,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (anggota_id) REFERENCES anggota(id)
    )`);

    // Tabel Simpanan Khusus
    db.run(`CREATE TABLE IF NOT EXISTS simpanan_khusus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anggota_id INTEGER NOT NULL,
      jumlah REAL NOT NULL,
      tanggal_transaksi DATE NOT NULL,
      metode_pembayaran TEXT,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (anggota_id) REFERENCES anggota(id)
    )`);

    // Tabel Simpanan Sukarela
    db.run(`CREATE TABLE IF NOT EXISTS simpanan_sukarela (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anggota_id INTEGER NOT NULL,
      jumlah REAL NOT NULL,
      jenis TEXT,
      tanggal_transaksi DATE NOT NULL,
      metode_pembayaran TEXT,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (anggota_id) REFERENCES anggota(id)
    )`);

    // Tabel Partisipasi Anggota
    db.run(`CREATE TABLE IF NOT EXISTS partisipasi_anggota (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anggota_id INTEGER NOT NULL,
      unit_usaha_id INTEGER,
      jumlah_transaksi REAL NOT NULL,
      tanggal_transaksi DATE NOT NULL,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (anggota_id) REFERENCES anggota(id),
      FOREIGN KEY (unit_usaha_id) REFERENCES unit_usaha(id)
    )`);

    // Tabel Transaksi Penjualan
    db.run(`CREATE TABLE IF NOT EXISTS transaksi_penjualan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_usaha_id INTEGER NOT NULL,
      kategori TEXT DEFAULT 'Barang',
      tanggal_transaksi DATE NOT NULL,
      jumlah_penjualan REAL NOT NULL,
      hpp REAL DEFAULT 0,
      keuntungan REAL DEFAULT 0,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_usaha_id) REFERENCES unit_usaha(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating transaksi_penjualan table:', err);
      } else {
        // Add kategori column if it doesn't exist (for existing databases)
        db.run(`ALTER TABLE transaksi_penjualan ADD COLUMN kategori TEXT DEFAULT 'Barang'`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding kategori column:', err);
          }
        });
      }
    });

    // Tabel Pengeluaran
    db.run(`CREATE TABLE IF NOT EXISTS pengeluaran (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_usaha_id INTEGER,
      kategori TEXT NOT NULL,
      qty INTEGER DEFAULT 1,
      harga REAL DEFAULT 0,
      jumlah REAL NOT NULL,
      tanggal_transaksi DATE NOT NULL,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_usaha_id) REFERENCES unit_usaha(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating pengeluaran table:', err);
      } else {
        // Add qty and harga columns if they don't exist (for existing databases)
        db.run(`ALTER TABLE pengeluaran ADD COLUMN qty INTEGER DEFAULT 1`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding qty column:', err);
          }
        });
        db.run(`ALTER TABLE pengeluaran ADD COLUMN harga REAL DEFAULT 0`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('Error adding harga column:', err);
          }
        });
      }
    });

    // Tabel Pendapatan Lain
    db.run(`CREATE TABLE IF NOT EXISTS pendapatan_lain (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_usaha_id INTEGER,
      kategori TEXT NOT NULL,
      jumlah REAL NOT NULL,
      tanggal_transaksi DATE NOT NULL,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_usaha_id) REFERENCES unit_usaha(id)
    )`);

    // Tabel Komponen SHU
    db.run(`CREATE TABLE IF NOT EXISTS komponen_shu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tahun INTEGER NOT NULL,
      cadangan REAL DEFAULT 0,
      jasa_simpanan REAL DEFAULT 0,
      jasa_transaksi REAL DEFAULT 0,
      pengurus_pengawas REAL DEFAULT 0,
      pegawai REAL DEFAULT 0,
      dana_pendidikan REAL DEFAULT 0,
      dana_sosial REAL DEFAULT 0,
      dana_pengembangan REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabel SHU Anggota
    db.run(`CREATE TABLE IF NOT EXISTS shu_anggota (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anggota_id INTEGER NOT NULL,
      tahun INTEGER NOT NULL,
      shu_simpanan REAL DEFAULT 0,
      shu_transaksi REAL DEFAULT 0,
      total_shu REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (anggota_id) REFERENCES anggota(id)
    )`);

    // Tabel Dokumen RAT
    db.run(`CREATE TABLE IF NOT EXISTS dokumen_rat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tahun INTEGER NOT NULL,
      nama_dokumen TEXT NOT NULL,
      file_path TEXT NOT NULL,
      tanggal_upload DATE NOT NULL,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert data awal
    insertInitialData();
  });
}

function insertInitialData() {
  // Cek apakah sudah ada data
  db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (row.count === 0) {
      // Insert default admin user
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT INTO users (username, password, nama_lengkap, role, hak_akses) 
              VALUES (?, ?, ?, ?, ?)`,
        ['admin', hashedPassword, 'Administrator', 'Admin', 'all'],
        (err) => {
          if (err) console.error('Error inserting admin:', err);
          else console.log('Default admin user created (username: admin, password: admin123)');
        }
      );
    }
  });

  // Insert data koperasi default
  db.get('SELECT COUNT(*) as count FROM koperasi_info', [], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (row.count === 0) {
      db.run(`INSERT INTO koperasi_info (nama_koperasi, alamat, nomor_telpon, email, tanggal_berdiri) 
              VALUES (?, ?, ?, ?, ?)`,
        ['Koperasi NU Vibes', 'Jl. Contoh No. 123', '021-12345678', 'info@nuvibes.com', '2020-01-01'],
        (err) => {
          if (err) console.error('Error inserting koperasi info:', err);
          else console.log('Default koperasi info created');
        }
      );
    }
  });
  
  // Tabel Artikel/Berita
  db.run(`CREATE TABLE IF NOT EXISTS artikel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    konten TEXT NOT NULL,
    ringkasan TEXT,
    gambar_utama TEXT,
    kategori TEXT DEFAULT 'berita',
    penulis TEXT,
    status TEXT DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    tanggal_publikasi DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating artikel table:', err);
    else console.log('Artikel table ready');
  });

  // Tabel Galeri
  db.run(`CREATE TABLE IF NOT EXISTS galeri (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    gambar TEXT NOT NULL,
    kategori TEXT DEFAULT 'kegiatan',
    tanggal_kegiatan DATE,
    status TEXT DEFAULT 'aktif',
    urutan INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating galeri table:', err);
    else console.log('Galeri table ready');
  });

  // Tabel Pengumuman/Banner
  db.run(`CREATE TABLE IF NOT EXISTS pengumuman (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT NOT NULL,
    konten TEXT,
    gambar TEXT,
    tipe TEXT DEFAULT 'info',
    status TEXT DEFAULT 'aktif',
    urutan INTEGER DEFAULT 0,
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating pengumuman table:', err);
    else console.log('Pengumuman table ready');
  });

  // Tabel Pesan Kontak
  db.run(`CREATE TABLE IF NOT EXISTS pesan_kontak (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT NOT NULL,
    telepon TEXT,
    pesan TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating pesan_kontak table:', err);
    else console.log('Pesan kontak table ready');
  });
}

module.exports = db;
