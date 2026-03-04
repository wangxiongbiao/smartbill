'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Plus, Search, MoreVertical, Eye, Edit, Copy, Trash2, Star } from 'lucide-react';
import Link from 'next/link';

// 模拟模板数据
const mockTemplates = [
  {
    id: 'temp-001',
    name: '简约专业版',
    description: '简洁大方的商务风格，适合各类企业',
    preview: '/templates/simple.png',
    category: '商务',
    isDefault: true,
    lastUsed: '2024-03-20',
  },
  {
    id: 'temp-002',
    name: '现代科技风',
    description: '充满科技感的渐变设计，适合互联网公司',
    preview: '/templates/tech.png',
    category: '科技',
    isDefault: false,
    lastUsed: '2024-03-18',
  },
  {
    id: 'temp-003',
    name: '创意设计版',
    description: '色彩丰富的创意设计，适合创意行业',
    preview: '/templates/creative.png',
    category: '创意',
    isDefault: false,
    lastUsed: '2024-03-15',
  },
  {
    id: 'temp-004',
    name: '经典传统版',
    description: '稳重大气的传统风格，适合传统行业',
    preview: '/templates/classic.png',
    category: '传统',
    isDefault: false,
    lastUsed: '2024-03-10',
  },
];

export default function TemplatesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">发票模板</h1>
            <p className="text-gray-500 mt-1">管理和自定义您的发票模板</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索模板..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />
              新建模板
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTemplates.map((template) => (
            <div 
              key={template.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Preview Image */}
              <div className="aspect-[4/3] bg-gray-100 relative group">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-3 rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                </div>

                {/* Default Badge */}
                {template.isDefault && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-primary text-white text-xs font-medium">
                    <Star className="w-3 h-3" />
                    默认
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800">{template.name}</h3>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    {template.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    最近使用: {template.lastUsed}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <Copy className="w-4 h-4" />
                    复制
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
