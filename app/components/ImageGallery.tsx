'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, Trash2, Maximize, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '../hooks/useToast'

interface ImageGalleryProps {
  images: string[]
  isGalleryMode?: boolean
  onRemove?: (index: number) => void
}

export function ImageGallery({ images, isGalleryMode = false, onRemove }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { success } = useToast()

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return

      switch (e.key) {
        case 'Escape':
          setSelectedIndex(null)
          setZoom(1)
          setRotation(0)
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          setZoom(prev => Math.min(prev + 0.25, 3))
          break
        case '-':
          setZoom(prev => Math.max(prev - 0.25, 0.25))
          break
        case 'r':
        case 'R':
          setRotation(prev => prev + 90)
          break
      }
    }

    if (selectedIndex !== null) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedIndex])

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setZoom(1)
    setRotation(0)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
    setZoom(1)
    setRotation(0)
    setIsFullscreen(false)
  }

  const goToPrevious = () => {
    if (selectedIndex === null) return
    setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
    setZoom(1)
    setRotation(0)
  }

  const goToNext = () => {
    if (selectedIndex === null) return
    setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
    setZoom(1)
    setRotation(0)
  }

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `image-${index + 1}.webp`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      success('复制成功', '图片URL已复制到剪贴板')
    })
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  if (images.length === 0) return null

  return (
    <>
      <div className={cn(
        "grid gap-8",
        isGalleryMode 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      )}>
        {images.map((url, index) => (
          <div key={index} className="space-y-3">
            <div
              className={cn(
                "group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:shadow-xl grid-item image-hover-effect",
                isGalleryMode 
                  ? "aspect-[4/3] hover:scale-[1.02]" 
                  : "aspect-square hover:scale-105"
              )}
              onClick={() => openLightbox(index)}
            >
              <Image
                src={url}
                alt={`图片 ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes={isGalleryMode ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"}
              />
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-black"
                    onClick={(e) => {
                      e.stopPropagation()
                      openLightbox(index)
                    }}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-black"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(url, index)
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  {onRemove && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-500/90 hover:bg-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(index)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full text-xs bg-gray-100 border-gray-300 rounded-md py-2 px-3 pr-10 truncate"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-800"
                onClick={() => handleCopyUrl(url)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center lightbox-enter">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.25))}
              disabled={zoom <= 0.25}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-white text-sm px-2">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-white/30 mx-2" />

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setRotation(prev => prev + 90)}
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => handleDownload(images[selectedIndex], selectedIndex)}
            >
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
            
            {onRemove && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onRemove(selectedIndex)
                  if (selectedIndex >= images.length - 1) {
                    setSelectedIndex(images.length > 1 ? selectedIndex - 1 : null)
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除
              </Button>
            )}
          </div>

          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <div
              className="relative transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <Image
                src={images[selectedIndex]}
                alt={`图片 ${selectedIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex items-center space-x-2 bg-black/60 p-2 rounded-lg max-w-[80vw] overflow-x-auto custom-scrollbar">
                {images.map((url, index) => (
                  <button
                    key={index}
                    className={cn(
                      "relative w-12 h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0",
                      index === selectedIndex 
                        ? "border-white scale-110" 
                        : "border-transparent hover:border-white/50"
                    )}
                    onClick={() => {
                      setSelectedIndex(index)
                      setZoom(1)
                      setRotation(0)
                    }}
                  >
                    <Image
                      src={url}
                      alt={`缩略图 ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="absolute top-20 left-4 z-10 text-white/70 text-xs space-y-1">
            <div>ESC: 关闭</div>
            <div>←→: 切换图片</div>
            <div>+/-: 缩放</div>
            <div>R: 旋转</div>
          </div>
        </div>
      )}
    </>
  )
}
