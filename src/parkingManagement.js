// parkingManagement.js
import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Define the POST route for managing parking data
router.post('/', async (req, res) => {
  const { parkId, newHalfDayPrice, newFullDayPrice, reservationData, op_status } = req.body;

  const filePath1 = path.join(__dirname, '../static/data/ParkingSpaces.json');
  const filePath2 = path.join(__dirname, '../static/data/Reservations.json');

  try {
    // Read the parking spaces data
    const data = await fs.readFile(filePath1, 'utf8');
    const jsonData = JSON.parse(data);

    // Find the parking spot by its ID
    const parkingSpot = jsonData.find((spot) => spot.parkid == parkId);
    if (parkingSpot) {
      // Update half-day price if provided
      if (newHalfDayPrice !== undefined) {
        parkingSpot.halfday_price = newHalfDayPrice;
      }
      // Update full-day price if provided
      if (newFullDayPrice !== undefined) {
        parkingSpot.fullday_price = newFullDayPrice;
      }

      await fs.writeFile(filePath1, JSON.stringify(jsonData, null, 2));
    } else {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    // Handle reservation records based on op_status
    if (op_status === 1) {
      // When op_status is 1, add a reservation record
      const reservationDataFile = await fs.readFile(filePath2, 'utf8');
      let reservations = [];
      if (reservationDataFile) {
        reservations = JSON.parse(reservationDataFile);
      }

      // Calculate the next ID for the reservation
      const maxId = reservations.reduce((max, reservation) => {
        const idNum = parseInt(reservation.id.split('_')[1], 10);
        return Math.max(max, idNum);
      }, 0);

      // Assign a new ID to the reservation data
      reservationData.id = `res_${maxId + 1}`;
      reservations.push(reservationData);

      // Write the updated reservations back to the file
      await fs.writeFile(filePath2, JSON.stringify(reservations, null, 2));
      return res.status(200).json({ message: 'Update Success' });
    } else if (op_status === 0) {
      // When op_status is 0, delete the corresponding reservation record
      const reservationDataFile = await fs.readFile(filePath2, 'utf8');
      if (reservationDataFile) {
        let reservations = JSON.parse(reservationDataFile);

        // Filter out the reservation that needs to be deleted
        reservations = reservations.filter((res) => !(res.parkId === parkId && res.date === reservationData.date));

        // Write the updated reservations back to the file
        await fs.writeFile(filePath2, JSON.stringify(reservations, null, 2));
        return res.status(200).json({ message: 'Update Success' });
      } else {
        // Return error if no reservations are found
        return res.status(404).json({ message: 'No reservations found' });
      }
    } else {
      // Return error for invalid operation status
      return res.status(400).json({ message: 'Invalid operation status' });
    }
  } catch (error) {
    // Log the error and return a server error response
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Export the router for use in other parts of the application
export default router;
