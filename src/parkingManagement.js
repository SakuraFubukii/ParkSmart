// parkingManagement.js
import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

router.post('/updateParkingPrice', async (req, res) => {
  const { parkId, newHalfDayPrice, newFullDayPrice } = req.body;

  try {
    const filePath = path.join(__dirname, 'data', 'ParkingSpaces.json');
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    const parkingSpot = jsonData.find((spot) => spot.parkid === parkId);
    if (parkingSpot) {
      if (newHalfDayPrice !== undefined) {
        parkingSpot.halfday_price = newHalfDayPrice;
      }
      if (newFullDayPrice !== undefined) {
        parkingSpot.fullday_price = newFullDayPrice;
      }

      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
      res.status(200).json({ message: 'Update Success' });
    } else {
      res.status(404).json({ message: 'Parking spot not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
