'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: () => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-500'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClassName: 'text-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-500'
  }
}

export function Toast({ type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300) // 等待退出动画完成
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-out',
      isExiting 
        ? 'translate-x-full opacity-0' 
        : 'translate-x-0 opacity-100'
    )}>
      <div className={cn(
        'p-4 rounded-lg border shadow-lg',
        config.className
      )}>
        <div className="flex items-start">
          <Icon className={cn('w-5 h-5 mt-0.5 mr-3 flex-shrink-0', config.iconClassName)} />
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium">{title}</h4>
            {message && (
              <p className="mt-1 text-sm opacity-90">{message}</p>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="ml-3 flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast容器组件
interface ToastContainerProps {
  toasts: Array<{
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
  }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ top: `${1 + index * 5}rem` }}
          className="fixed right-4 z-50"
        >
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </>
  )
}