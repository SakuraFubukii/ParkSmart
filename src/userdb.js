import fs from 'fs/promises';
import path from 'path';
import client from './dbclient.js';

const currentTime = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
console.log(`${currentTime}`);

const users = client.db('football').collection('users');

async function init_db() {
  try {
    const count = await users.countDocuments();
    if (count === 0) {
      const data = await fs.readFile('user.json', 'utf-8');
      const usersArray = JSON.parse(data);
      for (let user of usersArray) {
        if (user.imagePath) {
          try {
            const imageBuffer = await fs.readFile(path.resolve(user.imagePath));
            user.image = imageBuffer;
            delete user.imagePath;
          } catch (err) {
            console.error(`Failed to read image for user ${user.username}:`, err);
          }
        }
      }
      const result = await users.insertMany(usersArray);
      console.log(`Added ${result.insertedCount} users`);
    }
  } catch (err) {
    console.error('Unable to initialize the database!', err);
  }
}
init_db().catch(console.dir);

async function validate_user(userid, password) {
  if (!userid || !password) return false;
  try {
    const user = await users.findOne({ userid, password });
    if (user) {
      return user;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Unable to fetch from database!', error);
    return false;
  }
}

async function create_user(userid, nickname, password, email, gender, birthdate, profileimage) {
  try {
    const image = 'profile/profile_image1.jpg';
    const enabled = true;

    const result = await users.updateOne(
      { userid },
      {
        $set: {
          userid: userid,
          nickname: nickname,
          email: email,
          password: password,
          gender: gender,
          birthdate: birthdate,
          role: 'user',
          enabled: true,
          profileimage: profileimage || image,
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      console.log('Added 1 user');
    } else {
      console.log('Updated existing user');
    }
    return true;
  } catch (error) {
    console.error('Unable to update the database!', error);
    return false;
  }
}

async function fetch_user(userid) {
  try {
    const user = await users.findOne({ userid });
    console.log('Fetched user:', user);
    if (user) {
      return user;
    }
    return null;
  } catch (error) {
    console.error('Unable to fetch from database!', error);
    return false;
  }
}

async function fetch_all_users() {
  try {
    const user = await users.find().toArray();
    return user;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}

async function username_exist(userid) {
  try {
    const user = await fetch_user(userid);
    console.log(`Does username "${userid}" exist?`, user !== null);
    if (user) return true;
    else return false;
  } catch (error) {
    console.error('Unable to fetch from database!', error);
    return false;
  }
}

async function modify_user(currentUsername, updates) {
  try {
    const currentUser = await fetch_user(currentUsername);
    if (!currentUser) {
      console.error('User not found');
      return false;
    }
    const newUpdates = {};
    newUpdates.nickname = updates.nickname || currentUser.nickname;
    newUpdates.email = updates.email || currentUser.email;
    newUpdates.password = updates.password || currentUser.password;
    newUpdates.profileimage = updates.profileimage || currentUser.profileimage;

    if (
      JSON.stringify(newUpdates) ===
      JSON.stringify({
        nickname: currentUser.nickname,
        email: currentUser.email,
        password: currentUser.password,
        profileimage: currentUser.profileimage,
      })
    ) {
      console.log('No updates to apply');
      return true;
    }

    const result = await users.updateOne(
      { userid: currentUsername },
      {
        $set: newUpdates,
      },
      { upsert: false }
    );

    if (result.modifiedCount > 0) {
      console.log('Updated existing user');
      return true;
    } else {
      console.log('No changes were made');
      return true;
    }
  } catch (error) {
    console.error('Unable to modify the user data!', error);
    return false;
  }
}

// modify_user('root', {
//   username: 'newUsername',
//   email: 'newemail@example.com',
// });

//update_user('23019876D', '23019876D', 'root@gmail.com').then((res) => console.log(res));

export { validate_user, create_user, fetch_user, username_exist, modify_user, fetch_all_users };
