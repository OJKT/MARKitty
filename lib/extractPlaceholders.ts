import JSZip from 'jszip';

export async function extractPlaceholders(docxBuffer: Buffer): Promise<Record<string, number>> {
  const zip = await JSZip.loadAsync(docxBuffer);
  const counts: Record<string, number> = {};
  const placeholderRegex = /\{\{([^}]+)\}\}/g;

  const relevantFiles = Object.keys(zip.files).filter(
    path => /^word\/(document|header\d*|footer\d*)\.xml$/.test(path)
  );

  for (const path of relevantFiles) {
    const content = await zip.file(path)?.async('text');
    if (!content) continue;

    // Combine all text chunks
    const textChunks = Array.from(content.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)).map(m => m[1]);
    const joinedText = textChunks.join('');

    console.log(`🪵 [${path}] Detected combined text:`, joinedText); // Optional debug

    let match;
    while ((match = placeholderRegex.exec(joinedText)) !== null) {
      const placeholder = match[1].trim();
      counts[placeholder] = (counts[placeholder] || 0) + 1;
    }
  }

  return counts;
} 