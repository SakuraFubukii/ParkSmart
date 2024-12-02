document.addEventListener('DOMContentLoaded', async () => {
  // 检查用户登录状态
  try {
    const statusResponse = await fetch('/auth/check-status', {
      method: 'GET',
      credentials: 'include',
    });

    const statusResult = await statusResponse.json();
    if (!statusResult.logged) {
      alert('Please login');
      window.open('/login.html', '_self');
      return;
    }

    // 获取用户信息
    const profileResponse = await fetch('/auth/profile', {
      method: 'GET',
      credentials: 'include',
    });

    if (!profileResponse.ok) {
      alert('Failed to fetch profile data. Please login again.');
      window.open('/login.html', '_self');
      return;
    }

    const profileResult = await profileResponse.json();

    // 填充当前用户信息
    document.getElementById('nickname').value = profileResult.user.nickname || '';
    document.getElementById('email').value = profileResult.user.email || '';
  } catch (error) {
    console.error('Error fetching user info:', error);
    alert('An error occurred while fetching user info. Please login again.');
    window.open('/login.html', '_self');
  }

  // 处理表单提交
  document.getElementById('editProfileForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nickname = document.getElementById('nickname').value;
    const email = document.getElementById('email').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const profilePic = document.getElementById('profilepic').files[0];

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nickname', nickname);
      formData.append('email', email);
      formData.append('currentPassword', currentPassword);
      formData.append('password', password);
      if (profilePic) {
        formData.append('profilepic', profilePic);
      }

      const editResponse = await fetch('/auth/profileedit', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const editResult = await editResponse.json();
      if (editResponse.ok && editResult.status === 'success') {
        alert('Profile updated successfully');
        window.open('/user.html', '_self');
      } else {
        alert(editResult.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile');
    }
  });
});
