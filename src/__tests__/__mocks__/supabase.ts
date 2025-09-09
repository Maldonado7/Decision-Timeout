import { mockDecision, mockCompletedDecision } from '../test-utils'

const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: mockDecision,
      error: null,
    }),
    then: jest.fn((callback) => {
      return callback({
        data: [mockDecision, mockCompletedDecision],
        error: null,
      })
    }),
  })),
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
}

export const createClient = jest.fn(() => mockSupabaseClient)

export { mockSupabaseClient }