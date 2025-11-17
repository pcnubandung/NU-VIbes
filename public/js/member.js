// Member Portal JavaScript

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'Member') {
  window.location.href = '/member-login.html';
}

// Get member data from user
let memberData = null;

// Load logo koperasi
async function loadMemberPortalLogo() {
  try {
    const response = await fetch('/api/koperasi/logo');
    const data = await response.json();
    
    if (data.logo) {
      const memberPortalLogo = document.getElementById('memberPortalLogo');
      const memberPortalLogoPlaceholder = document.getElementById('memberPortalLogoPlaceholder');
      
      memberPortalLogo.src = data.logo;
      memberPortalLogo.style.display = 'block';
      if (memberPortalLogoPlaceholder) memberPortalLogoPlaceholder.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading logo:', error);
  }
}

// Load logo on page load
loadMemberPortalLogo();

// Update current date
function updateMemberCurrentDate() {
  const dateElement = document.getElementById('memberDateText');
  if (!dateElement) return;
  
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const dateString = now.toLocaleDateString('id-ID', options);
  dateElement.textContent = dateString;
}

// Update date on page load
updateMemberCurrentDate();

// Update date every minute
setInterval(updateMemberCurrentDate, 60000);

// API Helper
const API = {
  async get(url) {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },
  
  async post(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },
  
  async put(url, data) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
};

// Helper Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0);
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadMemberData();
  loadPage('dashboard');
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      loadPage(item.getAttribute('data-page'));
    });
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('memberData');
      window.location.href = '/member-login.html';
    }
  });
});

// Load member data
async function loadMemberData() {
  try {
    // Get member profile from API
    const response = await fetch('/api/member/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load profile');
    }
    
    memberData = await response.json();
    localStorage.setItem('memberData', JSON.stringify(memberData));
    
    // Update header
    document.getElementById('memberName').textContent = memberData.nama_lengkap || 'Member';
    
    if (memberData.foto) {
      document.getElementById('memberAvatar').innerHTML = `<img src="/uploads/${memberData.foto}" alt="Avatar">`;
    }
  } catch (error) {
    console.error('Error loading member data:', error);
    // If error, try to use cached data
    const cached = localStorage.getItem('memberData');
    if (cached) {
      memberData = JSON.parse(cached);
      document.getElementById('memberName').textContent = memberData.nama_lengkap || 'Member';
    } else {
      alert('Gagal memuat data. Silakan login kembali.');
      window.location.href = '/member-login.html';
    }
  }
}

// Load page
async function loadPage(page) {
  const content = document.getElementById('memberContent');
  content.innerHTML = '<div class="loading-member"><i data-feather="loader"></i><p>Memuat...</p></div>';
  feather.replace();
  
  try {
    switch(page) {
      case 'dashboard':
        await renderDashboard();
        break;
      case 'profil':
        await renderProfil();
        break;
      case 'simpanan':
        await renderSimpanan();
        break;
      case 'transaksi':
        await renderTransaksi();
        break;
      case 'laporan':
        await renderLaporan();
        break;
      case 'shu':
        await renderSHU();
        break;
      default:
        content.innerHTML = '<div class="empty-state"><i data-feather="alert-circle"></i><h3>Halaman tidak ditemukan</h3></div>';
    }
    feather.replace();
  } catch (error) {
    console.error('Error loading page:', error);
    content.innerHTML = '<div class="empty-state"><i data-feather="alert-circle"></i><h3>Terjadi kesalahan</h3><p>Silakan refresh halaman</p></div>';
    feather.replace();
  }
}

// Render Dashboard
async function renderDashboard() {
  if (!memberData) {
    console.error('memberData is null');
    return;
  }
  
  console.log('Loading dashboard for member:', memberData.id);
  
  try {
    // Get simpanan data with error handling
    let simpananPokok = [];
    let simpananWajib = [];
    let simpananKhusus = [];
    let simpananSukarela = [];
    let partisipasi = [];
    
    try {
      simpananPokok = await API.get('/api/simpanan/pokok');
      console.log('Simpanan Pokok loaded:', simpananPokok.length);
    } catch (e) {
      console.error('Error loading simpanan pokok:', e);
    }
    
    try {
      simpananWajib = await API.get('/api/simpanan/wajib');
      console.log('Simpanan Wajib loaded:', simpananWajib.length);
    } catch (e) {
      console.error('Error loading simpanan wajib:', e);
    }
    
    try {
      simpananKhusus = await API.get('/api/simpanan/khusus');
      console.log('Simpanan Khusus loaded:', simpananKhusus.length);
    } catch (e) {
      console.error('Error loading simpanan khusus:', e);
    }
    
    try {
      simpananSukarela = await API.get('/api/simpanan/sukarela');
      console.log('Simpanan Sukarela loaded:', simpananSukarela.length);
    } catch (e) {
      console.error('Error loading simpanan sukarela:', e);
    }
    
    try {
      partisipasi = await API.get('/api/partisipasi');
      console.log('Partisipasi loaded:', partisipasi.length);
    } catch (e) {
      console.error('Error loading partisipasi:', e);
    }
    
    // Calculate totals for this member
    const totalPokok = simpananPokok
      .filter(s => s.anggota_id === memberData.id)
      .reduce((sum, s) => sum + s.jumlah, 0);
      
    const totalWajib = simpananWajib
      .filter(s => s.anggota_id === memberData.id)
      .reduce((sum, s) => sum + s.jumlah, 0);
      
    const totalKhusus = simpananKhusus
      .filter(s => s.anggota_id === memberData.id)
      .reduce((sum, s) => sum + s.jumlah, 0);
      
    const totalSukarela = simpananSukarela
      .filter(s => s.anggota_id === memberData.id)
      .reduce((sum, s) => sum + s.jumlah, 0);
      
    const totalSimpanan = totalPokok + totalWajib + totalKhusus + totalSukarela;
    
    const totalPartisipasi = partisipasi
      .filter(p => p.anggota_id === memberData.id)
      .reduce((sum, p) => sum + p.jumlah_transaksi, 0);
    
    // Get actual SHU from database (if calculated by admin)
    const currentYear = new Date().getFullYear();
    let estimasiSHU = 0;
    let shuStatus = 'Belum Dihitung';
    
    try {
      const shuData = await API.get(`/api/shu/anggota/${currentYear}`);
      const mySHU = shuData.find(s => s.anggota_id === memberData.id);
      
      if (mySHU) {
        estimasiSHU = mySHU.total_shu || 0;
        shuStatus = 'Sudah Dihitung';
      }
    } catch (error) {
      console.log('SHU belum dihitung untuk tahun ini');
    }
    
    console.log('Totals calculated:', { totalSimpanan, totalPartisipasi, estimasiSHU, shuStatus });
  
  // Get pengumuman aktif
  let pengumumanAktif = [];
  try {
    pengumumanAktif = await API.get('/api/pengumuman/aktif');
  } catch (error) {
    console.log('No active pengumuman');
  }
  
  const content = document.getElementById('memberContent');
  content.innerHTML = `
    ${pengumumanAktif.length > 0 ? `
    <div class="banner-slider" id="bannerSlider">
      <div class="banner-slides">
        ${pengumumanAktif.map((item, index) => {
          const showOverlay = item.tampilkan_judul || item.tampilkan_konten;
          return `
          <div class="banner-slide ${index === 0 ? 'active' : ''}" style="background-image: url('/uploads/${item.gambar}');">
            ${showOverlay ? `
            <div class="banner-overlay">
              ${item.tampilkan_judul && item.judul ? `<h3>${item.judul}</h3>` : ''}
              ${item.tampilkan_konten && item.konten ? `<p>${item.konten}</p>` : ''}
            </div>
            ` : ''}
          </div>
          `;
        }).join('')}
      </div>
      ${pengumumanAktif.length > 1 ? `
      <button class="banner-prev" onclick="changeBannerSlide(-1)">❮</button>
      <button class="banner-next" onclick="changeBannerSlide(1)">❯</button>
      <div class="banner-dots">
        ${pengumumanAktif.map((_, index) => `
          <span class="banner-dot ${index === 0 ? 'active' : ''}" onclick="currentBannerSlide(${index})"></span>
        `).join('')}
      </div>
      ` : ''}
    </div>
    ` : ''}
    
    <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
      <i data-feather="home" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
      Dashboard Saya
    </h2>
    
    <div class="dashboard-grid">
      <div class="stat-card-member success">
        <div class="stat-header">
          <div class="stat-icon">
            <i data-feather="dollar-sign"></i>
          </div>
        </div>
        <div class="stat-body">
          <h3>Total Simpanan</h3>
          <div class="stat-value">${formatCurrency(totalSimpanan)}</div>
          <div class="stat-label">Semua Jenis Simpanan</div>
        </div>
      </div>
      
      <div class="stat-card-member warning">
        <div class="stat-header">
          <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
            <i data-feather="trending-up"></i>
          </div>
        </div>
        <div class="stat-body">
          <h3>Total Partisipasi</h3>
          <div class="stat-value">${formatCurrency(totalPartisipasi)}</div>
          <div class="stat-label">Transaksi dengan Koperasi</div>
        </div>
      </div>
      
      <div class="stat-card-member">
        <div class="stat-header">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
            <i data-feather="gift"></i>
          </div>
        </div>
        <div class="stat-body">
          <h3>${shuStatus === 'Sudah Dihitung' ? 'SHU' : 'Estimasi SHU'} ${currentYear}</h3>
          <div class="stat-value">${formatCurrency(estimasiSHU)}</div>
          <div class="stat-label">${shuStatus === 'Sudah Dihitung' ? 'Sudah Dihitung' : 'Belum Dihitung'}</div>
        </div>
      </div>
      
      <div class="stat-card-member danger">
        <div class="stat-header">
          <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B6B, #EE5A6F);">
            <i data-feather="calendar"></i>
          </div>
        </div>
        <div class="stat-body">
          <h3>Masa Keanggotaan</h3>
          <div class="stat-value">${calculateMembership(memberData.tanggal_bergabung)}</div>
          <div class="stat-label">Sejak ${formatDate(memberData.tanggal_bergabung)}</div>
        </div>
      </div>
    </div>
    
    <div class="chart-container-member">
      <h3><i data-feather="pie-chart"></i> Komposisi Simpanan Saya</h3>
      <canvas id="simpananChart" style="max-height: 300px;"></canvas>
    </div>
    
    <div class="simpanan-table">
      <h3><i data-feather="list"></i> Ringkasan Simpanan</h3>
      <table>
        <thead>
          <tr>
            <th>Jenis Simpanan</th>
            <th>Jumlah Transaksi</th>
            <th>Total Simpanan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Simpanan Pokok</strong></td>
            <td>${simpananPokok.filter(s => s.anggota_id === memberData.id).length} transaksi</td>
            <td><strong>${formatCurrency(totalPokok)}</strong></td>
          </tr>
          <tr>
            <td><strong>Simpanan Wajib</strong></td>
            <td>${simpananWajib.filter(s => s.anggota_id === memberData.id).length} transaksi</td>
            <td><strong>${formatCurrency(totalWajib)}</strong></td>
          </tr>
          <tr>
            <td><strong>Simpanan Khusus</strong></td>
            <td>${simpananKhusus.filter(s => s.anggota_id === memberData.id).length} transaksi</td>
            <td><strong>${formatCurrency(totalKhusus)}</strong></td>
          </tr>
          <tr>
            <td><strong>Simpanan Sukarela</strong></td>
            <td>${simpananSukarela.filter(s => s.anggota_id === memberData.id).length} transaksi</td>
            <td><strong>${formatCurrency(totalSukarela)}</strong></td>
          </tr>
          <tr style="background: var(--member-bg); font-weight: 700;">
            <td>TOTAL</td>
            <td>${simpananPokok.filter(s => s.anggota_id === memberData.id).length + 
                  simpananWajib.filter(s => s.anggota_id === memberData.id).length +
                  simpananKhusus.filter(s => s.anggota_id === memberData.id).length +
                  simpananSukarela.filter(s => s.anggota_id === memberData.id).length} transaksi</td>
            <td><strong>${formatCurrency(totalSimpanan)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  
    // Render chart
    feather.replace();
    
    const ctx = document.getElementById('simpananChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Simpanan Pokok', 'Simpanan Wajib', 'Simpanan Khusus', 'Simpanan Sukarela'],
          datasets: [{
            data: [totalPokok, totalWajib, totalKhusus, totalSukarela],
            backgroundColor: ['#2E7D32', '#4CAF50', '#FFC107', '#FFD54F'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                font: {
                  size: 14
                }
              }
            }
          }
        }
      });
    }
    
    console.log('Dashboard rendered successfully');
  } catch (error) {
    console.error('Error in renderDashboard:', error);
    const content = document.getElementById('memberContent');
    content.innerHTML = `
      <div class="empty-state">
        <i data-feather="alert-circle"></i>
        <h3>Terjadi Kesalahan</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="loadPage('dashboard')">Coba Lagi</button>
      </div>
    `;
    feather.replace();
  }
}

// Render Profil
async function renderProfil() {
  if (!memberData) return;
  
  const content = document.getElementById('memberContent');
  content.innerHTML = `
    <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
      <i data-feather="user" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
      Profil Saya
    </h2>
    
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar-large">
          ${memberData.foto ? 
            `<img src="/uploads/${memberData.foto}" alt="${memberData.nama_lengkap}">` :
            `<i data-feather="user"></i>`
          }
        </div>
        <div class="profile-info">
          <h2>${memberData.nama_lengkap}</h2>
          <div class="profile-meta">
            <div class="meta-item">
              <i data-feather="hash"></i>
              <span>${memberData.nomor_anggota}</span>
            </div>
            <div class="meta-item">
              <i data-feather="calendar"></i>
              <span>Bergabung ${formatDate(memberData.tanggal_bergabung)}</span>
            </div>
            <div class="meta-item">
              <i data-feather="check-circle"></i>
              <span class="badge badge-success">${memberData.status.charAt(0).toUpperCase() + memberData.status.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-grid">
        <div>
          <div class="profile-field">
            <label>NIK</label>
            <div class="value">${memberData.nik || '-'}</div>
          </div>
          <div class="profile-field">
            <label>Tempat, Tanggal Lahir</label>
            <div class="value">${memberData.tempat_lahir || '-'}, ${formatDate(memberData.tanggal_lahir)}</div>
          </div>
          <div class="profile-field">
            <label>Jenis Kelamin</label>
            <div class="value">${memberData.jenis_kelamin || '-'}</div>
          </div>
        </div>
        
        <div>
          <div class="profile-field">
            <label>Alamat</label>
            <div class="value">${memberData.alamat || '-'}</div>
          </div>
          <div class="profile-field">
            <label>Nomor Telepon</label>
            <div class="value">${memberData.nomor_telpon || '-'}</div>
          </div>
          <div class="profile-field">
            <label>Email</label>
            <div class="value">${memberData.email || '-'}</div>
          </div>
        </div>
        
        <div>
          <div class="profile-field">
            <label>Pekerjaan</label>
            <div class="value">${memberData.pekerjaan || '-'}</div>
          </div>
          <div class="profile-field">
            <label>Status Keanggotaan</label>
            <div class="value">
              <span class="badge badge-${memberData.status === 'aktif' ? 'success' : 'danger'}">
                ${memberData.status}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--member-border); display: flex; gap: 12px;">
        <button class="btn btn-primary" onclick="editProfil()">
          <i data-feather="edit"></i> Edit Profil
        </button>
        <button class="btn btn-warning" onclick="gantiPassword()">
          <i data-feather="lock"></i> Ganti Password
        </button>
      </div>
    </div>
  `;
}

// Edit Profil
window.editProfil = function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h3 class="modal-title">Edit Profil</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="editProfilForm">
        <div class="form-row">
          <div class="form-group">
            <label>Nama Lengkap *</label>
            <input type="text" name="nama_lengkap" value="${memberData.nama_lengkap}" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>NIK</label>
            <input type="text" name="nik" value="${memberData.nik || ''}">
          </div>
          <div class="form-group">
            <label>Jenis Kelamin</label>
            <select name="jenis_kelamin">
              <option value="">Pilih</option>
              <option value="Laki-laki" ${memberData.jenis_kelamin === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
              <option value="Perempuan" ${memberData.jenis_kelamin === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Tempat Lahir</label>
            <input type="text" name="tempat_lahir" value="${memberData.tempat_lahir || ''}">
          </div>
          <div class="form-group">
            <label>Tanggal Lahir</label>
            <input type="date" name="tanggal_lahir" value="${memberData.tanggal_lahir || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label>Alamat</label>
          <textarea name="alamat" rows="2">${memberData.alamat || ''}</textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Nomor Telepon</label>
            <input type="text" name="nomor_telpon" value="${memberData.nomor_telpon || ''}">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" value="${memberData.email || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label>Pekerjaan</label>
          <input type="text" name="pekerjaan" value="${memberData.pekerjaan || ''}">
        </div>
        
        <div class="form-group">
          <label>Foto Profil</label>
          <input type="file" name="foto" accept="image/*">
          ${memberData.foto ? `<small style="color: #666;">Foto saat ini: ${memberData.foto}</small>` : ''}
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
  
  document.getElementById('editProfilForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Profil berhasil diupdate!');
        modal.remove();
        await loadMemberData();
        renderProfil();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message);
    }
  });
};

// Ganti Password
window.gantiPassword = function() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3 class="modal-title">Ganti Password</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
      </div>
      
      <form id="gantiPasswordForm">
        <div class="form-group">
          <label>Password Lama *</label>
          <input type="password" name="currentPassword" required minlength="6">
        </div>
        
        <div class="form-group">
          <label>Password Baru *</label>
          <input type="password" name="newPassword" required minlength="6">
          <small style="color: #666;">Minimal 6 karakter</small>
        </div>
        
        <div class="form-group">
          <label>Konfirmasi Password Baru *</label>
          <input type="password" name="confirmPassword" required minlength="6">
        </div>
        
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">
            <i data-feather="lock"></i> Ganti Password
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
  
  document.getElementById('gantiPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi tidak sama!');
      return;
    }
    
    try {
      const response = await fetch('/api/member/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Password berhasil diubah! Silakan login kembali.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('memberData');
        window.location.href = '/member-login.html';
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message);
    }
  });
};

// Calculate membership duration
function calculateMembership(tanggalBergabung) {
  if (!tanggalBergabung) return '-';
  
  const start = new Date(tanggalBergabung);
  const now = new Date();
  const diff = now - start;
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  
  if (years > 0) {
    return `${years} tahun`;
  } else if (months > 0) {
    return `${months} bulan`;
  } else {
    return '< 1 bulan';
  }
}

// Render Laporan Keuangan
async function renderLaporan() {
  const content = document.getElementById('memberContent');
  
  try {
    // Get all financial data
    const anggota = await API.get('/api/anggota');
    const simpananPokok = await API.get('/api/simpanan/pokok');
    const simpananWajib = await API.get('/api/simpanan/wajib');
    const simpananKhusus = await API.get('/api/simpanan/khusus');
    const simpananSukarela = await API.get('/api/simpanan/sukarela');
    const penjualan = await API.get('/api/transaksi/penjualan');
    const pengeluaran = await API.get('/api/transaksi/pengeluaran');
    const pendapatanLain = await API.get('/api/transaksi/pendapatan-lain');
    
    // Calculate totals
    const totalAnggota = anggota.filter(a => a.status === 'aktif').length;
    
    const totalSimpanan = 
      simpananPokok.reduce((sum, s) => sum + s.jumlah, 0) +
      simpananWajib.reduce((sum, s) => sum + s.jumlah, 0) +
      simpananKhusus.reduce((sum, s) => sum + s.jumlah, 0) +
      simpananSukarela.reduce((sum, s) => sum + s.jumlah, 0);
    
    const totalPenjualan = penjualan.reduce((sum, p) => sum + (p.jumlah_penjualan || 0), 0);
    const totalHPP = penjualan.reduce((sum, p) => sum + (p.hpp || 0), 0);
    const totalPendapatanLain = pendapatanLain.reduce((sum, p) => sum + (p.jumlah || 0), 0);
    
    // Formula Laba/Rugi (dengan Pendapatan Lain)
    const totalPendapatan = totalPenjualan + totalPendapatanLain;
    const labaKotor = totalPendapatan - totalHPP;
    
    // Perhitungan untuk Neraca
    const totalSimpananPokok = simpananPokok.reduce((sum, s) => sum + (s.jumlah || 0), 0);
    const totalSimpananWajib = simpananWajib.reduce((sum, s) => sum + (s.jumlah || 0), 0);
    const totalSimpananKhusus = simpananKhusus.reduce((sum, s) => sum + (s.jumlah || 0), 0);
    const totalSimpananSukarela = simpananSukarela.reduce((sum, s) => sum + (s.jumlah || 0), 0);
    
    // Hitung Pembelian Barang dan Pembelian Aset dari Pengeluaran
    const pembelianBarang = pengeluaran
      .filter(p => p.kategori === 'Pembelian Barang')
      .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    
    const pengeluaranAset = pengeluaran
      .filter(p => p.kategori === 'Pembelian Aset & Inventaris' || p.kategori === 'Pembelian Aset');
    
    const pembelianAset = pengeluaranAset
      .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    
    // Hitung Penjualan Barang dan Penjualan Aset
    const penjualanBarang = penjualan
      .filter(p => p.kategori === 'Barang' || !p.kategori)
      .reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
    
    const hppBarang = penjualan
      .filter(p => p.kategori === 'Barang' || !p.kategori)
      .reduce((sum, item) => sum + parseFloat(item.hpp || 0), 0);
    
    const penjualanAset = penjualan
      .filter(p => p.kategori === 'Aset')
      .reduce((sum, item) => sum + parseFloat(item.jumlah_penjualan || 0), 0);
    
    // AKTIVA
    const persediaan = pembelianBarang - hppBarang;
    const aktivaTetap = pembelianAset - penjualanAset;
    
    const biayaOperasional = pengeluaran
      .filter(p => p.kategori !== 'Pembelian Barang' && p.kategori !== 'Pembelian Aset & Inventaris' && p.kategori !== 'Pembelian Aset')
      .reduce((sum, item) => sum + parseFloat(item.jumlah || 0), 0);
    
    const totalPengeluaran = biayaOperasional; // Untuk tampilan stat card
    const labaBersih = labaKotor - biayaOperasional;
    
    const kasBank = totalSimpanan + labaBersih - persediaan - aktivaTetap;
    const totalAktiva = kasBank + persediaan + aktivaTetap;
    
    // PASIVA
    let cadangan = 0; // Simplified for member portal
    const shuTahunBerjalan = labaBersih;
    
    const totalPasiva = totalSimpananPokok + totalSimpananWajib + totalSimpananKhusus + totalSimpananSukarela + cadangan + shuTahunBerjalan;
    
    content.innerHTML = `
      <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
        <i data-feather="bar-chart-2" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
        Laporan Keuangan Koperasi
      </h2>
      
      <div style="background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); padding: 24px; border-radius: 16px; color: white; margin-bottom: 32px; box-shadow: 0 8px 24px rgba(46, 125, 50, 0.3);">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
          <i data-feather="info" style="width: 24px; height: 24px;"></i>
          <h3 style="font-size: 18px; margin: 0;">Transparansi Keuangan</h3>
        </div>
        <p style="opacity: 0.95; margin: 0; line-height: 1.6;">
          Laporan keuangan ini menampilkan kondisi keuangan koperasi secara real-time untuk transparansi kepada seluruh anggota.
          Data diperbarui otomatis setiap ada transaksi baru.
        </p>
      </div>
      
      <div class="dashboard-grid" style="margin-bottom: 32px;">
        <div class="stat-card-member">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
              <i data-feather="users"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Total Anggota Aktif</h3>
            <div class="stat-value">${totalAnggota}</div>
            <div class="stat-label">Anggota Terdaftar</div>
          </div>
        </div>
        
        <div class="stat-card-member success">
          <div class="stat-header">
            <div class="stat-icon">
              <i data-feather="dollar-sign"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Total Simpanan</h3>
            <div class="stat-value">${formatCurrency(totalSimpanan)}</div>
            <div class="stat-label">Semua Jenis Simpanan</div>
          </div>
        </div>
        
        <div class="stat-card-member">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="dollar-sign"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Total Pendapatan</h3>
            <div class="stat-value">${formatCurrency(totalPendapatan)}</div>
            <div class="stat-label">Penjualan + Pendapatan Lain</div>
          </div>
        </div>
        
        <div class="stat-card-member danger">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FF6B6B, #EE5A6F);">
              <i data-feather="trending-down"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Biaya Operasional</h3>
            <div class="stat-value">${formatCurrency(biayaOperasional)}</div>
            <div class="stat-label">Tanpa Pembelian Barang & Aset</div>
          </div>
        </div>
      </div>
      
      <div style="background: ${labaBersih >= 0 ? 'linear-gradient(135deg, #11998e, #38ef7d)' : 'linear-gradient(135deg, #eb3349, #f45c43)'}; padding: 32px; border-radius: 16px; color: white; margin-bottom: 32px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px;">
          <div>
            <h3 style="font-size: 16px; margin-bottom: 8px; opacity: 0.9;">
              ${labaBersih >= 0 ? '💰 SHU Tahun Berjalan' : '📉 Rugi Tahun Berjalan'}
            </h3>
            <div style="font-size: 42px; font-weight: 700;">${formatCurrency(Math.abs(labaBersih))}</div>
            <p style="opacity: 0.9; margin: 8px 0 0 0; font-size: 14px;">
              Laba Kotor: ${formatCurrency(labaKotor)} - Biaya Operasional: ${formatCurrency(biayaOperasional)}
            </p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 64px; opacity: 0.3;">
              ${labaBersih >= 0 ? '📈' : '📉'}
            </div>
          </div>
        </div>
      </div>
      
      <div class="simpanan-table" style="margin-bottom: 24px;">
        <h3><i data-feather="pie-chart"></i> Rincian Simpanan</h3>
        <table>
          <thead>
            <tr>
              <th>Jenis Simpanan</th>
              <th>Jumlah Transaksi</th>
              <th>Total Nominal</th>
              <th>Persentase</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Simpanan Pokok</strong></td>
              <td>${simpananPokok.length} transaksi</td>
              <td>${formatCurrency(totalSimpananPokok)}</td>
              <td>${totalSimpanan > 0 ? ((totalSimpananPokok / totalSimpanan) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Simpanan Wajib</strong></td>
              <td>${simpananWajib.length} transaksi</td>
              <td>${formatCurrency(totalSimpananWajib)}</td>
              <td>${totalSimpanan > 0 ? ((totalSimpananWajib / totalSimpanan) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Simpanan Khusus</strong></td>
              <td>${simpananKhusus.length} transaksi</td>
              <td>${formatCurrency(totalSimpananKhusus)}</td>
              <td>${totalSimpanan > 0 ? ((totalSimpananKhusus / totalSimpanan) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Simpanan Sukarela</strong></td>
              <td>${simpananSukarela.length} transaksi</td>
              <td>${formatCurrency(totalSimpananSukarela)}</td>
              <td>${totalSimpanan > 0 ? ((totalSimpananSukarela / totalSimpanan) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr style="background: var(--member-bg); font-weight: 700;">
              <td>TOTAL</td>
              <td>${simpananPokok.length + simpananWajib.length + simpananKhusus.length + simpananSukarela.length} transaksi</td>
              <td><strong>${formatCurrency(totalSimpanan)}</strong></td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="simpanan-table" style="margin-bottom: 24px;">
        <h3><i data-feather="trending-up"></i> Laporan Laba Rugi</h3>
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
              <td style="padding-left: 24px;">Penjualan</td>
              <td style="text-align: right;">${formatCurrency(totalPenjualan)}</td>
            </tr>
            <tr>
              <td style="padding-left: 24px;">Pendapatan Lain</td>
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
              <td style="padding-left: 24px;">HPP</td>
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
              <td style="padding-left: 24px;">Biaya Operasional</td>
              <td style="text-align: right; color: #d32f2f;">(${formatCurrency(biayaOperasional)})</td>
            </tr>
            <tr style="background: ${labaBersih >= 0 ? '#e8f5e9' : '#ffebee'}; font-weight: 700; font-size: 16px;">
              <td><strong>${labaBersih >= 0 ? 'SHU TAHUN BERJALAN' : 'RUGI TAHUN BERJALAN'}</strong></td>
              <td style="text-align: right; color: ${labaBersih >= 0 ? '#2e7d32' : '#d32f2f'};"><strong>${formatCurrency(Math.abs(labaBersih))}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="simpanan-table" style="margin-bottom: 24px;">
        <h3><i data-feather="briefcase"></i> Neraca</h3>
        <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 14px;">
          Per ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h4 style="background: linear-gradient(135deg, #2E7D32, #4CAF50); color: white; padding: 12px; border-radius: 8px; margin: 0 0 12px 0; text-align: center;">
              <i data-feather="trending-up" style="width: 18px; height: 18px;"></i> AKTIVA
            </h4>
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
                <tr style="background: #e8f5e9; font-weight: 700; font-size: 16px;">
                  <td><strong>TOTAL AKTIVA</strong></td>
                  <td style="text-align: right;"><strong>${formatCurrency(totalAktiva)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h4 style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px; border-radius: 8px; margin: 0 0 12px 0; text-align: center;">
              <i data-feather="pie-chart" style="width: 18px; height: 18px;"></i> PASIVA
            </h4>
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
                  <td style="text-align: right;">${formatCurrency(totalSimpananSukarela)}</td>
                </tr>
                <tr>
                  <td>Cadangan</td>
                  <td style="text-align: right;">${formatCurrency(cadangan)}</td>
                </tr>
                <tr>
                  <td>SHU Tahun Berjalan</td>
                  <td style="text-align: right;">${formatCurrency(shuTahunBerjalan)}</td>
                </tr>
                <tr style="background: #e8f5e9; font-weight: 700; font-size: 16px;">
                  <td><strong>TOTAL PASIVA</strong></td>
                  <td style="text-align: right;"><strong>${formatCurrency(totalPasiva)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        ${pengeluaranAset.length > 0 ? `
        <div style="margin-top: 24px;">
          <h4 style="color: var(--member-primary); margin-bottom: 12px;">
            <i data-feather="package" style="width: 18px; height: 18px;"></i>
            Detail Aset Tetap
          </h4>
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
              ${pengeluaranAset.map(item => {
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
              <tr style="background: #f8f9fa; font-weight: 700;">
                <td colspan="2"><strong>TOTAL</strong></td>
                <td style="text-align: center;"><strong>${pengeluaranAset.reduce((sum, item) => sum + (item.qty || 1), 0)}</strong></td>
                <td></td>
                <td><strong>${formatCurrency(pembelianAset)}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ''}
      </div>
      

    `;
    
    feather.replace();
  } catch (error) {
    console.error('Error loading laporan:', error);
    content.innerHTML = `
      <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
        <i data-feather="bar-chart-2" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
        Laporan Keuangan Koperasi
      </h2>
      <div class="empty-state">
        <i data-feather="alert-circle"></i>
        <h3>Terjadi Kesalahan</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="loadPage('laporan')">Coba Lagi</button>
      </div>
    `;
    feather.replace();
  }
}

// Render Simpanan
async function renderSimpanan() {
  if (!memberData) return;
  
  const content = document.getElementById('memberContent');
  
  try {
    // Get all simpanan data
    const simpananPokok = await API.get('/api/simpanan/pokok');
    const simpananWajib = await API.get('/api/simpanan/wajib');
    const simpananKhusus = await API.get('/api/simpanan/khusus');
    const simpananSukarela = await API.get('/api/simpanan/sukarela');
    
    // Filter for this member
    const myPokok = simpananPokok.filter(s => s.anggota_id === memberData.id);
    const myWajib = simpananWajib.filter(s => s.anggota_id === memberData.id);
    const myKhusus = simpananKhusus.filter(s => s.anggota_id === memberData.id);
    const mySukarela = simpananSukarela.filter(s => s.anggota_id === memberData.id);
    
    // Calculate totals
    const totalPokok = myPokok.reduce((sum, s) => sum + s.jumlah, 0);
    const totalWajib = myWajib.reduce((sum, s) => sum + s.jumlah, 0);
    const totalKhusus = myKhusus.reduce((sum, s) => sum + s.jumlah, 0);
    const totalSukarela = mySukarela.reduce((sum, s) => sum + s.jumlah, 0);
    
    content.innerHTML = `
      <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
        <i data-feather="dollar-sign" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
        Simpanan Saya
      </h2>
      
      <div class="dashboard-grid" style="margin-bottom: 32px;">
        <div class="stat-card-member">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #2E7D32, #4CAF50);">
              <i data-feather="shield"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Simpanan Pokok</h3>
            <div class="stat-value">${formatCurrency(totalPokok)}</div>
            <div class="stat-label">${myPokok.length} Transaksi</div>
          </div>
        </div>
        
        <div class="stat-card-member">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="calendar"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Simpanan Wajib</h3>
            <div class="stat-value">${formatCurrency(totalWajib)}</div>
            <div class="stat-label">${myWajib.length} Transaksi</div>
          </div>
        </div>
        
        <div class="stat-card-member">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="star"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Simpanan Khusus</h3>
            <div class="stat-value">${formatCurrency(totalKhusus)}</div>
            <div class="stat-label">${myKhusus.length} Transaksi</div>
          </div>
        </div>
        
        <div class="stat-card-member">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
              <i data-feather="heart"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Simpanan Sukarela</h3>
            <div class="stat-value">${formatCurrency(totalSukarela)}</div>
            <div class="stat-label">${mySukarela.length} Transaksi</div>
          </div>
        </div>
      </div>
      
      ${renderSimpananTable('Simpanan Pokok', myPokok)}
      ${renderSimpananTable('Simpanan Wajib', myWajib)}
      ${renderSimpananTable('Simpanan Khusus', myKhusus)}
      ${renderSimpananTable('Simpanan Sukarela', mySukarela)}
    `;
    
    feather.replace();
  } catch (error) {
    console.error('Error loading simpanan:', error);
    content.innerHTML = `
      <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
        <i data-feather="dollar-sign" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
        Simpanan Saya
      </h2>
      <div class="empty-state">
        <i data-feather="alert-circle"></i>
        <h3>Terjadi Kesalahan</h3>
        <p>${error.message}</p>
      </div>
    `;
    feather.replace();
  }
}

// Helper function to render simpanan table
function renderSimpananTable(title, data) {
  if (data.length === 0) return '';
  
  const total = data.reduce((sum, s) => sum + s.jumlah, 0);
  
  return `
    <div class="simpanan-table" style="margin-bottom: 24px;">
      <h3><i data-feather="list"></i> ${title}</h3>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Jumlah</th>
            <th>Metode Pembayaran</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(s => `
            <tr>
              <td>${formatDate(s.tanggal_transaksi)}</td>
              <td><strong>${formatCurrency(s.jumlah)}</strong></td>
              <td>${s.metode_pembayaran || '-'}</td>
              <td>${s.keterangan || '-'}</td>
            </tr>
          `).join('')}
          <tr style="background: var(--member-bg); font-weight: 700;">
            <td>TOTAL</td>
            <td colspan="3"><strong>${formatCurrency(total)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// Render Transaksi
async function renderTransaksi() {
  if (!memberData) return;
  
  const content = document.getElementById('memberContent');
  
  try {
    // Get all transaction data
    const simpananPokok = await API.get('/api/simpanan/pokok');
    const simpananWajib = await API.get('/api/simpanan/wajib');
    const simpananKhusus = await API.get('/api/simpanan/khusus');
    const simpananSukarela = await API.get('/api/simpanan/sukarela');
    const partisipasi = await API.get('/api/partisipasi');
    
    // Combine all transactions
    const allTransactions = [
      ...simpananPokok.filter(s => s.anggota_id === memberData.id).map(s => ({
        ...s,
        jenis: 'Simpanan Pokok',
        type: 'simpanan'
      })),
      ...simpananWajib.filter(s => s.anggota_id === memberData.id).map(s => ({
        ...s,
        jenis: 'Simpanan Wajib',
        type: 'simpanan'
      })),
      ...simpananKhusus.filter(s => s.anggota_id === memberData.id).map(s => ({
        ...s,
        jenis: 'Simpanan Khusus',
        type: 'simpanan'
      })),
      ...simpananSukarela.filter(s => s.anggota_id === memberData.id).map(s => ({
        ...s,
        jenis: 'Simpanan Sukarela',
        type: 'simpanan'
      })),
      ...partisipasi.filter(p => p.anggota_id === memberData.id).map(p => ({
        ...p,
        jenis: 'Partisipasi',
        type: 'partisipasi',
        jumlah: p.jumlah_transaksi
      }))
    ];
    
    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi));
    
    const totalSimpanan = allTransactions
      .filter(t => t.type === 'simpanan')
      .reduce((sum, t) => sum + t.jumlah, 0);
      
    const totalPartisipasi = allTransactions
      .filter(t => t.type === 'partisipasi')
      .reduce((sum, t) => sum + t.jumlah, 0);
    
    content.innerHTML = `
      <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
        <i data-feather="file-text" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
        Riwayat Transaksi
      </h2>
      
      <div class="dashboard-grid" style="margin-bottom: 32px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
        <div class="stat-card-member success">
          <div class="stat-header">
            <div class="stat-icon">
              <i data-feather="trending-up"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Total Transaksi</h3>
            <div class="stat-value">${allTransactions.length}</div>
            <div class="stat-label">Semua Jenis Transaksi</div>
          </div>
        </div>
        
        <div class="stat-card-member">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #2E7D32, #4CAF50);">
              <i data-feather="dollar-sign"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Total Simpanan</h3>
            <div class="stat-value">${formatCurrency(totalSimpanan)}</div>
            <div class="stat-label">Akumulasi Simpanan</div>
          </div>
        </div>
        
        <div class="stat-card-member warning">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="shopping-cart"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Total Partisipasi</h3>
            <div class="stat-value">${formatCurrency(totalPartisipasi)}</div>
            <div class="stat-label">Transaksi dengan Koperasi</div>
          </div>
        </div>
      </div>
      
      <div class="simpanan-table">
        <h3><i data-feather="list"></i> Semua Transaksi</h3>
        ${allTransactions.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis Transaksi</th>
                <th>Jumlah</th>
                <th>Metode</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${allTransactions.map(t => `
                <tr>
                  <td>${formatDate(t.tanggal_transaksi)}</td>
                  <td>
                    <span class="badge badge-${t.type === 'simpanan' ? 'success' : 'warning'}">
                      ${t.jenis}
                    </span>
                  </td>
                  <td><strong>${formatCurrency(t.jumlah)}</strong></td>
                  <td>${t.metode_pembayaran || '-'}</td>
                  <td>${t.keterangan || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div class="empty-state">
            <i data-feather="inbox"></i>
            <h3>Belum Ada Transaksi</h3>
            <p>Riwayat transaksi Anda akan muncul di sini</p>
          </div>
        `}
      </div>
    `;
    
    feather.replace();
  } catch (error) {
    console.error('Error loading transaksi:', error);
    content.innerHTML = `
      <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
        <i data-feather="file-text" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
        Riwayat Transaksi
      </h2>
      <div class="empty-state">
        <i data-feather="alert-circle"></i>
        <h3>Terjadi Kesalahan</h3>
        <p>${error.message}</p>
      </div>
    `;
    feather.replace();
  }
}

// Render SHU
async function renderSHU() {
  if (!memberData) return;
  
  const content = document.getElementById('memberContent');
  
  try {
    // Get simpanan and partisipasi data
    const simpananPokok = await API.get('/api/simpanan/pokok');
    const simpananWajib = await API.get('/api/simpanan/wajib');
    const simpananKhusus = await API.get('/api/simpanan/khusus');
    const simpananSukarela = await API.get('/api/simpanan/sukarela');
    const partisipasi = await API.get('/api/partisipasi');
    
    // Calculate member's totals
    const totalPokok = simpananPokok
      .filter(s => s.anggota_id === memberData.id)
      .reduce((sum, s) => sum + s.jumlah, 0);
      
    const totalWajib = simpananWajib
      .filter(s => s.anggota_id === memberData.id)
      .reduce((sum, s) => sum + s.jumlah, 0);
      
    const totalKhusus = simpananKhusus
      .filter(s => s.anggota_id === memberData.id)
      .reduce((sum, s) => sum + s.jumlah, 0);
      
    const totalSukarela = simpananSukarela
      .filter(s => s.anggota_id === memberData.id)
      .reduce((sum, s) => sum + s.jumlah, 0);
      
    const totalSimpanan = totalPokok + totalWajib + totalKhusus + totalSukarela;
    
    const totalPartisipasi = partisipasi
      .filter(p => p.anggota_id === memberData.id)
      .reduce((sum, p) => sum + p.jumlah_transaksi, 0);
    
    // Calculate total simpanan and partisipasi from all members
    const totalSimpananSemua = 
      simpananPokok.reduce((sum, s) => sum + s.jumlah, 0) +
      simpananWajib.reduce((sum, s) => sum + s.jumlah, 0) +
      simpananKhusus.reduce((sum, s) => sum + s.jumlah, 0) +
      simpananSukarela.reduce((sum, s) => sum + s.jumlah, 0);
      
    const totalPartisipasiSemua = partisipasi.reduce((sum, p) => sum + p.jumlah_transaksi, 0);
    
    // Calculate percentage contribution
    const persenSimpanan = totalSimpananSemua > 0 ? (totalSimpanan / totalSimpananSemua * 100) : 0;
    const persenPartisipasi = totalPartisipasiSemua > 0 ? (totalPartisipasi / totalPartisipasiSemua * 100) : 0;
    
    const currentYear = new Date().getFullYear();
    
    // Get actual SHU data from database (if calculated by admin)
    let shuDariSimpanan = 0;
    let shuDariPartisipasi = 0;
    let estimasiSHU = 0;
    let shuStatus = 'Belum Dihitung';
    
    try {
      const shuData = await API.get(`/api/shu/anggota/${currentYear}`);
      const mySHU = shuData.find(s => s.anggota_id === memberData.id);
      
      if (mySHU) {
        // Use actual calculated SHU from admin
        shuDariSimpanan = mySHU.shu_simpanan || 0;
        shuDariPartisipasi = mySHU.shu_transaksi || 0;
        estimasiSHU = mySHU.total_shu || 0;
        shuStatus = 'Sudah Dihitung';
      } else {
        // SHU belum dihitung, tampilkan pesan
        shuStatus = 'Belum Dihitung';
      }
    } catch (error) {
      // If error or not calculated yet, show status
      console.log('SHU belum dihitung untuk tahun ini');
      shuStatus = 'Belum Dihitung';
    }
    
    content.innerHTML = `
      <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
        <i data-feather="gift" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
        SHU Saya
      </h2>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 16px; color: white; margin-bottom: 32px; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);">
        <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 16px;">
          <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <i data-feather="gift" style="width: 32px; height: 32px;"></i>
          </div>
          <div>
            <h3 style="font-size: 18px; margin-bottom: 8px; opacity: 0.9;">
              ${shuStatus === 'Sudah Dihitung' ? 'SHU' : 'Estimasi SHU'} Tahun ${currentYear}
            </h3>
            <div style="font-size: 42px; font-weight: 700;">${formatCurrency(estimasiSHU)}</div>
            <div style="font-size: 14px; opacity: 0.8; margin-top: 8px;">
              Status: <strong>${shuStatus}</strong>
            </div>
          </div>
        </div>
        <p style="opacity: 0.9; margin: 0;">
          <i data-feather="info" style="width: 16px; height: 16px;"></i>
          ${shuStatus === 'Sudah Dihitung' 
            ? 'SHU sudah dihitung oleh admin berdasarkan laba bersih koperasi' 
            : 'SHU belum dihitung. Hubungi admin untuk perhitungan SHU'}
        </p>
      </div>
      
      <div class="dashboard-grid" style="margin-bottom: 32px;">
        <div class="stat-card-member">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #2E7D32, #4CAF50);">
              <i data-feather="dollar-sign"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Total Simpanan</h3>
            <div class="stat-value">${formatCurrency(totalSimpanan)}</div>
            <div class="stat-label">${persenSimpanan.toFixed(2)}% dari total koperasi</div>
          </div>
        </div>
        
        <div class="stat-card-member warning">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #FFD700, #FFA500);">
              <i data-feather="shopping-cart"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>Total Partisipasi</h3>
            <div class="stat-value">${formatCurrency(totalPartisipasi)}</div>
            <div class="stat-label">${persenPartisipasi.toFixed(2)}% dari total koperasi</div>
          </div>
        </div>
        
        <div class="stat-card-member success">
          <div class="stat-header">
            <div class="stat-icon">
              <i data-feather="trending-up"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>SHU dari Simpanan</h3>
            <div class="stat-value">${formatCurrency(shuDariSimpanan)}</div>
            <div class="stat-label">${shuStatus === 'Sudah Dihitung' ? 'Berdasarkan jasa simpanan' : 'Menunggu perhitungan'}</div>
          </div>
        </div>
        
        <div class="stat-card-member">
          <div class="stat-header">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4ECDC4, #44A08D);">
              <i data-feather="activity"></i>
            </div>
          </div>
          <div class="stat-body">
            <h3>SHU dari Partisipasi</h3>
            <div class="stat-value">${formatCurrency(shuDariPartisipasi)}</div>
            <div class="stat-label">${shuStatus === 'Sudah Dihitung' ? 'Berdasarkan jasa transaksi' : 'Menunggu perhitungan'}</div>
          </div>
        </div>
      </div>
      
      <div class="simpanan-table">
        <h3><i data-feather="info"></i> Tentang SHU (Sisa Hasil Usaha)</h3>
        <div style="padding: 24px; background: #f8f9fa; border-radius: 12px; line-height: 1.8;">
          <p style="margin-bottom: 16px;">
            <strong>Sisa Hasil Usaha (SHU)</strong> adalah keuntungan yang diperoleh koperasi dalam satu tahun buku yang dibagikan kepada anggota sesuai dengan kontribusi mereka.
          </p>
          
          <h4 style="margin: 24px 0 12px 0; color: var(--member-primary);">Komponen Perhitungan SHU:</h4>
          <ul style="margin-left: 24px;">
            <li><strong>Jasa Simpanan:</strong> Berdasarkan total simpanan Anda (Pokok, Wajib, Khusus, Sukarela)</li>
            <li><strong>Jasa Transaksi:</strong> Berdasarkan partisipasi Anda dalam transaksi dengan koperasi</li>
          </ul>
          
          <h4 style="margin: 24px 0 12px 0; color: var(--member-primary);">Catatan Penting:</h4>
          <ul style="margin-left: 24px;">
            <li>Angka di atas adalah <strong>estimasi</strong> berdasarkan perhitungan sederhana</li>
            <li>SHU aktual akan ditentukan dalam Rapat Anggota Tahunan (RAT)</li>
            <li>Pembagian SHU mempertimbangkan berbagai faktor termasuk keuntungan koperasi</li>
            <li>Persentase pembagian dapat berbeda setiap tahunnya</li>
          </ul>
          
          <div style="margin-top: 24px; padding: 16px; background: white; border-left: 4px solid var(--member-primary); border-radius: 8px;">
            <strong>💡 Tips Meningkatkan SHU:</strong>
            <ul style="margin: 12px 0 0 24px;">
              <li>Tingkatkan simpanan Anda secara rutin</li>
              <li>Aktif bertransaksi dengan unit usaha koperasi</li>
              <li>Ikuti program-program koperasi</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    feather.replace();
  } catch (error) {
    console.error('Error loading SHU:', error);
    content.innerHTML = `
      <h2 style="font-size: 28px; color: var(--member-text); margin-bottom: 24px;">
        <i data-feather="gift" style="width: 28px; height: 28px; color: var(--member-primary);"></i>
        SHU Saya
      </h2>
      <div class="empty-state">
        <i data-feather="alert-circle"></i>
        <h3>Terjadi Kesalahan</h3>
        <p>${error.message}</p>
      </div>
    `;
    feather.replace();
  }
}


// Banner Slider Functions
let currentBannerIndex = 0;
let bannerSlideInterval;

function changeBannerSlide(direction) {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  
  if (slides.length === 0) return;
  
  slides[currentBannerIndex].classList.remove('active');
  dots[currentBannerIndex]?.classList.remove('active');
  
  currentBannerIndex += direction;
  
  if (currentBannerIndex >= slides.length) currentBannerIndex = 0;
  if (currentBannerIndex < 0) currentBannerIndex = slides.length - 1;
  
  slides[currentBannerIndex].classList.add('active');
  dots[currentBannerIndex]?.classList.add('active');
}

function currentBannerSlide(index) {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  
  if (slides.length === 0) return;
  
  slides[currentBannerIndex].classList.remove('active');
  dots[currentBannerIndex]?.classList.remove('active');
  
  currentBannerIndex = index;
  
  slides[currentBannerIndex].classList.add('active');
  dots[currentBannerIndex]?.classList.add('active');
}

function startBannerAutoSlide() {
  const slides = document.querySelectorAll('.banner-slide');
  if (slides.length > 1) {
    bannerSlideInterval = setInterval(() => {
      changeBannerSlide(1);
    }, 5000); // Auto slide setiap 5 detik
  }
}

function stopBannerAutoSlide() {
  if (bannerSlideInterval) {
    clearInterval(bannerSlideInterval);
  }
}

// Start auto slide when dashboard loads
setTimeout(() => {
  startBannerAutoSlide();
}, 1000);
