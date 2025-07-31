'use client'

import { useState, useRef, useCallback } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  maxSize?: number // MB
  maxImages?: number
}

export function MultiImageUpload({
  value = [],
  onChange,
  disabled = false,
  className,
  placeholder = '点击上传图片或拖拽图片到此处',
  maxSize = 5,
  maxImages = 10,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return '不支持的文件类型。仅支持 JPEG, PNG, GIF, WEBP 格式'
      }

      if (file.size > maxSize * 1024 * 1024) {
        return `文件大小不能超过${maxSize}MB`
      }

      return null
    },
    [maxSize]
  )

  const uploadFile = async (file: File): Promise<string | null> => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return null
    }

    try {
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}-${randomString}.${extension}`

      const response = await fetch(`/api/upload?filename=${filename}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '上传失败')
      }
      return data.url
    } catch (err) {
      const message = err instanceof Error ? err.message : '上传失败，请重试'
      setError(message)
      return null
    }
  }

  const uploadMultipleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files)
      
      if (value.length + fileArray.length > maxImages) {
        setError(`最多只能上传 ${maxImages} 张图片`)
        return
      }

      setIsUploading(true)
      setError('')

      const uploadPromises = fileArray.map(uploadFile)
      const results = await Promise.all(uploadPromises)
      const newUrls = results.filter((url): url is string => url !== null)

      if (newUrls.length > 0) {
        onChange(newUrls)
      }

      setIsUploading(false)
    },
    [validateFile, value, onChange, maxImages]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        uploadMultipleFiles(files)
      }
      // 重置 file input
      if(e.target) {
        e.target.value = ''
      }
    },
    [uploadMultipleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !isUploading) {
      setIsDragging(true)
    }
  }, [disabled, isUploading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled || isUploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadMultipleFiles(files)
    }
  }, [disabled, isUploading, uploadMultipleFiles])

  const handleClick = () => {
    if (!disabled && !isUploading && value.length < maxImages) {
      fileInputRef.current?.click()
    }
  }

  const canAddMore = value.length < maxImages

  return (
    <div className={cn('space-y-4', className)}>
      {canAddMore && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'cursor-not-allowed opacity-50',
            isUploading && 'cursor-not-allowed'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center space-y-4">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                <p className="text-gray-600">上传中... ({value.length}/{maxImages})</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    {placeholder}
                  </p>
                  <p className="text-sm text-gray-500">
                    支持 JPEG, PNG, GIF, WEBP 格式，最大 {maxSize}MB
                  </p>
                  <p className="text-sm text-gray-500">
                    已上传 {value.length}/{maxImages} 张图片
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading || !canAddMore}
        multiple
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
