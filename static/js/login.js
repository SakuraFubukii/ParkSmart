// 登录功能
document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('userid').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('Username and password cannot be empty');
    return;
  }

  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      // 存储 user_id 到 sessionStorage
      sessionStorage.setItem('userid', result.user.user_id);
      alert(`Logged in as ${result.user.nickname} (${result.user.role})`);
      window.location.href = result.user.role === 'admin' ? '/parkingManagement.html' : '/index.html';
    } else {
      alert(result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('Unknown error occurred.');
  }
});

// 登出功能
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('/auth/logout', {
      method: 'POST',
    });

    if (response.ok) {
      alert('Logged out successfully');
      sessionStorage.removeItem('userid'); // 清除 user_id
      window.location.href = '/login.html'; // 重定向到登录页面
    } else {
      const result = await response.json();
      alert(result.message || 'Logout failed');
    }
  } catch (error) {
    console.error('Error during logout:', error);
    alert('Unknown error occurred.');
  }
});
