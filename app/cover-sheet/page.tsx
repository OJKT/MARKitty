"use client";

import { CoverSheetBuilder } from "@/components/cover-sheet/cover-sheet-builder";

export default function CoverSheetPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Cover Sheet Generator</h1>
      <CoverSheetBuilder />
    </div>
  );
} 