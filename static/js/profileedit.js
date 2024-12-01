document.addEventListener('DOMContentLoaded', async () => {
  // Fetch user info
  try {
    const response = await fetch('/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Failed to fetch user info:', errorMessage);
      alert('Please login');
      window.open('/login.html', '_self');
      return;
    }

    const result = await response.json();
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
      greetingElement.classList.add('greeting', 'bg-secondary'); // Add Bootstrap background class
      greetingElement.innerHTML = `Welcome back, <strong>${result.user.username}</strong>! You are logged in as <em>${result.user.role}</em>.`;
    }

    // Load profile data
    try {
      const profileResponse = await fetch('/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const profileResult = await profileResponse.json();
      if (profileResult.status === 'success') {
        console.log('Profile image path:', '/static/' + profileResult.user.image);
        document.querySelector('.profile-image').src = profileResult.user.image;
        document.getElementById('userid').textContent = profileResult.user.userid;
        document.getElementById('nickname').textContent = profileResult.user.nickname;
        document.getElementById('email').textContent = profileResult.user.email;
        document.getElementById('gender').textContent = profileResult.user.gender;
        document.getElementById('birthdate').textContent = profileResult.user.birthdate;
        document.getElementById('role').textContent = profileResult.user.role;

        console.log(`User data loaded: ${profileResult.user.userid}`);
      } else {
        alert('Please Login.');
        window.open('/index.html', '_self');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      alert('Could not load profile data');
    }

    // Logout button functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        const confirmLogout = confirm('Confirm to logout?');
        if (confirmLogout) {
          fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include',
          })
            .then(() => {
              window.open('/login.html', '_self');
            })
            .catch((error) => {
              alert('Error during logout. Please try again.');
              console.error('Logout error:', error);
            });
        }
      });
    }

    // Profile editing form submission
    document.querySelector('form').addEventListener('submit', async (event) => {
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
          window.open('/profile.html', '_self');
        } else {
          alert(editResult.message);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating the profile');
      }
    });

    // Additional logout button for profile edit page
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        const confirmed = confirm('Confirm to logout?');

        if (confirmed) {
          try {
            const response = await fetch('/auth/logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              alert('You have been logged out successfully.');
              window.open('/index.html', '_self');
            }
          } catch (error) {
            console.error('Error logging out:', error);
            alert('An unknown error occurred during logout');
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    alert('Please login');
    window.open('/login.html', '_self');
  }
});
