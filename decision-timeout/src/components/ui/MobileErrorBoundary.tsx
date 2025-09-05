'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class MobileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Mobile Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full text-center">
            <div className="text-6xl mb-4" role="img" aria-label="Error">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              We&apos;re sorry, but something unexpected happened. This might be due to a poor connection or a temporary issue.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium touch-manipulation"
                aria-label="Reload the page"
              >
                Try Again
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium touch-manipulation"
                aria-label="Continue with the current page"
              >
                Continue
              </button>
            </div>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technical Details
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 overflow-auto max-h-20">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}