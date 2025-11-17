const express = require('express');
const router = express.Router();
const db = require('./database');

// Get all pengurus
router.get('/', (req, res) => {
  db.all(`SELECT p.*, a.nama_lengkap, a.nomor_anggota, a.foto 
          FROM pengurus p 
          LEFT JOIN anggota a ON p.anggota_id = a.id 
          ORDER BY p.id DESC`, [], (err, rows) => {
    if (err) {
      console.error('Error getting pengurus:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Create pengurus
router.post('/', (req, res) => {
  const { anggota_id, jabatan, periode_mulai, periode_selesai } = req.body;
  
  db.run(`INSERT INTO pengurus (anggota_id, jabatan, periode_mulai, periode_selesai) 
          VALUES (?, ?, ?, ?)`,
    [anggota_id, jabatan, periode_mulai, periode_selesai],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pengurus berhasil ditambahkan', id: this.lastID });
    }
  );
});

// Update pengurus
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { anggota_id, jabatan, periode_mulai, periode_selesai, status } = req.body;
  
  db.run(`UPDATE pengurus SET anggota_id = ?, jabatan = ?, periode_mulai = ?, periode_selesai = ?, status = ? 
          WHERE id = ?`,
    [anggota_id, jabatan, periode_mulai, periode_selesai, status, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pengurus berhasil diupdate' });
    }
  );
});

// Delete pengurus
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM pengurus WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pengurus berhasil dihapus' });
  });
});

module.exports = router;
