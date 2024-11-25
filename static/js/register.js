document.getElementById('registerBtn').addEventListener('click', async () => {
  const userid = document.getElementById('userid').value;
  const nickname = document.getElementById('nickname').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const repeatpassword = document.getElementById('re-password').value;
  const gender = document.getElementById('gender').value;
  const birthdate = document.getElementById('birthdate').value;
  const profilePic = document.getElementById('profilepic').files[0];

  if (!userid || !password) {
    alert('Username and password cannot be empty');
    return;
  }
  if (password !== repeatpassword) {
    alert('Password mismatch!');
    return;
  }
  if (!email) {
    alert('Email cannot be empty');
    return;
  }
  if (!nickname) {
    alert('Nickname cannot be empty');
    return;
  }
  if (!gender) {
    alert('Choose your gender');
    return;
  }
  if (!birthdate) {
    alert('Birthdate cannot be empty');
    return;
  }
  try {
    const formData = new FormData();
    formData.append('userid', userid);
    formData.append('nickname', nickname);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('gender', gender);
    formData.append('birthdate', birthdate);
    if (profilePic) {
      formData.append('profilepic', profilePic);
    }

    const response = await fetch('/auth/register', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      alert(`Welcome, ${result.user.username}!\nYou can login with your account now!`);
      window.open('/login.html', '_self');
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An unknown error occurred');
  }
});
