import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MainNav } from '@/components/main-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MarKitty Cover Sheet Generator',
  description: 'Generate professional cover sheets for your assignments',
}

function LoadingFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}

function GlobalError({ error }: { error: Error }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">We're working on fixing this issue.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary fallback={<GlobalError error={new Error('Application Error')} />}>
          <Suspense fallback={<LoadingFallback />}>
            <MainNav />
          </Suspense>
          <div className="flex-1">
            <ErrorBoundary fallback={<GlobalError error={new Error('Content Error')} />}>
              <Suspense fallback={<LoadingFallback />}>
                {children}
              </Suspense>
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
} 