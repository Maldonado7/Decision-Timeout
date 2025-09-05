/**
 * Test script to verify Clerk + Supabase integration
 * This is for development/testing purposes only
 */

import { DecisionsService } from './services/decisions'

export interface AuthTestResult {
  success: boolean
  message: string
  details?: unknown
}

/**
 * Test basic decision creation flow
 */
export async function testDecisionCreation(): Promise<AuthTestResult> {
  try {
    const testDecision = {
      question: "Should I test this integration?",
      pros: ["Ensures everything works", "Catches bugs early"],
      cons: ["Takes time", "Might reveal issues"],
      result: 'YES' as const,
      time_saved: 30
    }

    const decision = await DecisionsService.createDecision(testDecision)
    
    return {
      success: true,
      message: "Decision created successfully",
      details: { decisionId: decision.id }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      details: { error }
    }
  }
}

/**
 * Test getting user decisions
 */
export async function testGetUserDecisions(): Promise<AuthTestResult> {
  try {
    const decisions = await DecisionsService.getUserDecisions()
    
    return {
      success: true,
      message: `Retrieved ${decisions.length} decisions`,
      details: { count: decisions.length }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      details: { error }
    }
  }
}

/**
 * Test getting user stats
 */
export async function testGetUserStats(): Promise<AuthTestResult> {
  try {
    const stats = await DecisionsService.getUserStats()
    
    return {
      success: true,
      message: "Retrieved user stats successfully",
      details: stats
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      details: { error }
    }
  }
}

/**
 * Run all integration tests
 */
export async function runAuthIntegrationTests(): Promise<{
  overall: boolean
  results: Record<string, AuthTestResult>
}> {
  console.log("🧪 Running Clerk + Supabase integration tests...")
  
  const results: Record<string, AuthTestResult> = {}
  
  // Test decision creation
  console.log("📝 Testing decision creation...")
  results.decisionCreation = await testDecisionCreation()
  
  // Test getting decisions
  console.log("📋 Testing get user decisions...")
  results.getUserDecisions = await testGetUserDecisions()
  
  // Test getting stats
  console.log("📊 Testing get user stats...")
  results.getUserStats = await testGetUserStats()
  
  const overall = Object.values(results).every(result => result.success)
  
  console.log(`🎯 Integration tests ${overall ? 'PASSED' : 'FAILED'}`)
  
  return { overall, results }
}