import express from 'express';
import session from 'express-session';
import path from 'path';
import booking from './booking.js';
import parkingManagement from './parkingManagement.js';
import events from './event.js';
import login from './login.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: 'polyu-park',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

app.use(express.static('static'));
app.use('/book', booking);
app.use('/manage', parkingManagement);
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/event', events);
app.use('/auth', login);

app.get('/booking', (req, res) => {
  res.sendFile(path.join(__dirname, 'booking.html'));
});

app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, 'payment.html'));
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server started at http://127.0.0.1:${PORT}`);
});
