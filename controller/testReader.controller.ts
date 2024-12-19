import exp from "constants";
import { Request, Response } from "express";

export const processTextFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Request file:", req.file);
  console.log("Request body:", req.body);

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

    const transactionSet = new Set<string>(); // Unique INV# values
    const duplicateINVSet = new Set<string>(); // Duplicates tracking
    const transactionMap = new Map<string, number>(); // INV# to count occurrences
    let branchName = null; // To store the branch name

    const negativeValues: number[] = []; // Store negative monetary values

    lines.forEach((line) => {
      // Extract the Branch name
      if (line.includes("Branch:")) {
        const match = line.match(/Branch:\s*(\S+)/i);
        if (match && match[1]) {
          branchName = match[1];
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

    // Convert the Set to an array and sort it
    const sortedInvoices = Array.from(transactionSet).sort();

    // Calculate the total sum of negative values
    const negativeSum = negativeValues
      .reduce((sum, value) => sum + value, 0)
      .toFixed(2);
    // Prepare the response
    const response = {
      branch: branchName || "N/A",
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
      negativeTotal: negativeSum, // Sum of negative values
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

      // Count POS Invoice occurrences
      if (trimmedLine.includes("POS Invoice:")) {
        posInvoiceCount += 1;
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
          if (!dateFrom || new Date(currentInvoiceDate) < new Date(dateFrom)) {
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

    // Convert the Set to an array and sort it
    const sortedInvoices = Array.from(transactionSet).sort();

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
      netTotal: netTotal.toFixed(2), // Exclude VAT 12%
      grandTotal: grandTotal.toFixed(2), // Include the total sum
      negativeCount: negativeValues.length, // Count of negative values
      negativeTotal: negativeSum, // Sum of negative values
    };

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
