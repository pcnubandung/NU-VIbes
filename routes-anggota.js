const express = require('express');
const router = express.Router();
const db = require('./database');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage });

// Get all anggota
router.get('/', (req, res) => {
  db.all('SELECT * FROM anggota ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get anggota by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM anggota WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Create anggota
router.post('/', upload.single('foto'), async (req, res) => {
  const { nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, nomor_telpon, email, pekerjaan, tanggal_bergabung, username, password } = req.body;
  const foto = req.file ? req.file.filename : null;

  // Hash password if provided
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  db.run(`INSERT INTO anggota (nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, nomor_telpon, email, pekerjaan, foto, tanggal_bergabung, username, password) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, nomor_telpon, email, pekerjaan, foto, tanggal_bergabung, username, hashedPassword],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Anggota berhasil ditambahkan', id: this.lastID });
    }
  );
});

// Update anggota
router.put('/:id', upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const { nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, nomor_telpon, email, pekerjaan, tanggal_bergabung, status, username, password } = req.body;
  const foto = req.file ? req.file.filename : null;

  let query = `UPDATE anggota SET nomor_anggota = ?, nama_lengkap = ?, nik = ?, tempat_lahir = ?, tanggal_lahir = ?, jenis_kelamin = ?, alamat = ?, nomor_telpon = ?, email = ?, pekerjaan = ?, tanggal_bergabung = ?, status = ?`;
  let params = [nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, nomor_telpon, email, pekerjaan, tanggal_bergabung, status];

  if (foto) {
    query += ', foto = ?';
    params.push(foto);
  }

  if (username) {
    query += ', username = ?';
    params.push(username);
  }

  // Only update password if provided (not empty)
  if (password && password.trim() !== '') {
    const hashedPassword = await bcrypt.hash(password, 10);
    query += ', password = ?';
    params.push(hashedPassword);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Anggota berhasil diupdate' });
  });
});

// Delete anggota
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM anggota WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Anggota berhasil dihapus' });
  });
});

module.exports = router;


// Import Excel
const ExcelJS = require('exceljs');

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File Excel tidak ditemukan' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return res.status(400).json({ error: 'Worksheet tidak ditemukan' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Skip header row (row 1)
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Skip empty rows
      if (!row.getCell(1).value) continue;

      try {
        const anggotaData = {
          nomor_anggota: row.getCell(1).value?.toString() || '',
          nama_lengkap: row.getCell(2).value?.toString() || '',
          nik: row.getCell(3).value?.toString() || null,
          tempat_lahir: row.getCell(4).value?.toString() || null,
          tanggal_lahir: row.getCell(5).value ? formatExcelDate(row.getCell(5).value) : null,
          jenis_kelamin: row.getCell(6).value?.toString() || null,
          alamat: row.getCell(7).value?.toString() || null,
          nomor_telpon: row.getCell(8).value?.toString() || null,
          email: row.getCell(9).value?.toString() || null,
          pekerjaan: row.getCell(10).value?.toString() || null,
          tanggal_bergabung: row.getCell(11).value ? formatExcelDate(row.getCell(11).value) : new Date().toISOString().split('T')[0],
          status: row.getCell(12).value?.toString() || 'aktif'
        };

        // Validate required fields
        if (!anggotaData.nomor_anggota || !anggotaData.nama_lengkap) {
          results.failed++;
          results.errors.push(`Baris ${rowNumber}: Nomor anggota dan nama lengkap wajib diisi`);
          continue;
        }

        // Check if nomor_anggota already exists
        const existing = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM anggota WHERE nomor_anggota = ?', [anggotaData.nomor_anggota], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (existing) {
          results.failed++;
          results.errors.push(`Baris ${rowNumber}: Nomor anggota ${anggotaData.nomor_anggota} sudah ada`);
          continue;
        }

        // Generate default password (nomor_anggota)
        const hashedPassword = await bcrypt.hash(anggotaData.nomor_anggota, 10);

        // Insert to database
        await new Promise((resolve, reject) => {
          const sql = `
            INSERT INTO anggota (
              nomor_anggota, nama_lengkap, nik, tempat_lahir, tanggal_lahir,
              jenis_kelamin, alamat, nomor_telpon, email, pekerjaan,
              tanggal_bergabung, status, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          db.run(sql, [
            anggotaData.nomor_anggota,
            anggotaData.nama_lengkap,
            anggotaData.nik,
            anggotaData.tempat_lahir,
            anggotaData.tanggal_lahir,
            anggotaData.jenis_kelamin,
            anggotaData.alamat,
            anggotaData.nomor_telpon,
            anggotaData.email,
            anggotaData.pekerjaan,
            anggotaData.tanggal_bergabung,
            anggotaData.status,
            hashedPassword
          ], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Baris ${rowNumber}: ${error.message}`);
      }
    }

    // Delete uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Import selesai',
      results: results
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to format Excel date
function formatExcelDate(excelDate) {
  if (excelDate instanceof Date) {
    return excelDate.toISOString().split('T')[0];
  }
  
  // Excel stores dates as numbers (days since 1900-01-01)
  if (typeof excelDate === 'number') {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  // If it's already a string in YYYY-MM-DD format
  if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
    return excelDate;
  }
  
  return null;
}

module.exports = router;


// Download Template Excel
router.get('/template', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template Anggota');
    
    // Set column headers
    worksheet.columns = [
      { header: 'Nomor Anggota *', key: 'nomor_anggota', width: 20 },
      { header: 'Nama Lengkap *', key: 'nama_lengkap', width: 30 },
      { header: 'NIK', key: 'nik', width: 20 },
      { header: 'Tempat Lahir', key: 'tempat_lahir', width: 20 },
      { header: 'Tanggal Lahir (YYYY-MM-DD)', key: 'tanggal_lahir', width: 25 },
      { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
      { header: 'Alamat', key: 'alamat', width: 40 },
      { header: 'Nomor Telepon', key: 'nomor_telpon', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Pekerjaan', key: 'pekerjaan', width: 25 },
      { header: 'Tanggal Bergabung (YYYY-MM-DD)', key: 'tanggal_bergabung', width: 30 },
      { header: 'Status (aktif/nonaktif)', key: 'status', width: 20 }
    ];
    
    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E7D32' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;
    
    // Add sample data
    worksheet.addRow({
      nomor_anggota: 'A001',
      nama_lengkap: 'John Doe',
      nik: '3201234567890123',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '1990-01-15',
      jenis_kelamin: 'Laki-laki',
      alamat: 'Jl. Contoh No. 123, Jakarta',
      nomor_telpon: '081234567890',
      email: 'john@example.com',
      pekerjaan: 'Wiraswasta',
      tanggal_bergabung: '2024-01-01',
      status: 'aktif'
    });
    
    worksheet.addRow({
      nomor_anggota: 'A002',
      nama_lengkap: 'Jane Smith',
      nik: '3201234567890124',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '1992-05-20',
      jenis_kelamin: 'Perempuan',
      alamat: 'Jl. Contoh No. 456, Bandung',
      nomor_telpon: '081234567891',
      email: 'jane@example.com',
      pekerjaan: 'Pegawai Swasta',
      tanggal_bergabung: '2024-01-01',
      status: 'aktif'
    });
    
    // Add notes worksheet
    const notesSheet = workbook.addWorksheet('Catatan');
    notesSheet.getColumn(1).width = 80;
    
    notesSheet.addRow(['PANDUAN IMPORT DATA ANGGOTA']);
    notesSheet.getRow(1).font = { bold: true, size: 14 };
    notesSheet.addRow([]);
    notesSheet.addRow(['1. Kolom yang wajib diisi ditandai dengan tanda bintang (*)']);
    notesSheet.addRow(['2. Nomor Anggota harus unik (tidak boleh sama)']);
    notesSheet.addRow(['3. Format tanggal: YYYY-MM-DD (contoh: 2024-01-15)']);
    notesSheet.addRow(['4. Jenis Kelamin: Laki-laki atau Perempuan']);
    notesSheet.addRow(['5. Status: aktif atau nonaktif']);
    notesSheet.addRow(['6. Password default akan diset sama dengan Nomor Anggota']);
    notesSheet.addRow(['7. Hapus baris contoh sebelum mengimport data asli']);
    notesSheet.addRow([]);
    notesSheet.addRow(['KOLOM YANG WAJIB DIISI:']);
    notesSheet.addRow(['- Nomor Anggota']);
    notesSheet.addRow(['- Nama Lengkap']);
    notesSheet.addRow([]);
    notesSheet.addRow(['KOLOM OPSIONAL:']);
    notesSheet.addRow(['- NIK, Tempat Lahir, Tanggal Lahir, Jenis Kelamin']);
    notesSheet.addRow(['- Alamat, Nomor Telepon, Email, Pekerjaan']);
    notesSheet.addRow(['- Tanggal Bergabung (default: hari ini)']);
    notesSheet.addRow(['- Status (default: aktif)']);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Template_Import_Anggota.xlsx');
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Template error:', error);
    res.status(500).json({ error: error.message });
  }
});

