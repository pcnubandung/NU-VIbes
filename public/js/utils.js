// Utility functions for Koperasi NU Vibes

// Print/Cetak Struk
window.cetakStruk = async function(id, jenis) {
  const printWindow = window.open('', '_blank');
  
  try {
    const data = await API.get(`/api/simpanan/${jenis}`);
    const koperasi = await API.get('/api/koperasi-info');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const transaksi = data.find(t => t.id === id);
    
    if (!transaksi) {
      alert('Data tidak ditemukan');
      printWindow.close();
      return;
    }
    
    const jenisLabel = {
      'pokok': 'Simpanan Pokok',
      'wajib': 'Simpanan Wajib',
      'khusus': 'Simpanan Khusus',
      'sukarela': 'Simpanan Sukarela'
    };
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk ${jenisLabel[jenis]}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 20px auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 18px;
          }
          .header p {
            margin: 3px 0;
            font-size: 12px;
          }
          .content {
            margin: 15px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          .row.total {
            border-top: 2px dashed #333;
            padding-top: 10px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            border-top: 2px dashed #333;
            padding-top: 10px;
            margin-top: 15px;
            font-size: 12px;
          }
          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${koperasi.nama_koperasi || 'KOPERASI NU VIBES'}</h2>
          <p>${koperasi.alamat || 'Alamat Koperasi'}</p>
          <p>Telp: ${koperasi.nomor_telpon || '-'}</p>
        </div>
        
        <div class="content">
          <div class="row">
            <span>Jenis:</span>
            <span><strong>${jenisLabel[jenis]}</strong></span>
          </div>
          <div class="row">
            <span>No. Transaksi:</span>
            <span>${transaksi.id}</span>
          </div>
          <div class="row">
            <span>Tanggal:</span>
            <span>${formatDate(transaksi.tanggal_transaksi)}</span>
          </div>
          <div class="row">
            <span>No. Anggota:</span>
            <span>${transaksi.nomor_anggota}</span>
          </div>
          <div class="row">
            <span>Nama:</span>
            <span>${transaksi.nama_lengkap}</span>
          </div>
          <div class="row">
            <span>Metode:</span>
            <span>${transaksi.metode_pembayaran || '-'}</span>
          </div>
          
          <div class="row total">
            <span>JUMLAH:</span>
            <span>${formatCurrency(transaksi.jumlah)}</span>
          </div>
          
          ${transaksi.keterangan ? `
          <div class="row">
            <span>Keterangan:</span>
          </div>
          <div style="font-size: 12px; margin-top: 5px;">
            ${transaksi.keterangan}
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Kasir: ${user.nama_lengkap || user.username || 'Admin'}</p>
          <p>Terima Kasih</p>
          <p>${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal mencetak struk');
    printWindow.close();
  }
};

// Export to Excel
window.exportExcel = function() {
  alert('Fitur export Excel akan segera tersedia');
};

// Cetak Laporan PDF
window.cetakLaporan = async function() {
  const jenis = document.getElementById('jenisLaporan').value;
  const periode = document.getElementById('periodeLaporan').value;
  const tahun = document.getElementById('tahunLaporan').value;
  const bulan = document.getElementById('bulanLaporan').value;
  const tanggal = document.getElementById('tanggalLaporan').value;
  
  if (jenis === 'labarugi') {
    await cetakLaporanLabaRugi(periode, tahun, bulan, tanggal);
  } else if (jenis === 'neraca') {
    await cetakLaporanNeraca(periode, tahun, bulan, tanggal);
  } else if (jenis === 'aruskas') {
    await cetakLaporanArusKas(periode, tahun, bulan, tanggal);
  } else {
    alert('Silakan pilih jenis laporan terlebih dahulu');
  }
};

// Cetak Laporan Laba/Rugi
window.cetakLaporanLabaRugi = async function(periode, tahun, bulan, tanggal) {
  try {
    const info = await API.get('/api/koperasi-info');
    const penjualan = await API.get('/api/transaksi/penjualan');
    const pengeluaran = await API.get('/api/transaksi/pengeluaran');
    const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
    
    // Filter by periode
    let filteredPenjualan = penjualan;
    let filteredPengeluaran = pengeluaran;
    let filteredPendapatanLain = pendapatanLain;
    
    if (periode === 'harian' && tanggal) {
      filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi === tanggal);
      filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi === tanggal);
      filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi === tanggal);
    } else if (periode === 'bulanan' && bulan) {
      filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
    } else if (periode === 'tahunan') {
      filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
      filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
      filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
    }
    
    const totalPenjualan = filteredPenjualan.reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
    const totalHPP = filteredPenjualan.reduce((sum, item) => sum + parseFloat(item.hpp || 0), 0);
    const totalPendapatanLain = filteredPendapatanLain.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    
    // Filter pengeluaran: Exclude "Pembelian Barang" dan "Pembelian Aset & Inventaris"
    const pengeluaranOperasional = filteredPengeluaran.filter(p => 
      p.kategori !== 'Pembelian Barang' && 
      p.kategori !== 'Pembelian Aset & Inventaris' &&
      p.kategori !== 'Pembelian Aset'
    );
    const totalPengeluaran = pengeluaranOperasional.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    
    const totalPendapatan = totalPenjualan + totalPendapatanLain;
    const labaKotor = totalPendapatan - totalHPP;
    const labaRugi = labaKotor - totalPengeluaran;
    
    // Format periode untuk tampilan
    let periodeText = '';
    if (periode === 'harian' && tanggal) {
      const date = new Date(tanggal);
      const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      periodeText = `${date.getDate()} ${namaBulan[date.getMonth()]} ${date.getFullYear()}`;
    } else if (periode === 'bulanan' && bulan) {
      const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      periodeText = `${namaBulan[parseInt(bulan) - 1]} ${tahun}`;
    } else if (periode === 'tahunan') {
      periodeText = `Tahun ${tahun}`;
    } else {
      periodeText = `Semua Periode`;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Laba/Rugi - ${info.nama_koperasi || 'Koperasi'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h2 { margin: 5px 0; }
          .header p { margin: 3px 0; font-size: 14px; }
          .periode { text-align: center; margin-bottom: 20px; font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2E7D32; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .section-header { background-color: #e8f5e9 !important; font-weight: bold; }
          .section-hpp { background-color: #ffebee !important; font-weight: bold; }
          .section-total { background-color: #e3f2fd !important; font-weight: bold; }
          .section-laba { background-color: #fff3e0 !important; font-weight: bold; }
          .section-result { background-color: #e8f5e9 !important; font-weight: bold; font-size: 14px; }
          .section-rugi { background-color: #ffebee !important; font-weight: bold; font-size: 14px; }
          .indent { padding-left: 30px !important; }
          .text-right { text-align: right; }
          .text-red { color: #d32f2f; }
          .text-green { color: #2e7d32; }
          .footer { margin-top: 30px; font-size: 12px; text-align: right; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${info.nama_koperasi || 'Koperasi'}</h2>
          <p>${info.alamat || ''}</p>
          <p>Telp: ${info.nomor_telpon || '-'} | Email: ${info.email || '-'}</p>
          <h3 style="margin-top: 15px;">LAPORAN LABA/RUGI</h3>
        </div>
        
        <div class="periode">
          <strong>Periode: ${periodeText}</strong>
        </div>
        
        <table>
          <tbody>
            <tr class="section-header">
              <td><strong>PENDAPATAN</strong></td>
              <td></td>
            </tr>
            <tr>
              <td class="indent">Penjualan</td>
              <td class="text-right">${formatCurrency(totalPenjualan)}</td>
            </tr>
            <tr>
              <td class="indent">Pendapatan Lain</td>
              <td class="text-right">${formatCurrency(totalPendapatanLain)}</td>
            </tr>
            <tr class="section-total">
              <td><strong>Total Pendapatan</strong></td>
              <td class="text-right"><strong>${formatCurrency(totalPendapatan)}</strong></td>
            </tr>
            <tr class="section-hpp">
              <td><strong>HARGA POKOK PENJUALAN (HPP)</strong></td>
              <td></td>
            </tr>
            <tr>
              <td class="indent">HPP</td>
              <td class="text-right text-red">(${formatCurrency(totalHPP)})</td>
            </tr>
            <tr class="section-laba">
              <td><strong>LABA KOTOR</strong></td>
              <td class="text-right"><strong>${formatCurrency(labaKotor)}</strong></td>
            </tr>
            <tr class="section-hpp">
              <td><strong>PENGELUARAN</strong></td>
              <td></td>
            </tr>
            <tr>
              <td class="indent">Biaya Operasional</td>
              <td class="text-right text-red">(${formatCurrency(totalPengeluaran)})</td>
            </tr>
            <tr class="${labaRugi >= 0 ? 'section-result' : 'section-rugi'}">
              <td><strong>${labaRugi >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}</strong></td>
              <td class="text-right ${labaRugi >= 0 ? 'text-green' : 'text-red'}"><strong>${formatCurrency(Math.abs(labaRugi))}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2E7D32; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Cetak Dokumen
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Tutup
          </button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// Format number to Indonesian format
function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone number (Indonesian format)
function validatePhone(phone) {
  const re = /^(\+62|62|0)[0-9]{9,12}$/;
  return re.test(phone.replace(/\s/g, ''));
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Confirm dialog
function confirmDialog(message) {
  return confirm(message);
}

// Loading overlay
function showLoading() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  overlay.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
      <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
      <div>Memproses...</div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.remove();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);


// Export Anggota to Excel
window.exportAnggota = async function() {
  try {
    const anggota = await API.get('/api/anggota');
    
    // Create CSV content
    let csv = 'No,Nomor Anggota,Nama Lengkap,NIK,Tempat Lahir,Tanggal Lahir,Jenis Kelamin,Alamat,Nomor Telepon,Email,Pekerjaan,Tanggal Bergabung,Status\n';
    
    anggota.forEach((item, index) => {
      csv += `${index + 1},"${item.nomor_anggota}","${item.nama_lengkap}","${item.nik || ''}","${item.tempat_lahir || ''}","${item.tanggal_lahir || ''}","${item.jenis_kelamin || ''}","${item.alamat || ''}","${item.nomor_telpon || ''}","${item.email || ''}","${item.pekerjaan || ''}","${item.tanggal_bergabung || ''}","${item.status}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data-anggota-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Data anggota berhasil diexport', 'success');
  } catch (error) {
    alert('Gagal export data: ' + error.message);
  }
};

// Import Anggota from Excel
window.importAnggota = function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Import Data Anggota</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <div style="padding: 20px;">
        <div class="highlight">
          <strong>Format File Excel/CSV:</strong><br>
          Kolom: Nomor Anggota, Nama Lengkap, NIK, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Alamat, Nomor Telepon, Email, Pekerjaan, Tanggal Bergabung
        </div>
        
        <div class="form-group" style="margin-top: 20px;">
          <label>Pilih File Excel/CSV</label>
          <input type="file" id="importFile" accept=".csv,.xlsx,.xls">
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" onclick="prosesImportAnggota()">
            <i data-feather="upload"></i> Import
          </button>
          <button class="btn btn-success" onclick="downloadTemplateAnggota()">
            <i data-feather="download"></i> Download Template
          </button>
          <button class="btn btn-danger" onclick="this.closest('.modal').remove()">
            <i data-feather="x"></i> Batal
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  feather.replace();
};

window.downloadTemplateAnggota = function() {
  // Create CSV with BOM for Excel compatibility
  const BOM = '\uFEFF';
  
  // Header
  const headers = [
    'Nomor Anggota',
    'Nama Lengkap',
    'NIK',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Jenis Kelamin',
    'Alamat',
    'Nomor Telepon',
    'Email',
    'Pekerjaan',
    'Tanggal Bergabung',
    'Username',
    'Password'
  ];
  
  // Example data (3 rows)
  const examples = [
    [
      'NUV2025001',
      'Ahmad Fauzi',
      '3201012345678901',
      'Jakarta',
      '1990-01-15',
      'Laki-laki',
      'Jl. Merdeka No. 123, Jakarta',
      '081234567890',
      'ahmad.fauzi@email.com',
      'Wiraswasta',
      '2025-01-01',
      'ahmad.fauzi',
      'password123'
    ],
    [
      'NUV2025002',
      'Siti Nurhaliza',
      '3201012345678902',
      'Bandung',
      '1992-05-20',
      'Perempuan',
      'Jl. Sudirman No. 456, Bandung',
      '081234567891',
      'siti.nurhaliza@email.com',
      'Pegawai Swasta',
      '2025-01-01',
      'siti.nurhaliza',
      'password123'
    ],
    [
      'NUV2025003',
      'Budi Santoso',
      '3201012345678903',
      'Surabaya',
      '1988-12-10',
      'Laki-laki',
      'Jl. Pahlawan No. 789, Surabaya',
      '081234567892',
      'budi.santoso@email.com',
      'Guru',
      '2025-01-01',
      'budi.santoso',
      'password123'
    ]
  ];
  
  // Build CSV content
  let csv = BOM + headers.join(',') + '\n';
  
  // Add example rows
  examples.forEach(row => {
    csv += row.map(cell => {
      // Escape cells that contain comma, quote, or newline
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return '"' + cell.replace(/"/g, '""') + '"';
      }
      return cell;
    }).join(',') + '\n';
  });
  
  // Add instruction comment
  csv += '\n';
  csv += '# INSTRUKSI:\n';
  csv += '# 1. Hapus baris contoh di atas (baris 2-4)\n';
  csv += '# 2. Isi data anggota mulai dari baris 2\n';
  csv += '# 3. Format Tanggal: YYYY-MM-DD (contoh: 2025-01-15)\n';
  csv += '# 4. Jenis Kelamin: Laki-laki atau Perempuan\n';
  csv += '# 5. Username dan Password opsional (bisa dikosongkan)\n';
  csv += '# 6. Simpan file dan upload untuk import\n';
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template-import-anggota-' + new Date().toISOString().split('T')[0] + '.csv';
  link.click();
  
  alert('Template berhasil didownload!\n\nFile: template-import-anggota.csv\n\nBuka dengan Excel, isi data anggota, lalu upload kembali.');
};

window.prosesImportAnggota = function() {
  const fileInput = document.getElementById('importFile');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Pilih file terlebih dahulu');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const text = e.target.result;
      const lines = text.split('\n');
      let successCount = 0;
      let errorCount = 0;
      
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',').map(col => col.replace(/"/g, '').trim());
        
        if (cols.length >= 2) {
          // Skip comment lines
          if (cols[0].startsWith('#')) continue;
          
          const data = {
            nomor_anggota: cols[0],
            nama_lengkap: cols[1],
            nik: cols[2] || '',
            tempat_lahir: cols[3] || '',
            tanggal_lahir: cols[4] || '',
            jenis_kelamin: cols[5] || '',
            alamat: cols[6] || '',
            nomor_telpon: cols[7] || '',
            email: cols[8] || '',
            pekerjaan: cols[9] || '',
            tanggal_bergabung: cols[10] || new Date().toISOString().split('T')[0],
            username: cols[11] || '',
            password: cols[12] || ''
          };
          
          try {
            await API.post('/api/anggota', data);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
      }
      
      alert(`Import selesai!\nBerhasil: ${successCount}\nGagal: ${errorCount}`);
      document.querySelector('.modal').remove();
      renderDataAnggota();
    } catch (error) {
      alert('Gagal memproses file: ' + error.message);
    }
  };
  
  reader.readAsText(file);
};

// Cetak Data Anggota
window.cetakAnggota = async function() {
  const anggota = await API.get('/api/anggota');
  const koperasi = await API.get('/api/koperasi-info');
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Data Anggota - ${koperasi.nama_koperasi || 'Koperasi NU Vibes'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2E7D32;
          padding-bottom: 15px;
        }
        .header h2 {
          margin: 5px 0;
          color: #2E7D32;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        th {
          background: #2E7D32;
          color: white;
        }
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .signature {
          text-align: center;
          margin-top: 60px;
        }
        @media print {
          body { padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>${koperasi.nama_koperasi || 'KOPERASI NU VIBES'}</h2>
        <p>${koperasi.alamat || ''}</p>
        <p>Telp: ${koperasi.nomor_telpon || ''} | Email: ${koperasi.email || ''}</p>
        <h3 style="margin-top: 20px;">DAFTAR ANGGOTA KOPERASI</h3>
        <p>Per Tanggal: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>No. Anggota</th>
            <th>Nama Lengkap</th>
            <th>NIK</th>
            <th>Tempat, Tgl Lahir</th>
            <th>Alamat</th>
            <th>Telepon</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${anggota.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.nomor_anggota}</td>
              <td>${item.nama_lengkap}</td>
              <td>${item.nik || '-'}</td>
              <td>${item.tempat_lahir || '-'}, ${item.tanggal_lahir ? formatDate(item.tanggal_lahir) : '-'}</td>
              <td>${item.alamat || '-'}</td>
              <td>${item.nomor_telpon || '-'}</td>
              <td>${item.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <div>
          <p><strong>Total Anggota: ${anggota.length} orang</strong></p>
          <p>Anggota Aktif: ${anggota.filter(a => a.status === 'aktif').length} orang</p>
        </div>
      </div>
      
      <div style="margin-top: 60px; display: flex; justify-content: space-between;">
        <div class="signature">
          <p>Ketua</p>
          <br><br><br>
          <p>(_________________)</p>
        </div>
        <div class="signature">
          <p>Sekretaris</p>
          <br><br><br>
          <p>(_________________)</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};


// Cetak Struk Pengeluaran
window.cetakStrukPengeluaran = async function(id) {
  const printWindow = window.open('', '_blank');
  
  try {
    const pengeluaran = await API.get('/api/transaksi/pengeluaran');
    const koperasi = await API.get('/api/koperasi-info');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const transaksi = pengeluaran.find(p => p.id === id);
    
    if (!transaksi) {
      alert('Data tidak ditemukan');
      printWindow.close();
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk Pengeluaran</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 20px auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 18px;
          }
          .header p {
            margin: 3px 0;
            font-size: 12px;
          }
          .content {
            margin: 15px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          .row.total {
            border-top: 2px dashed #333;
            padding-top: 10px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            border-top: 2px dashed #333;
            padding-top: 10px;
            margin-top: 15px;
            font-size: 12px;
          }
          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${koperasi.nama_koperasi || 'KOPERASI NU VIBES'}</h2>
          <p>${koperasi.alamat || 'Alamat Koperasi'}</p>
          <p>Telp: ${koperasi.nomor_telpon || '-'}</p>
        </div>
        
        <div class="content">
          <div class="row">
            <span>Jenis:</span>
            <span><strong>PENGELUARAN</strong></span>
          </div>
          <div class="row">
            <span>No. Transaksi:</span>
            <span>${transaksi.id}</span>
          </div>
          <div class="row">
            <span>Tanggal:</span>
            <span>${formatDate(transaksi.tanggal_transaksi)}</span>
          </div>
          <div class="row">
            <span>Unit Usaha:</span>
            <span>${transaksi.nama_usaha || 'Umum'}</span>
          </div>
          <div class="row">
            <span>Kategori:</span>
            <span>${transaksi.kategori}</span>
          </div>
          
          <div class="row total">
            <span>JUMLAH:</span>
            <span>${formatCurrency(transaksi.jumlah)}</span>
          </div>
          
          ${transaksi.keterangan ? `
          <div class="row">
            <span>Keterangan:</span>
          </div>
          <div style="font-size: 12px; margin-top: 5px;">
            ${transaksi.keterangan}
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Kasir: ${user.nama_lengkap || user.username || 'Admin'}</p>
          <p>Terima Kasih</p>
          <p>${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal mencetak struk');
    printWindow.close();
  }
};

// Cetak Struk Pendapatan Lain
window.cetakStrukPendapatanLain = async function(id) {
  const printWindow = window.open('', '_blank');
  
  try {
    const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
    const koperasi = await API.get('/api/koperasi-info');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const transaksi = pendapatanLain.find(p => p.id === id);
    
    if (!transaksi) {
      alert('Data tidak ditemukan');
      printWindow.close();
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk Pendapatan Lain</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 20px auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 18px;
          }
          .header p {
            margin: 3px 0;
            font-size: 12px;
          }
          .content {
            margin: 15px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          .row.total {
            border-top: 2px dashed #333;
            padding-top: 10px;
            margin-top: 15px;
            font-weight: bold;
            font-size: 16px;
            color: #28a745;
          }
          .footer {
            text-align: center;
            border-top: 2px dashed #333;
            padding-top: 10px;
            margin-top: 15px;
            font-size: 12px;
          }
          @media print {
            body {
              margin: 0;
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${koperasi.nama_koperasi || 'KOPERASI NU VIBES'}</h2>
          <p>${koperasi.alamat || 'Alamat Koperasi'}</p>
          <p>Telp: ${koperasi.nomor_telpon || '-'}</p>
        </div>
        
        <div class="content">
          <div class="row">
            <span>Jenis:</span>
            <span><strong>PENDAPATAN LAIN</strong></span>
          </div>
          <div class="row">
            <span>No. Transaksi:</span>
            <span>${transaksi.id}</span>
          </div>
          <div class="row">
            <span>Tanggal:</span>
            <span>${formatDate(transaksi.tanggal_transaksi)}</span>
          </div>
          <div class="row">
            <span>Unit Usaha:</span>
            <span>${transaksi.nama_usaha || 'Umum'}</span>
          </div>
          <div class="row">
            <span>Kategori:</span>
            <span>${transaksi.kategori}</span>
          </div>
          
          <div class="row total">
            <span>JUMLAH:</span>
            <span>${formatCurrency(transaksi.jumlah)}</span>
          </div>
          
          ${transaksi.keterangan ? `
          <div class="row">
            <span>Keterangan:</span>
          </div>
          <div style="margin: 5px 0; font-size: 12px;">
            ${transaksi.keterangan}
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Petugas: ${user.nama_lengkap || user.username || 'Admin'}</p>
          <p>Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</p>
          <p style="margin-top: 15px;">Terima Kasih</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal mencetak struk: ' + error.message);
    printWindow.close();
  }
};


// Helper API untuk FormData
API.postFormData = async function(url, formData) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: formData
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

API.putFormData = async function(url, formData) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: formData
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};


// Cetak SHU Per Anggota
window.cetakSHUPerAnggota = async function(tahun) {
  try {
    const info = await API.get('/api/koperasi-info');
    const anggotaSHU = await API.get(`/api/shu/anggota/${tahun}`);
    
    if (!anggotaSHU || anggotaSHU.length === 0) {
      alert('Tidak ada data SHU untuk dicetak');
      return;
    }
    
    // Hitung total
    const totalSimpanan = anggotaSHU.reduce((sum, item) => sum + (parseFloat(item.total_simpanan) || 0), 0);
    const totalTransaksi = anggotaSHU.reduce((sum, item) => sum + (parseFloat(item.total_transaksi) || 0), 0);
    const totalSHUSimpanan = anggotaSHU.reduce((sum, item) => sum + (parseFloat(item.shu_simpanan) || 0), 0);
    const totalSHUTransaksi = anggotaSHU.reduce((sum, item) => sum + (parseFloat(item.shu_transaksi) || 0), 0);
    const totalSHUDibagikan = anggotaSHU.reduce((sum, item) => sum + (parseFloat(item.total_shu) || 0), 0);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SHU Per Anggota Tahun ${tahun} - ${info.nama_koperasi || 'Koperasi'}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h2 { margin: 5px 0; }
          .header p { margin: 3px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #667eea; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-row { background-color: #f8f9fa !important; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 12px; text-align: right; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${info.nama_koperasi || 'Koperasi'}</h2>
          <p>${info.alamat || ''}</p>
          <p>Telp: ${info.nomor_telpon || '-'} | Email: ${info.email || '-'}</p>
          <h3 style="margin-top: 15px;">SISA HASIL USAHA (SHU) PER ANGGOTA</h3>
          <p style="font-size: 16px; font-weight: bold;">Tahun ${tahun}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th class="text-center">No</th>
              <th>No. Anggota</th>
              <th>Nama Anggota</th>
              <th class="text-right">Total Simpanan</th>
              <th class="text-right">Total Transaksi</th>
              <th class="text-right">SHU Simpanan</th>
              <th class="text-right">SHU Transaksi</th>
              <th class="text-right">Total SHU</th>
            </tr>
          </thead>
          <tbody>
            ${anggotaSHU.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.nomor_anggota || '-'}</td>
                <td>${item.nama_lengkap || '-'}</td>
                <td class="text-right">${formatCurrency(item.total_simpanan || 0)}</td>
                <td class="text-right">${formatCurrency(item.total_transaksi || 0)}</td>
                <td class="text-right">${formatCurrency(item.shu_simpanan || 0)}</td>
                <td class="text-right">${formatCurrency(item.shu_transaksi || 0)}</td>
                <td class="text-right"><strong>${formatCurrency(item.total_shu || 0)}</strong></td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3" class="text-right"><strong>TOTAL</strong></td>
              <td class="text-right"><strong>${formatCurrency(totalSimpanan)}</strong></td>
              <td class="text-right"><strong>${formatCurrency(totalTransaksi)}</strong></td>
              <td class="text-right"><strong>${formatCurrency(totalSHUSimpanan)}</strong></td>
              <td class="text-right"><strong>${formatCurrency(totalSHUTransaksi)}</strong></td>
              <td class="text-right"><strong>${formatCurrency(totalSHUDibagikan)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Cetak Dokumen
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Tutup
          </button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};
