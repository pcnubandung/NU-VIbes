// Script untuk mengecek data member dan simpanan mereka
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./koperasi.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database connected\n');
});

db.serialize(() => {
  // Get all anggota with login credentials
  db.all('SELECT id, nomor_anggota, nama_lengkap, email, username FROM anggota WHERE password IS NOT NULL', [], (err, anggota) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    console.log('=== ANGGOTA YANG BISA LOGIN ===\n');
    
    if (anggota.length === 0) {
      console.log('Tidak ada anggota yang bisa login!');
      console.log('Jalankan: node set-default-member-password.js');
      db.close();
      return;
    }

    let processed = 0;
    
    anggota.forEach(member => {
      console.log(`${member.nama_lengkap} (${member.nomor_anggota})`);
      console.log(`  Username: ${member.username || '-'}`);
      console.log(`  Email: ${member.email || '-'}`);
      
      // Check simpanan
      const queries = [
        { name: 'Simpanan Pokok', table: 'simpanan_pokok' },
        { name: 'Simpanan Wajib', table: 'simpanan_wajib' },
        { name: 'Simpanan Khusus', table: 'simpanan_khusus' },
        { name: 'Simpanan Sukarela', table: 'simpanan_sukarela' }
      ];
      
      let queryCount = 0;
      let totalSimpanan = 0;
      
      queries.forEach(q => {
        db.get(
          `SELECT COUNT(*) as count, COALESCE(SUM(jumlah), 0) as total FROM ${q.table} WHERE anggota_id = ?`,
          [member.id],
          (err, result) => {
            if (!err && result) {
              if (result.count > 0) {
                console.log(`  ${q.name}: ${result.count} transaksi = Rp ${result.total.toLocaleString('id-ID')}`);
                totalSimpanan += result.total;
              }
            }
            
            queryCount++;
            if (queryCount === queries.length) {
              // Check partisipasi
              db.get(
                'SELECT COUNT(*) as count, COALESCE(SUM(jumlah_transaksi), 0) as total FROM partisipasi_anggota WHERE anggota_id = ?',
                [member.id],
                (err, partisipasi) => {
                  if (!err && partisipasi && partisipasi.count > 0) {
                    console.log(`  Partisipasi: ${partisipasi.count} transaksi = Rp ${partisipasi.total.toLocaleString('id-ID')}`);
                  }
                  
                  if (totalSimpanan === 0 && (!partisipasi || partisipasi.total === 0)) {
                    console.log('  ⚠️  TIDAK ADA DATA SIMPANAN/PARTISIPASI');
                  } else {
                    console.log(`  ✓ Total Simpanan: Rp ${totalSimpanan.toLocaleString('id-ID')}`);
                  }
                  
                  console.log('');
                  
                  processed++;
                  if (processed === anggota.length) {
                    console.log('\n=== RINGKASAN ===');
                    console.log(`Total anggota yang bisa login: ${anggota.length}`);
                    console.log('\nCara login:');
                    console.log('1. Buka http://localhost:3000/member-login.html');
                    console.log('2. Gunakan username/email dan password: member123');
                    console.log('3. Jika dashboard kosong, tambahkan data simpanan dari admin panel');
                    db.close();
                  }
                }
              );
            }
          }
        );
      });
    });
  });
});
