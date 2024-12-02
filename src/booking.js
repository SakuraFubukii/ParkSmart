import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const form = multer();

router.post('/', form.none(), async (req, res) => {
  const { date, parkId } = req.body;
  console.log(req.body);
  return res.json({
    status: 'success',
    date: date,
    parkId: parkId,
  });
});

const reservationsPath = path.join(__dirname, '../static/data/Reservations.json');

// POST endpoint to add a new reservation
router.post('/data/Reservations.json', form.none(), async (req, res) => {
  try {
    const { user_id, parkId, date, duration, booktime, payment_status, comment } = req.body;
    console.log('Received reservation data:', req.body); // Log the incoming reservation data

    // Check if required fields are present
    if (!user_id || !parkId || !date || !duration) {
      return res.status(400).send('Invalid reservation data');
    }

    // Read current reservations
    const data = await fs.readFile(reservationsPath, 'utf8');
    const reservations = JSON.parse(data);

    // Determine the next reservation ID
    const lastId = reservations.length > 0 ? reservations[reservations.length - 1]._id : null;
    const newId = lastId ? `res_${parseInt(lastId.split('_')[1]) + 1}` : 'res_1'; // Increment the ID
    console.log('New reservation ID:', newId); // Log the new reservation ID

    // Create the new reservation object
    const newReservation = {
      _id: newId,
      user_id,
      parkId,
      date,
      duration,
      booktime,
      payment_status,
      comment,
    };

    // Add the new reservation to the existing array
    reservations.push(newReservation);

    // Write the updated reservations back to the file
    await fs.writeFile(reservationsPath, JSON.stringify(reservations, null, 2));
    console.log('Reservation successfully added:', newReservation); // Log successful addition

    return res.status(201).json(newReservation); // Send back the newly created reservation
  } catch (error) {
    console.error('Error processing reservation:', error);
    return res.status(500).send('Error processing reservation');
  }
});

// GET endpoint to retrieve all reservations
router.get('/data/Reservations.json', async (req, res) => {
  try {
    const data = await fs.readFile(reservationsPath, 'utf8');
    const reservations = JSON.parse(data);
    console.log('Retrieved reservations:', reservations); // Log retrieved reservations
    res.json(reservations);
  } catch (err) {
    console.error('Error reading reservations file:', err);
    return res.status(500).send('Error reading reservations file');
  }
});

export default router;
