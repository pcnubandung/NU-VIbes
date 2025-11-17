// Page loader
window.loadPage = async function(page) {
  // Dynamic lookup - get function at call time, not definition time
  const pages = {
    'beranda': 'renderBeranda',
    'info-koperasi': 'renderInfoKoperasi',
    'unit-usaha': 'renderUnitUsaha',
    'aset-inventaris': 'renderAsetInventaris',
    'approval-anggota': 'renderApprovalAnggota',
    'data-anggota': 'renderDataAnggota',
    'data-pengurus': 'renderDataPengurus',
    'data-karyawan': 'renderDataKaryawan',
    'simpanan-pokok': 'renderSimpanan',
    'simpanan-wajib': 'renderSimpanan',
    'simpanan-khusus': 'renderSimpanan',
    'simpanan-sukarela': 'renderSimpanan',
    'partisipasi-anggota': 'renderPartisipasiAnggota',
    'penjualan': 'renderPenjualan',
    'pengeluaran': 'renderPengeluaran',
    'pendapatan-lain': 'renderPendapatanLain',
    'shu': 'renderSHU',
    'publikasi': 'renderPublikasi',
    'pengumuman': 'renderPengumuman',
    'laporan': 'renderLaporan',
    'profil': 'renderProfil',
    'pengaturan': 'renderPengaturan'
  };
  
  const functionName = pages[page];
  if (functionName && window[functionName]) {
    contentArea.innerHTML = '<div class="loading">Memuat data...</div>';
    try {
      // All simpanan pages now use unified view (no parameter needed)
      await window[functionName]();
      feather.replace();
    } catch (error) {
      console.error('Error loading page:', error);
      contentArea.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Error</h3>
          </div>
          <div class="error-message">
            <p>Terjadi kesalahan saat memuat halaman: ${error.message}</p>
            <p><small>Silakan refresh halaman atau hubungi administrator.</small></p>
          </div>
        </div>
      `;
    }
  } else {
    console.error(`Page "${page}" not found. Function "${functionName}" is ${typeof window[functionName]}`);
    contentArea.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Halaman Tidak Ditemukan</h3>
        </div>
        <div class="error-message">
          <p>Halaman "${page}" tidak ditemukan.</p>
          <p><small>Debug: Function "${functionName}" is ${typeof window[functionName]}</small></p>
        </div>
      </div>
    `;
  }
};

// Beranda Page
window.renderBeranda = async function() {
  const stats = await API.get('/api/dashboard/stats');
  
  contentArea.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card" style="border-left: 4px solid #2E7D32;">
        <div class="stat-header">
          <div>
            <div class="stat-title">Total Anggota</div>
            <div class="stat-value">${stats.totalAnggota || 0}</div>
            <div class="stat-label">Anggota Aktif</div>
          </div>
          <div class="stat-icon" style="background: linear-gradient(135deg, #2E7D32, #4CAF50);">
            <i data-feather="users" style="color: white; width: 28px; height: 28px;"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card" style="border-left: 4px solid #FFD700;">
        <div class="stat-header">
          <div>
            <div class="stat-title">Total Simpanan</div>
            <div class="stat-value">${formatCurrency(stats.totalSimpanan || 0)}</div>
            <div class="stat-label">Pokok + Wajib + Khusus + Sukarela</div>
          </div>
          <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
            <i data-feather="dollar-sign" style="color: white; width: 28px; height: 28px;"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
        <div class="stat-header">
          <div>
            <div class="stat-title">Total Pendapatan</div>
            <div class="stat-value">${formatCurrency(stats.totalPendapatan || 0)}</div>
            <div class="stat-label">Penjualan + Pendapatan Lain</div>
          </div>
          <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
            <i data-feather="dollar-sign" style="color: white; width: 28px; height: 28px;"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card" style="border-left: 4px solid #00C9A7;">
        <div class="stat-header">
          <div>
            <div class="stat-title">Laba Kotor</div>
            <div class="stat-value">${formatCurrency(stats.labaKotor || 0)}</div>
            <div class="stat-label">Total Pendapatan - HPP</div>
          </div>
          <div class="stat-icon" style="background: linear-gradient(135deg, #00C9A7, #00B894);">
            <i data-feather="trending-up" style="color: white; width: 28px; height: 28px;"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card" style="border-left: 4px solid #FF6B6B;">
        <div class="stat-header">
          <div>
            <div class="stat-title">Biaya Operasional</div>
            <div class="stat-value">${formatCurrency(stats.totalPengeluaran || 0)}</div>
            <div class="stat-label">Tanpa Pembelian Barang & Aset</div>
          </div>
          <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B6B, #EE5A6F);">
            <i data-feather="credit-card" style="color: white; width: 28px; height: 28px;"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card" style="border-left: 4px solid ${stats.labaRugi >= 0 ? '#00C9A7' : '#FF6B6B'};">
        <div class="stat-header">
          <div>
            <div class="stat-title">${stats.labaRugi >= 0 ? 'SHU Tahun Berjalan' : 'Rugi Tahun Berjalan'}</div>
            <div class="stat-value" style="color: ${stats.labaRugi >= 0 ? '#00C9A7' : '#FF6B6B'}">
              ${formatCurrency(Math.abs(stats.labaRugi || 0))}
            </div>
            <div class="stat-label">Laba Kotor - Biaya Operasional</div>
          </div>
          <div class="stat-icon" style="background: linear-gradient(135deg, ${stats.labaRugi >= 0 ? '#00C9A7, #00B894' : '#FF6B6B, #EE5A6F'});">
            <i data-feather="${stats.labaRugi >= 0 ? 'trending-up' : 'trending-down'}" style="color: white; width: 28px; height: 28px;"></i>
          </div>
        </div>
      </div>
    </div>
    
    <div class="charts-grid">
      <div class="chart-container">
        <h3 class="chart-title">Komposisi Simpanan</h3>
        <canvas id="simpananChart"></canvas>
      </div>
      
      <div class="chart-container">
        <h3 class="chart-title">Pendapatan Bulanan</h3>
        <canvas id="labaRugiChart"></canvas>
      </div>
    </div>
  `;
  
  // Render charts
  window.renderSimpananChart();
  window.renderLabaRugiChart();
}

window.renderSimpananChart = async function() {
  const ctx = document.getElementById('simpananChart');
  if (!ctx) return;
  
  // Get simpanan data
  const pokok = await API.get('/api/simpanan/pokok');
  const wajib = await API.get('/api/simpanan/wajib');
  const khusus = await API.get('/api/simpanan/khusus');
  const sukarela = await API.get('/api/simpanan/sukarela');
  
  const totalPokok = pokok.reduce((sum, item) => sum + item.jumlah, 0);
  const totalWajib = wajib.reduce((sum, item) => sum + item.jumlah, 0);
  const totalKhusus = khusus.reduce((sum, item) => sum + item.jumlah, 0);
  const totalSukarela = sukarela.reduce((sum, item) => sum + item.jumlah, 0);
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Simpanan Pokok', 'Simpanan Wajib', 'Simpanan Khusus', 'Simpanan Sukarela'],
      datasets: [{
        data: [totalPokok, totalWajib, totalKhusus, totalSukarela],
        backgroundColor: ['#2E7D32', '#4CAF50', '#FFC107', '#FFD54F']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

window.renderLabaRugiChart = async function() {
  const ctx = document.getElementById('labaRugiChart');
  if (!ctx) return;
  
  try {
    // Get data for current year
    const currentYear = new Date().getFullYear();
    const penjualan = await API.get('/api/transaksi/penjualan');
    const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
    
    // Calculate pendapatan per month
    const pendapatanPerBulan = [];
    
    for (let month = 0; month < 12; month++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const yearMonth = `${currentYear}-${monthStr}`;
      
      // Filter data by month
      const penjualanBulan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(yearMonth));
      const pendapatanLainBulan = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(yearMonth));
      
      // Calculate totals
      const totalPenjualan = penjualanBulan.reduce((sum, p) => sum + (p.jumlah_penjualan || 0), 0);
      const totalPendapatanLain = pendapatanLainBulan.reduce((sum, p) => sum + (p.jumlah || 0), 0);
      
      // Total Pendapatan = Penjualan + Pendapatan Lain
      const totalPendapatan = totalPenjualan + totalPendapatanLain;
      
      pendapatanPerBulan.push(totalPendapatan);
    }
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        datasets: [{
          label: 'Pendapatan Bulanan',
          data: pendapatanPerBulan,
          borderColor: '#2E7D32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Pendapatan: ' + formatCurrency(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error rendering laba/rugi chart:', error);
  }
}

// Info Koperasi Page
window.renderInfoKoperasi = async function() {
  const info = await API.get('/api/koperasi-info');
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Informasi Koperasi</h3>
        <button class="btn btn-primary" onclick="editKoperasiInfo()">Edit Informasi</button>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Nama Koperasi</label>
          <p><strong>${info.nama_koperasi || '-'}</strong></p>
        </div>
        <div class="form-group">
          <label>Nomor Induk Koperasi</label>
          <p><strong>${info.nomor_induk_koperasi || '-'}</strong></p>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Nomor Induk Berusaha</label>
          <p><strong>${info.nomor_induk_berusaha || '-'}</strong></p>
        </div>
        <div class="form-group">
          <label>Nomor Badan Hukum</label>
          <p><strong>${info.nomor_badan_hukum || '-'}</strong></p>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Alamat</label>
          <p><strong>${info.alamat || '-'}</strong></p>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Nomor Telepon</label>
          <p><strong>${info.nomor_telpon || '-'}</strong></p>
        </div>
        <div class="form-group">
          <label>Email</label>
          <p><strong>${info.email || '-'}</strong></p>
        </div>
        <div class="form-group">
          <label>Tanggal Berdiri</label>
          <p><strong>${formatDate(info.tanggal_berdiri)}</strong></p>
        </div>
      </div>
      
      <div class="form-group">
        <label>Logo Koperasi</label>
        ${info.logo ? `
          <div style="margin-bottom: 15px;">
            <img src="${info.logo}" alt="Logo" style="max-width: 200px; border-radius: 10px; box-shadow: var(--shadow-md);">
          </div>
        ` : ''}
        <button class="btn btn-info" onclick="uploadLogoKoperasi()">
          <i data-feather="upload"></i> Upload Logo Baru
        </button>
      </div>
    </div>
  `;
  
  feather.replace();
}

window.uploadLogoKoperasi = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB!');
      return;
    }
    
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const response = await API.uploadFile('/api/koperasi/upload-logo', formData);
      
      if (response.success) {
        alert('Logo koperasi berhasil diupdate!');
        
        // Update sidebar logo
        const sidebarLogo = document.getElementById('sidebarLogo');
        const logoPlaceholder = document.getElementById('logoPlaceholder');
        
        sidebarLogo.src = response.logo;
        sidebarLogo.style.display = 'block';
        if (logoPlaceholder) logoPlaceholder.style.display = 'none';
        
        // Reload page
        window.renderInfoKoperasi();
      } else {
        alert('Gagal upload logo: ' + response.message);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Terjadi kesalahan saat upload logo');
    }
  };
  
  input.click();
}

window.editKoperasiInfo = async function() {
  const info = await API.get('/api/koperasi-info');
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Informasi Koperasi</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editKoperasiForm">
        <div class="form-row">
          <div class="form-group">
            <label>Nama Koperasi *</label>
            <input type="text" name="nama_koperasi" value="${info.nama_koperasi || ''}" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Induk Koperasi</label>
            <input type="text" name="nomor_induk_koperasi" value="${info.nomor_induk_koperasi || ''}">
          </div>
          <div class="form-group">
            <label>Nomor Induk Berusaha</label>
            <input type="text" name="nomor_induk_berusaha" value="${info.nomor_induk_berusaha || ''}">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Badan Hukum</label>
            <input type="text" name="nomor_badan_hukum" value="${info.nomor_badan_hukum || ''}">
          </div>
          <div class="form-group">
            <label>Tanggal Berdiri</label>
            <input type="date" name="tanggal_berdiri" value="${info.tanggal_berdiri || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label>Alamat</label>
          <textarea name="alamat">${info.alamat || ''}</textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Telepon</label>
            <input type="text" name="nomor_telpon" value="${info.nomor_telpon || ''}">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" value="${info.email || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label>Logo</label>
          <input type="file" name="logo" accept="image/*">
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editKoperasiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`/api/koperasi-info/${info.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Data berhasil diupdate');
        modal.remove();
        window.renderInfoKoperasi();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

// Unit Usaha - Moved to pages-extended.js for tile layout

// Aset & Inventaris Page
window.renderAsetInventaris = async function() {
  const pengeluaran = await API.get('/api/transaksi/pengeluaran');
  
  // Filter hanya pembelian aset & inventaris
  const asetInventaris = pengeluaran.filter(p => 
    p.kategori === 'Pembelian Aset & Inventaris' || p.kategori === 'Pembelian Aset'
  );
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Aset & Inventaris</h3>
        <p style="color: #666; margin: 8px 0 0 0;">Data aset dan inventaris dari transaksi pembelian</p>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal Perolehan</th>
              <th>Nama Aset</th>
              <th>Qty</th>
              <th>Harga Satuan</th>
              <th>Nilai Perolehan</th>
              <th>Unit Usaha</th>
            </tr>
          </thead>
          <tbody>
            ${asetInventaris.length > 0 ? asetInventaris.map((item, index) => {
              const qty = item.qty || 1;
              const harga = item.harga || (item.jumlah / qty); // Hitung harga satuan jika kosong
              return `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td>${item.keterangan || '-'}</td>
                <td style="text-align: center;">${qty}</td>
                <td>${formatCurrency(harga)}</td>
                <td><strong>${formatCurrency(item.jumlah)}</strong></td>
                <td>${item.nama_usaha || '-'}</td>
              </tr>
              `;
            }).join('') : '<tr><td colspan="7" style="text-align: center; color: #999;">Belum ada data aset & inventaris</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td colspan="2"><strong>TOTAL</strong></td>
              <td><strong>${asetInventaris.length} Item</strong></td>
              <td style="text-align: center;"><strong>${asetInventaris.reduce((sum, item) => sum + (item.qty || 1), 0)}</strong></td>
              <td></td>
              <td><strong>${formatCurrency(asetInventaris.reduce((sum, item) => sum + (item.jumlah || 0), 0))}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div style="margin-top: 20px; padding: 16px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196F3;">
        <h4 style="margin: 0 0 8px 0; color: #1976D2;">ℹ️ Informasi</h4>
        <p style="margin: 0; color: #666; line-height: 1.6;">
          Data aset & inventaris diambil dari transaksi <strong>Pengeluaran</strong> dengan kategori <strong>"Pembelian Aset & Inventaris"</strong>.<br>
          Untuk menambah aset baru, silakan input melalui menu <strong>Pengeluaran</strong> dengan kategori tersebut.
        </p>
      </div>
    </div>
  `;
  
  feather.replace();
};

// Data Anggota Page
// Global variable untuk menyimpan data dan sort state
let anggotaData = [];
let currentSortColumn = 'created_at';
let currentSortOrder = 'desc';

let searchKeyword = '';

// Helper function: Create searchable select for anggota
window.createSearchableAnggotaSelect = function(containerId, name = 'anggota_id', required = true, selectedId = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div style="position: relative;">
      <input 
        type="text" 
        id="${containerId}_search" 
        placeholder="Ketik untuk mencari anggota..."
        autocomplete="off"
        style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 5px;"
      >
      <select 
        name="${name}" 
        id="${containerId}_select" 
        ${required ? 'required' : ''}
        size="8"
        style="width: 100%; border: 1px solid #ddd; border-radius: 5px; max-height: 200px;"
      >
        <option value="">-- Pilih Anggota --</option>
      </select>
      <input type="hidden" name="${name}" id="${containerId}_value" ${required ? 'required' : ''}>
    </div>
  `;
  
  const searchInput = document.getElementById(`${containerId}_search`);
  const selectElement = document.getElementById(`${containerId}_select`);
  const hiddenInput = document.getElementById(`${containerId}_value`);
  
  let allAnggota = [];
  
  // Load anggota data
  API.get('/api/anggota').then(data => {
    allAnggota = data.filter(a => a.status === 'aktif');
    renderAnggotaOptions(allAnggota);
    
    if (selectedId) {
      selectElement.value = selectedId;
      hiddenInput.value = selectedId;
      const selected = allAnggota.find(a => a.id == selectedId);
      if (selected) {
        searchInput.value = `${selected.nomor_anggota} - ${selected.nama_lengkap}`;
      }
    }
  });
  
  function renderAnggotaOptions(anggotaList) {
    selectElement.innerHTML = '<option value="">-- Pilih Anggota --</option>' + 
      anggotaList.map(a => `
        <option value="${a.id}">${a.nomor_anggota} - ${a.nama_lengkap}</option>
      `).join('');
  }
  
  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    if (!keyword) {
      renderAnggotaOptions(allAnggota);
      return;
    }
    
    const filtered = allAnggota.filter(a => {
      return (
        (a.nomor_anggota && a.nomor_anggota.toLowerCase().includes(keyword)) ||
        (a.nama_lengkap && a.nama_lengkap.toLowerCase().includes(keyword))
      );
    });
    
    renderAnggotaOptions(filtered);
  });
  
  // Select functionality
  selectElement.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    hiddenInput.value = selectedId;
    
    if (selectedId) {
      const selected = allAnggota.find(a => a.id == selectedId);
      if (selected) {
        searchInput.value = `${selected.nomor_anggota} - ${selected.nama_lengkap}`;
      }
    } else {
      searchInput.value = '';
    }
  });
  
  // Double click to select
  selectElement.addEventListener('dblclick', (e) => {
    if (selectElement.value) {
      const selected = allAnggota.find(a => a.id == selectElement.value);
      if (selected) {
        searchInput.value = `${selected.nomor_anggota} - ${selected.nama_lengkap}`;
        hiddenInput.value = selectElement.value;
      }
    }
  });
};

window.renderDataAnggota = async function() {
  anggotaData = await API.get('/api/anggota');
  searchKeyword = '';
  renderAnggotaTable();
}

function renderAnggotaTable(updateOnly = false) {
  // Filter data by search keyword
  let filteredData = anggotaData;
  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();
    filteredData = anggotaData.filter(item => {
      return (
        (item.nomor_anggota && item.nomor_anggota.toLowerCase().includes(keyword)) ||
        (item.nama_lengkap && item.nama_lengkap.toLowerCase().includes(keyword)) ||
        (item.nik && item.nik.toLowerCase().includes(keyword)) ||
        (item.nomor_telpon && item.nomor_telpon.toLowerCase().includes(keyword)) ||
        (item.email && item.email.toLowerCase().includes(keyword))
      );
    });
  }
  
  // Sort data
  const sortedData = sortAnggotaData(filteredData, currentSortColumn, currentSortOrder);
  
  // If updateOnly, just update the table body and counter
  if (updateOnly) {
    const tbody = document.querySelector('.table-container tbody');
    const counter = document.querySelector('.filter-section > div:last-child');
    
    if (tbody) {
      tbody.innerHTML = sortedData.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.foto ? `<img src="/uploads/${item.foto}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">` : '👤'}</td>
          <td><strong>${item.nomor_anggota}</strong></td>
          <td>${item.nama_lengkap}</td>
          <td>${item.nik || '-'}</td>
          <td>${item.nomor_telpon || '-'}</td>
          <td>${item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}</td>
          <td><span class="badge badge-${item.status === 'aktif' ? 'success' : 'danger'}">${item.status}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-sm btn-info" onclick="detailAnggota(${item.id})" title="Detail">
                <i data-feather="eye"></i>
                <span class="btn-text">Detail</span>
              </button>
              <button class="btn btn-sm btn-warning" onclick="editAnggota(${item.id})" title="Edit">
                <i data-feather="edit"></i>
                <span class="btn-text">Edit</span>
              </button>
              <button class="btn btn-sm btn-danger" onclick="hapusAnggota(${item.id})" title="Hapus">
                <i data-feather="trash-2"></i>
                <span class="btn-text">Hapus</span>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
      
      feather.replace();
    }
    
    if (counter) {
      counter.innerHTML = searchKeyword 
        ? `Ditemukan: <strong>${sortedData.length}</strong> dari ${anggotaData.length} anggota` 
        : `Total: <strong>${sortedData.length}</strong> anggota`;
    }
    
    return;
  }
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Data Anggota</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportAnggota()">
            <i data-feather="download"></i> Export Excel
          </button>
          <button class="btn btn-info" onclick="importAnggota()">
            <i data-feather="upload"></i> Import Excel
          </button>
          <button class="btn btn-warning" onclick="cetakAnggota()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahAnggota()">
            <i data-feather="plus"></i> Tambah Anggota
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="search-section" style="margin-bottom: 15px;">
          <div style="position: relative; max-width: 400px;">
            <i data-feather="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #999;"></i>
            <input 
              type="text" 
              id="searchAnggota" 
              placeholder="Cari anggota (nama, nomor, NIK, telepon)..." 
              value="${searchKeyword}"
              style="width: 100%; padding: 10px 10px 10px 40px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;"
              oninput="searchAnggota(this.value)"
              onfocus="this.style.borderColor='#2E7D32'"
              onblur="this.style.borderColor='#ddd'"
            >
            ${searchKeyword ? `
              <button 
                onclick="clearSearchAnggota()" 
                style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #999; padding: 4px;"
                title="Hapus pencarian"
              >
                <i data-feather="x" style="width: 18px; height: 18px;"></i>
              </button>
            ` : ''}
          </div>
        </div>
        
        <div class="filter-section" style="display: flex; gap: 15px; align-items: center; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
            <label style="font-weight: 600; margin: 0;">Urutkan:</label>
          </div>
          <select id="sortColumn" onchange="changeSortColumn(this.value)" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 200px;">
            <option value="nomor_anggota" ${currentSortColumn === 'nomor_anggota' ? 'selected' : ''}>Nomor Anggota</option>
            <option value="nama_lengkap" ${currentSortColumn === 'nama_lengkap' ? 'selected' : ''}>Nama Lengkap</option>
            <option value="tanggal_bergabung" ${currentSortColumn === 'tanggal_bergabung' ? 'selected' : ''}>Tanggal Bergabung</option>
            <option value="status" ${currentSortColumn === 'status' ? 'selected' : ''}>Status</option>
            <option value="created_at" ${currentSortColumn === 'created_at' ? 'selected' : ''}>Terbaru Ditambahkan</option>
          </select>
          <button onclick="toggleSortOrder()" class="btn btn-secondary" style="display: flex; align-items: center; gap: 8px;">
            <i data-feather="${currentSortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}" style="width: 16px; height: 16px;"></i>
            ${currentSortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
          <div style="margin-left: auto; color: #666;">
            ${searchKeyword ? `Ditemukan: <strong>${sortedData.length}</strong> dari ${anggotaData.length} anggota` : `Total: <strong>${sortedData.length}</strong> anggota`}
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Foto</th>
              <th>No. Anggota</th>
              <th>Nama Lengkap</th>
              <th>NIK</th>
              <th>Telepon</th>
              <th>Tanggal Bergabung</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${sortedData.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.foto ? `<img src="/uploads/${item.foto}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">` : '👤'}</td>
                <td><strong>${item.nomor_anggota}</strong></td>
                <td>${item.nama_lengkap}</td>
                <td>${item.nik || '-'}</td>
                <td>${item.nomor_telpon || '-'}</td>
                <td>${item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}</td>
                <td><span class="badge badge-${item.status === 'aktif' ? 'success' : 'danger'}">${item.status}</span></td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-info" onclick="detailAnggota(${item.id})" title="Detail">
                      <i data-feather="eye"></i>
                      <span class="btn-text">Detail</span>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editAnggota(${item.id})" title="Edit">
                      <i data-feather="edit"></i>
                      <span class="btn-text">Edit</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusAnggota(${item.id})" title="Hapus">
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

// Function to sort anggota data
function sortAnggotaData(data, column, order) {
  return [...data].sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];
    
    // Handle null/undefined values
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';
    
    // Convert to lowercase for string comparison
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    // Compare
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// Function to change sort column
window.changeSortColumn = function(column) {
  currentSortColumn = column;
  renderAnggotaTable();
}

// Function to toggle sort order
window.toggleSortOrder = function() {
  currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
  renderAnggotaTable();
}

// Function to search anggota
window.searchAnggota = function(keyword) {
  searchKeyword = keyword;
  renderAnggotaTable(true); // Update only table, not entire page
}

// Function to clear search
window.clearSearchAnggota = function() {
  searchKeyword = '';
  renderAnggotaTable();
}

window.tambahAnggota = function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Anggota</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahAnggotaForm">
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Anggota *</label>
            <input type="text" name="nomor_anggota" required>
          </div>
          <div class="form-group">
            <label>Nama Lengkap *</label>
            <input type="text" name="nama_lengkap" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>NIK</label>
            <input type="text" name="nik">
          </div>
          <div class="form-group">
            <label>Jenis Kelamin</label>
            <select name="jenis_kelamin">
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Tempat Lahir</label>
            <input type="text" name="tempat_lahir">
          </div>
          <div class="form-group">
            <label>Tanggal Lahir</label>
            <input type="date" name="tanggal_lahir">
          </div>
        </div>
        
        <div class="form-group">
          <label>Alamat</label>
          <textarea name="alamat"></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Telepon</label>
            <input type="text" name="nomor_telpon">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Username</label>
            <input type="text" name="username">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Pekerjaan</label>
            <input type="text" name="pekerjaan">
          </div>
          <div class="form-group">
            <label>Tanggal Bergabung</label>
            <input type="date" name="tanggal_bergabung" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        
        <div class="form-group">
          <label>Foto</label>
          <input type="file" name="foto" accept="image/*">
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('tambahAnggotaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/anggota', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Anggota berhasil ditambahkan');
        modal.remove();
        window.renderDataAnggota();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

window.hapusAnggota = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
    const result = await API.delete(`/api/anggota/${id}`);
    alert(result.message);
    window.renderDataAnggota();
  }
};

// Import Anggota dari Excel
window.importAnggota = async function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 700px;">
      <div class="modal-header">
        <h3 class="modal-title">Import Data Anggota dari Excel</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <div class="modal-body">
        <div class="alert alert-info" style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #1976d2;">
            <i data-feather="info"></i> Panduan Import Excel
          </h4>
          <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Download template Excel terlebih dahulu</li>
            <li>Isi data anggota sesuai kolom yang tersedia</li>
            <li>Kolom wajib: <strong>Nomor Anggota</strong> dan <strong>Nama Lengkap</strong></li>
            <li>Format tanggal: <strong>YYYY-MM-DD</strong> (contoh: 2024-01-15)</li>
            <li>Status: <strong>aktif</strong> atau <strong>nonaktif</strong></li>
            <li>Password default: <strong>nomor anggota</strong></li>
            <li>Upload file Excel yang sudah diisi</li>
          </ol>
        </div>
        
        <div style="margin-bottom: 20px;">
          <button class="btn btn-success" onclick="downloadTemplateAnggota()" style="width: 100%;">
            <i data-feather="download"></i> Download Template Excel
          </button>
        </div>
        
        <form id="formImportAnggota" enctype="multipart/form-data">
          <div class="form-group">
            <label>Upload File Excel *</label>
            <input type="file" name="file" accept=".xlsx,.xls" required>
            <small style="color: #666;">Format: .xlsx atau .xls</small>
          </div>
          
          <div class="btn-group">
            <button type="submit" class="btn btn-primary">
              <i data-feather="upload"></i> Import Data
            </button>
            <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">
              <i data-feather="x"></i> Batal
            </button>
          </div>
        </form>
        
        <div id="importProgress" style="display: none; margin-top: 20px;">
          <div style="text-align: center; padding: 20px;">
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #2E7D32; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
            <p>Sedang mengimport data...</p>
          </div>
        </div>
        
        <div id="importResult" style="display: none; margin-top: 20px;"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  feather.replace();
  
  document.getElementById('formImportAnggota').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const progressDiv = document.getElementById('importProgress');
    const resultDiv = document.getElementById('importResult');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
      progressDiv.style.display = 'block';
      resultDiv.style.display = 'none';
      submitBtn.disabled = true;
      
      const response = await fetch('/api/anggota/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      progressDiv.style.display = 'none';
      resultDiv.style.display = 'block';
      
      if (response.ok) {
        let errorHtml = '';
        if (result.results.errors.length > 0) {
          const errorList = result.results.errors.map(err => `<li>${err}</li>`).join('');
          errorHtml = `
            <details style="margin-top: 10px;">
              <summary style="cursor: pointer; color: #d32f2f;">Detail Error (${result.results.errors.length})</summary>
              <ul style="margin: 10px 0 0 20px; max-height: 200px; overflow-y: auto;">
                ${errorList}
              </ul>
            </details>
          `;
        }
        
        resultDiv.innerHTML = `
          <div class="alert alert-success" style="padding: 15px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #2e7d32;">
              <i data-feather="check-circle"></i> Import Berhasil!
            </h4>
            <p style="margin: 0 0 10px 0;"><strong>Berhasil:</strong> ${result.results.success} anggota</p>
            <p style="margin: 0;"><strong>Gagal:</strong> ${result.results.failed} anggota</p>
            ${errorHtml}
          </div>
        `;
        feather.replace();
        
        // Refresh data anggota
        setTimeout(() => {
          modal.remove();
          renderDataAnggota();
        }, 3000);
      } else {
        resultDiv.innerHTML = `
          <div class="alert alert-danger" style="padding: 15px; background: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #c62828;">
              <i data-feather="x-circle"></i> Import Gagal
            </h4>
            <p style="margin: 0;">${result.error}</p>
          </div>
        `;
        feather.replace();
      }
    } catch (error) {
      progressDiv.style.display = 'none';
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <div class="alert alert-danger" style="padding: 15px; background: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #c62828;">
            <i data-feather="x-circle"></i> Terjadi Kesalahan
          </h4>
          <p style="margin: 0;">${error.message}</p>
        </div>
      `;
      feather.replace();
    } finally {
      submitBtn.disabled = false;
    }
  });
};

// Download Template Excel Anggota
window.downloadTemplateAnggota = async function() {
  try {
    const response = await fetch('/api/anggota/template', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Template_Import_Anggota.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      alert('Gagal mendownload template');
    }
  } catch (error) {
    alert('Terjadi kesalahan: ' + error.message);
  }
};

// Simpanan Page - Unified
// Global variables for simpanan filter
let allSimpananData = [];
let simpananFilters = {
  jenis: 'semua',
  anggota: 'semua',
  tanggalDari: '',
  tanggalSampai: '',
  sortBy: 'tanggal_transaksi',
  sortOrder: 'desc'
};

window.renderSimpanan = async function() {
  // Load all simpanan data
  const [pokok, wajib, khusus, sukarela, anggota] = await Promise.all([
    API.get('/api/simpanan/pokok'),
    API.get('/api/simpanan/wajib'),
    API.get('/api/simpanan/khusus'),
    API.get('/api/simpanan/sukarela'),
    API.get('/api/anggota')
  ]);
  
  // Combine all data with jenis label
  allSimpananData = [
    ...pokok.map(s => ({ ...s, jenis_simpanan: 'pokok', jenis_label: 'Simpanan Pokok' })),
    ...wajib.map(s => ({ ...s, jenis_simpanan: 'wajib', jenis_label: 'Simpanan Wajib' })),
    ...khusus.map(s => ({ ...s, jenis_simpanan: 'khusus', jenis_label: 'Simpanan Khusus' })),
    ...sukarela.map(s => ({ ...s, jenis_simpanan: 'sukarela', jenis_label: 'Simpanan Sukarela' }))
  ];
  
  renderSimpananTable(anggota);
}

function renderSimpananTable(anggota) {
  // Apply filters
  let filteredData = filterSimpananData(allSimpananData);
  
  // Calculate total
  const totalJumlah = filteredData.reduce((sum, item) => sum + item.jumlah, 0);
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Transaksi Simpanan</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportSimpananUnified()">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakSimpananUnified()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahSimpananUnified()">
            <i data-feather="plus"></i> Tambah Transaksi
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="filter-section">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
            <label style="font-weight: 600; margin: 0;">Filter:</label>
          </div>
          
          <select id="filterJenis" onchange="changeSimpananFilter('jenis', this.value)">
            <option value="semua">Semua Jenis</option>
            <option value="pokok" ${simpananFilters.jenis === 'pokok' ? 'selected' : ''}>Simpanan Pokok</option>
            <option value="wajib" ${simpananFilters.jenis === 'wajib' ? 'selected' : ''}>Simpanan Wajib</option>
            <option value="khusus" ${simpananFilters.jenis === 'khusus' ? 'selected' : ''}>Simpanan Khusus</option>
            <option value="sukarela" ${simpananFilters.jenis === 'sukarela' ? 'selected' : ''}>Simpanan Sukarela</option>
          </select>
          
          <select id="filterAnggota" onchange="changeSimpananFilter('anggota', this.value)">
            <option value="semua">Semua Anggota</option>
            ${anggota.map(a => `
              <option value="${a.id}" ${simpananFilters.anggota == a.id ? 'selected' : ''}>
                ${a.nomor_anggota} - ${a.nama_lengkap}
              </option>
            `).join('')}
          </select>
          
          <input type="date" id="filterTanggalDari" value="${simpananFilters.tanggalDari}" 
                 onchange="changeSimpananFilter('tanggalDari', this.value)" 
                 placeholder="Dari Tanggal">
          
          <input type="date" id="filterTanggalSampai" value="${simpananFilters.tanggalSampai}" 
                 onchange="changeSimpananFilter('tanggalSampai', this.value)" 
                 placeholder="Sampai Tanggal">
          
          <select id="sortSimpanan" onchange="changeSimpananFilter('sortBy', this.value)">
            <option value="tanggal_transaksi" ${simpananFilters.sortBy === 'tanggal_transaksi' ? 'selected' : ''}>Tanggal</option>
            <option value="jumlah" ${simpananFilters.sortBy === 'jumlah' ? 'selected' : ''}>Jumlah</option>
            <option value="nama_lengkap" ${simpananFilters.sortBy === 'nama_lengkap' ? 'selected' : ''}>Nama Anggota</option>
          </select>
          
          <button onclick="toggleSimpananSortOrder()" class="btn btn-secondary">
            <i data-feather="${simpananFilters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}"></i>
            ${simpananFilters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
          
          <button onclick="resetSimpananFilter()" class="btn btn-warning" style="margin-left: auto;">
            <i data-feather="refresh-cw"></i> Reset
          </button>
          
          <div style="color: #666; white-space: nowrap;">
            <strong>${filteredData.length}</strong> transaksi | 
            <strong>${formatCurrency(totalJumlah)}</strong>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Jenis Simpanan</th>
              <th>No. Anggota</th>
              <th>Nama Anggota</th>
              <th>Jumlah</th>
              <th>Metode</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                  <i data-feather="inbox" style="width: 48px; height: 48px; color: #ccc;"></i>
                  <p style="margin-top: 10px; color: #999;">Tidak ada transaksi yang sesuai filter</p>
                </td>
              </tr>
            ` : filteredData.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDate(item.tanggal_transaksi)}</td>
                <td><span class="badge badge-info">${item.jenis_label}</span></td>
                <td>${item.nomor_anggota}</td>
                <td>${item.nama_lengkap}</td>
                <td><strong>${formatCurrency(item.jumlah)}</strong></td>
                <td>${item.metode_pembayaran || '-'}</td>
                <td>${item.keterangan || '-'}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editSimpanan(${item.id}, '${item.jenis_simpanan}')" title="Edit">
                      <i data-feather="edit"></i>
                      <span class="btn-text">Edit</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSimpanan(${item.id}, '${item.jenis_simpanan}')" title="Hapus">
                      <i data-feather="trash-2"></i>
                      <span class="btn-text">Hapus</span>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="cetakStruk(${item.id}, '${item.jenis_simpanan}')" title="Cetak">
                      <i data-feather="printer"></i>
                      <span class="btn-text">Cetak</span>
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

function filterSimpananData(data) {
  let filtered = [...data];
  
  // Filter by jenis
  if (simpananFilters.jenis !== 'semua') {
    filtered = filtered.filter(item => item.jenis_simpanan === simpananFilters.jenis);
  }
  
  // Filter by anggota
  if (simpananFilters.anggota !== 'semua') {
    filtered = filtered.filter(item => item.anggota_id == simpananFilters.anggota);
  }
  
  // Filter by date range
  if (simpananFilters.tanggalDari) {
    filtered = filtered.filter(item => item.tanggal_transaksi >= simpananFilters.tanggalDari);
  }
  if (simpananFilters.tanggalSampai) {
    filtered = filtered.filter(item => item.tanggal_transaksi <= simpananFilters.tanggalSampai);
  }
  
  // Sort
  filtered.sort((a, b) => {
    let aVal = a[simpananFilters.sortBy];
    let bVal = b[simpananFilters.sortBy];
    
    if (simpananFilters.sortBy === 'tanggal_transaksi') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return simpananFilters.sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return simpananFilters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return filtered;
}

window.changeSimpananFilter = async function(filterType, value) {
  simpananFilters[filterType] = value;
  const anggota = await API.get('/api/anggota');
  renderSimpananTable(anggota);
}

window.toggleSimpananSortOrder = async function() {
  simpananFilters.sortOrder = simpananFilters.sortOrder === 'asc' ? 'desc' : 'asc';
  const anggota = await API.get('/api/anggota');
  renderSimpananTable(anggota);
}

window.resetSimpananFilter = async function() {
  simpananFilters = {
    jenis: 'semua',
    anggota: 'semua',
    tanggalDari: '',
    tanggalSampai: '',
    sortBy: 'tanggal_transaksi',
    sortOrder: 'desc'
  };
  const anggota = await API.get('/api/anggota');
  renderSimpananTable(anggota);
}

// Unified Tambah Simpanan with Jenis Dropdown
window.tambahSimpananUnified = function() {
  API.get('/api/anggota').then(anggota => {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Tambah Transaksi Simpanan</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        
        <form id="tambahSimpananForm">
          <div class="form-group">
            <label>Jenis Simpanan *</label>
            <select name="jenis_simpanan" id="jenisSimpananSelect" required>
              <option value="">Pilih Jenis Simpanan</option>
              <option value="pokok">Simpanan Pokok</option>
              <option value="wajib">Simpanan Wajib</option>
              <option value="khusus">Simpanan Khusus</option>
              <option value="sukarela">Simpanan Sukarela</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Anggota *</label>
            <div id="anggotaSelectContainer"></div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Jumlah *</label>
              <input type="number" name="jumlah" required min="0" step="0.01">
            </div>
            <div class="form-group">
              <label>Tanggal Transaksi *</label>
              <input type="date" name="tanggal_transaksi" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Metode Pembayaran</label>
            <select name="metode_pembayaran">
              <option value="Tunai">Tunai</option>
              <option value="Transfer">Transfer</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
          </div>
          
          <div class="form-group" id="jenisSukarelaGroup" style="display: none;">
            <label>Jenis Transaksi</label>
            <select name="jenis">
              <option value="Setoran">Setoran</option>
              <option value="Penarikan">Penarikan</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Keterangan</label>
            <textarea name="keterangan"></textarea>
          </div>
          
          <div class="btn-group">
            <button type="submit" class="btn btn-primary">Simpan</button>
            <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize searchable select for anggota
    createSearchableAnggotaSelect('anggotaSelectContainer', 'anggota_id', true);
    
    // Show/hide jenis field for sukarela
    const jenisSimpananSelect = document.getElementById('jenisSimpananSelect');
    const jenisSukarelaGroup = document.getElementById('jenisSukarelaGroup');
    
    jenisSimpananSelect.addEventListener('change', (e) => {
      if (e.target.value === 'sukarela') {
        jenisSukarelaGroup.style.display = 'block';
      } else {
        jenisSukarelaGroup.style.display = 'none';
      }
    });
    
    document.getElementById('tambahSimpananForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      const jenis = data.jenis_simpanan;
      delete data.jenis_simpanan;
      
      // Remove jenis field if not sukarela
      if (jenis !== 'sukarela') {
        delete data.jenis;
      }
      
      const result = await API.post(`/api/simpanan/${jenis}`, data);
      alert(result.message);
      modal.remove();
      renderSimpanan();
    });
  });
};

// Keep old function for backward compatibility
window.tambahSimpanan = function(jenis) {
  tambahSimpananUnified();
};

// Edit Simpanan
window.editSimpanan = async function(id, jenis) {
  const simpanan = await API.get(`/api/simpanan/${jenis}`);
  const item = simpanan.find(s => s.id === id);
  const anggota = await API.get('/api/anggota');
  
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
            <option value="">Pilih Anggota</option>
            ${anggota.filter(a => a.status === 'aktif').map(a => `
              <option value="${a.id}" ${a.id === item.anggota_id ? 'selected' : ''}>${a.nomor_anggota} - ${a.nama_lengkap}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah *</label>
            <input type="number" name="jumlah" value="${item.jumlah}" required min="0" step="0.01">
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
          <button type="submit" class="btn btn-primary">Update</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editSimpananForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.put(`/api/simpanan/${jenis}/${id}`, data);
    alert(result.message);
    modal.remove();
    renderSimpanan();
  });
};

// Delete Simpanan
window.deleteSimpanan = async function(id, jenis) {
  const jenisLabel = {
    'pokok': 'Simpanan Pokok',
    'wajib': 'Simpanan Wajib',
    'khusus': 'Simpanan Khusus',
    'sukarela': 'Simpanan Sukarela'
  };
  
  if (confirm(`Apakah Anda yakin ingin menghapus data ${jenisLabel[jenis]} ini?`)) {
    const result = await API.delete(`/api/simpanan/${jenis}/${id}`);
    alert(result.message);
    renderSimpanan();
  }
};

// Partisipasi Anggota
window.renderPartisipasiAnggota = async function() {
  const partisipasi = await API.get('/api/partisipasi');
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Partisipasi Anggota</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportPartisipasiUnified()">
            <i data-feather="download"></i> Export
          </button>
          <button class="btn btn-secondary" onclick="cetakPartisipasiUnified()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahPartisipasi()">
            <i data-feather="plus"></i> Tambah Partisipasi
          </button>
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
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editPartisipasi(${item.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePartisipasi(${item.id})">Hapus</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.tambahPartisipasi = async function() {
  const anggota = await API.get('/api/anggota');
  const unitUsaha = await API.get('/api/unit-usaha');
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Partisipasi Anggota</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahPartisipasiForm">
        <div class="form-group">
          <label>Anggota *</label>
          <div id="anggotaSelectContainerPartisipasi"></div>
        </div>
        
        <div class="form-group">
          <label>Unit Usaha</label>
          <select name="unit_usaha_id">
            <option value="">Pilih Unit Usaha</option>
            ${unitUsaha.filter(u => u.status && u.status.toLowerCase() === 'aktif').map(u => `
              <option value="${u.id}">${u.nama_usaha}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah Transaksi *</label>
            <input type="number" name="jumlah_transaksi" required min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>Tanggal Transaksi *</label>
            <input type="date" name="tanggal_transaksi" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Keterangan</label>
          <textarea name="keterangan"></textarea>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Initialize searchable select for anggota
  createSearchableAnggotaSelect('anggotaSelectContainerPartisipasi', 'anggota_id', true);
  
  document.getElementById('tambahPartisipasiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.post('/api/partisipasi', data);
    alert(result.message);
    modal.remove();
    window.renderPartisipasiAnggota();
  });
};

// Edit Partisipasi
window.editPartisipasi = async function(id) {
  const partisipasi = await API.get('/api/partisipasi');
  const item = partisipasi.find(p => p.id === id);
  const anggota = await API.get('/api/anggota');
  const unitUsaha = await API.get('/api/unit-usaha');
  
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
            <option value="">Pilih Anggota</option>
            ${anggota.filter(a => a.status === 'aktif').map(a => `
              <option value="${a.id}" ${a.id === item.anggota_id ? 'selected' : ''}>${a.nomor_anggota} - ${a.nama_lengkap}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Unit Usaha</label>
          <select name="unit_usaha_id">
            <option value="">Pilih Unit Usaha</option>
            ${unitUsaha.filter(u => u.status && u.status.toLowerCase() === 'aktif').map(u => `
              <option value="${u.id}" ${u.id === item.unit_usaha_id ? 'selected' : ''}>${u.nama_usaha}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah Transaksi *</label>
            <input type="number" name="jumlah_transaksi" value="${item.jumlah_transaksi}" required min="0" step="0.01">
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
          <button type="submit" class="btn btn-primary">Update</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editPartisipasiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.put(`/api/partisipasi/${id}`, data);
    alert(result.message);
    modal.remove();
    window.renderPartisipasiAnggota();
  });
};

// Delete Partisipasi
window.deletePartisipasi = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus data partisipasi ini?')) {
    const result = await API.delete(`/api/partisipasi/${id}`);
    alert(result.message);
    window.renderPartisipasiAnggota();
  }
};

// Penjualan - Using pages-transaksi.js version with filter (line 638)

window.tambahPenjualan = async function() {
  try {
    const unitUsaha = await API.get('/api/unit-usaha');
    console.log('Unit Usaha loaded:', unitUsaha);
    
    if (!unitUsaha || unitUsaha.length === 0) {
      alert('Belum ada Unit Usaha. Silakan tambahkan Unit Usaha terlebih dahulu.');
      return;
    }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Penjualan</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahPenjualanForm">
        <div class="form-group">
          <label>Unit Usaha *</label>
          <select name="unit_usaha_id" required>
            <option value="">Pilih Unit Usaha</option>
            ${unitUsaha.filter(u => u.status && u.status.toLowerCase() === 'aktif').map(u => `
              <option value="${u.id}">${u.nama_usaha}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Kategori *</label>
          <select name="kategori" required>
            <option value="">Pilih Kategori</option>
            <option value="Barang">Barang</option>
            <option value="Aset">Aset</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah Penjualan *</label>
            <input type="number" name="jumlah_penjualan" required min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>HPP (Harga Pokok Penjualan)</label>
            <input type="number" name="hpp" min="0" step="0.01" value="0">
          </div>
        </div>
        
        <div class="form-group">
          <label>Tanggal Transaksi *</label>
          <input type="date" name="tanggal_transaksi" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
        
        <div class="form-group">
          <label>Keterangan</label>
          <textarea name="keterangan"></textarea>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('tambahPenjualanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.post('/api/transaksi/penjualan', data);
    alert(result.message);
    modal.remove();
    window.renderPenjualan();
  });
  } catch (error) {
    console.error('Error loading unit usaha:', error);
    alert('Gagal memuat data Unit Usaha: ' + error.message);
  }
};

// Edit Penjualan
window.editPenjualan = async function(id) {
  try {
    const penjualan = await API.get('/api/transaksi/penjualan');
    const item = penjualan.find(p => p.id === id);
    const unitUsaha = await API.get('/api/unit-usaha');
    
    if (!unitUsaha || unitUsaha.length === 0) {
      alert('Belum ada Unit Usaha. Silakan tambahkan Unit Usaha terlebih dahulu.');
      return;
    }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Penjualan</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editPenjualanForm">
        <div class="form-group">
          <label>Unit Usaha *</label>
          <select name="unit_usaha_id" required>
            <option value="">Pilih Unit Usaha</option>
            ${unitUsaha.filter(u => u.status && u.status.toLowerCase() === 'aktif').map(u => `
              <option value="${u.id}" ${u.id === item.unit_usaha_id ? 'selected' : ''}>${u.nama_usaha}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Kategori *</label>
          <select name="kategori" required>
            <option value="Barang" ${item.kategori === 'Barang' ? 'selected' : ''}>Barang</option>
            <option value="Aset" ${item.kategori === 'Aset' ? 'selected' : ''}>Aset</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah Penjualan *</label>
            <input type="number" name="jumlah_penjualan" value="${item.jumlah_penjualan}" required min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>HPP (Harga Pokok Penjualan)</label>
            <input type="number" name="hpp" value="${item.hpp || 0}" min="0" step="0.01">
          </div>
        </div>
        
        <div class="form-group">
          <label>Tanggal Transaksi *</label>
          <input type="date" name="tanggal_transaksi" value="${item.tanggal_transaksi}" required>
        </div>
        
        <div class="form-group">
          <label>Keterangan</label>
          <textarea name="keterangan">${item.keterangan || ''}</textarea>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Update</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editPenjualanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.put(`/api/transaksi/penjualan/${id}`, data);
    alert(result.message);
    modal.remove();
    window.renderPenjualan();
  });
  } catch (error) {
    console.error('Error editing penjualan:', error);
    alert('Gagal memuat data: ' + error.message);
  }
};

// Delete Penjualan
window.deletePenjualan = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus data penjualan ini?')) {
    const result = await API.delete(`/api/transaksi/penjualan/${id}`);
    alert(result.message);
    window.renderPenjualan();
  }
};

// Pengeluaran - Using pages-transaksi.js version with filter (line 787)

window.tambahPengeluaran = async function() {
  try {
    const unitUsaha = await API.get('/api/unit-usaha');
    console.log('Unit Usaha loaded:', unitUsaha);
    
    if (!unitUsaha || unitUsaha.length === 0) {
      alert('Belum ada Unit Usaha. Silakan tambahkan Unit Usaha terlebih dahulu di menu Data Unit Usaha.');
      return;
    }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Pengeluaran</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahPengeluaranForm">
        <div class="form-group">
          <label>Unit Usaha</label>
          <select name="unit_usaha_id">
            <option value="">Umum</option>
            ${unitUsaha.filter(u => u.status && u.status.toLowerCase() === 'aktif').map(u => `
              <option value="${u.id}">${u.nama_usaha}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Kategori *</label>
            <select name="kategori" required>
              <option value="">Pilih Kategori</option>
              <option value="Gaji Karyawan">Gaji Karyawan</option>
              <option value="Operasional">Operasional</option>
              <option value="Pembelian Barang">Pembelian Barang</option>
              <option value="Pembelian Aset & Inventaris">Pembelian Aset & Inventaris</option>
              <option value="Listrik & Air">Listrik & Air</option>
              <option value="Transportasi">Transportasi</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Qty (Jumlah Item) *</label>
            <input type="number" id="qtyPengeluaran" name="qty" required min="1" step="1" value="1">
          </div>
          <div class="form-group">
            <label>Harga Satuan *</label>
            <input type="number" id="hargaPengeluaran" name="harga" required min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>Total Jumlah *</label>
            <input type="number" id="jumlahPengeluaran" name="jumlah" required min="0" step="0.01" readonly style="background: #f0f0f0;">
          </div>
        </div>
        
        <div class="form-group">
          <label>Tanggal Transaksi *</label>
          <input type="date" name="tanggal_transaksi" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
        
        <div class="form-group">
          <label>Keterangan</label>
          <textarea name="keterangan"></textarea>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto-calculate jumlah
  const qtyInput = document.getElementById('qtyPengeluaran');
  const hargaInput = document.getElementById('hargaPengeluaran');
  const jumlahInput = document.getElementById('jumlahPengeluaran');
  
  function calculateJumlah() {
    const qty = parseFloat(qtyInput.value) || 0;
    const harga = parseFloat(hargaInput.value) || 0;
    jumlahInput.value = (qty * harga).toFixed(2);
  }
  
  qtyInput.addEventListener('input', calculateJumlah);
  hargaInput.addEventListener('input', calculateJumlah);
  
  document.getElementById('tambahPengeluaranForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.post('/api/transaksi/pengeluaran', data);
    alert(result.message);
    modal.remove();
    window.renderPengeluaran();
  });
  
  } catch (error) {
    console.error('Error loading unit usaha:', error);
    alert('Gagal memuat data Unit Usaha: ' + error.message);
  }
};

// Edit Pengeluaran
window.editPengeluaran = async function(id) {
  try {
    const pengeluaran = await API.get('/api/transaksi/pengeluaran');
    const item = pengeluaran.find(p => p.id === id);
    const unitUsaha = await API.get('/api/unit-usaha');
    
    if (!unitUsaha || unitUsaha.length === 0) {
      alert('Belum ada Unit Usaha. Silakan tambahkan Unit Usaha terlebih dahulu.');
      return;
    }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Pengeluaran</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editPengeluaranForm">
        <div class="form-group">
          <label>Unit Usaha</label>
          <select name="unit_usaha_id">
            <option value="">Umum</option>
            ${unitUsaha.filter(u => u.status && u.status.toLowerCase() === 'aktif').map(u => `
              <option value="${u.id}" ${u.id === item.unit_usaha_id ? 'selected' : ''}>${u.nama_usaha}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Kategori *</label>
            <select name="kategori" required>
              <option value="Gaji Karyawan" ${item.kategori === 'Gaji Karyawan' ? 'selected' : ''}>Gaji Karyawan</option>
              <option value="Operasional" ${item.kategori === 'Operasional' ? 'selected' : ''}>Operasional</option>
              <option value="Pembelian Barang" ${item.kategori === 'Pembelian Barang' ? 'selected' : ''}>Pembelian Barang</option>
              <option value="Pembelian Aset & Inventaris" ${item.kategori === 'Pembelian Aset & Inventaris' || item.kategori === 'Pembelian Aset' ? 'selected' : ''}>Pembelian Aset & Inventaris</option>
              <option value="Listrik & Air" ${item.kategori === 'Listrik & Air' ? 'selected' : ''}>Listrik & Air</option>
              <option value="Transportasi" ${item.kategori === 'Transportasi' ? 'selected' : ''}>Transportasi</option>
              <option value="Lain-lain" ${item.kategori === 'Lain-lain' ? 'selected' : ''}>Lain-lain</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Qty (Jumlah Item) *</label>
            <input type="number" id="qtyPengeluaranEdit" name="qty" value="${item.qty || 1}" required min="1" step="1">
          </div>
          <div class="form-group">
            <label>Harga Satuan *</label>
            <input type="number" id="hargaPengeluaranEdit" name="harga" value="${item.harga || (item.jumlah / (item.qty || 1))}" required min="0" step="0.01">
          </div>
          <div class="form-group">
            <label>Total Jumlah *</label>
            <input type="number" id="jumlahPengeluaranEdit" name="jumlah" value="${item.jumlah}" required min="0" step="0.01" readonly style="background: #f0f0f0;">
          </div>
        </div>
        
        <div class="form-group">
          <label>Tanggal Transaksi *</label>
          <input type="date" name="tanggal_transaksi" value="${item.tanggal_transaksi}" required>
        </div>
        
        <div class="form-group">
          <label>Keterangan</label>
          <textarea name="keterangan">${item.keterangan || ''}</textarea>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Update</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto-calculate jumlah for edit form
  const qtyInputEdit = document.getElementById('qtyPengeluaranEdit');
  const hargaInputEdit = document.getElementById('hargaPengeluaranEdit');
  const jumlahInputEdit = document.getElementById('jumlahPengeluaranEdit');
  
  function calculateJumlahEdit() {
    const qty = parseFloat(qtyInputEdit.value) || 0;
    const harga = parseFloat(hargaInputEdit.value) || 0;
    jumlahInputEdit.value = (qty * harga).toFixed(2);
  }
  
  qtyInputEdit.addEventListener('input', calculateJumlahEdit);
  hargaInputEdit.addEventListener('input', calculateJumlahEdit);
  
  document.getElementById('editPengeluaranForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.put(`/api/transaksi/pengeluaran/${id}`, data);
    alert(result.message);
    modal.remove();
    window.renderPengeluaran();
  });
  } catch (error) {
    console.error('Error editing pengeluaran:', error);
    alert('Gagal memuat data: ' + error.message);
  }
};

// Delete Pengeluaran
window.deletePengeluaran = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus data pengeluaran ini?')) {
    const result = await API.delete(`/api/transaksi/pengeluaran/${id}`);
    alert(result.message);
    window.renderPengeluaran();
  }
};

// Pendapatan Lain - Using pages-transaksi.js version

// SHU Page
window.renderSHU = async function() {
  const tahun = new Date().getFullYear();
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Sisa Hasil Usaha (SHU)</h3>
      </div>
      
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 16px; border-radius: 8px; color: white; margin-bottom: 20px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px;">📊 Formula Perhitungan SHU</h4>
        <p style="margin: 0; font-size: 13px; opacity: 0.95;">
          <strong>SHU Tahun Berjalan</strong> = Laba Kotor - Biaya Operasional<br>
          <em style="font-size: 12px;">Catatan: Pembelian Barang dan Pembelian Aset tidak termasuk dalam biaya operasional</em>
        </p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label>Tahun:</label>
        <select id="tahunSHU" style="padding: 8px; border-radius: 8px; border: 2px solid #e0e0e0; margin-left: 10px;">
          ${Array.from({length: 10}, (_, i) => tahun + 5 - i).map(y => `
            <option value="${y}" ${y === tahun ? 'selected' : ''}>${y}</option>
          `).join('')}
        </select>
        <button class="btn btn-primary" onclick="aturKomponenSHU()" style="margin-left: 10px;">Atur Komponen SHU</button>
        <button class="btn btn-success" onclick="hitungSHU()" style="margin-left: 10px;">Hitung SHU</button>
      </div>
      
      <div id="shuContent">
        <div class="loading">Memuat data SHU...</div>
      </div>
    </div>
  `;
  
  document.getElementById('tahunSHU').addEventListener('change', () => {
    loadSHUData();
  });
  
  loadSHUData();
}

async function loadSHUData() {
  const tahun = document.getElementById('tahunSHU').value;
  console.log('Loading SHU data for tahun:', tahun);
  
  // Add timestamp to prevent caching
  const timestamp = new Date().getTime();
  const komponen = await API.get(`/api/shu/komponen/${tahun}?t=${timestamp}`);
  const anggotaSHU = await API.get(`/api/shu/anggota/${tahun}?t=${timestamp}`);
  
  console.log('Loaded komponen:', komponen);
  console.log('Loaded anggotaSHU count:', anggotaSHU.length);
  
  const shuContent = document.getElementById('shuContent');
  
  if (komponen && komponen.id) {
    const totalPersentase = parseFloat(komponen.cadangan || 0) + parseFloat(komponen.jasa_simpanan || 0) + 
                           parseFloat(komponen.jasa_transaksi || 0) + parseFloat(komponen.pengurus_pengawas || 0) + 
                           parseFloat(komponen.pegawai || 0) + parseFloat(komponen.dana_pendidikan || 0) + 
                           parseFloat(komponen.dana_sosial || 0) + parseFloat(komponen.dana_pengembangan || 0);
    
    // Hitung total SHU yang dibagikan ke anggota
    const totalSHUDibagikan = anggotaSHU.reduce((sum, item) => sum + (item.total_shu || 0), 0);
    const totalSHUSimpanan = anggotaSHU.reduce((sum, item) => sum + (item.shu_simpanan || 0), 0);
    const totalSHUTransaksi = anggotaSHU.reduce((sum, item) => sum + (item.shu_transaksi || 0), 0);
    const totalAnggota = anggotaSHU.length;
    const rataSHU = totalAnggota > 0 ? totalSHUDibagikan / totalAnggota : 0;
    
    // Hitung SHU Tahun Berjalan (dari komponen.shu_tahun_berjalan atau hitung dari API)
    // Untuk sementara kita ambil dari total yang sudah dibagikan dibagi dengan persentase yang dibagikan ke anggota
    const persentaseDibagikanKeAnggota = parseFloat(komponen.jasa_simpanan || 0) + parseFloat(komponen.jasa_transaksi || 0);
    const shuTahunBerjalan = persentaseDibagikanKeAnggota > 0 ? (totalSHUDibagikan / persentaseDibagikanKeAnggota) * 100 : 0;
    
    // Hitung SHU per komponen berdasarkan persentase
    const shuCadangan = (shuTahunBerjalan * parseFloat(komponen.cadangan || 0)) / 100;
    const shuPengurusPengawas = (shuTahunBerjalan * parseFloat(komponen.pengurus_pengawas || 0)) / 100;
    const shuPegawai = (shuTahunBerjalan * parseFloat(komponen.pegawai || 0)) / 100;
    const shuDanaPendidikan = (shuTahunBerjalan * parseFloat(komponen.dana_pendidikan || 0)) / 100;
    const shuDanaSosial = (shuTahunBerjalan * parseFloat(komponen.dana_sosial || 0)) / 100;
    const shuDanaPengembangan = (shuTahunBerjalan * parseFloat(komponen.dana_pengembangan || 0)) / 100;
    
    // Total SHU = SHU yang dibagikan + semua komponen lainnya
    const totalSHUKeseluruhan = shuCadangan + totalSHUSimpanan + totalSHUTransaksi + shuPengurusPengawas + shuPegawai + shuDanaPendidikan + shuDanaSosial + shuDanaPengembangan;
    
    shuContent.innerHTML = `
      ${anggotaSHU.length > 0 ? `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div class="stat-card" style="border-left: 4px solid #FFD700;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total Anggota</div>
              <div class="stat-value" style="color: #FFD700;">${totalAnggota}</div>
              <div class="stat-label">Penerima SHU</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="users" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #667eea;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Total SHU</div>
              <div class="stat-value" style="color: #667eea;">${formatCurrency(totalSHUKeseluruhan)}</div>
              <div class="stat-label">Seluruh Komponen</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
              <i data-feather="dollar-sign" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #9B59B6;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Cadangan</div>
              <div class="stat-value" style="color: #9B59B6;">${formatCurrency(shuCadangan)}</div>
              <div class="stat-label">${komponen.cadangan}% dari SHU</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #9B59B6, #8E44AD);">
              <i data-feather="shield" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #00C9A7;">
          <div class="stat-header">
            <div>
              <div class="stat-title">SHU Simpanan</div>
              <div class="stat-value" style="color: #00C9A7;">${formatCurrency(totalSHUSimpanan)}</div>
              <div class="stat-label">Jasa Partisipasi Simpanan</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #00C9A7, #00B894);">
              <i data-feather="trending-up" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #4ECDC4;">
          <div class="stat-header">
            <div>
              <div class="stat-title">SHU Transaksi</div>
              <div class="stat-value" style="color: #4ECDC4;">${formatCurrency(totalSHUTransaksi)}</div>
              <div class="stat-label">Jasa Partisipasi Transaksi</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="shopping-cart" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #E67E22;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Pengurus & Pengawas</div>
              <div class="stat-value" style="color: #E67E22;">${formatCurrency(shuPengurusPengawas)}</div>
              <div class="stat-label">${komponen.pengurus_pengawas}% dari SHU</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #E67E22, #D35400);">
              <i data-feather="briefcase" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #3498DB;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Pegawai</div>
              <div class="stat-value" style="color: #3498DB;">${formatCurrency(shuPegawai)}</div>
              <div class="stat-label">${komponen.pegawai}% dari SHU</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #3498DB, #2980B9);">
              <i data-feather="user-check" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #1ABC9C;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Dana Pendidikan</div>
              <div class="stat-value" style="color: #1ABC9C;">${formatCurrency(shuDanaPendidikan)}</div>
              <div class="stat-label">${komponen.dana_pendidikan}% dari SHU</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #1ABC9C, #16A085);">
              <i data-feather="book-open" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #E74C3C;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Dana Sosial</div>
              <div class="stat-value" style="color: #E74C3C;">${formatCurrency(shuDanaSosial)}</div>
              <div class="stat-label">${komponen.dana_sosial}% dari SHU</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #E74C3C, #C0392B);">
              <i data-feather="heart" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card" style="border-left: 4px solid #F39C12;">
          <div class="stat-header">
            <div>
              <div class="stat-title">Dana Pengembangan</div>
              <div class="stat-value" style="color: #F39C12;">${formatCurrency(shuDanaPengembangan)}</div>
              <div class="stat-label">${komponen.dana_pengembangan}% dari SHU</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #F39C12, #E67E22);">
              <i data-feather="trending-up" style="color: white; width: 28px; height: 28px;"></i>
            </div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h4 style="color: var(--primary-green); margin: 0;">Komponen SHU Tahun ${tahun}</h4>
        <button id="btnEditKomponenSHU" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
          <i data-feather="edit-2" style="width: 16px; height: 16px;"></i> Edit Komponen
        </button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Komponen</th>
              <th>Persentase</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Cadangan</td><td>${komponen.cadangan}%</td></tr>
            <tr><td>Jasa Partisipasi Simpanan</td><td>${komponen.jasa_simpanan}%</td></tr>
            <tr><td>Jasa Partisipasi Transaksi</td><td>${komponen.jasa_transaksi}%</td></tr>
            <tr><td>SHU Pengurus & Pengawas</td><td>${komponen.pengurus_pengawas}%</td></tr>
            <tr><td>SHU Pegawai</td><td>${komponen.pegawai}%</td></tr>
            <tr><td>Dana Pendidikan</td><td>${komponen.dana_pendidikan}%</td></tr>
            <tr><td>Dana Sosial</td><td>${komponen.dana_sosial}%</td></tr>
            <tr><td>Dana Pengembangan</td><td>${komponen.dana_pengembangan}%</td></tr>
            <tr style="font-weight: bold; background: #f8f9fa;">
              <td>Total</td>
              <td>${totalPersentase}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      ${anggotaSHU.length > 0 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 30px 0 15px;">
          <h4 style="color: var(--primary-green); margin: 0;">SHU Per Anggota</h4>
          <div>
            <button class="btn btn-info" onclick="cetakSHUPerAnggota(${tahun})" style="margin-right: 10px;">
              <i data-feather="printer"></i> Cetak
            </button>
            <button class="btn btn-success" onclick="exportSHU(${tahun})" style="margin-right: 10px;">
              <i data-feather="download"></i> Export Excel
            </button>
            <button class="btn btn-danger" onclick="resetSHU(${tahun})">
              <i data-feather="refresh-cw"></i> Reset SHU
            </button>
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>No. Anggota</th>
                <th>Nama Anggota</th>
                <th>SHU Simpanan</th>
                <th>SHU Transaksi</th>
                <th>Total SHU</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${anggotaSHU.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.nomor_anggota}</td>
                  <td>${item.nama_lengkap}</td>
                  <td>${formatCurrency(item.shu_simpanan)}</td>
                  <td>${formatCurrency(item.shu_transaksi)}</td>
                  <td><strong>${formatCurrency(item.total_shu)}</strong></td>
                  <td>
                    <button class="btn btn-sm btn-info" onclick="cetakStrukSHU(${item.anggota_id}, ${tahun})">
                      <i data-feather="printer"></i> Cetak
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p style="margin-top: 20px; color: #666;">Belum ada data SHU anggota. Silakan hitung SHU terlebih dahulu.</p>'}
    `;
    feather.replace();
    
    // Attach event listener untuk tombol Edit Komponen
    const btnEdit = document.getElementById('btnEditKomponenSHU');
    if (btnEdit) {
      btnEdit.addEventListener('click', window.editKomponenSHU);
    }
  } else {
    shuContent.innerHTML = '<p style="color: #666;">Komponen SHU belum diatur untuk tahun ini. Silakan atur komponen SHU terlebih dahulu.</p>';
  }
}

window.editKomponenSHU = async function() {
  console.log('editKomponenSHU called');
  try {
    const tahun = document.getElementById('tahunSHU').value;
    console.log('Tahun:', tahun);
    const anggotaSHU = await API.get(`/api/shu/anggota/${tahun}`);
    
    // Peringatan jika SHU sudah dihitung
    if (anggotaSHU.length > 0) {
      if (!confirm('⚠️ PERINGATAN!\n\nSHU untuk tahun ini sudah dihitung dan dibagikan ke anggota.\n\nJika Anda mengubah komponen SHU, Anda perlu menghitung ulang SHU untuk menerapkan perubahan.\n\nLanjutkan edit komponen SHU?')) {
        return;
      }
    }
    
    const komponen = await API.get(`/api/shu/komponen/${tahun}`);
    console.log('Komponen data:', komponen);
    
    if (!komponen || !komponen.id) {
      alert('Komponen SHU belum diatur untuk tahun ini. Silakan atur komponen SHU terlebih dahulu menggunakan tombol "Atur Komponen SHU".');
      return;
    }
    
    console.log('Opening edit modal...');
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Komponen SHU Tahun ${tahun}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editKomponenSHUForm">
        <p style="color: #666; margin-bottom: 20px;">Masukkan persentase untuk setiap komponen (total harus 100%)</p>
        
        <div class="form-row">
          <div class="form-group">
            <label>Cadangan (%)</label>
            <input type="number" name="cadangan" value="${komponen.cadangan || 40}" step="0.01" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label>Jasa Partisipasi Simpanan (%)</label>
            <input type="number" name="jasa_simpanan" value="${komponen.jasa_simpanan || 25}" step="0.01" min="0" max="100" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jasa Partisipasi Transaksi (%)</label>
            <input type="number" name="jasa_transaksi" value="${komponen.jasa_transaksi || 15}" step="0.01" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label>SHU Pengurus & Pengawas (%)</label>
            <input type="number" name="pengurus_pengawas" value="${komponen.pengurus_pengawas || 5}" step="0.01" min="0" max="100" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>SHU Pegawai (%)</label>
            <input type="number" name="pegawai" value="${komponen.pegawai || 5}" step="0.01" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label>Dana Pendidikan (%)</label>
            <input type="number" name="dana_pendidikan" value="${komponen.dana_pendidikan || 5}" step="0.01" min="0" max="100" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Dana Sosial (%)</label>
            <input type="number" name="dana_sosial" value="${komponen.dana_sosial || 3}" step="0.01" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label>Dana Pengembangan (%)</label>
            <input type="number" name="dana_pengembangan" value="${komponen.dana_pengembangan || 2}" step="0.01" min="0" max="100" required>
          </div>
        </div>
        
        <input type="hidden" name="tahun" value="${tahun}">
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editKomponenSHUForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log('Form data:', data);
    
    // Validasi total persentase
    const total = Object.keys(data).reduce((sum, key) => {
      if (key !== 'tahun') return sum + parseFloat(data[key]);
      return sum;
    }, 0);
    console.log('Total persentase:', total);
    
    if (Math.abs(total - 100) > 0.01) {
      alert(`Total persentase harus 100%. Saat ini: ${total.toFixed(2)}%`);
      return;
    }
    
    try {
      console.log('Sending data to API:', data);
      const result = await API.post('/api/shu/komponen', data);
      console.log('API response:', result);
      alert(result.message || 'Komponen SHU berhasil diperbarui!');
      modal.remove();
      console.log('Reloading SHU data...');
      await loadSHUData();
      console.log('SHU data reloaded');
    } catch (error) {
      console.error('Error updating komponen SHU:', error);
      alert('Gagal memperbarui komponen SHU: ' + (error.message || 'Terjadi kesalahan'));
    }
  });
  } catch (error) {
    console.error('Error in editKomponenSHU:', error);
    alert('Terjadi kesalahan: ' + (error.message || 'Tidak dapat membuka form edit'));
  }
};

window.aturKomponenSHU = async function() {
  const tahun = document.getElementById('tahunSHU').value;
  const komponen = await API.get(`/api/shu/komponen/${tahun}`);
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Atur Komponen SHU Tahun ${tahun}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="komponenSHUForm">
        <p style="color: #666; margin-bottom: 20px;">Masukkan persentase untuk setiap komponen (total harus 100%)</p>
        
        <div class="form-row">
          <div class="form-group">
            <label>Cadangan (%)</label>
            <input type="number" name="cadangan" value="${komponen.cadangan || 40}" step="0.01" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label>Jasa Partisipasi Simpanan (%)</label>
            <input type="number" name="jasa_simpanan" value="${komponen.jasa_simpanan || 25}" step="0.01" min="0" max="100" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jasa Partisipasi Transaksi (%)</label>
            <input type="number" name="jasa_transaksi" value="${komponen.jasa_transaksi || 15}" step="0.01" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label>SHU Pengurus & Pengawas (%)</label>
            <input type="number" name="pengurus_pengawas" value="${komponen.pengurus_pengawas || 5}" step="0.01" min="0" max="100" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>SHU Pegawai (%)</label>
            <input type="number" name="pegawai" value="${komponen.pegawai || 5}" step="0.01" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label>Dana Pendidikan (%)</label>
            <input type="number" name="dana_pendidikan" value="${komponen.dana_pendidikan || 5}" step="0.01" min="0" max="100" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Dana Sosial (%)</label>
            <input type="number" name="dana_sosial" value="${komponen.dana_sosial || 3}" step="0.01" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label>Dana Pengembangan (%)</label>
            <input type="number" name="dana_pengembangan" value="${komponen.dana_pengembangan || 2}" step="0.01" min="0" max="100" required>
          </div>
        </div>
        
        <input type="hidden" name="tahun" value="${tahun}">
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('komponenSHUForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Validasi total persentase
    const total = Object.keys(data).reduce((sum, key) => {
      if (key !== 'tahun') return sum + parseFloat(data[key]);
      return sum;
    }, 0);
    
    if (Math.abs(total - 100) > 0.01) {
      alert(`Total persentase harus 100%. Saat ini: ${total.toFixed(2)}%`);
      return;
    }
    
    const result = await API.post('/api/shu/komponen', data);
    alert(result.message);
    modal.remove();
    loadSHUData();
  });
};

window.hitungSHU = async function() {
  const tahun = document.getElementById('tahunSHU').value;
  
  if (confirm(`Hitung SHU untuk tahun ${tahun}? Proses ini akan menghitung ulang SHU semua anggota.`)) {
    const result = await API.post(`/api/shu/hitung/${tahun}`, {});
    alert(`${result.message}\n\nSHU Tahun Berjalan: ${formatCurrency(result.keuntunganBersih)}\nTotal Anggota: ${result.totalAnggota}\n\nCatatan: SHU = Laba Kotor - Biaya Operasional\n(Pembelian Barang & Aset tidak termasuk biaya operasional)`);
    loadSHUData();
  }
};

window.resetSHU = async function(tahun) {
  if (confirm(`⚠️ PERINGATAN!\n\nApakah Anda yakin ingin mereset SHU tahun ${tahun}?\n\nSemua data SHU per anggota untuk tahun ${tahun} akan dihapus dan tidak dapat dikembalikan!\n\nKlik OK untuk melanjutkan atau Cancel untuk membatalkan.`)) {
    try {
      const result = await API.delete(`/api/shu/reset/${tahun}`);
      alert(`✅ ${result.message}\n${result.deleted} data SHU berhasil dihapus.`);
      loadSHUData();
    } catch (error) {
      alert('❌ Gagal mereset SHU: ' + error.message);
    }
  }
};

window.cetakStrukSHU = async function(anggotaId, tahun) {
  try {
    // Get data SHU anggota
    const anggotaSHU = await API.get(`/api/shu/anggota/${tahun}`);
    const shuData = anggotaSHU.find(item => item.anggota_id === anggotaId);
    
    if (!shuData) {
      alert('Data SHU tidak ditemukan');
      return;
    }
    
    // Get info koperasi
    const info = await API.get('/api/koperasi-info');
    
    // Get komponen SHU
    const komponen = await API.get(`/api/shu/komponen/${tahun}`);
    
    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk SHU - ${shuData.nama_lengkap}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 20px auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 16px;
          }
          .header p {
            margin: 2px 0;
            font-size: 11px;
          }
          .content {
            font-size: 12px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .separator {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          .total {
            font-weight: bold;
            font-size: 14px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 5px 0;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 11px;
            border-top: 2px dashed #000;
            padding-top: 10px;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${info.nama_koperasi || 'KOPERASI'}</h2>
          <p>${info.alamat || ''}</p>
          <p>Telp: ${info.nomor_telpon || '-'}</p>
        </div>
        
        <div class="content">
          <div style="text-align: center; font-weight: bold; margin: 10px 0;">
            BUKTI PEMBAGIAN SHU
          </div>
          <div style="text-align: center; margin-bottom: 10px;">
            Tahun ${tahun}
          </div>
          
          <div class="separator"></div>
          
          <div class="row">
            <span>No. Anggota</span>
            <span>${shuData.nomor_anggota}</span>
          </div>
          <div class="row">
            <span>Nama</span>
            <span>${shuData.nama_lengkap}</span>
          </div>
          
          <div class="separator"></div>
          
          <div style="font-weight: bold; margin: 10px 0;">RINCIAN SHU:</div>
          
          <div class="row">
            <span>Jasa Simpanan (${komponen.jasa_simpanan}%)</span>
            <span>Rp ${formatNumber(shuData.shu_simpanan)}</span>
          </div>
          <div class="row">
            <span>Jasa Transaksi (${komponen.jasa_transaksi}%)</span>
            <span>Rp ${formatNumber(shuData.shu_transaksi)}</span>
          </div>
          
          <div class="total">
            <div class="row">
              <span>TOTAL SHU</span>
              <span>Rp ${formatNumber(shuData.total_shu)}</span>
            </div>
          </div>
          
          <div style="margin-top: 15px; font-size: 11px; font-style: italic;">
            Terbilang: ${terbilang(shuData.total_shu)} Rupiah
          </div>
        </div>
        
        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          <p style="margin-top: 10px;">Terima kasih atas partisipasi Anda</p>
          <p style="margin-top: 20px;">
            ___________________<br>
            Pengurus Koperasi
          </p>
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
    console.error('Error cetak struk SHU:', error);
    alert('Gagal mencetak struk SHU: ' + error.message);
  }
};

// Helper function untuk format number tanpa Rp
function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num || 0);
}

// Helper function terbilang
function terbilang(angka) {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  
  if (angka < 12) return bilangan[angka];
  if (angka < 20) return terbilang(angka - 10) + ' Belas';
  if (angka < 100) return terbilang(Math.floor(angka / 10)) + ' Puluh ' + terbilang(angka % 10);
  if (angka < 200) return 'Seratus ' + terbilang(angka - 100);
  if (angka < 1000) return terbilang(Math.floor(angka / 100)) + ' Ratus ' + terbilang(angka % 100);
  if (angka < 2000) return 'Seribu ' + terbilang(angka - 1000);
  if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' Ribu ' + terbilang(angka % 1000);
  if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + ' Juta ' + terbilang(angka % 1000000);
  return terbilang(Math.floor(angka / 1000000000)) + ' Miliar ' + terbilang(angka % 1000000000);
}

// Pengumuman Page - DUPLICATE REMOVED, USING VERSION AT LINE 4969

window.exportSHU = async function(tahun) {
  try {
    const anggotaSHU = await API.get(`/api/shu/anggota/${tahun}`);
    
    if (anggotaSHU.length === 0) {
      alert('Tidak ada data SHU untuk diekspor.');
      return;
    }
    
    // Prepare CSV data
    let csv = 'No,No. Anggota,Nama Anggota,SHU Simpanan,SHU Transaksi,Total SHU\n';
    
    anggotaSHU.forEach((item, index) => {
      csv += `${index + 1},${item.nomor_anggota},"${item.nama_lengkap}",${item.shu_simpanan},${item.shu_transaksi},${item.total_shu}\n`;
    });
    
    // Calculate totals
    const totalSHUSimpanan = anggotaSHU.reduce((sum, item) => sum + item.shu_simpanan, 0);
    const totalSHUTransaksi = anggotaSHU.reduce((sum, item) => sum + item.shu_transaksi, 0);
    const grandTotal = anggotaSHU.reduce((sum, item) => sum + item.total_shu, 0);
    
    csv += `\n,,"TOTAL",${totalSHUSimpanan},${totalSHUTransaksi},${grandTotal}\n`;
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `SHU_Anggota_${tahun}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Data SHU tahun ${tahun} berhasil diekspor!\nFile: SHU_Anggota_${tahun}.csv`);
  } catch (error) {
    alert('❌ Gagal mengekspor SHU: ' + error.message);
  }
};

// Laporan
window.renderLaporan = async function() {
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Laporan Keuangan</h3>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Jenis Laporan</label>
          <select id="jenisLaporan">
            <option value="labarugi">Laporan Laba/Rugi</option>
            <option value="neraca">Neraca</option>
            <option value="aruskas">Laporan Arus Kas</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Periode</label>
          <select id="periodeLaporan">
            <option value="harian">Harian</option>
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Tahun</label>
          <select id="tahunLaporan">
            ${Array.from({length: 10}, (_, i) => new Date().getFullYear() + 5 - i).map(y => `
              <option value="${y}" ${y === new Date().getFullYear() ? 'selected' : ''}>${y}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group" id="bulanGroup">
          <label>Bulan</label>
          <select id="bulanLaporan">
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11" ${new Date().getMonth() === 10 ? 'selected' : ''}>November</option>
            <option value="12">Desember</option>
          </select>
        </div>
        
        <div class="form-group" id="tanggalGroup" style="display: none;">
          <label>Tanggal</label>
          <input type="date" id="tanggalLaporan" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      
      <div class="btn-group">
        <button class="btn btn-primary" onclick="tampilkanLaporan()">Tampilkan Laporan</button>
        <button class="btn btn-success" onclick="cetakLaporan()">Cetak PDF</button>
        <button class="btn btn-info" onclick="exportExcel()">Export Excel</button>
      </div>
      
      <div id="laporanContent" style="margin-top: 30px;"></div>
    </div>
  `;
  
  // Set current month as default
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  document.getElementById('bulanLaporan').value = currentMonth;
  
  // Handle periode change
  document.getElementById('periodeLaporan').addEventListener('change', (e) => {
    const periode = e.target.value;
    const bulanGroup = document.getElementById('bulanGroup');
    const tanggalGroup = document.getElementById('tanggalGroup');
    
    if (periode === 'harian') {
      bulanGroup.style.display = 'none';
      tanggalGroup.style.display = 'block';
    } else if (periode === 'bulanan') {
      bulanGroup.style.display = 'block';
      tanggalGroup.style.display = 'none';
    } else {
      bulanGroup.style.display = 'none';
      tanggalGroup.style.display = 'none';
    }
  });
}

window.tampilkanLaporan = async function() {
  const jenis = document.getElementById('jenisLaporan').value;
  const periode = document.getElementById('periodeLaporan').value;
  const tahun = document.getElementById('tahunLaporan').value;
  const bulan = document.getElementById('bulanLaporan').value;
  const tanggal = document.getElementById('tanggalLaporan').value;
  
  const laporanContent = document.getElementById('laporanContent');
  laporanContent.innerHTML = '<div class="loading">Memuat laporan...</div>';
  
  try {
    if (jenis === 'labarugi') {
      const penjualan = await API.get('/api/transaksi/penjualan');
      const pengeluaran = await API.get('/api/transaksi/pengeluaran');
      const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
      
      // Filter by periode
      let filteredPenjualan = penjualan;
      let filteredPengeluaran = pengeluaran;
      let filteredPendapatanLain = pendapatanLain;
      
      if (periode === 'harian' && tanggal) {
        filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi === tanggal);
        filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi === tanggal);
        filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi === tanggal);
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
      // Pembelian Barang masuk ke Persediaan di Neraca, bukan HPP
      // Pembelian Aset masuk ke Aset Tetap di Neraca
      const pengeluaranOperasional = filteredPengeluaran.filter(p => 
        p.kategori !== 'Pembelian Barang' && 
        p.kategori !== 'Pembelian Aset & Inventaris'
      );
      const totalPengeluaran = pengeluaranOperasional.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
      
      // Formula yang benar:
      // Total Pendapatan = Penjualan + Pendapatan Lain
      // Laba Kotor = Total Pendapatan - HPP (dari transaksi penjualan)
      // Laba Bersih = Laba Kotor - Pengeluaran Operasional
      const totalPendapatan = totalPenjualan + totalPendapatanLain;
      const labaKotor = totalPendapatan - totalHPP;
      const labaRugi = labaKotor - totalPengeluaran;
      
      laporanContent.innerHTML = `
        <h4 style="color: var(--primary-teal);">Laporan Laba/Rugi</h4>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Keterangan</th>
                <th style="text-align: right;">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background: #e8f5e9;">
                <td><strong>PENDAPATAN</strong></td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-left: 30px;">Penjualan</td>
                <td style="text-align: right;">${formatCurrency(totalPenjualan)}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px;">Pendapatan Lain</td>
                <td style="text-align: right;">${formatCurrency(totalPendapatanLain)}</td>
              </tr>
              <tr style="background: #e3f2fd;">
                <td><strong>Total Pendapatan</strong></td>
                <td style="text-align: right;"><strong>${formatCurrency(totalPendapatan)}</strong></td>
              </tr>
              <tr style="background: #ffebee;">
                <td><strong>HARGA POKOK PENJUALAN (HPP)</strong></td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-left: 30px;">HPP</td>
                <td style="text-align: right; color: #d32f2f;">(${formatCurrency(totalHPP)})</td>
              </tr>
              <tr style="background: #fff3e0;">
                <td><strong>LABA KOTOR</strong></td>
                <td style="text-align: right;"><strong>${formatCurrency(labaKotor)}</strong></td>
              </tr>
              <tr style="background: #ffebee;">
                <td><strong>PENGELUARAN</strong></td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-left: 30px;">Biaya Operasional</td>
                <td style="text-align: right; color: #d32f2f;">(${formatCurrency(totalPengeluaran)})</td>
              </tr>
              <tr style="background: ${labaRugi >= 0 ? '#e8f5e9' : '#ffebee'}; font-weight: bold; font-size: 16px;">
                <td><strong>${labaRugi >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}</strong></td>
                <td style="text-align: right; color: ${labaRugi >= 0 ? '#2e7d32' : '#d32f2f'};"><strong>${formatCurrency(Math.abs(labaRugi))}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
      `;
    } else if (jenis === 'neraca') {
      const simpanan = await API.get('/api/simpanan/pokok');
      const wajib = await API.get('/api/simpanan/wajib');
      const khusus = await API.get('/api/simpanan/khusus');
      const sukarela = await API.get('/api/simpanan/sukarela');
      const penjualan = await API.get('/api/transaksi/penjualan');
      const pengeluaran = await API.get('/api/transaksi/pengeluaran');
      const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
      
      // Filter simpanan by periode
      let filteredSimpanan = simpanan;
      let filteredWajib = wajib;
      let filteredKhusus = khusus;
      let filteredSukarela = sukarela;
      
      if (periode === 'harian' && tanggal) {
        filteredSimpanan = simpanan.filter(s => s.tanggal_transaksi && s.tanggal_transaksi === tanggal);
        filteredWajib = wajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi === tanggal);
        filteredKhusus = khusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi === tanggal);
        filteredSukarela = sukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi === tanggal);
      } else if (periode === 'bulanan' && bulan) {
        filteredSimpanan = simpanan.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredWajib = wajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredKhusus = khusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredSukarela = sukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
      } else if (periode === 'tahunan') {
        filteredSimpanan = simpanan.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
        filteredWajib = wajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
        filteredKhusus = khusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
        filteredSukarela = sukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
      }
      
      // Calculate simpanan sukarela with setoran (+) and penarikan (-)
      const totalSukarelaSetoran = filteredSukarela
        .filter(s => s.jenis === 'Setoran')
        .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
      const totalSukarelaPenarikan = filteredSukarela
        .filter(s => s.jenis === 'Penarikan')
        .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
      const totalSukarela = totalSukarelaSetoran - totalSukarelaPenarikan;
      
      const totalSimpananPokok = filteredSimpanan.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
      const totalSimpananWajib = filteredWajib.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
      const totalSimpananKhusus = filteredKhusus.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
      const totalSimpanan = totalSimpananPokok + totalSimpananWajib + totalSimpananKhusus + totalSukarela;
      
      // Filter transaksi by periode
      let filteredPenjualan = penjualan;
      let filteredPengeluaran = pengeluaran;
      let filteredPendapatanLain = pendapatanLain;
      
      if (periode === 'harian' && tanggal) {
        filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi === tanggal);
        filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi === tanggal);
        filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi === tanggal);
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
      
      // Hitung Biaya Operasional (exclude Pembelian Barang dan Aset)
      const biayaOperasional = filteredPengeluaran
        .filter(p => p.kategori !== 'Pembelian Barang' && p.kategori !== 'Pembelian Aset & Inventaris' && p.kategori !== 'Pembelian Aset')
        .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
      
      // Formula Laba/Rugi (dengan Pendapatan Lain)
      const totalPendapatan = totalPenjualan + totalPendapatanLain;
      const labaKotor = totalPendapatan - totalHPP;
      const labaBersih = labaKotor - biayaOperasional;
      
      // Hitung Pembelian Barang dan Pembelian Aset dari Pengeluaran
      const pembelianBarang = filteredPengeluaran
        .filter(p => p.kategori === 'Pembelian Barang')
        .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
      
      const filteredPengeluaranAset = filteredPengeluaran
        .filter(p => p.kategori === 'Pembelian Aset & Inventaris' || p.kategori === 'Pembelian Aset');
      
      const pembelianAset = filteredPengeluaranAset
        .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
      
      // Hitung Penjualan Barang dan Penjualan Aset
      const penjualanBarang = filteredPenjualan
        .filter(p => p.kategori === 'Barang' || !p.kategori)
        .reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
      
      const hppBarang = filteredPenjualan
        .filter(p => p.kategori === 'Barang' || !p.kategori)
        .reduce((sum, item) => sum + parseFloat(item.hpp || 0), 0);
      
      const penjualanAset = filteredPenjualan
        .filter(p => p.kategori === 'Aset')
        .reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
      
      // AKTIVA
      // Persediaan = Pembelian Barang - HPP Barang
      const persediaan = pembelianBarang - hppBarang;
      
      // Aktiva Tetap = Pembelian Aset - Penjualan Aset
      const aktivaTetap = pembelianAset - penjualanAset;
      
      // Kas & Bank = Total Simpanan + Laba Bersih - Persediaan - Aktiva Tetap
      // (Pendapatan Lain sudah termasuk dalam Laba Bersih)
      const kasBank = totalSimpanan + labaBersih - persediaan - aktivaTetap;
      
      const totalAktiva = kasBank + persediaan + aktivaTetap;
      
      // PASIVA & MODAL
      // Hutang Jangka Pendek = Simpanan Sukarela
      const hutangJangkaPendek = totalSukarela;
      
      // Hutang Jangka Panjang = Simpanan Khusus
      const hutangJangkaPanjang = totalSimpananKhusus;
      
      // Get Cadangan from SHU tahun sebelumnya
      const tahunSebelumnya = parseInt(tahun) - 1;
      let cadangan = 0;
      try {
        const shuSebelumnya = await API.get(`/api/shu/komponen/${tahunSebelumnya}`);
        if (shuSebelumnya && shuSebelumnya.cadangan) {
          // Hitung total SHU tahun sebelumnya
          const anggotaSHU = await API.get(`/api/shu/anggota/${tahunSebelumnya}`);
          const totalSHUSebelumnya = anggotaSHU.reduce((sum, a) => sum + parseFloat(a.total_shu || 0), 0);
          cadangan = totalSHUSebelumnya * (parseFloat(shuSebelumnya.cadangan) / 100);
        }
      } catch (error) {
        console.log('No SHU data for previous year');
      }
      
      // SHU Tahun Berjalan = Laba Bersih (sama dengan Laporan Laba/Rugi)
      const shuTahunBerjalan = labaBersih;
      
      const totalPasiva = hutangJangkaPendek + hutangJangkaPanjang + totalSimpananPokok + totalSimpananWajib + cadangan + shuTahunBerjalan;
      
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
      
      laporanContent.innerHTML = `
        <h4 style="color: var(--primary-teal);">Neraca</h4>
        <p style="text-align: center; color: #666; margin-bottom: 20px;">Per ${periodeText}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="table-container">
            <h5>AKTIVA</h5>
            <table>
              <tbody>
                <tr>
                  <td>Kas & Bank</td>
                  <td style="text-align: right;">${formatCurrency(kasBank)}</td>
                </tr>
                <tr>
                  <td>Persediaan</td>
                  <td style="text-align: right;">${formatCurrency(persediaan)}</td>
                </tr>
                <tr>
                  <td>Aktiva Tetap</td>
                  <td style="text-align: right;">${formatCurrency(aktivaTetap)}</td>
                </tr>
                <tr style="background: #f8f9fa; font-weight: bold;">
                  <td><strong>TOTAL AKTIVA</strong></td>
                  <td style="text-align: right;"><strong>${formatCurrency(totalAktiva)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="table-container">
            <h5>PASIVA</h5>
            <table>
              <tbody>
                <tr>
                  <td>Simpanan Pokok</td>
                  <td style="text-align: right;">${formatCurrency(totalSimpananPokok)}</td>
                </tr>
                <tr>
                  <td>Simpanan Wajib</td>
                  <td style="text-align: right;">${formatCurrency(totalSimpananWajib)}</td>
                </tr>
                <tr>
                  <td>Simpanan Khusus</td>
                  <td style="text-align: right;">${formatCurrency(totalSimpananKhusus)}</td>
                </tr>
                <tr>
                  <td>Simpanan Sukarela</td>
                  <td style="text-align: right;">${formatCurrency(hutangJangkaPendek)}</td>
                </tr>
                <tr>
                  <td>Cadangan</td>
                  <td style="text-align: right;">${formatCurrency(cadangan)}</td>
                </tr>
                <tr>
                  <td>SHU Tahun Berjalan</td>
                  <td style="text-align: right;">${formatCurrency(shuTahunBerjalan)}</td>
                </tr>
                <tr style="background: #f8f9fa; font-weight: bold;">
                  <td><strong>TOTAL PASIVA</strong></td>
                  <td style="text-align: right;"><strong>${formatCurrency(totalPasiva)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        ${filteredPengeluaranAset.length > 0 ? `
        <div style="margin-top: 30px;">
          <h5>Detail Aset Tetap</h5>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tanggal Perolehan</th>
                  <th>Nama Aset</th>
                  <th>Qty</th>
                  <th>Harga Satuan</th>
                  <th>Nilai Perolehan</th>
                  <th>Unit Usaha</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPengeluaranAset.map(item => {
                  const qty = item.qty || 1;
                  const harga = item.harga || (item.jumlah / qty);
                  return `
                  <tr>
                    <td>${formatDate(item.tanggal_transaksi)}</td>
                    <td>${item.keterangan || 'Aset Tetap'}</td>
                    <td style="text-align: center;">${qty}</td>
                    <td>${formatCurrency(harga)}</td>
                    <td><strong>${formatCurrency(item.jumlah || 0)}</strong></td>
                    <td>${item.nama_usaha || 'Umum'}</td>
                  </tr>
                  `;
                }).join('')}
                <tr style="background: #f8f9fa; font-weight: bold;">
                  <td colspan="2"><strong>TOTAL</strong></td>
                  <td style="text-align: center;"><strong>${filteredPengeluaranAset.reduce((sum, item) => sum + (item.qty || 1), 0)}</strong></td>
                  <td></td>
                  <td><strong>${formatCurrency(pembelianAset)}</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}
      `;
    } else if (jenis === 'aruskas') {
      // Laporan Arus Kas
      const simpananPokok = await API.get('/api/simpanan/pokok');
      const simpananWajib = await API.get('/api/simpanan/wajib');
      const simpananKhusus = await API.get('/api/simpanan/khusus');
      const simpananSukarela = await API.get('/api/simpanan/sukarela');
      const penjualan = await API.get('/api/transaksi/penjualan');
      const pengeluaran = await API.get('/api/transaksi/pengeluaran');
      const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
      const aset = await API.get('/api/aset');
      
      // Filter by periode
      let filteredSimpananPokok = simpananPokok;
      let filteredSimpananWajib = simpananWajib;
      let filteredSimpananKhusus = simpananKhusus;
      let filteredSimpananSukarela = simpananSukarela;
      let filteredPenjualan = penjualan;
      let filteredPengeluaran = pengeluaran;
      let filteredPendapatanLain = pendapatanLain;
      let filteredAset = aset;
      
      if (periode === 'harian' && tanggal) {
        filteredSimpananPokok = simpananPokok.filter(s => s.tanggal_transaksi === tanggal);
        filteredSimpananWajib = simpananWajib.filter(s => s.tanggal_transaksi === tanggal);
        filteredSimpananKhusus = simpananKhusus.filter(s => s.tanggal_transaksi === tanggal);
        filteredSimpananSukarela = simpananSukarela.filter(s => s.tanggal_transaksi === tanggal);
        filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi === tanggal);
        filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi === tanggal);
        filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi === tanggal);
        filteredAset = aset.filter(a => a.tanggal_perolehan === tanggal);
      } else if (periode === 'bulanan' && bulan) {
        filteredSimpananPokok = simpananPokok.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredSimpananWajib = simpananWajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredSimpananKhusus = simpananKhusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredSimpananSukarela = simpananSukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(`${tahun}-${bulan}`));
        filteredAset = aset.filter(a => a.tanggal_perolehan && a.tanggal_perolehan.startsWith(`${tahun}-${bulan}`));
      } else if (periode === 'tahunan') {
        filteredSimpananPokok = simpananPokok.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
        filteredSimpananWajib = simpananWajib.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
        filteredSimpananKhusus = simpananKhusus.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
        filteredSimpananSukarela = simpananSukarela.filter(s => s.tanggal_transaksi && s.tanggal_transaksi.startsWith(tahun));
        filteredPenjualan = penjualan.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
        filteredPengeluaran = pengeluaran.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
        filteredPendapatanLain = pendapatanLain.filter(p => p.tanggal_transaksi && p.tanggal_transaksi.startsWith(tahun));
        filteredAset = aset.filter(a => a.tanggal_perolehan && a.tanggal_perolehan.startsWith(tahun));
      }
      
      // AKTIVITAS OPERASIONAL
      const penerimaanPenjualan = filteredPenjualan.reduce((sum, p) => sum + parseFloat(p.jumlah_penjualan || 0), 0);
      const penerimaanPendapatanLain = filteredPendapatanLain.reduce((sum, p) => sum + parseFloat(p.jumlah || 0), 0);
      
      // Pembayaran Biaya Operasional (tanpa Pembelian Barang dan Pembelian Aset)
      const pembayaranBiayaOperasional = filteredPengeluaran
        .filter(p => p.kategori !== 'Pembelian Barang' && p.kategori !== 'Pembelian Aset & Inventaris' && p.kategori !== 'Pembelian Aset')
        .reduce((sum, p) => sum + parseFloat(p.jumlah || 0), 0);
      
      const pembayaranHPP = filteredPenjualan.reduce((sum, p) => sum + parseFloat(p.hpp || 0), 0);
      
      const kasOperasional = penerimaanPenjualan + penerimaanPendapatanLain - pembayaranBiayaOperasional - pembayaranHPP;
      
      // AKTIVITAS INVESTASI
      // Pembelian Barang
      const pembelianBarang = filteredPengeluaran
        .filter(p => p.kategori === 'Pembelian Barang')
        .reduce((sum, p) => sum + parseFloat(p.jumlah || 0), 0);
      
      // HPP Barang (barang yang sudah terjual)
      const hppBarang = filteredPenjualan
        .filter(p => p.kategori === 'Barang' || !p.kategori)
        .reduce((sum, p) => sum + parseFloat(p.hpp || 0), 0);
      
      // Persediaan = Pembelian Barang - HPP Barang
      const persediaanBarang = pembelianBarang - hppBarang;
      
      // Pembelian Aset (masuk ke Aktiva Tetap)
      const pembelianAset = filteredPengeluaran
        .filter(p => p.kategori === 'Pembelian Aset & Inventaris' || p.kategori === 'Pembelian Aset')
        .reduce((sum, p) => sum + parseFloat(p.jumlah || 0), 0);
      
      const kasInvestasi = -(persediaanBarang + pembelianAset); // Negatif karena pengeluaran
      
      // AKTIVITAS PENDANAAN
      const penerimaanSimpananPokok = filteredSimpananPokok.reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
      const penerimaanSimpananWajib = filteredSimpananWajib.reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
      const penerimaanSimpananKhusus = filteredSimpananKhusus.reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
      
      // Simpanan Sukarela: Setoran (+) Penarikan (-)
      const setoran = filteredSimpananSukarela.filter(s => s.jenis === 'Setoran').reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
      const penarikan = filteredSimpananSukarela.filter(s => s.jenis === 'Penarikan').reduce((sum, s) => sum + parseFloat(s.jumlah || 0), 0);
      const penerimaanSimpananSukarela = setoran - penarikan;
      
      const kasPendanaan = penerimaanSimpananPokok + penerimaanSimpananWajib + penerimaanSimpananKhusus + penerimaanSimpananSukarela;
      
      // TOTAL KAS
      const kenaikanKas = kasOperasional + kasInvestasi + kasPendanaan;
      
      // Kas Awal (dari periode sebelumnya - simplified: 0 untuk demo)
      const kasAwal = 0;
      const kasAkhir = kasAwal + kenaikanKas;
      
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
      
      laporanContent.innerHTML = `
        <h4 style="color: var(--primary-teal);">Laporan Arus Kas</h4>
        <p style="text-align: center; color: #666; margin-bottom: 20px;">Periode ${periodeText}</p>
        
        <div class="table-container">
          <table>
            <tbody>
              <!-- AKTIVITAS OPERASIONAL -->
              <tr style="background: #e3f2fd;">
                <td colspan="2"><strong>AKTIVITAS OPERASIONAL</strong></td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Penerimaan dari Penjualan</td>
                <td style="text-align: right;">${formatCurrency(penerimaanPenjualan)}</td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Penerimaan Pendapatan Lain</td>
                <td style="text-align: right;">${formatCurrency(penerimaanPendapatanLain)}</td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Pembayaran untuk HPP</td>
                <td style="text-align: right; color: #d32f2f;">(${formatCurrency(pembayaranHPP)})</td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Pembayaran Biaya Operasional</td>
                <td style="text-align: right; color: #d32f2f;">(${formatCurrency(pembayaranBiayaOperasional)})</td>
              </tr>
              <tr style="background: #fff3e0; font-weight: bold;">
                <td style="padding-left: 40px;"><strong>Kas Bersih dari Aktivitas Operasional</strong></td>
                <td style="text-align: right; color: ${kasOperasional >= 0 ? '#2e7d32' : '#d32f2f'};"><strong>${formatCurrency(kasOperasional)}</strong></td>
              </tr>
              
              <!-- AKTIVITAS INVESTASI -->
              <tr style="background: #e8f5e9;">
                <td colspan="2"><strong>AKTIVITAS INVESTASI</strong></td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Pembelian Barang</td>
                <td style="text-align: right; color: #d32f2f;">(${formatCurrency(pembelianBarang)})</td>
              </tr>
              <tr>
                <td style="padding-left: 40px; font-size: 13px; color: #666;">Dikurangi: HPP Barang Terjual</td>
                <td style="text-align: right; font-size: 13px; color: #2e7d32;">${formatCurrency(hppBarang)}</td>
              </tr>
              <tr>
                <td style="padding-left: 40px; font-style: italic;">Persediaan Barang</td>
                <td style="text-align: right; color: #d32f2f;">(${formatCurrency(persediaanBarang)})</td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Pembelian Aset Tetap</td>
                <td style="text-align: right; color: #d32f2f;">(${formatCurrency(pembelianAset)})</td>
              </tr>
              <tr style="background: #fff3e0; font-weight: bold;">
                <td style="padding-left: 40px;"><strong>Kas Bersih dari Aktivitas Investasi</strong></td>
                <td style="text-align: right; color: ${kasInvestasi >= 0 ? '#2e7d32' : '#d32f2f'};"><strong>${formatCurrency(kasInvestasi)}</strong></td>
              </tr>
              
              <!-- AKTIVITAS PENDANAAN -->
              <tr style="background: #fce4ec;">
                <td colspan="2"><strong>AKTIVITAS PENDANAAN</strong></td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Penerimaan Simpanan Pokok</td>
                <td style="text-align: right;">${formatCurrency(penerimaanSimpananPokok)}</td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Penerimaan Simpanan Wajib</td>
                <td style="text-align: right;">${formatCurrency(penerimaanSimpananWajib)}</td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Penerimaan Simpanan Khusus</td>
                <td style="text-align: right;">${formatCurrency(penerimaanSimpananKhusus)}</td>
              </tr>
              <tr>
                <td style="padding-left: 20px;">Penerimaan Simpanan Sukarela (Bersih)</td>
                <td style="text-align: right; ${penerimaanSimpananSukarela < 0 ? 'color: #d32f2f;' : ''}">${penerimaanSimpananSukarela >= 0 ? formatCurrency(penerimaanSimpananSukarela) : '(' + formatCurrency(Math.abs(penerimaanSimpananSukarela)) + ')'}</td>
              </tr>
              <tr style="background: #fff3e0; font-weight: bold;">
                <td style="padding-left: 40px;"><strong>Kas Bersih dari Aktivitas Pendanaan</strong></td>
                <td style="text-align: right; color: ${kasPendanaan >= 0 ? '#2e7d32' : '#d32f2f'};"><strong>${formatCurrency(kasPendanaan)}</strong></td>
              </tr>
              
              <!-- TOTAL -->
              <tr style="background: #f5f5f5; font-weight: bold; font-size: 15px;">
                <td><strong>KENAIKAN (PENURUNAN) KAS</strong></td>
                <td style="text-align: right; color: ${kenaikanKas >= 0 ? '#2e7d32' : '#d32f2f'};"><strong>${formatCurrency(kenaikanKas)}</strong></td>
              </tr>
              <tr>
                <td><strong>KAS AWAL PERIODE</strong></td>
                <td style="text-align: right;"><strong>${formatCurrency(kasAwal)}</strong></td>
              </tr>
              <tr style="background: #e8f5e9; font-weight: bold; font-size: 16px;">
                <td><strong>KAS AKHIR PERIODE</strong></td>
                <td style="text-align: right; color: #2e7d32;"><strong>${formatCurrency(kasAkhir)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }
    
    feather.replace();
  } catch (error) {
    laporanContent.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
  }
};

// Pengaturan
window.renderPengaturan = async function() {
  const users = await API.get('/api/users');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Cek apakah user adalah kasir
  const isKasir = currentUser.role === 'Kasir';
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Manajemen User</h3>
        ${!isKasir ? `<button class="btn btn-primary" onclick="tambahUser()"><i data-feather="plus"></i> Tambah User</button>` : ''}
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Username</th>
              <th>Nama Lengkap</th>
              <th>Role</th>
              <th>Hak Akses</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${item.username}</strong></td>
                <td>${item.nama_lengkap}</td>
                <td><span class="badge badge-info">${item.role}</span></td>
                <td>${item.hak_akses || 'all'}</td>
                <td><span class="badge badge-${item.status === 'aktif' ? 'success' : 'danger'}">${item.status}</span></td>
                <td>
                  <div class="btn-group">
                    ${!isKasir ? `<button class="btn btn-sm btn-warning" onclick="editUser(${item.id})"><i data-feather="edit"></i> Edit</button>` : ''}
                    ${!isKasir && item.id !== 1 ? `<button class="btn btn-sm btn-danger" onclick="hapusUser(${item.id})"><i data-feather="trash-2"></i> Hapus</button>` : ''}
                    ${isKasir ? '<span class="badge badge-warning">Akses Terbatas</span>' : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.tambahUser = function() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Cek apakah user adalah kasir
  if (currentUser.role === 'Kasir') {
    alert('Anda tidak memiliki akses untuk menambah user');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Tambah User</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahUserForm">
        <div class="form-row">
          <div class="form-group">
            <label>Username *</label>
            <input type="text" name="username" required>
          </div>
          <div class="form-group">
            <label>Password *</label>
            <input type="password" name="password" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Nama Lengkap *</label>
          <input type="text" name="nama_lengkap" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Role *</label>
            <select name="role" required>
              <option value="Admin">Admin</option>
              <option value="Pengurus">Pengurus</option>
              <option value="Pengawas">Pengawas</option>
              <option value="Kasir">Kasir</option>
            </select>
          </div>
          <div class="form-group">
            <label>Hak Akses</label>
            <input type="text" name="hak_akses" value="all" placeholder="all atau pisahkan dengan koma">
          </div>
        </div>
        
        <div class="form-group">
          <label>Foto</label>
          <input type="file" name="foto" accept="image/*">
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('tambahUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('User berhasil ditambahkan');
        modal.remove();
        window.renderPengaturan();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

window.hapusUser = async function(id) {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Cek apakah user adalah kasir
  if (currentUser.role === 'Kasir') {
    alert('Anda tidak memiliki akses untuk menghapus user');
    return;
  }
  
  if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
    const result = await API.delete(`/api/users/${id}`);
    alert(result.message);
    window.renderPengaturan();
  }
};

// Detail Anggota
window.detailAnggota = async function(id) {
  const anggota = await API.get(`/api/anggota/${id}`);
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Detail Anggota</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        ${anggota.foto ? `<img src="/uploads/${anggota.foto}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 4px solid var(--primary-green);">` : '<div style="width: 120px; height: 120px; background: #f0f0f0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 48px;">👤</div>'}
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Nomor Anggota</label>
          <p><strong>${anggota.nomor_anggota}</strong></p>
        </div>
        <div class="form-group">
          <label>Nama Lengkap</label>
          <p><strong>${anggota.nama_lengkap}</strong></p>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>NIK</label>
          <p>${anggota.nik || '-'}</p>
        </div>
        <div class="form-group">
          <label>Jenis Kelamin</label>
          <p>${anggota.jenis_kelamin || '-'}</p>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Tempat, Tanggal Lahir</label>
          <p>${anggota.tempat_lahir || '-'}, ${formatDate(anggota.tanggal_lahir)}</p>
        </div>
        <div class="form-group">
          <label>Pekerjaan</label>
          <p>${anggota.pekerjaan || '-'}</p>
        </div>
      </div>
      
      <div class="form-group">
        <label>Alamat</label>
        <p>${anggota.alamat || '-'}</p>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Nomor Telepon</label>
          <p>${anggota.nomor_telpon || '-'}</p>
        </div>
        <div class="form-group">
          <label>Email</label>
          <p>${anggota.email || '-'}</p>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Tanggal Bergabung</label>
          <p>${formatDate(anggota.tanggal_bergabung)}</p>
        </div>
        <div class="form-group">
          <label>Status</label>
          <p><span class="badge badge-${anggota.status === 'aktif' ? 'success' : 'danger'}">${anggota.status}</span></p>
        </div>
      </div>
      
      <div class="btn-group" style="margin-top: 20px;">
        <button class="btn btn-warning" onclick="this.closest('.modal').remove(); editAnggota(${id});">Edit</button>
        <button class="btn btn-danger" onclick="this.closest('.modal').remove()">Tutup</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

// Edit Anggota
window.editAnggota = async function(id) {
  const anggota = await API.get(`/api/anggota/${id}`);
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Anggota</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editAnggotaForm">
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Anggota *</label>
            <input type="text" name="nomor_anggota" value="${anggota.nomor_anggota}" required>
          </div>
          <div class="form-group">
            <label>Nama Lengkap *</label>
            <input type="text" name="nama_lengkap" value="${anggota.nama_lengkap}" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>NIK</label>
            <input type="text" name="nik" value="${anggota.nik || ''}">
          </div>
          <div class="form-group">
            <label>Jenis Kelamin</label>
            <select name="jenis_kelamin">
              <option value="">Pilih</option>
              <option value="Laki-laki" ${anggota.jenis_kelamin === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
              <option value="Perempuan" ${anggota.jenis_kelamin === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Tempat Lahir</label>
            <input type="text" name="tempat_lahir" value="${anggota.tempat_lahir || ''}">
          </div>
          <div class="form-group">
            <label>Tanggal Lahir</label>
            <input type="date" name="tanggal_lahir" value="${anggota.tanggal_lahir || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label>Alamat</label>
          <textarea name="alamat">${anggota.alamat || ''}</textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Telepon</label>
            <input type="text" name="nomor_telpon" value="${anggota.nomor_telpon || ''}">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" value="${anggota.email || ''}">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Username</label>
            <input type="text" name="username" value="${anggota.username || ''}">
          </div>
          <div class="form-group">
            <label>Password (kosongkan jika tidak diubah)</label>
            <input type="password" name="password" placeholder="Kosongkan jika tidak diubah">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Pekerjaan</label>
            <input type="text" name="pekerjaan" value="${anggota.pekerjaan || ''}">
          </div>
          <div class="form-group">
            <label>Tanggal Bergabung</label>
            <input type="date" name="tanggal_bergabung" value="${anggota.tanggal_bergabung || ''}">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <select name="status">
              <option value="aktif" ${anggota.status === 'aktif' ? 'selected' : ''}>Aktif</option>
              <option value="nonaktif" ${anggota.status === 'nonaktif' ? 'selected' : ''}>Non-Aktif</option>
            </select>
          </div>
          <div class="form-group">
            <label>Foto</label>
            <input type="file" name="foto" accept="image/*">
          </div>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editAnggotaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`/api/anggota/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Anggota berhasil diupdate');
        modal.remove();
        window.renderDataAnggota();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

// Edit Unit Usaha - Moved to pages-extended.js

// Edit User
window.editUser = async function(id) {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Cek apakah user adalah kasir
  if (currentUser.role === 'Kasir') {
    alert('Anda tidak memiliki akses untuk mengedit user');
    return;
  }
  
  const users = await API.get('/api/users');
  const user = users.find(u => u.id === id);
  
  if (!user) {
    alert('Data tidak ditemukan');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit User</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editUserForm">
        <div class="form-row">
          <div class="form-group">
            <label>Username *</label>
            <input type="text" name="username" value="${user.username}" required>
          </div>
          <div class="form-group">
            <label>Password (kosongkan jika tidak diubah)</label>
            <input type="password" name="password">
          </div>
        </div>
        
        <div class="form-group">
          <label>Nama Lengkap *</label>
          <input type="text" name="nama_lengkap" value="${user.nama_lengkap}" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Role *</label>
            <select name="role" required>
              <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
              <option value="Pengurus" ${user.role === 'Pengurus' ? 'selected' : ''}>Pengurus</option>
              <option value="Pengawas" ${user.role === 'Pengawas' ? 'selected' : ''}>Pengawas</option>
              <option value="Kasir" ${user.role === 'Kasir' ? 'selected' : ''}>Kasir</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select name="status">
              <option value="aktif" ${user.status === 'aktif' ? 'selected' : ''}>Aktif</option>
              <option value="nonaktif" ${user.status === 'nonaktif' ? 'selected' : ''}>Non-Aktif</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label>Hak Akses</label>
          <input type="text" name="hak_akses" value="${user.hak_akses || 'all'}" placeholder="all atau pisahkan dengan koma">
        </div>
        
        <div class="form-group">
          <label>Foto</label>
          <input type="file" name="foto" accept="image/*">
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('User berhasil diupdate');
        modal.remove();
        window.renderPengaturan();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};







// Debug: Log fungsi yang tersedia
console.log('pages.js loaded');
console.log('Available render functions:');
console.log('- renderBeranda:', typeof window.renderBeranda);
console.log('- renderInfoKoperasi:', typeof window.renderInfoKoperasi);
console.log('- renderUnitUsaha:', typeof window.renderUnitUsaha);
console.log('- renderAsetInventaris:', typeof window.renderAsetInventaris);
console.log('- renderDataAnggota:', typeof window.renderDataAnggota);
console.log('- renderDataPengurus:', typeof window.renderDataPengurus);
console.log('- renderDataKaryawan:', typeof window.renderDataKaryawan);
console.log('- renderSimpanan:', typeof window.renderSimpanan);
console.log('- renderPartisipasiAnggota:', typeof window.renderPartisipasiAnggota);
console.log('- renderPenjualan:', typeof window.renderPenjualan);
console.log('- renderPengeluaran:', typeof window.renderPengeluaran);
console.log('- renderSHU:', typeof window.renderSHU);
console.log('- renderLaporan:', typeof window.renderLaporan);
console.log('- renderPengaturan:', typeof window.renderPengaturan);

// Tambah Pendapatan Lain
window.tambahPendapatanLain = async function() {
  try {
    const unitUsaha = await API.get('/api/unit-usaha');
    
    if (!unitUsaha || unitUsaha.length === 0) {
      alert('Belum ada Unit Usaha. Silakan tambahkan Unit Usaha terlebih dahulu di menu Data Unit Usaha.');
      return;
    }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Pendapatan Lain</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahPendapatanLainForm">
        <div class="form-group">
          <label>Unit Usaha</label>
          <select name="unit_usaha_id">
            <option value="">Umum</option>
            ${unitUsaha.filter(u => u.status && u.status.toLowerCase() === 'aktif').map(u => `
              <option value="${u.id}">${u.nama_usaha}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Kategori *</label>
            <select name="kategori" required>
              <option value="">Pilih Kategori</option>
              <option value="Bunga Bank">Bunga Bank</option>
              <option value="Sewa Aset">Sewa Aset</option>
              <option value="Jasa Konsultasi">Jasa Konsultasi</option>
              <option value="Komisi">Komisi</option>
              <option value="Hibah">Hibah</option>
              <option value="Donasi">Donasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div class="form-group">
            <label>Jumlah *</label>
            <input type="number" name="jumlah" required min="0" step="0.01" placeholder="0">
          </div>
        </div>
        
        <div class="form-group">
          <label>Tanggal Transaksi *</label>
          <input type="date" name="tanggal_transaksi" required value="${new Date().toISOString().split('T')[0]}">
        </div>
        
        <div class="form-group">
          <label>Keterangan</label>
          <textarea name="keterangan" rows="3" placeholder="Keterangan tambahan (opsional)"></textarea>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('tambahPendapatanLainForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.post('/api/transaksi/pendapatan-lain', data);
    alert(result.message);
    modal.remove();
    window.renderPendapatanLain();
  });
  } catch (error) {
    console.error('Error loading unit usaha:', error);
    alert('Gagal memuat data Unit Usaha: ' + error.message);
  }
};

// Edit Pendapatan Lain
window.editPendapatanLain = async function(id) {
  try {
    const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
    const item = pendapatanLain.find(p => p.id === id);
    const unitUsaha = await API.get('/api/unit-usaha');
    
    if (!unitUsaha || unitUsaha.length === 0) {
      alert('Belum ada Unit Usaha. Silakan tambahkan Unit Usaha terlebih dahulu.');
      return;
    }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Pendapatan Lain</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editPendapatanLainForm">
        <div class="form-group">
          <label>Unit Usaha</label>
          <select name="unit_usaha_id">
            <option value="">Umum</option>
            ${unitUsaha.filter(u => u.status && u.status.toLowerCase() === 'aktif').map(u => `
              <option value="${u.id}" ${u.id === item.unit_usaha_id ? 'selected' : ''}>${u.nama_usaha}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Kategori *</label>
            <select name="kategori" required>
              <option value="Bunga Bank" ${item.kategori === 'Bunga Bank' ? 'selected' : ''}>Bunga Bank</option>
              <option value="Sewa Aset" ${item.kategori === 'Sewa Aset' ? 'selected' : ''}>Sewa Aset</option>
              <option value="Jasa Konsultasi" ${item.kategori === 'Jasa Konsultasi' ? 'selected' : ''}>Jasa Konsultasi</option>
              <option value="Komisi" ${item.kategori === 'Komisi' ? 'selected' : ''}>Komisi</option>
              <option value="Hibah" ${item.kategori === 'Hibah' ? 'selected' : ''}>Hibah</option>
              <option value="Donasi" ${item.kategori === 'Donasi' ? 'selected' : ''}>Donasi</option>
              <option value="Lainnya" ${item.kategori === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
            </select>
          </div>
          <div class="form-group">
            <label>Jumlah *</label>
            <input type="number" name="jumlah" value="${item.jumlah}" required min="0" step="0.01">
          </div>
        </div>
        
        <div class="form-group">
          <label>Tanggal Transaksi *</label>
          <input type="date" name="tanggal_transaksi" value="${item.tanggal_transaksi}" required>
        </div>
        
        <div class="form-group">
          <label>Keterangan</label>
          <textarea name="keterangan" rows="3">${item.keterangan || ''}</textarea>
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Update</button>
          <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('editPendapatanLainForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.put(`/api/transaksi/pendapatan-lain/${id}`, data);
    alert(result.message);
    modal.remove();
    window.renderPendapatanLain();
  });
  } catch (error) {
    console.error('Error editing pendapatan lain:', error);
    alert('Gagal memuat data: ' + error.message);
  }
};

// Delete Pendapatan Lain
window.deletePendapatanLain = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus data pendapatan lain ini?')) {
    const result = await API.delete(`/api/transaksi/pendapatan-lain/${id}`);
    alert(result.message);
    window.renderPendapatanLain();
  }
};



// Render Profil User
window.renderProfil = async function() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  contentArea.innerHTML = `
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-photo-container">
          ${user.foto ? `
            <img src="${user.foto}" alt="Foto Profil" class="profile-photo" id="profilePhoto">
          ` : `
            <div class="profile-photo-placeholder" id="profilePhotoPlaceholder">
              ${user.nama_lengkap ? user.nama_lengkap.charAt(0).toUpperCase() : 'U'}
            </div>
          `}
          <label class="profile-photo-upload" for="photoUpload">
            <i data-feather="camera"></i>
            <input type="file" id="photoUpload" accept="image/*">
          </label>
        </div>
        <div class="profile-info">
          <h2>${user.nama_lengkap || 'User'}</h2>
          <p>${user.role || 'User'} • ${user.username || ''}</p>
        </div>
      </div>
      
      <div class="profile-content">
        <div class="profile-card">
          <h3>
            <i data-feather="user"></i>
            Informasi Akun
          </h3>
          <div class="info-row">
            <span class="info-label">Username</span>
            <span class="info-value">${user.username || '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Nama Lengkap</span>
            <span class="info-value">${user.nama_lengkap || '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Role</span>
            <span class="info-value">${user.role || '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" style="color: var(--success);">● Aktif</span>
          </div>
        </div>
        
        <div class="profile-card">
          <h3>
            <i data-feather="lock"></i>
            Ganti Password
          </h3>
          <form class="password-form" id="changePasswordForm">
            <div class="form-group">
              <label>Password Lama</label>
              <input type="password" id="oldPassword" required>
            </div>
            <div class="form-group">
              <label>Password Baru</label>
              <input type="password" id="newPassword" required minlength="6">
            </div>
            <div class="form-group">
              <label>Konfirmasi Password Baru</label>
              <input type="password" id="confirmPassword" required minlength="6">
            </div>
            <div class="password-requirements">
              <strong>Persyaratan Password:</strong>
              <ul>
                <li>Minimal 6 karakter</li>
                <li>Kombinasi huruf dan angka (recommended)</li>
                <li>Hindari password yang mudah ditebak</li>
              </ul>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
              <i data-feather="save"></i> Ganti Password
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
  
  feather.replace();
  
  // Handle photo upload
  document.getElementById('photoUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB!');
      return;
    }
    
    const formData = new FormData();
    formData.append('foto', file);
    
    try {
      const response = await API.uploadFile('/api/users/upload-photo', formData);
      
      if (response.success) {
        alert('Foto profil berhasil diupdate!');
        
        // Update user data in localStorage
        user.foto = response.foto;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update header user photo
        const userPhoto = document.getElementById('userPhoto');
        const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
        if (userPhoto) {
          userPhoto.src = response.foto;
          userPhoto.style.display = 'block';
          if (userAvatarPlaceholder) userAvatarPlaceholder.style.display = 'none';
        }
        
        // Reload page
        renderProfil();
      } else {
        alert('Gagal upload foto: ' + response.message);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Terjadi kesalahan saat upload foto');
    }
  });
  
  // Handle password change
  document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate
    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password baru minimal 6 karakter!');
      return;
    }
    
    try {
      const response = await API.post('/api/users/change-password', {
        oldPassword,
        newPassword
      });
      
      if (response.success) {
        alert('Password berhasil diubah!');
        document.getElementById('changePasswordForm').reset();
      } else {
        alert('Gagal ubah password: ' + response.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Terjadi kesalahan saat mengubah password');
    }
  });
};

// Function to update sidebar logo koperasi (NOT user photo)
// This function is only used when uploading logo koperasi from Info Koperasi page
function updateSidebarLogo(logoUrl) {
  const sidebarLogo = document.getElementById('sidebarLogo');
  const logoPlaceholder = document.getElementById('logoPlaceholder');
  
  if (logoUrl) {
    sidebarLogo.src = logoUrl;
    sidebarLogo.style.display = 'block';
    if (logoPlaceholder) logoPlaceholder.style.display = 'none';
  }
}


// ===== PENGUMUMAN PAGE =====
window.renderPengumuman = async function() {
  try {
    const pengumuman = await API.get('/api/pengumuman');
    
    contentArea.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i data-feather="megaphone"></i>
            Kelola Pengumuman
          </h3>
          <button class="btn btn-primary" onclick="tambahPengumuman()">
            <i data-feather="plus"></i> Tambah Pengumuman
          </button>
        </div>
        
        <div class="card-body">
          ${pengumuman.length === 0 ? `
            <div class="empty-state">
              <i data-feather="megaphone"></i>
              <h3>Belum Ada Pengumuman</h3>
              <p>Klik tombol "Tambah Pengumuman" untuk membuat pengumuman baru</p>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Gambar</th>
                    <th>Judul</th>
                    <th>Konten</th>
                    <th>Status</th>
                    <th>Periode</th>
                    <th>Urutan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${pengumuman.map(item => `
                    <tr>
                      <td>
                        <img src="/uploads/${item.gambar}" alt="${item.judul}" 
                             style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;">
                      </td>
                      <td><strong>${item.judul}</strong></td>
                      <td>${item.konten ? (item.konten.length > 50 ? item.konten.substring(0, 50) + '...' : item.konten) : '-'}</td>
                      <td>
                        <span class="badge badge-${item.status === 'aktif' ? 'success' : 'secondary'}">
                          ${item.status}
                        </span>
                      </td>
                      <td>
                        ${item.tanggal_mulai ? formatDate(item.tanggal_mulai) : '-'}<br>
                        ${item.tanggal_selesai ? 's/d ' + formatDate(item.tanggal_selesai) : ''}
                      </td>
                      <td>${item.urutan}</td>
                      <td>
                        <div class="btn-group">
                          <button class="btn btn-sm btn-warning" onclick="editPengumuman(${item.id})">
                            <i data-feather="edit"></i>
                          </button>
                          <button class="btn btn-sm btn-danger" onclick="hapusPengumuman(${item.id}, '${item.judul}')">
                            <i data-feather="trash-2"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
    
    feather.replace();
  } catch (error) {
    console.error('Error loading pengumuman:', error);
    contentArea.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="error-message">
            <p>Gagal memuat data pengumuman: ${error.message}</p>
          </div>
        </div>
      </div>
    `;
  }
};

// Tambah Pengumuman
window.tambahPengumuman = function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Pengumuman</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="formPengumuman" enctype="multipart/form-data">
        <div class="form-group">
          <label>Judul Pengumuman *</label>
          <input type="text" name="judul" required>
        </div>
        
        <div class="form-group">
          <label>Konten</label>
          <textarea name="konten" rows="3" placeholder="Isi konten pengumuman (opsional)"></textarea>
        </div>
        
        <div class="form-group">
          <label>Gambar Banner *</label>
          <input type="file" name="gambar" accept="image/*" required>
          <small style="color: #666;">Format: JPG, PNG, GIF. Maksimal 5MB. Rekomendasi ukuran: 1200x400px</small>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Status</label>
            <select name="status">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Urutan</label>
            <input type="number" name="urutan" value="0" min="0">
            <small style="color: #666;">Urutan tampilan (0 = paling atas)</small>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Tanggal Mulai</label>
            <input type="date" name="tanggal_mulai">
          </div>
          
          <div class="form-group">
            <label>Tanggal Selesai</label>
            <input type="date" name="tanggal_selesai">
          </div>
        </div>
        
        <div class="form-group">
          <label style="display: block; margin-bottom: 8px;">Opsi Tampilan</label>
          <div style="display: flex; gap: 20px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" name="tampilkan_judul" value="1" checked style="width: auto; cursor: pointer;">
              <span>Tampilkan Judul</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" name="tampilkan_konten" value="1" checked style="width: auto; cursor: pointer;">
              <span>Tampilkan Konten</span>
            </label>
          </div>
          <small style="color: #666;">Centang untuk menampilkan judul/konten di banner</small>
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
  
  document.getElementById('formPengumuman').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Handle checkbox values
    const tampilkanJudul = e.target.querySelector('input[name="tampilkan_judul"]').checked;
    const tampilkanKonten = e.target.querySelector('input[name="tampilkan_konten"]').checked;
    
    formData.set('tampilkan_judul', tampilkanJudul ? '1' : '0');
    formData.set('tampilkan_konten', tampilkanKonten ? '1' : '0');
    
    try {
      const response = await fetch('/api/pengumuman', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Pengumuman berhasil ditambahkan!');
        modal.remove();
        renderPengumuman();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message);
    }
  });
};

// Edit Pengumuman
window.editPengumuman = async function(id) {
  try {
    const pengumuman = await API.get(`/api/pengumuman/${id}`);
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">Edit Pengumuman</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        
        <form id="formEditPengumuman" enctype="multipart/form-data">
          <div class="form-group">
            <label>Judul Pengumuman *</label>
            <input type="text" name="judul" value="${pengumuman.judul}" required>
          </div>
          
          <div class="form-group">
            <label>Konten</label>
            <textarea name="konten" rows="3">${pengumuman.konten || ''}</textarea>
          </div>
          
          <div class="form-group">
            <label>Gambar Banner</label>
            <input type="file" name="gambar" accept="image/*">
            <small style="color: #666;">
              Gambar saat ini: ${pengumuman.gambar}<br>
              Kosongkan jika tidak ingin mengubah gambar
            </small>
            ${pengumuman.gambar ? `
              <div style="margin-top: 10px;">
                <img src="/uploads/${pengumuman.gambar}" alt="Preview" 
                     style="max-width: 100%; height: auto; border-radius: 4px;">
              </div>
            ` : ''}
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select name="status">
                <option value="aktif" ${pengumuman.status === 'aktif' ? 'selected' : ''}>Aktif</option>
                <option value="nonaktif" ${pengumuman.status === 'nonaktif' ? 'selected' : ''}>Non-Aktif</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Urutan</label>
              <input type="number" name="urutan" value="${pengumuman.urutan || 0}" min="0">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Tanggal Mulai</label>
              <input type="date" name="tanggal_mulai" value="${pengumuman.tanggal_mulai || ''}">
            </div>
            
            <div class="form-group">
              <label>Tanggal Selesai</label>
              <input type="date" name="tanggal_selesai" value="${pengumuman.tanggal_selesai || ''}">
            </div>
          </div>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 8px;">Opsi Tampilan</label>
            <div style="display: flex; gap: 20px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="tampilkan_judul" value="1" ${pengumuman.tampilkan_judul !== 0 ? 'checked' : ''} style="width: auto; cursor: pointer;">
                <span>Tampilkan Judul</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" name="tampilkan_konten" value="1" ${pengumuman.tampilkan_konten !== 0 ? 'checked' : ''} style="width: auto; cursor: pointer;">
                <span>Tampilkan Konten</span>
              </label>
            </div>
            <small style="color: #666;">Centang untuk menampilkan judul/konten di banner</small>
          </div>
          
          <div class="btn-group">
            <button type="submit" class="btn btn-primary">
              <i data-feather="save"></i> Update
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
    
    document.getElementById('formEditPengumuman').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      // Handle checkbox values
      const tampilkanJudul = e.target.querySelector('input[name="tampilkan_judul"]').checked;
      const tampilkanKonten = e.target.querySelector('input[name="tampilkan_konten"]').checked;
      
      formData.set('tampilkan_judul', tampilkanJudul ? '1' : '0');
      formData.set('tampilkan_konten', tampilkanKonten ? '1' : '0');
      
      try {
        const response = await fetch(`/api/pengumuman/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
          alert('Pengumuman berhasil diupdate!');
          modal.remove();
          renderPengumuman();
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        alert('Terjadi kesalahan: ' + error.message);
      }
    });
  } catch (error) {
    alert('Gagal memuat data pengumuman: ' + error.message);
  }
};

// Hapus Pengumuman
window.hapusPengumuman = async function(id, judul) {
  if (!confirm(`Apakah Anda yakin ingin menghapus pengumuman "${judul}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/pengumuman/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('Pengumuman berhasil dihapus!');
      renderPengumuman();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Terjadi kesalahan: ' + error.message);
  }
};

// Debug: Verify all functions are loaded
console.log('=== PAGES.JS LOADED ===');
console.log('renderSHU:', typeof window.renderSHU);
console.log('renderLaporan:', typeof window.renderLaporan);
console.log('renderPengumuman:', typeof window.renderPengumuman);
console.log('renderProfil:', typeof window.renderProfil);
console.log('renderPengaturan:', typeof window.renderPengaturan);
console.log('=======================');


// Export Simpanan Unified to Excel (CSV)
window.exportSimpananUnified = function() {
  if (!allSimpananData || allSimpananData.length === 0) {
    alert('Tidak ada data untuk diexport');
    return;
  }
  
  // Use filtered data
  const simpanan = filterSimpananData(allSimpananData);
  
  let csv = 'No,Tanggal,Jenis Simpanan,No. Anggota,Nama Anggota,Jumlah,Metode,Keterangan\n';
  
  simpanan.forEach((item, index) => {
    csv += `${index + 1},"${formatDate(item.tanggal_transaksi)}","${item.jenis_label || item.jenis_simpanan}","${item.nomor_anggota}","${item.nama_lengkap}","${item.jumlah}","${item.metode_pembayaran || '-'}","${item.keterangan || '-'}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `transaksi-simpanan-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Data transaksi simpanan berhasil diexport', 'success');
};

// Cetak Simpanan Unified
window.cetakSimpananUnified = async function() {
  if (!allSimpananData || allSimpananData.length === 0) {
    alert('Tidak ada data untuk dicetak');
    return;
  }
  
  // Use filtered data
  const simpanan = filterSimpananData(allSimpananData);
  const info = await API.get('/api/koperasi-info');
  
  const totalSimpanan = simpanan.reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transaksi Simpanan - ${info.nama_koperasi || 'Koperasi'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 5px 0; }
        .header p { margin: 3px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
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
        <h3 style="margin-top: 15px;">TRANSAKSI SIMPANAN</h3>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Jenis</th>
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
              <td>${item.jenis_label || item.jenis_simpanan}</td>
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
        Total Simpanan: ${formatCurrency(totalSimpanan)}
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

// Export Partisipasi Unified to Excel (CSV)
window.exportPartisipasiUnified = async function() {
  const partisipasi = await API.get('/api/partisipasi');
  
  let csv = 'No,Tanggal,No. Anggota,Nama Anggota,Unit Usaha,Jumlah Transaksi,Keterangan\n';
  
  partisipasi.forEach((item, index) => {
    csv += `${index + 1},"${formatDate(item.tanggal_transaksi)}","${item.nomor_anggota}","${item.nama_lengkap}","${item.nama_usaha || '-'}","${item.jumlah_transaksi}","${item.keterangan || '-'}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `partisipasi-anggota-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Data partisipasi anggota berhasil diexport', 'success');
};

// Cetak Partisipasi Unified
window.cetakPartisipasiUnified = async function() {
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


// Alias functions for compatibility
window.hapusPenjualan = window.deletePenjualan;
window.hapusPengeluaran = window.deletePengeluaran;
window.hapusPendapatanLain = window.deletePendapatanLain;
