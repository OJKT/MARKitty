'use client'

import { AnnotatedResponse } from '@/components/AnnotatedResponse'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MatchResult } from '@/lib/types/matching'

const SAMPLE_RESPONSE = `The force needed to accelerate a 2kg mass at 5 m/s² is 10N. This is because according to Newton's Second Law, F = ma, where m is the mass and a is the acceleration. When we plug in the values:

F = 2kg × 5 m/s²
F = 10N

The force is applied in the positive direction, causing the object to accelerate forward. The units are in Newtons (N) which is the SI unit for force.`

const SAMPLE_RESULTS: MatchResult[] = [
  {
    code: 'MATH-1',
    match: true,
    reason: 'Correct calculation of force using F = ma',
    comment: 'Perfect application of Newton\'s Second Law with correct units',
    confidence: 1.0,
    type: 'math',
    steps: [
      {
        isFinalStep: true,
        expected: 10,
        unit: 'N'
      }
    ]
  },
  {
    code: 'CONCEPT-1',
    match: true,
    reason: 'Correctly identified Newton\'s Second Law',
    comment: 'Good explanation of the relationship between force, mass, and acceleration',
    confidence: 0.95,
    type: 'written',
    writtenFeedback: {
      keywords: ['Newton\'s Second Law', 'F = ma']
    }
  },
  {
    code: 'UNITS-1',
    match: true,
    reason: 'Correct use of SI units',
    comment: 'Properly identified Newtons as the SI unit for force',
    confidence: 0.9,
    type: 'written',
    writtenFeedback: {
      keywords: ['Newtons', 'N', 'SI unit']
    }
  }
]

export default function TestFeedbackPage() {
  return (
    <div className="container py-8 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>Feedback Display Demo</CardTitle>
          <CardDescription>
            Toggle between inline and sidebar feedback modes to see different ways of viewing annotations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnotatedResponse
            studentResponse={SAMPLE_RESPONSE}
            matchResults={SAMPLE_RESULTS}
            rubric={{
              id: 'demo',
              title: 'Newton\'s Laws Demo',
              criteria: []
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
} 