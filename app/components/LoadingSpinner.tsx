'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div className="relative">
        {/* 外圈 */}
        <div className={cn(
          'rounded-full border-2 border-gray-200 animate-spin',
          sizeClasses[size]
        )}>
          <div className={cn(
            'rounded-full border-2 border-transparent border-t-blue-500 animate-spin',
            sizeClasses[size]
          )}></div>
        </div>
        
        {/* 内圈 */}
        <div className={cn(
          'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300 animate-pulse',
          size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'
        )}></div>
      </div>
      
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
}