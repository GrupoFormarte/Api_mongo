import express from 'express';
import multer from 'multer';
import { uploadFile, uploadFileExcel } from '../controllers/qualifier/qualifierController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); 

router.post('/upload', upload.single('file'), uploadFile);
router.post('/excel', upload.single('file'), uploadFileExcel);

export default router;