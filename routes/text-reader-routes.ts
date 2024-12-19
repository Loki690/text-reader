import { Router } from 'express';
import multer from 'multer';
import { processTextFile } from '../controller/testReader.controller';

const storage = multer.memoryStorage();
const upload = multer({ storage });
export const textReaderRouter = Router();

textReaderRouter.post('/text-read', upload.single('file'), processTextFile);
textReaderRouter.post('/text-read-erp', upload.single('file'), processTextFile);