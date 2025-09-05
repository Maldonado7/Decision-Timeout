import { DecisionsService } from '@/lib/services/decisions'
import { mockDecision, mockCompletedDecision } from '../../test-utils'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
  },
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

import { supabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockSupabase = supabase.from as jest.MockedFunction<typeof supabase.from>

describe('DecisionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'test-user-id' })
  })

  describe('createDecision', () => {
    const mockDecisionData = {
      question: 'Should I take the new job?',
      pros: ['Better salary', 'Good culture'],
      cons: ['Longer commute', 'Less flexibility'],
      result: 'YES' as const,
      time_saved: 60,
    }

    it('should create a decision successfully', async () => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockDecision,
          error: null,
        }),
      }

      mockSupabase.mockReturnValue(mockChain)

      const result = await DecisionsService.createDecision(mockDecisionData)

      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        question: mockDecisionData.question,
        pros: mockDecisionData.pros,
        cons: mockDecisionData.cons,
        result: mockDecisionData.result,
        time_saved: mockDecisionData.time_saved,
        locked_until: expect.any(String),
        outcome: 'pending',
        created_at: expect.any(String),
      })
      expect(result).toEqual(mockDecision)
    })

    it('should throw error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      await expect(
        DecisionsService.createDecision(mockDecisionData)
      ).rejects.toThrow('User not authenticated')
    })

    it('should throw error when database operation fails', async () => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: '500' },
        }),
      }

      mockSupabase.mockReturnValue(mockChain)

      await expect(
        DecisionsService.createDecision(mockDecisionData)
      ).rejects.toEqual({ message: 'Database error', code: '500' })
    })
  })

  describe('getUserDecisions', () => {
    it('should fetch user decisions successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockDecision, mockCompletedDecision],
          error: null,
        }),
      }

      mockSupabase.mockReturnValue(mockChain)

      const result = await DecisionsService.getUserDecisions()

      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual([mockDecision, mockCompletedDecision])
    })

    it('should throw error when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      await expect(DecisionsService.getUserDecisions()).rejects.toThrow(
        'User not authenticated'
      )
    })

    it('should return empty array when no decisions found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }

      mockSupabase.mockReturnValue(mockChain)

      const result = await DecisionsService.getUserDecisions()

      expect(result).toEqual([])
    })
  })

  describe('getDecision', () => {
    const decisionId = 'test-decision-id'

    it('should fetch a specific decision successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockDecision,
          error: null,
        }),
      }

      mockSupabase.mockReturnValue(mockChain)

      const result = await DecisionsService.getDecision(decisionId)

      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.eq).toHaveBeenCalledWith('id', decisionId)
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user-id')
      expect(result).toEqual(mockDecision)
    })

    it('should throw error when decision not found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }

      mockSupabase.mockReturnValue(mockChain)

      await expect(DecisionsService.getDecision(decisionId)).rejects.toThrow(
        'Decision not found'
      )
    })
  })

  describe('updateDecisionOutcome', () => {
    const decisionId = 'test-decision-id'
    const outcome = 'good' as const

    it('should update decision outcome successfully when unlocked', async () => {
      // Mock getDecision to return an unlocked decision
      const unlockedDecision = {
        ...mockDecision,
        locked_until: new Date(Date.now() - 1000).toISOString(), // Past date
      }

      jest.spyOn(DecisionsService, 'getDecision').mockResolvedValue(unlockedDecision)

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockDecision, outcome },
          error: null,
        }),
      }

      mockSupabase.mockReturnValue(mockChain)

      const result = await DecisionsService.updateDecisionOutcome(decisionId, outcome)

      expect(mockChain.update).toHaveBeenCalledWith({ outcome })
      expect(result.outcome).toBe(outcome)
    })

    it('should throw error when decision is still locked', async () => {
      const lockedDecision = {
        ...mockDecision,
        locked_until: new Date(Date.now() + 1000).toISOString(), // Future date
      }

      jest.spyOn(DecisionsService, 'getDecision').mockResolvedValue(lockedDecision)

      await expect(
        DecisionsService.updateDecisionOutcome(decisionId, outcome)
      ).rejects.toThrow('Decision is still locked')
    })
  })

  describe('deleteDecision', () => {
    const decisionId = 'test-decision-id'

    it('should delete decision successfully', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }

      mockSupabase.mockReturnValue(mockChain)

      await DecisionsService.deleteDecision(decisionId)

      expect(mockChain.delete).toHaveBeenCalled()
      expect(mockChain.eq).toHaveBeenCalledWith('id', decisionId)
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user-id')
    })

    it('should throw error when delete fails', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed', code: '500' },
        }),
      }

      mockSupabase.mockReturnValue(mockChain)

      await expect(DecisionsService.deleteDecision(decisionId)).rejects.toEqual({
        message: 'Delete failed',
        code: '500',
      })
    })
  })

  describe('getUserStats', () => {
    it('should calculate user statistics correctly', async () => {
      const mockDecisions = [
        { ...mockDecision, result: 'YES', outcome: 'good', time_saved: 30 },
        { ...mockDecision, result: 'NO', outcome: 'bad', time_saved: 45 },
        { ...mockDecision, result: 'YES', outcome: 'pending', time_saved: 15 },
      ]

      jest.spyOn(DecisionsService, 'getUserDecisions').mockResolvedValue(mockDecisions)

      const stats = await DecisionsService.getUserStats()

      expect(stats).toEqual({
        totalDecisions: 3,
        yesDecisions: 2,
        noDecisions: 1,
        goodOutcomes: 1,
        badOutcomes: 1,
        pendingOutcomes: 1,
        totalTimeSaved: 90,
      })
    })

    it('should handle empty decisions list', async () => {
      jest.spyOn(DecisionsService, 'getUserDecisions').mockResolvedValue([])

      const stats = await DecisionsService.getUserStats()

      expect(stats).toEqual({
        totalDecisions: 0,
        yesDecisions: 0,
        noDecisions: 0,
        goodOutcomes: 0,
        badOutcomes: 0,
        pendingOutcomes: 0,
        totalTimeSaved: 0,
      })
    })
  })
})