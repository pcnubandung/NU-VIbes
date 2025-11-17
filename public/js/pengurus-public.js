// Pengurus Public Page JavaScript
feather.replace();

// Mobile Menu Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

// Load Koperasi Info for Footer
async function loadKoperasiInfo() {
  try {
    const response = await fetch('/api/koperasi-info');
    const data = await response.json();
    
    if (data) {
      document.getElementById('footerAlamat').textContent = data.alamat || '-';
      document.getElementById('footerTelpon').textContent = data.nomor_telpon || '-';
      document.getElementById('footerEmail').textContent = data.email || '-';
      
      // Load logo
      const navLogo = document.getElementById('navLogo');
      if (data.logo && navLogo) {
        navLogo.src = data.logo;
        navLogo.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error loading koperasi info:', error);
  }
}

// Load Pengurus Data
async function loadPengurus() {
  const loadingState = document.getElementById('loadingState');
  const pengurusContent = document.getElementById('pengurusContent');
  const emptyState = document.getElementById('emptyState');
  
  try {
    const response = await fetch('/api/pengurus/public');
    const data = await response.json();
    
    if (data.length === 0) {
      loadingState.style.display = 'none';
      emptyState.style.display = 'block';
      feather.replace();
      return;
    }
    
    // Group by jabatan
    const pengawas = data.filter(p => p.jabatan && p.jabatan.toLowerCase().includes('pengawas'));
    const ketua = data.filter(p => p.jabatan && p.jabatan.toLowerCase().includes('ketua'));
    const sekretaris = data.filter(p => p.jabatan && p.jabatan.toLowerCase().includes('sekretaris'));
    const bendahara = data.filter(p => p.jabatan && p.jabatan.toLowerCase().includes('bendahara'));
    
    // Combine pengurus inti (ketua, sekretaris, bendahara)
    const pengurusInti = [...ketua, ...sekretaris, ...bendahara];
    
    const anggota = data.filter(p => {
      const jab = p.jabatan ? p.jabatan.toLowerCase() : '';
      return !jab.includes('pengawas') && 
             !jab.includes('ketua') && 
             !jab.includes('sekretaris') && 
             !jab.includes('bendahara');
    });
    
    // Render each group
    renderPengurusGroup('pengawasGrid', pengawas);
    renderPengurusGroup('pengurusIntiGrid', pengurusInti);
    renderPengurusGroup('anggotaGrid', anggota);
    
    // Hide groups with no data
    hideEmptyGroups();
    
    loadingState.style.display = 'none';
    pengurusContent.style.display = 'block';
    feather.replace();
    
  } catch (error) {
    console.error('Error loading pengurus:', error);
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';
    feather.replace();
  }
}

function renderPengurusGroup(containerId, data) {
  const container = document.getElementById(containerId);
  
  if (data.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = data.map(pengurus => `
    <div class="pengurus-card">
      <div class="pengurus-photo">
        ${pengurus.foto ? 
          `<img src="/uploads/${pengurus.foto}" alt="${pengurus.nama_lengkap}">` :
          `<div class="pengurus-placeholder">
            <i data-feather="user"></i>
          </div>`
        }
        <div class="jabatan-badge">${pengurus.jabatan || 'Pengurus'}</div>
      </div>
      <div class="pengurus-info">
        <h3>${pengurus.nama_lengkap}</h3>
        ${pengurus.periode_mulai ? `
          <span class="periode">
            Periode ${formatYear(pengurus.periode_mulai)} - ${pengurus.periode_selesai ? formatYear(pengurus.periode_selesai) : 'Sekarang'}
          </span>
        ` : ''}
        
        <div class="contact-info">
          ${pengurus.nomor_telpon ? `
            <div class="contact-item">
              <i data-feather="phone"></i>
              <a href="tel:${pengurus.nomor_telpon}">${pengurus.nomor_telpon}</a>
            </div>
          ` : ''}
          ${pengurus.email ? `
            <div class="contact-item">
              <i data-feather="mail"></i>
              <a href="mailto:${pengurus.email}">${pengurus.email}</a>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function hideEmptyGroups() {
  const groups = [
    { id: 'pengawasGrid' },
    { id: 'pengurusIntiGrid' },
    { id: 'anggotaGrid' }
  ];
  
  groups.forEach(group => {
    const container = document.getElementById(group.id);
    if (container && container.innerHTML.trim() === '') {
      // Hide the entire pengurus-group
      const pengurusGroup = container.closest('.pengurus-group');
      if (pengurusGroup) {
        pengurusGroup.style.display = 'none';
      }
    }
  });
}

function formatYear(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.getFullYear();
}

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadKoperasiInfo();
  loadPengurus();
});
