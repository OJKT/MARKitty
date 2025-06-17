import fs from 'fs-extra';
import path from 'path';
import { createReadStream } from 'fs';
import { createUnzip } from 'zlib';
import { Readable } from 'stream';
import { promisify } from 'util';

const TEST_DIR = "C:/Users/JULIANTOMLINSON/OneDrive - TDR Training/Documents/MK Docs/Test Files";

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/{{[^{}]+}}/g);
  return matches || [];
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const unzip = createUnzip();
  
  // Convert buffer to stream
  const stream = Readable.from(buffer);
  
  // Create a promise to collect all chunks
  const chunks: Buffer[] = [];
  const streamPromise = new Promise<Buffer>((resolve, reject) => {
    stream.pipe(unzip)
      .on('data', (chunk) => chunks.push(chunk))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', reject);
  });

  const unzippedData = await streamPromise;
  const content = unzippedData.toString('utf-8');
  
  // Simple XML text extraction - this is a basic implementation
  // that looks for text between <w:t> tags
  const textMatches = content.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
  const text = textMatches
    .map(match => match.replace(/<w:t[^>]*>(.*?)<\/w:t>/, '$1'))
    .join(' ');
  
  return text;
}

describe("DOCX Placeholder Detection", () => {
  const docxFiles = fs.readdirSync(TEST_DIR).filter((f: string) => f.endsWith('.docx'));

  for (const file of docxFiles) {
    test(`detects placeholders in ${file}`, async () => {
      const filePath = path.join(TEST_DIR, file);
      const textContent = await extractTextFromDocx(filePath);
      const placeholders = extractPlaceholders(textContent);
      
      console.log(`Found in ${file}:`, placeholders);
      expect(placeholders.length).toBeGreaterThan(0);
    });
  }
}); 