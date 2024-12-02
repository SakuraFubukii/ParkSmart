import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './config.js';
const connect_uri = config.CONNECTION_STR;
const client = new MongoClient(connect_uri, {
  connectTimeoutMS: 2000,
  serverSelectionTimeoutMS: 2000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function connect() {
  try {
    await client.connect();
    await client.db('polyupark').command({ ping: 1 });
    const currentTime = new Date();
    console.log(currentTime.toLocaleString());
    console.log('Successfully connected to the database!');
  } catch (err) {
    console.error('Unable to establish connection to the database!', err);
    process.exit(1);
  }
}
connect().catch(console.dir);
export default client;
