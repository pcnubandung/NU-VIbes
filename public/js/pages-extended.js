// Extended pages for new features

// Unit Usaha dengan Tile Modern
window.renderUnitUsaha = async function() {
  const unitUsaha = await API.get('/api/unit-usaha');
  
  contentArea.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Data Unit Usaha</h3>
        <button class="btn btn-primary" onclick="tambahUnitUsaha()">
          <i data-feather="plus"></i> Tambah Unit Usaha
        </button>
      </div>
      
      <div class="unit-usaha-grid">
        ${unitUsaha.map(item => `
          <div class="unit-tile ${item.status === 'Aktif' ? 'active' : 'inactive'}">
            <div class="unit-tile-header">
              ${item.logo ? `<img src="/uploads/${item.logo}" class="unit-logo" alt="${item.nama_usaha}">` : 
                `<div class="unit-logo-placeholder"><i data-feather="briefcase"></i></div>`}
              <span class="unit-status badge badge-${item.status === 'Aktif' ? 'success' : 'danger'}">${item.status}</span>
            </div>
            
            <div class="unit-tile-body">
              <h4 class="unit-name">${item.nama_usaha}</h4>
              <p class="unit-jenis"><i data-feather="tag"></i> ${item.jenis_usaha || '-'}</p>
              <p class="unit-desc">${item.deskripsi || 'Tidak ada deskripsi'}</p>
              
              <div class="unit-info">
                <div class="info-item">
                  <i data-feather="calendar"></i>
                  <span>${item.tanggal_mulai ? formatDate(item.tanggal_mulai) : '-'}</span>
                </div>
                <div class="info-item">
                  <i data-feather="dollar-sign"></i>
                  <span>${formatCurrency(item.modal_awal || 0)}</span>
                </div>
              </div>
            </div>
            
            <div class="unit-tile-footer">
              <button class="btn btn-sm btn-info" onclick="detailUnitUsaha(${item.id})">
                <i data-feather="eye"></i> Detail
              </button>
              <button class="btn btn-sm btn-warning" onclick="editUnitUsaha(${item.id})">
                <i data-feather="edit"></i> Edit
              </button>
              <button class="btn btn-sm btn-danger" onclick="hapusUnitUsaha(${item.id})">
                <i data-feather="trash-2"></i> Hapus
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  feather.replace();
}

window.tambahUnitUsaha = function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Tambah Unit Usaha</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="tambahUnitUsahaForm">
        <div class="form-group">
          <label>Nama Usaha *</label>
          <input type="text" name="nama_usaha" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jenis Usaha *</label>
            <select name="jenis_usaha" required>
              <option value="">Pilih Jenis</option>
              <option value="Ritel">Ritel</option>
              <option value="Kuliner">Kuliner</option>
              <option value="Jasa">Jasa</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status *</label>
            <select name="status" required>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Tanggal Mulai</label>
            <input type="date" name="tanggal_mulai">
          </div>
          <div class="form-group">
            <label>Modal Awal (Rp)</label>
            <input type="number" name="modal_awal" min="0" step="1000" value="0">
          </div>
        </div>
        
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea name="deskripsi" rows="3"></textarea>
        </div>
        
        <div class="form-group">
          <label>Logo</label>
          <input type="file" name="logo" accept="image/*">
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
  
  document.getElementById('tambahUnitUsahaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/unit-usaha', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Unit usaha berhasil ditambahkan');
        modal.remove();
        renderUnitUsaha();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

window.editUnitUsaha = async function(id) {
  const unitUsaha = await API.get('/api/unit-usaha');
  const unit = unitUsaha.find(u => u.id === id);
  
  if (!unit) {
    alert('Data tidak ditemukan');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Unit Usaha</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editUnitUsahaForm">
        <div class="form-group">
          <label>Nama Usaha *</label>
          <input type="text" name="nama_usaha" value="${unit.nama_usaha}" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Jenis Usaha *</label>
            <select name="jenis_usaha" required>
              <option value="">Pilih Jenis</option>
              <option value="Ritel" ${unit.jenis_usaha === 'Ritel' ? 'selected' : ''}>Ritel</option>
              <option value="Kuliner" ${unit.jenis_usaha === 'Kuliner' ? 'selected' : ''}>Kuliner</option>
              <option value="Jasa" ${unit.jenis_usaha === 'Jasa' ? 'selected' : ''}>Jasa</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status *</label>
            <select name="status" required>
              <option value="Aktif" ${unit.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
              <option value="Tidak Aktif" ${unit.status === 'Tidak Aktif' ? 'selected' : ''}>Tidak Aktif</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Tanggal Mulai</label>
            <input type="date" name="tanggal_mulai" value="${unit.tanggal_mulai || ''}">
          </div>
          <div class="form-group">
            <label>Modal Awal (Rp)</label>
            <input type="number" name="modal_awal" min="0" step="1000" value="${unit.modal_awal || 0}">
          </div>
        </div>
        
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea name="deskripsi" rows="3">${unit.deskripsi || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label>Logo</label>
          <input type="file" name="logo" accept="image/*">
          ${unit.logo ? `<p style="margin-top: 5px; font-size: 12px; color: #666;">Logo saat ini: ${unit.logo}</p>` : ''}
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
  
  document.getElementById('editUnitUsahaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`/api/unit-usaha/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Unit usaha berhasil diupdate');
        modal.remove();
        renderUnitUsaha();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

window.detailUnitUsaha = async function(id) {
  const unitUsaha = await API.get('/api/unit-usaha');
  const unit = unitUsaha.find(u => u.id === id);
  
  if (!unit) {
    alert('Data tidak ditemukan');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Detail Unit Usaha</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        ${unit.logo ? `<img src="/uploads/${unit.logo}" style="max-width: 150px; border-radius: 10px;">` : 
          `<div style="width: 150px; height: 150px; background: #f0f0f0; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">
            <i data-feather="briefcase" style="width: 60px; height: 60px;"></i>
          </div>`}
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Nama Usaha</label>
          <p><strong>${unit.nama_usaha}</strong></p>
        </div>
        <div class="form-group">
          <label>Jenis Usaha</label>
          <p><strong>${unit.jenis_usaha || '-'}</strong></p>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Status</label>
          <p><span class="badge badge-${unit.status === 'Aktif' ? 'success' : 'danger'}">${unit.status}</span></p>
        </div>
        <div class="form-group">
          <label>Tanggal Mulai</label>
          <p>${unit.tanggal_mulai ? formatDate(unit.tanggal_mulai) : '-'}</p>
        </div>
      </div>
      
      <div class="form-group">
        <label>Modal Awal</label>
        <p><strong>${formatCurrency(unit.modal_awal || 0)}</strong></p>
      </div>
      
      <div class="form-group">
        <label>Deskripsi</label>
        <p>${unit.deskripsi || 'Tidak ada deskripsi'}</p>
      </div>
      
      <div class="btn-group" style="margin-top: 20px;">
        <button class="btn btn-warning" onclick="this.closest('.modal').remove(); editUnitUsaha(${id});">
          <i data-feather="edit"></i> Edit
        </button>
        <button class="btn btn-danger" onclick="this.closest('.modal').remove()">
          <i data-feather="x"></i> Tutup
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  feather.replace();
};


window.hapusUnitUsaha = async function(id) {
  if (confirm('Apakah Anda yakin ingin menghapus unit usaha ini?\n\nPeringatan: Data aset, karyawan, dan transaksi yang terkait dengan unit usaha ini mungkin terpengaruh.')) {
    try {
      const result = await API.delete(`/api/unit-usaha/${id}`);
      alert(result.message || 'Unit usaha berhasil dihapus');
      window.renderUnitUsaha();
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message);
    }
  }
};
