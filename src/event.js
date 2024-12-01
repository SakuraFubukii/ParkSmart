import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const DATA_FILE = path.join(__dirname, '../static/data/Events.json');

// Get all events
router.get('/data/events.json', async (req, res) => {
  // Use async/await for better readability
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8'); // Read file using promises
    res.json(JSON.parse(data)); // Parse and send JSON response
  } catch (err) {
    return res.status(500).send('Error reading events file'); // Error handling
  }
});

// Update events.json with the new events data
router.put('/manage', async (req, res) => {
  // Change method to PUT
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2)); // Write updated events to file
    res.send('Events saved successfully'); // Success response
  } catch (err) {
    return res.status(500).send('Error saving events file'); // Error handling
  }
});

export default router;
