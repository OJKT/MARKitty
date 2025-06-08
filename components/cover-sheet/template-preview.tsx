"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { CoverSheetData } from "@/lib/types/cover-sheet";

interface TemplatePreviewProps {
  template: string;
  data: CoverSheetData;
}

export function TemplatePreview({ template, data }: TemplatePreviewProps) {
  const highlightedContent = useMemo(() => {
    let content = template;
    
    // Replace merge tags with actual values and highlight them
    Object.entries(data).forEach(([key, value]) => {
      const tag = `{{${key}}}`;
      content = content.replace(
        new RegExp(tag, 'g'),
        `<mark class="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">${value}</mark>`
      );
    });

    return content;
  }, [template, data]);

  return (
    <Card className="p-6 bg-white dark:bg-gray-900">
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
      />
    </Card>
  );
} 