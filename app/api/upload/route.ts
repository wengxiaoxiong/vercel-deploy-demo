import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json(
        { error: '缺少文件名参数' },
        { status: 400 }
      )
    }

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const contentType = request.headers.get('content-type')
    
    if (!contentType || !allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: '不支持的文件类型。仅支持 JPEG, PNG, GIF, WEBP 格式' },
        { status: 400 }
      )
    }

    // 检查文件大小 (5MB限制，因为我们会压缩)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过5MB' },
        { status: 400 }
      )
    }

    if (!request.body) {
      return NextResponse.json(
        { error: '请求体为空' },
        { status: 400 }
      )
    }

    // 读取图像数据
    const imageBuffer = Buffer.from(await request.arrayBuffer())

    // 使用 sharp 处理图像：压缩并转换为 WebP
    const processedImageBuffer = await sharp(imageBuffer)
      .webp({ 
        quality: 85, // 设置质量为85%，平衡文件大小和图像质量
        effort: 4    // 压缩努力程度，4是一个不错的平衡点
      })
      .resize(2048, 2048, { 
        fit: 'inside',        // 保持宽高比
        withoutEnlargement: true // 不放大小图像
      })
      .toBuffer()

    // 生成新的文件名，确保扩展名为 .webp
    const webpFilename = filename.replace(/\.[^/.]+$/, '.webp')

    const blob = await put(webpFilename, processedImageBuffer, {
      access: 'public',
      contentType: 'image/webp'
    })

    return NextResponse.json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      originalSize: imageBuffer.length,
      compressedSize: processedImageBuffer.length,
      compressionRatio: Math.round((1 - processedImageBuffer.length / imageBuffer.length) * 100)
    })
  } catch (error) {
    console.error('上传失败:', error)
    return NextResponse.json(
      { error: '上传失败，请重试' },
      { status: 500 }
    )
  }
} 