import express from 'express';
import { getCurrentTime, getTimeLeft } from '../controllers/timeController/timeController';

const timeRoute = express.Router();

// Rutas
timeRoute.get('/current-time', getCurrentTime);
timeRoute.post('/time-left', getTimeLeft);

export default timeRoute;
