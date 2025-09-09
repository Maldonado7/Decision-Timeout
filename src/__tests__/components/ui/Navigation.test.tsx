import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import Navigation from '@/components/ui/Navigation'
import { useUser } from '@clerk/nextjs'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock useUser to return different states
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

describe('Navigation', () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: {
        id: 'test-user-id',
        firstName: 'John',
        emailAddresses: [{ emailAddress: 'john@example.com' }],
      },
    } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the navigation header', () => {
      render(<Navigation />)
      
      expect(screen.getByText('Decision Timeout')).toBeInTheDocument()
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument()
    })

    it('should render navigation links', () => {
      render(<Navigation />)
      
      expect(screen.getByText('New Decision')).toBeInTheDocument()
      expect(screen.getByText('History')).toBeInTheDocument()
    })

    it('should render user information when user is loaded', () => {
      render(<Navigation />)
      
      expect(screen.getByText('J')).toBeInTheDocument() // First letter of firstName
      expect(screen.getByText('John')).toBeInTheDocument()
    })

    it('should render sign out button', () => {
      render(<Navigation />)
      
      expect(screen.getByLabelText('Sign out')).toBeInTheDocument()
    })
  })

  describe('Current Page Highlighting', () => {
    it('should highlight dashboard link when on dashboard page', () => {
      render(<Navigation currentPage="dashboard" />)
      
      const dashboardLinks = screen.getAllByText('New Decision')
      const desktopLink = dashboardLinks[0].closest('a')
      
      expect(desktopLink).toHaveClass('bg-blue-50', 'text-blue-700', 'border-blue-200')
    })

    it('should highlight history link when on history page', () => {
      render(<Navigation currentPage="history" />)
      
      const historyLinks = screen.getAllByText('History')
      const desktopLink = historyLinks[0].closest('a')
      
      expect(desktopLink).toHaveClass('bg-blue-50', 'text-blue-700')
    })

    it('should not highlight any link when no current page is specified', () => {
      render(<Navigation />)
      
      const dashboardLinks = screen.getAllByText('New Decision')
      const historyLinks = screen.getAllByText('History')
      
      const desktopDashboardLink = dashboardLinks[0].closest('a')
      const desktopHistoryLink = historyLinks[0].closest('a')
      
      expect(desktopDashboardLink).toHaveClass('text-gray-600')
      expect(desktopHistoryLink).toHaveClass('text-gray-600')
    })
  })

  describe('Mobile Menu', () => {
    it('should initially hide mobile menu', () => {
      render(<Navigation />)
      
      // Mobile menu should not be visible initially
      const mobileMenu = screen.queryByText('New Decision')?.closest('.md\\:hidden')
      expect(mobileMenu).not.toBeInTheDocument()
    })

    it('should toggle mobile menu when button is clicked', async () => {
      render(<Navigation />)
      
      const toggleButton = screen.getByLabelText('Toggle mobile menu')
      
      // Click to open mobile menu
      fireEvent.click(toggleButton)
      
      await waitFor(() => {
        // Mobile menu should be visible with both desktop and mobile links
        const dashboardLinks = screen.getAllByText('New Decision')
        expect(dashboardLinks).toHaveLength(2) // Desktop + Mobile
      })
    })

    it('should close mobile menu when a link is clicked', async () => {
      render(<Navigation />)
      
      const toggleButton = screen.getByLabelText('Toggle mobile menu')
      
      // Open mobile menu
      fireEvent.click(toggleButton)
      
      await waitFor(() => {
        const dashboardLinks = screen.getAllByText('New Decision')
        expect(dashboardLinks).toHaveLength(2)
      })
      
      // Click on mobile dashboard link
      const dashboardLinks = screen.getAllByText('New Decision')
      const mobileLink = dashboardLinks[1] // Second one is mobile
      fireEvent.click(mobileLink)
      
      // Menu should close (only one link visible - desktop)
      await waitFor(() => {
        const remainingLinks = screen.getAllByText('New Decision')
        expect(remainingLinks).toHaveLength(1)
      })
    })

    it('should show current page highlight in mobile menu', async () => {
      render(<Navigation currentPage="dashboard" />)
      
      const toggleButton = screen.getByLabelText('Toggle mobile menu')
      fireEvent.click(toggleButton)
      
      await waitFor(() => {
        const mobileLinks = screen.getAllByText('New Decision')
        const mobileLink = mobileLinks[1].closest('a')
        expect(mobileLink).toHaveClass('bg-blue-50', 'text-blue-700')
      })
    })
  })

  describe('User Display', () => {
    it('should display user initial when firstName is available', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          firstName: 'Alice',
          emailAddresses: [{ emailAddress: 'alice@example.com' }],
        },
      } as any)

      render(<Navigation />)
      
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('should display email initial when no firstName is available', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          firstName: null,
          emailAddresses: [{ emailAddress: 'test@example.com' }],
        },
      } as any)

      render(<Navigation />)
      
      expect(screen.getByText('t')).toBeInTheDocument() // First letter of email
      expect(screen.getByText('Anonymous Overthinker')).toBeInTheDocument()
    })

    it('should display fallback when no user data is available', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          firstName: null,
          emailAddresses: [],
        },
      } as any)

      render(<Navigation />)
      
      expect(screen.getByText('U')).toBeInTheDocument()
      expect(screen.getByText('Anonymous Overthinker')).toBeInTheDocument()
    })
  })

  describe('Links', () => {
    it('should have correct href attributes', () => {
      render(<Navigation />)
      
      const logo = screen.getByText('Decision Timeout').closest('a')
      expect(logo).toHaveAttribute('href', '/dashboard')
      
      const dashboardLink = screen.getAllByText('New Decision')[0].closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
      
      const historyLink = screen.getAllByText('History')[0].closest('a')
      expect(historyLink).toHaveAttribute('href', '/history')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Navigation />)
      
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument()
      expect(screen.getByLabelText('Sign out')).toBeInTheDocument()
    })

    it('should have proper button sizes for touch targets', () => {
      render(<Navigation />)
      
      const toggleButton = screen.getByLabelText('Toggle mobile menu')
      const signOutButton = screen.getByLabelText('Sign out')
      
      expect(toggleButton).toHaveClass('min-w-[44px]', 'min-h-[44px]')
      expect(signOutButton).toHaveClass('min-w-[44px]', 'min-h-[44px]')
    })
  })

  describe('Responsive Design', () => {
    it('should hide desktop navigation on mobile', () => {
      render(<Navigation />)
      
      const desktopNav = screen.getByText('New Decision').closest('.hidden.md\\:flex')
      expect(desktopNav).toHaveClass('hidden', 'md:flex')
    })

    it('should hide mobile menu button on desktop', () => {
      render(<Navigation />)
      
      const mobileButton = screen.getByLabelText('Toggle mobile menu')
      expect(mobileButton).toHaveClass('md:hidden')
    })
  })
})