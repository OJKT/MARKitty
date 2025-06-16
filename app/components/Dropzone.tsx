'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  acceptedTypes: string;
  file: File | null;
  maxSize: number;
  onError: (message: string) => void;
}

export default function Dropzone({ onDrop, acceptedTypes, file, maxSize, onError }: DropzoneProps) {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onDrop(acceptedFiles);
    }
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      [acceptedTypes]: []
    },
    maxSize,
    multiple: false,
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        onError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      } else if (error.code === 'file-invalid-type') {
        onError(`Invalid file type. Please upload ${acceptedTypes} files`);
      } else {
        onError(error.message);
      }
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        ${file ? 'border-green-500 bg-green-50' : ''}`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="text-green-700">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
      ) : (
        <div className="text-gray-600">
          <p className="font-medium">
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-sm mt-1">
            Accepted formats: {acceptedTypes}
          </p>
          <p className="text-sm">
            Max size: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      )}
    </div>
  );
} 