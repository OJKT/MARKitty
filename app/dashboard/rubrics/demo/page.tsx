'use client'

import { useState } from 'react'
import { MatchResultsOverlay } from '@/components/MatchResultsOverlay'
import { matchStudentResponse } from '@/lib/matchEngine'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ChangeEvent } from 'react'
import type { Rubric } from '@/lib/types/matching'

// Sample rubric for demo
const sampleRubric: Rubric = {
  id: 'demo-1',
  title: 'Physics Problem Set 1',
  criteria: [
    {
      id: 'P1',
      code: 'P1',
      type: 'math',
      points: 5,
      description: 'Calculate gravitational acceleration',
      answer: '9.81 m/s²',
      tolerance: 5,
      unit: 'm/s²'
    },
    {
      id: 'P2',
      code: 'P2',
      type: 'written',
      points: 5,
      description: 'Explain Newton\'s laws of motion',
      keywords: ['force', 'mass', 'acceleration', 'newton', 'law']
    }
  ]
}

const sampleResponses = [
  {
    label: 'Correct Answer',
    text: 'The acceleration due to gravity is 9.8 m/s². This demonstrates Newton\'s law of universal gravitation, showing how force, mass, and acceleration are related.'
  },
  {
    label: 'Partially Correct',
    text: 'Gravity makes things fall at 9.8 meters per second squared.'
  },
  {
    label: 'Incorrect Answer',
    text: 'Things fall because of gravity, which is about 5 m/s.'
  }
]

export default function RubricDemoPage() {
  const [studentResponse, setStudentResponse] = useState(sampleResponses[0].text)
  const matchResults = matchStudentResponse(studentResponse, sampleRubric)

  const handleResponseChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setStudentResponse(e.target.value)
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Rubric Matching Demo</h1>
        <p className="text-muted-foreground">
          This demo shows how the rubric matching engine works with both mathematical
          and written responses.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Sample Responses</h2>
        <div className="flex flex-wrap gap-2">
          {sampleResponses.map((response, i) => (
            <Button
              key={i}
              variant={studentResponse === response.text ? 'default' : 'outline'}
              onClick={() => setStudentResponse(response.text)}
            >
              {response.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Student Response</h2>
        <Textarea
          value={studentResponse}
          onChange={handleResponseChange}
          rows={4}
          className="font-mono"
          placeholder="Type or paste student response here..."
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Match Results</h2>
        <MatchResultsOverlay
          studentResponse={studentResponse}
          matchResults={matchResults}
          rubric={sampleRubric}
        />
      </div>
    </div>
  )
} 