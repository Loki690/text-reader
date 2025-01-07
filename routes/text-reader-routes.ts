import { Router } from "express";
import multer from "multer";
import {
  createEsales,
  createEsalesERP,
  getEsales,
  getEsalesErp,
  processTextFile,
  processTextFileERP,
} from "../controller/testReader.controller";
import { exportEsales } from "../controller/export.controller";

const storage = multer.memoryStorage();
const upload1 = multer({ storage });
const upload2 = multer({ storage });
export const textReaderRouter = Router();

textReaderRouter.post("/text-read", upload1.single("file"), processTextFile);
textReaderRouter.post(
  "/text-read-erp",
  upload2.single("file"),
  processTextFileERP
);
textReaderRouter.post("/create", createEsales);
textReaderRouter.post("/createErp", createEsalesERP);
textReaderRouter.get("/get-all", getEsales);
textReaderRouter.get("/get-all-erp", getEsalesErp);
textReaderRouter.get("/export", exportEsales);
