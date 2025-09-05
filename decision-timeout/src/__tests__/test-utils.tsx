import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ClerkProvider } from '@clerk/nextjs'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider publishableKey="pk_test_fake_key">
      {children}
    </ClerkProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data generators
export const mockDecision = {
  id: 'test-decision-1',
  title: 'Test Decision',
  description: 'A test decision description',
  options: ['Option A', 'Option B', 'Option C'],
  deadline: new Date('2025-12-31T23:59:59Z'),
  created_at: new Date('2025-01-01T00:00:00Z').toISOString(),
  updated_at: new Date('2025-01-01T00:00:00Z').toISOString(),
  user_id: 'test-user-id',
  is_completed: false,
  selected_option: null,
  tags: ['test', 'mock'],
}

export const mockCompletedDecision = {
  ...mockDecision,
  id: 'test-decision-2',
  title: 'Completed Test Decision',
  is_completed: true,
  selected_option: 'Option A',
}

export const mockUser = {
  id: 'test-user-id',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  fullName: 'Test User',
}

// Helper for async testing
export const waitForLoadingToFinish = () => new Promise(resolve => setTimeout(resolve, 0))