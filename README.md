## 一、什么是对象存储？为什么 Web 项目离不开它？

### 1.1 定义

> 👀思考一下，网站的图片放在哪儿？

对象存储（Object Storage）是一种用于存储非结构化数据（如图片、视频、音频、文档等）的存储架构。它与传统的文件系统或块存储不同，每个对象包含三部分：

- 数据本体（如图片本身）
- 元数据（如文件名、尺寸、上传时间等）
- 唯一标识符（Object Key）

对象存储专门用于存储各种类型的文件，这些文件不适合直接存放在MySQL等关系型数据库中。当我们思考网站上的图片、视频等内容存储位置时，对象存储就是答案。

### 1.2 为什么前端/全栈开发者必须了解对象存储？

- 📦 网站中的图片、用户上传的头像/视频/文档，本质都是对象存储的使用场景。
- ⚙️ 现代应用中，静态资源不再存数据库，而是"文件用对象存储 + 信息用数据库"的组合。
- ☁️ 云对象存储具备高可用性、自动备份、低延迟、CDN分发、版本控制等特点。
- 🔒 文件权限管理、预签名URL、临时访问控制都由平台管理，开发者专注业务逻辑。
- 🌍 对于出海项目，选择合适的对象存储服务能够提供更好的全球访问体验。

## 二、为什么推荐使用 Vercel Blob？

Vercel Blob 是由 Vercel 推出的对象存储服务，专为前端/全栈开发者设计，特别适合部署在 Vercel 平台的项目。

### 2.1 Vercel Blob 的优势

- 🆓 提供 1GB 的免费存储空间，适合小型项目和个人开发者使用
- 🌐 作为海外版的阿里云 OSS 平替，特别适合出海项目
- ⚡ 快速集成，仅需两行核心代码即可实现对象存储功能
- 🔄 无缝集成 Next.js 项目，提供官方 SDK 支持
- 🌍 全球 CDN 加速，自动优化全球访问体验
- 🔒 内置权限管理系统，支持公共和私有访问控制
- 📊 提供简洁易用的管理界面，方便开发者管理存储资源

## 三、如何使用 Vercel Blob（完整步骤）

> 快速上手，仅需五步！

### 3.1 注册并登录 Vercel

访问 [https://vercel.com](https://vercel.com/) 使用 GitHub/Google 账号注册登录。

### 3.2 创建一个项目（或打开已有项目）

你可以选择部署 Next.js 应用，或任意前后端项目，只要运行在 Vercel 平台即可。

### 3.3 启用 Blob 存储

1. 进入项目控制台
2. 点击导航栏中的 **"Storage"** 选项
3. 选择 **"Blob"** 并点击 **"Create database"**
4. 输入数据库名称
5. 选择合适的地区（建议选择离用户最近的区域，如亚洲用户可选择香港）
6. 点击 **"Create"** 完成创建
   1. ![img](https://jhs3zvvzsf.feishu.cn/space/api/box/stream/download/asynccode/?code=OTJmMjJjM2Q5ODQwNjkzNjRhYTI1YTc4Y2Y2YmMyZGRfZUpoOVdsOWZwYktubGc1MjA5Tk1OSlFuaXBIV0Z1UnJfVG9rZW46UWtoYmJVeUNvbzNqWjh4V1Y0N2NsYU03bktkXzE3NTM5NzY3NTE6MTc1Mzk4MDM1MV9WNA)

创建成功后，系统会显示核心代码示例，你可以直接复制使用。

### 3.4 安装 SDK

在你的项目中安装官方 SDK：

```Bash
pnpm install @vercel/blob
```

### 3.5 使用 Blob API 上传文件

Vercel 提供前端上传接口 + 服务端回调 + URL 获取的完整流程：

#### 后端示例代码（上传图片）：

app/api/upload/route.ts

```TypeScript
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
```

#### 前端上传：

app/components/MultiImageUpload.tsx

> 需要自行配置Shadcn(https://ui.shadcn.com/) 和lucide-react(https://lucide.dev/icons/)
>
> ```Bash
> pnpm dlx shadcn@latest init
> pnpm dlx shadcn@latest add button
> pnpm i lucide-react
> ```

```TypeScript
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
```

## 四、最佳实践：作品集/电商后台如何合理使用对象存储？

以作品集网站（如摄影师、设计师、插画师的 Portfolio）为例，假设你需要一个后台管理系统上传作品图：

### 4.1 系统架构建议

| 模块                       | 存储位置                    | 说明                          |
| -------------------------- | --------------------------- | ----------------------------- |
| 图片原图                   | Vercel Blob                 | 实际文件内容，不存数据库      |
| 图片链接                   | PostgreSQL                  | 存储 public URL               |
| 元数据（标题、标签、描述） | PostgreSQL                  | 查询效率更高                  |
| 上传者信息/权限            | PostgreSQL                  | 控制访问                      |
| 缩略图                     | 可选：处理后再次上传到 Blob | 提前渲染展示用缩略图，提升 UX |

### 4.2 示例数据库结构

```SQL
CREATE TABLE portfolio_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(512) NOT NULL,
  thumbnail_url VARCHAR(512),
  file_size INTEGER,
  content_type VARCHAR(100),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploader_id INTEGER REFERENCES users(id)
);
```

### 4.3 文件上传逻辑流程

![img](https://jhs3zvvzsf.feishu.cn/space/api/box/stream/download/asynccode/?code=NTY2MDY1MmE4NzRkMTY4MDFlMDMyM2JjODc4MDE3YWJfWFQ2QldEeGxGUWZNVTgzcnFWbm5kdVN3U1huSk1HcEJfVG9rZW46V2J1ZGJ5dUdWb1VvS3d4V1ljOGNHd3RjbnpmXzE3NTM5NzY3NTE6MTc1Mzk4MDM1MV9WNA)

## 五、注意事项与进阶建议

### 5.1 文件权限

- Vercel Blob 默认支持 `public` 与 `private` 两种权限
- 可搭配 [签名 URL](https://vercel.com/docs/storage/vercel-blob/permissions) 控制访问时间
- 对于敏感内容，建议使用 `private` 权限并通过签名 URL 临时授权访问
  - 

### 5.2 临时文件管理

- Blob 支持设置 `addOptions.expiresAt` 生成临时对象，适用于验证码、草稿图等场景。
- 临时文件会自动过期删除，无需手动清理，减少存储成本
  - 

### 5.3 CDN 优化

- Blob URL 自动走 Vercel CDN，无需额外配置，非常适合全球访问场景。
- 对于全球用户的项目，选择合适的存储区域可以降低访问延迟
  - 

### 5.4 文件删除

- 使用 `del(key)` 可删除 Blob 文件，避免垃圾文件占用存储空间。
- 在删除数据库记录时，应当同时删除对应的 Blob 文件，保持数据一致性
  - 

### 5.5 文件处理与优化

- 图片上传前应进行格式转换（如转换为WebP）和压缩，以节省存储空间和提高加载速度
- 可设置文件大小限制（如5MB），防止过大文件影响系统性能
- 对于不同展示场景，可生成多种尺寸的图片（如缩略图、中等尺寸、原图），按需加载
  - 

## 六、参考资源

- 📚 官方文档：https://vercel.com/docs/storage/vercel-blob
- 🎥 视频教程：Vercel Blob 对象存储使用指南
- 📦 其他对象存储服务对比：MinIO、阿里云 OSS、腾讯云 COS

## 七、常见问题（FAQ）

| 问题                   | 回答                                                         |
| ---------------------- | ------------------------------------------------------------ |
| 免费额度是多少？       | Hobby 用户免费有 1 GB 存储 + 10 GB 出站流量。                |
| 可以上传多大文件？     | Server Upload 受限约 4.5MB；Client Upload（multipart=true）支持高至 5TB。 |
| 文件可以覆盖吗？       | 默认不允许覆盖，可设置 allowOverwrite: true。                |
| 文件访问是否私密？     | 支持 public、private 访问选项，私有文件可配合签名 URL 控制访问时效。 |
| 可以绑定自定义域名吗？ | 暂不支持，Blob URL 是 Vercel 提供的域名，无法使用自定义域名。 |
| 如何控制缓存更新？     | 使用非缓存 URL（附加时间戳）或设置合理的 cacheControlMaxAge。 |
| 删除文件是否收费？     | 删除属于高级操作，但不计入存储费用；但浏览器控制台操作计费。 |

---

# ✨ Fancy Image Gallery Demo

基于上述Vercel Blob存储技术，我们构建了一个功能丰富、界面精美的图片上传和展示demo网页。

## 🌟 Demo特性

### 📤 智能上传
- **拖拽上传**: 支持直接拖拽图片到上传区域
- **多图片上传**: 一次可上传多张图片
- **格式支持**: 支持 JPEG、PNG、GIF、WebP 格式
- **自动压缩**: 使用Sharp自动压缩并转换为WebP格式
- **文件验证**: 自动检查文件类型和大小限制

### 🖼️ 精美展示
- **双视图模式**: 网格视图和画廊视图切换
- **灯箱效果**: 点击图片查看大图，支持缩放、旋转
- **键盘导航**: 支持方向键切换、ESC关闭、+/-缩放等
- **缩略图导航**: 底部缩略图快速跳转
- **响应式设计**: 完美适配PC和移动端

### 🎨 用户体验
- **流畅动画**: 丰富的CSS动画和过渡效果
- **Toast通知**: 实时操作反馈
- **加载状态**: 优雅的加载动画
- **悬停效果**: 图片悬停时的光影效果
- **渐变背景**: 美观的渐变色彩搭配

### 🛠️ 功能特性
- **批量下载**: 一键下载所有图片
- **分享功能**: 支持原生分享API和链接复制
- **图片管理**: 单独删除不需要的图片
- **全屏查看**: 支持全屏模式浏览
- **图片计数**: 实时显示上传进度

## 🚀 技术栈

- **框架**: Next.js 15.3.2 (App Router)
- **UI库**: shadcn/ui + Tailwind CSS
- **图片处理**: Sharp (服务端压缩)
- **存储**: Vercel Blob Storage
- **图标**: Lucide React
- **TypeScript**: 完整类型支持

## 📦 快速开始

1. **安装依赖**:
```bash
sudo pnpm install
```

2. **配置环境变量**:
创建 `.env.local` 文件并添加Vercel Blob存储配置:
```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

3. **启动开发服务器**:
```bash
pnpm dev
```

4. **访问应用**:
打开 [http://localhost:3000](http://localhost:3000)

## 🎯 使用方法

### 上传图片
1. 点击上传区域或直接拖拽图片
2. 支持同时选择多张图片
3. 自动压缩并转换为WebP格式
4. 实时显示上传进度

### 查看图片
1. 点击任意图片进入灯箱模式
2. 使用方向键或点击按钮切换图片
3. 滚轮或+/-键进行缩放
4. R键旋转图片

### 管理图片
1. 悬停在图片上显示操作按钮
2. 点击删除按钮移除单张图片
3. 使用顶部工具栏批量操作
4. 切换网格/画廊视图模式

## 🎨 自定义样式

项目使用了丰富的CSS动画效果，包括：
- 图片网格淡入动画
- 悬停光影效果
- 灯箱进入/退出动画
- 浮动动画
- 脉冲效果
- 自定义滚动条

## 📱 响应式设计

- **移动端**: 2列网格布局
- **平板**: 3-4列网格布局  
- **桌面端**: 4-5列网格布局
- **大屏**: 5列以上网格布局

## 🔧 核心组件

- `MultiImageUpload`: 多图片上传组件
- `ImageGallery`: 图片展示画廊组件
- `Toast`: 通知提示组件
- `LoadingSpinner`: 加载动画组件

## 🌐 部署

项目已配置好Vercel部署，推送到GitHub后可自动部署。

---

**让图片管理变得简单而优雅** ✨