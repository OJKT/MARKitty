"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { AnnotatedResponse } from "@/components/AnnotatedResponse";
import type { Rubric, MatchResult } from "@/types/rubric";
import { matchStudentResponse } from "@/lib/matching";

interface TextInputScannerProps {
  rubric: Rubric;
  mode?: "inline" | "sidebar";
  defaultMode?: "inline";
  onResultsChange?: (results: MatchResult[]) => void;
}

export function TextInputScanner({
  rubric,
  mode = "inline",
  defaultMode = "inline",
  onResultsChange
}: TextInputScannerProps) {
  const [text, setText] = useState("");
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

  const handleTextChange = useCallback(async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Live analysis
    if (newText.trim()) {
      try {
        const results = await matchStudentResponse(newText, rubric);
        setMatchResults(results);
        onResultsChange?.(results);
      } catch (err) {
        console.error("Analysis error:", err);
      }
    } else {
      setMatchResults([]);
      onResultsChange?.([]);
    }
  }, [rubric, onResultsChange]);

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter student response here..."
        rows={5}
        className="w-full"
      />

      {matchResults.length > 0 && mode === "inline" && (
        <div className="mt-4">
          <AnnotatedResponse 
            studentResponse={text}
            matchResults={matchResults}
            rubric={rubric}
            mode={mode}
          />
        </div>
      )}
    </div>
  );
} 