"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const fileSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const File = (0, mongoose_1.model)('File', fileSchema);
exports.default = File;
