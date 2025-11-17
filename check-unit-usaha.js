// Script untuk mengecek data Unit Usaha
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./koperasi.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database connected\n');
});

db.serialize(() => {
  // Check unit usaha
  db.all('SELECT * FROM unit_usaha', [], (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    console.log('=== DATA UNIT USAHA ===\n');
    
    if (rows.length === 0) {
      console.log('⚠️  TIDAK ADA DATA UNIT USAHA!');
      console.log('\nUnit Usaha diperlukan untuk:');
      console.log('- Transaksi Penjualan');
      console.log('- Pengeluaran (opsional)');
      console.log('- Partisipasi Anggota');
      console.log('\nSilakan tambahkan Unit Usaha dari menu admin:');
      console.log('Dashboard Admin → Data Unit Usaha → Tambah Unit Usaha');
      console.log('\nContoh Unit Usaha:');
      console.log('- Toko Sembako');
      console.log('- Warung Makan');
      console.log('- Jasa Fotocopy');
      console.log('- dll.');
    } else {
      console.log(`Total Unit Usaha: ${rows.length}\n`);
      
      rows.forEach((unit, index) => {
        console.log(`${index + 1}. ${unit.nama_usaha}`);
        console.log(`   ID: ${unit.id}`);
        console.log(`   Jenis: ${unit.jenis_usaha || '-'}`);
        console.log(`   Status: ${unit.status}`);
        console.log(`   Modal Awal: Rp ${(unit.modal_awal || 0).toLocaleString('id-ID')}`);
        console.log(`   Tanggal Mulai: ${unit.tanggal_mulai || '-'}`);
        console.log('');
      });
      
      const aktif = rows.filter(u => u.status === 'aktif').length;
      const nonaktif = rows.filter(u => u.status === 'nonaktif').length;
      
      console.log('Status:');
      console.log(`- Aktif: ${aktif}`);
      console.log(`- Non-Aktif: ${nonaktif}`);
      
      if (aktif === 0) {
        console.log('\n⚠️  TIDAK ADA UNIT USAHA AKTIF!');
        console.log('Silakan aktifkan minimal 1 Unit Usaha dari menu admin.');
      } else {
        console.log('\n✓ Unit Usaha siap digunakan!');
      }
    }
    
    db.close();
  });
});
