export interface Rubric {
  id: string
  title: string
  criteria: RubricCriterion[]
}

export interface RubricCriterion {
  id: string
  code: string
  type: 'math' | 'written'
  points: number
  description: string
  answer?: string
  keywords?: string[]
  tolerance?: number
  unit?: string
}

export interface MathStep {
  isFinalStep: boolean
  expected: number
  unit?: string
  tolerance?: number
}

export interface WrittenFeedback {
  keywords: string[]
  matchedKeywords?: string[]
  requiredKeywordCount?: number
}

export interface MatchResult {
  code: string
  match: boolean
  reason: string
  comment?: string
  confidence: number
  type: 'math' | 'written'
  steps?: MathStep[]
  writtenFeedback?: WrittenFeedback
} 