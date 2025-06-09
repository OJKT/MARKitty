import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Only try to connect if we have the environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing Supabase environment variables',
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, { status: 500 })
    }

    // Create a temporary client for testing
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Try to make a simple query
    const { data, error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Supabase',
      data
    })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error testing Supabase connection',
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 })
  }
} 