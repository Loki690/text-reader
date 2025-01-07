import exp from "constants";
import { Request, Response } from "express";
import Esales from "../model/esales.model";
import EsalesErp from "../model/esales-erp.model";

export const processTextFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  // console.log("Request file:", req.file);
  // console.log("Request body:", req.body);

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

    const transactionSet = new Set<string>();
    const duplicateINVSet = new Set<string>(); 
    const transactionMap = new Map<string, number>(); 
    let branchName = null; 
    let min = null;

    const negativeValues: number[] = []; 

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
          } else {
            transactionSet.add(invoice); // Add to the unique set
          }

          if (!dateFrom || new Date(currentInvoiceDate) < new Date(dateFrom)) {
            dateFrom = currentInvoiceDate;
          }
          if (!dateTo || new Date(currentInvoiceDate) > new Date(dateTo)) {
            dateTo = currentInvoiceDate;
          }

          // Update the map to track occurrences
          transactionMap.set(invoice, (transactionMap.get(invoice) || 0) + 1);
        }
      }

      // Extract monetary values
      const parts = line.trim().split(/\s+/);
      const value = parseFloat(parts[parts.length - 1]);

      if (!isNaN(value) && value < 0) {
        negativeValues.push(value); // Track negative values
      }

      if (line.includes("VATable")) {
        if (!isNaN(value)) vatable += value;
      } else if (line.includes("VAT Exempt")) {
        if (!isNaN(value)) vatExempt += value;
      } else if (line.includes("Zero Rated")) {
        if (!isNaN(value)) zeroRated += value;
      } else if (line.includes("Government")) {
        if (!isNaN(value)) government += value;
      } else if (line.includes("VAT 12%")) {
        if (!isNaN(value)) vat12 += value;
      }
    });

    // Function to identify missing invoice numbers
    // const findMissingInvoices = (invoices: string[]) => {
    //   const missing = [];
    //   const prefix = invoices[0].slice(0, invoices[0].lastIndexOf("-") + 1);
    //   const numericInvoices = invoices.map((inv) =>
    //     parseInt(inv.split("-").pop()!, 10)
    //   );
    //   numericInvoices.sort((a, b) => a - b);

    //   for (let i = 1; i < numericInvoices.length; i++) {
    //     const prev = numericInvoices[i - 1];
    //     const curr = numericInvoices[i];
    //     for (let j = prev + 1; j < curr; j++) {
    //       missing.push(prefix + j.toString().padStart(4, "0"));
    //     }
    //   }
    //   return missing;
    // };

    // Convert the Set to an array and sort it
    const sortedInvoices = Array.from(transactionSet).sort();

    // Identify missing invoice numbers
    // const missingInvoices = findMissingInvoices(sortedInvoices);

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
      beginningInvoice: sortedInvoices[0] || null,
      lastInvoice: sortedInvoices[sortedInvoices.length - 1] || null,
      duplicateInvoices: Array.from(duplicateINVSet), // List of duplicates
      duplicateCount: duplicateINVSet.size, // Number of duplicates
      vatable: vatable.toFixed(2),
      vatExempt: vatExempt.toFixed(2),
      zeroRated: zeroRated.toFixed(2),
      government: government.toFixed(2),
      vat12: vat12.toFixed(2),
      total: (vatable + vatExempt + zeroRated + government + vat12).toFixed(2),
      negativeCount: negativeValues.length, // Count of negative values
      negativeTotal: negativeSum, // Sum of negative values,
      // missingInvoices, // List of missing invoice numbers
      // missingInvoiceCount: missingInvoices.length, // Count of missing invoices
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const processTextFileERP = async (
  req: Request,
  res: Response
): Promise<void> => {
  // console.log("Request file:", req.file);

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
    const transactionSet = new Set<string>(); // Unique INV# values
    const duplicateINVSet = new Set<string>(); // Duplicates tracking
    const negativeValues: number[] = []; // Store negative monetary values

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
          } else {
            transactionSet.add(invoice); // Add to the unique set

            // Update dateFrom and dateTo
            if (
              !dateFrom ||
              new Date(currentInvoiceDate) < new Date(dateFrom)
            ) {
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
        if (!isNaN(value)) vatable += value;
      } else if (line.includes("Vat Exempt:")) {
        if (!isNaN(value)) vatExempt += value;
      } else if (line.includes("Zero Rated:")) {
        if (!isNaN(value)) zeroRated += value;
      } else if (line.includes("Government:")) {
        if (!isNaN(value)) government += value;
      } else if (line.includes("VAT 12%:")) {
        if (!isNaN(value)) vat12 += value;
      }
    });

    const findMissingInvoicesERP = (invoices: string[]) => {
      const missing = [];
      const prefix = invoices[0].slice(0, invoices[0].lastIndexOf("-") + 1);
      const numericInvoices = invoices.map((inv) =>
        parseInt(inv.split("-").pop()!, 10)
      );
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
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createEsales = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let esalesData = req.body;

    const esalesDataDate = esalesData.tableRows[0].textValue;
    const esalesDataBranch = esalesData.tableRows[1].textValue;
    const esalesDataMin = esalesData.tableRows[2].textValue;

    esalesData.branch = esalesDataBranch;
    esalesData.date = esalesDataDate;
    esalesData.min = esalesDataMin;

    // Check for duplicate branch and date
    const existingEsales = await Esales.findOne({
      branch: esalesDataBranch,
      date: esalesDataDate,
      min: esalesDataMin,
    });

    if (existingEsales) {
      res.status(400).json({
        success: false,
        message:
          "Duplicate entry: eSales data for this branch and date already exists",
      });
      return;
    }

    const newEsales = new Esales(esalesData);
    await newEsales.save();
    res.status(200).json({
      success: true,
      data: newEsales,
      message: "eSales data saved successfully",
    });
  } catch (error) {
    console.error("Error saving esales data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const createEsalesERP = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const existingEsales = await EsalesErp.findOne({
      branch: esalesDataBranch,
      date: esalesDataDate,
      min: esalesDataMin,
    });

    if (existingEsales) {
      res.status(400).json({
        success: false,
        message:
          "Duplicate entry: eSales data for this branch and date already exists",
      });
      return;
    }

    const newEsales = new EsalesErp(esalesData);
    await newEsales.save();
    res.status(200).json({
      success: true,
      data: newEsales,
      message: "eSales data saved successfully",
    });
  } catch (error) {
    console.error("Error saving esales data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEsales = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const esalesData = await Esales.find();
    res.status(200).json({
      success: true,
      data: esalesData,
    });
  } catch (error) {
    console.error("Error fetching esales data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEsalesErp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const esalesData = await EsalesErp.find();
    res.status(200).json({
      success: true,
      data: esalesData,
    });
  } catch (error) {
    console.error("Error fetching esales data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};