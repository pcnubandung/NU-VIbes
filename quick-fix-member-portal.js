// Quick fix script untuk memastikan member portal berfungsi
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');

console.log('=== QUICK FIX MEMBER PORTAL ===\n');

// 1. Check database
console.log('1. Checking database...');
const db = new sqlite3.Database('./koperasi.db', (err) => {
  if (err) {
    console.error('✗ Database error:', err.message);
    process.exit(1);
  }
  console.log('✓ Database connected\n');
});

db.serialize(async () => {
  // 2. Check anggota table schema
  console.log('2. Checking anggota table schema...');
  db.all("PRAGMA table_info(anggota)", [], (err, columns) => {
    if (err) {
      console.error('✗ Error:', err.message);
      return;
    }
    
    const hasUsername = columns.some(col => col.name === 'username');
    const hasPassword = columns.some(col => col.name === 'password');
    
    if (hasUsername && hasPassword) {
      console.log('✓ Schema OK (username & password columns exist)\n');
    } else {
      console.log('✗ Schema incomplete!');
      console.log('  Run: node update-anggota-schema.js\n');
      db.close();
      return;
    }
    
    // 3. Check anggota with login credentials
    console.log('3. Checking anggota with login credentials...');
    db.all('SELECT id, nomor_anggota, nama_lengkap, username, email, password FROM anggota', [], async (err, anggota) => {
      if (err) {
        console.error('✗ Error:', err.message);
        db.close();
        return;
      }
      
      const withPassword = anggota.filter(a => a.password);
      console.log(`✓ Found ${anggota.length} anggota, ${withPassword.length} with password\n`);
      
      if (withPassword.length === 0) {
        console.log('✗ No anggota with password!');
        console.log('  Run: node set-default-member-password.js\n');
        db.close();
        return;
      }
      
      // 4. Check JWT secret in routes-member.js
      console.log('4. Checking JWT secret...');
      try {
        const routesMember = fs.readFileSync('./routes-member.js', 'utf8');
        const serverJs = fs.readFileSync('./server.js', 'utf8');
        
        const memberSecret = routesMember.match(/JWT_SECRET\s*=\s*['"]([^'"]+)['"]/);
        const serverSecret = serverJs.match(/SECRET_KEY\s*=\s*['"]([^'"]+)['"]/);
        
        if (memberSecret && serverSecret) {
          if (memberSecret[1] === serverSecret[1]) {
            console.log('✓ JWT secrets match:', memberSecret[1], '\n');
          } else {
            console.log('✗ JWT secrets DO NOT match!');
            console.log('  routes-member.js:', memberSecret[1]);
            console.log('  server.js:', serverSecret[1]);
            console.log('  Fix: Update routes-member.js to use same secret\n');
          }
        }
      } catch (e) {
        console.log('⚠ Could not verify JWT secrets:', e.message, '\n');
      }
      
      // 5. Test member data
      console.log('5. Checking member data...');
      const testMember = withPassword[0];
      
      db.get(`
        SELECT 
          (SELECT COUNT(*) FROM simpanan_pokok WHERE anggota_id = ?) as pokok,
          (SELECT COUNT(*) FROM simpanan_wajib WHERE anggota_id = ?) as wajib,
          (SELECT COUNT(*) FROM simpanan_khusus WHERE anggota_id = ?) as khusus,
          (SELECT COUNT(*) FROM simpanan_sukarela WHERE anggota_id = ?) as sukarela,
          (SELECT COUNT(*) FROM partisipasi_anggota WHERE anggota_id = ?) as partisipasi
      `, [testMember.id, testMember.id, testMember.id, testMember.id, testMember.id], (err, counts) => {
        if (err) {
          console.error('✗ Error:', err.message);
        } else {
          const total = counts.pokok + counts.wajib + counts.khusus + counts.sukarela + counts.partisipasi;
          console.log(`Test member: ${testMember.nama_lengkap} (${testMember.nomor_anggota})`);
          console.log(`  Simpanan Pokok: ${counts.pokok}`);
          console.log(`  Simpanan Wajib: ${counts.wajib}`);
          console.log(`  Simpanan Khusus: ${counts.khusus}`);
          console.log(`  Simpanan Sukarela: ${counts.sukarela}`);
          console.log(`  Partisipasi: ${counts.partisipasi}`);
          
          if (total > 0) {
            console.log(`✓ Member has data (${total} records)\n`);
          } else {
            console.log('⚠ Member has NO data (dashboard will be empty)\n');
          }
        }
        
        // 6. Summary
        console.log('=== SUMMARY ===\n');
        console.log('Login credentials:');
        withPassword.forEach(a => {
          console.log(`  ${a.nama_lengkap}`);
          console.log(`    Username: ${a.username || a.email || 'N/A'}`);
          console.log(`    Password: member123 (default)`);
        });
        
        console.log('\n=== NEXT STEPS ===\n');
        console.log('1. Restart server:');
        console.log('   Ctrl+C to stop, then: node server.js\n');
        console.log('2. Clear browser localStorage:');
        console.log('   Open Console (F12) and run: localStorage.clear()\n');
        console.log('3. Test API:');
        console.log('   Open: http://localhost:3000/test-member-api.html\n');
        console.log('4. Login to member portal:');
        console.log('   Open: http://localhost:3000/member-login.html');
        console.log(`   Username: ${withPassword[0].username || withPassword[0].email}`);
        console.log('   Password: member123\n');
        console.log('5. Check browser console for errors\n');
        
        db.close();
      });
    });
  });
});
