import { Rubric, MatchResult, MathStep } from './types/matching'

/**
 * Extracts numeric values from text, handling various formats
 * @param text The text to extract numbers from
 * @returns Array of numbers found in the text
 */
function extractNumbers(text: string): number[] {
  // Handle scientific notation, decimals, and negative numbers
  const regex = /[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g
  return (text.match(regex) || []).map(Number)
}

/**
 * Checks if a unit is present in the text
 * @param text The text to check
 * @param unit The unit to look for
 * @returns Whether the unit was found
 */
function checkUnit(text: string, unit: string): boolean {
  const normalizedText = text.toLowerCase().replace(/\s+/g, '')
  const normalizedUnit = unit.toLowerCase().replace(/\s+/g, '')
  
  // Handle common unit variations
  const unitVariations = [
    normalizedUnit,
    normalizedUnit + 's', // plural
    normalizedUnit.replace('meter', 'm'),
    normalizedUnit.replace('gram', 'g'),
    normalizedUnit.replace('second', 's'),
  ]

  return unitVariations.some(u => normalizedText.includes(u))
}

/**
 * Matches a math step against student response
 * @param studentResponse The student's answer text
 * @param step The math step to check
 * @returns Match details
 */
function matchMathStep(studentResponse: string, step: MathStep): {
  match: boolean
  reason?: string
  confidence: number
} {
  const numbers = extractNumbers(studentResponse)
  const tolerance = parseFloat(step.tolerance?.replace(/[^\d.]/g, '') || '5')
  
  // Find any number within the tolerance range
  const matchedNumber = numbers.find(n => {
    const percentDiff = Math.abs((n - step.expected) / step.expected) * 100
    return percentDiff <= tolerance
  })

  if (matchedNumber === undefined) {
    return {
      match: false,
      reason: `No value found within ±${tolerance}% of expected ${step.expected}`,
      confidence: 0
    }
  }

  // If unit is required, check for it
  if (step.unit) {
    const hasUnit = checkUnit(studentResponse, step.unit)
    if (!hasUnit) {
      return {
        match: false,
        reason: `Found correct value (${matchedNumber}) but missing or incorrect unit. Expected: ${step.unit}`,
        confidence: 0.5
      }
    }
  }

  return {
    match: true,
    reason: `Found ${matchedNumber} within tolerance${step.unit ? ` with correct unit (${step.unit})` : ''}`,
    confidence: 1.0
  }
}

/**
 * Matches written response against keywords and phrases
 * @param studentResponse The student's answer text
 * @param keywords Array of required keywords
 * @param threshold Minimum ratio of keywords required (0-1)
 * @returns Match details
 */
function matchWrittenResponse(
  studentResponse: string,
  keywords: string[],
  threshold = 0.75
): {
  match: boolean
  reason?: string
  confidence: number
} {
  const normalizedResponse = studentResponse.toLowerCase()
  const matched = keywords.filter(word => 
    normalizedResponse.includes(word.toLowerCase())
  )
  
  const matchRatio = matched.length / keywords.length
  const isMatch = matchRatio >= threshold

  return {
    match: isMatch,
    reason: isMatch
      ? `Found ${matched.length}/${keywords.length} required keywords`
      : `Missing keywords: ${keywords.filter(w => !matched.includes(w)).join(', ')}`,
    confidence: matchRatio
  }
}

/**
 * Main function to match student response against a rubric
 * @param studentResponse The student's answer text
 * @param rubric The rubric to match against
 * @returns Array of match results for each criterion
 */
export function matchStudentResponse(
  studentResponse: string,
  rubric: Rubric
): MatchResult[] {
  const results: MatchResult[] = []

  for (const criterion of rubric.criteria) {
    const result: MatchResult = {
      code: criterion.code,
      match: false,
      confidence: 0
    }

    if (criterion.type === 'math' && criterion.steps) {
      // For math criteria, find and check the final step
      const finalStep = criterion.steps.find(step => step.isFinalStep)
      if (!finalStep) {
        result.reason = 'No final step defined in criterion'
        results.push(result)
        continue
      }

      const mathMatch = matchMathStep(studentResponse, finalStep)
      result.match = mathMatch.match
      result.reason = mathMatch.reason
      result.confidence = mathMatch.confidence
      result.comment = mathMatch.match
        ? finalStep.description
        : `Expected ${finalStep.expected}${finalStep.unit ? ' ' + finalStep.unit : ''}`
    }

    if (criterion.type === 'written' && criterion.writtenFeedback) {
      // For written criteria, check against keywords
      const keywords = criterion.writtenFeedback.keywords || 
        criterion.writtenFeedback.successComment
          .toLowerCase()
          .match(/\b\w+\b/g) || []

      const writtenMatch = matchWrittenResponse(studentResponse, keywords)
      result.match = writtenMatch.match
      result.reason = writtenMatch.reason
      result.confidence = writtenMatch.confidence
      result.comment = writtenMatch.match
        ? criterion.writtenFeedback.successComment
        : criterion.writtenFeedback.improvementComment
    }

    results.push(result)
  }

  return results
}

/**
 * Utility function to format match results for display
 * @param results Array of match results
 * @returns Formatted string with results summary
 */
export function formatMatchResults(results: MatchResult[]): string {
  const matched = results.filter(r => r.match)
  const summary = `Matched ${matched.length}/${results.length} criteria\n\n`
  
  const details = results
    .map(r => {
      const status = r.match ? '✅' : '❌'
      return `${status} ${r.code}: ${r.reason}\n${r.comment ? `   → ${r.comment}\n` : ''}`
    })
    .join('\n')

  return summary + details
} 