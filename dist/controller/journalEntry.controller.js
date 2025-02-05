"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processJournalEntry = exports.uploadFile = void 0;
const XLSX = __importStar(require("xlsx"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure the uploads directory exists
        const uploadsDir = path.join(__dirname, '..', 'uploads'); //D:\JS\text-reader\uploads
        console.log(uploadsDir);
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        // Check if a file is uploaded
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        // Define the path to save the uploaded file with a new name
        const filePath = path.join(uploadsDir, 'journal_entry.xlsx');
        // Write the file to the uploads directory
        fs.writeFileSync(filePath, req.file.buffer);
        // Respond with success message
        res.status(200).json({ message: 'File uploaded successfully', filePath });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ message: "An error occurred while uploading the file", error: errorMessage });
    }
});
exports.uploadFile = uploadFile;
const processJournalEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Define the path to the uploaded file
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const filePath = path.join(uploadsDir, 'journal_entry.xlsx');
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: 'File not found. Please upload the file first.' });
            return;
        }
        // Read the uploaded file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Convert sheet data to JSON
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Process the raw data
        const processedData = [];
        const headers = [
            "Entry Type",
            "Company",
            "Posting Date",
            "Account (Accounting Entries)",
            "Party Type (Accounting Entries)",
            "Party (Accounting Entries)",
            "Debit (Accounting Entries)",
            "Credit (Accounting Entries)",
            "Remark",
            "Reference Number",
            "Reference Date"
        ];
        // Add headers to the processed data
        processedData.push(headers);
        // Process each row of the raw data
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            // Extract values from the raw data
            const postingDateSerial = row[0]; // Excel serial date
            const accountDebit = row[1];
            const accountCredit = row[2];
            const customer = row[3];
            const customerName = row[4];
            const debit = row[5];
            const credit = row[6];
            const remarks = row[7];
            const referenceNumber = row[8];
            // Convert Excel serial date to JavaScript Date object
            const postingDate = XLSX.SSF.format('yyyy-mm-dd', postingDateSerial);
            // Create journal entry rows
            const journalEntry1 = [
                "Journal Entry",
                "Amesco Drug Corporation",
                postingDate,
                accountDebit,
                "Customer",
                customer,
                debit,
                0,
                remarks,
                referenceNumber,
                postingDate
            ];
            const journalEntry2 = [
                "",
                "",
                "",
                accountCredit,
                "",
                "",
                0,
                credit,
                "",
                "",
                ""
            ];
            // Add the processed rows to the result
            processedData.push(journalEntry1);
            processedData.push(journalEntry2);
        }
        // Create a new workbook and worksheet
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.aoa_to_sheet(processedData);
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");
        // Write the workbook to a file
        const outputFilePath = path.join(__dirname, 'processed_journal_entries.xlsx');
        XLSX.writeFile(newWorkbook, outputFilePath);
        // Send the file as a response
        res.download(outputFilePath, 'processed_journal_entries.xlsx', (err) => {
            if (err) {
                res.status(500).json({ message: "An error occurred while downloading the file", error: err.message });
            }
            else {
                // Delete the processed file after sending it
                fs.unlinkSync(outputFilePath);
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ message: "An error occurred", error: errorMessage });
    }
});
exports.processJournalEntry = processJournalEntry;
