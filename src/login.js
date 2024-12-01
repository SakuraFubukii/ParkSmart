import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { validate_user, create_user, fetch_user, username_exist, modify_user, fetch_all_users } from './userdb.js';

const route = express.Router();
const form = multer();
const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 登录
route.post('/login', form.none(), async (req, res) => {
  const { userid, password } = req.body;
  console.log('Login attempt:', userid);
  req.session.logged = false;
  const user = await validate_user(userid, password);
  if (!user) {
    return res.status(401).json({
      status: 'failed',
      message: 'Incorrect userid and password',
    });
  } else if (!user.enabled) {
    return res.status(401).json({
      status: 'failed',
      message: `User \`${userid}\` is currently disabled`,
    });
  } else {
    req.session.logged = true;
    req.session.userid = user.userid;
    req.session.role = user.role;
    req.session.timestamp = new Date().toISOString();
    console.log('Session created:', req.session);
    res.json({
      status: 'success',
      user: {
        userid: user.userid,
        role: user.role,
      },
    });
  }
});

// 登出
route.post('/logout', async (req, res) => {
  if (req.session.logged) {
    req.session.destroy((err) => {
      res.end();
    });
  } else {
    res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }
});

// 获取当前用户信息
route.get('/me', async (req, res) => {
  console.log('Checking session:', req.session);
  if (req.session.logged) {
    const user = {
      userid: req.session.userid,
      role: req.session.role,
    };
    res.json({
      status: 'success',
      user: user,
    });
  } else {
    console.log('Unauthorized access attempt');
    res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }
});

// 用户注册
route.post('/register', upload.single('profilepic'), async (req, res) => {
  const { userid, nickname, password, email, gender, birthdate } = req.body;

  if (!userid || !password) {
    return res.status(400).json({
      status: 'failed',
      message: 'Missing fields',
    });
  }
  if (userid.length < 3) {
    return res.status(400).json({
      status: 'failed',
      message: 'Userid must be at least 3 characters',
    });
  }
  if (await username_exist(userid)) {
    return res.status(400).json({
      status: 'failed',
      message: `Username \`${userid}\` already exists`,
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      status: 'failed',
      message: 'Password must be at least 8 characters',
    });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid email format',
    });
  }
  let profileImagePath = null;
  if (req.file) {
    try {
      const ext = path.extname(req.file.originalname);
      const newFileName = `profile_${userid}${ext}`;
      const newPath = path.join(__dirname, '../static/profile/', newFileName);
      console.log('Original file path:', req.file.path);
      console.log('New file path:', newPath);
      await fs.rename(req.file.path, newPath);
      profileImagePath = `profile/${newFileName}`;
    } catch (fileError) {
      console.error('Error handling profile picture upload:', fileError);
      return res.status(500).json({
        status: 'failed',
        message: 'Error processing the profile image',
      });
    }
  }
  const success = await create_user(userid, nickname, password, email, gender, birthdate, profileImagePath);
  if (success) {
    res.json({
      status: 'success',
      user: {
        username: userid,
      },
    });
  } else {
    res.status(500).json({
      status: 'failed',
      message: 'Account created but unable to save into the database',
    });
  }
});

// 获取用户资料
route.get('/profile', async (req, res) => {
  if (!req.session || !req.session.logged) {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }
  try {
    const user = await fetch_user(req.session.userid);
    if (user) {
      res.json({
        status: 'success',
        user: {
          userid: user.userid,
          nickname: user.nickname,
          email: user.email,
          gender: user.gender,
          birthdate: user.birthdate,
          role: user.role,
          image: user.profileimage,
        },
      });
    } else {
      res.status(404).json({
        status: 'failed',
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Internal server error',
    });
  }
});

// 编辑用户资料
route.post('/profileedit', upload.single('profilepic'), async (req, res) => {
  const { nickname, email, currentPassword, password } = req.body;
  const sessionUsername = req.session.userid;

  if (!sessionUsername) {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }

  const user = await validate_user(sessionUsername, currentPassword);
  if (!user) {
    return res.status(400).json({
      status: 'failed',
      message: 'Incorrect current password',
    });
  }

  if (password && password.length < 8) {
    return res.status(400).json({
      status: 'failed',
      message: 'Password must be at least 8 characters',
    });
  }

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid email format',
    });
  }

  let profileImagePath = user.profileimage;
  if (req.file) {
    try {
      const ext = path.extname(req.file.originalname);
      const newFileName = `profile_${sessionUsername}${ext}`;
      const newPath = path.join(__dirname, '../static/profile/', newFileName);
      console.log('Original file path:', req.file.path);
      console.log('New file path:', newPath);
      await fs.rename(req.file.path, newPath);
      profileImagePath = `profile/${newFileName}`;
    } catch (fileError) {
      console.error('Error handling profile picture upload:', fileError);
      return res.status(500).json({
        status: 'failed',
        message: 'Error processing the profile image',
      });
    }
  }

  try {
    const success = await modify_user(sessionUsername, {
      nickname: nickname,
      password: password,
      email: email,
      profileimage: profileImagePath,
    });
    if (success) {
      res.json({
        status: 'success',
        message: 'Profile updated',
      });
    } else {
      res.status(500).json({
        status: 'failed',
        message: 'Could not update the profile',
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Internal server error',
    });
  }
});

// 管理员用户展示
route.get('/admin/userdisplay', async (req, res) => {
  if (!req.session || !req.session.logged || req.session.role !== 'admin') {
    return res.status(403).json({
      status: 'failed',
      message: 'Access denied. Admins only.',
    });
  }
  try {
    const users = await fetch_all_users();
    res.json({
      status: 'success',
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'failed',
      message: 'Failed to fetch user data.',
    });
  }
});

export default route;
