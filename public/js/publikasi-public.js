// Publikasi Public Pages JavaScript
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

// Format Date
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

// ===== PUBLIKASI.HTML =====
if (window.location.pathname.includes('publikasi.html')) {
  let allArtikel = [];
  let filteredArtikel = [];
  
  async function loadAllArtikel() {
    try {
      const response = await fetch('/api/artikel/published?limit=100');
      allArtikel = await response.json();
      filteredArtikel = allArtikel;
      renderArtikel(filteredArtikel);
    } catch (error) {
      console.error('Error loading artikel:', error);
      document.getElementById('artikelGrid').innerHTML = '<p class="error">Gagal memuat artikel</p>';
    }
  }
  
  function renderArtikel(data) {
    const container = document.getElementById('artikelGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (data.length === 0) {
      container.style.display = 'none';
      emptyState.style.display = 'flex';
      feather.replace();
      return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = data.map(artikel => `
      <div class="artikel-card">
        <div class="artikel-image">
          ${artikel.gambar_utama ? 
            `<img src="/uploads/${artikel.gambar_utama}" alt="${artikel.judul}">` :
            `<div class="artikel-placeholder"><i data-feather="file-text"></i></div>`
          }
          <span class="artikel-kategori">${artikel.kategori || 'Berita'}</span>
        </div>
        <div class="artikel-content">
          <div class="artikel-meta">
            <span><i data-feather="calendar"></i> ${formatDate(artikel.tanggal_publikasi)}</span>
            <span><i data-feather="user"></i> ${artikel.penulis || 'Admin'}</span>
          </div>
          <h3>${artikel.judul}</h3>
          <p>${artikel.ringkasan || artikel.konten.substring(0, 150) + '...'}</p>
          <a href="/artikel.html?slug=${artikel.slug}" class="artikel-link">
            Baca Selengkapnya <i data-feather="arrow-right"></i>
          </a>
        </div>
      </div>
    `).join('');
    
    feather.replace();
  }
  
  // Filter by kategori
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const kategori = btn.getAttribute('data-kategori');
      if (kategori === 'all') {
        filteredArtikel = allArtikel;
      } else {
        filteredArtikel = allArtikel.filter(a => a.kategori === kategori);
      }
      
      renderArtikel(filteredArtikel);
    });
  });
  
  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const kategori = document.querySelector('.filter-btn.active').getAttribute('data-kategori');
      
      let baseData = kategori === 'all' ? allArtikel : allArtikel.filter(a => a.kategori === kategori);
      
      if (keyword) {
        filteredArtikel = baseData.filter(a => 
          a.judul.toLowerCase().includes(keyword) ||
          (a.ringkasan && a.ringkasan.toLowerCase().includes(keyword)) ||
          a.konten.toLowerCase().includes(keyword)
        );
      } else {
        filteredArtikel = baseData;
      }
      
      renderArtikel(filteredArtikel);
    });
  }
  
  loadAllArtikel();
}

// ===== ARTIKEL.HTML =====
if (window.location.pathname.includes('artikel.html')) {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  
  if (!slug) {
    showError();
  } else {
    loadArtikelDetail(slug);
  }
  
  async function loadArtikelDetail(slug) {
    try {
      const response = await fetch(`/api/artikel/slug/${slug}`);
      
      if (!response.ok) {
        showError();
        return;
      }
      
      const artikel = await response.json();
      renderArtikelDetail(artikel);
      loadRelatedArtikel(artikel.kategori, artikel.id);
    } catch (error) {
      console.error('Error loading artikel:', error);
      showError();
    }
  }
  
  function renderArtikelDetail(artikel) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('artikelContent').style.display = 'block';
    
    // Update page title
    document.getElementById('pageTitle').textContent = artikel.judul + ' - Koperasi NU Vibes';
    document.getElementById('breadcrumbTitle').textContent = artikel.judul;
    
    // Hero image
    const heroDiv = document.getElementById('artikelHero');
    if (artikel.gambar_utama) {
      heroDiv.innerHTML = `<img src="/uploads/${artikel.gambar_utama}" alt="${artikel.judul}">`;
    } else {
      heroDiv.style.display = 'none';
    }
    
    // Header
    document.getElementById('artikelKategori').textContent = artikel.kategori || 'Berita';
    document.getElementById('artikelJudul').textContent = artikel.judul;
    document.getElementById('artikelTanggal').textContent = formatDate(artikel.tanggal_publikasi);
    document.getElementById('artikelPenulis').textContent = artikel.penulis || 'Admin';
    document.getElementById('artikelViews').textContent = artikel.views || 0;
    
    // Body - preserve line breaks
    const body = artikel.konten.replace(/\n/g, '<br>');
    document.getElementById('artikelBody').innerHTML = body;
    
    feather.replace();
  }
  
  async function loadRelatedArtikel(kategori, currentId) {
    try {
      const response = await fetch('/api/artikel/published?limit=3');
      const data = await response.json();
      const related = data.filter(a => a.id !== currentId && a.kategori === kategori).slice(0, 3);
      
      if (related.length === 0) return;
      
      document.getElementById('relatedGrid').innerHTML = related.map(artikel => `
        <div class="related-card">
          <div class="related-image">
            ${artikel.gambar_utama ? 
              `<img src="/uploads/${artikel.gambar_utama}" alt="${artikel.judul}">` :
              `<div class="artikel-placeholder"><i data-feather="file-text"></i></div>`
            }
          </div>
          <h4>${artikel.judul}</h4>
          <a href="/artikel.html?slug=${artikel.slug}">Baca Artikel</a>
        </div>
      `).join('');
      
      feather.replace();
    } catch (error) {
      console.error('Error loading related:', error);
    }
  }
  
  function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'flex';
    feather.replace();
  }
  
  // Share functions
  window.shareToFacebook = function() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };
  
  window.shareToTwitter = function() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.getElementById('artikelJudul').textContent);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };
  
  window.shareToWhatsApp = function() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.getElementById('artikelJudul').textContent);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };
  
  window.copyLink = function() {
    navigator.clipboard.writeText(window.location.href);
    alert('Link berhasil disalin!');
  };
}

// ===== GALERI.HTML =====
if (window.location.pathname.includes('galeri.html')) {
  let allGaleri = [];
  let filteredGaleri = [];
  
  async function loadAllGaleri() {
    try {
      const response = await fetch('/api/galeri/aktif?limit=100');
      allGaleri = await response.json();
      filteredGaleri = allGaleri;
      renderGaleri(filteredGaleri);
    } catch (error) {
      console.error('Error loading galeri:', error);
      document.getElementById('galeriGrid').innerHTML = '<p class="error">Gagal memuat galeri</p>';
    }
  }
  
  function renderGaleri(data) {
    const container = document.getElementById('galeriGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (data.length === 0) {
      container.style.display = 'none';
      emptyState.style.display = 'flex';
      feather.replace();
      return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = data.map(galeri => `
      <div class="galeri-item" onclick="viewGaleriImage('/uploads/${galeri.gambar}', '${galeri.judul}', '${galeri.deskripsi || ''}')">
        <img src="/uploads/${galeri.gambar}" alt="${galeri.judul}">
        <div class="galeri-overlay">
          <h4>${galeri.judul}</h4>
          <p>${galeri.deskripsi || ''}</p>
          <span class="galeri-kategori">${galeri.kategori}</span>
        </div>
      </div>
    `).join('');
  }
  
  // Filter by kategori
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const kategori = btn.getAttribute('data-kategori');
      if (kategori === 'all') {
        filteredGaleri = allGaleri;
      } else {
        filteredGaleri = allGaleri.filter(g => g.kategori === kategori);
      }
      
      renderGaleri(filteredGaleri);
    });
  });
  
  loadAllGaleri();
}

// Lightbox for Galeri
window.viewGaleriImage = function(imageUrl, title, description) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" onclick="this.closest('.lightbox').remove()">×</button>
      <img src="${imageUrl}" alt="${title}">
      <div class="lightbox-info">
        <h3>${title}</h3>
        ${description ? `<p>${description}</p>` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(lightbox);
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.remove();
    }
  });
};

// Load footer info on all pages
loadKoperasiInfo();
