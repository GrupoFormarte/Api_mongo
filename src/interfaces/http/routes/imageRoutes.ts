import express from 'express';
import { uploadImage, uploadMultipleImages } from '../controllers/image/imageController';

const router = express.Router();

// Routes for uploading images
router.post('/upload', uploadImage);
router.post('/upload-multiple', uploadMultipleImages);

export default router;