"use client"

import Link from 'next/link'
import { ClipboardEdit, FileText, List, BarChart3 } from 'lucide-react'

function FeatureCard({ 
  href, 
  icon: Icon, 
  title, 
  description 
}: { 
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string 
}) {
  return (
    <Link href={href}>
      <div className="p-6 border rounded-lg hover:border-primary transition-colors">
        <Icon className="h-8 w-8 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}

export default function Home() {
  const features = [
    {
      href: '/rubrics/new',
      icon: ClipboardEdit,
      title: 'Create Rubric',
      description: 'Design and create new assessment rubrics.',
    },
    {
      href: '/dashboard/rubrics',
      icon: BarChart3,
      title: 'Rubrics Dashboard',
      description: 'Access and manage your rubrics.',
    },
    {
      href: '/rubrics/ocr-test',
      icon: List,
      title: 'OCR Scanner',
      description: 'Scan and process rubrics using OCR.',
    },
    {
      href: '/cover-sheet',
      icon: FileText,
      title: 'Cover Sheet',
      description: 'Generate professional cover sheets.',
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome to MarKitty</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your all-in-one solution for managing rubrics and generating cover sheets.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {features.map((feature) => (
            <FeatureCard key={feature.href} {...feature} />
          ))}
        </div>
      </div>
    </main>
  )
} 