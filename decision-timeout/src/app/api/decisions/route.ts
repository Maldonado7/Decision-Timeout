import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { DecisionsService } from '@/lib/services/decisions'
import { createDecisionRateLimit, decisionsRateLimit } from '@/lib/api/rate-limit'

const createDecisionSchema = z.object({
  question: z.string()
    .min(1, 'Question is required')
    .max(500, 'Question must be less than 500 characters')
    .trim(),
  pros: z.array(z.string().trim().min(1))
    .min(1, 'At least one pro is required')
    .max(10, 'Maximum 10 pros allowed'),
  cons: z.array(z.string().trim().min(1))
    .min(1, 'At least one con is required')
    .max(10, 'Maximum 10 cons allowed'),
  result: z.enum(['YES', 'NO'], {
    errorMap: () => ({ message: 'Result must be either YES or NO' })
  }),
  time_saved: z.number()
    .int('Time saved must be an integer')
    .min(1, 'Time saved must be at least 1 minute')
    .max(1440, 'Time saved cannot exceed 24 hours (1440 minutes)')
})

export async function POST(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimitResult = await createDecisionRateLimit(request)
    if (rateLimitResult.isRateLimited) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter.toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimitResult.remainingRequests.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      )
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const validatedData = createDecisionSchema.parse(body)
    
    const sanitizedData = {
      question: validatedData.question.replace(/<[^>]*>/g, ''), // Remove HTML tags
      pros: validatedData.pros.map(pro => pro.replace(/<[^>]*>/g, '')),
      cons: validatedData.cons.map(con => con.replace(/<[^>]*>/g, '')),
      result: validatedData.result,
      time_saved: validatedData.time_saved
    }

    const decision = await DecisionsService.createDecision(sanitizedData)
    
    return NextResponse.json(decision, { status: 201 })
  } catch (error) {
    console.error('Error creating decision:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check rate limit first
    const rateLimitResult = await decisionsRateLimit(request)
    if (rateLimitResult.isRateLimited) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter.toString(),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimitResult.remainingRequests.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      )
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decisions = await DecisionsService.getUserDecisions()
    
    return NextResponse.json(decisions)
  } catch (error) {
    console.error('Error fetching decisions:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}