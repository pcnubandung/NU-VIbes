// Enhanced Transaksi Pages with Export/Import/Edit/Delete

// Simpanan dengan Tile Rekap dan Fitur Lengkap
window.renderSimpanan = async function(jenis) {
  const simpanan = await API.get(`/api/simpanan/${jenis}`);
  const anggota = await API.get('/api/anggota');
  
  const jenisLabel = {
    'pokok': 'Simpanan Pokok',
    'wajib': 'Simpanan Wajib',
    'khusus': 'Simpanan Khusus',
    'sukarela': 'Simpanan Sukarela'
  };
  
  // Hitung total
  const totalSimpanan = simpanan.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
  const totalTransaksi = simpanan.length;
  const totalAnggota = new Set(simpanan.map(item => item.anggota_id)).size;
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${jenisLabel[jenis]}</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportSimpanan('${jenis}')">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakSimpanan('${jenis}')">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-info" onclick="importSimpanan('${jenis}')">
            <i data-feather="upload"></i> Import
          </button>
          <button class="btn btn-primary" onclick="tambahSimpanan('${jenis}')">
            <i data-feather="plus"></i> Tambah Transaksi
          </button>
        </div>
      </div>
      
      <!-- Tile Rekap -->
      <div class="stats-grid" style="margin: 20px 0;">
        <div class="stat-card" style="border-left: 4px solid #2E7D32;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total ${jenisLabel[jenis]}</div>
              <div class="stat-value">${formatCurrency(totalSimpanan)}</div>
              <div class="stat-label">Akumulasi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #2E7D32, #4CAF50);">
              <i data-feather="dollar-sign" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #FFD700;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Transaksi</div>
              <div class="stat-value">${totalTransaksi}</div>
              <div class="stat-label">Jumlah Transaksi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="file-text" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Anggota</div>
              <div class="stat-value">${totalAnggota}</div>
              <div class="stat-label">Anggota Aktif</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="users" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>No. Anggota</th>
              <th>Nama Anggota</th>
              <th>Jumlah</th>
              <th>Metode</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${simpanan.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td>${item.nomor_anggota}</td>
                <td>${item.nama_lengkap}</td>
                <td><strong>${formatCurrency(item.jumlah)}</strong></td>
                <td>${item.metode_pembayaran || '-'}</td>
                <td>${item.keterangan || '-'}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="cetakStruk(${item.id}, '${jenis}')">
                      <i data-feather="printer"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editSimpanan(${item.id}, '${jenis}')">
                      <i data-feather="edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusSimpanan(${item.id}, '${jenis}')">
                      <i data-feather="trash-2"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  feather.replace();
}

// Export Simpanan
window.exportSimpanan = async function(jenis) {
  const simpanan = await API.get(`/api/simpanan/${jenis}`);
  const jenisLabel = {
    'pokok': 'Simpanan Pokok',
    'wajib': 'Simpanan Wajib',
    'khusus': 'Simpanan Khusus',
    'sukarela': 'Simpanan Sukarela'
  };
  
  let csv = 'No,Tanggal,No. Anggota,Nama Anggota,Jumlah,Metode Pembayaran,Keterangan\n';
  
  simpanan.forEach((item, index) => {
    csv += `${index + 1},"${formatDate(item.tanggal_transaksi)}","${item.nomor_anggota}","${item.nama_lengkap}","${item.jumlah}","${item.metode_pembayaran || ''}","${item.keterangan || ''}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${jenis}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification(`Data ${jenisLabel[jenis]} berhasil diexport`, 'success');
};

// Import Simpanan
window.importSimpanan = function(jenis) {
  const jenisLabel = {
    'pokok': 'Simpanan Pokok',
    'wajib': 'Simpanan Wajib',
    'khusus': 'Simpanan Khusus',
    'sukarela': 'Simpanan Sukarela'
  };
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Import ${jenisLabel[jenis]}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <div style="padding: 20px;">
        <div class="highlight">
          <strong>Format File CSV:</strong><br>
          Kolom: No. Anggota, Jumlah, Tanggal Transaksi, Metode Pembayaran, Keterangan
        </div>
        
        <div class="form-group" style="margin-top: 20px;">
          <label>Pilih File CSV</label>
          <input type="file" id="importFileSimpanan" accept=".csv">
        </div>
        
        <div class="btn-group">
          <button class="btn btn-primary" onclick="prosesImportSimpanan('${jenis}')">
            <i data-feather="upload"></i> Import
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

window.prosesImportSimpanan = async function(jenis) {
  const fileInput = document.getElementById('importFileSimpanan');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Pilih file terlebih dahulu');
    return;
  }
  
  const anggota = await API.get('/api/anggota');
  const reader = new FileReader();
  
  reader.onload = async function(e) {
    try {
      const text = e.target.result;
      const lines = text.split('\n');
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',').map(col => col.replace(/"/g, '').trim());
        
        if (cols.length >= 2) {
          // Cari anggota berdasarkan nomor anggota
          const anggotaItem = anggota.find(a => a.nomor_anggota === cols[0]);
          
          if (anggotaItem) {
            const data = {
              anggota_id: anggotaItem.id,
              jumlah: parseFloat(cols[1]) || 0,
              tanggal_transaksi: cols[2] || new Date().toISOString().split('T')[0],
              metode_pembayaran: cols[3] || 'Tunai',
              keterangan: cols[4] || ''
            };
            
            if (jenis === 'sukarela') {
              data.jenis = 'Setoran';
            }
            
            try {
              await API.post(`/api/simpanan/${jenis}`, data);
              successCount++;
            } catch (error) {
              errorCount++;
            }
          } else {
            errorCount++;
          }
        }
      }
      
      alert(`Import selesai!\nBerhasil: ${successCount}\nGagal: ${errorCount}`);
      document.querySelector('.modal').remove();
      renderSimpanan(jenis);
    } catch (error) {
      alert('Gagal memproses file: ' + error.message);
    }
  };
  
  reader.readAsText(file);
};

// Edit Simpanan
window.editSimpanan = async function(id, jenis) {
  const simpanan = await API.get(`/api/simpanan/${jenis}`);
  const anggota = await API.get('/api/anggota');
  const item = simpanan.find(s => s.id === id);
  
  if (!item) {
    alert('Data tidak ditemukan');
    return;
  }
  
  const jenisLabel = {
    'pokok': 'Simpanan Pokok',
    'wajib': 'Simpanan Wajib',
    'khusus': 'Simpanan Khusus',
    'sukarela': 'Simpanan Sukarela'
  };
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit ${jenisLabel[jenis]}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editSimpananForm">
        <div class="form-group">
          <label>Anggota *</label>
          <select name="anggota_id" required>
            ${anggota.filter(a => a.status === 'aktif').map(a => `
              <option value="${a.id}" ${a.id === item.anggota_id ? 'selected' : ''}>${a.nomor_anggota} - ${a.nama_lengkap}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah *</label>
            <input type="number" name="jumlah" value="${item.jumlah}" required min="0" step="1000">
          </div>
          <div class="form-group">
            <label>Tanggal Transaksi *</label>
            <input type="date" name="tanggal_transaksi" value="${item.tanggal_transaksi}" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Metode Pembayaran</label>
          <select name="metode_pembayaran">
            <option value="Tunai" ${item.metode_pembayaran === 'Tunai' ? 'selected' : ''}>Tunai</option>
            <option value="Transfer" ${item.metode_pembayaran === 'Transfer' ? 'selected' : ''}>Transfer</option>
            <option value="E-Wallet" ${item.metode_pembayaran === 'E-Wallet' ? 'selected' : ''}>E-Wallet</option>
          </select>
        </div>
        
        ${jenis === 'sukarela' ? `
        <div class="form-group">
          <label>Jenis</label>
          <select name="jenis">
            <option value="Setoran" ${item.jenis === 'Setoran' ? 'selected' : ''}>Setoran</option>
            <option value="Penarikan" ${item.jenis === 'Penarikan' ? 'selected' : ''}>Penarikan</option>
          </select>
        </div>
        ` : ''}
        
        <div class="form-group">
          <label>Keterangan</label>
          <textarea name="keterangan">${item.keterangan || ''}</textarea>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">
            <i data-feather="save"></i> Simpan
          </button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">
            <i data-feather="x"></i> Batal
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  feather.replace();
  
  document.getElementById('editSimpananForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const response = await fetch(`/api/simpanan/${jenis}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      alert(result.message);
      modal.remove();
      renderSimpanan(jenis);
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

// Hapus Simpanan
window.hapusSimpanan = async function(id, jenis) {
  if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    try {
      const response = await fetch(`/api/simpanan/${jenis}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      alert(result.message);
      renderSimpanan(jenis);
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  }
};


// Partisipasi Anggota dengan Tile Rekap
window.renderPartisipasiAnggota = async function() {
  const partisipasi = await API.get('/api/partisipasi');
  
  const totalPartisipasi = partisipasi.reduce((sum, item) => sum + parseFloat(item.jumlah_transaksi || 0), 0);
  const totalTransaksi = partisipasi.length;
  const totalAnggota = new Set(partisipasi.map(item => item.anggota_id)).size;
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Partisipasi Anggota</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportPartisipasi()">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakPartisipasi()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahPartisipasi()">
            <i data-feather="plus"></i> Tambah Partisipasi
          </button>
        </div>
      </div>
      
      <!-- Tile Rekap -->
      <div class="stats-grid" style="margin: 20px 0;">
        <div class="stat-card" style="border-left: 4px solid #2E7D32;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Partisipasi</div>
              <div class="stat-value">${formatCurrency(totalPartisipasi)}</div>
              <div class="stat-label">Akumulasi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #2E7D32, #4CAF50);">
              <i data-feather="activity" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #FFD700;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Transaksi</div>
              <div class="stat-value">${totalTransaksi}</div>
              <div class="stat-label">Jumlah Transaksi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="file-text" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Anggota</div>
              <div class="stat-value">${totalAnggota}</div>
              <div class="stat-label">Anggota Berpartisipasi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="users" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>No. Anggota</th>
              <th>Nama Anggota</th>
              <th>Unit Usaha</th>
              <th>Jumlah Transaksi</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${partisipasi.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td>${item.nomor_anggota}</td>
                <td>${item.nama_lengkap}</td>
                <td>${item.nama_usaha || '-'}</td>
                <td><strong>${formatCurrency(item.jumlah_transaksi)}</strong></td>
                <td>${item.keterangan || '-'}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-warning" onclick="editPartisipasi(${item.id})">
                      <i data-feather="edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusPartisipasi(${item.id})">
                      <i data-feather="trash-2"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  feather.replace();
}

window.exportPartisipasi = async function() {
  const partisipasi = await API.get('/api/partisipasi');
  
  let csv = 'No,Tanggal,No. Anggota,Nama Anggota,Unit Usaha,Jumlah Transaksi,Keterangan\n';
  
  partisipasi.forEach((item, index) => {
    csv += `${index + 1},"${formatDate(item.tanggal_transaksi)}","${item.nomor_anggota}","${item.nama_lengkap}","${item.nama_usaha || ''}","${item.jumlah_transaksi}","${item.keterangan || ''}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `partisipasi-anggota-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Data partisipasi berhasil diexport', 'success');
};

window.editPartisipasi = async function(id) {
  const partisipasi = await API.get('/api/partisipasi');
  const anggota = await API.get('/api/anggota');
  const unitUsaha = await API.get('/api/unit-usaha');
  const item = partisipasi.find(p => p.id === id);
  
  if (!item) {
    alert('Data tidak ditemukan');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Partisipasi Anggota</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editPartisipasiForm">
        <div class="form-group">
          <label>Anggota *</label>
          <select name="anggota_id" required>
            ${anggota.filter(a => a.status === 'aktif').map(a => `
              <option value="${a.id}" ${a.id === item.anggota_id ? 'selected' : ''}>${a.nomor_anggota} - ${a.nama_lengkap}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Unit Usaha</label>
          <select name="unit_usaha_id">
            <option value="">Pilih Unit Usaha</option>
            ${unitUsaha.filter(u => u.status === 'Aktif').map(u => `
              <option value="${u.id}" ${u.id === item.unit_usaha_id ? 'selected' : ''}>${u.nama_usaha}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah Transaksi *</label>
            <input type="number" name="jumlah_transaksi" value="${item.jumlah_transaksi}" required min="0" step="1000">
          </div>
          <div class="form-group">
            <label>Tanggal Transaksi *</label>
            <input type="date" name="tanggal_transaksi" value="${item.tanggal_transaksi}" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Keterangan</label>
          <textarea name="keterangan">${item.keterangan || ''}</textarea>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">
            <i data-feather="save"></i> Simpan
          </button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">
            <i data-feather="x"></i> Batal
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  feather.replace();
  
  document.getElementById('editPartisipasiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const response = await fetch(`/api/partisipasi/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      alert(result.message);
      modal.remove();
      renderPartisipasiAnggota();
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

window.hapusPartisipasi = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus partisipasi ini?')) {
    try {
      const response = await fetch(`/api/partisipasi/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      alert(result.message);
      renderPartisipasiAnggota();
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  }
};

// Penjualan dengan Tile Rekap
window.renderPenjualan = async function() {
  const [penjualan, unitUsaha] = await Promise.all([
    API.get('/api/transaksi/penjualan'),
    API.get('/api/unit-usaha')
  ]);
  
  const totalPenjualan = penjualan.reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
  const totalKeuntungan = penjualan.reduce((sum, item) => sum + parseFloat(item.keuntungan || 0), 0);
  const totalTransaksi = penjualan.length;
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Hasil Penjualan</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportPenjualan()">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakPenjualan()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahPenjualan()">
            <i data-feather="plus"></i> Tambah Penjualan
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="filter-section">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
            <label style="font-weight: 600; margin: 0;">Filter:</label>
          </div>
          
          <select id="filterUnitUsahaPenjualan" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 200px;">
            <option value="">Semua Unit Usaha</option>
            ${unitUsaha.map(u => `<option value="${u.id}">${u.nama_usaha}</option>`).join('')}
          </select>
          
          <input type="date" id="filterTanggalDariPenjualan" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <input type="date" id="filterTanggalSampaiPenjualan" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <button onclick="applyPenjualanFilter()" class="btn btn-primary">
            <i data-feather="search"></i> Filter
          </button>
          
          <button onclick="resetPenjualanFilter()" class="btn btn-warning">
            <i data-feather="refresh-cw"></i> Reset
          </button>
          
          <div style="margin-left: auto; color: #666;">
            <strong>${totalTransaksi}</strong> transaksi | 
            <strong>${formatCurrency(totalKeuntungan)}</strong>
          </div>
        </div>
      </div>
      
      <!-- Tile Rekap -->
      <div class="stats-grid" style="margin: 20px 0;">
        <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Penjualan</div>
              <div class="stat-value">${formatCurrency(totalPenjualan)}</div>
              <div class="stat-label">Akumulasi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="shopping-cart" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #00C9A7;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Keuntungan</div>
              <div class="stat-value">${formatCurrency(totalKeuntungan)}</div>
              <div class="stat-label">Laba Kotor</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #00C9A7, #00B894);">
              <i data-feather="trending-up" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #FFD700;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Transaksi</div>
              <div class="stat-value">${totalTransaksi}</div>
              <div class="stat-label">Jumlah Transaksi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="file-text" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Unit Usaha</th>
              <th>Penjualan</th>
              <th>HPP</th>
              <th>Keuntungan</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${penjualan.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td>${item.nama_usaha || '-'}</td>
                <td><strong>${formatCurrency(item.jumlah_penjualan)}</strong></td>
                <td>${formatCurrency(item.hpp)}</td>
                <td style="color: #00C9A7;"><strong>${formatCurrency(item.keuntungan)}</strong></td>
                <td>${item.keterangan || '-'}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editPenjualan(${item.id})" title="Edit">
                      <i data-feather="edit"></i>
                      <span class="btn-text">Edit</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusPenjualan(${item.id})" title="Hapus">
                      <i data-feather="trash-2"></i>
                      <span class="btn-text">Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  feather.replace();
}

window.exportPenjualan = async function() {
  const penjualan = await API.get('/api/transaksi/penjualan');
  
  let csv = 'No,Tanggal,Unit Usaha,Penjualan,HPP,Keuntungan,Keterangan\n';
  
  penjualan.forEach((item, index) => {
    csv += `${index + 1},"${formatDate(item.tanggal_transaksi)}","${item.nama_usaha || ''}","${item.jumlah_penjualan}","${item.hpp}","${item.keuntungan}","${item.keterangan || ''}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `penjualan-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Data penjualan berhasil diexport', 'success');
};

// Pengeluaran dengan Tile Rekap dan Filter
window.renderPengeluaran = async function() {
  const [pengeluaran, unitUsaha] = await Promise.all([
    API.get('/api/transaksi/pengeluaran'),
    API.get('/api/unit-usaha')
  ]);
  
  const totalPengeluaran = pengeluaran.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
  const totalTransaksi = pengeluaran.length;
  
  // Group by kategori
  const byKategori = {};
  pengeluaran.forEach(item => {
    if (!byKategori[item.kategori]) {
      byKategori[item.kategori] = 0;
    }
    byKategori[item.kategori] += parseFloat(item.jumlah || 0);
  });
  
  // Get unique categories
  const categories = [...new Set(pengeluaran.map(item => item.kategori))];
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Pengeluaran</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportPengeluaran()">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakPengeluaran()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahPengeluaran()">
            <i data-feather="plus"></i> Tambah Pengeluaran
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="filter-section">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
            <label style="font-weight: 600; margin: 0;">Filter:</label>
          </div>
          
          <select id="filterKategoriPengeluaran" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 200px;">
            <option value="">Semua Kategori</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
          
          <select id="filterUnitUsahaPengeluaran" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 200px;">
            <option value="">Semua Unit Usaha</option>
            ${unitUsaha.map(u => `<option value="${u.id}">${u.nama_usaha}</option>`).join('')}
          </select>
          
          <input type="date" id="filterTanggalDariPengeluaran" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <input type="date" id="filterTanggalSampaiPengeluaran" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <button onclick="applyPengeluaranFilter()" class="btn btn-primary">
            <i data-feather="search"></i> Filter
          </button>
          
          <button onclick="resetPengeluaranFilter()" class="btn btn-warning">
            <i data-feather="refresh-cw"></i> Reset
          </button>
          
          <div style="margin-left: auto; color: #666;">
            <strong>${totalTransaksi}</strong> transaksi | 
            <strong>${formatCurrency(totalPengeluaran)}</strong>
          </div>
        </div>
      </div>
      
      <!-- Tile Rekap -->
      <div class="stats-grid" style="margin: 20px 0;">
        <div class="stat-card" style="border-left: 4px solid #FF6B6B;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Pengeluaran</div>
              <div class="stat-value">${formatCurrency(totalPengeluaran)}</div>
              <div class="stat-label">Akumulasi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B6B, #EE5A6F);">
              <i data-feather="credit-card" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #FFD700;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Transaksi</div>
              <div class="stat-value">${totalTransaksi}</div>
              <div class="stat-label">Jumlah Transaksi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="file-text" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Kategori Terbanyak</div>
              <div class="stat-value" style="font-size: 18px;">${Object.keys(byKategori).length > 0 ? Object.keys(byKategori).reduce((a, b) => byKategori[a] > byKategori[b] ? a : b) : '-'}</div>
              <div class="stat-label">Kategori</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="tag" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Unit Usaha</th>
              <th>Kategori</th>
              <th>Jumlah</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${pengeluaran.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td>${item.nama_usaha || 'Umum'}</td>
                <td>${item.kategori}</td>
                <td style="color: #FF6B6B;"><strong>${formatCurrency(item.jumlah)}</strong></td>
                <td>${item.keterangan || '-'}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="cetakStrukPengeluaran(${item.id})">
                      <i data-feather="printer"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editPengeluaran(${item.id})">
                      <i data-feather="edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusPengeluaran(${item.id})">
                      <i data-feather="trash-2"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  feather.replace();
}

window.exportPengeluaran = async function() {
  const pengeluaran = await API.get('/api/transaksi/pengeluaran');
  
  let csv = 'No,Tanggal,Unit Usaha,Kategori,Jumlah,Keterangan\n';
  
  pengeluaran.forEach((item, index) => {
    csv += `${index + 1},"${formatDate(item.tanggal_transaksi)}","${item.nama_usaha || 'Umum'}","${item.kategori}","${item.jumlah}","${item.keterangan || ''}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pengeluaran-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Data pengeluaran berhasil diexport', 'success');
};

// Filter functions for Pengeluaran
window.applyPengeluaranFilter = function() {
  const kategori = document.getElementById('filterKategoriPengeluaran').value;
  const unitUsaha = document.getElementById('filterUnitUsahaPengeluaran').value;
  const tanggalDari = document.getElementById('filterTanggalDariPengeluaran').value;
  const tanggalSampai = document.getElementById('filterTanggalSampaiPengeluaran').value;
  
  // Store filter values
  window.pengeluaranFilterValues = { kategori, unitUsaha, tanggalDari, tanggalSampai };
  
  // Re-render with filter
  renderPengeluaranFiltered();
}

window.resetPengeluaranFilter = function() {
  document.getElementById('filterKategoriPengeluaran').value = '';
  document.getElementById('filterUnitUsahaPengeluaran').value = '';
  document.getElementById('filterTanggalDariPengeluaran').value = '';
  document.getElementById('filterTanggalSampaiPengeluaran').value = '';
  window.pengeluaranFilterValues = null;
  renderPengeluaran();
}

async function renderPengeluaranFiltered() {
  const [pengeluaran, unitUsaha] = await Promise.all([
    API.get('/api/transaksi/pengeluaran'),
    API.get('/api/unit-usaha')
  ]);
  
  let filtered = pengeluaran;
  const filters = window.pengeluaranFilterValues;
  
  if (filters) {
    if (filters.kategori) {
      filtered = filtered.filter(item => item.kategori === filters.kategori);
    }
    if (filters.unitUsaha) {
      filtered = filtered.filter(item => item.unit_usaha_id == filters.unitUsaha);
    }
    if (filters.tanggalDari) {
      filtered = filtered.filter(item => item.tanggal_transaksi >= filters.tanggalDari);
    }
    if (filters.tanggalSampai) {
      filtered = filtered.filter(item => item.tanggal_transaksi <= filters.tanggalSampai);
    }
  }
  
  const totalPengeluaran = filtered.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
  const totalTransaksi = filtered.length;
  
  // Group by kategori
  const byKategori = {};
  filtered.forEach(item => {
    if (!byKategori[item.kategori]) {
      byKategori[item.kategori] = 0;
    }
    byKategori[item.kategori] += parseFloat(item.jumlah || 0);
  });
  
  // Get unique categories from all data
  const categories = [...new Set(pengeluaran.map(item => item.kategori))];
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Pengeluaran</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportPengeluaran()">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakPengeluaran()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahPengeluaran()">
            <i data-feather="plus"></i> Tambah Pengeluaran
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="filter-section">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
            <label style="font-weight: 600; margin: 0;">Filter:</label>
          </div>
          
          <select id="filterKategoriPengeluaran" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 200px;">
            <option value="">Semua Kategori</option>
            ${categories.map(cat => `<option value="${cat}" ${filters && filters.kategori === cat ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
          
          <select id="filterUnitUsahaPengeluaran" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 200px;">
            <option value="">Semua Unit Usaha</option>
            ${unitUsaha.map(u => `<option value="${u.id}" ${filters && filters.unitUsaha == u.id ? 'selected' : ''}>${u.nama_usaha}</option>`).join('')}
          </select>
          
          <input type="date" id="filterTanggalDariPengeluaran" value="${filters ? filters.tanggalDari : ''}" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <input type="date" id="filterTanggalSampaiPengeluaran" value="${filters ? filters.tanggalSampai : ''}" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <button onclick="applyPengeluaranFilter()" class="btn btn-primary">
            <i data-feather="search"></i> Filter
          </button>
          
          <button onclick="resetPengeluaranFilter()" class="btn btn-warning">
            <i data-feather="refresh-cw"></i> Reset
          </button>
          
          <div style="margin-left: auto; color: #666;">
            <strong>${totalTransaksi}</strong> transaksi | 
            <strong>${formatCurrency(totalPengeluaran)}</strong>
          </div>
        </div>
      </div>
      
      <!-- Tile Rekap -->
      <div class="stats-grid" style="margin: 20px 0;">
        <div class="stat-card" style="border-left: 4px solid #FF6B6B;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Pengeluaran</div>
              <div class="stat-value">${formatCurrency(totalPengeluaran)}</div>
              <div class="stat-label">Akumulasi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B6B, #EE5A6F);">
              <i data-feather="credit-card" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #FFD700;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Transaksi</div>
              <div class="stat-value">${totalTransaksi}</div>
              <div class="stat-label">Jumlah Transaksi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="file-text" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Kategori Terbanyak</div>
              <div class="stat-value" style="font-size: 18px;">${Object.keys(byKategori).length > 0 ? Object.keys(byKategori).reduce((a, b) => byKategori[a] > byKategori[b] ? a : b) : '-'}</div>
              <div class="stat-label">Kategori</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="tag" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Unit Usaha</th>
              <th>Kategori</th>
              <th>Jumlah</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td>${item.nama_usaha || 'Umum'}</td>
                <td>${item.kategori}</td>
                <td style="color: #FF6B6B;"><strong>${formatCurrency(item.jumlah)}</strong></td>
                <td>${item.keterangan || '-'}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="cetakStrukPengeluaran(${item.id})">
                      <i data-feather="printer"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editPengeluaran(${item.id})">
                      <i data-feather="edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusPengeluaran(${item.id})">
                      <i data-feather="trash-2"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  feather.replace();
}


// Simple filter functions for Penjualan
window.applyPenjualanFilter = function() {
  const unitUsaha = document.getElementById('filterUnitUsahaPenjualan').value;
  const tanggalDari = document.getElementById('filterTanggalDariPenjualan').value;
  const tanggalSampai = document.getElementById('filterTanggalSampaiPenjualan').value;
  
  // Store filter values
  window.penjualanFilterValues = { unitUsaha, tanggalDari, tanggalSampai };
  
  // Re-render with filter
  renderPenjualanFiltered();
}

window.resetPenjualanFilter = function() {
  document.getElementById('filterUnitUsahaPenjualan').value = '';
  document.getElementById('filterTanggalDariPenjualan').value = '';
  document.getElementById('filterTanggalSampaiPenjualan').value = '';
  window.penjualanFilterValues = null;
  renderPenjualan();
}

async function renderPenjualanFiltered() {
  const [penjualan, unitUsaha] = await Promise.all([
    API.get('/api/transaksi/penjualan'),
    API.get('/api/unit-usaha')
  ]);
  
  let filtered = penjualan;
  const filters = window.penjualanFilterValues;
  
  if (filters) {
    if (filters.unitUsaha) {
      filtered = filtered.filter(item => item.unit_usaha_id == filters.unitUsaha);
    }
    if (filters.tanggalDari) {
      filtered = filtered.filter(item => item.tanggal_transaksi >= filters.tanggalDari);
    }
    if (filters.tanggalSampai) {
      filtered = filtered.filter(item => item.tanggal_transaksi <= filters.tanggalSampai);
    }
  }
  
  const totalPenjualan = filtered.reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
  const totalKeuntungan = filtered.reduce((sum, item) => sum + parseFloat(item.keuntungan || 0), 0);
  const totalTransaksi = filtered.length;
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Hasil Penjualan</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportPenjualan()">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakPenjualan()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahPenjualan()">
            <i data-feather="plus"></i> Tambah Penjualan
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="filter-section">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
            <label style="font-weight: 600; margin: 0;">Filter:</label>
          </div>
          
          <select id="filterUnitUsahaPenjualan" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 200px;">
            <option value="">Semua Unit Usaha</option>
            ${unitUsaha.map(u => `<option value="${u.id}" ${filters && filters.unitUsaha == u.id ? 'selected' : ''}>${u.nama_usaha}</option>`).join('')}
          </select>
          
          <input type="date" id="filterTanggalDariPenjualan" value="${filters ? filters.tanggalDari : ''}" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <input type="date" id="filterTanggalSampaiPenjualan" value="${filters ? filters.tanggalSampai : ''}" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <button onclick="applyPenjualanFilter()" class="btn btn-primary">
            <i data-feather="search"></i> Filter
          </button>
          
          <button onclick="resetPenjualanFilter()" class="btn btn-warning">
            <i data-feather="refresh-cw"></i> Reset
          </button>
          
          <div style="margin-left: auto; color: #666;">
            <strong>${totalTransaksi}</strong> transaksi | 
            <strong>${formatCurrency(totalKeuntungan)}</strong>
          </div>
        </div>
      </div>
      
      <!-- Tile Rekap -->
      <div class="stats-grid" style="margin: 20px 0;">
        <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Penjualan</div>
              <div class="stat-value">${formatCurrency(totalPenjualan)}</div>
              <div class="stat-label">Akumulasi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="shopping-cart" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #00C9A7;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Keuntungan</div>
              <div class="stat-value">${formatCurrency(totalKeuntungan)}</div>
              <div class="stat-label">Laba Kotor</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #00C9A7, #00B894);">
              <i data-feather="trending-up" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #FFD700;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Transaksi</div>
              <div class="stat-value">${totalTransaksi}</div>
              <div class="stat-label">Jumlah Transaksi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="file-text" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Unit Usaha</th>
              <th>Penjualan</th>
              <th>HPP</th>
              <th>Keuntungan</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td>${item.nama_usaha || '-'}</td>
                <td>${formatCurrency(item.jumlah_penjualan)}</td>
                <td>${formatCurrency(item.hpp)}</td>
                <td style="color: #00C9A7;"><strong>${formatCurrency(item.keuntungan)}</strong></td>
                <td>${item.keterangan || '-'}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editPenjualan(${item.id})" title="Edit">
                      <i data-feather="edit"></i>
                      <span class="btn-text">Edit</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePenjualan(${item.id})" title="Hapus">
                      <i data-feather="trash-2"></i>
                      <span class="btn-text">Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  feather.replace();
}


// Pendapatan Lain dengan Tile Rekap dan Filter
window.renderPendapatanLain = async function() {
  const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
  
  const totalPendapatan = pendapatanLain.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
  const totalTransaksi = pendapatanLain.length;
  
  // Group by kategori
  const byKategori = {};
  pendapatanLain.forEach(item => {
    if (!byKategori[item.kategori]) {
      byKategori[item.kategori] = 0;
    }
    byKategori[item.kategori] += parseFloat(item.jumlah || 0);
  });
  
  // Get unique categories
  const categories = [...new Set(pendapatanLain.map(item => item.kategori))];
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Pendapatan Lain</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportPendapatanLain()">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakPendapatanLain()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahPendapatanLain()">
            <i data-feather="plus"></i> Tambah Pendapatan
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="filter-section">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
            <label style="font-weight: 600; margin: 0;">Filter:</label>
          </div>
          
          <select id="filterKategoriPendapatan" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 200px;">
            <option value="">Semua Kategori</option>
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
          
          <input type="date" id="filterTanggalDariPendapatan" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <input type="date" id="filterTanggalSampaiPendapatan" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <button onclick="applyPendapatanFilter()" class="btn btn-primary">
            <i data-feather="search"></i> Filter
          </button>
          
          <button onclick="resetPendapatanFilter()" class="btn btn-warning">
            <i data-feather="refresh-cw"></i> Reset
          </button>
          
          <div style="margin-left: auto; color: #666;">
            <strong>${totalTransaksi}</strong> transaksi | 
            <strong>${formatCurrency(totalPendapatan)}</strong>
          </div>
        </div>
      </div>
      
      <!-- Tile Rekap -->
      <div class="stats-grid" style="margin: 20px 0;">
        <div class="stat-card" style="border-left: 4px solid #00C9A7;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Pendapatan Lain</div>
              <div class="stat-value">${formatCurrency(totalPendapatan)}</div>
              <div class="stat-label">Akumulasi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #00C9A7, #00B894);">
              <i data-feather="trending-up" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #FFD700;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Transaksi</div>
              <div class="stat-value">${totalTransaksi}</div>
              <div class="stat-label">Jumlah Transaksi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="file-text" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Kategori Terbanyak</div>
              <div class="stat-value" style="font-size: 18px;">${Object.keys(byKategori).length > 0 ? Object.keys(byKategori).reduce((a, b) => byKategori[a] > byKategori[b] ? a : b) : '-'}</div>
              <div class="stat-label">Kategori</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="tag" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Jumlah</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${pendapatanLain.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td>${item.kategori}</td>
                <td style="color: #00C9A7;"><strong>${formatCurrency(item.jumlah)}</strong></td>
                <td>${item.keterangan || '-'}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-warning" onclick="editPendapatanLain(${item.id})">
                      <i data-feather="edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusPendapatanLain(${item.id})">
                      <i data-feather="trash-2"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  feather.replace();
}

window.exportPendapatanLain = async function() {
  const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
  
  let csv = 'No,Tanggal,Kategori,Jumlah,Keterangan\n';
  
  pendapatanLain.forEach((item, index) => {
    csv += `${index + 1},"${formatDate(item.tanggal_transaksi)}","${item.kategori}","${item.jumlah}","${item.keterangan || ''}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pendapatan-lain-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Data pendapatan lain berhasil diexport', 'success');
};

// Filter functions for Pendapatan Lain
window.applyPendapatanFilter = function() {
  const kategori = document.getElementById('filterKategoriPendapatan').value;
  const tanggalDari = document.getElementById('filterTanggalDariPendapatan').value;
  const tanggalSampai = document.getElementById('filterTanggalSampaiPendapatan').value;
  
  window.pendapatanFilterValues = { kategori, tanggalDari, tanggalSampai };
  renderPendapatanFiltered();
}

window.resetPendapatanFilter = function() {
  document.getElementById('filterKategoriPendapatan').value = '';
  document.getElementById('filterTanggalDariPendapatan').value = '';
  document.getElementById('filterTanggalSampaiPendapatan').value = '';
  window.pendapatanFilterValues = null;
  renderPendapatanLain();
}

async function renderPendapatanFiltered() {
  const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
  
  let filtered = pendapatanLain;
  const filters = window.pendapatanFilterValues;
  
  if (filters) {
    if (filters.kategori) {
      filtered = filtered.filter(item => item.kategori === filters.kategori);
    }
    if (filters.tanggalDari) {
      filtered = filtered.filter(item => item.tanggal_transaksi >= filters.tanggalDari);
    }
    if (filters.tanggalSampai) {
      filtered = filtered.filter(item => item.tanggal_transaksi <= filters.tanggalSampai);
    }
  }
  
  const totalPendapatan = filtered.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
  const totalTransaksi = filtered.length;
  
  const byKategori = {};
  filtered.forEach(item => {
    if (!byKategori[item.kategori]) {
      byKategori[item.kategori] = 0;
    }
    byKategori[item.kategori] += parseFloat(item.jumlah || 0);
  });
  
  const categories = [...new Set(pendapatanLain.map(item => item.kategori))];
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Pendapatan Lain</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportPendapatanLain()">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakPendapatanLain()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahPendapatanLain()">
            <i data-feather="plus"></i> Tambah Pendapatan
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="filter-section">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
            <label style="font-weight: 600; margin: 0;">Filter:</label>
          </div>
          
          <select id="filterKategoriPendapatan" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 200px;">
            <option value="">Semua Kategori</option>
            ${categories.map(cat => `<option value="${cat}" ${filters && filters.kategori === cat ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
          
          <input type="date" id="filterTanggalDariPendapatan" value="${filters ? filters.tanggalDari : ''}" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <input type="date" id="filterTanggalSampaiPendapatan" value="${filters ? filters.tanggalSampai : ''}" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
          
          <button onclick="applyPendapatanFilter()" class="btn btn-primary">
            <i data-feather="search"></i> Filter
          </button>
          
          <button onclick="resetPendapatanFilter()" class="btn btn-warning">
            <i data-feather="refresh-cw"></i> Reset
          </button>
          
          <div style="margin-left: auto; color: #666;">
            <strong>${totalTransaksi}</strong> transaksi | 
            <strong>${formatCurrency(totalPendapatan)}</strong>
          </div>
        </div>
      </div>
      
      <!-- Tile Rekap -->
      <div class="stats-grid" style="margin: 20px 0;">
        <div class="stat-card" style="border-left: 4px solid #00C9A7;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Pendapatan Lain</div>
              <div class="stat-value">${formatCurrency(totalPendapatan)}</div>
              <div class="stat-label">Akumulasi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #00C9A7, #00B894);">
              <i data-feather="trending-up" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #FFD700;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Transaksi</div>
              <div class="stat-value">${totalTransaksi}</div>
              <div class="stat-label">Jumlah Transaksi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="file-text" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Kategori Terbanyak</div>
              <div class="stat-value" style="font-size: 18px;">${Object.keys(byKategori).length > 0 ? Object.keys(byKategori).reduce((a, b) => byKategori[a] > byKategori[b] ? a : b) : '-'}</div>
              <div class="stat-label">Kategori</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="tag" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Jumlah</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td>${item.kategori}</td>
                <td style="color: #00C9A7;"><strong>${formatCurrency(item.jumlah)}</strong></td>
                <td>${item.keterangan || '-'}</td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-warning" onclick="editPendapatanLain(${item.id})">
                      <i data-feather="edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusPendapatanLain(${item.id})">
                      <i data-feather="trash-2"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  feather.replace();
}


// Cetak Simpanan
window.cetakSimpanan = async function(jenis) {
  const simpanan = await API.get(`/api/simpanan/${jenis}`);
  const info = await API.get('/api/koperasi-info');
  
  const jenisLabel = {
    'pokok': 'Simpanan Pokok',
    'wajib': 'Simpanan Wajib',
    'khusus': 'Simpanan Khusus',
    'sukarela': 'Simpanan Sukarela'
  };
  
  const totalSimpanan = simpanan.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${jenisLabel[jenis]} - ${info.nama_koperasi || 'Koperasi'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 5px 0; }
        .header p { margin: 3px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #2E7D32; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { margin-top: 20px; text-align: right; font-weight: bold; }
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
        <h3 style="margin-top: 15px;">${jenisLabel[jenis].toUpperCase()}</h3>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>No. Anggota</th>
            <th>Nama Anggota</th>
            <th>Jumlah</th>
            <th>Metode</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${simpanan.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${formatDate(item.tanggal_transaksi)}</td>
              <td>${item.nomor_anggota}</td>
              <td>${item.nama_lengkap}</td>
              <td style="text-align: right;">${formatCurrency(item.jumlah)}</td>
              <td>${item.metode_pembayaran || '-'}</td>
              <td>${item.keterangan || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        Total ${jenisLabel[jenis]}: ${formatCurrency(totalSimpanan)}
      </div>
      
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
};

// Cetak Partisipasi Anggota
window.cetakPartisipasi = async function() {
  const partisipasi = await API.get('/api/partisipasi');
  const info = await API.get('/api/koperasi-info');
  
  const totalPartisipasi = partisipasi.reduce((sum, item) => sum + parseFloat(item.jumlah_transaksi || 0), 0);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Partisipasi Anggota - ${info.nama_koperasi || 'Koperasi'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 5px 0; }
        .header p { margin: 3px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #2E7D32; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { margin-top: 20px; text-align: right; font-weight: bold; }
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
        <h3 style="margin-top: 15px;">PARTISIPASI ANGGOTA</h3>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>No. Anggota</th>
            <th>Nama Anggota</th>
            <th>Unit Usaha</th>
            <th>Jumlah Transaksi</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${partisipasi.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${formatDate(item.tanggal_transaksi)}</td>
              <td>${item.nomor_anggota}</td>
              <td>${item.nama_lengkap}</td>
              <td>${item.nama_usaha || '-'}</td>
              <td style="text-align: right;">${formatCurrency(item.jumlah_transaksi)}</td>
              <td>${item.keterangan || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        Total Partisipasi: ${formatCurrency(totalPartisipasi)}
      </div>
      
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
};


// Cetak Penjualan
window.cetakPenjualan = async function() {
  const penjualan = await API.get('/api/transaksi/penjualan');
  const info = await API.get('/api/koperasi-info');
  
  const totalPenjualan = penjualan.reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
  const totalKeuntungan = penjualan.reduce((sum, item) => sum + parseFloat(item.keuntungan || 0), 0);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hasil Penjualan - ${info.nama_koperasi || 'Koperasi'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 5px 0; }
        .header p { margin: 3px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #2E7D32; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px; }
        .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
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
        <h3 style="margin-top: 15px;">HASIL PENJUALAN</h3>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Unit Usaha</th>
            <th>Penjualan</th>
            <th>HPP</th>
            <th>Keuntungan</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${penjualan.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${formatDate(item.tanggal_transaksi)}</td>
              <td>${item.nama_usaha || '-'}</td>
              <td style="text-align: right;">${formatCurrency(item.jumlah_penjualan)}</td>
              <td style="text-align: right;">${formatCurrency(item.hpp)}</td>
              <td style="text-align: right; color: #00C9A7;"><strong>${formatCurrency(item.keuntungan)}</strong></td>
              <td>${item.keterangan || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="summary-row">
          <strong>Total Penjualan:</strong>
          <strong>${formatCurrency(totalPenjualan)}</strong>
        </div>
        <div class="summary-row">
          <strong>Total Keuntungan:</strong>
          <strong style="color: #00C9A7;">${formatCurrency(totalKeuntungan)}</strong>
        </div>
      </div>
      
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
};

// Cetak Pengeluaran
window.cetakPengeluaran = async function() {
  const pengeluaran = await API.get('/api/transaksi/pengeluaran');
  const info = await API.get('/api/koperasi-info');
  
  const totalPengeluaran = pengeluaran.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pengeluaran - ${info.nama_koperasi || 'Koperasi'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 5px 0; }
        .header p { margin: 3px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #2E7D32; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { margin-top: 20px; text-align: right; font-weight: bold; font-size: 14px; }
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
        <h3 style="margin-top: 15px;">PENGELUARAN</h3>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Unit Usaha</th>
            <th>Kategori</th>
            <th>Jumlah</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${pengeluaran.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${formatDate(item.tanggal_transaksi)}</td>
              <td>${item.nama_usaha || 'Umum'}</td>
              <td>${item.kategori}</td>
              <td style="text-align: right; color: #FF6B6B;"><strong>${formatCurrency(item.jumlah)}</strong></td>
              <td>${item.keterangan || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        Total Pengeluaran: ${formatCurrency(totalPengeluaran)}
      </div>
      
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
};

// Cetak Pendapatan Lain
window.cetakPendapatanLain = async function() {
  const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
  const info = await API.get('/api/koperasi-info');
  
  const totalPendapatan = pendapatanLain.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pendapatan Lain - ${info.nama_koperasi || 'Koperasi'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 5px 0; }
        .header p { margin: 3px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #2E7D32; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .summary { margin-top: 20px; text-align: right; font-weight: bold; font-size: 14px; }
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
        <h3 style="margin-top: 15px;">PENDAPATAN LAIN</h3>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Kategori</th>
            <th>Jumlah</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${pendapatanLain.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${formatDate(item.tanggal_transaksi)}</td>
              <td>${item.kategori}</td>
              <td style="text-align: right; color: #00C9A7;"><strong>${formatCurrency(item.jumlah)}</strong></td>
              <td>${item.keterangan || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        Total Pendapatan Lain: ${formatCurrency(totalPendapatan)}
      </div>
      
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
};


