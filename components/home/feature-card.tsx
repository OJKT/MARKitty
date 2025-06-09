'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps { 
  href: string
  icon: LucideIcon
  title: string
  description: string 
}

export function FeatureCard({ href, icon: Icon, title, description }: FeatureCardProps) {
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