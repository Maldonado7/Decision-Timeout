import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  isRequired?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    isRequired = false,
    className = '', 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error
    
    const baseInputClasses = 'w-full px-4 py-3 min-h-[44px] border-2 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-colors'
    const normalClasses = 'border-gray-300 focus:ring-blue-500'
    const errorClasses = 'border-red-300 focus:ring-red-500'
    
    const inputClasses = `${baseInputClasses} ${hasError ? errorClasses : normalClasses} ${className}`.trim()
    
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600 text-sm flex items-center"
              id={`${inputId}-error`}
              role="alert"
              aria-live="polite"
            >
              <svg 
                className="w-4 h-4 mr-1 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        
        {helperText && !error && (
          <p 
            className="text-gray-500 text-sm"
            id={`${inputId}-helper`}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  isRequired?: boolean
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    isRequired = false,
    className = '', 
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error
    
    const baseTextareaClasses = 'w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-colors resize-vertical'
    const normalClasses = 'border-gray-300 focus:ring-blue-500'
    const errorClasses = 'border-red-300 focus:ring-red-500'
    
    const textareaClasses = `${baseTextareaClasses} ${hasError ? errorClasses : normalClasses} ${className}`.trim()
    
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          aria-invalid={hasError}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600 text-sm flex items-center"
              id={`${textareaId}-error`}
              role="alert"
              aria-live="polite"
            >
              <svg 
                className="w-4 h-4 mr-1 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        
        {helperText && !error && (
          <p 
            className="text-gray-500 text-sm"
            id={`${textareaId}-helper`}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export { Input, TextArea }