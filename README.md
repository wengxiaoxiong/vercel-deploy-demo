# Fancy Image Gallery

一个使用 Next.js 和 Vercel Blob 构建的现代化、响应式的图片画廊应用。用户可以轻松上传、预览、管理和分享他们的图片集合。

## ✨ 主要功能

- **多图上传**: 支持一次性拖拽或选择多个图片文件进行上传。
- **Vercel Blob 存储**: 所有图片都安全地存储在 Vercel 的 Blob 存储中。
- **自动图片优化**: 上传时自动将图片压缩并转换为 `WebP` 格式，以获得最佳性能。
- **两种视图模式**: 提供精美的 **画廊模式** 和紧凑的 **网格模式** 来浏览图片。
- **本地持久化**: 已上传的图片列表会保存在浏览器的 Local Storage 中，刷新页面不丢失。
- **便捷操作**:
  - **一键下载**: 将所有图片打包下载。
  - **轻松分享**: 一键复制页面链接进行分享。
  - **管理图片**: 可以随时从图库中移除单张图片。
- **实时通知**: 通过 Toast 组件提供清晰的操作反馈（如上传成功、删除、下载等）。
- **响应式设计**: 在桌面和移动设备上都有出色的视觉和使用体验。
- **空状态提示**: 在没有图片时提供友好的上传引导。

## 🛠️ 技术栈

- **框架**: [Next.js](https://nextjs.org/) (App Router)
- **UI 库**: [React](https://react.dev/)
- **文件存储**: [@vercel/blob](https://vercel.com/storage/blob)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **图标**: [Lucide React](https://lucide.dev/)
- **类型检查**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 快速开始

请按照以下步骤在本地运行该项目。

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/your-repository.git
cd your-repository
```

### 2. 安装依赖

项目使用 `pnpm` 作为包管理器。

```bash
pnpm install
```

### 3. 配置环境变量

为了使 Vercel Blob 正常工作，你需要在 Vercel 上创建一个新的 Blob 存储。

1.  访问 [Vercel Storage](https://vercel.com/dashboard/stores) 并创建一个新的 Blob 存储。
2.  将项目连接到该存储。Vercel 会自动提供所需的环境变量。
3.  从 Vercel 项目设置中复制环境变量，并在你的项目根目录下创建一个 `.env.local` 文件。

你的 `.env.local` 文件应如下所示：

```env
BLOB_READ_WRITE_TOKEN=your_blob_read_write_token
```

> 更多信息请参考 [Vercel Blob 快速入门](https://vercel.com/docs/storage/vercel-blob/quickstart)。

### 4. 运行开发服务器

现在你可以启动本地开发服务器了。

```bash
pnpm dev
```

在浏览器中打开 `http://localhost:3000` 查看项目。

