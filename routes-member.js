// Member routes for authentication and profile management
const express = require('express');
const router = express.Router();
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = 'koperasi-nu-vibes-secret-key-2024';

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Member Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Try to find by username or email
  db.get(
    'SELECT * FROM anggota WHERE (username = ? OR email = ?) AND status = "aktif"',
    [username, username],
    async (err, anggota) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!anggota) {
        return res.status(401).json({ error: 'Username/email atau password salah' });
      }
      
      if (!anggota.password) {
        return res.status(401).json({ error: 'Akun belum diaktifkan. Hubungi admin untuk mengatur password.' });
      }
      
      const validPassword = await bcrypt.compare(password, anggota.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Username/email atau password salah' });
      }
      
      // Generate token
      const token = jwt.sign(
        { 
          id: anggota.id, 
          username: anggota.username || anggota.email,
          role: 'Member',
          anggota_id: anggota.id
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Remove password from response
      delete anggota.password;
      
      res.json({
        token,
        user: {
          id: anggota.id,
          username: anggota.username || anggota.email,
          nama_lengkap: anggota.nama_lengkap,
          role: 'Member',
          anggota_id: anggota.id
        },
        anggota: anggota
      });
    }
  );
});

// Get member profile (authenticated)
router.get('/profile', authenticateMember, (req, res) => {
  db.get(
    'SELECT id, nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, nomor_telpon, email, pekerjaan, foto, tanggal_bergabung, status, username FROM anggota WHERE id = ?',
    [req.user.anggota_id],
    (err, anggota) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!anggota) {
        return res.status(404).json({ error: 'Anggota tidak ditemukan' });
      }
      
      res.json(anggota);
    }
  );
});

// Update member profile
router.put('/profile', authenticateMember, upload.single('foto'), (req, res) => {
  const { 
    nama_lengkap, 
    nik, 
    tempat_lahir, 
    tanggal_lahir, 
    jenis_kelamin, 
    alamat, 
    nomor_telpon, 
    email, 
    pekerjaan 
  } = req.body;
  
  let updateFields = [];
  let values = [];
  
  if (nama_lengkap) {
    updateFields.push('nama_lengkap = ?');
    values.push(nama_lengkap);
  }
  if (nik) {
    updateFields.push('nik = ?');
    values.push(nik);
  }
  if (tempat_lahir) {
    updateFields.push('tempat_lahir = ?');
    values.push(tempat_lahir);
  }
  if (tanggal_lahir) {
    updateFields.push('tanggal_lahir = ?');
    values.push(tanggal_lahir);
  }
  if (jenis_kelamin) {
    updateFields.push('jenis_kelamin = ?');
    values.push(jenis_kelamin);
  }
  if (alamat) {
    updateFields.push('alamat = ?');
    values.push(alamat);
  }
  if (nomor_telpon) {
    updateFields.push('nomor_telpon = ?');
    values.push(nomor_telpon);
  }
  if (email) {
    updateFields.push('email = ?');
    values.push(email);
  }
  if (pekerjaan) {
    updateFields.push('pekerjaan = ?');
    values.push(pekerjaan);
  }
  if (req.file) {
    updateFields.push('foto = ?');
    values.push(req.file.filename);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'Tidak ada data yang diupdate' });
  }
  
  values.push(req.user.anggota_id);
  
  const sql = `UPDATE anggota SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ message: 'Profil berhasil diupdate' });
  });
});

// Change password
router.post('/change-password', authenticateMember, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Password lama dan baru harus diisi' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
  }
  
  // Get current password
  db.get(
    'SELECT password FROM anggota WHERE id = ?',
    [req.user.anggota_id],
    async (err, anggota) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!anggota) {
        return res.status(404).json({ error: 'Anggota tidak ditemukan' });
      }
      
      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, anggota.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Password lama tidak sesuai' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      db.run(
        'UPDATE anggota SET password = ? WHERE id = ?',
        [hashedPassword, req.user.anggota_id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.json({ message: 'Password berhasil diubah' });
        }
      );
    }
  );
});

// Middleware to authenticate member
function authenticateMember(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}

module.exports = router;
