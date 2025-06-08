export interface RubricCriteria {
  id: string;
  code: string;
  type: 'math' | 'written';
  points: number;
  description: string;
  answer?: string;
  keywords?: string[];
  tolerance?: number;
  unit?: string;
}

export interface Rubric {
  id: string;
  title: string;
  criteria: RubricCriteria[];
}

export interface MathStep {
  isFinalStep: boolean;
  expected: number;
  unit?: string;
  tolerance?: number;
}

export interface WrittenFeedback {
  keywords: string[];
  matchedKeywords?: string[];
  requiredKeywordCount?: number;
}

export interface MatchResult {
  code: string;
  match: boolean;
  reason: string;
  comment?: string;
  confidence: number;
  type: 'math' | 'written';
  steps?: MathStep[];
  writtenFeedback?: WrittenFeedback;
}

export interface AnnotatedResponseProps {
  matchResult: MatchResult;
  showInline?: boolean;
} 