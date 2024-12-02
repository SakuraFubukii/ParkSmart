import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const route = express.Router();
const form = multer();

// Get the current filename and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the users JSON file
const usersFilePath = path.join(__dirname, '../static/data/Users.json');

// Validate user credentials against the users JSON file
async function validate_user(userid, password) {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);
    console.log('Users:', users);
    return users.find((user) => user.user_id === userid && user.password === password);
  } catch (error) {
    console.error('Error reading users file:', error);
    return null;
  }
}

// Check if user ID already exists
async function userIdExists(userid) {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);
    return users.some((user) => user.user_id === userid);
  } catch (error) {
    console.error('Error reading users file:', error);
    return false;
  }
}

// Register route
route.post(
  '/register',
  form.fields([
    { name: 'userid' },
    { name: 'nickname' },
    { name: 'email' },
    { name: 'password' },
    { name: 'gender' },
    { name: 'birthdate' },
    { name: 'profilepic' },
  ]),
  async (req, res) => {
    const { userid, nickname, email, password, gender, birthdate } = req.body;

    // Check if user ID already exists
    if (await userIdExists(userid)) {
      return res.status(400).json({ status: 'failed', message: 'UserID already exists' });
    }

    // Create new user object
    const newUser = {
      user_id: userid,
      nickname,
      email,
      gender,
      password,
      birthdate,
      role: 'user',
      enabled: true,
      'profile-image': req.files.profilepic ? `assets/${req.files.profilepic[0].originalname}` : null,
    };

    try {
      // Read existing users
      const data = await fs.readFile(usersFilePath, 'utf8');
      const users = JSON.parse(data);

      // Add new user to users array
      users.push(newUser);

      // Write updated users array back to file
      await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

      console.log('New user registered:', newUser); // Log the new user
      return res.status(201).json({ status: 'success', user: newUser });
    } catch (error) {
      console.error('Error writing users file:', error);
      return res.status(500).json({ status: 'failed', message: 'Server error' });
    }
  }
);

// Login route
route.post('/login', form.none(), async (req, res) => {
  if (req.session.logged) {
    return res.status(400).json({ status: 'failed', message: 'User already logged in' });
  }

  const { username, password } = req.body;
  const user = await validate_user(username, password);

  if (user) {
    if (!user.enabled) {
      return res.status(401).json({
        status: 'failed',
        message: `User \`${username}\` is currently disabled`,
      });
    }

    // Store additional user information in the session
    req.session.username = user.nickname;
    req.session.role = user.role;
    req.session.user_id = user.user_id;
    req.session.email = user.email; // 新增
    req.session.gender = user.gender; // 新增
    req.session.birthdate = user.birthdate; // 新增
    req.session['profile-image'] = user['profile-image']; // 新增
    req.session.logged = true;
    req.session.loginTime = new Date();

    return res.json({
      status: 'success',
      user: {
        nickname: user.nickname,
        role: user.role,
        user_id: user.user_id,
        email: user.email,
        gender: user.gender,
        birthdate: user.birthdate,
        'profile-image': user['profile-image'],
      },
    });
  } else {
    return res.status(401).json({
      status: 'failed',
      message: 'Incorrect username and password',
    });
  }
});

// Logout route
route.post('/logout', (req, res) => {
  if (req.session.logged) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ status: 'failed', message: 'Logout failed' });
      }
      return res.json({ status: 'success', message: 'Logged out successfully' });
    });
  } else {
    return res.status(400).json({ status: 'failed', message: 'No user is currently logged in' });
  }
});

// Check login status route
route.get('/check-status', (req, res) => {
  if (req.session.logged) {
    return res.json({ logged: true });
  }
  return res.json({ logged: false });
});

// Profile route to get user information
route.get('/profile', (req, res) => {
  if (req.session.logged) {
    return res.json({
      status: 'success',
      user: {
        user_id: req.session.user_id,
        nickname: req.session.username,
        role: req.session.role,
        email: req.session.email,
        gender: req.session.gender,
        birthdate: req.session.birthdate,
        'profile-image': req.session['profile-image'],
      },
    });
  } else {
    return res.status(401).json({ status: 'failed', message: 'User not logged in' });
  }
});

// Profile edit route
route.post(
  '/profileedit',
  form.fields([
    { name: 'nickname' },
    { name: 'email' },
    { name: 'currentPassword' },
    { name: 'password' },
    { name: 'profilepic' },
  ]),
  async (req, res) => {
    if (!req.session.logged) {
      return res.status(401).json({ status: 'failed', message: 'User not logged in' });
    }

    const { nickname, email, currentPassword, password } = req.body;
    const userId = req.session.user_id;

    try {
      const data = await fs.readFile(usersFilePath, 'utf8');
      const users = JSON.parse(data);

      const userIndex = users.findIndex((user) => user.user_id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ status: 'failed', message: 'User not found' });
      }

      const user = users[userIndex];

      if (user.password !== currentPassword) {
        return res.status(401).json({ status: 'failed', message: 'Incorrect current password' });
      }

      if (nickname) user.nickname = nickname;
      if (email) user.email = email;
      if (password) user.password = password;

      if (req.files.profilepic) {
        user['profile-image'] = `assets/${req.files.profilepic[0].originalname}`;
      }

      await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

      req.session.username = user.nickname;
      req.session.email = user.email;

      return res.json({ status: 'success', user });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ status: 'failed', message: 'Server error' });
    }
  }
);

export default route;
