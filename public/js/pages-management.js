// Management pages: Pengurus, Karyawan, Aset
console.log('pages-management.js: Starting to load... [VERSION 2.0 - WITH SEARCH]');

// Global variables for pengurus
let pengurusData = [];
let pengurusSearchKeyword = '';

// Data Pengurus
window.renderDataPengurus = async function() {
  console.log('renderDataPengurus called');
  try {
    pengurusData = await API.get('/api/pengurus');
    pengurusSearchKeyword = '';
    renderPengurusTable();
  } catch (error) {
    console.error('Error rendering pengurus:', error);
    contentArea.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Data Pengurus</h3>
          <button class="btn btn-primary" onclick="tambahPengurus()">
            <i data-feather="plus"></i> Tambah Pengurus
          </button>
        </div>
        <div class="error-message">
          Error: ${error.message || 'Gagal memuat data pengurus'}
        </div>
      </div>
    `;
    feather.replace();
  }
};

function renderPengurusTable(updateOnly = false) {
  // Filter data by search keyword
  let filteredData = pengurusData;
  if (pengurusSearchKeyword) {
    const keyword = pengurusSearchKeyword.toLowerCase();
    filteredData = pengurusData.filter(item => {
      return (
        (item.nomor_anggota && item.nomor_anggota.toLowerCase().includes(keyword)) ||
        (item.nama_lengkap && item.nama_lengkap.toLowerCase().includes(keyword)) ||
        (item.jabatan && item.jabatan.toLowerCase().includes(keyword))
      );
    });
  }
  
  // If updateOnly, just update the table body and counter
  if (updateOnly) {
    const tbody = document.querySelector('.table-container tbody');
    const counter = document.querySelector('.search-info');
    
    if (tbody) {
      tbody.innerHTML = filteredData.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.foto ? `<img src="/uploads/${item.foto}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">` : '👤'}</td>
          <td>${item.nomor_anggota}</td>
          <td>${item.nama_lengkap}</td>
          <td><strong>${item.jabatan}</strong></td>
          <td>${formatDate(item.periode_mulai)} - ${formatDate(item.periode_selesai)}</td>
          <td><span class="badge badge-${item.status === 'aktif' ? 'success' : 'danger'}">${item.status}</span></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-warning" onclick="editPengurus(${item.id})">
                <i data-feather="edit"></i> Edit
              </button>
              <button class="btn btn-sm btn-danger" onclick="hapusPengurus(${item.id})">
                <i data-feather="trash-2"></i> Hapus
              </button>
            </div>
          </td>
        </tr>
      `).join('');
      
      feather.replace();
    }
    
    if (counter) {
      counter.textContent = pengurusSearchKeyword 
        ? `Ditemukan: ${filteredData.length} dari ${pengurusData.length} pengurus` 
        : `Total: ${filteredData.length} pengurus`;
    }
    
    return;
  }
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Data Pengurus</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportPengurusExcel()">
            <i data-feather="download"></i> Export Excel
          </button>
          <button class="btn btn-info" onclick="cetakPengurus()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahPengurus()">
            <i data-feather="plus"></i> Tambah Pengurus
          </button>
        </div>
      </div>
      
      <div class="card-body">
        <div class="search-section" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
          <div style="position: relative; max-width: 400px; flex: 1;">
            <i data-feather="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #999;"></i>
            <input 
              type="text" 
              id="searchPengurus" 
              placeholder="Cari pengurus (nama, nomor, jabatan)..." 
              value="${pengurusSearchKeyword}"
              style="width: 100%; padding: 10px 10px 10px 40px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;"
              oninput="searchPengurus(this.value)"
              onfocus="this.style.borderColor='#2E7D32'"
              onblur="this.style.borderColor='#ddd'"
            >
            ${pengurusSearchKeyword ? `
              <button 
                onclick="clearSearchPengurus()" 
                style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #999; padding: 4px;"
                title="Hapus pencarian"
              >
                <i data-feather="x" style="width: 18px; height: 18px;"></i>
              </button>
            ` : ''}
          </div>
          <div class="search-info" style="margin-left: 15px; color: #666; font-size: 14px;">
            ${pengurusSearchKeyword ? `Ditemukan: <strong>${filteredData.length}</strong> dari ${pengurusData.length} pengurus` : `Total: <strong>${filteredData.length}</strong> pengurus`}
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
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Periode</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.foto ? `<img src="/uploads/${item.foto}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">` : '👤'}</td>
                <td>${item.nomor_anggota}</td>
                <td>${item.nama_lengkap}</td>
                <td><strong>${item.jabatan}</strong></td>
                <td>${formatDate(item.periode_mulai)} - ${formatDate(item.periode_selesai)}</td>
                <td><span class="badge badge-${item.status === 'aktif' ? 'success' : 'danger'}">${item.status}</span></td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-warning" onclick="editPengurus(${item.id})">
                      <i data-feather="edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusPengurus(${item.id})">
                      <i data-feather="trash-2"></i> Hapus
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

// Function to search pengurus
window.searchPengurus = function(keyword) {
  pengurusSearchKeyword = keyword;
  renderPengurusTable(true);
};

// Function to clear search
window.clearSearchPengurus = function() {
  pengurusSearchKeyword = '';
  renderPengurusTable(true);
};

window.tambahPengurus = async function() {
  const anggota = await API.get('/api/anggota');
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Pengurus</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahPengurusForm">
        <div class="form-group">
          <label>Pilih Anggota *</label>
          <div id="anggotaSelectContainerPengurus"></div>
        </div>
        
        <div class="form-group">
          <label>Jabatan *</label>
          <select name="jabatan" required>
            <option value="">Pilih Jabatan</option>
            <option value="Ketua">Ketua</option>
            <option value="Wakil Ketua">Wakil Ketua</option>
            <option value="Sekretaris">Sekretaris</option>
            <option value="Bendahara">Bendahara</option>
            <option value="Pengawas">Pengawas</option>
            <option value="Anggota Pengurus">Anggota Pengurus</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Periode Mulai *</label>
            <input type="date" name="periode_mulai" required>
          </div>
          <div class="form-group">
            <label>Periode Selesai *</label>
            <input type="date" name="periode_selesai" required>
          </div>
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
  
  // Initialize searchable select for anggota
  createSearchableAnggotaSelect('anggotaSelectContainerPengurus', 'anggota_id', true);
  
  document.getElementById('tambahPengurusForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const result = await API.post('/api/pengurus', data);
      alert(result.message || 'Pengurus berhasil ditambahkan');
      modal.remove();
      window.renderDataPengurus();
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menambahkan pengurus: ' + (error.message || 'Unknown error'));
    }
  });
};

window.editPengurus = async function(id) {
  const pengurus = await API.get('/api/pengurus');
  const anggota = await API.get('/api/anggota');
  const item = pengurus.find(p => p.id === id);
  
  if (!item) {
    alert('Data tidak ditemukan');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Pengurus</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editPengurusForm">
        <div class="form-group">
          <label>Pilih Anggota *</label>
          <select name="anggota_id" required>
            <option value="">Pilih Anggota</option>
            ${anggota.filter(a => a.status === 'aktif').map(a => `
              <option value="${a.id}" ${a.id === item.anggota_id ? 'selected' : ''}>${a.nomor_anggota} - ${a.nama_lengkap}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Jabatan *</label>
          <select name="jabatan" required>
            <option value="">Pilih Jabatan</option>
            <option value="Ketua" ${item.jabatan === 'Ketua' ? 'selected' : ''}>Ketua</option>
            <option value="Wakil Ketua" ${item.jabatan === 'Wakil Ketua' ? 'selected' : ''}>Wakil Ketua</option>
            <option value="Sekretaris" ${item.jabatan === 'Sekretaris' ? 'selected' : ''}>Sekretaris</option>
            <option value="Bendahara" ${item.jabatan === 'Bendahara' ? 'selected' : ''}>Bendahara</option>
            <option value="Pengawas" ${item.jabatan === 'Pengawas' ? 'selected' : ''}>Pengawas</option>
            <option value="Anggota Pengurus" ${item.jabatan === 'Anggota Pengurus' ? 'selected' : ''}>Anggota Pengurus</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Periode Mulai *</label>
            <input type="date" name="periode_mulai" value="${item.periode_mulai}" required>
          </div>
          <div class="form-group">
            <label>Periode Selesai *</label>
            <input type="date" name="periode_selesai" value="${item.periode_selesai}" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Status</label>
          <select name="status">
            <option value="aktif" ${item.status === 'aktif' ? 'selected' : ''}>Aktif</option>
            <option value="nonaktif" ${item.status === 'nonaktif' ? 'selected' : ''}>Non-Aktif</option>
          </select>
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
  
  document.getElementById('editPengurusForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.put(`/api/pengurus/${id}`, data);
    alert(result.message);
    modal.remove();
    window.renderDataPengurus();
  });
};

window.hapusPengurus = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus pengurus ini?')) {
    const result = await API.delete(`/api/pengurus/${id}`);
    alert(result.message);
    window.renderDataPengurus();
  }
};

// Data Karyawan
window.renderDataKaryawan = async function() {
  try {
    const karyawan = await API.get('/api/karyawan');
    
    contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Data Karyawan</h3>
        <div class="btn-group">
          <button class="btn btn-success" onclick="exportKaryawanExcel()">
            <i data-feather="download"></i> Export Excel
          </button>
          <button class="btn btn-info" onclick="cetakKaryawan()">
            <i data-feather="printer"></i> Cetak
          </button>
          <button class="btn btn-primary" onclick="tambahKaryawan()">
            <i data-feather="plus"></i> Tambah Karyawan
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Foto</th>
              <th>No. Karyawan</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Unit Usaha</th>
              <th>Gaji</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${karyawan.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.foto ? `<img src="/uploads/${item.foto}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">` : '👤'}</td>
                <td>${item.nomor_karyawan}</td>
                <td>${item.nama_lengkap}</td>
                <td>${item.jabatan}</td>
                <td>${item.nama_usaha || '-'}</td>
                <td>${formatCurrency(item.gaji || 0)}</td>
                <td><span class="badge badge-${item.status === 'aktif' ? 'success' : 'danger'}">${item.status}</span></td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-info" onclick="detailKaryawan(${item.id})">
                      <i data-feather="eye"></i> Detail
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editKaryawan(${item.id})">
                      <i data-feather="edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusKaryawan(${item.id})">
                      <i data-feather="trash-2"></i> Hapus
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
  } catch (error) {
    console.error('Error rendering karyawan:', error);
    contentArea.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Data Karyawan</h3>
          <button class="btn btn-primary" onclick="tambahKaryawan()">
            <i data-feather="plus"></i> Tambah Karyawan
          </button>
        </div>
        <div class="error-message">
          Error: ${error.message || 'Gagal memuat data karyawan'}
          <br><small>Pastikan tabel karyawan sudah dibuat. Coba reset database jika perlu.</small>
        </div>
      </div>
    `;
    feather.replace();
  }
};

window.tambahKaryawan = async function() {
  const unitUsaha = await API.get('/api/unit-usaha');
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 700px;">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Karyawan</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahKaryawanForm">
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Karyawan *</label>
            <input type="text" name="nomor_karyawan" required>
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
          <textarea name="alamat" rows="2"></textarea>
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
            <label>Jabatan *</label>
            <input type="text" name="jabatan" required>
          </div>
          <div class="form-group">
            <label>Unit Usaha</label>
            <select name="unit_usaha_id">
              <option value="">Pilih Unit Usaha</option>
              ${unitUsaha.filter(u => u.status === 'Aktif').map(u => `
                <option value="${u.id}">${u.nama_usaha}</option>
              `).join('')}
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Tanggal Bergabung</label>
            <input type="date" name="tanggal_bergabung" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label>Gaji (Rp)</label>
            <input type="number" name="gaji" min="0" step="10000" value="0">
          </div>
        </div>
        
        <div class="form-group">
          <label>Foto</label>
          <input type="file" name="foto" accept="image/*">
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
  
  document.getElementById('tambahKaryawanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/karyawan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Karyawan berhasil ditambahkan');
        modal.remove();
        window.renderDataKaryawan();
      } else {
        console.error('Error response:', result);
        alert('Error: ' + (result.error || 'Gagal menambahkan karyawan'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan: ' + error.message);
    }
  });
};

// Detail Karyawan
window.detailKaryawan = async function(id) {
  try {
    const karyawan = await API.get('/api/karyawan');
    const item = karyawan.find(k => k.id === id);
    
    if (!item) {
      alert('Data karyawan tidak ditemukan');
      return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3 class="modal-title">Detail Karyawan</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        
        <div style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            ${item.foto ? 
              `<img src="/uploads/${item.foto}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 50%; border: 4px solid #2E7D32;">` : 
              `<div style="width: 120px; height: 120px; background: #e0e0e0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 48px;">👤</div>`
            }
            <h3 style="margin: 10px 0 5px 0;">${item.nama_lengkap}</h3>
            <p style="color: #666; margin: 0;">${item.nomor_karyawan}</p>
            <span class="badge badge-${item.status === 'aktif' ? 'success' : 'danger'}" style="margin-top: 10px;">${item.status}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
              <strong style="color: #666;">NIK:</strong><br>
              ${item.nik || '-'}
            </div>
            <div>
              <strong style="color: #666;">Jenis Kelamin:</strong><br>
              ${item.jenis_kelamin || '-'}
            </div>
            <div>
              <strong style="color: #666;">Tempat, Tanggal Lahir:</strong><br>
              ${item.tempat_lahir || '-'}, ${item.tanggal_lahir ? formatDate(item.tanggal_lahir) : '-'}
            </div>
            <div>
              <strong style="color: #666;">Jabatan:</strong><br>
              ${item.jabatan}
            </div>
            <div>
              <strong style="color: #666;">Unit Usaha:</strong><br>
              ${item.nama_usaha || '-'}
            </div>
            <div>
              <strong style="color: #666;">Gaji:</strong><br>
              ${formatCurrency(item.gaji || 0)}
            </div>
            <div>
              <strong style="color: #666;">Nomor Telepon:</strong><br>
              ${item.nomor_telpon || '-'}
            </div>
            <div>
              <strong style="color: #666;">Email:</strong><br>
              ${item.email || '-'}
            </div>
            <div style="grid-column: 1 / -1;">
              <strong style="color: #666;">Alamat:</strong><br>
              ${item.alamat || '-'}
            </div>
            <div>
              <strong style="color: #666;">Tanggal Bergabung:</strong><br>
              ${item.tanggal_bergabung ? formatDate(item.tanggal_bergabung) : '-'}
            </div>
          </div>
          
          <div class="btn-group" style="margin-top: 20px;">
            <button class="btn btn-warning" onclick="this.closest('.modal').remove(); editKaryawan(${id})">
              <i data-feather="edit"></i> Edit
            </button>
            <button class="btn btn-danger" onclick="this.closest('.modal').remove()">
              <i data-feather="x"></i> Tutup
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    feather.replace();
  } catch (error) {
    console.error('Error loading detail karyawan:', error);
    alert('Gagal memuat detail karyawan: ' + error.message);
  }
};

// Edit Karyawan
window.editKaryawan = async function(id) {
  try {
    const karyawan = await API.get('/api/karyawan');
    const item = karyawan.find(k => k.id === id);
    const unitUsaha = await API.get('/api/unit-usaha');
    
    if (!item) {
      alert('Data karyawan tidak ditemukan');
      return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3 class="modal-title">Edit Karyawan</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        
        <form id="editKaryawanForm">
          <div class="form-row">
            <div class="form-group">
              <label>Nomor Karyawan *</label>
              <input type="text" name="nomor_karyawan" value="${item.nomor_karyawan}" required>
            </div>
            <div class="form-group">
              <label>Nama Lengkap *</label>
              <input type="text" name="nama_lengkap" value="${item.nama_lengkap}" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>NIK</label>
              <input type="text" name="nik" value="${item.nik || ''}">
            </div>
            <div class="form-group">
              <label>Jenis Kelamin</label>
              <select name="jenis_kelamin">
                <option value="">Pilih</option>
                <option value="Laki-laki" ${item.jenis_kelamin === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
                <option value="Perempuan" ${item.jenis_kelamin === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Tempat Lahir</label>
              <input type="text" name="tempat_lahir" value="${item.tempat_lahir || ''}">
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input type="date" name="tanggal_lahir" value="${item.tanggal_lahir || ''}">
            </div>
          </div>
          
          <div class="form-group">
            <label>Alamat</label>
            <textarea name="alamat" rows="2">${item.alamat || ''}</textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Nomor Telepon</label>
              <input type="text" name="nomor_telpon" value="${item.nomor_telpon || ''}">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" value="${item.email || ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Jabatan *</label>
              <input type="text" name="jabatan" value="${item.jabatan}" required>
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
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Tanggal Bergabung</label>
              <input type="date" name="tanggal_bergabung" value="${item.tanggal_bergabung || ''}">
            </div>
            <div class="form-group">
              <label>Gaji (Rp)</label>
              <input type="number" name="gaji" min="0" step="10000" value="${item.gaji || 0}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select name="status">
                <option value="aktif" ${item.status === 'aktif' ? 'selected' : ''}>Aktif</option>
                <option value="nonaktif" ${item.status === 'nonaktif' ? 'selected' : ''}>Non-Aktif</option>
              </select>
            </div>
            <div class="form-group">
              <label>Foto</label>
              <input type="file" name="foto" accept="image/*">
              ${item.foto ? `<small style="color: #666;">Foto saat ini: ${item.foto}</small>` : ''}
            </div>
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
    
    document.getElementById('editKaryawanForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        const response = await fetch(`/api/karyawan/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
          alert(result.message);
          modal.remove();
          window.renderDataKaryawan();
        } else {
          alert('Error: ' + result.error);
        }
      } catch (error) {
        alert('Terjadi kesalahan: ' + error.message);
      }
    });
  } catch (error) {
    console.error('Error loading edit karyawan:', error);
    alert('Gagal memuat form edit: ' + error.message);
  }
};

window.hapusKaryawan = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
    const result = await API.delete(`/api/karyawan/${id}`);
    alert(result.message);
    window.renderDataKaryawan();
  }
};

// Aset & Inventaris
window.renderAsetInventaris = async function() {
  try {
    const aset = await API.get('/api/aset');
    const unitUsaha = await API.get('/api/unit-usaha');
    
    contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Aset & Inventaris</h3>
        <button class="btn btn-primary" onclick="tambahAset()">
          <i data-feather="plus"></i> Tambah Aset
        </button>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Aset</th>
              <th>Kategori</th>
              <th>Unit Usaha</th>
              <th>Nilai Perolehan</th>
              <th>Nilai Sekarang</th>
              <th>Tanggal Perolehan</th>
              <th>Kondisi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${aset.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${item.nama_aset}</strong></td>
                <td>${item.kategori || '-'}</td>
                <td>${item.nama_usaha || 'Umum'}</td>
                <td>${formatCurrency(item.nilai || 0)}</td>
                <td><strong>${formatCurrency(item.nilai_sekarang || item.nilai || 0)}</strong></td>
                <td>${formatDate(item.tanggal_perolehan)}</td>
                <td><span class="badge badge-${item.kondisi === 'Baik' ? 'success' : item.kondisi === 'Rusak' ? 'danger' : 'warning'}">${item.kondisi}</span></td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-warning" onclick="editAset(${item.id})">
                      <i data-feather="edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="hapusAset(${item.id})">
                      <i data-feather="trash-2"></i> Hapus
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
  } catch (error) {
    console.error('Error rendering aset:', error);
    contentArea.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Aset & Inventaris</h3>
          <button class="btn btn-primary" onclick="tambahAset()">
            <i data-feather="plus"></i> Tambah Aset
          </button>
        </div>
        <div class="error-message">
          Error: ${error.message || 'Gagal memuat data aset'}
          <br><small>Pastikan tabel aset_inventaris sudah dibuat. Coba reset database jika perlu.</small>
        </div>
      </div>
    `;
    feather.replace();
  }
};

window.tambahAset = async function() {
  const unitUsaha = await API.get('/api/unit-usaha');
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Aset & Inventaris</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahAsetForm">
        <div class="form-group">
          <label>Nama Aset *</label>
          <input type="text" name="nama_aset" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Kategori</label>
            <select name="kategori">
              <option value="">Pilih Kategori</option>
              <option value="Properti">Properti</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Furniture">Furniture</option>
              <option value="Kendaraan">Kendaraan</option>
              <option value="Peralatan">Peralatan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div class="form-group">
            <label>Unit Usaha</label>
            <select name="unit_usaha_id">
              <option value="">Umum</option>
              ${unitUsaha.filter(u => u.status === 'Aktif').map(u => `
                <option value="${u.id}">${u.nama_usaha}</option>
              `).join('')}
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nilai Perolehan (Rp) *</label>
            <input type="number" name="nilai" min="0" step="1000" required>
          </div>
          <div class="form-group">
            <label>Nilai Sekarang (Rp) *</label>
            <input type="number" name="nilai_sekarang" min="0" step="1000" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Tanggal Perolehan *</label>
          <input type="date" name="tanggal_perolehan" required>
        </div>
        
        <div class="form-group">
          <label>Kondisi</label>
          <select name="kondisi">
            <option value="Baik">Baik</option>
            <option value="Cukup">Cukup</option>
            <option value="Rusak">Rusak</option>
          </select>
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
  
  document.getElementById('tambahAsetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.post('/api/aset', data);
    alert(result.message);
    modal.remove();
    window.renderAsetInventaris();
  });
};

window.editAset = async function(id) {
  const aset = await API.get('/api/aset');
  const unitUsaha = await API.get('/api/unit-usaha');
  const item = aset.find(a => a.id === id);
  
  if (!item) {
    alert('Data tidak ditemukan');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Aset & Inventaris</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editAsetForm">
        <div class="form-group">
          <label>Nama Aset *</label>
          <input type="text" name="nama_aset" value="${item.nama_aset}" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Kategori</label>
            <select name="kategori">
              <option value="">Pilih Kategori</option>
              <option value="Properti" ${item.kategori === 'Properti' ? 'selected' : ''}>Properti</option>
              <option value="Elektronik" ${item.kategori === 'Elektronik' ? 'selected' : ''}>Elektronik</option>
              <option value="Furniture" ${item.kategori === 'Furniture' ? 'selected' : ''}>Furniture</option>
              <option value="Kendaraan" ${item.kategori === 'Kendaraan' ? 'selected' : ''}>Kendaraan</option>
              <option value="Peralatan" ${item.kategori === 'Peralatan' ? 'selected' : ''}>Peralatan</option>
              <option value="Lainnya" ${item.kategori === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
            </select>
          </div>
          <div class="form-group">
            <label>Unit Usaha</label>
            <select name="unit_usaha_id">
              <option value="">Umum</option>
              ${unitUsaha.filter(u => u.status === 'Aktif').map(u => `
                <option value="${u.id}" ${u.id === item.unit_usaha_id ? 'selected' : ''}>${u.nama_usaha}</option>
              `).join('')}
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nilai Perolehan (Rp) *</label>
            <input type="number" name="nilai" min="0" step="1000" value="${item.nilai}" required>
          </div>
          <div class="form-group">
            <label>Nilai Sekarang (Rp) *</label>
            <input type="number" name="nilai_sekarang" min="0" step="1000" value="${item.nilai_sekarang || item.nilai}" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Tanggal Perolehan *</label>
          <input type="date" name="tanggal_perolehan" value="${item.tanggal_perolehan}" required>
        </div>
        
        <div class="form-group">
          <label>Kondisi</label>
          <select name="kondisi">
            <option value="Baik" ${item.kondisi === 'Baik' ? 'selected' : ''}>Baik</option>
            <option value="Cukup" ${item.kondisi === 'Cukup' ? 'selected' : ''}>Cukup</option>
            <option value="Rusak" ${item.kondisi === 'Rusak' ? 'selected' : ''}>Rusak</option>
          </select>
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
  
  document.getElementById('editAsetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await API.put(`/api/aset/${id}`, data);
    alert(result.message);
    modal.remove();
    window.renderAsetInventaris();
  });
};

window.hapusAset = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
    const result = await API.delete(`/api/aset/${id}`);
    alert(result.message);
    window.renderAsetInventaris();
  }
};



// Debug: Log fungsi yang sudah didefinisikan
console.log('pages-management.js loaded');
console.log('renderDataPengurus:', typeof window.renderDataPengurus);
console.log('renderDataKaryawan:', typeof window.renderDataKaryawan);
console.log('renderAsetInventaris:', typeof window.renderAsetInventaris);


// Export Pengurus to Excel (CSV)
window.exportPengurusExcel = async function() {
  const pengurus = await API.get('/api/pengurus');
  
  let csv = 'No,No. Anggota,Nama Lengkap,Jabatan,Periode Mulai,Periode Selesai,Status\n';
  
  pengurus.forEach((item, index) => {
    csv += `${index + 1},"${item.nomor_anggota}","${item.nama_lengkap}","${item.jabatan}","${formatDate(item.periode_mulai)}","${formatDate(item.periode_selesai)}","${item.status}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `data-pengurus-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Data pengurus berhasil diexport', 'success');
};

// Cetak Pengurus
window.cetakPengurus = async function() {
  const pengurus = await API.get('/api/pengurus');
  const info = await API.get('/api/koperasi-info');
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Data Pengurus - ${info.nama_koperasi || 'Koperasi'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 5px 0; }
        .header p { margin: 3px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #2E7D32; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
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
        <h3 style="margin-top: 15px;">DATA PENGURUS</h3>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>No. Anggota</th>
            <th>Nama Lengkap</th>
            <th>Jabatan</th>
            <th>Periode</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${pengurus.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.nomor_anggota}</td>
              <td>${item.nama_lengkap}</td>
              <td>${item.jabatan}</td>
              <td>${formatDate(item.periode_mulai)} s/d ${formatDate(item.periode_selesai)}</td>
              <td>${item.status}</td>
            </tr>
          `).join('')}
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
};

// Export Karyawan to Excel (CSV)
window.exportKaryawanExcel = async function() {
  const karyawan = await API.get('/api/karyawan');
  
  let csv = 'No,NIK,Nama Lengkap,Jabatan,Departemen,Tanggal Masuk,Status\n';
  
  karyawan.forEach((item, index) => {
    csv += `${index + 1},"${item.nik}","${item.nama_lengkap}","${item.jabatan}","${item.departemen}","${formatDate(item.tanggal_masuk)}","${item.status}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `data-karyawan-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showNotification('Data karyawan berhasil diexport', 'success');
};

// Cetak Karyawan
window.cetakKaryawan = async function() {
  const karyawan = await API.get('/api/karyawan');
  const info = await API.get('/api/koperasi-info');
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Data Karyawan - ${info.nama_koperasi || 'Koperasi'}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h2 { margin: 5px 0; }
        .header p { margin: 3px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #2E7D32; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
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
        <h3 style="margin-top: 15px;">DATA KARYAWAN</h3>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>NIK</th>
            <th>Nama Lengkap</th>
            <th>Jabatan</th>
            <th>Departemen</th>
            <th>Tanggal Masuk</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${karyawan.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.nik}</td>
              <td>${item.nama_lengkap}</td>
              <td>${item.jabatan}</td>
              <td>${item.departemen}</td>
              <td>${formatDate(item.tanggal_masuk)}</td>
              <td>${item.status}</td>
            </tr>
          `).join('')}
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
};


