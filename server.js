const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'koperasi-nu-vibes-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.session.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ===== AUTH ROUTES =====
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ? AND status = "aktif"', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Username atau password salah' });

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
        req.session.token = token;
        req.session.user = { id: user.id, username: user.username, role: user.role, nama_lengkap: user.nama_lengkap, foto: user.foto };
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, nama_lengkap: user.nama_lengkap, hak_akses: user.hak_akses, foto: user.foto } });
      } else {
        res.status(401).json({ error: 'Username atau password salah' });
      }
    });
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout berhasil' });
});

app.get('/api/check-auth', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ===== PUBLIC REGISTRATION =====
app.post('/api/register/anggota', upload.fields([
  { name: 'foto_ktp', maxCount: 1 },
  { name: 'pas_foto', maxCount: 1 }
]), (req, res) => {
  const { 
    nomor_anggota, 
    nama_lengkap, 
    nik, 
    tempat_lahir, 
    tanggal_lahir, 
    jenis_kelamin, 
    alamat, 
    nomor_telpon, 
    email, 
    pekerjaan, 
    tanggal_bergabung, 
    username, 
    password, 
    status 
  } = req.body;
  
  // Get uploaded files
  const fotoKTP = req.files && req.files['foto_ktp'] ? req.files['foto_ktp'][0].filename : null;
  const pasFoto = req.files && req.files['pas_foto'] ? req.files['pas_foto'][0].filename : null;

  // Validate required fields
  if (!nomor_anggota || !nama_lengkap || !alamat || !nomor_telpon) {
    return res.status(400).json({ 
      success: false, 
      message: 'Data tidak lengkap. Nama, alamat, dan nomor telepon harus diisi.' 
    });
  }

  // Check if nomor_anggota already exists
  db.get('SELECT id FROM anggota WHERE nomor_anggota = ?', [nomor_anggota], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    
    if (row) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nomor anggota sudah terdaftar. Silakan refresh halaman.' 
      });
    }

    // Check if username already exists (if provided)
    if (username) {
      db.get('SELECT id FROM anggota WHERE username = ?', [username], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }
        
        if (row) {
          return res.status(400).json({ 
            success: false, 
            message: 'Username sudah digunakan. Silakan pilih username lain.' 
          });
        }

        // Hash password if provided
        let hashedPassword = null;
        if (password) {
          hashedPassword = bcrypt.hashSync(password, 10);
        }

        // Insert new anggota
        db.run(`INSERT INTO anggota (
          nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir, 
          jenis_kelamin, alamat, nomor_telpon, email, pekerjaan, 
          tanggal_bergabung, username, password, status, foto, foto_ktp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir,
            jenis_kelamin, alamat, nomor_telpon, email, pekerjaan,
            tanggal_bergabung, username, hashedPassword, 'pending',
            pasFoto, fotoKTP
          ],
          function(err) {
            if (err) {
              return res.status(500).json({ success: false, message: err.message });
            }
            
            res.json({ 
              success: true, 
              message: 'Pendaftaran berhasil',
              data: {
                id: this.lastID,
                nomor_anggota: nomor_anggota,
                nama_lengkap: nama_lengkap
              }
            });
          }
        );
      });
    } else {
      // No username provided, insert without checking username
      db.run(`INSERT INTO anggota (
        nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir, 
        jenis_kelamin, alamat, nomor_telpon, email, pekerjaan, 
        tanggal_bergabung, status, foto, foto_ktp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir,
          jenis_kelamin, alamat, nomor_telpon, email, pekerjaan,
          tanggal_bergabung, 'pending', pasFoto, fotoKTP
        ],
        function(err) {
          if (err) {
            return res.status(500).json({ success: false, message: err.message });
          }
          
          res.json({ 
            success: true, 
            message: 'Pendaftaran berhasil',
            data: {
              id: this.lastID,
              nomor_anggota: nomor_anggota,
              nama_lengkap: nama_lengkap
            }
          });
        }
      );
    }
  });
});

// ===== APPROVAL ENDPOINTS =====
// Get pending registrations
app.get('/api/anggota/pending', authenticateToken, (req, res) => {
  db.all(`
    SELECT id, nomor_anggota, nama_lengkap, nik, alamat, nomor_telpon, 
           email, tanggal_bergabung, foto, foto_ktp, created_at
    FROM anggota 
    WHERE status = 'pending' 
    ORDER BY created_at DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get pending count
app.get('/api/anggota/pending/count', authenticateToken, (req, res) => {
  db.get(`
    SELECT COUNT(*) as count 
    FROM anggota 
    WHERE status = 'pending'
  `, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: row.count });
  });
});

// Approve or reject anggota
app.post('/api/anggota/:id/approve', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body;
  
  const newStatus = action === 'approve' ? 'aktif' : 'ditolak';
  
  db.run(`
    UPDATE anggota 
    SET status = ?
    WHERE id = ?
  `, [newStatus, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Anggota tidak ditemukan' });
    }
    
    res.json({ 
      success: true, 
      message: action === 'approve' ? 'Anggota disetujui' : 'Anggota ditolak',
      reason: reason
    });
  });
});

// ===== KOPERASI INFO ROUTES =====
// Public endpoint for landing page
app.get('/api/koperasi-info', (req, res) => {
  db.get('SELECT * FROM koperasi_info ORDER BY id DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

app.put('/api/koperasi-info/:id', authenticateToken, upload.single('logo'), (req, res) => {
  const { id } = req.params;
  const { nama_koperasi, alamat, nomor_telpon, email, nomor_induk_koperasi, nomor_induk_berusaha, nomor_badan_hukum, tanggal_berdiri } = req.body;
  const logo = req.file ? req.file.filename : null;

  let query = `UPDATE koperasi_info SET nama_koperasi = ?, alamat = ?, nomor_telpon = ?, email = ?, 
               nomor_induk_koperasi = ?, nomor_induk_berusaha = ?, nomor_badan_hukum = ?, tanggal_berdiri = ?, updated_at = CURRENT_TIMESTAMP`;
  let params = [nama_koperasi, alamat, nomor_telpon, email, nomor_induk_koperasi, nomor_induk_berusaha, nomor_badan_hukum, tanggal_berdiri];

  if (logo) {
    query += ', logo = ?';
    params.push(logo);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Data koperasi berhasil diupdate', id: this.lastID });
  });
});

// ===== UNIT USAHA ROUTES =====
app.get('/api/unit-usaha', authenticateToken, (req, res) => {
  db.all('SELECT * FROM unit_usaha ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/unit-usaha', authenticateToken, upload.single('logo'), (req, res) => {
  const { nama_usaha, jenis_usaha, deskripsi, tanggal_mulai, modal_awal } = req.body;
  const logo = req.file ? req.file.filename : null;

  db.run('INSERT INTO unit_usaha (nama_usaha, jenis_usaha, deskripsi, logo, tanggal_mulai, modal_awal) VALUES (?, ?, ?, ?, ?, ?)',
    [nama_usaha, jenis_usaha, deskripsi, logo, tanggal_mulai, modal_awal || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Unit usaha berhasil ditambahkan', id: this.lastID });
    }
  );
});

app.put('/api/unit-usaha/:id', authenticateToken, upload.single('logo'), (req, res) => {
  const { id } = req.params;
  const { nama_usaha, jenis_usaha, deskripsi, status, tanggal_mulai, modal_awal } = req.body;
  const logo = req.file ? req.file.filename : null;

  let query = 'UPDATE unit_usaha SET nama_usaha = ?, jenis_usaha = ?, deskripsi = ?, status = ?, tanggal_mulai = ?, modal_awal = ?';
  let params = [nama_usaha, jenis_usaha, deskripsi, status, tanggal_mulai, modal_awal || 0];

  if (logo) {
    query += ', logo = ?';
    params.push(logo);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Unit usaha berhasil diupdate' });
  });
});

app.delete('/api/unit-usaha/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM unit_usaha WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Unit usaha berhasil dihapus' });
  });
});

// ===== IMPORT ROUTES =====
const anggotaRoutes = require('./routes-anggota');
const simpananRoutes = require('./routes-simpanan');
const pengurusRoutes = require('./routes-pengurus');
const karyawanRoutes = require('./routes-karyawan');
const asetRoutes = require('./routes-aset');
const memberRoutes = require('./routes-member');
const pengumumanRoutes = require('./routes-pengumuman');

// Public endpoint for pengurus (must be before authenticated route)
app.get('/api/pengurus/public', (req, res) => {
  db.all(`SELECT 
            p.id, 
            p.jabatan, 
            p.periode_mulai, 
            p.periode_selesai,
            a.nama_lengkap, 
            a.nomor_telpon, 
            a.email, 
            a.foto 
          FROM pengurus p
          LEFT JOIN anggota a ON p.anggota_id = a.id
          WHERE p.status = 'aktif'
          ORDER BY 
            CASE p.jabatan
              WHEN 'Ketua' THEN 1
              WHEN 'Wakil Ketua' THEN 2
              WHEN 'Sekretaris' THEN 3
              WHEN 'Bendahara' THEN 4
              WHEN 'Pengawas' THEN 5
              ELSE 99
            END`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.use('/api/anggota', authenticateToken, anggotaRoutes);
app.use('/api/member', memberRoutes); // Member routes (login tidak perlu auth)
app.use('/api/simpanan', authenticateToken, simpananRoutes);
app.use('/api/pengurus', authenticateToken, pengurusRoutes);
app.use('/api/karyawan', authenticateToken, karyawanRoutes);
app.use('/api/aset', authenticateToken, asetRoutes);
app.use('/api/pengumuman', pengumumanRoutes); // Pengumuman routes (aktif endpoint tidak perlu auth)

// ===== DASHBOARD STATS =====
// Test endpoint untuk cek database connection
app.get('/api/test/db', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM anggota', [], (err, row) => {
    if (err) {
      res.json({ 
        status: 'error', 
        message: err.message,
        connected: false 
      });
    } else {
      res.json({ 
        status: 'success', 
        message: 'Database connected',
        connected: true,
        totalAnggota: row.count
      });
    }
  });
});

// Public endpoint for landing page (limited data)
app.get('/api/public/stats', (req, res) => {
  const stats = {};
  
  // Total Anggota
  db.get('SELECT COUNT(*) as total FROM anggota WHERE status = "aktif"', [], (err, row) => {
    if (err) {
      console.error('Error getting total anggota:', err);
      stats.totalAnggota = 0;
    } else {
      stats.totalAnggota = row ? row.total : 0;
    }
    
    // Total Simpanan
    db.get(`SELECT 
            (SELECT COALESCE(SUM(CAST(jumlah AS REAL)), 0) FROM simpanan_pokok) +
            (SELECT COALESCE(SUM(CAST(jumlah AS REAL)), 0) FROM simpanan_wajib) +
            (SELECT COALESCE(SUM(CAST(jumlah AS REAL)), 0) FROM simpanan_khusus) +
            (SELECT COALESCE(SUM(CASE WHEN jenis = 'Setoran' THEN CAST(jumlah AS REAL) ELSE -CAST(jumlah AS REAL) END), 0) FROM simpanan_sukarela) as total`, [], (err2, row2) => {
      if (err2) {
        console.error('Error getting total simpanan:', err2);
        stats.totalSimpanan = 0;
      } else {
        stats.totalSimpanan = row2 ? parseFloat(row2.total) || 0 : 0;
      }
      
      // Calculate total aset (simplified: simpanan + laba)
      db.get(`SELECT 
              COALESCE(
                (SELECT SUM(jumlah_penjualan - hpp) FROM transaksi_penjualan), 0
              ) +
              COALESCE(
                (SELECT SUM(jumlah) FROM pendapatan_lain), 0
              ) -
              COALESCE(
                (SELECT SUM(jumlah) FROM pengeluaran 
                 WHERE kategori NOT IN ('Pembelian Barang', 'Pembelian Aset', 'Pembelian Aset & Inventaris')), 0
              ) as labaBersih`, [], (err3, row3) => {
        if (err3) {
          console.error('Error calculating laba bersih:', err3);
          stats.labaBersih = 0;
        } else {
          stats.labaBersih = row3 ? parseFloat(row3.labaBersih) || 0 : 0;
        }
        
        console.log('Public stats:', stats);
        res.json(stats);
      });
    });
  });
});

app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const stats = {};
  
  // Total Anggota
  db.get('SELECT COUNT(*) as total FROM anggota WHERE status = "aktif"', [], (err, row) => {
    stats.totalAnggota = row ? row.total : 0;
    
    // Total Simpanan (termasuk sukarela dengan setoran - penarikan)
    db.get(`SELECT 
            (SELECT COALESCE(SUM(CAST(jumlah AS REAL)), 0) FROM simpanan_pokok) +
            (SELECT COALESCE(SUM(CAST(jumlah AS REAL)), 0) FROM simpanan_wajib) +
            (SELECT COALESCE(SUM(CAST(jumlah AS REAL)), 0) FROM simpanan_khusus) +
            (SELECT COALESCE(SUM(CASE WHEN jenis = 'Setoran' THEN CAST(jumlah AS REAL) ELSE -CAST(jumlah AS REAL) END), 0) FROM simpanan_sukarela) as total`, [], (err, row) => {
      if (err) console.error('Error calculating total simpanan:', err);
      stats.totalSimpanan = row ? parseFloat(row.total) || 0 : 0;
      
      // Total Penjualan
      db.get('SELECT COALESCE(SUM(jumlah_penjualan), 0) as total FROM transaksi_penjualan', [], (err, row) => {
        stats.totalPenjualan = row ? row.total : 0;
        
        // Total HPP
        db.get('SELECT COALESCE(SUM(hpp), 0) as total FROM transaksi_penjualan', [], (err, row) => {
          stats.totalHPP = row ? row.total : 0;
          
          // Total Pengeluaran (exclude Pembelian Barang dan Pembelian Aset & Inventaris)
          // Pembelian Barang masuk ke Persediaan di Neraca
          // Pembelian Aset masuk ke Aset Tetap di Neraca
          db.get(`SELECT COALESCE(SUM(jumlah), 0) as total 
                  FROM pengeluaran 
                  WHERE kategori NOT IN ('Pembelian Barang', 'Pembelian Aset & Inventaris')`, [], (err, row) => {
            stats.totalPengeluaran = row ? row.total : 0;
            
            // Total Pendapatan Lain
            db.get('SELECT COALESCE(SUM(jumlah), 0) as total FROM pendapatan_lain', [], (err, row) => {
              stats.totalPendapatanLain = row ? row.total : 0;
              
              // Formula yang benar (dengan Pendapatan Lain):
              // Total Pendapatan = Penjualan + Pendapatan Lain
              // Laba Kotor = Total Pendapatan - HPP
              // SHU Tahun Berjalan = Laba Kotor - Biaya Operasional
              stats.totalPendapatan = stats.totalPenjualan + stats.totalPendapatanLain;
              stats.labaKotor = stats.totalPendapatan - stats.totalHPP;
              stats.labaBersih = stats.labaKotor - stats.totalPengeluaran; // SHU Tahun Berjalan
              stats.labaRugi = stats.labaBersih; // Alias untuk kompatibilitas
              
              res.json(stats);
            });
          });
        });
      });
    });
  });
});

// ===== TRANSAKSI ROUTES =====
app.get('/api/transaksi/penjualan', authenticateToken, (req, res) => {
  db.all(`SELECT tp.*, uu.nama_usaha 
          FROM transaksi_penjualan tp 
          LEFT JOIN unit_usaha uu ON tp.unit_usaha_id = uu.id 
          ORDER BY tp.tanggal_transaksi DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transaksi/penjualan', authenticateToken, (req, res) => {
  const { unit_usaha_id, tanggal_transaksi, jumlah_penjualan, hpp, keterangan } = req.body;
  const keuntungan = jumlah_penjualan - (hpp || 0);
  
  db.run('INSERT INTO transaksi_penjualan (unit_usaha_id, tanggal_transaksi, jumlah_penjualan, hpp, keuntungan, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
    [unit_usaha_id, tanggal_transaksi, jumlah_penjualan, hpp, keuntungan, keterangan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Transaksi penjualan berhasil ditambahkan', id: this.lastID });
    }
  );
});

app.get('/api/transaksi/pengeluaran', authenticateToken, (req, res) => {
  db.all(`SELECT p.*, uu.nama_usaha 
          FROM pengeluaran p 
          LEFT JOIN unit_usaha uu ON p.unit_usaha_id = uu.id 
          ORDER BY p.tanggal_transaksi DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transaksi/pengeluaran', authenticateToken, (req, res) => {
  const { unit_usaha_id, kategori, jumlah, tanggal_transaksi, keterangan } = req.body;
  
  db.run('INSERT INTO pengeluaran (unit_usaha_id, kategori, jumlah, tanggal_transaksi, keterangan) VALUES (?, ?, ?, ?, ?)',
    [unit_usaha_id, kategori, jumlah, tanggal_transaksi, keterangan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pengeluaran berhasil ditambahkan', id: this.lastID });
    }
  );
});

// ===== PARTISIPASI ANGGOTA =====
app.get('/api/partisipasi', authenticateToken, (req, res) => {
  db.all(`SELECT pa.*, a.nama_lengkap, a.nomor_anggota, uu.nama_usaha 
          FROM partisipasi_anggota pa 
          JOIN anggota a ON pa.anggota_id = a.id 
          LEFT JOIN unit_usaha uu ON pa.unit_usaha_id = uu.id 
          ORDER BY pa.tanggal_transaksi DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/partisipasi', authenticateToken, (req, res) => {
  const { anggota_id, unit_usaha_id, jumlah_transaksi, tanggal_transaksi, keterangan } = req.body;
  
  db.run('INSERT INTO partisipasi_anggota (anggota_id, unit_usaha_id, jumlah_transaksi, tanggal_transaksi, keterangan) VALUES (?, ?, ?, ?, ?)',
    [anggota_id, unit_usaha_id, jumlah_transaksi, tanggal_transaksi, keterangan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Partisipasi anggota berhasil ditambahkan', id: this.lastID });
    }
  );
});

// ===== SHU ROUTES =====
app.get('/api/shu/komponen/:tahun', authenticateToken, (req, res) => {
  db.get('SELECT * FROM komponen_shu WHERE tahun = ?', [req.params.tahun], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

app.post('/api/shu/komponen', authenticateToken, (req, res) => {
  const { tahun, cadangan, jasa_simpanan, jasa_transaksi, pengurus_pengawas, pegawai, dana_pendidikan, dana_sosial, dana_pengembangan } = req.body;
  
  console.log('Updating komponen SHU:', { tahun, cadangan, jasa_simpanan, jasa_transaksi, pengurus_pengawas, pegawai, dana_pendidikan, dana_sosial, dana_pengembangan });
  
  // Check if komponen already exists
  db.get('SELECT id FROM komponen_shu WHERE tahun = ?', [tahun], (err, row) => {
    if (err) {
      console.error('Error checking komponen SHU:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (row) {
      // Update existing komponen
      console.log('Updating existing komponen with id:', row.id);
      db.run(`UPDATE komponen_shu 
              SET cadangan = ?, jasa_simpanan = ?, jasa_transaksi = ?, pengurus_pengawas = ?, 
                  pegawai = ?, dana_pendidikan = ?, dana_sosial = ?, dana_pengembangan = ?
              WHERE tahun = ?`,
        [cadangan, jasa_simpanan, jasa_transaksi, pengurus_pengawas, pegawai, dana_pendidikan, dana_sosial, dana_pengembangan, tahun],
        function(err) {
          if (err) {
            console.error('Error updating komponen SHU:', err);
            return res.status(500).json({ error: err.message });
          }
          console.log('Komponen SHU updated successfully, changes:', this.changes);
          
          // Verify the update
          db.get('SELECT * FROM komponen_shu WHERE tahun = ?', [tahun], (err, updatedRow) => {
            if (err) {
              console.error('Error verifying update:', err);
            } else {
              console.log('Verified updated data:', updatedRow);
            }
          });
          
          res.json({ message: 'Komponen SHU berhasil diperbarui', changes: this.changes });
        }
      );
    } else {
      // Insert new komponen
      console.log('Inserting new komponen for tahun:', tahun);
      db.run(`INSERT INTO komponen_shu (tahun, cadangan, jasa_simpanan, jasa_transaksi, pengurus_pengawas, pegawai, dana_pendidikan, dana_sosial, dana_pengembangan) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tahun, cadangan, jasa_simpanan, jasa_transaksi, pengurus_pengawas, pegawai, dana_pendidikan, dana_sosial, dana_pengembangan],
        function(err) {
          if (err) {
            console.error('Error inserting komponen SHU:', err);
            return res.status(500).json({ error: err.message });
          }
          console.log('Komponen SHU inserted successfully, lastID:', this.lastID);
          res.json({ message: 'Komponen SHU berhasil disimpan', id: this.lastID });
        }
      );
    }
  });
});

app.post('/api/shu/hitung/:tahun', authenticateToken, (req, res) => {
  const tahun = req.params.tahun;
  
  // Hitung SHU tahun ini dengan formula yang benar:
  // Total Pendapatan = Penjualan + Pendapatan Lain
  // Laba Kotor = Total Pendapatan - HPP
  // SHU Tahun Berjalan = Laba Kotor - Biaya Operasional
  // Biaya Operasional = Pengeluaran TANPA Pembelian Barang dan Pembelian Aset
  db.get(`SELECT 
          (SELECT COALESCE(SUM(jumlah_penjualan), 0) FROM transaksi_penjualan WHERE strftime('%Y', tanggal_transaksi) = ?) +
          (SELECT COALESCE(SUM(jumlah), 0) FROM pendapatan_lain WHERE strftime('%Y', tanggal_transaksi) = ?) -
          (SELECT COALESCE(SUM(hpp), 0) FROM transaksi_penjualan WHERE strftime('%Y', tanggal_transaksi) = ?) -
          (SELECT COALESCE(SUM(jumlah), 0) FROM pengeluaran 
           WHERE strftime('%Y', tanggal_transaksi) = ? 
           AND kategori NOT IN ('Pembelian Barang', 'Pembelian Aset & Inventaris', 'Pembelian Aset')) as keuntungan_bersih`,
    [tahun, tahun, tahun, tahun], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const keuntunganBersih = result.keuntungan_bersih || 0;
      
      // Get komponen SHU
      db.get('SELECT * FROM komponen_shu WHERE tahun = ?', [tahun], (err, komponen) => {
        if (err || !komponen) return res.status(500).json({ error: 'Komponen SHU belum diatur' });
        
        const shuJasaSimpanan = keuntunganBersih * (komponen.jasa_simpanan / 100);
        const shuJasaTransaksi = keuntunganBersih * (komponen.jasa_transaksi / 100);
        
        // Hitung total simpanan dan partisipasi per anggota
        db.all(`SELECT a.id, a.nama_lengkap,
                (SELECT COALESCE(SUM(jumlah), 0) FROM simpanan_pokok WHERE anggota_id = a.id) +
                (SELECT COALESCE(SUM(jumlah), 0) FROM simpanan_wajib WHERE anggota_id = a.id) +
                (SELECT COALESCE(SUM(jumlah), 0) FROM simpanan_khusus WHERE anggota_id = a.id) as total_simpanan,
                (SELECT COALESCE(SUM(jumlah_transaksi), 0) FROM partisipasi_anggota WHERE anggota_id = a.id AND strftime('%Y', tanggal_transaksi) = ?) as total_partisipasi
                FROM anggota a WHERE a.status = 'aktif'`, [tahun], (err, anggotaList) => {
          if (err) return res.status(500).json({ error: err.message });
          
          const totalSimpananSemua = anggotaList.reduce((sum, a) => sum + a.total_simpanan, 0);
          const totalPartisipasiSemua = anggotaList.reduce((sum, a) => sum + a.total_partisipasi, 0);
          
          // Hitung SHU per anggota
          anggotaList.forEach(anggota => {
            const indeksSimpanan = totalSimpananSemua > 0 ? anggota.total_simpanan / totalSimpananSemua : 0;
            const indeksPartisipasi = totalPartisipasiSemua > 0 ? anggota.total_partisipasi / totalPartisipasiSemua : 0;
            
            const shuSimpanan = shuJasaSimpanan * indeksSimpanan;
            const shuTransaksi = shuJasaTransaksi * indeksPartisipasi;
            const totalShu = shuSimpanan + shuTransaksi;
            
            db.run(`INSERT OR REPLACE INTO shu_anggota (anggota_id, tahun, shu_simpanan, shu_transaksi, total_shu) VALUES (?, ?, ?, ?, ?)`,
              [anggota.id, tahun, shuSimpanan, shuTransaksi, totalShu]);
          });
          
          res.json({ message: 'SHU berhasil dihitung', keuntunganBersih, totalAnggota: anggotaList.length });
        });
      });
    });
});

app.get('/api/shu/anggota/:tahun', authenticateToken, (req, res) => {
  db.all(`SELECT sa.*, a.nama_lengkap, a.nomor_anggota,
          COALESCE(
            (SELECT SUM(jumlah) FROM simpanan_pokok WHERE anggota_id = a.id), 0
          ) + COALESCE(
            (SELECT SUM(jumlah) FROM simpanan_wajib WHERE anggota_id = a.id), 0
          ) + COALESCE(
            (SELECT SUM(jumlah) FROM simpanan_khusus WHERE anggota_id = a.id), 0
          ) as total_simpanan,
          COALESCE(
            (SELECT SUM(jumlah_transaksi) FROM partisipasi_anggota WHERE anggota_id = a.id), 0
          ) as total_transaksi
          FROM shu_anggota sa 
          JOIN anggota a ON sa.anggota_id = a.id 
          WHERE sa.tahun = ? 
          ORDER BY a.nomor_anggota ASC`, [req.params.tahun], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/shu/reset/:tahun', authenticateToken, (req, res) => {
  const tahun = req.params.tahun;
  
  db.run('DELETE FROM shu_anggota WHERE tahun = ?', [tahun], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ 
      message: `SHU tahun ${tahun} berhasil direset`, 
      deleted: this.changes 
    });
  });
});

// ===== USER MANAGEMENT =====
app.get('/api/users', authenticateToken, (req, res) => {
  db.all('SELECT id, username, nama_lengkap, role, hak_akses, foto, status, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', authenticateToken, upload.single('foto'), (req, res) => {
  const { username, password, nama_lengkap, role, hak_akses } = req.body;
  const foto = req.file ? req.file.filename : null;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.run('INSERT INTO users (username, password, nama_lengkap, role, hak_akses, foto) VALUES (?, ?, ?, ?, ?, ?)',
    [username, hashedPassword, nama_lengkap, role, hak_akses, foto],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User berhasil ditambahkan', id: this.lastID });
    }
  );
});

app.put('/api/users/:id', authenticateToken, upload.single('foto'), (req, res) => {
  const { id } = req.params;
  const { username, password, nama_lengkap, role, hak_akses, status } = req.body;
  const foto = req.file ? req.file.filename : null;
  
  let query = 'UPDATE users SET username = ?, nama_lengkap = ?, role = ?, hak_akses = ?, status = ?';
  let params = [username, nama_lengkap, role, hak_akses, status];
  
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    query += ', password = ?';
    params.push(hashedPassword);
  }
  
  if (foto) {
    query += ', foto = ?';
    params.push(foto);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User berhasil diupdate' });
  });
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User berhasil dihapus' });
  });
});

// ===== LAPORAN =====
app.get('/api/laporan/simpanan', authenticateToken, (req, res) => {
  const { periode, tahun, bulan, tanggal } = req.query;
  
  let dateFilter = '';
  if (periode === 'harian' && tanggal) {
    dateFilter = `AND tanggal_transaksi = '${tanggal}'`;
  } else if (periode === 'bulanan' && tahun && bulan) {
    dateFilter = `AND strftime('%Y-%m', tanggal_transaksi) = '${tahun}-${bulan}'`;
  } else if (periode === 'tahunan' && tahun) {
    dateFilter = `AND strftime('%Y', tanggal_transaksi) = '${tahun}'`;
  }
  
  db.all(`SELECT 
          'Simpanan Pokok' as jenis,
          SUM(jumlah) as total,
          COUNT(*) as jumlah_transaksi
          FROM simpanan_pokok WHERE 1=1 ${dateFilter}
          UNION ALL
          SELECT 
          'Simpanan Wajib' as jenis,
          SUM(jumlah) as total,
          COUNT(*) as jumlah_transaksi
          FROM simpanan_wajib WHERE 1=1 ${dateFilter}
          UNION ALL
          SELECT 
          'Simpanan Khusus' as jenis,
          SUM(jumlah) as total,
          COUNT(*) as jumlah_transaksi
          FROM simpanan_khusus WHERE 1=1 ${dateFilter}
          UNION ALL
          SELECT 
          'Simpanan Sukarela' as jenis,
          SUM(CASE WHEN jenis = 'Setoran' THEN jumlah ELSE -jumlah END) as total,
          COUNT(*) as jumlah_transaksi
          FROM simpanan_sukarela WHERE 1=1 ${dateFilter}`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ===== USER PROFILE ENDPOINTS =====

// Upload foto profil
app.post('/api/users/upload-photo', authenticateToken, upload.single('foto'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
  }
  
  const fotoUrl = `/uploads/${req.file.filename}`;
  const userId = req.user.id;
  
  db.run('UPDATE users SET foto = ? WHERE id = ?', [fotoUrl, userId], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    
    res.json({ 
      success: true, 
      message: 'Foto profil berhasil diupdate',
      foto: fotoUrl
    });
  });
});

// Ganti password
app.post('/api/users/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Password lama dan baru harus diisi' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter' });
  }
  
  // Get current user
  db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    // Verify old password
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Password lama tidak sesuai' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      
      res.json({ 
        success: true, 
        message: 'Password berhasil diubah'
      });
    });
  });
});

// Upload logo koperasi (untuk sidebar)
app.post('/api/koperasi/upload-logo', authenticateToken, upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
  }
  
  const logoUrl = `/uploads/${req.file.filename}`;
  
  db.run('UPDATE koperasi_info SET logo = ? WHERE id = 1', [logoUrl], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    
    res.json({ 
      success: true, 
      message: 'Logo koperasi berhasil diupdate',
      logo: logoUrl
    });
  });
});

// Get logo koperasi
app.get('/api/koperasi/logo', (req, res) => {
  db.get('SELECT logo FROM koperasi_info WHERE id = 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ logo: row?.logo || null });
  });
});

// Start server
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// ===== PENGUMUMAN ROUTES =====
app.get('/api/pengumuman', authenticateToken, (req, res) => {
  db.all('SELECT * FROM pengumuman ORDER BY urutan ASC, created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/pengumuman/aktif', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.all(`SELECT * FROM pengumuman 
          WHERE status = 'aktif' 
          AND (tanggal_mulai IS NULL OR tanggal_mulai <= ?)
          AND (tanggal_selesai IS NULL OR tanggal_selesai >= ?)
          ORDER BY urutan ASC, created_at DESC`, 
    [today, today], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/pengumuman', authenticateToken, upload.single('gambar'), (req, res) => {
  const { judul, konten, tipe, status, urutan, tanggal_mulai, tanggal_selesai } = req.body;
  const gambar = req.file ? req.file.filename : null;
  
  db.run(`INSERT INTO pengumuman (judul, konten, gambar, tipe, status, urutan, tanggal_mulai, tanggal_selesai) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [judul, konten, gambar, tipe, status, urutan || 0, tanggal_mulai, tanggal_selesai],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pengumuman berhasil ditambahkan', id: this.lastID });
    }
  );
});

app.put('/api/pengumuman/:id', authenticateToken, upload.single('gambar'), (req, res) => {
  const { id } = req.params;
  const { judul, konten, tipe, status, urutan, tanggal_mulai, tanggal_selesai } = req.body;
  const gambar = req.file ? req.file.filename : null;
  
  let query = 'UPDATE pengumuman SET judul = ?, konten = ?, tipe = ?, status = ?, urutan = ?, tanggal_mulai = ?, tanggal_selesai = ?, updated_at = CURRENT_TIMESTAMP';
  let params = [judul, konten, tipe, status, urutan, tanggal_mulai, tanggal_selesai];
  
  if (gambar) {
    query += ', gambar = ?';
    params.push(gambar);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pengumuman berhasil diupdate' });
  });
});

app.delete('/api/pengumuman/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM pengumuman WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pengumuman berhasil dihapus' });
  });
});

// ===== ARTIKEL ROUTES =====
// Get all artikel (admin)
app.get('/api/artikel', authenticateToken, (req, res) => {
  db.all('SELECT * FROM artikel ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get published artikel (public)
app.get('/api/artikel/published', (req, res) => {
  const limit = req.query.limit || 10;
  db.all(`SELECT id, judul, slug, ringkasan, gambar_utama, kategori, penulis, views, tanggal_publikasi, created_at 
          FROM artikel 
          WHERE status = 'published' 
          ORDER BY tanggal_publikasi DESC 
          LIMIT ?`, [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get artikel by slug (public)
app.get('/api/artikel/slug/:slug', (req, res) => {
  db.get('SELECT * FROM artikel WHERE slug = ? AND status = "published"', [req.params.slug], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Artikel tidak ditemukan' });
    
    // Increment views
    db.run('UPDATE artikel SET views = views + 1 WHERE id = ?', [row.id]);
    
    res.json(row);
  });
});

// Create artikel
app.post('/api/artikel', authenticateToken, upload.single('gambar_utama'), (req, res) => {
  const { judul, slug, konten, ringkasan, kategori, penulis, status, tanggal_publikasi } = req.body;
  const gambar_utama = req.file ? req.file.filename : null;
  
  db.run(`INSERT INTO artikel (judul, slug, konten, ringkasan, gambar_utama, kategori, penulis, status, tanggal_publikasi) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [judul, slug, konten, ringkasan, gambar_utama, kategori, penulis, status, tanggal_publikasi],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Artikel berhasil ditambahkan' });
    }
  );
});

// Update artikel
app.put('/api/artikel/:id', authenticateToken, upload.single('gambar_utama'), (req, res) => {
  const { id } = req.params;
  const { judul, slug, konten, ringkasan, kategori, penulis, status, tanggal_publikasi } = req.body;
  
  let query = `UPDATE artikel SET judul = ?, slug = ?, konten = ?, ringkasan = ?, kategori = ?, penulis = ?, status = ?, tanggal_publikasi = ?, updated_at = CURRENT_TIMESTAMP`;
  let params = [judul, slug, konten, ringkasan, kategori, penulis, status, tanggal_publikasi];
  
  if (req.file) {
    query += `, gambar_utama = ?`;
    params.push(req.file.filename);
  }
  
  query += ` WHERE id = ?`;
  params.push(id);
  
  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Artikel berhasil diupdate' });
  });
});

// Delete artikel
app.delete('/api/artikel/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM artikel WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Artikel berhasil dihapus' });
  });
});

// ===== GALERI ROUTES =====
// Get all galeri (admin)
app.get('/api/galeri', authenticateToken, (req, res) => {
  db.all('SELECT * FROM galeri ORDER BY urutan ASC, created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get active galeri (public)
app.get('/api/galeri/aktif', (req, res) => {
  const limit = req.query.limit || 12;
  db.all(`SELECT * FROM galeri 
          WHERE status = 'aktif' 
          ORDER BY urutan ASC, tanggal_kegiatan DESC 
          LIMIT ?`, [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create galeri
app.post('/api/galeri', authenticateToken, upload.single('gambar'), (req, res) => {
  const { judul, deskripsi, kategori, tanggal_kegiatan, status, urutan } = req.body;
  const gambar = req.file ? req.file.filename : null;
  
  db.run(`INSERT INTO galeri (judul, deskripsi, gambar, kategori, tanggal_kegiatan, status, urutan) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [judul, deskripsi, gambar, kategori, tanggal_kegiatan, status, urutan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Galeri berhasil ditambahkan' });
    }
  );
});

// Update galeri
app.put('/api/galeri/:id', authenticateToken, upload.single('gambar'), (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, kategori, tanggal_kegiatan, status, urutan } = req.body;
  
  let query = `UPDATE galeri SET judul = ?, deskripsi = ?, kategori = ?, tanggal_kegiatan = ?, status = ?, urutan = ?, updated_at = CURRENT_TIMESTAMP`;
  let params = [judul, deskripsi, kategori, tanggal_kegiatan, status, urutan];
  
  if (req.file) {
    query += `, gambar = ?`;
    params.push(req.file.filename);
  }
  
  query += ` WHERE id = ?`;
  params.push(id);
  
  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Galeri berhasil diupdate' });
  });
});

// Delete galeri
app.delete('/api/galeri/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM galeri WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Galeri berhasil dihapus' });
  });
});

// ===== PESAN KONTAK ROUTES =====
// Submit pesan kontak (public)
app.post('/api/kontak/submit', (req, res) => {
  const { nama, email, telepon, pesan } = req.body;
  
  if (!nama || !email || !pesan) {
    return res.status(400).json({ error: 'Nama, email, dan pesan harus diisi' });
  }
  
  db.run(`INSERT INTO pesan_kontak (nama, email, telepon, pesan) VALUES (?, ?, ?, ?)`,
    [nama, email, telepon, pesan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        success: true, 
        message: 'Pesan berhasil dikirim. Terima kasih!',
        id: this.lastID 
      });
    }
  );
});

// Get all pesan kontak (admin)
app.get('/api/kontak', authenticateToken, (req, res) => {
  db.all('SELECT * FROM pesan_kontak ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get unread count (admin)
app.get('/api/kontak/unread/count', authenticateToken, (req, res) => {
  db.get('SELECT COUNT(*) as count FROM pesan_kontak WHERE status = "unread"', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: row.count });
  });
});

// Mark as read (admin)
app.put('/api/kontak/:id/read', authenticateToken, (req, res) => {
  db.run('UPDATE pesan_kontak SET status = "read" WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pesan ditandai sudah dibaca' });
  });
});

// Delete pesan (admin)
app.delete('/api/kontak/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM pesan_kontak WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pesan berhasil dihapus' });
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log('Login default: username=admin, password=admin123');
});


// ===== UPDATE & DELETE PARTISIPASI =====
app.put('/api/partisipasi/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { anggota_id, unit_usaha_id, jumlah_transaksi, tanggal_transaksi, keterangan } = req.body;
  
  db.run('UPDATE partisipasi_anggota SET anggota_id = ?, unit_usaha_id = ?, jumlah_transaksi = ?, tanggal_transaksi = ?, keterangan = ? WHERE id = ?',
    [anggota_id, unit_usaha_id, jumlah_transaksi, tanggal_transaksi, keterangan, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Partisipasi anggota berhasil diupdate' });
    }
  );
});

app.delete('/api/partisipasi/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM partisipasi_anggota WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Partisipasi anggota berhasil dihapus' });
  });
});

// ===== UPDATE & DELETE PENJUALAN =====
app.put('/api/transaksi/penjualan/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { unit_usaha_id, tanggal_transaksi, jumlah_penjualan, hpp, keterangan } = req.body;
  const keuntungan = parseFloat(jumlah_penjualan) - parseFloat(hpp || 0);
  
  db.run('UPDATE transaksi_penjualan SET unit_usaha_id = ?, tanggal_transaksi = ?, jumlah_penjualan = ?, hpp = ?, keuntungan = ?, keterangan = ? WHERE id = ?',
    [unit_usaha_id, tanggal_transaksi, jumlah_penjualan, hpp, keuntungan, keterangan, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Transaksi penjualan berhasil diupdate' });
    }
  );
});

app.delete('/api/transaksi/penjualan/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM transaksi_penjualan WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Transaksi penjualan berhasil dihapus' });
  });
});

// ===== UPDATE & DELETE PENGELUARAN =====
app.put('/api/transaksi/pengeluaran/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { unit_usaha_id, kategori, qty, harga, jumlah, tanggal_transaksi, keterangan } = req.body;
  
  db.run('UPDATE pengeluaran SET unit_usaha_id = ?, kategori = ?, qty = ?, harga = ?, jumlah = ?, tanggal_transaksi = ?, keterangan = ? WHERE id = ?',
    [unit_usaha_id, kategori, qty, harga, jumlah, tanggal_transaksi, keterangan, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pengeluaran berhasil diupdate' });
    }
  );
});

app.delete('/api/transaksi/pengeluaran/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM pengeluaran WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pengeluaran berhasil dihapus' });
  });
});

// ===== PENDAPATAN LAIN ROUTES =====
app.get('/api/transaksi/pendapatan-lain', authenticateToken, (req, res) => {
  db.all(`SELECT pl.*, uu.nama_usaha 
          FROM pendapatan_lain pl 
          LEFT JOIN unit_usaha uu ON pl.unit_usaha_id = uu.id 
          ORDER BY pl.tanggal_transaksi DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transaksi/pendapatan-lain', authenticateToken, (req, res) => {
  const { unit_usaha_id, kategori, jumlah, tanggal_transaksi, keterangan } = req.body;
  
  db.run('INSERT INTO pendapatan_lain (unit_usaha_id, kategori, jumlah, tanggal_transaksi, keterangan) VALUES (?, ?, ?, ?, ?)',
    [unit_usaha_id || null, kategori, jumlah, tanggal_transaksi, keterangan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pendapatan lain berhasil ditambahkan', id: this.lastID });
    }
  );
});

app.put('/api/transaksi/pendapatan-lain/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { unit_usaha_id, kategori, jumlah, tanggal_transaksi, keterangan } = req.body;
  
  db.run('UPDATE pendapatan_lain SET unit_usaha_id = ?, kategori = ?, jumlah = ?, tanggal_transaksi = ?, keterangan = ? WHERE id = ?',
    [unit_usaha_id || null, kategori, jumlah, tanggal_transaksi, keterangan, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pendapatan lain berhasil diupdate' });
    }
  );
});

app.delete('/api/transaksi/pendapatan-lain/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM pendapatan_lain WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pendapatan lain berhasil dihapus' });
  });
});
