'use client';

import React, { useState } from 'react';
import Dropzone from './components/Dropzone';

export default function Page() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [nameListFile, setNameListFile] = useState<File | null>(null);
  const [referenceCode, setReferenceCode] = useState('EPH3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!templateFile || !nameListFile || !referenceCode.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nameText = await nameListFile.text();
      const formData = new FormData();
      formData.append('template', templateFile);
      formData.append('studentList', nameText);
      formData.append('referenceCode', referenceCode.trim());

      // Debug log to verify FormData contents
      console.log('📦 FormData contents:');
      console.log('template:', templateFile.name);
      console.log('studentList:', nameText);
      console.log('referenceCode:', referenceCode.trim());

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Generated file is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${referenceCode}_documents.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error generating files:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong while generating files.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">BriefGEN Document Generator</h1>

      <section className="bg-gray-100 border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Upload Template (.docx)</h2>
        <Dropzone
          onDrop={(files: File[]) => setTemplateFile(files[0])}
          acceptedTypes=".docx"
          file={templateFile}
          maxSize={5 * 1024 * 1024}
          onError={(msg: string) => setError(msg)}
        />
      </section>

      <section className="bg-gray-100 border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Upload Student List (.txt)</h2>
        <Dropzone
          onDrop={(files: File[]) => setNameListFile(files[0])}
          acceptedTypes=".txt,.csv"
          file={nameListFile}
          maxSize={1024 * 1024}
          onError={(msg: string) => setError(msg)}
        />
      </section>

      <section>
        <label htmlFor="referenceCode" className="block font-semibold mb-1">
          Reference Code
        </label>
        <input
          id="referenceCode"
          value={referenceCode}
          onChange={(e) => setReferenceCode(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="e.g., EPH3"
          pattern="[a-zA-Z0-9-_]+"
          title="Only letters, numbers, hyphens, and underscores are allowed"
          maxLength={50}
          required
        />
      </section>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-800">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!templateFile || !nameListFile || !referenceCode.trim() || loading}
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </span>
        ) : (
          'Generate Documents'
        )}
      </button>
    </main>
  );
} 