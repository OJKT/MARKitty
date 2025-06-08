'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { toast } from '@/components/ui/use-toast'

interface Criterion {
  text: string
  code?: string
  steps?: string[]
}

interface Rubric {
  id: string
  title: string
  criteria: Criterion[]
  created_at: string
  user_id: string
}

interface RubricListPageProps {
  onSelectRubric?: (rubric: Rubric) => void
}

export default function RubricsViewPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <img
          src="/f02701dc-762b-4331-ae8c-51f23dcde578.png"
          alt="Construction"
          className="w-full h-auto"
        />
        <h1 className="text-center mt-6 text-xl font-semibold">
          This page is under construction
        </h1>
      </div>
    </div>
  )
} 