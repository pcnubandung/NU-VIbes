// Script untuk reset database
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'koperasi.db');

console.log('🔄 Mereset database...');

// Hapus database lama jika ada
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('✅ Database lama berhasil dihapus');
  } catch (error) {
    console.error('❌ Error menghapus database:', error.message);
    process.exit(1);
  }
} else {
  console.log('ℹ️  Database tidak ditemukan, akan membuat yang baru');
}

console.log('✅ Reset selesai!');
console.log('📝 Jalankan "npm start" untuk membuat database baru');
