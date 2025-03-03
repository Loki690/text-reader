import multer from "multer";
import { Router } from "express";
import {
  processJournalEntry,
  uploadFile,
} from "../controller/journalEntry.controller";
import {
  processItemUom,
  uploadFileItemUoms,
} from "../controller/itemUom.controller";
const storage = multer.memoryStorage();
const file = multer({ storage });

export const journalEntryRouter = Router();
journalEntryRouter.post("/upload", file.single("file"), uploadFile);
journalEntryRouter.post("/process", processJournalEntry);
journalEntryRouter.post(
  "/upload-item-uoms",
  file.single("file"),
  uploadFileItemUoms
);
journalEntryRouter.post("/process-item-uoms", processItemUom);
