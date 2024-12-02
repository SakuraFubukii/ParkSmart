import fs from 'fs/promises';
import chokidar from 'chokidar';
import client from './dbclient.js';

export async function init_db() {
  try {
    await client.connect();
    const db = client.db('polyupark');

    await initUsers(db);
    await initReservations(db);
    await initParkingSpaces(db);
    await initEvents(db);
    setupFileWatchers(db);
  } catch (err) {
    console.error('Unable to initialize the database!', err);
  } finally {
    // await client.close();
  }
}

async function initUsers(db) {
  const users = db.collection('users');
  const userCount = await users.countDocuments();
  if (userCount === 0) {
    const data = await fs.readFile('../Polyu-Park/static/data/Users.json', 'utf8');
    const userProfiles = JSON.parse(data);
    const result = await users.insertMany(userProfiles);
    console.log(`Added ${result.insertedCount} users`);
  } else {
    console.log('Users collection already initialized');
  }
}

async function initReservations(db) {
  const reservations = db.collection('reservations');
  const reservationCount = await reservations.countDocuments();
  if (reservationCount === 0) {
    const data = await fs.readFile('../Polyu-Park/static/data/Reservations.json', 'utf8');
    const reservationData = JSON.parse(data);
    const result = await reservations.insertMany(reservationData);
    console.log(`Added ${result.insertedCount} reservations`);
  } else {
    console.log('Reservations collection already initialized');
  }
}

async function initParkingSpaces(db) {
  const parkingSpaces = db.collection('parkingspace');
  const parkingCount = await parkingSpaces.countDocuments();
  if (parkingCount === 0) {
    const data = await fs.readFile('../Polyu-Park/static/data/ParkingSpaces.json', 'utf8');
    const parkingData = JSON.parse(data);
    const result = await parkingSpaces.insertMany(parkingData);
    console.log(`Added ${result.insertedCount} parking spaces`);
  } else {
    console.log('Parking spaces collection already initialized');
  }
}

async function initEvents(db) {
  const events = db.collection('events');
  const eventCount = await events.countDocuments();
  if (eventCount === 0) {
    const data = await fs.readFile('../Polyu-Park/static/data/Events.json', 'utf8');
    const eventData = JSON.parse(data);
    const result = await events.insertMany(eventData);
    console.log(`Added ${result.insertedCount} events`);
  } else {
    console.log('Events collection already initialized');
  }
}

function setupFileWatchers(db) {
  const watcher = chokidar.watch('../Polyu-Park/static/data', { persistent: true });

  watcher.on('change', async (path) => {
    console.log(`File ${path} has been updated`);

    if (path.includes('Users.json')) {
      const data = await fs.readFile(path, 'utf8');
      const userProfiles = JSON.parse(data);
      const users = db.collection('users');
      await users.deleteMany({});
      const result = await users.insertMany(userProfiles);
      console.log(`Updated ${result.insertedCount} users`);
    } else if (path.includes('Reservations.json')) {
      const data = await fs.readFile(path, 'utf8');
      const reservationData = JSON.parse(data);
      const reservations = db.collection('reservations');
      await reservations.deleteMany({});
      const result = await reservations.insertMany(reservationData);
      console.log(`Updated ${result.insertedCount} reservations`);
    } else if (path.includes('ParkingSpaces.json')) {
      const data = await fs.readFile(path, 'utf8');
      const parkingData = JSON.parse(data);
      const parkingSpaces = db.collection('parkingspace');
      await parkingSpaces.deleteMany({});
      const result = await parkingSpaces.insertMany(parkingData);
      console.log(`Updated ${result.insertedCount} parking spaces`);
    } else if (path.includes('Events.json')) {
      const data = await fs.readFile(path, 'utf8');
      const eventData = JSON.parse(data);
      const events = db.collection('events');
      await events.deleteMany({});
      const result = await events.insertMany(eventData);
      console.log(`Updated ${result.insertedCount} events`);
    }
  });
}

init_db().catch(console.dir);
