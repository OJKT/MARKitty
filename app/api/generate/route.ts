import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { createReadStream, promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import { z } from 'zod';

// Constants for file size limits and timeouts
const MAX_TEMPLATE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_STUDENT_LIST_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_NAMES = 500; // Maximum number of names to process
const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const REQUIRED_PLACEHOLDERS = ['{{name}}'];

// Validation schema for form data
const FormDataSchema = z.object({
  template: z.instanceof(File)
    .refine(file => file.size <= MAX_TEMPLATE_SIZE, 'Template file is too large (max 5MB)')
    .refine(file => file.type === DOCX_MIME_TYPE, 'Template must be a valid DOCX file'),
  studentList: z.instanceof(File)
    .refine(file => file.size <= MAX_STUDENT_LIST_SIZE, 'Student list is too large (max 1MB)')
    .refine(
      file => file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.csv'),
      'Student list must be a TXT or CSV file'
    ),
  referenceCode: z.string()
    .min(1, 'Reference code is required')
    .max(50, 'Reference code is too long')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Reference code can only contain letters, numbers, hyphens, and underscores')
});

// Helper function to sanitize file names
function sanitizeFileName(name: string, refCode: string): string {
  // Remove any path traversal attempts and invalid characters
  const safeName = name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .slice(0, 100); // Limit filename length
  return `${safeName}-${refCode}.docx`;
}

// Helper function to parse name list file
async function parseNameList(file: File): Promise<Array<{ name: string; [key: string]: string }>> {
  try {
    const content = await file.text();
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const lines = content
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      throw new Error('Name list is empty');
    }

    if (lines.length > MAX_NAMES) {
      throw new Error(`Name list exceeds maximum limit of ${MAX_NAMES} names`);
    }

    if (isCSV) {
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIndex = headers.indexOf('name');
      
      if (nameIndex === -1) {
        throw new Error('CSV file must have a "name" column');
      }

      return lines.slice(1)
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          const name = values[nameIndex] || '';
          
          if (!name || name.length === 0 || name.length > 100) {
            return null;
          }

          const record: { name: string; [key: string]: string } = { name };
          headers.forEach((header, index) => {
            if (header !== 'name') {
              record[header] = values[index] || '';
            }
          });

          return record;
        })
        .filter((record): record is { name: string; [key: string]: string } => record !== null);
    }

    return lines
      .filter(name => name.length > 0 && name.length <= 100)
      .map(name => ({ name }));
  } catch (error) {
    console.error('Error parsing name list:', error);
    throw new Error('Failed to parse name list file');
  }
}

// Helper function to validate DOCX template
async function validateTemplate(templateBuffer: ArrayBuffer): Promise<void> {
  try {
    const zip = await JSZip.loadAsync(templateBuffer);
    const docXml = await zip.file('word/document.xml')?.async('text');
    
    if (!docXml) {
      throw new Error('Invalid DOCX file: missing document.xml');
    }

    // Check if template contains required placeholder
    if (!docXml.includes('{{name}}')) {
      throw new Error('Template must contain the {{name}} placeholder');
    }
  } catch (error) {
    console.error('Error validating template:', error);
    if (error instanceof Error) {
      throw new Error(`Invalid template: ${error.message}`);
    }
    throw new Error('Invalid template file');
  }
}

async function replaceDocxPlaceholders(
  inputPath: string,
  data: Record<string, any>,
  outputPath: string
): Promise<void> {
  try {
    // Read the template file
    const content = await fs.readFile(inputPath);
    
    // Create a new zip from the template
    const zip = await JSZip.loadAsync(content);
    
    // Get the main document XML
    const docXml = await zip.file('word/document.xml')?.async('text');
    if (!docXml) {
      throw new Error('Could not find document.xml in the template');
    }

    // Replace placeholders in the document
    let modifiedXml = docXml;
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      modifiedXml = modifiedXml.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Update the document.xml in the zip
    zip.file('word/document.xml', modifiedXml);

    // Generate the new document
    const output = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.writeFile(outputPath, output);
  } catch (error) {
    console.error('Error replacing placeholders:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const streamController = new AbortController();
  const { signal } = streamController;

  try {
    // Parse form data with size limits
    const formData = await req.formData();
    const rawData = {
      template: formData.get('template'),
      studentList: formData.get('studentList'),
      referenceCode: formData.get('referenceCode'),
    };

    // Enhanced logging
    console.log('📥 FORM SUBMISSION RECEIVED:');
    console.log('🧾 Assignment Code:', rawData.referenceCode);
    console.log('📦 Template:', rawData.template instanceof File ? 
      `${rawData.template.name} ${rawData.template.size} bytes` : 
      'No template file');
    console.log('📜 Student List:\n', rawData.studentList);

    // Validate form data
    const result = FormDataSchema.safeParse(rawData);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { template, studentList, referenceCode } = result.data;

    // Read and validate files
    const records = await parseNameList(studentList);
    if (records.length === 0) {
      return NextResponse.json(
        { error: 'No valid records found in the list' },
        { status: 400 }
      );
    }

    // Read and validate template
    const templateBuffer = await template.arrayBuffer();
    await validateTemplate(templateBuffer);

    // Create a zip to store all generated files
    const zip = new JSZip();
    const processedNames = new Set<string>();
    const duplicateCounter = new Map<string, number>();
    const errors: string[] = [];

    // Process each record with proper error handling
    for (const record of records) {
      try {
        // Handle duplicate names
        let finalName = record.name;
        if (processedNames.has(finalName)) {
          const count = (duplicateCounter.get(finalName) || 1) + 1;
          duplicateCounter.set(finalName, count);
          finalName = `${finalName} (${count})`;
        }
        processedNames.add(finalName);

        // Create temporary files for processing
        const tempInputPath = `/tmp/${Date.now()}-input.docx`;
        const tempOutputPath = `/tmp/${Date.now()}-output.docx`;
        
        // Write template to temp file
        await fs.writeFile(tempInputPath, Buffer.from(templateBuffer));

        // Replace placeholders
        await replaceDocxPlaceholders(
          tempInputPath,
          {
            ...record,
            date: new Date().toLocaleDateString(),
          },
          tempOutputPath
        );

        // Read the generated file and add to zip
        const generatedDoc = await fs.readFile(tempOutputPath);
        const fileName = sanitizeFileName(finalName, referenceCode);
        zip.file(fileName, generatedDoc);

        // Clean up temp files
        await fs.unlink(tempInputPath);
        await fs.unlink(tempOutputPath);
      } catch (error) {
        console.error(`Error processing record ${record.name}:`, error);
        errors.push(`Failed to process ${record.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some records failed to process:', errors);
    }

    // Generate the final zip file
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    console.log(`✅ ZIP file created for ${records.length} students.`);

    // Create a readable stream from the buffer
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(zipBuffer);
        controller.close();
      },
      cancel() {
        streamController.abort();
      }
    });

    // Return the zip file as a stream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="generated-documents-${referenceCode}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 