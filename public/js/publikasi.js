// Publikasi Page - Artikel, Galeri, Pengumuman
window.renderPublikasi = async function() {
  contentArea.innerHTML = `
    <div class="page-header">
      <h2><i data-feather="book-open"></i> Publikasi & Konten</h2>
      <p>Kelola artikel, galeri, dan pengumuman</p>
    </div>

    <div class="tab-navigation">
      <button class="tab-btn active" data-tab="artikel">
        <i data-feather="file-text"></i> Artikel & Berita
      </button>
      <button class="tab-btn" data-tab="galeri">
        <i data-feather="image"></i> Galeri
      </button>
      <button class="tab-btn" data-tab="pengumuman">
        <i data-feather="bell"></i> Pengumuman
      </button>
      <button class="tab-btn" data-tab="pesan">
        <i data-feather="mail"></i> Pesan Kontak
        <span class="tab-badge" id="pesanBadge" style="display: none;">0</span>
      </button>
    </div>

    <div class="tab-content">
      <div class="tab-pane active" id="tab-artikel"></div>
      <div class="tab-pane" id="tab-galeri"></div>
      <div class="tab-pane" id="tab-pengumuman"></div>
      <div class="tab-pane" id="tab-pesan"></div>
    </div>
  `;
  
  setupTabNavigation();
  loadArtikelTab();
  feather.replace();
};

function setupTabNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`tab-${tabName}`).classList.add('active');
      
      if (tabName === 'artikel') loadArtikelTab();
      else if (tabName === 'galeri') loadGaleriTab();
      else if (tabName === 'pengumuman') loadPengumumanTab();
      else if (tabName === 'pesan') loadPesanTab();
      
      feather.replace();
    });
  });
}

// ===== ARTIKEL TAB =====
async function loadArtikelTab() {
  const container = document.getElementById('tab-artikel');
  container.innerHTML = '<div class="loading">Memuat data...</div>';
  
  try {
    const data = await API.get('/api/artikel');
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Artikel & Berita</h3>
          <button class="btn btn-primary" onclick="tambahArtikel()">
            <i data-feather="plus"></i> Tambah Artikel
          </button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th width="50">No</th>
                <th width="80">Gambar</th>
                <th>Judul</th>
                <th width="120">Kategori</th>
                <th width="120">Status</th>
                <th width="80">Views</th>
                <th width="120">Tanggal</th>
                <th width="180">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${data.length > 0 ? data.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    ${item.gambar_utama ? 
                      `<img src="/uploads/${item.gambar_utama}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">` : 
                      '<div style="width: 60px; height: 40px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i data-feather="image" style="width: 20px; height: 20px; color: #ccc;"></i></div>'
                    }
                  </td>
                  <td><strong>${item.judul}</strong></td>
                  <td><span class="badge badge-info">${item.kategori || 'Berita'}</span></td>
                  <td><span class="badge badge-${item.status === 'published' ? 'success' : 'warning'}">${item.status === 'published' ? 'Published' : 'Draft'}</span></td>
                  <td style="text-align: center;">${item.views || 0}</td>
                  <td>${formatDate(item.tanggal_publikasi || item.created_at)}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-warning" onclick="editArtikel(${item.id})" title="Edit">
                        <i data-feather="edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" onclick="hapusArtikel(${item.id})" title="Hapus">
                        <i data-feather="trash-2"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="8" style="text-align: center; color: #999;">Belum ada artikel</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    feather.replace();
  } catch (error) {
    container.innerHTML = '<div class="error-state">Gagal memuat data</div>';
  }
}

window.tambahArtikel = function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>Tambah Artikel</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <form id="formArtikel" enctype="multipart/form-data">
        <div class="form-group">
          <label>Judul *</label>
          <input type="text" name="judul" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Kategori</label>
            <select name="kategori">
              <option value="berita">Berita</option>
              <option value="artikel">Artikel</option>
              <option value="tutorial">Tutorial</option>
              <option value="pengumuman">Pengumuman</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select name="status">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Ringkasan</label>
          <textarea name="ringkasan" rows="3" placeholder="Ringkasan singkat artikel..."></textarea>
        </div>
        <div class="form-group">
          <label>Konten *</label>
          <textarea name="konten" rows="10" required placeholder="Tulis konten artikel di sini..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Gambar Utama</label>
            <input type="file" name="gambar_utama" accept="image/*">
          </div>
          <div class="form-group">
            <label>Tanggal Publikasi</label>
            <input type="date" name="tanggal_publikasi" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-group">
          <label>Penulis</label>
          <input type="text" name="penulis" value="${user.nama_lengkap || 'Admin'}">
        </div>
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('formArtikel').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Generate slug from judul
    const judul = formData.get('judul');
    const slug = judul.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    formData.append('slug', slug);
    
    try {
      const response = await fetch('/api/artikel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (response.ok) {
        alert('Artikel berhasil ditambahkan');
        modal.remove();
        loadArtikelTab();
      } else {
        alert('Gagal menambahkan artikel');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

window.editArtikel = async function(id) {
  const artikel = await API.get(`/api/artikel`);
  const item = artikel.find(a => a.id === id);
  if (!item) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>Edit Artikel</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <form id="formEditArtikel" enctype="multipart/form-data">
        <div class="form-group">
          <label>Judul *</label>
          <input type="text" name="judul" value="${item.judul}" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Kategori</label>
            <select name="kategori">
              <option value="berita" ${item.kategori === 'berita' ? 'selected' : ''}>Berita</option>
              <option value="artikel" ${item.kategori === 'artikel' ? 'selected' : ''}>Artikel</option>
              <option value="tutorial" ${item.kategori === 'tutorial' ? 'selected' : ''}>Tutorial</option>
              <option value="pengumuman" ${item.kategori === 'pengumuman' ? 'selected' : ''}>Pengumuman</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select name="status">
              <option value="draft" ${item.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="published" ${item.status === 'published' ? 'selected' : ''}>Published</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Ringkasan</label>
          <textarea name="ringkasan" rows="3">${item.ringkasan || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Konten *</label>
          <textarea name="konten" rows="10" required>${item.konten}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Gambar Utama</label>
            ${item.gambar_utama ? `<img src="/uploads/${item.gambar_utama}" style="max-width: 200px; margin-bottom: 10px; border-radius: 8px;">` : ''}
            <input type="file" name="gambar_utama" accept="image/*">
          </div>
          <div class="form-group">
            <label>Tanggal Publikasi</label>
            <input type="date" name="tanggal_publikasi" value="${item.tanggal_publikasi || new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-group">
          <label>Penulis</label>
          <input type="text" name="penulis" value="${item.penulis || ''}">
        </div>
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Update</button>
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('formEditArtikel').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Generate slug from judul
    const judul = formData.get('judul');
    const slug = judul.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    formData.append('slug', slug);
    
    try {
      const response = await fetch(`/api/artikel/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (response.ok) {
        alert('Artikel berhasil diupdate');
        modal.remove();
        loadArtikelTab();
      } else {
        alert('Gagal mengupdate artikel');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

window.hapusArtikel = async function(id) {
  if (!confirm('Yakin ingin menghapus artikel ini?')) return;
  
  try {
    await API.delete(`/api/artikel/${id}`);
    alert('Artikel berhasil dihapus');
    loadArtikelTab();
  } catch (error) {
    alert('Gagal menghapus artikel');
  }
};

// ===== GALERI TAB =====
async function loadGaleriTab() {
  const container = document.getElementById('tab-galeri');
  container.innerHTML = '<div class="loading">Memuat data...</div>';
  
  try {
    const data = await API.get('/api/galeri');
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Galeri Komunitas</h3>
          <button class="btn btn-primary" onclick="tambahGaleri()">
            <i data-feather="plus"></i> Tambah Foto
          </button>
        </div>
        <div class="galeri-grid">
          ${data.length > 0 ? data.map(item => `
            <div class="galeri-item">
              <img src="/uploads/${item.gambar}" alt="${item.judul}">
              <div class="galeri-overlay">
                <h4>${item.judul}</h4>
                <p>${item.deskripsi || ''}</p>
                <span class="badge badge-info">${item.kategori}</span>
                <div class="galeri-actions">
                  <button class="btn btn-sm btn-warning" onclick="editGaleri(${item.id})">
                    <i data-feather="edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="hapusGaleri(${item.id})">
                    <i data-feather="trash-2"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('') : '<p style="text-align: center; color: #999; padding: 40px;">Belum ada foto di galeri</p>'}
        </div>
      </div>
    `;
    
    feather.replace();
  } catch (error) {
    container.innerHTML = '<div class="error-state">Gagal memuat data</div>';
  }
}

window.tambahGaleri = function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Tambah Foto Galeri</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <form id="formGaleri" enctype="multipart/form-data">
        <div class="form-group">
          <label>Judul *</label>
          <input type="text" name="judul" required>
        </div>
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea name="deskripsi" rows="3"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Kategori</label>
            <select name="kategori">
              <option value="kegiatan">Kegiatan</option>
              <option value="rapat">Rapat</option>
              <option value="pelatihan">Pelatihan</option>
              <option value="acara">Acara</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tanggal Kegiatan</label>
            <input type="date" name="tanggal_kegiatan" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Foto *</label>
            <input type="file" name="gambar" accept="image/*" required>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select name="status">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Simpan</button>
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('formGaleri').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('urutan', 0);
    
    try {
      const response = await fetch('/api/galeri', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (response.ok) {
        alert('Foto berhasil ditambahkan');
        modal.remove();
        loadGaleriTab();
      } else {
        alert('Gagal menambahkan foto');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

window.editGaleri = async function(id) {
  const galeri = await API.get(`/api/galeri`);
  const item = galeri.find(g => g.id === id);
  if (!item) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Edit Foto Galeri</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <form id="formEditGaleri" enctype="multipart/form-data">
        <div class="form-group">
          <label>Judul *</label>
          <input type="text" name="judul" value="${item.judul}" required>
        </div>
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea name="deskripsi" rows="3">${item.deskripsi || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Kategori</label>
            <select name="kategori">
              <option value="kegiatan" ${item.kategori === 'kegiatan' ? 'selected' : ''}>Kegiatan</option>
              <option value="rapat" ${item.kategori === 'rapat' ? 'selected' : ''}>Rapat</option>
              <option value="pelatihan" ${item.kategori === 'pelatihan' ? 'selected' : ''}>Pelatihan</option>
              <option value="acara" ${item.kategori === 'acara' ? 'selected' : ''}>Acara</option>
              <option value="lainnya" ${item.kategori === 'lainnya' ? 'selected' : ''}>Lainnya</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tanggal Kegiatan</label>
            <input type="date" name="tanggal_kegiatan" value="${item.tanggal_kegiatan || ''}">
          </div>
        </div>
        <div class="form-group">
          <label>Foto Saat Ini</label>
          <img src="/uploads/${item.gambar}" style="max-width: 200px; margin-bottom: 10px; border-radius: 8px;">
          <input type="file" name="gambar" accept="image/*">
        </div>
        <div class="form-group">
          <label>Status</label>
          <select name="status">
            <option value="aktif" ${item.status === 'aktif' ? 'selected' : ''}>Aktif</option>
            <option value="nonaktif" ${item.status === 'nonaktif' ? 'selected' : ''}>Nonaktif</option>
          </select>
        </div>
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">Update</button>
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('formEditGaleri').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('urutan', item.urutan || 0);
    
    try {
      const response = await fetch(`/api/galeri/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (response.ok) {
        alert('Foto berhasil diupdate');
        modal.remove();
        loadGaleriTab();
      } else {
        alert('Gagal mengupdate foto');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  });
};

window.hapusGaleri = async function(id) {
  if (!confirm('Yakin ingin menghapus foto ini?')) return;
  
  try {
    await API.delete(`/api/galeri/${id}`);
    alert('Foto berhasil dihapus');
    loadGaleriTab();
  } catch (error) {
    alert('Gagal menghapus foto');
  }
};

// ===== PENGUMUMAN TAB =====
async function loadPengumumanTab() {
  const container = document.getElementById('tab-pengumuman');
  container.innerHTML = '<div class="loading">Memuat data...</div>';
  
  try {
    const data = await API.get('/api/pengumuman');
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Pengumuman & Banner</h3>
          <button class="btn btn-primary" onclick="tambahPengumuman()">
            <i data-feather="plus"></i> Tambah Pengumuman
          </button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th width="50">No</th>
                <th>Judul</th>
                <th width="120">Tipe</th>
                <th width="120">Status</th>
                <th width="150">Periode</th>
                <th width="180">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${data.length > 0 ? data.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${item.judul}</strong></td>
                  <td><span class="badge badge-info">${item.tipe}</span></td>
                  <td><span class="badge badge-${item.status === 'aktif' ? 'success' : 'secondary'}">${item.status}</span></td>
                  <td>${formatDate(item.tanggal_mulai)} - ${formatDate(item.tanggal_selesai)}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-warning" onclick="editPengumuman(${item.id})" title="Edit">
                        <i data-feather="edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" onclick="hapusPengumuman(${item.id})" title="Hapus">
                        <i data-feather="trash-2"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="6" style="text-align: center; color: #999;">Belum ada pengumuman</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    feather.replace();
  } catch (error) {
    container.innerHTML = '<div class="error-state">Gagal memuat data</div>';
  }
}

// Pengumuman functions (simplified - reuse existing if available)
window.tambahPengumuman = function() {
  if (window.renderPengumuman) {
    // If old pengumuman page exists, use its functions
    return;
  }
  
  alert('Fitur pengumuman akan segera tersedia');
};

window.editPengumuman = function(id) {
  alert('Fitur edit pengumuman akan segera tersedia');
};

window.hapusPengumuman = async function(id) {
  if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
  
  try {
    await API.delete(`/api/pengumuman/${id}`);
    alert('Pengumuman berhasil dihapus');
    loadPengumumanTab();
  } catch (error) {
    alert('Gagal menghapus pengumuman');
  }
};


// ===== PESAN KONTAK TAB =====
async function loadPesanTab() {
  const container = document.getElementById('tab-pesan');
  container.innerHTML = '<div class="loading">Memuat data...</div>';
  
  try {
    const data = await API.get('/api/kontak');
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Pesan Kontak</h3>
          <div class="badge-count">${data.length} pesan</div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th width="50">No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Pesan</th>
                <th width="100">Status</th>
                <th width="150">Tanggal</th>
                <th width="150">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${data.length > 0 ? data.map((item, index) => `
                <tr class="${item.status === 'unread' ? 'unread-row' : ''}">
                  <td>${index + 1}</td>
                  <td><strong>${item.nama}</strong></td>
                  <td>${item.email}</td>
                  <td>${item.telepon || '-'}</td>
                  <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.pesan}</td>
                  <td>
                    <span class="badge badge-${item.status === 'unread' ? 'warning' : 'success'}">
                      ${item.status === 'unread' ? 'Belum Dibaca' : 'Sudah Dibaca'}
                    </span>
                  </td>
                  <td>${formatDate(item.created_at)}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-info" onclick="viewPesan(${item.id}, '${item.nama}', '${item.email}', '${item.telepon || ''}', \`${item.pesan.replace(/`/g, '\\`')}\`, '${item.status}')" title="Lihat">
                        <i data-feather="eye"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" onclick="hapusPesan(${item.id})" title="Hapus">
                        <i data-feather="trash-2"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="8" style="text-align: center; color: #999;">Belum ada pesan</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // Update badge
    const unreadCount = data.filter(p => p.status === 'unread').length;
    const badge = document.getElementById('pesanBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
    
    feather.replace();
  } catch (error) {
    container.innerHTML = '<div class="error-state">Gagal memuat data</div>';
  }
}

window.viewPesan = function(id, nama, email, telepon, pesan, status) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Detail Pesan</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <div class="pesan-detail">
        <div class="detail-row">
          <strong>Nama:</strong>
          <span>${nama}</span>
        </div>
        <div class="detail-row">
          <strong>Email:</strong>
          <span><a href="mailto:${email}">${email}</a></span>
        </div>
        <div class="detail-row">
          <strong>Telepon:</strong>
          <span>${telepon || '-'}</span>
        </div>
        <div class="detail-row">
          <strong>Pesan:</strong>
          <p style="margin-top: 8px; line-height: 1.6; white-space: pre-wrap;">${pesan}</p>
        </div>
      </div>
      <div class="btn-group">
        ${status === 'unread' ? `
          <button class="btn btn-primary" onclick="markAsRead(${id})">
            <i data-feather="check"></i> Tandai Sudah Dibaca
          </button>
        ` : ''}
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Tutup</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  feather.replace();
};

window.markAsRead = async function(id) {
  try {
    await API.put(`/api/kontak/${id}/read`);
    alert('Pesan ditandai sudah dibaca');
    document.querySelector('.modal').remove();
    loadPesanTab();
  } catch (error) {
    alert('Gagal mengupdate status');
  }
};

window.hapusPesan = async function(id) {
  if (!confirm('Yakin ingin menghapus pesan ini?')) return;
  
  try {
    await API.delete(`/api/kontak/${id}`);
    alert('Pesan berhasil dihapus');
    loadPesanTab();
  } catch (error) {
    alert('Gagal menghapus pesan');
  }
};

// Load unread count on page load
async function loadUnreadCount() {
  try {
    const response = await fetch('/api/kontak/unread/count', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    
    const badge = document.getElementById('pesanBadge');
    if (badge && data.count > 0) {
      badge.textContent = data.count;
      badge.style.display = 'inline-block';
    }
  } catch (error) {
    console.error('Error loading unread count:', error);
  }
}

// Load unread count when publikasi page loads
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  setTimeout(loadUnreadCount, 1000);
}
