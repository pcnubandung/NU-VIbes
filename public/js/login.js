document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/index.html';
    } else {
      errorMessage.textContent = data.error || 'Login gagal';
      errorMessage.style.display = 'block';
    }
  } catch (error) {
    errorMessage.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
    errorMessage.style.display = 'block';
  }
});
