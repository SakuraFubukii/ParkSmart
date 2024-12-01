document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('userid').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('Username and password cannot be empty');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('userid', username);
    formData.append('password', password);

    const response = await fetch('/auth/login', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      if (result.user.role === 'admin') {
        window.open('/parkingManagement.html', '_self');
      } else {
        window.open('/index.html', '_self');
      }
    } else if (result.message) {
      alert(result.message);
    } else {
      alert('Unknown error');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An unknown error occurred');
  }
});
