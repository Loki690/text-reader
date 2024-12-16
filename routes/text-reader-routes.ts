import { Router, Request, Response } from 'express';
import multer from 'multer';

// Use memoryStorage instead of default diskStorage
const storage = multer.memoryStorage();
const upload = multer({ storage }); // Store file in memory

export const textReaderRouter = Router();

textReaderRouter.post('/text-read', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  console.log('Request file:', req.file);
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

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

    const transactionSet = new Set<string>(); // To store unique INV# values
    let branchName = null; // To store the branch name

    lines.forEach((line) => {
      // Extract the Branch name
      if (line.includes('Branch:')) {
        const match = line.match(/Branch:\s*(\S+)/i); // Match "Branch:" and capture its value
        if (match && match[1]) {
          branchName = match[1]; // Store branch name
        }
      }

      // Extract and store unique INV# values
      if (line.includes('INV#')) {
        console.log(line)
        const match = line.match(/INV#\s*[:\-]?\s*(\S+)/i); // Match INV# and capture the number
        if (match && match[1]) {
          transactionSet.add(match[1]); // Add invoice number to the set
        }
      }

      // Extract monetary values
      const parts = line.trim().split(/\s+/);
      if (line.includes('VATable')) {
        const value = parts.pop();
        if (value) vatable += parseFloat(value);
      } else if (line.includes('VAT Exempt')) {
        const value = parts.pop();
        if (value) vatExempt += parseFloat(value);
      } else if (line.includes('Zero Rated')) {
        const value = parts.pop();
        if (value) zeroRated += parseFloat(value);
      } else if (line.includes('Government')) {
        const value = parts.pop();
        if (value) government += parseFloat(value);
      } else if (line.includes('VAT 12%')) {
        const value = parts.pop();
        if (value) vat12 += parseFloat(value);
      }
    });

    // Convert the Set to an array and sort it
    const sortedInvoices = Array.from(transactionSet).sort();

    // Prepare the response
    const response = {
      branch: branchName || 'N/A', // Display the branch name or N/A if not found
      transactions: transactionSet.size,
      beginningInvoice: sortedInvoices[0] || null, // First invoice
      lastInvoice: sortedInvoices[sortedInvoices.length - 1] || null, // Last invoice
      vatable: vatable.toFixed(2),
      vatExempt: vatExempt.toFixed(2),
      zeroRated: zeroRated.toFixed(2),
      government: government.toFixed(2),
      vat12: vat12.toFixed(2),
      total: (vatable + vatExempt + zeroRated + government + vat12).toFixed(2),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
