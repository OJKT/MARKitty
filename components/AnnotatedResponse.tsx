'use client'

import React, { useState } from 'react'
import { MatchResult, Rubric } from '@/lib/types/matching'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnnotatedResponseProps {
  studentResponse: string
  matchResults: MatchResult[]
  rubric: Rubric
  mode?: 'inline' | 'sidebar'
  onModeChange?: (mode: 'inline' | 'sidebar') => void
}

interface AnnotationPin {
  id: number
  index: number
  result: MatchResult
  matchedText: string
}

function findMatchPositions(text: string, searchTerms: string[]): { term: string; index: number }[] {
  const positions: { term: string; index: number }[] = []
  const lowerText = text.toLowerCase()

  searchTerms.forEach(term => {
    let index = 0
    const lowerTerm = term.toLowerCase()
    
    while ((index = lowerText.indexOf(lowerTerm, index)) !== -1) {
      positions.push({ term, index })
      index += term.length
    }
  })

  return positions.sort((a, b) => a.index - b.index)
}

export function AnnotatedResponse({
  studentResponse,
  matchResults,
  rubric,
  mode: initialMode = 'inline',
  onModeChange,
}: AnnotatedResponseProps) {
  const [mode, setMode] = useState<'inline' | 'sidebar'>(initialMode)

  const handleModeChange = (newMode: 'inline' | 'sidebar') => {
    setMode(newMode)
    onModeChange?.(newMode)
  }

  // Generate annotation pins from match results
  const generatePins = (): AnnotationPin[] => {
    const pins: AnnotationPin[] = []
    let pinId = 1

    matchResults.forEach(result => {
      // Find matched terms or values in the text
      const searchTerms = []
      
      if (result.type === 'math' && result.steps) {
        const finalStep = result.steps.find(step => step.isFinalStep)
        if (finalStep) {
          searchTerms.push(finalStep.expected.toString())
          if (finalStep.unit) searchTerms.push(finalStep.unit)
        }
      }
      
      if (result.type === 'written' && result.writtenFeedback?.keywords) {
        searchTerms.push(...result.writtenFeedback.keywords)
      }

      const positions = findMatchPositions(studentResponse, searchTerms)
      
      positions.forEach(({ term, index }) => {
        pins.push({
          id: pinId++,
          index,
          result,
          matchedText: term,
        })
      })
    })

    return pins.sort((a, b) => a.index - b.index)
  }

  const pins = generatePins()

  const renderInlineView = () => {
    let lastIndex = 0
    const segments: JSX.Element[] = []

    pins.forEach((pin, i) => {
      // Add text before the match
      if (pin.index > lastIndex) {
        segments.push(
          <span key={`text-${i}`}>
            {studentResponse.slice(lastIndex, pin.index)}
          </span>
        )
      }

      // Add the highlighted match with tooltip
      segments.push(
        <TooltipProvider key={`match-${i}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <mark
                className={cn(
                  'px-1 rounded not-italic',
                  pin.result.match
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                )}
              >
                {studentResponse.slice(pin.index, pin.index + pin.matchedText.length)}
                <Badge
                  variant={pin.result.match ? 'success' : 'error'}
                  className="ml-1 text-[10px]"
                >
                  {pin.result.code}
                </Badge>
              </mark>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{pin.result.reason}</p>
              {pin.result.comment && (
                <p className="text-sm text-muted-foreground mt-1">{pin.result.comment}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      lastIndex = pin.index + pin.matchedText.length
    })

    // Add remaining text
    if (lastIndex < studentResponse.length) {
      segments.push(
        <span key="text-end">
          {studentResponse.slice(lastIndex)}
        </span>
      )
    }

    return segments
  }

  const renderSidebarView = () => {
    let lastIndex = 0
    const segments: JSX.Element[] = []

    pins.forEach((pin, i) => {
      // Add text before the pin
      if (pin.index > lastIndex) {
        segments.push(
          <span key={`text-${i}`}>
            {studentResponse.slice(lastIndex, pin.index)}
          </span>
        )
      }

      // Add the pin marker
      segments.push(
        <sup
          key={`pin-${i}`}
          className={cn(
            'font-mono text-xs cursor-pointer select-none',
            pin.result.match ? 'text-green-600' : 'text-red-600'
          )}
          onClick={() => {
            document.getElementById(`comment-${pin.id}`)?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }}
        >
          [{pin.id}]
        </sup>
      )

      lastIndex = pin.index + pin.matchedText.length
    })

    // Add remaining text
    if (lastIndex < studentResponse.length) {
      segments.push(
        <span key="text-end">
          {studentResponse.slice(lastIndex)}
        </span>
      )
    }

    return (
      <div className="grid grid-cols-[1fr,300px] gap-6">
        <div className="space-y-4">
          <div className="bg-card text-card-foreground p-4 rounded-lg border">
            <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans">
              {segments}
            </pre>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-3 pr-4">
            {pins.map((pin) => (
              <div
                key={pin.id}
                id={`comment-${pin.id}`}
                className={cn(
                  'p-3 rounded-lg border',
                  pin.result.match ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10'
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs mt-1">[{pin.id}]</span>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={pin.result.match ? 'success' : 'error'}>
                        {pin.result.code}
                      </Badge>
                      <span className="font-medium text-sm">{pin.result.reason}</span>
                    </div>
                    {pin.result.comment && (
                      <p className="text-sm text-muted-foreground">{pin.result.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'inline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('inline')}
          >
            <Eye className="w-4 h-4 mr-1" />
            Inline View
          </Button>
          <Button
            variant={mode === 'sidebar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleModeChange('sidebar')}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Sidebar View
          </Button>
        </div>
      </div>

      {mode === 'inline' ? (
        <div className="bg-card text-card-foreground p-4 rounded-lg border">
          <pre className="whitespace-pre-wrap text-base leading-relaxed font-sans">
            {renderInlineView()}
          </pre>
        </div>
      ) : (
        renderSidebarView()
      )}
    </div>
  )
} 