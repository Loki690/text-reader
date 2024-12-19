import { Router } from 'express';
import multer from 'multer';
import { processTextFile, processTextFileERP } from '../controller/testReader.controller';

const storage = multer.memoryStorage();
const upload1 = multer({ storage });
const upload2 = multer({ storage });
export const textReaderRouter = Router();

textReaderRouter.post('/text-read', upload1.single('file'), processTextFile);
textReaderRouter.post('/text-read-erp', upload2.single('file'), processTextFileERP);