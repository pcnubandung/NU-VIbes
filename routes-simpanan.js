const express = require('express');
const router = express.Router();
const db = require('./database');

// Simpanan Pokok
router.get('/pokok', (req, res) => {
  db.all(`SELECT sp.*, a.nama_lengkap, a.nomor_anggota 
          FROM simpanan_pokok sp 
          JOIN anggota a ON sp.anggota_id = a.id 
          ORDER BY sp.tanggal_transaksi DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/pokok', (req, res) => {
  const { anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan } = req.body;
  db.run('INSERT INTO simpanan_pokok (anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan) VALUES (?, ?, ?, ?, ?)',
    [anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Simpanan pokok berhasil ditambahkan', id: this.lastID });
    }
  );
});

// Simpanan Wajib
router.get('/wajib', (req, res) => {
  db.all(`SELECT sw.*, a.nama_lengkap, a.nomor_anggota 
          FROM simpanan_wajib sw 
          JOIN anggota a ON sw.anggota_id = a.id 
          ORDER BY sw.tanggal_transaksi DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/wajib', (req, res) => {
  const { anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan } = req.body;
  db.run('INSERT INTO simpanan_wajib (anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan) VALUES (?, ?, ?, ?, ?)',
    [anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Simpanan wajib berhasil ditambahkan', id: this.lastID });
    }
  );
});

// Simpanan Khusus
router.get('/khusus', (req, res) => {
  db.all(`SELECT sk.*, a.nama_lengkap, a.nomor_anggota 
          FROM simpanan_khusus sk 
          JOIN anggota a ON sk.anggota_id = a.id 
          ORDER BY sk.tanggal_transaksi DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/khusus', (req, res) => {
  const { anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan } = req.body;
  db.run('INSERT INTO simpanan_khusus (anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan) VALUES (?, ?, ?, ?, ?)',
    [anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Simpanan khusus berhasil ditambahkan', id: this.lastID });
    }
  );
});

// Simpanan Sukarela
router.get('/sukarela', (req, res) => {
  db.all(`SELECT ss.*, a.nama_lengkap, a.nomor_anggota 
          FROM simpanan_sukarela ss 
          JOIN anggota a ON ss.anggota_id = a.id 
          ORDER BY ss.tanggal_transaksi DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/sukarela', (req, res) => {
  const { anggota_id, jumlah, jenis, tanggal_transaksi, metode_pembayaran, keterangan } = req.body;
  db.run('INSERT INTO simpanan_sukarela (anggota_id, jumlah, jenis, tanggal_transaksi, metode_pembayaran, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
    [anggota_id, jumlah, jenis, tanggal_transaksi, metode_pembayaran, keterangan],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Simpanan sukarela berhasil ditambahkan', id: this.lastID });
    }
  );
});

module.exports = router;


// Update Simpanan Pokok
router.put('/pokok/:id', (req, res) => {
  const { id } = req.params;
  const { anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan } = req.body;
  
  db.run('UPDATE simpanan_pokok SET anggota_id = ?, jumlah = ?, tanggal_transaksi = ?, metode_pembayaran = ?, keterangan = ? WHERE id = ?',
    [anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Simpanan pokok berhasil diupdate' });
    }
  );
});

// Delete Simpanan Pokok
router.delete('/pokok/:id', (req, res) => {
  db.run('DELETE FROM simpanan_pokok WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Simpanan pokok berhasil dihapus' });
  });
});

// Update Simpanan Wajib
router.put('/wajib/:id', (req, res) => {
  const { id } = req.params;
  const { anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan } = req.body;
  
  db.run('UPDATE simpanan_wajib SET anggota_id = ?, jumlah = ?, tanggal_transaksi = ?, metode_pembayaran = ?, keterangan = ? WHERE id = ?',
    [anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Simpanan wajib berhasil diupdate' });
    }
  );
});

// Delete Simpanan Wajib
router.delete('/wajib/:id', (req, res) => {
  db.run('DELETE FROM simpanan_wajib WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Simpanan wajib berhasil dihapus' });
  });
});

// Update Simpanan Khusus
router.put('/khusus/:id', (req, res) => {
  const { id } = req.params;
  const { anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan } = req.body;
  
  db.run('UPDATE simpanan_khusus SET anggota_id = ?, jumlah = ?, tanggal_transaksi = ?, metode_pembayaran = ?, keterangan = ? WHERE id = ?',
    [anggota_id, jumlah, tanggal_transaksi, metode_pembayaran, keterangan, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Simpanan khusus berhasil diupdate' });
    }
  );
});

// Delete Simpanan Khusus
router.delete('/khusus/:id', (req, res) => {
  db.run('DELETE FROM simpanan_khusus WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Simpanan khusus berhasil dihapus' });
  });
});

// Update Simpanan Sukarela
router.put('/sukarela/:id', (req, res) => {
  const { id } = req.params;
  const { anggota_id, jumlah, jenis, tanggal_transaksi, metode_pembayaran, keterangan } = req.body;
  
  db.run('UPDATE simpanan_sukarela SET anggota_id = ?, jumlah = ?, jenis = ?, tanggal_transaksi = ?, metode_pembayaran = ?, keterangan = ? WHERE id = ?',
    [anggota_id, jumlah, jenis, tanggal_transaksi, metode_pembayaran, keterangan, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Simpanan sukarela berhasil diupdate' });
    }
  );
});

// Delete Simpanan Sukarela
router.delete('/sukarela/:id', (req, res) => {
  db.run('DELETE FROM simpanan_sukarela WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Simpanan sukarela berhasil dihapus' });
  });
});
