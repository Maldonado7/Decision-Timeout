'use client'

import Link from 'next/link'
import { SignOutButton, useUser } from '@clerk/nextjs'
import { useState } from 'react'

interface NavigationProps {
  currentPage?: 'dashboard' | 'history'
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">⏰</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Decision Timeout</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Decision</span>
            </Link>
            
            <Link
              href="/history"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'history'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>History</span>
            </Link>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U'}
                  </span>
                </div>
                <span className="text-sm text-gray-700 hidden lg:block">
                  {user?.firstName || 'Anonymous Overthinker'}
                </span>
              </div>
              
              <SignOutButton>
                <button className="text-gray-500 hover:text-red-600 transition-colors p-2 min-w-[44px] min-h-[44px] rounded flex items-center justify-center touch-manipulation" aria-label="Sign out">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </SignOutButton>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 min-w-[44px] min-h-[44px] rounded-lg hover:bg-gray-100 flex items-center justify-center touch-manipulation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="space-y-2">
              <Link
                href="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
                  currentPage === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Decision</span>
              </Link>
              
              <Link
                href="/history"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium ${
                  currentPage === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>History</span>
              </Link>
              
              <div className="flex items-center justify-between pt-2 mt-2 border-t">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">
                    {user?.firstName || 'Anonymous Overthinker'}
                  </span>
                </div>
                <SignOutButton>
                  <button className="text-red-600 hover:text-red-700 px-4 py-3 min-h-[44px] text-sm font-medium rounded-lg touch-manipulation">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}