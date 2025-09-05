import { supabase, type Decision } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export class DecisionsService {
  /**
   * Create a new decision for the authenticated user
   */
  static async createDecision(data: {
    question: string
    pros: string[]
    cons: string[]
    result: 'YES' | 'NO'
    time_saved: number
  }) {
    const { userId } = await auth()
    if (!userId) {
      console.error('DecisionsService.createDecision: User not authenticated')
      throw new Error('User not authenticated')
    }

    console.log(`DecisionsService.createDecision: Creating decision for user ${userId}`)

    try {
      const { data: decision, error } = await supabase
        .from('decisions')
        .insert({
          user_id: userId,
          question: data.question,
          pros: data.pros,
          cons: data.cons,
          result: data.result,
          time_saved: data.time_saved,
          locked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Lock for 24 hours
          outcome: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('DecisionsService.createDecision: Database error', error)
        throw error
      }

      console.log(`DecisionsService.createDecision: Successfully created decision ${decision.id}`)
      return decision as Decision
    } catch (err) {
      console.error('DecisionsService.createDecision: Unexpected error', err)
      throw err
    }
  }

  /**
   * Get all decisions for the authenticated user
   */
  static async getUserDecisions() {
    const { userId } = await auth()
    if (!userId) {
      console.error('DecisionsService.getUserDecisions: User not authenticated')
      throw new Error('User not authenticated')
    }

    console.log(`DecisionsService.getUserDecisions: Fetching decisions for user ${userId}`)

    try {
      const { data: decisions, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('DecisionsService.getUserDecisions: Database error', error)
        throw error
      }

      console.log(`DecisionsService.getUserDecisions: Found ${decisions?.length || 0} decisions`)
      return (decisions || []) as Decision[]
    } catch (err) {
      console.error('DecisionsService.getUserDecisions: Unexpected error', err)
      throw err
    }
  }

  /**
   * Get a specific decision by ID
   */
  static async getDecision(id: string) {
    const { userId } = await auth()
    if (!userId) {
      console.error('DecisionsService.getDecision: User not authenticated')
      throw new Error('User not authenticated')
    }

    console.log(`DecisionsService.getDecision: Fetching decision ${id} for user ${userId}`)

    try {
      const { data: decision, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId) // Ensure user owns this decision
        .single()

      if (error) {
        console.error('DecisionsService.getDecision: Database error', error)
        throw error
      }

      if (!decision) {
        console.warn(`DecisionsService.getDecision: Decision ${id} not found for user ${userId}`)
        throw new Error('Decision not found')
      }

      console.log(`DecisionsService.getDecision: Successfully retrieved decision ${id}`)
      return decision as Decision
    } catch (err) {
      console.error('DecisionsService.getDecision: Unexpected error', err)
      throw err
    }
  }

  /**
   * Update decision outcome after unlock period
   */
  static async updateDecisionOutcome(id: string, outcome: 'good' | 'bad') {
    const { userId } = await auth()
    if (!userId) {
      console.error('DecisionsService.updateDecisionOutcome: User not authenticated')
      throw new Error('User not authenticated')
    }

    console.log(`DecisionsService.updateDecisionOutcome: Updating decision ${id} outcome to ${outcome} for user ${userId}`)

    try {
      // First check if the decision is unlocked
      const decision = await this.getDecision(id)
      if (new Date(decision.locked_until) > new Date()) {
        console.warn(`DecisionsService.updateDecisionOutcome: Decision ${id} is still locked until ${decision.locked_until}`)
        throw new Error('Decision is still locked')
      }

      const { data: updatedDecision, error } = await supabase
        .from('decisions')
        .update({ outcome })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('DecisionsService.updateDecisionOutcome: Database error', error)
        throw error
      }

      if (!updatedDecision) {
        console.warn(`DecisionsService.updateDecisionOutcome: Failed to update decision ${id}`)
        throw new Error('Failed to update decision')
      }

      console.log(`DecisionsService.updateDecisionOutcome: Successfully updated decision ${id}`)
      return updatedDecision as Decision
    } catch (err) {
      console.error('DecisionsService.updateDecisionOutcome: Unexpected error', err)
      throw err
    }
  }

  /**
   * Delete a decision
   */
  static async deleteDecision(id: string) {
    const { userId } = await auth()
    if (!userId) {
      console.error('DecisionsService.deleteDecision: User not authenticated')
      throw new Error('User not authenticated')
    }

    console.log(`DecisionsService.deleteDecision: Deleting decision ${id} for user ${userId}`)

    try {
      const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('DecisionsService.deleteDecision: Database error', error)
        throw error
      }

      console.log(`DecisionsService.deleteDecision: Successfully deleted decision ${id}`)
    } catch (err) {
      console.error('DecisionsService.deleteDecision: Unexpected error', err)
      throw err
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    const { userId } = await auth()
    if (!userId) {
      console.error('DecisionsService.getUserStats: User not authenticated')
      throw new Error('User not authenticated')
    }

    console.log(`DecisionsService.getUserStats: Calculating stats for user ${userId}`)

    try {
      const decisions = await this.getUserDecisions()
      
      const stats = {
        totalDecisions: decisions.length,
        yesDecisions: decisions.filter(d => d.result === 'YES').length,
        noDecisions: decisions.filter(d => d.result === 'NO').length,
        goodOutcomes: decisions.filter(d => d.outcome === 'good').length,
        badOutcomes: decisions.filter(d => d.outcome === 'bad').length,
        pendingOutcomes: decisions.filter(d => d.outcome === 'pending').length,
        totalTimeSaved: decisions.reduce((acc, d) => acc + d.time_saved, 0)
      }

      console.log(`DecisionsService.getUserStats: Calculated stats for ${stats.totalDecisions} decisions`)
      return stats
    } catch (err) {
      console.error('DecisionsService.getUserStats: Unexpected error', err)
      throw err
    }
  }
}