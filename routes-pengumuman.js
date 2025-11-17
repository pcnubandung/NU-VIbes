const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

// Setup multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pengumuman-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan!'));
    }
  }
});

// GET - Semua pengumuman
router.get('/', (req, res) => {
  const sql = `
    SELECT * FROM pengumuman 
    ORDER BY urutan ASC, tanggal_mulai DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET - Pengumuman aktif (untuk member portal)
router.get('/aktif', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const sql = `
    SELECT * FROM pengumuman 
    WHERE status = 'aktif'
    AND (tanggal_mulai IS NULL OR tanggal_mulai <= ?)
    AND (tanggal_selesai IS NULL OR tanggal_selesai >= ?)
    ORDER BY urutan ASC, tanggal_mulai DESC
  `;
  
  db.all(sql, [today, today], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET - Pengumuman by ID
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM pengumuman WHERE id = ?';
  
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
    }
    res.json(row);
  });
});

// POST - Tambah pengumuman baru
router.post('/', upload.single('gambar'), (req, res) => {
  const { judul, konten, status, tanggal_mulai, tanggal_selesai, urutan, tampilkan_judul, tampilkan_konten } = req.body;
  const gambar = req.file ? req.file.filename : null;
  
  if (!gambar) {
    return res.status(400).json({ error: 'Gambar wajib diisi' });
  }
  
  const sql = `
    INSERT INTO pengumuman (judul, konten, gambar, status, tanggal_mulai, tanggal_selesai, urutan, tampilkan_judul, tampilkan_konten)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    judul || '',
    konten || null,
    gambar,
    status || 'aktif',
    tanggal_mulai || null,
    tanggal_selesai || null,
    urutan || 0,
    tampilkan_judul === 'true' || tampilkan_judul === '1' || tampilkan_judul === true ? 1 : 0,
    tampilkan_konten === 'true' || tampilkan_konten === '1' || tampilkan_konten === true ? 1 : 0
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      id: this.lastID,
      message: 'Pengumuman berhasil ditambahkan'
    });
  });
});

// PUT - Update pengumuman
router.put('/:id', upload.single('gambar'), (req, res) => {
  const { judul, konten, status, tanggal_mulai, tanggal_selesai, urutan, tampilkan_judul, tampilkan_konten } = req.body;
  const gambar = req.file ? req.file.filename : null;
  
  // Get existing data
  db.get('SELECT * FROM pengumuman WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
    }
    
    // If new image uploaded, delete old one
    if (gambar && row.gambar) {
      const oldImagePath = path.join('public/uploads', row.gambar);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    const finalGambar = gambar || row.gambar;
    
    const sql = `
      UPDATE pengumuman 
      SET judul = ?, konten = ?, gambar = ?, status = ?, 
          tanggal_mulai = ?, tanggal_selesai = ?, urutan = ?,
          tampilkan_judul = ?, tampilkan_konten = ?
      WHERE id = ?
    `;
    
    const params = [
      judul !== undefined ? judul : row.judul,
      konten !== undefined ? konten : row.konten,
      finalGambar,
      status || row.status,
      tanggal_mulai !== undefined ? tanggal_mulai : row.tanggal_mulai,
      tanggal_selesai !== undefined ? tanggal_selesai : row.tanggal_selesai,
      urutan !== undefined ? urutan : row.urutan,
      tampilkan_judul !== undefined ? (tampilkan_judul === 'true' || tampilkan_judul === '1' || tampilkan_judul === true ? 1 : 0) : row.tampilkan_judul,
      tampilkan_konten !== undefined ? (tampilkan_konten === 'true' || tampilkan_konten === '1' || tampilkan_konten === true ? 1 : 0) : row.tampilkan_konten,
      req.params.id
    ];
    
    db.run(sql, params, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Pengumuman berhasil diupdate' });
    });
  });
});

// DELETE - Hapus pengumuman
router.delete('/:id', (req, res) => {
  // Get pengumuman data first
  db.get('SELECT * FROM pengumuman WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
    }
    
    // Delete image file
    if (row.gambar) {
      const imagePath = path.join('public/uploads', row.gambar);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete from database
    db.run('DELETE FROM pengumuman WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Pengumuman berhasil dihapus' });
    });
  });
});

module.exports = router;
