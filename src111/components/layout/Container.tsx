import React from 'react'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * Responsive container for consistent max-width and horizontal padding.
 * Applies mobile-first, professional layout standards with Shadcn design system.
 */
export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 ${className}`.trim()}
      data-testid="container"
    >
      {children}
    </div>
  )
} 