import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { MergeData } from './mergeDocx';

export async function mergePdf(templateBuffer: ArrayBuffer, data: MergeData): Promise<Uint8Array> {
  // Load the PDF document
  const pdfDoc = await PDFDocument.load(templateBuffer);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Get the first page
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  // Add text to the page
  page.drawText(`Learner Name: ${data.learnerName}`, {
    x: 50,
    y: height - 50,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Assignment Title: ${data.assignmentTitle}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Declaration: ${data.learnerDeclaration}`, {
    x: 50,
    y: height - 110,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
    maxWidth: width - 100,
  });

  // Save the PDF
  return await pdfDoc.save();
} 