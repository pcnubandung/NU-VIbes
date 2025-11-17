// Register Page JavaScript

// Initialize Feather Icons
feather.replace();

// Load Koperasi Info
async function loadKoperasiInfo() {
  try {
    const response = await fetch('/api/koperasi-info');
    const data = await response.json();
    
    if (data) {
      if (data.logo) {
        document.getElementById('headerLogo').src = data.logo;
      }
      if (data.nomor_telpon) {
        document.getElementById('contactPhone').textContent = data.nomor_telpon;
      }
    }
  } catch (error) {
    console.error('Error loading koperasi info:', error);
  }
}

// Generate Nomor Anggota
function generateNomorAnggota() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `NUV${year}${random}`;
}

// Form Validation
function validateForm(formData) {
  const errors = [];
  
  // Required fields
  if (!formData.nama_lengkap || formData.nama_lengkap.trim() === '') {
    errors.push('Nama lengkap harus diisi');
  }
  
  if (!formData.alamat || formData.alamat.trim() === '') {
    errors.push('Alamat harus diisi');
  }
  
  if (!formData.nomor_telpon || formData.nomor_telpon.trim() === '') {
    errors.push('Nomor telepon harus diisi');
  }
  
  // NIK validation (if provided)
  if (formData.nik && formData.nik.length !== 16) {
    errors.push('NIK harus 16 digit');
  }
  
  // Phone validation
  if (formData.nomor_telpon) {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(formData.nomor_telpon.replace(/\s/g, ''))) {
      errors.push('Format nomor telepon tidak valid');
    }
  }
  
  // Email validation (if provided)
  if (formData.email && formData.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Format email tidak valid');
    }
  }
  
  // Username & Password validation (if provided)
  if (formData.username && formData.username.trim() !== '') {
    if (formData.username.length < 4) {
      errors.push('Username minimal 4 karakter');
    }
    
    if (!formData.password || formData.password.length < 6) {
      errors.push('Password minimal 6 karakter jika membuat akun portal');
    }
  }
  
  if (formData.password && formData.password.trim() !== '' && !formData.username) {
    errors.push('Username harus diisi jika membuat password');
  }
  
  return errors;
}

// Handle Form Submit
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Check agreement
  if (!document.getElementById('agreement').checked) {
    alert('Anda harus menyetujui syarat dan ketentuan');
    return;
  }
  
  // Get form data
  const formData = new FormData(e.target);
  
  // Create data object for validation (exclude files)
  const data = {};
  formData.forEach((value, key) => {
    if (key !== 'foto_ktp' && key !== 'pas_foto') {
      data[key] = typeof value === 'string' ? value.trim() : value;
    }
  });
  
  // Validate
  const errors = validateForm(data);
  if (errors.length > 0) {
    alert('Terjadi kesalahan:\n\n' + errors.join('\n'));
    return;
  }
  
  // Generate nomor anggota
  const nomorAnggota = generateNomorAnggota();
  const tanggalBergabung = new Date().toISOString().split('T')[0];
  
  // Add to FormData
  formData.append('nomor_anggota', nomorAnggota);
  formData.append('tanggal_bergabung', tanggalBergabung);
  formData.append('status', 'aktif');
  
  // Disable submit button
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i data-feather="loader"></i><span>Memproses...</span>';
  feather.replace();
  
  try {
    // Send to API with FormData (includes files)
    const response = await fetch('/api/register/anggota', {
      method: 'POST',
      body: formData // Don't set Content-Type, browser will set it with boundary
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      // Show success modal
      document.getElementById('memberNumber').textContent = nomorAnggota;
      document.getElementById('successModal').classList.add('active');
      
      // Reset form
      e.target.reset();
      
      // Clear previews
      document.getElementById('preview_ktp').innerHTML = '';
      document.getElementById('preview_ktp').classList.remove('has-image');
      document.getElementById('preview_foto').innerHTML = '';
      document.getElementById('preview_foto').classList.remove('has-image');
    } else {
      alert('Pendaftaran gagal: ' + (result.message || 'Terjadi kesalahan'));
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-feather="user-plus"></i><span>Daftar Sekarang</span>';
      feather.replace();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-feather="user-plus"></i><span>Daftar Sekarang</span>';
    feather.replace();
  }
});

// Show Terms Modal
function showTerms() {
  document.getElementById('termsModal').classList.add('active');
}

// Close Terms Modal
function closeTerms() {
  document.getElementById('termsModal').classList.remove('active');
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

// Image Preview Function
function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  if (input && preview) {
    input.addEventListener('change', function(e) {
      const file = e.target.files[0];
      
      if (file) {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('Ukuran file terlalu besar! Maksimal 2MB');
          input.value = '';
          preview.innerHTML = '';
          preview.classList.remove('has-image');
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('File harus berupa gambar!');
          input.value = '';
          preview.innerHTML = '';
          preview.classList.remove('has-image');
          return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
          preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
          preview.classList.add('has-image');
        };
        reader.readAsDataURL(file);
      } else {
        preview.innerHTML = '';
        preview.classList.remove('has-image');
      }
    });
  }
}

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadKoperasiInfo();
  feather.replace();
  
  // Setup image preview
  setupImagePreview('foto_ktp', 'preview_ktp');
  setupImagePreview('pas_foto', 'preview_foto');
});

// Refresh icons periodically
setInterval(() => {
  feather.replace();
}, 1000);
