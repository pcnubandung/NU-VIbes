// ===== FILTER FUNCTIONS FOR TRANSAKSI KEUANGAN =====

// Global variables for penjualan filter
let allPenjualanData = [];
let penjualanFilters = {
  unitUsaha: 'semua',
  tanggalDari: '',
  tanggalSampai: '',
  sortBy: 'tanggal_transaksi',
  sortOrder: 'desc'
};

// Global variables for pengeluaran filter
let allPengeluaranData = [];
let pengeluaranFilters = {
  kategori: 'semua',
  unitUsaha: 'semua',
  tanggalDari: '',
  tanggalSampai: '',
  sortBy: 'tanggal_transaksi',
  sortOrder: 'desc'
};

// Global variables for pendapatan lain filter
let allPendapatanLainData = [];
let pendapatanLainFilters = {
  kategori: 'semua',
  tanggalDari: '',
  tanggalSampai: '',
  sortBy: 'tanggal_transaksi',
  sortOrder: 'desc'
};

// ===== PENJUALAN FILTERS =====

window.renderPenjualanWithFilter = async function() {
  const [penjualan, unitUsaha] = await Promise.all([
    API.get('/api/transaksi/penjualan'),
    API.get('/api/unit-usaha')
  ]);
  
  allPenjualanData = penjualan;
  renderPenjualanTable(unitUsaha);
}

function renderPenjualanTable(unitUsaha) {
  let filtered = filterPenjualanData(allPenjualanData);
  const totalPenjualan = filtered.reduce((sum, item) => sum + (item.jumlah_penjualan || 0), 0);
  const totalHPP = filtered.reduce((sum, item) => sum + (item.hpp || 0), 0);
  const totalKeuntungan = totalPenjualan - totalHPP;
  
  const filterSection = `
    <div class="filter-section">
      <div style="display: flex; align-items: center; gap: 10px;">
        <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
        <label style="font-weight: 600; margin: 0;">Filter:</label>
      </div>
      
      <select id="filterUnitUsaha" onchange="changePenjualanFilter('unitUsaha', this.value)">
        <option value="semua">Semua Unit Usaha</option>
        ${unitUsaha.map(u => `
          <option value="${u.id}" ${penjualanFilters.unitUsaha == u.id ? 'selected' : ''}>
            ${u.nama_usaha}
          </option>
        `).join('')}
      </select>
      
      <input type="date" id="filterTanggalDari" value="${penjualanFilters.tanggalDari}" 
             onchange="changePenjualanFilter('tanggalDari', this.value)" 
             placeholder="Dari Tanggal">
      
      <input type="date" id="filterTanggalSampai" value="${penjualanFilters.tanggalSampai}" 
             onchange="changePenjualanFilter('tanggalSampai', this.value)" 
             placeholder="Sampai Tanggal">
      
      <select id="sortPenjualan" onchange="changePenjualanFilter('sortBy', this.value)">
        <option value="tanggal_transaksi" ${penjualanFilters.sortBy === 'tanggal_transaksi' ? 'selected' : ''}>Tanggal</option>
        <option value="jumlah_penjualan" ${penjualanFilters.sortBy === 'jumlah_penjualan' ? 'selected' : ''}>Jumlah Penjualan</option>
        <option value="keuntungan" ${penjualanFilters.sortBy === 'keuntungan' ? 'selected' : ''}>Keuntungan</option>
      </select>
      
      <button onclick="togglePenjualanSortOrder()" class="btn btn-secondary">
        <i data-feather="${penjualanFilters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}"></i>
        ${penjualanFilters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
      </button>
      
      <button onclick="resetPenjualanFilter()" class="btn btn-warning" style="margin-left: auto;">
        <i data-feather="refresh-cw"></i> Reset
      </button>
      
      <div style="color: #666; white-space: nowrap;">
        <strong>${filtered.length}</strong> transaksi | 
        <strong>${formatCurrency(totalKeuntungan)}</strong>
      </div>
    </div>
  `;
  
  return { filtered, filterSection, totalPenjualan, totalHPP, totalKeuntungan };
}

function filterPenjualanData(data) {
  let filtered = [...data];
  
  if (penjualanFilters.unitUsaha !== 'semua') {
    filtered = filtered.filter(item => item.unit_usaha_id == penjualanFilters.unitUsaha);
  }
  
  if (penjualanFilters.tanggalDari) {
    filtered = filtered.filter(item => item.tanggal_transaksi >= penjualanFilters.tanggalDari);
  }
  if (penjualanFilters.tanggalSampai) {
    filtered = filtered.filter(item => item.tanggal_transaksi <= penjualanFilters.tanggalSampai);
  }
  
  filtered.sort((a, b) => {
    let aVal = a[penjualanFilters.sortBy];
    let bVal = b[penjualanFilters.sortBy];
    
    if (penjualanFilters.sortBy === 'keuntungan') {
      aVal = (a.jumlah_penjualan || 0) - (a.hpp || 0);
      bVal = (b.jumlah_penjualan || 0) - (b.hpp || 0);
    } else if (penjualanFilters.sortBy === 'tanggal_transaksi') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (aVal < bVal) return penjualanFilters.sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return penjualanFilters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return filtered;
}

window.changePenjualanFilter = async function(filterType, value) {
  penjualanFilters[filterType] = value;
  const unitUsaha = await API.get('/api/unit-usaha');
  renderPenjualanTable(unitUsaha);
  // Trigger re-render of main page
  window.renderPenjualan();
}

window.togglePenjualanSortOrder = async function() {
  penjualanFilters.sortOrder = penjualanFilters.sortOrder === 'asc' ? 'desc' : 'asc';
  window.renderPenjualan();
}

window.resetPenjualanFilter = async function() {
  penjualanFilters = {
    unitUsaha: 'semua',
    tanggalDari: '',
    tanggalSampai: '',
    sortBy: 'tanggal_transaksi',
    sortOrder: 'desc'
  };
  window.renderPenjualan();
}

// ===== PENGELUARAN FILTERS =====

window.renderPengeluaranWithFilter = async function() {
  const [pengeluaran, unitUsaha] = await Promise.all([
    API.get('/api/transaksi/pengeluaran'),
    API.get('/api/unit-usaha')
  ]);
  
  allPengeluaranData = pengeluaran;
  return renderPengeluaranTable(unitUsaha);
}

function renderPengeluaranTable(unitUsaha) {
  let filtered = filterPengeluaranData(allPengeluaranData);
  const totalPengeluaran = filtered.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  
  const filterSection = `
    <div class="filter-section">
      <div style="display: flex; align-items: center; gap: 10px;">
        <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
        <label style="font-weight: 600; margin: 0;">Filter:</label>
      </div>
      
      <select id="filterKategori" onchange="changePengeluaranFilter('kategori', this.value)">
        <option value="semua">Semua Kategori</option>
        <option value="Gaji Karyawan" ${pengeluaranFilters.kategori === 'Gaji Karyawan' ? 'selected' : ''}>Gaji Karyawan</option>
        <option value="Operasional" ${pengeluaranFilters.kategori === 'Operasional' ? 'selected' : ''}>Operasional</option>
        <option value="Pembelian Barang" ${pengeluaranFilters.kategori === 'Pembelian Barang' ? 'selected' : ''}>Pembelian Barang</option>
        <option value="Pembelian Aset" ${pengeluaranFilters.kategori === 'Pembelian Aset' ? 'selected' : ''}>Pembelian Aset</option>
        <option value="Listrik & Air" ${pengeluaranFilters.kategori === 'Listrik & Air' ? 'selected' : ''}>Listrik & Air</option>
        <option value="Transportasi" ${pengeluaranFilters.kategori === 'Transportasi' ? 'selected' : ''}>Transportasi</option>
        <option value="Lain-lain" ${pengeluaranFilters.kategori === 'Lain-lain' ? 'selected' : ''}>Lain-lain</option>
      </select>
      
      <select id="filterUnitUsaha" onchange="changePengeluaranFilter('unitUsaha', this.value)">
        <option value="semua">Semua Unit Usaha</option>
        <option value="umum" ${pengeluaranFilters.unitUsaha === 'umum' ? 'selected' : ''}>Umum</option>
        ${unitUsaha.map(u => `
          <option value="${u.id}" ${pengeluaranFilters.unitUsaha == u.id ? 'selected' : ''}>
            ${u.nama_usaha}
          </option>
        `).join('')}
      </select>
      
      <input type="date" id="filterTanggalDari" value="${pengeluaranFilters.tanggalDari}" 
             onchange="changePengeluaranFilter('tanggalDari', this.value)">
      
      <input type="date" id="filterTanggalSampai" value="${pengeluaranFilters.tanggalSampai}" 
             onchange="changePengeluaranFilter('tanggalSampai', this.value)">
      
      <select id="sortPengeluaran" onchange="changePengeluaranFilter('sortBy', this.value)">
        <option value="tanggal_transaksi" ${pengeluaranFilters.sortBy === 'tanggal_transaksi' ? 'selected' : ''}>Tanggal</option>
        <option value="jumlah" ${pengeluaranFilters.sortBy === 'jumlah' ? 'selected' : ''}>Jumlah</option>
        <option value="kategori" ${pengeluaranFilters.sortBy === 'kategori' ? 'selected' : ''}>Kategori</option>
      </select>
      
      <button onclick="togglePengeluaranSortOrder()" class="btn btn-secondary">
        <i data-feather="${pengeluaranFilters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}"></i>
        ${pengeluaranFilters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
      </button>
      
      <button onclick="resetPengeluaranFilter()" class="btn btn-warning" style="margin-left: auto;">
        <i data-feather="refresh-cw"></i> Reset
      </button>
      
      <div style="color: #666; white-space: nowrap;">
        <strong>${filtered.length}</strong> transaksi | 
        <strong>${formatCurrency(totalPengeluaran)}</strong>
      </div>
    </div>
  `;
  
  return { filtered, filterSection, totalPengeluaran };
}

function filterPengeluaranData(data) {
  let filtered = [...data];
  
  if (pengeluaranFilters.kategori !== 'semua') {
    filtered = filtered.filter(item => item.kategori === pengeluaranFilters.kategori);
  }
  
  if (pengeluaranFilters.unitUsaha !== 'semua') {
    if (pengeluaranFilters.unitUsaha === 'umum') {
      filtered = filtered.filter(item => !item.unit_usaha_id);
    } else {
      filtered = filtered.filter(item => item.unit_usaha_id == pengeluaranFilters.unitUsaha);
    }
  }
  
  if (pengeluaranFilters.tanggalDari) {
    filtered = filtered.filter(item => item.tanggal_transaksi >= pengeluaranFilters.tanggalDari);
  }
  if (pengeluaranFilters.tanggalSampai) {
    filtered = filtered.filter(item => item.tanggal_transaksi <= pengeluaranFilters.tanggalSampai);
  }
  
  filtered.sort((a, b) => {
    let aVal = a[pengeluaranFilters.sortBy];
    let bVal = b[pengeluaranFilters.sortBy];
    
    if (pengeluaranFilters.sortBy === 'tanggal_transaksi') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return pengeluaranFilters.sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return pengeluaranFilters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return filtered;
}

window.changePengeluaranFilter = async function(filterType, value) {
  pengeluaranFilters[filterType] = value;
  window.renderPengeluaran();
}

window.togglePengeluaranSortOrder = async function() {
  pengeluaranFilters.sortOrder = pengeluaranFilters.sortOrder === 'asc' ? 'desc' : 'asc';
  window.renderPengeluaran();
}

window.resetPengeluaranFilter = async function() {
  pengeluaranFilters = {
    kategori: 'semua',
    unitUsaha: 'semua',
    tanggalDari: '',
    tanggalSampai: '',
    sortBy: 'tanggal_transaksi',
    sortOrder: 'desc'
  };
  window.renderPengeluaran();
}

// ===== PENDAPATAN LAIN FILTERS =====

window.renderPendapatanLainWithFilter = async function() {
  const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
  allPendapatanLainData = pendapatanLain;
  return renderPendapatanLainTable();
}

function renderPendapatanLainTable() {
  let filtered = filterPendapatanLainData(allPendapatanLainData);
  const totalPendapatan = filtered.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  
  const filterSection = `
    <div class="filter-section">
      <div style="display: flex; align-items: center; gap: 10px;">
        <i data-feather="filter" style="width: 20px; height: 20px; color: #2E7D32;"></i>
        <label style="font-weight: 600; margin: 0;">Filter:</label>
      </div>
      
      <select id="filterKategori" onchange="changePendapatanLainFilter('kategori', this.value)">
        <option value="semua">Semua Kategori</option>
        <option value="Bunga Bank" ${pendapatanLainFilters.kategori === 'Bunga Bank' ? 'selected' : ''}>Bunga Bank</option>
        <option value="Sewa" ${pendapatanLainFilters.kategori === 'Sewa' ? 'selected' : ''}>Sewa</option>
        <option value="Donasi" ${pendapatanLainFilters.kategori === 'Donasi' ? 'selected' : ''}>Donasi</option>
        <option value="Lain-lain" ${pendapatanLainFilters.kategori === 'Lain-lain' ? 'selected' : ''}>Lain-lain</option>
      </select>
      
      <input type="date" id="filterTanggalDari" value="${pendapatanLainFilters.tanggalDari}" 
             onchange="changePendapatanLainFilter('tanggalDari', this.value)">
      
      <input type="date" id="filterTanggalSampai" value="${pendapatanLainFilters.tanggalSampai}" 
             onchange="changePendapatanLainFilter('tanggalSampai', this.value)">
      
      <select id="sortPendapatanLain" onchange="changePendapatanLainFilter('sortBy', this.value)">
        <option value="tanggal_transaksi" ${pendapatanLainFilters.sortBy === 'tanggal_transaksi' ? 'selected' : ''}>Tanggal</option>
        <option value="jumlah" ${pendapatanLainFilters.sortBy === 'jumlah' ? 'selected' : ''}>Jumlah</option>
        <option value="kategori" ${pendapatanLainFilters.sortBy === 'kategori' ? 'selected' : ''}>Kategori</option>
      </select>
      
      <button onclick="togglePendapatanLainSortOrder()" class="btn btn-secondary">
        <i data-feather="${pendapatanLainFilters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}"></i>
        ${pendapatanLainFilters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
      </button>
      
      <button onclick="resetPendapatanLainFilter()" class="btn btn-warning" style="margin-left: auto;">
        <i data-feather="refresh-cw"></i> Reset
      </button>
      
      <div style="color: #666; white-space: nowrap;">
        <strong>${filtered.length}</strong> transaksi | 
        <strong>${formatCurrency(totalPendapatan)}</strong>
      </div>
    </div>
  `;
  
  return { filtered, filterSection, totalPendapatan };
}

function filterPendapatanLainData(data) {
  let filtered = [...data];
  
  if (pendapatanLainFilters.kategori !== 'semua') {
    filtered = filtered.filter(item => item.kategori === pendapatanLainFilters.kategori);
  }
  
  if (pendapatanLainFilters.tanggalDari) {
    filtered = filtered.filter(item => item.tanggal_transaksi >= pendapatanLainFilters.tanggalDari);
  }
  if (pendapatanLainFilters.tanggalSampai) {
    filtered = filtered.filter(item => item.tanggal_transaksi <= pendapatanLainFilters.tanggalSampai);
  }
  
  filtered.sort((a, b) => {
    let aVal = a[pendapatanLainFilters.sortBy];
    let bVal = b[pendapatanLainFilters.sortBy];
    
    if (pendapatanLainFilters.sortBy === 'tanggal_transaksi') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return pendapatanLainFilters.sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return pendapatanLainFilters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return filtered;
}

window.changePendapatanLainFilter = async function(filterType, value) {
  pendapatanLainFilters[filterType] = value;
  window.renderPendapatanLain();
}

window.togglePendapatanLainSortOrder = async function() {
  pendapatanLainFilters.sortOrder = pendapatanLainFilters.sortOrder === 'asc' ? 'desc' : 'asc';
  window.renderPendapatanLain();
}

window.resetPendapatanLainFilter = async function() {
  pendapatanLainFilters = {
    kategori: 'semua',
    tanggalDari: '',
    tanggalSampai: '',
    sortBy: 'tanggal_transaksi',
    sortOrder: 'desc'
  };
  window.renderPendapatanLain();
}
