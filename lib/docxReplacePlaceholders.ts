import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { parseStringPromise, Builder } from 'xml2js';

interface TextNode {
  text: string;
  rPr?: any;
  isPlaceholder?: boolean;
  placeholderKey?: string;
}

interface ProcessedXml {
  xml: any;
  hasChanges: boolean;
}

/**
 * Processes a single XML node for placeholders, handling nested structures
 * @param node The XML node to process
 * @param replacements Object containing placeholder keys and their replacement values
 * @returns true if any changes were made
 */
function processNode(node: any, replacements: Record<string, string>): boolean {
  let hasChanges = false;

  // Handle text runs
  if (node['w:t']) {
    const text = node['w:t'][0];
    if (typeof text === 'string') {
      const placeholderRegex = /{{([^}]+)}}/g;
      let match;
      let lastIndex = 0;
      let newText = '';

      while ((match = placeholderRegex.exec(text)) !== null) {
        newText += text.slice(lastIndex, match.index);
        const placeholderKey = match[1];
        newText += replacements[placeholderKey] || match[0];
        lastIndex = match.index + match[0].length;
        hasChanges = true;
      }

      if (hasChanges) {
        newText += text.slice(lastIndex);
        node['w:t'][0] = newText;
      }
    }
  }

  // Recursively process child nodes
  for (const key in node) {
    if (Array.isArray(node[key])) {
      for (const childNode of node[key]) {
        if (typeof childNode === 'object') {
          hasChanges = processNode(childNode, replacements) || hasChanges;
        }
      }
    }
  }

  return hasChanges;
}

/**
 * Processes a paragraph for split placeholders while preserving formatting
 * @param paragraph The paragraph node to process
 * @param replacements Object containing placeholder keys and their replacement values
 * @returns true if any changes were made
 */
function processParagraph(paragraph: any, replacements: Record<string, string>): boolean {
  const runs = paragraph['w:r'] || [];
  const textNodes: TextNode[] = [];
  let currentText = '';
  let currentRPr = null;

  // Step 1: Collect and concatenate text nodes
  for (const run of runs) {
    const text = run['w:t']?.[0] || '';
    const rPr = run['w:rPr']?.[0];
    
    if (text) {
      currentText += text;
      if (!currentRPr) currentRPr = rPr;
    }
  }

  // Step 2: Detect placeholders in concatenated text
  const placeholderRegex = /{{([^}]+)}}/g;
  let match;
  let lastIndex = 0;
  const processedNodes: TextNode[] = [];
  let hasChanges = false;

  while ((match = placeholderRegex.exec(currentText)) !== null) {
    // Add text before placeholder
    if (match.index > lastIndex) {
      processedNodes.push({
        text: currentText.slice(lastIndex, match.index),
        rPr: currentRPr
      });
    }

    // Add placeholder
    const placeholderKey = match[1];
    processedNodes.push({
      text: match[0],
      rPr: currentRPr,
      isPlaceholder: true,
      placeholderKey
    });

    lastIndex = match.index + match[0].length;
    hasChanges = true;
  }

  // Add remaining text
  if (lastIndex < currentText.length) {
    processedNodes.push({
      text: currentText.slice(lastIndex),
      rPr: currentRPr
    });
  }

  if (hasChanges) {
    // Step 3: Replace placeholders and rebuild runs
    const newRuns: any[] = [];
    for (const node of processedNodes) {
      const run: any = {
        'w:t': [node.isPlaceholder ? replacements[node.placeholderKey!] || node.text : node.text]
      };

      if (node.rPr) {
        run['w:rPr'] = [node.rPr];
      }

      newRuns.push(run);
    }

    // Replace original runs with new ones
    paragraph['w:r'] = newRuns;
  }

  return hasChanges;
}

/**
 * Processes an XML document for placeholders
 * @param xml The parsed XML document
 * @param replacements Object containing placeholder keys and their replacement values
 * @returns The processed XML and whether any changes were made
 */
function processXmlDocument(xml: any, replacements: Record<string, string>): ProcessedXml {
  let hasChanges = false;

  // Process body content
  if (xml['w:document']?.['w:body']?.[0]) {
    const body = xml['w:document']['w:body'][0];
    
    // Process paragraphs
    if (body['w:p']) {
      for (const paragraph of body['w:p']) {
        hasChanges = processParagraph(paragraph, replacements) || hasChanges;
      }
    }

    // Process tables
    if (body['w:tbl']) {
      for (const table of body['w:tbl']) {
        if (table['w:tr']) {
          for (const row of table['w:tr']) {
            if (row['w:tc']) {
              for (const cell of row['w:tc']) {
                if (cell['w:p']) {
                  for (const paragraph of cell['w:p']) {
                    hasChanges = processParagraph(paragraph, replacements) || hasChanges;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Process drawings and pictures
    if (body['w:p']) {
      for (const paragraph of body['w:p']) {
        if (paragraph['w:drawing'] || paragraph['w:pict']) {
          hasChanges = processNode(paragraph, replacements) || hasChanges;
        }
      }
    }
  }

  return { xml, hasChanges };
}

/**
 * Replaces placeholders in a .docx file with provided values, handling split placeholders,
 * headers, footers, and complex layouts while preserving formatting
 * @param inputPath Path to the input .docx file
 * @param replacements Object containing placeholder keys and their replacement values
 * @param outputPath Path where the modified .docx file will be saved
 */
export async function replaceDocxPlaceholders(
  inputPath: string,
  replacements: Record<string, string>,
  outputPath: string
): Promise<void> {
  const content = await fs.promises.readFile(inputPath);
  const zip = await JSZip.loadAsync(content);
  let hasAnyChanges = false;

  // Process main document
  const docXmlPath = 'word/document.xml';
  const docXmlString = await zip.file(docXmlPath)?.async('text');
  if (!docXmlString) throw new Error('document.xml not found in .docx');

  const docXml = await parseStringPromise(docXmlString);
  const { xml: updatedDocXml, hasChanges: docChanges } = processXmlDocument(docXml, replacements);
  hasAnyChanges = hasAnyChanges || docChanges;

  if (docChanges) {
    const builder = new Builder();
    const updatedXml = builder.buildObject(updatedDocXml);
    zip.file(docXmlPath, updatedXml);
  }

  // Process headers and footers
  for (const [relativePath, file] of Object.entries(zip.files)) {
    if (/word\/(header|footer)[0-9]*\.xml/.test(relativePath)) {
      const xmlString = await file.async('text');
      const xml = await parseStringPromise(xmlString);
      const { xml: updatedXml, hasChanges } = processXmlDocument(xml, replacements);
      hasAnyChanges = hasAnyChanges || hasChanges;

      if (hasChanges) {
        const builder = new Builder();
        const updatedXmlString = builder.buildObject(updatedXml);
        zip.file(relativePath, updatedXmlString);
      }
    }
  }

  if (hasAnyChanges) {
    const updatedBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.promises.writeFile(outputPath, updatedBuffer);
  } else {
    // If no changes were made, just copy the original file
    await fs.promises.copyFile(inputPath, outputPath);
  }
} 