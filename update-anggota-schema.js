// Script untuk menambahkan kolom username dan password ke tabel anggota
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./koperasi.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database connected');
});

db.serialize(() => {
  // Add username column
  db.run(`ALTER TABLE anggota ADD COLUMN username TEXT`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✓ Kolom username sudah ada');
      } else {
        console.error('Error adding username column:', err.message);
      }
    } else {
      console.log('✓ Kolom username berhasil ditambahkan');
    }
  });

  // Add password column
  db.run(`ALTER TABLE anggota ADD COLUMN password TEXT`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✓ Kolom password sudah ada');
      } else {
        console.error('Error adding password column:', err.message);
      }
    } else {
      console.log('✓ Kolom password berhasil ditambahkan');
    }
  });

  // Check current anggota data
  db.all('SELECT id, nomor_anggota, nama_lengkap, email, username, password FROM anggota', [], (err, rows) => {
    if (err) {
      console.error('Error fetching anggota:', err);
    } else {
      console.log('\n=== Data Anggota ===');
      console.log(`Total anggota: ${rows.length}`);
      rows.forEach(row => {
        console.log(`- ${row.nama_lengkap} (${row.nomor_anggota})`);
        console.log(`  Email: ${row.email || 'belum ada'}`);
        console.log(`  Username: ${row.username || 'belum ada'}`);
        console.log(`  Password: ${row.password ? 'sudah diset' : 'belum diset'}`);
      });
      
      console.log('\n✓ Update schema selesai!');
      console.log('\nCatatan:');
      console.log('- Anggota yang belum punya username/password perlu diset dari admin');
      console.log('- Atau anggota bisa login menggunakan email mereka');
    }
    
    db.close();
  });
});
