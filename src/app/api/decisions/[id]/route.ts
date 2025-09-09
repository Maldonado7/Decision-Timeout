import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { DecisionsService } from '@/lib/services/decisions'

const updateOutcomeSchema = z.object({
  outcome: z.enum(['good', 'bad'], {
    errorMap: () => ({ message: 'Outcome must be either "good" or "bad"' })
  })
})

const uuidSchema = z.string().uuid('Invalid decision ID format')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const validatedId = uuidSchema.parse(id)
    
    const decision = await DecisionsService.getDecision(validatedId)
    
    return NextResponse.json(decision)
  } catch (error) {
    console.error('Error fetching decision:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid decision ID',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      if (error.message.includes('No rows returned')) {
        return NextResponse.json(
          { error: 'Decision not found' },
          { status: 404 }
        )
      }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const validatedId = uuidSchema.parse(id)
    const body = await request.json()
    const validatedData = updateOutcomeSchema.parse(body)
    
    const updatedDecision = await DecisionsService.updateDecisionOutcome(
      validatedId,
      validatedData.outcome
    )
    
    return NextResponse.json(updatedDecision)
  } catch (error) {
    console.error('Error updating decision outcome:', error)
    
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
      if (error.message.includes('Decision is still locked')) {
        return NextResponse.json(
          { error: 'Decision is still locked and cannot be updated' },
          { status: 423 } // 423 Locked
        )
      }
      if (error.message.includes('No rows returned')) {
        return NextResponse.json(
          { error: 'Decision not found' },
          { status: 404 }
        )
      }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const validatedId = uuidSchema.parse(id)
    
    await DecisionsService.deleteDecision(validatedId)
    
    return NextResponse.json(
      { message: 'Decision deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting decision:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid decision ID',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      if (error.message.includes('No rows returned')) {
        return NextResponse.json(
          { error: 'Decision not found' },
          { status: 404 }
        )
      }
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