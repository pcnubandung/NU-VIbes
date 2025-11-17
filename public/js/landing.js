// Landing Page JavaScript

// Initialize Feather Icons
feather.replace();

// Mobile Menu Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

// Smooth Scroll (only for internal anchors on same page)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    // Only handle hash links that point to elements on this page
    if (href && href.startsWith('#') && href !== '#') {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// Active Nav Link on Scroll
window.addEventListener('scroll', () => {
  let current = '';
  const sections = document.querySelectorAll('section[id]');
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
  } else {
    navbar.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
  }
});

// Load Koperasi Info
async function loadKoperasiInfo() {
  try {
    const response = await fetch('/api/koperasi-info');
    const data = await response.json();
    
    if (data) {
      // Update logo
      if (data.logo) {
        const navLogo = document.getElementById('navLogo');
        if (navLogo) navLogo.src = data.logo;
      }
      
      // Update contact info
      if (data.alamat) {
        document.getElementById('alamatKoperasi').textContent = data.alamat;
        document.getElementById('footerAlamat').textContent = data.alamat;
      }
      
      if (data.nomor_telpon) {
        document.getElementById('telpKoperasi').textContent = data.nomor_telpon;
        document.getElementById('footerTelp').textContent = data.nomor_telpon;
      }
      
      if (data.email) {
        document.getElementById('emailKoperasi').textContent = data.email;
        document.getElementById('footerEmail').textContent = data.email;
      }
      
      // Update tahun berdiri
      if (data.tanggal_berdiri) {
        const tahun = new Date(data.tanggal_berdiri).getFullYear();
        document.getElementById('tahunBerdiri').textContent = tahun;
      }
    }
  } catch (error) {
    console.error('Error loading koperasi info:', error);
  }
}

// Load Statistics
async function loadStatistics() {
  try {
    console.log('Loading statistics from /api/public/stats...');
    const response = await fetch('/api/public/stats');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const stats = await response.json();
    console.log('Statistics loaded:', stats);
    
    if (stats) {
      // Animate numbers
      animateNumber('totalAnggota', 0, stats.totalAnggota || 0, 2000);
      animateNumber('totalSimpanan', 0, stats.totalSimpanan || 0, 2000, true);
      
      // Calculate total aset (simpanan + laba bersih)
      const totalAset = (stats.totalSimpanan || 0) + (stats.labaBersih || 0);
      console.log('Total Aset calculated:', totalAset);
      animateNumber('totalAset', 0, totalAset, 2000, true);
    } else {
      console.warn('No statistics data received');
      // Set default values
      document.getElementById('totalAnggota').textContent = '0';
      document.getElementById('totalSimpanan').textContent = 'Rp 0';
      document.getElementById('totalAset').textContent = 'Rp 0';
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
    // Set default values on error
    document.getElementById('totalAnggota').textContent = '0';
    document.getElementById('totalSimpanan').textContent = 'Rp 0';
    document.getElementById('totalAset').textContent = 'Rp 0';
  }
}

// Animate Number
function animateNumber(elementId, start, end, duration, isCurrency = false) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    
    if (isCurrency) {
      element.textContent = formatCurrency(Math.floor(current));
    } else {
      element.textContent = Math.floor(current).toLocaleString('id-ID');
    }
  }, 16);
}

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Contact Form
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = 'Mengirim...';
  
  try {
    // Get form data
    const formData = {
      nama: form.querySelector('input[placeholder="Nama Lengkap"]').value,
      email: form.querySelector('input[placeholder="Email"]').value,
      telepon: form.querySelector('input[placeholder="Nomor Telepon"]').value,
      pesan: form.querySelector('textarea').value
    };
    
    // Send to backend
    const response = await fetch('/api/kontak/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Show success message
      alert('✅ ' + result.message);
      
      // Reset form
      form.reset();
    } else {
      alert('❌ ' + (result.error || 'Gagal mengirim pesan'));
    }
  } catch (error) {
    console.error('Error submitting contact form:', error);
    alert('❌ Terjadi kesalahan. Silakan coba lagi.');
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Intersection Observer for Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements
document.querySelectorAll('.service-card, .product-card, .stat-item').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadKoperasiInfo();
  loadStatistics();
  loadArtikel();
  loadGaleri();
  feather.replace();
  
  // Debug: Check register buttons
  const registerButtons = document.querySelectorAll('a[href="/register.html"]');
  console.log('Register buttons found:', registerButtons.length);
  
  // Ensure register buttons work - especially CTA button
  registerButtons.forEach((btn, index) => {
    console.log(`Button ${index + 1}:`, btn.className, btn.textContent.trim());
    
    // Remove any conflicting event listeners
    btn.addEventListener('click', (e) => {
      console.log('Register button clicked:', btn.className);
      console.log('Navigating to:', btn.href);
      
      // Force navigation if needed
      if (!e.defaultPrevented) {
        console.log('Navigation allowed');
      } else {
        console.warn('Navigation was prevented!');
        e.stopImmediatePropagation();
        window.location.href = btn.href;
      }
    }, true); // Use capture phase
  });
  
  // Extra handler for CTA button specifically
  const ctaButton = document.querySelector('.btn-cta');
  if (ctaButton) {
    console.log('CTA button found:', ctaButton);
    ctaButton.style.cursor = 'pointer';
    ctaButton.style.pointerEvents = 'auto';
  }
});

// Refresh icons after dynamic content
setInterval(() => {
  feather.replace();
}, 1000);


// Load Artikel Terbaru
async function loadArtikel() {
  const container = document.getElementById('artikelGrid');
  
  try {
    const response = await fetch('/api/artikel/published?limit=3');
    const data = await response.json();
    
    if (data.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Belum ada artikel tersedia</p>';
      return;
    }
    
    container.innerHTML = data.map(artikel => `
      <div class="artikel-card">
        <div class="artikel-image">
          ${artikel.gambar_utama ? 
            `<img src="/uploads/${artikel.gambar_utama}" alt="${artikel.judul}">` :
            `<div class="artikel-placeholder">
              <i data-feather="file-text"></i>
            </div>`
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
  } catch (error) {
    console.error('Error loading artikel:', error);
    container.innerHTML = '<p style="text-align: center; color: #999;">Gagal memuat artikel</p>';
  }
}

// Load Galeri Terbaru
async function loadGaleri() {
  const container = document.getElementById('galeriGrid');
  
  try {
    const response = await fetch('/api/galeri/aktif?limit=6');
    const data = await response.json();
    
    if (data.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Belum ada galeri tersedia</p>';
      return;
    }
    
    container.innerHTML = data.map(galeri => `
      <div class="galeri-item" onclick="viewGaleriImage('/uploads/${galeri.gambar}', '${galeri.judul}')">
        <img src="/uploads/${galeri.gambar}" alt="${galeri.judul}">
        <div class="galeri-overlay">
          <h4>${galeri.judul}</h4>
          <p>${galeri.deskripsi || ''}</p>
          <span class="galeri-kategori">${galeri.kategori}</span>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading galeri:', error);
    container.innerHTML = '<p style="text-align: center; color: #999;">Gagal memuat galeri</p>';
  }
}

// View Galeri Image (Lightbox)
function viewGaleriImage(imageUrl, title) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" onclick="this.closest('.lightbox').remove()">×</button>
      <img src="${imageUrl}" alt="${title}">
      <h3>${title}</h3>
    </div>
  `;
  
  document.body.appendChild(lightbox);
  
  // Close on click outside
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.remove();
    }
  });
}

// Format Date
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

