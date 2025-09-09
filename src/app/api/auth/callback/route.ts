import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // This route is used by Clerk for authentication callbacks
  // The actual handling is done by Clerk's middleware
  return new Response('OK', { status: 200 })
}

export async function POST(request: NextRequest) {
  // Handle POST requests for authentication callbacks
  return new Response('OK', { status: 200 })
}