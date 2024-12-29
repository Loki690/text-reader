"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.textReaderRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const testReader_controller_1 = require("../controller/testReader.controller");
const export_controller_1 = require("../controller/export.controller");
const storage = multer_1.default.memoryStorage();
const upload1 = (0, multer_1.default)({ storage });
const upload2 = (0, multer_1.default)({ storage });
exports.textReaderRouter = (0, express_1.Router)();
exports.textReaderRouter.post('/text-read', upload1.single('file'), testReader_controller_1.processTextFile);
exports.textReaderRouter.post('/text-read-erp', upload2.single('file'), testReader_controller_1.processTextFileERP);
exports.textReaderRouter.post('/create', testReader_controller_1.createEsales);
exports.textReaderRouter.get('/get-all', testReader_controller_1.getEsales);
exports.textReaderRouter.get('/export', export_controller_1.exportEsales);
