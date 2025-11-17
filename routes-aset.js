const express = require('express');
const router = express.Router();
const db = require('./database');

// Get all aset
router.get('/', (req, res) => {
  db.all(`SELECT a.*, u.nama_usaha 
          FROM aset_inventaris a 
          LEFT JOIN unit_usaha u ON a.unit_usaha_id = u.id 
          ORDER BY a.id DESC`, [], (err, rows) => {
    if (err) {
      console.error('Error getting aset:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Get aset by unit usaha
router.get('/unit/:unit_id', (req, res) => {
  db.all(`SELECT * FROM aset_inventaris WHERE unit_usaha_id = ? ORDER BY tanggal_perolehan DESC`, 
    [req.params.unit_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create aset
router.post('/', (req, res) => {
  const { unit_usaha_id, nama_aset, kategori, nilai, nilai_sekarang, tanggal_perolehan, kondisi } = req.body;
  
  db.run(`INSERT INTO aset_inventaris (unit_usaha_id, nama_aset, kategori, nilai, nilai_sekarang, tanggal_perolehan, kondisi) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [unit_usaha_id, nama_aset, kategori, nilai, nilai_sekarang || nilai, tanggal_perolehan, kondisi],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Aset berhasil ditambahkan', id: this.lastID });
    }
  );
});

// Update aset
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { unit_usaha_id, nama_aset, kategori, nilai, nilai_sekarang, tanggal_perolehan, kondisi } = req.body;
  
  db.run(`UPDATE aset_inventaris SET unit_usaha_id = ?, nama_aset = ?, kategori = ?, nilai = ?, nilai_sekarang = ?, tanggal_perolehan = ?, kondisi = ? 
          WHERE id = ?`,
    [unit_usaha_id, nama_aset, kategori, nilai, nilai_sekarang, tanggal_perolehan, kondisi, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Aset berhasil diupdate' });
    }
  );
});

// Delete aset
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM aset_inventaris WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Aset berhasil dihapus' });
  });
});

module.exports = router;
