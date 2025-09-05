import { renderHook, act } from '@testing-library/react'
import { useMobileDetection } from '@/hooks/useMobileDetection'

// Mock window properties
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  })
}

const mockWindowProperties = (properties: Partial<Window>) => {
  Object.assign(window, properties)
}

describe('useMobileDetection', () => {
  const originalInnerWidth = window.innerWidth
  const originalInnerHeight = window.innerHeight
  const originalUserAgent = navigator.userAgent

  beforeEach(() => {
    // Reset to default state
    mockWindowProperties({
      innerWidth: 1024,
      innerHeight: 768,
    })
    mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
    
    // Mock navigator properties
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 0,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: originalInnerHeight,
    })
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: originalUserAgent,
    })
  })

  describe('Device Detection', () => {
    it('should detect desktop devices', () => {
      mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
      mockWindowProperties({ innerWidth: 1024, innerHeight: 768 })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.isDesktop).toBe(true)
      expect(result.current.isMobile).toBe(false)
      expect(result.current.isTablet).toBe(false)
    })

    it('should detect mobile devices', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15')
      mockWindowProperties({ innerWidth: 375, innerHeight: 812 })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.isMobile).toBe(true)
      expect(result.current.isTablet).toBe(false)
      expect(result.current.isDesktop).toBe(false)
      expect(result.current.isIOS).toBe(true)
    })

    it('should detect tablet devices', () => {
      mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15')
      mockWindowProperties({ innerWidth: 768, innerHeight: 1024 })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.isTablet).toBe(true)
      expect(result.current.isMobile).toBe(false)
      expect(result.current.isDesktop).toBe(false)
      expect(result.current.isIOS).toBe(true)
    })

    it('should detect Android devices', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36')
      mockWindowProperties({ innerWidth: 360, innerHeight: 760 })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.isAndroid).toBe(true)
      expect(result.current.isMobile).toBe(true)
    })
  })

  describe('Touch Detection', () => {
    it('should detect touch support', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        value: 1,
      })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.hasTouch).toBe(true)
    })

    it('should detect no touch support', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        value: 0,
      })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.hasTouch).toBe(false)
    })
  })

  describe('Screen Size Detection', () => {
    const testCases = [
      { width: 320, expected: 'xs' },
      { width: 640, expected: 'sm' },
      { width: 768, expected: 'md' },
      { width: 1024, expected: 'lg' },
      { width: 1280, expected: 'xl' },
    ]

    testCases.forEach(({ width, expected }) => {
      it(`should detect ${expected} screen size for width ${width}`, () => {
        mockWindowProperties({ innerWidth: width, innerHeight: 600 })
        
        const { result } = renderHook(() => useMobileDetection())
        
        expect(result.current.screenSize).toBe(expected)
      })
    })
  })

  describe('Orientation Detection', () => {
    it('should detect portrait orientation', () => {
      mockWindowProperties({ innerWidth: 375, innerHeight: 812 })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.orientation).toBe('portrait')
    })

    it('should detect landscape orientation', () => {
      mockWindowProperties({ innerWidth: 812, innerHeight: 375 })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.orientation).toBe('landscape')
    })
  })

  describe('PWA Detection', () => {
    it('should detect PWA when display-mode is standalone', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.isPWA).toBe(true)
    })
  })

  describe('Event Listeners', () => {
    it('should update detection on window resize', () => {
      mockWindowProperties({ innerWidth: 1024, innerHeight: 768 })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.screenSize).toBe('lg')
      
      // Simulate window resize
      act(() => {
        mockWindowProperties({ innerWidth: 320, innerHeight: 568 })
        window.dispatchEvent(new Event('resize'))
      })
      
      expect(result.current.screenSize).toBe('xs')
    })

    it('should update orientation on orientationchange', () => {
      mockWindowProperties({ innerWidth: 375, innerHeight: 812 })
      
      const { result } = renderHook(() => useMobileDetection())
      
      expect(result.current.orientation).toBe('portrait')
      
      // Simulate orientation change
      act(() => {
        mockWindowProperties({ innerWidth: 812, innerHeight: 375 })
        window.dispatchEvent(new Event('orientationchange'))
      })
      
      expect(result.current.orientation).toBe('landscape')
    })
  })

  describe('SSR Compatibility', () => {
    it('should handle server-side rendering', () => {
      // Mock window as undefined (SSR environment)
      const originalWindow = global.window
      delete (global as any).window
      
      const { result } = renderHook(() => useMobileDetection())
      
      // Should return initial state during SSR
      expect(result.current.isMobile).toBe(false)
      expect(result.current.isDesktop).toBe(false)
      expect(result.current.screenSize).toBe(null)
      
      // Restore window
      global.window = originalWindow
    })
  })
})