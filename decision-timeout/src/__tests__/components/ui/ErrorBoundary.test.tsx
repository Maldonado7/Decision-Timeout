import React from 'react'
import { render, screen, fireEvent } from '../../test-utils'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Normal component</div>
}

// Component that throws on button click
const ThrowOnClick = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false)
  
  if (shouldThrow) {
    throw new Error('Click error')
  }
  
  return (
    <button onClick={() => setShouldThrow(true)}>
      Trigger Error
    </button>
  )
}

describe('ErrorBoundary', () => {
  // Suppress console errors during tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  
  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Normal Operation', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should not show error UI when children render normally', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Normal component')).toBeInTheDocument()
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should catch and display error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument()
      expect(screen.queryByText('Normal component')).not.toBeInTheDocument()
    })

    it('should display default error UI with proper elements', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Check for main error message
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      
      // Check for reassuring message
      expect(screen.getByText(/your decisions are safe/)).toBeInTheDocument()
      
      // Check for action buttons
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Back to Home')).toBeInTheDocument()
      
      // Check for support message
      expect(screen.getByText(/If this keeps happening/)).toBeInTheDocument()
    })

    it('should show technical details in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Technical Details (Development Only)')).toBeInTheDocument()

      process.env.NODE_ENV = originalNodeEnv
    })

    it('should hide technical details in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Technical Details (Development Only)')).not.toBeInTheDocument()

      process.env.NODE_ENV = originalNodeEnv
    })
  })

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const CustomFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Recovery', () => {
    it('should reset error state when Try Again button is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Error should be displayed
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

      // Click Try Again
      fireEvent.click(screen.getByText('Try Again'))

      // Re-render with non-throwing component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      // Should show normal content
      expect(screen.getByText('Normal component')).toBeInTheDocument()
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
    })

    it('should handle runtime errors after initial render', () => {
      render(
        <ErrorBoundary>
          <ThrowOnClick />
        </ErrorBoundary>
      )

      // Initially should render normally
      expect(screen.getByText('Trigger Error')).toBeInTheDocument()

      // Click to trigger error
      fireEvent.click(screen.getByText('Trigger Error'))

      // Should show error boundary
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('should have correct href attributes for navigation links', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const dashboardLink = screen.getByText('Go to Dashboard').closest('a')
      const homeLink = screen.getByText('Back to Home').closest('a')

      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Oops! Something went wrong')
    })

    it('should have descriptive button text', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
    })
  })

  describe('Console Logging', () => {
    it('should log error to console in development', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      )

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalNodeEnv
    })
  })

  describe('Error Information', () => {
    it('should capture error details correctly', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Click to expand technical details
      fireEvent.click(screen.getByText('Technical Details (Development Only)'))

      // Should show error message
      expect(screen.getByText(/Error:.*Test error/)).toBeInTheDocument()
      
      // Should show stack trace
      expect(screen.getByText('Stack:')).toBeInTheDocument()

      process.env.NODE_ENV = originalNodeEnv
    })
  })
})