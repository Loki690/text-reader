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
exports.exportEsalesErp = exports.exportEsales = void 0;
const json2csv_1 = require("json2csv");
const esales_model_1 = __importDefault(require("../model/esales.model"));
const esales_erp_model_1 = __importDefault(require("../model/esales-erp.model"));
const exportEsales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch data from MongoDB
        const esalesData = yield esales_model_1.default.find();
        // Define the possible labels
        const labels = [
            "Transactions",
            "Vatable Sales",
            "Vat Exempt Sales",
            "Zero Rated Sales",
            "Government",
            "Output Tax",
        ];
        // Define the static headers
        const staticHeaders = ["Branch", "Date", "MIN"];
        // Initialize an array for the dynamic headers
        let dynamicHeaders = [];
        // Loop through the labels to create headers for each field
        labels.forEach(label => {
            dynamicHeaders.push(`${label} txt`);
            dynamicHeaders.push(`${label} Manual Input`);
            dynamicHeaders.push(`${label} Difference`);
        });
        // Combine static and dynamic headers
        const fields = [...staticHeaders, ...dynamicHeaders];
        // Map the data to the required CSV format
        const csvData = esalesData.map((data) => {
            const mappedData = {
                Branch: data.branch,
                Date: data.date,
                MIN: data.min,
            };
            labels.forEach(label => {
                const row = data.tableRows.find((row) => row.label === label);
                mappedData[`${label} txt`] = row ? row.textValue : "";
                mappedData[`${label} Manual Input`] = row ? row.manualInput : "";
                mappedData[`${label} Difference`] = row ? row.difference : "";
            });
            return mappedData;
        });
        // Convert to CSV
        const json2csvParser = new json2csv_1.Parser({ fields });
        const csv = json2csvParser.parse(csvData);
        // Send the CSV file in the response
        res.header("Content-Type", "text/csv");
        res.attachment("esales.csv");
        res.send(csv);
    }
    catch (error) {
        console.error("Error exporting eSales data:", error);
        const errorMessage = error.message;
        res.status(500).json({ message: "Failed to export eSales data", error: errorMessage });
    }
});
exports.exportEsales = exportEsales;
const exportEsalesErp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch data from MongoDB
        const esalesData = yield esales_erp_model_1.default.find();
        // Define the possible labels
        const labels = [
            "Transactions",
            "Vatable Sales",
            "Vat Exempt Sales",
            "Zero Rated Sales",
            "Government",
            "Output Tax",
        ];
        // Define the static headers
        const staticHeaders = ["Branch", "Date", "MIN"];
        // Initialize an array for the dynamic headers
        let dynamicHeaders = [];
        // Loop through the labels to create headers for each field
        labels.forEach(label => {
            dynamicHeaders.push(`${label} txt`);
            dynamicHeaders.push(`${label} Manual Input`);
            dynamicHeaders.push(`${label} Difference`);
        });
        // Combine static and dynamic headers
        const fields = [...staticHeaders, ...dynamicHeaders];
        // Map the data to the required CSV format
        const csvData = esalesData.map((data) => {
            const mappedData = {
                Branch: data.branch,
                Date: data.date,
                MIN: data.min,
            };
            labels.forEach(label => {
                const row = data.tableRows.find((row) => row.label === label);
                mappedData[`${label} txt`] = row ? row.textValue : "";
                mappedData[`${label} Manual Input`] = row ? row.manualInput : "";
                mappedData[`${label} Difference`] = row ? row.difference : "";
            });
            return mappedData;
        });
        // Convert to CSV
        const json2csvParser = new json2csv_1.Parser({ fields });
        const csv = json2csvParser.parse(csvData);
        // Send the CSV file in the response
        res.header("Content-Type", "text/csv");
        res.attachment("esales.csv");
        res.send(csv);
    }
    catch (error) {
        console.error("Error exporting eSales data:", error);
        const errorMessage = error.message;
        res.status(500).json({ message: "Failed to export eSales data", error: errorMessage });
    }
});
exports.exportEsalesErp = exportEsalesErp;
