import React from 'react'
import { motion } from 'framer-motion'

export interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  hover?: boolean
  onClick?: () => void
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    className = '', 
    variant = 'default',
    padding = 'md',
    rounded = 'lg',
    hover = false,
    onClick,
    ...props 
  }, ref) => {
    const baseClasses = 'transition-all duration-200'
    
    const variantClasses = {
      default: 'bg-white shadow-md',
      outlined: 'bg-white border border-gray-200',
      elevated: 'bg-white shadow-lg'
    }
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8'
    }
    
    const roundedClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl'
    }
    
    const hoverClasses = hover ? 'hover:shadow-lg hover:scale-105' : ''
    const clickableClasses = onClick ? 'cursor-pointer' : ''
    
    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${roundedClasses[rounded]} ${hoverClasses} ${clickableClasses} ${className}`.trim()
    
    const CardComponent = onClick ? motion.div : 'div'
    
    return (
      <CardComponent
        ref={ref}
        className={combinedClasses}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </CardComponent>
    )
  }
)

Card.displayName = 'Card'

export interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-6 ${className}`}>
      {children}
    </div>
  )
}

export interface CardTitleProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '', 
  as: Component = 'h3' 
}) => {
  return (
    <Component className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </Component>
  )
}

export interface CardContentProps {
  children: React.ReactNode
  className?: string
}

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  )
}

export interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-6 ${className}`}>
      {children}
    </div>
  )
}

export interface ContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  center?: boolean
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '', 
  maxWidth = 'lg',
  padding = 'md',
  center = true
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8'
  }
  
  const centerClasses = center ? 'mx-auto' : ''
  
  const combinedClasses = `${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${centerClasses} ${className}`.trim()
  
  return (
    <div className={combinedClasses}>
      {children}
    </div>
  )
}

export interface DividerProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
}

const Divider: React.FC<DividerProps> = ({ 
  className = '', 
  orientation = 'horizontal',
  variant = 'solid'
}) => {
  const baseClasses = 'border-gray-200'
  
  const orientationClasses = orientation === 'horizontal' 
    ? 'border-t w-full' 
    : 'border-l h-full'
    
  const variantClasses = {
    solid: '',
    dashed: 'border-dashed',
    dotted: 'border-dotted'
  }
  
  const combinedClasses = `${baseClasses} ${orientationClasses} ${variantClasses[variant]} ${className}`.trim()
  
  return <div className={combinedClasses} />
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter, Container, Divider }