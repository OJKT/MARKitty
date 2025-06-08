"use client";

import { StudentOCRScanner } from "@/components/rubric/student-ocr-scanner";
import type { Rubric } from "@/types/rubric";

const sampleRubric: Rubric = {
  id: "sample-1",
  title: "Basic Math Problem",
  criteria: [
    {
      id: "step1",
      code: "SETUP",
      type: "written",
      points: 2,
      description: "Sets up the equation correctly",
      keywords: ["equation", "=", "x + y", "sum"]
    },
    {
      id: "step2",
      code: "SOLVE",
      type: "math",
      points: 3,
      description: "Solves for the correct answer",
      answer: "42",
      tolerance: 0.1,
      unit: "units"
    },
    {
      id: "step3",
      code: "EXPLAIN",
      type: "written",
      points: 2,
      description: "Explains the reasoning",
      keywords: ["because", "therefore", "since", "explanation"]
    }
  ]
};

export default function OCRTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">OCR Scanner Test</h1>
      <p className="text-gray-600 mb-6">
        Upload an image of a student's work to test the OCR scanner. The system will
        extract text and analyze it against the sample rubric.
      </p>
      
      <div className="bg-white rounded-lg shadow-sm">
        <StudentOCRScanner 
          rubric={sampleRubric}
          mode="inline"
        />
      </div>
    </div>
  );
} 