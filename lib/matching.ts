import type { Rubric, MatchResult } from "@/types/rubric";

export async function matchStudentResponse(text: string, rubric: Rubric): Promise<MatchResult[]> {
  return rubric.criteria.map(criteria => {
    // Check if any keywords match
    const matched = criteria.keywords?.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    ) ?? false;

    const matchResult: MatchResult = {
      code: criteria.code,
      type: criteria.type,
      match: matched,
      confidence: matched ? 1.0 : 0.0,
      reason: matched 
        ? `Found evidence of: ${criteria.description}`
        : `Missing: ${criteria.description}`,
      comment: matched 
        ? `Matched keywords: ${criteria.keywords?.filter(k => 
            text.toLowerCase().includes(k.toLowerCase())
          ).join(", ")}`
        : undefined,
      writtenFeedback: criteria.type === 'written' ? {
        keywords: criteria.keywords || [],
        matchedKeywords: criteria.keywords?.filter(k => 
          text.toLowerCase().includes(k.toLowerCase())
        )
      } : undefined,
      steps: criteria.type === 'math' ? [{
        isFinalStep: true,
        expected: parseFloat(criteria.answer || "0"),
        unit: criteria.unit,
        tolerance: criteria.tolerance
      }] : undefined
    };

    return matchResult;
  });
} 