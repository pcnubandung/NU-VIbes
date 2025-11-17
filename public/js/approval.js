// Approval Anggota Page
window.renderApprovalAnggota = async function() {
  contentArea.innerHTML = `
    <div class="page-header">
      <h2>
        <i data-feather="user-check"></i>
        Persetujuan Anggota Baru
      </h2>
      <p>Review dan setujui pendaftaran anggota baru</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Daftar Pendaftaran Pending</h3>
        <span class="badge-count" id="pendingCount">0</span>
      </div>
      <div class="card-body">
        <div id="pendingList">
          <div class="loading">Memuat data...</div>
        </div>
      </div>
    </div>
  `;
  
  loadPendingRegistrations();
  feather.replace();
};

async function loadPendingRegistrations() {
  try {
    const response = await fetch('/api/anggota/pending', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    const listContainer = document.getElementById('pendingList');
    const countBadge = document.getElementById('pendingCount');
    
    countBadge.textContent = data.length;
    
    if (data.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <i data-feather="check-circle"></i>
          <p>Tidak ada pendaftaran yang menunggu persetujuan</p>
        </div>
      `;
      feather.replace();
      return;
    }
    
    listContainer.innerHTML = data.map(anggota => `
      <div class="approval-card" id="approval-${anggota.id}">
        <div class="approval-header">
          <div class="approval-photo">
            ${anggota.foto ? 
              `<img src="/uploads/${anggota.foto}" alt="Foto">` :
              `<div class="photo-placeholder"><i data-feather="user"></i></div>`
            }
          </div>
          <div class="approval-info">
            <h4>${anggota.nama_lengkap}</h4>
            <p class="text-muted">${anggota.nomor_anggota}</p>
            <p class="text-small">
              <i data-feather="calendar"></i>
              Daftar: ${formatDate(anggota.tanggal_bergabung)}
            </p>
          </div>
          <div class="approval-badge">
            <span class="badge badge-warning">Pending</span>
          </div>
        </div>
        
        <div class="approval-details">
          <div class="detail-row">
            <span class="label">NIK:</span>
            <span class="value">${anggota.nik || '-'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Alamat:</span>
            <span class="value">${anggota.alamat}</span>
          </div>
          <div class="detail-row">
            <span class="label">Telepon:</span>
            <span class="value">${anggota.nomor_telpon}</span>
          </div>
          <div class="detail-row">
            <span class="label">Email:</span>
            <span class="value">${anggota.email || '-'}</span>
          </div>
        </div>
        
        <div class="approval-documents">
          <h5>Dokumen:</h5>
          <div class="document-grid">
            ${anggota.foto_ktp ? `
              <div class="document-item">
                <img src="/uploads/${anggota.foto_ktp}" alt="KTP" onclick="viewImage('/uploads/${anggota.foto_ktp}')">
                <p>Foto KTP</p>
              </div>
            ` : ''}
            ${anggota.foto ? `
              <div class="document-item">
                <img src="/uploads/${anggota.foto}" alt="Pas Foto" onclick="viewImage('/uploads/${anggota.foto}')">
                <p>Pas Foto</p>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="approval-actions">
          <button class="btn btn-success" onclick="approveAnggota(${anggota.id}, '${anggota.nama_lengkap}')">
            <i data-feather="check"></i> Setujui
          </button>
          <button class="btn btn-danger" onclick="rejectAnggota(${anggota.id}, '${anggota.nama_lengkap}')">
            <i data-feather="x"></i> Tolak
          </button>
          <button class="btn btn-secondary" onclick="viewDetailAnggota(${anggota.id})">
            <i data-feather="eye"></i> Detail
          </button>
        </div>
      </div>
    `).join('');
    
    feather.replace();
  } catch (error) {
    console.error('Error loading pending registrations:', error);
    document.getElementById('pendingList').innerHTML = `
      <div class="error-state">
        <i data-feather="alert-circle"></i>
        <p>Gagal memuat data</p>
      </div>
    `;
    feather.replace();
  }
}

// Approve Anggota
window.approveAnggota = async function(id, nama) {
  if (!confirm(`Setujui pendaftaran ${nama}?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/anggota/${id}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'approve' })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showNotification('success', 'Anggota berhasil disetujui');
      
      // Remove from list with animation
      const card = document.getElementById(`approval-${id}`);
      if (card) {
        card.style.transition = 'all 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'translateX(100px)';
        setTimeout(() => card.remove(), 300);
      }
      
      // Refresh count
      if (window.loadPendingCount) {
        window.loadPendingCount();
      }
      
      // Update pending count badge
      const countBadge = document.getElementById('pendingCount');
      if (countBadge) {
        const currentCount = parseInt(countBadge.textContent) || 0;
        countBadge.textContent = Math.max(0, currentCount - 1);
      }
      
      // Check if list is empty
      setTimeout(() => {
        const remainingCards = document.querySelectorAll('.approval-card');
        if (remainingCards.length === 0) {
          document.getElementById('pendingList').innerHTML = `
            <div class="empty-state">
              <i data-feather="check-circle"></i>
              <p>Tidak ada pendaftaran yang menunggu persetujuan</p>
            </div>
          `;
          feather.replace();
        }
      }, 350);
    } else {
      showNotification('error', result.error || 'Gagal menyetujui anggota');
    }
  } catch (error) {
    console.error('Error approving anggota:', error);
    showNotification('error', 'Terjadi kesalahan');
  }
};

// Reject Anggota
window.rejectAnggota = async function(id, nama) {
  const reason = prompt(`Alasan menolak pendaftaran ${nama}:`);
  
  if (!reason) {
    return;
  }
  
  try {
    const response = await fetch(`/api/anggota/${id}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        action: 'reject',
        reason: reason
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showNotification('success', 'Pendaftaran ditolak');
      
      // Remove from list with animation
      const card = document.getElementById(`approval-${id}`);
      if (card) {
        card.style.transition = 'all 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'translateX(-100px)';
        setTimeout(() => card.remove(), 300);
      }
      
      // Refresh count
      if (window.loadPendingCount) {
        window.loadPendingCount();
      }
      
      // Update pending count badge
      const countBadge = document.getElementById('pendingCount');
      if (countBadge) {
        const currentCount = parseInt(countBadge.textContent) || 0;
        countBadge.textContent = Math.max(0, currentCount - 1);
      }
      
      // Check if list is empty
      setTimeout(() => {
        const remainingCards = document.querySelectorAll('.approval-card');
        if (remainingCards.length === 0) {
          document.getElementById('pendingList').innerHTML = `
            <div class="empty-state">
              <i data-feather="check-circle"></i>
              <p>Tidak ada pendaftaran yang menunggu persetujuan</p>
            </div>
          `;
          feather.replace();
        }
      }, 350);
    } else {
      showNotification('error', result.error || 'Gagal menolak pendaftaran');
    }
  } catch (error) {
    console.error('Error rejecting anggota:', error);
    showNotification('error', 'Terjadi kesalahan');
  }
};

// View Detail Anggota
window.viewDetailAnggota = function(id) {
  // Redirect to detail page or open modal
  if (window.detailAnggota) {
    window.detailAnggota(id);
  }
};

// View Image in new tab
window.viewImage = function(url) {
  window.open(url, '_blank');
};

// Show Notification
function showNotification(type, message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i data-feather="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(notification);
  feather.replace();
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Hide and remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
