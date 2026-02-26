import React, { useState, useEffect } from 'react';

interface TooltipProps {
  message: string;
  storageKey: string; // 用于localStorage的key
}

// 工具函数：关闭指定的tooltip
export const closeTooltip = (storageKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, 'false');
    // 触发自定义事件通知所有Tooltip组件更新
    window.dispatchEvent(new Event('tooltip-update'));
  }
};

export const Tooltip: React.FC<TooltipProps> = ({ message, storageKey }) => {
  // 初始状态始终为true，避免hydration不匹配
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // 客户端挂载后读取localStorage
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'false') {
        setIsVisible(false);
      }
    }
  }, [storageKey]);

  // 监听localStorage变化（用于其他地方触发关闭）
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored === 'false') {
          setIsVisible(false);
        }
      }
    };

    // 自定义事件监听
    window.addEventListener('tooltip-update', handleStorageChange);
    return () => {
      window.removeEventListener('tooltip-update', handleStorageChange);
    };
  }, [storageKey]);

  const handleClose = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'false');
    }
  };

  // 在客户端挂载前或不可见时不渲染
  if (!isMounted || !isVisible) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-blue-700 shadow-sm">
      <span className="material-symbols-outlined text-base text-blue-500">info</span>
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={handleClose}
        className="text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0"
        aria-label="Close tooltip"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
};
