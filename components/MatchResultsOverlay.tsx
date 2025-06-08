'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rubric, MatchResult } from '@/lib/types/matching'

interface Props {
  studentResponse: string
  matchResults: MatchResult[]
  rubric: Rubric
}

export function MatchResultsOverlay({ studentResponse, matchResults, rubric }: Props) {
  const [highlightedText, setHighlightedText] = useState(studentResponse)

  useEffect(() => {
    let text = studentResponse

    // Find positions of matched terms for highlighting
    const searchTerms = rubric.criteria.flatMap(criterion => {
      if (criterion.type === 'math') {
        return [criterion.answer || '', criterion.unit || ''].filter(Boolean)
      }
      if (criterion.type === 'written') {
        return criterion.keywords || []
      }
      return []
    })

    // Sort terms by length (descending) to handle overlapping matches
    const sortedTerms = searchTerms.sort((a, b) => b.length - a.length)

    // Create a regex pattern that matches any of the search terms
    const pattern = new RegExp(
      sortedTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
      'gi'
    )

    // Replace matches with highlighted versions
    text = text.replace(pattern, match => `<mark>${match}</mark>`)

    setHighlightedText(text)
  }, [studentResponse, rubric])

  return (
    <Card className="p-4 space-y-4">
      <div
        className="font-mono whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />

      <div className="space-y-2">
        {matchResults.map((result, index) => (
          <div key={index} className="flex items-start gap-2">
            <Badge variant={result.match ? 'default' : 'secondary'}>
              {result.code}
            </Badge>
            <div className="text-sm">
              <p>{result.reason}</p>
              {result.comment && (
                <p className="text-muted-foreground mt-1">{result.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
} 