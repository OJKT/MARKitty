"use client";

import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AnnotatedResponse } from "@/components/AnnotatedResponse";
import { X, Upload, FileText } from "lucide-react";
import type { Rubric, MatchResult } from "@/types/rubric";

interface StudentFileUploaderProps {
  rubric: Rubric;
  onTextExtracted?: (text: string) => void;
  mode?: "image" | "auto";
  onLoading?: (loading: boolean) => void;
  onResultsChange?: (results: MatchResult[]) => void;
}

export function StudentFileUploader({
  rubric,
  onTextExtracted,
  mode = "auto",
  onLoading,
  onResultsChange
}: StudentFileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = useCallback(async (imageFile: File) => {
    try {
      const worker = await createWorker();
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (!e.target?.result) return;
        
        try {
          const tesseractWorker = worker as any;
          await tesseractWorker.loadLanguage("eng");
          await tesseractWorker.initialize("eng");
          const { data: { text } } = await tesseractWorker.recognize(e.target.result as string);
          
          setExtractedText(text);
          onTextExtracted?.(text);
        } catch (ocrError) {
          console.error("OCR Error:", ocrError);
          setError("Failed to extract text from image");
        } finally {
          await worker.terminate();
        }
      };
      
      reader.readAsDataURL(imageFile);
    } catch (err) {
      console.error("Image processing error:", err);
      setError("Failed to process image");
    }
  }, [onTextExtracted]);

  const processDocument = useCallback(async (docFile: File) => {
    // For MVP, just show unsupported message for PDFs and DOCXs
    if (docFile.type === "application/pdf") {
      setError("PDF processing is not supported yet. Please convert to image or copy text manually.");
    } else if (docFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      setError("DOCX processing is not supported yet. Please convert to image or copy text manually.");
    }
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);
    onLoading?.(true);

    try {
      if (selectedFile.type.startsWith("image/")) {
        await processImage(selectedFile);
      } else {
        await processDocument(selectedFile);
      }
    } finally {
      setIsProcessing(false);
      onLoading?.(false);
    }
  }, [processImage, processDocument, onLoading]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setExtractedText("");
    setError(null);
    onTextExtracted?.("");
  }, [onTextExtracted]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf,.docx"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="flex-1"
        />
        {file && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleRemoveFile}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {file && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{file.name}</span>
        </div>
      )}

      {isProcessing && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      {extractedText && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Extracted Text:
          </label>
          <Textarea
            value={extractedText}
            readOnly
            rows={5}
            className="w-full font-mono text-sm"
          />
        </div>
      )}
    </Card>
  );
} 