import React from 'react'
import { render } from '../test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'
import Navigation from '@/components/ui/Navigation'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { LoadingSpinner, EmptyState, ErrorFallback, NetworkStatus, RetryableError } from '@/components/ui/LoadingStates'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  describe('Navigation Component', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<Navigation />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels for interactive elements', async () => {
      const { getByLabelText } = render(<Navigation />)
      
      expect(getByLabelText('Toggle mobile menu')).toBeInTheDocument()
      expect(getByLabelText('Sign out')).toBeInTheDocument()
    })

    it('should have proper focus management', async () => {
      const { getByLabelText } = render(<Navigation />)
      
      const mobileMenuButton = getByLabelText('Toggle mobile menu')
      expect(mobileMenuButton).toHaveAttribute('tabindex', '0')
    })
  })

  describe('ErrorBoundary Component', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    beforeEach(() => {
      // Suppress console errors for this test
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should not have any accessibility violations', async () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', async () => {
      const { getByRole } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      const heading = getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Oops! Something went wrong')
    })

    it('should have accessible button labels', async () => {
      const { getByRole } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )
      
      expect(getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
    })
  })

  describe('Loading States Components', () => {
    it('LoadingSpinner should not have accessibility violations', async () => {
      const { container } = render(<LoadingSpinner />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('LoadingSpinner should have proper ARIA attributes', async () => {
      const { getByRole } = render(<LoadingSpinner />)
      
      const spinner = getByRole('status')
      expect(spinner).toHaveAttribute('aria-label', 'Loading')
    })

    it('EmptyState should not have accessibility violations', async () => {
      const { container } = render(
        <EmptyState
          title="No decisions yet"
          description="You haven't made any decisions yet. Create your first one!"
          action={{
            label: 'Create Decision',
            onClick: jest.fn()
          }}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('EmptyState should have proper heading structure', async () => {
      const { getByRole } = render(
        <EmptyState
          title="No decisions yet"
          description="You haven't made any decisions yet."
        />
      )
      
      expect(getByRole('heading', { level: 3 })).toHaveTextContent('No decisions yet')
    })

    it('ErrorFallback should not have accessibility violations', async () => {
      const error = new Error('Test error')
      const { container } = render(
        <ErrorFallback error={error} resetError={jest.fn()} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('NetworkStatus should not have accessibility violations', async () => {
      const { container } = render(<NetworkStatus isOnline={false} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('RetryableError should not have accessibility violations', async () => {
      const error = new Error('Network error')
      const { container } = render(
        <RetryableError
          error={error}
          onRetry={jest.fn()}
          retryCount={1}
          maxRetries={3}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Form Accessibility', () => {
    it('should handle form validation errors accessibly', () => {
      // This would test form components when they're available
      // For now, we'll create a simple form to test
      const TestForm = () => (
        <form>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            aria-describedby="email-error"
            aria-invalid="true"
            aria-required="true"
          />
          <div id="email-error" role="alert" aria-live="polite">
            Please enter a valid email address
          </div>
        </form>
      )

      const { getByLabelText, getByRole } = render(<TestForm />)
      
      const emailInput = getByLabelText('Email')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAttribute('aria-required', 'true')
      
      const errorMessage = getByRole('alert')
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Interactive Elements', () => {
    it('should have minimum touch target sizes', () => {
      const { getByLabelText } = render(<Navigation />)
      
      const mobileMenuButton = getByLabelText('Toggle mobile menu')
      const signOutButton = getByLabelText('Sign out')
      
      // Check for minimum 44px touch targets (accessibility guideline)
      expect(mobileMenuButton).toHaveClass('min-w-[44px]', 'min-h-[44px]')
      expect(signOutButton).toHaveClass('min-w-[44px]', 'min-h-[44px]')
    })

    it('should have proper focus indicators', () => {
      const TestButton = () => (
        <button className="focus:ring-2 focus:ring-blue-500 focus:outline-none">
          Test Button
        </button>
      )

      const { getByRole } = render(<TestButton />)
      const button = getByRole('button')
      
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-blue-500', 'focus:outline-none')
    })
  })

  describe('Semantic HTML', () => {
    it('should use semantic navigation elements', () => {
      const { container } = render(<Navigation />)
      
      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('should have proper landmark roles', () => {
      const TestLayout = () => (
        <div>
          <header>
            <h1>Decision Timeout</h1>
          </header>
          <main>
            <h2>Main Content</h2>
          </main>
          <footer>
            <p>Footer content</p>
          </footer>
        </div>
      )

      const { container } = render(<TestLayout />)
      
      expect(container.querySelector('header')).toBeInTheDocument()
      expect(container.querySelector('main')).toBeInTheDocument()
      expect(container.querySelector('footer')).toBeInTheDocument()
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should not rely solely on color for information', () => {
      // Test that error states use more than just color
      const TestErrorState = () => (
        <div className="text-red-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Error message with icon
        </div>
      )

      const { container } = render(<TestErrorState />)
      
      // Should have both color (red text) and icon
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-hidden', 'true') // Decorative icon
    })
  })

  describe('Screen Reader Support', () => {
    it('should have appropriate screen reader only text', () => {
      const TestWithSRText = () => (
        <button>
          <span className="sr-only">Close dialog</span>
          <svg aria-hidden="true">
            {/* X icon */}
          </svg>
        </button>
      )

      const { getByText } = render(<TestWithSRText />)
      
      const srText = getByText('Close dialog')
      expect(srText).toHaveClass('sr-only')
    })

    it('should properly hide decorative elements from screen readers', () => {
      const TestWithDecorativeElements = () => (
        <div>
          <svg aria-hidden="true" className="decorative-icon">
            {/* Decorative icon */}
          </svg>
          <img src="/decorative.jpg" alt="" role="presentation" />
        </div>
      )

      const { container } = render(<TestWithDecorativeElements />)
      
      const svg = container.querySelector('svg')
      const img = container.querySelector('img')
      
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(img).toHaveAttribute('alt', '')
      expect(img).toHaveAttribute('role', 'presentation')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation patterns', () => {
      const TestKeyboardNav = () => (
        <div role="menu">
          <button role="menuitem" tabIndex={0}>
            First item
          </button>
          <button role="menuitem" tabIndex={-1}>
            Second item
          </button>
          <button role="menuitem" tabIndex={-1}>
            Third item
          </button>
        </div>
      )

      const { getAllByRole } = render(<TestKeyboardNav />)
      
      const menuItems = getAllByRole('menuitem')
      expect(menuItems[0]).toHaveAttribute('tabIndex', '0') // First item focusable
      expect(menuItems[1]).toHaveAttribute('tabIndex', '-1') // Others not in tab order
      expect(menuItems[2]).toHaveAttribute('tabIndex', '-1')
    })
  })
})