'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { RubricForm } from '@/components/rubric/RubricForm'
import { Skeleton } from '@/components/ui/skeleton'

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

export default function EditRubricPage() {
  const params = useParams()
  const router = useRouter()
  const [rubric, setRubric] = useState<Rubric | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userId = 'CURRENT_USER_ID' // Replace with actual auth context

  useEffect(() => {
    const fetchRubric = async () => {
      try {
        const { data, error } = await supabase
          .from('rubrics')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', userId)
          .single()

        if (error) throw error
        if (!data) throw new Error('Rubric not found')

        setRubric(data)
      } catch (err) {
        console.error('Error fetching rubric:', err)
        setError(err instanceof Error ? err.message : 'Failed to load rubric')
      } finally {
        setLoading(false)
      }
    }

    fetchRubric()
  }, [params.id, userId])

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{error}</p>
          <button
            onClick={() => router.push('/dashboard/rubrics/view')}
            className="mt-4 text-sm underline"
          >
            Back to Rubrics
          </button>
        </div>
      </div>
    )
  }

  if (!rubric) {
    return (
      <div className="container py-8">
        <div className="bg-muted p-4 rounded-md">
          <p>Rubric not found or you don't have permission to edit it.</p>
          <button
            onClick={() => router.push('/dashboard/rubrics/view')}
            className="mt-4 text-sm underline"
          >
            Back to Rubrics
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">Edit Rubric</h1>
      <RubricForm initialRubric={rubric} userId={userId} />
    </div>
  )
} 