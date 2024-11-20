import express from 'express';
import multer from 'multer';

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

export default router;
