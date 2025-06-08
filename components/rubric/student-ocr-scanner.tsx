"use client";

import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AnnotatedResponse } from "@/components/AnnotatedResponse";
import type { Rubric, MatchResult } from "@/types/rubric";
import { matchStudentResponse } from "@/lib/matching";

interface StudentOCRScannerProps {
  rubric: Rubric;
  mode?: "inline" | "sidebar";
  defaultMode?: "inline";
  onResultsChange?: (results: MatchResult[]) => void;
}

export function StudentOCRScanner({
  rubric,
  mode = "inline",
  defaultMode = "inline",
  onResultsChange
}: StudentOCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

  const processImage = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Create Tesseract worker
      const worker = await createWorker();
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (!e.target?.result) return;
        
        try {
          // Recognize text from image
          const tesseractWorker = worker as any; // Type assertion for Tesseract methods
          await tesseractWorker.loadLanguage("eng");
          await tesseractWorker.initialize("eng");
          const { data: { text } } = await tesseractWorker.recognize(e.target.result as string);
          
          setExtractedText(text);
          setEditedText(text);
          
          // Run matching
          try {
            const results = await matchStudentResponse(text, rubric);
            setMatchResults(results);
            onResultsChange?.(results);
          } catch (matchError) {
            console.error("Error matching response:", matchError);
            setError("Failed to analyze the extracted text");
          }
        } catch (ocrError) {
          console.error("OCR Error:", ocrError);
          setError("Failed to extract text from image");
        } finally {
          await worker.terminate();
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Processing error:", err);
      setError("Failed to process image");
      setIsProcessing(false);
    }
  }, [rubric, onResultsChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG)");
      return;
    }

    processImage(file);
  }, [processImage]);

  const handleResubmit = useCallback(async () => {
    setIsProcessing(true);
    try {
      const results = await matchStudentResponse(editedText, rubric);
      setMatchResults(results);
      onResultsChange?.(results);
    } catch (err) {
      console.error("Resubmit error:", err);
      setError("Failed to analyze the edited text");
    } finally {
      setIsProcessing(false);
    }
  }, [editedText, rubric, onResultsChange]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
  }, []);

  return (
    <Card className="p-4 space-y-4">
      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="w-full"
        />
      </div>

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
            Extracted Text (edit if needed):
          </label>
          <Textarea
            value={editedText}
            onChange={handleTextChange}
            rows={5}
            className="w-full"
          />
          <Button 
            onClick={handleResubmit}
            disabled={isProcessing || !editedText}
          >
            Reanalyze
          </Button>
        </div>
      )}

      {matchResults.length > 0 && mode === "inline" && (
        <div className="mt-4">
          <AnnotatedResponse 
            studentResponse={editedText}
            matchResults={matchResults}
            rubric={rubric}
            mode={mode}
          />
        </div>
      )}
    </Card>
  );
} 