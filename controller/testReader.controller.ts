import exp from 'constants';
import { Request, Response } from 'express';

export const processTextFile = async (req: Request, res: Response): Promise<void> => {
  console.log('Request file:', req.file);
  console.log('Request body:', req.body);

  if (!req.file) {
    console.error('No file uploaded');
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const fileContent = req.file.buffer.toString('utf8');
    const lines = fileContent.split('\n');

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
      if (line.includes('Branch:')) {
        const match = line.match(/Branch:\s*(\S+)/i);
        if (match && match[1]) {
          branchName = match[1];
        }
      }

      // Extract and store unique INV# values
      if (line.includes('INV#')) {
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

      if (line.includes('VATable')) {
        if (!isNaN(value)) vatable += value;
      } else if (line.includes('VAT Exempt')) {
        if (!isNaN(value)) vatExempt += value;
      } else if (line.includes('Zero Rated')) {
        if (!isNaN(value)) zeroRated += value;
      } else if (line.includes('Government')) {
        if (!isNaN(value)) government += value;
      } else if (line.includes('VAT 12%')) {
        if (!isNaN(value)) vat12 += value;
      }
    });

    // Convert the Set to an array and sort it
    const sortedInvoices = Array.from(transactionSet).sort();

    // Calculate the total sum of negative values
    const negativeSum = negativeValues.reduce((sum, value) => sum + value, 0).toFixed(2);
    // Prepare the response
    const response = {
      branch: branchName || 'N/A',
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
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const processTextFileERP = async (req: Request, res: Response): Promise<void> => {
    
};