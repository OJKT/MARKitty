"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CoverSheetBuilder } from '@/components/cover-sheet/cover-sheet-builder'

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    async function checkConnection() {
      try {
        if (!supabase) {
          setConnectionStatus('error')
          return
        }
        
        // Try to fetch something simple from Supabase
        const { data, error } = await supabase.from('profiles').select('count').limit(1)
        
        if (error) {
          console.error('Supabase connection error:', error)
          setConnectionStatus('error')
        } else {
          setConnectionStatus('connected')
        }
      } catch (err) {
        console.error('Connection test error:', err)
        setConnectionStatus('error')
      }
    }

    checkConnection()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">MarKitty Cover Sheet Generator</h1>
        
        <div className="mb-8">
          <h2 className="text-xl mb-2">Supabase Connection Status:</h2>
          <div className={`p-4 rounded ${
            connectionStatus === 'checking' ? 'bg-yellow-100' :
            connectionStatus === 'connected' ? 'bg-green-100' :
            'bg-red-100'
          }`}>
            {connectionStatus === 'checking' && 'Checking connection...'}
            {connectionStatus === 'connected' && '✅ Connected to Supabase'}
            {connectionStatus === 'error' && '❌ Error connecting to Supabase'}
          </div>
        </div>

        <CoverSheetBuilder />
      </div>
    </main>
  )
} 