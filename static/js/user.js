document.addEventListener('DOMContentLoaded', async () => {
  // Check login status
  try {
    const response = await fetch('/auth/check-status', {
      method: 'GET',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok || !result.logged) {
      alert('Please login');
      window.open('/login.html', '_self');
      return;
    }

    // Load profile data
    try {
      const profileResponse = await fetch('/auth/profile', {
        method: 'GET',
        credentials: 'include',
      });

      const profileResult = await profileResponse.json();
      if (profileResult.status === 'success') {
        const greetingElement = document.getElementById('greeting');
        greetingElement.classList.add('greeting', 'bg-secondary');
        greetingElement.innerHTML = `Welcome back, <strong>${profileResult.user.nickname}</strong>! You are logged in as <em>${profileResult.user.role}</em>.`;

        // Check if profile image exists, else set to default image
        const profileImageElement = document.querySelector('.profile-image');
        profileImageElement.src = profileResult.user['profile-image']
          ? profileResult.user['profile-image']
          : '/assets/unknown.png';

        document.getElementById('userid').textContent = profileResult.user.user_id;
        document.getElementById('nickname').textContent = profileResult.user.nickname;
        document.getElementById('email').textContent = profileResult.user.email;
        document.getElementById('gender').textContent = profileResult.user.gender;
        document.getElementById('birthdate').textContent = profileResult.user.birthdate;
        document.getElementById('role').textContent = profileResult.user.role;
      } else {
        alert('Could not load profile data. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      alert('Could not load profile data');
    }

    // Edit button functionality
    const editButton = document.getElementById('editButton');
    editButton.addEventListener('click', () => {
      window.open('/profileedit.html', '_self'); // 点击后跳转到 profileedit.html
    });

    // Logout button functionality
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', async () => {
      const confirmLogout = confirm('Confirm to logout?');
      if (confirmLogout) {
        try {
          await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
          window.open('/login.html', '_self');
        } catch (error) {
          alert('Error during logout. Please try again.');
          console.error('Logout error:', error);
        }
      }
    });
  } catch (error) {
    console.error('Error checking login status:', error);
    alert('An error occurred while checking login status. Please try again.');
    window.open('/login.html', '_self');
  }
});
