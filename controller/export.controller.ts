import { Request, Response } from 'express';
import { Parser } from 'json2csv';
import Esales from '../model/esales.model';
import EsalesErp from '../model/esales-erp.model';
import { TransactionsModel } from '../model/esales_trans.model';

export const exportEsales = async (req: Request, res: Response) => {
    try {
        // Fetch data from MongoDB
        const esalesData = await Esales.find();

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
        let dynamicHeaders: string[] = [];

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
            const mappedData: any = {
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
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(csvData);

        // Send the CSV file in the response
        res.header("Content-Type", "text/csv");
        res.attachment("esales.csv");
        res.send(csv);
    } catch (error) {
        console.error("Error exporting eSales data:", error);
        const errorMessage = (error as Error).message;
        res.status(500).json({ message: "Failed to export eSales data", error: errorMessage });
    }
};

export const exportEsalesErp = async (req: Request, res: Response) => {
    try {
        // Fetch data from MongoDB
        const esalesData = await EsalesErp.find();

        // Define the possible labels
        const labels = [
            "Transactions",
            "Vatable Sales",
            "Vat Exempt Sales",
            "Zero Rated Sales",
            "Government",
            "Output Tax",
            "Net Total",
            "Grand Total"
        ];

        // Define the static headers
        const staticHeaders = ["Branch", "Date", "MIN"];
        // Initialize an array for the dynamic headers
        let dynamicHeaders: string[] = [];

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
            const mappedData: any = {
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
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(csvData);

        // Send the CSV file in the response
        res.header("Content-Type", "text/csv");
        res.attachment("esales.csv");
        res.send(csv);
    } catch (error) {
        console.error("Error exporting eSales data:", error);
        const errorMessage = (error as Error).message;
        res.status(500).json({ message: "Failed to export eSales data", error: errorMessage });
    }
};


export const export_transactions = async (req: Request, res:Response) => {

try {
    // Fetch all data from MongoDB
    const transactionsData = await TransactionsModel.find();

    // Define the headers
    const fields = [
        "id",
        "branch",
        "INV",
        "date",
        "VATable",
        "VatExempt",
        "ZeroRated",
        "Government",
        "Vat12",
        "__v"
    ];

    // Map the data to the required CSV format
    const csvData = transactionsData.map((data) => ({
        id: data._id,
        branch: data.branch,
        INV: data.INV,
        date: data.date,
        VATable: data.VATable,
        VatExempt: data.VatExempt,
        ZeroRated: data.ZeroRated,
        Government: data.Government,
        Vat12: data.Vat12,
        __v: data.__v
    }));

    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Send the CSV file in the response
    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    res.send(csv);
} catch (error) {
    console.error("Error exporting transactions data:", error);
    const errorMessage = (error as Error).message;
    res.status(500).json({ message: "Failed to export transactions data", error: errorMessage });
}

}