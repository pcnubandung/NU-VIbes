// Script untuk mengatur password default untuk anggota yang belum punya password
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./koperasi.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database connected');
});

const DEFAULT_PASSWORD = 'member123';

db.serialize(async () => {
  // Get all anggota without password
  db.all('SELECT id, nomor_anggota, nama_lengkap, email, username FROM anggota WHERE password IS NULL OR password = ""', [], async (err, rows) => {
    if (err) {
      console.error('Error fetching anggota:', err);
      db.close();
      return;
    }

    console.log(`\nDitemukan ${rows.length} anggota tanpa password`);
    
    if (rows.length === 0) {
      console.log('Semua anggota sudah memiliki password!');
      db.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    
    let completed = 0;
    
    for (const anggota of rows) {
      // Set username jika belum ada (gunakan email atau nomor anggota)
      let username = anggota.username;
      if (!username) {
        username = anggota.email || `member${anggota.nomor_anggota}`;
      }
      
      db.run(
        'UPDATE anggota SET username = ?, password = ? WHERE id = ?',
        [username, hashedPassword, anggota.id],
        (err) => {
          if (err) {
            console.error(`✗ Error updating ${anggota.nama_lengkap}:`, err.message);
          } else {
            console.log(`✓ ${anggota.nama_lengkap} (${anggota.nomor_anggota})`);
            console.log(`  Username: ${username}`);
            console.log(`  Password: ${DEFAULT_PASSWORD}`);
          }
          
          completed++;
          if (completed === rows.length) {
            console.log('\n✓ Selesai! Semua anggota sudah diset password default.');
            console.log(`\nPassword default: ${DEFAULT_PASSWORD}`);
            console.log('Anggota bisa login dengan username atau email mereka.');
            db.close();
          }
        }
      );
    }
  });
});
