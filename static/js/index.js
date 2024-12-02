async function checkLoginStatus() {
  try {
    const response = await fetch('/auth/check-status', {
      method: 'GET',
      credentials: 'include', // Include cookies for session management
    });

    if (response.ok) {
      const result = await response.json();
      const authBtn = document.getElementById('authBtn');
      const btnText = authBtn.querySelector('strong');
      const registerBtn = document.getElementById('registerBtn');

      if (result.logged) {
        btnText.textContent = 'Logout';
        authBtn.onclick = async () => {
          const logoutResponse = await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
          if (logoutResponse.ok) {
            alert('Logged out successfully');
            window.location.reload(); // Reload to update the UI
          } else {
            alert('Logout failed');
          }
        };
        registerBtn.textContent = 'Booking';
        registerBtn.onclick = () => window.open('booking.html', '_self');
      } else {
        btnText.textContent = 'Login';
        authBtn.onclick = () => window.open('login.html', '_self');
        registerBtn.textContent = 'Register';
        registerBtn.onclick = () => window.open('register.html', '_self');
      }
    }
  } catch (error) {
    console.error('Error checking login status:', error);
  }
}

function updateTime() {
  document.getElementById('time').textContent = new Date().toLocaleString('en-HK', {
    timeZone: 'Asia/Hong_Kong',
  });
}

setInterval(updateTime, 1000);
updateTime();
checkLoginStatus(); // Check login status on page load
