'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  label: string;
  accept: string;
  file: File | null;
  setFile: (file: File | null) => void;
  hint?: string;
}

export default function FileUpload({ label, accept, file, setFile, hint }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    [setFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [accept]: [],
    },
    multiple: false,
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="text-sm text-gray-600">
            <p className="font-medium">{file.name}</p>
            <p className="text-xs">Click or drag to replace</p>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <p>Drop your file here, or click to select</p>
            <p className="text-xs">Accepted format: {accept}</p>
          </div>
        )}
      </div>
      {hint && (
        <p className="mt-2 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
} 