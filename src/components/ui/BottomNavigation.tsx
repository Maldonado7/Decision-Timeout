'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useHapticFeedback } from '@/hooks/useHapticFeedback'
import { useUser } from '@clerk/nextjs'

const navItems = [
  {
    href: '/dashboard',
    label: 'Decide',
    icon: (active: boolean) => (
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        className={active ? 'text-blue-600' : 'text-gray-500'}
      >
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.1 : 0}
        />
        <polyline 
          points="12,6 12,12 16,14" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    href: '/history',
    label: 'History',
    icon: (active: boolean) => (
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        className={active ? 'text-blue-600' : 'text-gray-500'}
      >
        <path 
          d="M12 6V2H8v4H2v14a2 2 0 002 2h16a2 2 0 002-2V6h-6z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.1 : 0}
        />
        <path 
          d="M16 10v4H8v-4" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none"
        className={active ? 'text-blue-600' : 'text-gray-500'}
      >
        <path 
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.1 : 0}
        />
        <polyline 
          points="9,22 9,12 15,12 15,22" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    )
  }
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const { click } = useHapticFeedback()
  const { user, isLoaded } = useUser()

  const handleNavClick = () => {
    click()
  }

  // Don't render if authentication is still loading
  if (!isLoaded) {
    return null
  }

  // For authenticated users, filter out the Home button since they should use Dashboard
  const filteredNavItems = user 
    ? navItems.filter(item => item.href !== '/')
    : navItems

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(60px + env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex items-center justify-around h-full max-w-sm mx-auto px-4">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 relative group"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`
                  flex flex-col items-center justify-center space-y-1 
                  transition-colors duration-200 group-active:scale-95
                  ${isActive ? 'text-blue-600' : 'text-gray-500'}
                `}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {item.icon(isActive)}
                </div>
                <span className="text-xs font-medium leading-none">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}