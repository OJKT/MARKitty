import { Document, Packer, Paragraph, TextRun } from 'docx';

export type MergeData = {
  learnerName: string;
  assignmentTitle: string;
  learnerDeclaration: string;
};

export async function mergeDocx(templateBuffer: ArrayBuffer, data: MergeData): Promise<Uint8Array> {
  // Load the template document
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun(`Learner Name: ${data.learnerName}`),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun(`Assignment Title: ${data.assignmentTitle}`),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun(`Declaration: ${data.learnerDeclaration}`),
          ],
        }),
      ],
    }],
  });

  // Generate the merged document
  return await Packer.toBuffer(doc);
}

export function createPreviewHtml(data: MergeData): string {
  return `
    <div class="space-y-4">
      <p><strong>Learner Name:</strong> ${data.learnerName}</p>
      <p><strong>Assignment Title:</strong> ${data.assignmentTitle}</p>
      <p><strong>Declaration:</strong> ${data.learnerDeclaration}</p>
    </div>
  `;
} 