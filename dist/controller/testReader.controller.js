"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTextFileV3 = exports.deleteTransactions = exports.processTextFileV2 = exports.getEsalesErp = exports.getEsales = exports.createEsalesERP = exports.createEsales = exports.processTextFileERP = exports.processTextFile = void 0;
const esales_model_1 = __importDefault(require("../model/esales.model"));
const esales_erp_model_1 = __importDefault(require("../model/esales-erp.model"));
const esales_trans_model_1 = require("../model/esales_trans.model");
const processTextFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        console.error("No file uploaded");
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    try {
        const fileContent = req.file.buffer.toString("utf8");
        const lines = fileContent.split("\n");
        console.log("File:", req.file.originalname);
        let vatable = 0;
        let vatExempt = 0;
        let zeroRated = 0;
        let government = 0;
        let vat12 = 0;
        let dateFrom = "";
        let dateTo = "";
        let currentInvoiceDate = "";
        const transactionSet = new Set();
        const duplicateINVSet = new Set();
        const transactionMap = new Map();
        let branchName = null;
        let min = null;
        const negativeValues = [];
        lines.forEach((line) => {
            // Extract the Branch name
            if (line.includes("Branch:")) {
                const match = line.match(/Branch:\s*(\S+)/i);
                if (match && match[1]) {
                    branchName = match[1];
                }
            }
            // Extract the Date
            if (line.includes("Date:")) {
                const match = line.match(/Date:\s*(\S+)/i);
                if (match && match[1]) {
                    currentInvoiceDate = match[1]; // Temporarily store the extracted date
                }
            }
            // Extract the MIN
            if (line.includes("MIN:")) {
                const match = line.match(/MIN:\s*(\S+)/i);
                if (match && match[1]) {
                    min = match[1];
                }
            }
            // Extract and process INV# values
            if (line.includes("INV#")) {
                const match = line.match(/INV#\s*[:\-]?\s*(\S+)/i);
                if (match && match[1]) {
                    const invoice = match[1];
                    // Add all invoices (including duplicates) to the transactionSet
                    transactionSet.add(invoice);
                    // Record duplicate invoices if they are already in the transactionMap
                    if (transactionMap.has(invoice)) {
                        duplicateINVSet.add(invoice);
                    }
                    // Update the map to track occurrences
                    transactionMap.set(invoice, (transactionMap.get(invoice) || 0) + 1);
                    // Update date range
                    if (!dateFrom || new Date(currentInvoiceDate) < new Date(dateFrom)) {
                        dateFrom = currentInvoiceDate;
                    }
                    if (!dateTo || new Date(currentInvoiceDate) > new Date(dateTo)) {
                        dateTo = currentInvoiceDate;
                    }
                }
            }
            // Extract monetary values
            const parts = line.trim().split(/\s+/);
            const value = parseFloat(parts[parts.length - 1]);
            if (!isNaN(value) && value < 0) {
                negativeValues.push(value); // Track negative values
            }
            if (line.includes("VATable")) {
                if (!isNaN(value))
                    vatable += value;
            }
            else if (line.includes("VAT Exempt")) {
                if (!isNaN(value))
                    vatExempt += value;
            }
            else if (line.includes("Zero Rated")) {
                if (!isNaN(value))
                    zeroRated += value;
            }
            else if (line.includes("Government")) {
                if (!isNaN(value))
                    government += value;
            }
            else if (line.includes("VAT 12%")) {
                if (!isNaN(value))
                    vat12 += value;
            }
        });
        // Calculate the total sum of negative values
        const negativeSum = negativeValues
            .reduce((sum, value) => sum + value, 0)
            .toFixed(2);
        // Prepare the response
        const response = {
            date: dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : "N/A",
            branch: branchName || "N/A",
            min: min || "N/A",
            transactions: transactionSet.size,
            beginningInvoice: Array.from(transactionSet).sort()[0] || null,
            lastInvoice: Array.from(transactionSet).sort().slice(-1)[0] || null,
            duplicateInvoices: Array.from(duplicateINVSet), // List of duplicates
            duplicateCount: duplicateINVSet.size, // Number of duplicates
            vatable: vatable.toFixed(2),
            vatExempt: vatExempt.toFixed(2),
            zeroRated: zeroRated.toFixed(2),
            government: government.toFixed(2),
            vat12: vat12.toFixed(2),
            total: (vatable + vatExempt + zeroRated + government + vat12).toFixed(2),
            negativeCount: negativeValues.length, // Count of negative values
            negativeTotal: negativeSum, // Sum of negative values
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.processTextFile = processTextFile;
const processTextFileERP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Request file:", req.file);
    if (!req.file) {
        console.error("No file uploaded");
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    try {
        const fileContent = req.file.buffer.toString("utf8");
        const lines = fileContent.split(/\r?\n/); // Handle both \n and \r\n line breaks
        // Initialize variables
        let branchName = "";
        let posProfile = "";
        let min = "";
        let posInvoiceCount = 0;
        let vatable = 0;
        let vatExempt = 0;
        let zeroRated = 0;
        let government = 0;
        let vat12 = 0;
        let dateFrom = ""; // Date of the first POS Invoice
        let dateTo = ""; // Date of the last POS Invoice
        let currentInvoiceDate = ""; // Temporary holder for the current invoice's date
        // Additional tracking variables
        const transactionSet = new Set(); // Unique INV# values
        const duplicateINVSet = new Set(); // Duplicates tracking
        const negativeValues = []; // Store negative monetary values
        // Process each line
        lines.forEach((line) => {
            const trimmedLine = line.trim(); // Trim whitespace for clean matching
            // Extract Branch Name
            if (trimmedLine.includes("Branch:")) {
                branchName = trimmedLine.replace("Branch:", "").trim();
            }
            // Extract POS Profile
            if (trimmedLine.includes("POS Profile:")) {
                posProfile = trimmedLine.replace("POS Profile:", "").trim();
            }
            if (trimmedLine.includes("MIN:")) {
                min = trimmedLine.replace("MIN:", "").trim();
            }
            // Extract Date
            if (trimmedLine.includes("Date:")) {
                const match = trimmedLine.match(/Date:\s*(\d{4}-\d{2}-\d{2})/i); // Look for "Date: YYYY-MM-DD"
                if (match && match[1]) {
                    currentInvoiceDate = match[1]; // Temporarily store the extracted date
                }
            }
            // Extract and store unique INV# values
            // Count POS Invoice occurrences and track dates
            if (trimmedLine.includes("POS Invoice:")) {
                posInvoiceCount += 1;
                // Extract invoice number
                const match = trimmedLine.match(/POS Invoice\s*[:\-]?\s*(\S+)/i); // Extract invoice number
                if (match && match[1]) {
                    const invoice = match[1]; // Invoice number
                    if (transactionSet.has(invoice)) {
                        duplicateINVSet.add(invoice); // Record duplicate invoice
                    }
                    else {
                        transactionSet.add(invoice); // Add to the unique set
                        // Update dateFrom and dateTo
                        if (!dateFrom ||
                            new Date(currentInvoiceDate) < new Date(dateFrom)) {
                            dateFrom = currentInvoiceDate;
                        }
                        if (!dateTo || new Date(currentInvoiceDate) > new Date(dateTo)) {
                            dateTo = currentInvoiceDate;
                        }
                    }
                }
            }
            // Extract monetary values
            const parts = trimmedLine.split(/\s+/);
            const value = parseFloat(parts[parts.length - 1]);
            if (!isNaN(value) && value < 0) {
                negativeValues.push(value); // Track negative values
            }
            // Extract and sum Sales Summary Values
            if (line.includes("VAtable:")) {
                if (!isNaN(value))
                    vatable += value;
            }
            else if (line.includes("Vat Exempt:")) {
                if (!isNaN(value))
                    vatExempt += value;
            }
            else if (line.includes("Zero Rated:")) {
                if (!isNaN(value))
                    zeroRated += value;
            }
            else if (line.includes("Government:")) {
                if (!isNaN(value))
                    government += value;
            }
            else if (line.includes("VAT 12%:")) {
                if (!isNaN(value))
                    vat12 += value;
            }
        });
        const findMissingInvoicesERP = (invoices) => {
            const missing = [];
            const prefix = invoices[0].slice(0, invoices[0].lastIndexOf("-") + 1);
            const numericInvoices = invoices.map((inv) => parseInt(inv.split("-").pop(), 10));
            numericInvoices.sort((a, b) => a - b);
            for (let i = 1; i < numericInvoices.length; i++) {
                const prev = numericInvoices[i - 1];
                const curr = numericInvoices[i];
                for (let j = prev + 1; j < curr; j++) {
                    missing.push(prefix + j.toString().padStart(8, "0"));
                }
            }
            return missing;
        };
        // Convert the Set to an array and sort it
        const sortedInvoices = Array.from(transactionSet).sort();
        const missingInvoices = findMissingInvoicesERP(sortedInvoices);
        // Calculate the total sum
        const grandTotal = vatable + vatExempt + zeroRated + government + vat12;
        const netTotal = vatable + vatExempt + zeroRated + government;
        // Calculate the total sum of negative values
        const negativeSum = negativeValues
            .reduce((sum, value) => sum + value, 0)
            .toFixed(2);
        // Prepare the response
        const response = {
            date: dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : "N/A",
            branchName: branchName || "N/A",
            posProfile: posProfile || "N/A",
            min: min || "N/A",
            posInvoiceCount,
            transactions: transactionSet.size,
            beginningInvoice: sortedInvoices[0] || null,
            lastInvoice: sortedInvoices[sortedInvoices.length - 1] || null,
            duplicateInvoices: Array.from(duplicateINVSet), // List of duplicates
            duplicateCount: duplicateINVSet.size, // Number of duplicates
            vatable: vatable.toFixed(2),
            vatExempt: vatExempt.toFixed(2),
            zeroRated: zeroRated.toFixed(2),
            government: government.toFixed(2),
            vat12: vat12.toFixed(2),
            netTotal: netTotal.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
            negativeCount: negativeValues.length,
            negativeTotal: negativeSum,
            missingInvoices,
            missingInvoiceCount: missingInvoices.length,
        };
        // Send the response
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.processTextFileERP = processTextFileERP;
const createEsales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let esalesData = req.body;
        console.log("Request body:", esalesData);
        const esalesDataDate = esalesData.tableRows[0].textValue;
        const esalesDataBranch = esalesData.tableRows[1].textValue;
        const esalesDataMin = esalesData.tableRows[2].textValue;
        esalesData.branch = esalesDataBranch;
        esalesData.date = esalesDataDate;
        esalesData.min = esalesDataMin;
        // Check for duplicate branch and date
        const existingEsales = yield esales_model_1.default.findOne({
            branch: esalesDataBranch,
            date: esalesDataDate,
            min: esalesDataMin,
        });
        if (existingEsales) {
            res.status(400).json({
                success: false,
                message: "Duplicate entry: eSales data for this branch and date already exists",
            });
            return;
        }
        const newEsales = new esales_model_1.default(esalesData);
        // const newTransactions = new TransactionsModel()
        yield newEsales.save();
        res.status(200).json({
            success: true,
            data: newEsales,
            message: "eSales data saved successfully",
        });
    }
    catch (error) {
        console.error("Error saving esales data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.createEsales = createEsales;
const createEsalesERP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let esalesData = req.body;
        const esalesDataDate = esalesData.tableRows[0].textValue;
        const esalesDataBranch = esalesData.tableRows[1].textValue;
        const esalesDataPOSProfile = esalesData.tableRows[2].textValue;
        const esalesDataMin = esalesData.tableRows[3].textValue;
        esalesData.branch = esalesDataBranch;
        esalesData.date = esalesDataDate;
        esalesData.posProfile = esalesDataPOSProfile;
        esalesData.min = esalesDataMin;
        // Check for duplicate branch and date
        const existingEsales = yield esales_erp_model_1.default.findOne({
            branch: esalesDataBranch,
            date: esalesDataDate,
            min: esalesDataMin,
        });
        if (existingEsales) {
            res.status(400).json({
                success: false,
                message: "Duplicate entry: eSales data for this branch and date already exists",
            });
            return;
        }
        const newEsales = new esales_erp_model_1.default(esalesData);
        yield newEsales.save();
        res.status(200).json({
            success: true,
            data: newEsales,
            message: "eSales data saved successfully",
        });
    }
    catch (error) {
        console.error("Error saving esales data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.createEsalesERP = createEsalesERP;
const getEsales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const esalesData = yield esales_model_1.default.find();
        res.status(200).json({
            success: true,
            data: esalesData,
        });
    }
    catch (error) {
        console.error("Error fetching esales data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getEsales = getEsales;
const getEsalesErp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const esalesData = yield esales_erp_model_1.default.find();
        res.status(200).json({
            success: true,
            data: esalesData,
        });
    }
    catch (error) {
        console.error("Error fetching esales data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getEsalesErp = getEsalesErp;
const processTextFileV2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        console.error("No file uploaded");
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    try {
        const fileContent = req.file.buffer.toString("utf8");
        const lines = fileContent.split("\n");
        let vatable = 0;
        let vatExempt = 0;
        let zeroRated = 0;
        let government = 0;
        let vat12 = 0;
        let dateFrom = "";
        let dateTo = "";
        let currentInvoiceDate = "";
        let currentInvoice = "";
        let branchName = null;
        let min = "";
        const transactionSet = new Set();
        const duplicateINVSet = new Set();
        const transactionMap = new Map();
        const negativeValues = [];
        const duplicateValues = new Map(); // Track duplicate invoice values
        const transactionsData = [];
        let currentTransaction = null;
        // Helper function to format date from "02/01/2024" to "Feb 2024"
        const formatDate = (dateString) => {
            const [month, day, year] = dateString.split("/");
            const date = new Date(`${year}-${month}-${day}`);
            const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            const monthName = monthNames[date.getMonth()];
            return `${monthName} ${year}`;
        };
        lines.forEach((line) => {
            // Extract the Branch name
            if (line.includes("Branch:")) {
                const match = line.match(/Branch:\s*(\S+)/i);
                if (match && match[1]) {
                    branchName = match[1];
                }
            }
            if (line.includes("Date:")) {
                const match = line.match(/Date:\s*(\S+)/i);
                if (match && match[1]) {
                    currentInvoiceDate = match[1]; // Temporarily store the extracted date
                }
            }
            if (line.includes("MIN:")) {
                const match = line.match(/MIN:\s*(\S+)/i);
                if (match && match[1]) {
                    min = match[1]; // Temporarily store the extracted date
                }
            }
            // Extract and store unique INV# values
            if (line.includes("INV#")) {
                const match = line.match(/INV#\s*[:\-]?\s*(\S+)/i);
                if (match && match[1]) {
                    const invoice = match[1];
                    if (transactionSet.has(invoice)) {
                        duplicateINVSet.add(invoice); // Record duplicate invoice
                    }
                    else {
                        transactionSet.add(invoice); // Add to the unique set
                    }
                    if (!dateFrom || new Date(currentInvoiceDate) < new Date(dateFrom)) {
                        dateFrom = currentInvoiceDate;
                    }
                    if (!dateTo || new Date(currentInvoiceDate) > new Date(dateTo)) {
                        dateTo = currentInvoiceDate;
                    }
                    transactionMap.set(invoice, (transactionMap.get(invoice) || 0) + 1);
                    const formattedDate = formatDate(currentInvoiceDate);
                    currentTransaction = {
                        branch: branchName,
                        min: min,
                        INV: invoice,
                        date: formattedDate,
                        VATable: 0,
                        VatExempt: 0,
                        ZeroRated: 0,
                        Government: 0,
                        Vat12: 0,
                    };
                    transactionsData.push(currentTransaction);
                }
            }
            // Extract monetary values and remove commas
            const parts = line.trim().split(/\s+/);
            const valueString = parts[parts.length - 1].replace(/,/g, "");
            const value = parseFloat(valueString);
            if (!isNaN(value) && value < 0) {
                negativeValues.push(value); // Track negative values
            }
            if (line.includes("VATable")) {
                if (!isNaN(value)) {
                    vatable += value;
                    if (currentTransaction)
                        currentTransaction["VATable"] += value;
                }
            }
            else if (line.includes("VAT Exempt")) {
                if (!isNaN(value)) {
                    vatExempt += value;
                    if (currentTransaction)
                        currentTransaction["VatExempt"] += value;
                }
            }
            else if (line.includes("Zero Rated")) {
                if (!isNaN(value)) {
                    zeroRated += value;
                    if (currentTransaction)
                        currentTransaction["ZeroRated"] += value;
                }
            }
            else if (line.includes("Government")) {
                if (!isNaN(value)) {
                    government += value;
                    if (currentTransaction)
                        currentTransaction["Government"] += value;
                }
            }
            else if (line.includes("VAT 12%")) {
                if (!isNaN(value)) {
                    vat12 += value;
                    if (currentTransaction)
                        currentTransaction["Vat12"] += value;
                }
            }
            // Track duplicate invoice values
            if (currentTransaction && duplicateINVSet.has(currentTransaction.INV)) {
                const totalValue = vatable + vatExempt + zeroRated + government + vat12;
                duplicateValues.set(currentTransaction.INV, (duplicateValues.get(currentTransaction.INV) || 0) + totalValue);
            }
        });
        // Convert the Set to an array and sort it
        const sortedInvoices = Array.from(transactionSet).sort();
        // Calculate the total sum of negative values
        const negativeSum = negativeValues
            .reduce((sum, value) => sum + value, 0)
            .toFixed(2);
        // Calculate the total value of duplicates
        let duplicateTotal = 0;
        duplicateValues.forEach((value) => {
            duplicateTotal += value;
        });
        // Prepare the response
        const response = {
            date: dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : "N/A",
            branch: branchName || "N/A",
            min: min || "N/A",
            transactions: transactionSet.size,
            beginningInvoice: sortedInvoices[0] || null,
            lastInvoice: sortedInvoices[sortedInvoices.length - 1] || null,
            duplicateInvoices: Array.from(duplicateINVSet), // List of duplicates
            duplicateCount: duplicateINVSet.size, // Number of duplicates
            duplicateTotal: duplicateTotal.toFixed(2), // Total value of duplicates
            vatable: vatable.toFixed(2),
            vatExempt: vatExempt.toFixed(2),
            zeroRated: zeroRated.toFixed(2),
            government: government.toFixed(2),
            vat12: vat12.toFixed(2),
            total: (vatable + vatExempt + zeroRated + government + vat12).toFixed(2),
            negativeCount: negativeValues.length, // Count of negative values
            negativeTotal: negativeSum, // Sum of negative values
            transactions_data: transactionsData,
        };
        // Save transactions_data to the database
        yield esales_trans_model_1.TransactionsModel.insertMany(transactionsData);
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.processTextFileV2 = processTextFileV2;
const deleteTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield esales_trans_model_1.TransactionsModel.deleteMany({});
        res
            .status(200)
            .json({
            success: true,
            message: "All transactions deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.deleteTransactions = deleteTransactions;
const processTextFileV3 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        console.error("No file uploaded");
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    console.log("Request file: using v3");
    try {
        const fileContent = req.file.buffer.toString("utf8");
        const lines = fileContent.split("\n");
        let vatable = 0;
        let vatExempt = 0;
        let zeroRated = 0;
        let government = 0;
        let vat12 = 0;
        let dateFrom = "";
        let dateTo = "";
        let currentInvoiceDate = "";
        let currentInvoice = "";
        let branchName = null;
        let min = "";
        const transactionMap = new Map(); // Track occurrences of each INV#
        const negativeValues = [];
        const transactionsData = [];
        let currentTransaction = null;
        // Helper function to format date from "02/01/2024" to "Feb 2024"
        const formatDate = (dateString) => {
            const [month, day, year] = dateString.split("/");
            const date = new Date(`${year}-${month}-${day}`);
            const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            const monthName = monthNames[date.getMonth()];
            return `${monthName} ${year}`;
        };
        lines.forEach((line) => {
            // Extract the Branch name
            if (line.includes("Branch:")) {
                const match = line.match(/Branch:\s*(\S+)/i);
                if (match && match[1]) {
                    branchName = match[1];
                }
            }
            if (line.includes("Date:")) {
                const match = line.match(/Date:\s*(\S+)/i);
                if (match && match[1]) {
                    currentInvoiceDate = match[1]; // Temporarily store the extracted date
                }
            }
            if (line.includes("MIN:")) {
                const match = line.match(/MIN:\s*(\S+)/i);
                if (match && match[1]) {
                    min = match[1]; // Temporarily store the extracted date
                }
            }
            // Extract and store INV# values
            if (line.includes("INV#")) {
                const match = line.match(/INV#\s*[:\-]?\s*(\S+)/i);
                if (match && match[1]) {
                    const invoice = match[1];
                    // Update the count of this invoice in the map
                    transactionMap.set(invoice, (transactionMap.get(invoice) || 0) + 1);
                    if (!dateFrom || new Date(currentInvoiceDate) < new Date(dateFrom)) {
                        dateFrom = currentInvoiceDate;
                    }
                    if (!dateTo || new Date(currentInvoiceDate) > new Date(dateTo)) {
                        dateTo = currentInvoiceDate;
                    }
                    const formattedDate = formatDate(currentInvoiceDate);
                    currentTransaction = {
                        branch: branchName,
                        min: min,
                        INV: invoice,
                        date: formattedDate,
                        VATable: 0,
                        VatExempt: 0,
                        ZeroRated: 0,
                        Government: 0,
                        Vat12: 0,
                    };
                    transactionsData.push(currentTransaction);
                }
            }
            // Extract monetary values and remove commas
            const parts = line.trim().split(/\s+/);
            const valueString = parts[parts.length - 1].replace(/,/g, "");
            const value = parseFloat(valueString);
            if (!isNaN(value) && value < 0) {
                negativeValues.push(value); // Track negative values
            }
            if (line.includes("VATable")) {
                if (!isNaN(value)) {
                    vatable += value;
                    if (currentTransaction)
                        currentTransaction["VATable"] += value;
                }
            }
            else if (line.includes("VAT Exempt")) {
                if (!isNaN(value)) {
                    vatExempt += value;
                    if (currentTransaction)
                        currentTransaction["VatExempt"] += value;
                }
            }
            else if (line.includes("Zero Rated")) {
                if (!isNaN(value)) {
                    zeroRated += value;
                    if (currentTransaction)
                        currentTransaction["ZeroRated"] += value;
                }
            }
            else if (line.includes("Government")) {
                if (!isNaN(value)) {
                    government += value;
                    if (currentTransaction)
                        currentTransaction["Government"] += value;
                }
            }
            else if (line.includes("VAT 12%")) {
                if (!isNaN(value)) {
                    vat12 += value;
                    if (currentTransaction)
                        currentTransaction["Vat12"] += value;
                }
            }
        });
        // Calculate the total number of transactions (including duplicates)
        const totalTransactions = Array.from(transactionMap.values()).reduce((sum, count) => sum + count, 0);
        // Convert the Map keys to an array and sort it
        const sortedInvoices = Array.from(transactionMap.keys()).sort();
        // Calculate the total sum of negative values
        const negativeSum = negativeValues
            .reduce((sum, value) => sum + value, 0)
            .toFixed(2);
        // Prepare the response
        const response = {
            date: dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : "N/A",
            branch: branchName || "N/A",
            min: min || "N/A",
            transactions: totalTransactions, // Include duplicates in the total
            beginningInvoice: sortedInvoices[0] || null,
            lastInvoice: sortedInvoices[sortedInvoices.length - 1] || null,
            vatable: vatable.toFixed(2),
            vatExempt: vatExempt.toFixed(2),
            zeroRated: zeroRated.toFixed(2),
            government: government.toFixed(2),
            vat12: vat12.toFixed(2),
            total: (vatable + vatExempt + zeroRated + government).toFixed(2),
            negativeCount: negativeValues.length, // Count of negative values
            negativeTotal: negativeSum, // Sum of negative values
            transactions_data: transactionsData,
        };
        // Save transactions_data to the database
        yield esales_trans_model_1.TransactionsModel.insertMany(transactionsData);
        res.status(200).json(response);
    }
    catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.processTextFileV3 = processTextFileV3;
