"use client";

import { useState, useCallback, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TextInputScanner } from "./text-input-scanner";
import { StudentFileUploader } from "./student-file-uploader";
import { AnnotatedResponse } from "@/components/AnnotatedResponse";
import type { Rubric, MatchResult } from "@/types/rubric";
import { FileText, Image, Wand2 } from "lucide-react";
import { matchStudentResponse } from "@/lib/matching";

type InputMode = "text" | "image" | "auto";

interface RubricBuilderClientProps {
  rubric: Rubric;
}

const LOCAL_STORAGE_KEY = "preferred-input-mode";

export function RubricBuilderClient({ rubric }: RubricBuilderClientProps) {
  // Get initial mode from localStorage or default to "auto"
  const [inputMode, setInputMode] = useState<InputMode>(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem(LOCAL_STORAGE_KEY);
      return (savedMode === "text" || savedMode === "image" || savedMode === "auto") 
        ? savedMode 
        : "auto";
    }
    return "auto";
  });

  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [studentResponse, setStudentResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Save mode preference to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, inputMode);
  }, [inputMode]);

  const handleResultsChange = useCallback((results: MatchResult[], response: string) => {
    setMatchResults(results);
    setStudentResponse(response);
  }, []);

  const handleModeChange = useCallback((value: string) => {
    if (value === "text" || value === "image" || value === "auto") {
      setInputMode(value);
    }
  }, []);

  const handleTextExtracted = useCallback(async (text: string) => {
    setStudentResponse(text);
    if (text.trim()) {
      try {
        const results = await matchStudentResponse(text, rubric);
        setMatchResults(results);
      } catch (err) {
        console.error("Analysis error:", err);
      }
    } else {
      setMatchResults([]);
    }
  }, [rubric]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <RadioGroup
          value={inputMode}
          onValueChange={handleModeChange}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="text" id="text" />
            <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              Text Input
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="image" id="image" />
            <Label htmlFor="image" className="flex items-center gap-2 cursor-pointer">
              <Image className="w-4 h-4" />
              File Upload
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto" className="flex items-center gap-2 cursor-pointer">
              <Wand2 className="w-4 h-4" />
              Auto Detect
            </Label>
          </div>
        </RadioGroup>

        <div className="mt-6">
          {(inputMode === "text" || inputMode === "auto") && !isLoading && (
            <TextInputScanner
              rubric={rubric}
              mode="inline"
              onResultsChange={(results) => handleResultsChange(results, studentResponse)}
            />
          )}

          {(inputMode === "image" || inputMode === "auto") && (
            <StudentFileUploader
              rubric={rubric}
              mode={inputMode}
              onTextExtracted={handleTextExtracted}
              onLoading={setIsLoading}
              onResultsChange={(results) => handleResultsChange(results, studentResponse)}
            />
          )}
        </div>
      </Card>

      {matchResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
          <AnnotatedResponse
            studentResponse={studentResponse}
            matchResults={matchResults}
            rubric={rubric}
            mode="inline"
          />
        </Card>
      )}
    </div>
  );
} 