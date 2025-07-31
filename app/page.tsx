'use client'

import { MultiImageUpload } from "./components/MultiImageUpload";
import { ImageGallery } from "./components/ImageGallery";
import { ToastContainer } from "./components/Toast";
import { useToast } from "./hooks/useToast";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useState } from "react";
import { Download, Share2, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [urls, setUrls] = useLocalStorage<string[]>('imageUrls', []);
  const [isGalleryMode, setIsGalleryMode] = useState(false);
  const { toasts, removeToast, success, error, info } = useToast();

  const handleDownloadAll = async () => {
    if (urls.length === 0) return;
    
    try {
      info('开始下载', `正在下载 ${urls.length} 张图片...`);
      
      // 简单的下载功能 - 在实际应用中可以创建zip文件
      urls.forEach((url, index) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `image-${index + 1}.webp`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      
      success('下载完成', `成功下载 ${urls.length} 张图片`);
    } catch {
      error('下载失败', '请重试或检查网络连接');
    }
  };

  const handleShare = async () => {
    if (navigator.share && urls.length > 0) {
      try {
        await navigator.share({
          title: '我的图片集合',
          text: `分享 ${urls.length} 张精美图片`,
          url: window.location.href,
        });
        success('分享成功', '图片集合已成功分享');
      } catch (shareError) {
        if (shareError instanceof Error && shareError.name !== 'AbortError') {
          error('分享失败', '请重试或使用其他分享方式');
        }
      }
    } else {
      // 复制链接到剪贴板作为备用方案
      try {
        await navigator.clipboard.writeText(window.location.href);
        success('链接已复制', '页面链接已复制到剪贴板');
      } catch {
        info('分享提示', '请手动复制页面链接进行分享');
      }
    }
  };

  const handleImageUpload = (newlyUploadedUrls: string[]) => {
    const uniqueNewUrls = newlyUploadedUrls.filter(url => !urls.includes(url));
    if (uniqueNewUrls.length > 0) {
      setUrls(prevUrls => [...prevUrls, ...uniqueNewUrls]);
      success('上传成功', `成功上传 ${uniqueNewUrls.length} 张图片`);
    }
  };

  const handleImageRemove = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
    info('图片已删除', '图片已从集合中移除');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* 头部区域 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm float-animation">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Fancy Image Gallery
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              上传、展示和管理你的图片，体验流畅的拖拽上传和精美的画廊展示
            </p>
            
            {/* 统计信息 */}
            <div className="flex items-center justify-center space-x-8 text-white/90">
              <div className="text-center">
                <div className="text-2xl font-bold">{urls.length}</div>
                <div className="text-sm">已上传图片</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">WebP</div>
                <div className="text-sm">自动压缩</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">5MB</div>
                <div className="text-sm">最大文件</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 装饰性波浪 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-purple-50">
            <path d="M1200 120L0 16.48C0 16.48 20.67 8.64 41.33 8.64C62 8.64 103.33 16.48 144.67 16.48C186 16.48 227.33 8.64 268.67 8.64C310 8.64 351.33 16.48 392.67 16.48C434 16.48 475.33 8.64 516.67 8.64C558 8.64 599.33 16.48 640.67 16.48C682 16.48 723.33 8.64 764.67 8.64C806 8.64 847.33 16.48 888.67 16.48C930 16.48 971.33 8.64 1012.67 8.64C1054 8.64 1095.33 16.48 1136.67 16.48C1178 16.48 1200 12.56 1200 12.56V120Z"></path>
          </svg>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 操作按钮栏 */}
        {urls.length > 0 && (
          <div className="flex flex-wrap items-center justify-between mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <Button
                onClick={() => setIsGalleryMode(!isGalleryMode)}
                variant={isGalleryMode ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{isGalleryMode ? '网格视图' : '画廊视图'}</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownloadAll}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>下载全部</span>
              </Button>
              
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>分享</span>
              </Button>
            </div>
          </div>
        )}

        {/* 上传组件 */}
        <div className="mb-12">
          <MultiImageUpload 
            value={urls}
            onChange={handleImageUpload} 
            maxImages={20}
            maxSize={5}
          />
        </div>

        {/* 图片展示区域 */}
        {urls.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                你的图片集合
              </h2>
              <p className="text-gray-600">
                {urls.length} 张精美图片，点击查看大图
              </p>
            </div>
            
            <ImageGallery 
              images={urls} 
              isGalleryMode={isGalleryMode}
              onRemove={handleImageRemove}
            />
          </div>
        )}

        {/* 空状态 */}
        {urls.length === 0 && (
          <div className="text-center py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              开始上传你的第一张图片
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              支持拖拽上传，自动压缩优化，让你的图片在网络上飞速加载
            </p>
          </div>
        )}
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              ✨ Fancy Image Gallery - 让图片管理变得简单而优雅
            </p>
            <p className="text-sm">
              支持 JPEG、PNG、GIF、WebP 格式 | 自动压缩优化 | 响应式设计
            </p>
          </div>
        </div>
      </footer>

      {/* Toast 通知容器 */}
      <ToastContainer 
        toasts={toasts}
        onRemove={removeToast}
      />
    </div>
  );
}
