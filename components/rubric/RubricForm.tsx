'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

interface Criterion {
  text: string
  code?: string
  steps?: string[]
}

interface Rubric {
  id: string
  user_id: string
  title: string
  criteria: Criterion[]
  created_at: string
}

interface RubricFormProps {
  initialRubric?: Rubric
  userId: string
}

export function RubricForm({ initialRubric, userId }: RubricFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialRubric?.title || '')
  const [criteria, setCriteria] = useState<Criterion[]>(initialRubric?.criteria || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      if (initialRubric) {
        // Update existing rubric
        const { error } = await supabase!
          .from('rubrics')
          .update({
            title,
            criteria,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialRubric.id)
          .eq('user_id', userId)

        if (error) throw error
        toast({
          title: 'Rubric updated',
          description: 'Your rubric has been successfully updated.',
        })
      } else {
        // Create new rubric
        const { error } = await supabase!
          .from('rubrics')
          .insert([
            {
              title,
              criteria,
              user_id: userId,
            },
          ])

        if (error) throw error
        toast({
          title: 'Rubric created',
          description: 'Your new rubric has been created successfully.',
        })
      }

      router.push('/dashboard/rubrics/view')
      router.refresh()
    } catch (error) {
      console.error('Error saving rubric:', error)
      toast({
        title: 'Error',
        description: 'There was an error saving your rubric. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addCriterion = () => {
    setCriteria([...criteria, { text: '', code: '', steps: [] }])
  }

  const updateCriterion = (index: number, field: keyof Criterion, value: string | string[]) => {
    const newCriteria = [...criteria]
    newCriteria[index] = { ...newCriteria[index], [field]: value }
    setCriteria(newCriteria)
  }

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Rubric Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
          placeholder="Enter rubric title"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Criteria</h3>
          <Button type="button" variant="outline" onClick={addCriterion}>
            Add Criterion
          </Button>
        </div>

        {criteria.map((criterion, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <Input
                  value={criterion.text}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCriterion(index, 'text', e.target.value)}
                  placeholder="Criterion description"
                  required
                />
                <Textarea
                  value={criterion.code || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateCriterion(index, 'code', e.target.value)}
                  placeholder="Code example (optional)"
                  rows={3}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => removeCriterion(index)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/rubrics/view')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialRubric ? 'Update Rubric' : 'Create Rubric'}
        </Button>
      </div>
    </form>
  )
} 