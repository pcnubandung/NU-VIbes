// Migration script to add username and password to anggota table
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

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
      console.log('Column username might already exist or error:', err.message);
    } else {
      console.log('✅ Column username added');
    }
  });
  
  // Add password column
  db.run(`ALTER TABLE anggota ADD COLUMN password TEXT`, (err) => {
    if (err) {
      console.log('Column password might already exist or error:', err.message);
    } else {
      console.log('✅ Column password added');
    }
  });
  
  // Update existing anggota with default credentials
  db.all('SELECT id, email, nomor_anggota FROM anggota WHERE username IS NULL', [], async (err, rows) => {
    if (err) {
      console.error('Error fetching anggota:', err);
      return;
    }
    
    console.log(`\n📝 Updating ${rows.length} anggota with default credentials...\n`);
    
    const defaultPassword = bcrypt.hashSync('member123', 10);
    
    for (const row of rows) {
      const username = row.email || `member${row.nomor_anggota}`;
      
      db.run(
        'UPDATE anggota SET username = ?, password = ? WHERE id = ?',
        [username, defaultPassword, row.id],
        (err) => {
          if (err) {
            console.error(`❌ Error updating anggota ${row.id}:`, err);
          } else {
            console.log(`✅ Updated anggota ${row.id}: username = ${username}, password = member123`);
          }
        }
      );
    }
    
    setTimeout(() => {
      console.log('\n✅ Migration completed!');
      console.log('\n📋 Default credentials for all members:');
      console.log('   Username: [email] or member[nomor_anggota]');
      console.log('   Password: member123');
      console.log('\n⚠️  Members should change their password after first login!\n');
      db.close();
    }, 2000);
  });
});
