'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { X, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return '不支持的文件类型。仅支持 JPEG, PNG, GIF, WEBP 格式'
      }

      // 检查文件大小
      if (file.size > maxSize * 1024 * 1024) {
        return `文件大小不能超过${maxSize}MB`
      }

      return null
    },
    [maxSize]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError('')
      setIsUploading(true)

      try {
        // 生成唯一文件名
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

        // 添加新的图片URL到数组中
        const newUrls = [...value, data.url]
        onChange(newUrls)
      } catch (err) {
        const message = err instanceof Error ? err.message : '上传失败，请重试'
        setError(message)
      } finally {
        setIsUploading(false)
      }
    },
    [validateFile, value, onChange]
  )

  const uploadMultipleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files)
      
      // 检查是否超过最大数量限制
      if (value.length + fileArray.length > maxImages) {
        setError(`最多只能上传 ${maxImages} 张图片`)
        return
      }

      // 逐个上传文件
      for (const file of fileArray) {
        await uploadFile(file)
      }
    },
    [uploadFile, value, maxImages]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        uploadMultipleFiles(files)
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

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
    setError('')
  }

  const canAddMore = value.length < maxImages

  return (
    <div className={cn('space-y-4', className)}>
      {/* 图片预览网格 */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group w-full h-32">
              <Image
                src={url}
                alt={`车辆图片 ${index + 1}`}
                fill
                className="object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  disabled={disabled || isUploading}
                >
                  <X className="w-4 h-4 mr-2" />
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
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
                <p className="text-gray-600">上传中...</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    {value.length === 0 ? placeholder : '继续添加图片'}
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

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading || !canAddMore}
        multiple
      />

      {/* 错误提示 */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 