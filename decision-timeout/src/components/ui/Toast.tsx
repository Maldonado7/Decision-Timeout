import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const iconClasses = 'w-5 h-5 flex-shrink-0'
  
  switch (type) {
    case 'success':
      return (
        <svg className={`${iconClasses} text-green-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    case 'error':
      return (
        <svg className={`${iconClasses} text-red-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    case 'warning':
      return (
        <svg className={`${iconClasses} text-yellow-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    case 'info':
      return (
        <svg className={`${iconClasses} text-blue-500`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
  }
}

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const { type, title, message, action, duration = 5000 } = toast
  
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [toast.id, duration, onRemove])
  
  const backgroundClasses = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }
  
  const textClasses = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`max-w-sm w-full ${backgroundClasses[type]} border rounded-lg shadow-lg p-4 pointer-events-auto`}
    >
      <div className="flex items-start">
        <ToastIcon type={type} />
        
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${textClasses[type]}`}>
            {title}
          </h4>
          {message && (
            <p className={`mt-1 text-sm ${textClasses[type]} opacity-90`}>
              {message}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium ${textClasses[type]} hover:underline`}
            >
              {action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onRemove(toast.id)}
          className={`ml-4 text-sm ${textClasses[type]} opacity-70 hover:opacity-100`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()
  
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="flex flex-col space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onRemove={removeToast} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast = { ...toastData, id }
    
    setToasts((prev) => [toast, ...prev].slice(0, 5)) // Limit to 5 toasts
    
    return id
  }, [])
  
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])
  
  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])
  
  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts
  }
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export default ToastProvider