'use client';

import { useState } from 'react';

export default function BriefGenPage() {
  const [file, setFile] = useState<File | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [code, setCode] = useState<string>('');
  const [date, setDate] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // Mock placeholder detection
      setPlaceholders(['{{name}}', '{{date}}', '{{code}}']);
    }
  };

  const handleTxtFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const nameList = text.split('\n').filter(name => name.trim() !== '');
        setNames(nameList);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleGenerateBriefs = () => {
    alert(`Number of names: ${names.length}\nSelected date: ${date}\nAssignment code: ${code}`);
  };

  const isButtonDisabled = names.length === 0 || !code || !date || placeholders.length === 0;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">BriefGEN Generator</h1>
      <p className="text-lg text-gray-600 mb-8">Upload a .docx file to detect placeholders and a .txt file for names.</p>
      <input
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <input
        type="file"
        accept=".txt"
        onChange={handleTxtFileChange}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <input
        type="text"
        placeholder="Assignment Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      {file && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Detected Placeholders:</h2>
          <ul className="list-disc pl-5">
            {placeholders.map((placeholder, index) => (
              <li key={index} className="text-gray-700">{placeholder}</li>
            ))}
          </ul>
        </div>
      )}
      {names.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Uploaded Names:</h2>
          <ul className="list-disc pl-5">
            {names.map((name, index) => (
              <li key={index} className="text-gray-700">{name}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={handleGenerateBriefs}
        disabled={isButtonDisabled}
        className={`mt-4 px-4 py-2 rounded ${isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
      >
        Generate Briefs
      </button>
    </main>
  );
} 