const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./koperasi.db');

db.serialize(() => {
  // Add new columns for display options
  db.run(`
    ALTER TABLE pengumuman 
    ADD COLUMN tampilkan_judul INTEGER DEFAULT 1
  `, (err) => {
    if (err) {
      console.log('Column tampilkan_judul already exists or error:', err.message);
    } else {
      console.log('✅ Column tampilkan_judul added');
    }
  });
  
  db.run(`
    ALTER TABLE pengumuman 
    ADD COLUMN tampilkan_konten INTEGER DEFAULT 1
  `, (err) => {
    if (err) {
      console.log('Column tampilkan_konten already exists or error:', err.message);
    } else {
      console.log('✅ Column tampilkan_konten added');
    }
  });
  
  // Update existing records to show title and content by default
  db.run(`
    UPDATE pengumuman 
    SET tampilkan_judul = 1, tampilkan_konten = 1
    WHERE tampilkan_judul IS NULL OR tampilkan_konten IS NULL
  `, (err) => {
    if (err) {
      console.error('Error updating existing records:', err);
    } else {
      console.log('✅ Existing records updated with default values');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('\n✅ Database schema updated successfully!');
    console.log('Restart server untuk melihat perubahan.');
  }
});
