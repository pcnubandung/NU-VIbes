// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
  window.location.href = '/login.html';
}

// Set user info
document.getElementById('userName').textContent = user.nama_lengkap || 'User';
document.getElementById('userRole').textContent = user.role || 'User';

// Set dropdown user info
document.getElementById('dropdownUserName').textContent = user.nama_lengkap || 'User';
document.getElementById('dropdownUserRole').textContent = user.role || 'User';

// Load user photo
function loadUserPhoto() {
  const userPhoto = document.getElementById('userPhoto');
  const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
  const dropdownUserPhoto = document.getElementById('dropdownUserPhoto');
  const dropdownAvatarPlaceholder = document.getElementById('dropdownAvatarPlaceholder');
  
  if (user.foto) {
    userPhoto.src = user.foto;
    userPhoto.style.display = 'block';
    if (userAvatarPlaceholder) userAvatarPlaceholder.style.display = 'none';
    
    // Set dropdown photo
    if (dropdownUserPhoto) {
      dropdownUserPhoto.src = user.foto;
      dropdownUserPhoto.style.display = 'block';
    }
    if (dropdownAvatarPlaceholder) dropdownAvatarPlaceholder.style.display = 'none';
  } else {
    // Show placeholder with user initial
    const initial = user.nama_lengkap ? user.nama_lengkap.charAt(0).toUpperCase() : 'U';
    if (userAvatarPlaceholder) {
      userAvatarPlaceholder.innerHTML = `<span style="font-size: 20px; font-weight: bold;">${initial}</span>`;
    }
    if (dropdownAvatarPlaceholder) {
      dropdownAvatarPlaceholder.innerHTML = `<span style="font-size: 24px; font-weight: bold;">${initial}</span>`;
    }
  }
}

// Load user photo on page load
loadUserPhoto();

// Load sidebar logo
async function loadSidebarLogo() {
  try {
    const response = await fetch('/api/koperasi/logo');
    const data = await response.json();
    
    if (data.logo) {
      const sidebarLogo = document.getElementById('sidebarLogo');
      const logoPlaceholder = document.getElementById('logoPlaceholder');
      
      sidebarLogo.src = data.logo;
      sidebarLogo.style.display = 'block';
      if (logoPlaceholder) logoPlaceholder.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading sidebar logo:', error);
  }
}

// Load logo on page load
loadSidebarLogo();

// Update current date
function updateCurrentDate() {
  const dateElement = document.getElementById('dateText');
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
updateCurrentDate();

// Update date every minute
setInterval(updateCurrentDate, 60000);

// Hide menu based on role
if (user.role === 'Kasir') {
  // Hide menu yang tidak boleh diakses kasir
  const restrictedMenus = [
    'info-koperasi',
    'unit-usaha', 
    'aset-inventaris',
    'data-anggota',
    'data-pengurus', 
    'data-karyawan',
    'shu',
    'pengaturan'
  ];
  
  restrictedMenus.forEach(menu => {
    const menuItem = document.querySelector(`[data-page="${menu}"]`);
    if (menuItem) {
      menuItem.style.display = 'none';
    }
  });
  
  // Hide nav groups yang tidak relevan
  const navGroups = document.querySelectorAll('.nav-group');
  navGroups.forEach(group => {
    const title = group.querySelector('.nav-group-title .nav-text');
    if (title) {
      const text = title.textContent.trim();
      if (text === 'Unit Usaha' || text === 'Manajemen Anggota') {
        group.style.display = 'none';
      }
    }
  });
} else if (user.role === 'Pengawas') {
  // Pengawas: Read-only access, tidak bisa input transaksi
  const restrictedMenus = [
    'pengaturan'  // Tidak bisa manage user
  ];
  
  restrictedMenus.forEach(menu => {
    const menuItem = document.querySelector(`[data-page="${menu}"]`);
    if (menuItem) {
      menuItem.style.display = 'none';
    }
  });
  
  // Hide nav groups transaksi (tidak bisa input)
  const navGroups = document.querySelectorAll('.nav-group');
  navGroups.forEach(group => {
    const title = group.querySelector('.nav-group-title .nav-text');
    if (title) {
      const text = title.textContent.trim();
      if (text === 'Transaksi Simpanan' || text === 'Transaksi Keuangan') {
        group.style.display = 'none';
      }
    }
  });
}

// API Helper
const API = {
  async request(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
      return;
    }
    
    return response.json();
  },
  
  get(url) {
    return this.request(url);
  },
  
  post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  put(url, data) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete(url) {
    return this.request(url, {
      method: 'DELETE'
    });
  },
  
  async uploadFile(url, formData) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
      return;
    }
    
    return response.json();
  }
};

// Navigation
const navItems = document.querySelectorAll('.nav-item[data-page]');
const contentArea = document.getElementById('contentArea');
const pageTitle = document.getElementById('pageTitle');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.getAttribute('data-page');
    loadPage(page);
    
    // Update active state
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    // Update page title
    pageTitle.textContent = item.querySelector('.nav-text').textContent;
    
    // Close mobile menu
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('active');
    }
  });
});

// Mobile menu toggle
document.getElementById('mobileMenuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('active');
});

// User Dropdown Toggle
const userProfileBtn = document.getElementById('userProfileBtn');
const userDropdown = document.getElementById('userDropdown');

userProfileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  userProfileBtn.classList.toggle('active');
  userDropdown.classList.toggle('show');
  
  // Replace feather icons in dropdown
  setTimeout(() => {
    feather.replace();
  }, 10);
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!userProfileBtn.contains(e.target) && !userDropdown.contains(e.target)) {
    userProfileBtn.classList.remove('active');
    userDropdown.classList.remove('show');
  }
});

// Dropdown menu items
const dropdownItems = userDropdown.querySelectorAll('.dropdown-item[data-page]');
dropdownItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.getAttribute('data-page');
    loadPage(page);
    
    // Update active state in sidebar
    navItems.forEach(nav => nav.classList.remove('active'));
    const sidebarItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (sidebarItem) {
      sidebarItem.classList.add('active');
    }
    
    // Update page title
    pageTitle.textContent = item.querySelector('span').textContent;
    
    // Close dropdown
    userProfileBtn.classList.remove('active');
    userDropdown.classList.remove('show');
    
    // Close mobile menu
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('active');
    }
  });
});

// Logout from dropdown
document.getElementById('dropdownLogoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  if (confirm('Apakah Anda yakin ingin logout?')) {
    await API.post('/api/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  }
});

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Load Pending Count for Notification Badge
async function loadPendingCount() {
  try {
    const response = await fetch('/api/anggota/pending/count', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    const badge = document.getElementById('notificationBadge');
    const menuBadge = document.getElementById('menuBadge');
    
    if (data.count > 0) {
      // Update notification badge in header
      if (badge) {
        badge.textContent = data.count;
        badge.style.display = 'block';
        badge.classList.add('pulse');
      }
      
      // Update menu badge in sidebar
      if (menuBadge) {
        menuBadge.textContent = data.count;
        menuBadge.style.display = 'inline-block';
      }
    } else {
      // Hide badges when count is 0
      if (badge) {
        badge.style.display = 'none';
        badge.classList.remove('pulse');
      }
      if (menuBadge) {
        menuBadge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error loading pending count:', error);
  }
}

// Click notification bell to go to approval page
const notificationBtn = document.getElementById('notificationBtn');
if (notificationBtn) {
  notificationBtn.addEventListener('click', () => {
    loadPage('approval-anggota');
    
    // Update active menu
    navItems.forEach(nav => nav.classList.remove('active'));
    const approvalMenuItem = document.querySelector('[data-page="approval-anggota"]');
    if (approvalMenuItem) {
      approvalMenuItem.classList.add('active');
      pageTitle.textContent = 'Persetujuan Anggota';
    }
  });
}

// Load pending count on page load
document.addEventListener('DOMContentLoaded', () => {
  loadPendingCount();
  
  // Refresh every 30 seconds
  setInterval(loadPendingCount, 30000);
});

// Load initial page - will be called after all scripts loaded
// See index.html for the actual call
