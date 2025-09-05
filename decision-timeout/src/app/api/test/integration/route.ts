import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { runAuthIntegrationTests } from '@/lib/test-auth-integration'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoints not available in production' },
      { status: 403 }
    )
  }

  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please sign in to run integration tests'
        },
        { status: 401 }
      )
    }

    console.log('🚀 Starting integration tests for user:', userId)

    const testResults = await runAuthIntegrationTests()

    return NextResponse.json({
      userId,
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasClerkPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
      },
      tests: testResults
    })
  } catch (error) {
    console.error('Integration test error:', error)
    
    return NextResponse.json(
      {
        error: 'Integration test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}