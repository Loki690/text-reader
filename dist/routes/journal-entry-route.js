"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalEntryRouter = void 0;
const multer_1 = __importDefault(require("multer"));
const express_1 = require("express");
const journalEntry_controller_1 = require("../controller/journalEntry.controller");
const itemUom_controller_1 = require("../controller/itemUom.controller");
const storage = multer_1.default.memoryStorage();
const file = (0, multer_1.default)({ storage });
exports.journalEntryRouter = (0, express_1.Router)();
exports.journalEntryRouter.post("/upload", file.single("file"), journalEntry_controller_1.uploadFile);
exports.journalEntryRouter.post("/process", journalEntry_controller_1.processJournalEntry);
exports.journalEntryRouter.post("/upload-item-uoms", file.single("file"), itemUom_controller_1.uploadFileItemUoms);
exports.journalEntryRouter.post("/process-item-uoms", itemUom_controller_1.processItemUom);
