'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';

// 模拟发票数据
const mockInvoices = [
  {
    id: 'INV-001',
    clientName: 'ABC科技有限公司',
    amount: 12500.00,
    currency: 'CNY',
    status: 'paid',
    date: '2024-03-15',
    dueDate: '2024-04-15',
  },
  {
    id: 'INV-002',
    clientName: '创新设计工作室',
    amount: 8600.00,
    currency: 'CNY',
    status: 'pending',
    date: '2024-03-18',
    dueDate: '2024-04-18',
  },
  {
    id: 'INV-003',
    clientName: '环球贸易集团',
    amount: 25800.00,
    currency: 'USD',
    status: 'overdue',
    date: '2024-03-01',
    dueDate: '2024-03-31',
  },
  {
    id: 'INV-004',
    clientName: '数字营销公司',
    amount: 5400.00,
    currency: 'CNY',
    status: 'paid',
    date: '2024-03-20',
    dueDate: '2024-04-20',
  },
  {
    id: 'INV-005',
    clientName: '咨询顾问有限公司',
    amount: 15000.00,
    currency: 'CNY',
    status: 'pending',
    date: '2024-03-22',
    dueDate: '2024-04-22',
  },
];

const statusMap = {
  paid: { label: '已付款', className: 'bg-green-100 text-green-700' },
  pending: { label: '待付款', className: 'bg-yellow-100 text-yellow-700' },
  overdue: { label: '已逾期', className: 'bg-red-100 text-red-700' },
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">本月收入</p>
                <p className="text-2xl font-bold text-gray-800">¥42,500</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              +12.5% 较上月
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">待付款发票</p>
                <p className="text-2xl font-bold text-gray-800">¥23,600</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">2 张发票待处理</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">发票总数</p>
                <p className="text-2xl font-bold text-gray-800">128</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-4">本月新增 12 张</p>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-800">发票列表</h2>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索发票..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors text-sm">
                <Filter className="w-4 h-4" />
                筛选
              </button>
              <Link
                href="/invoice/new"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-semibold"
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="text-white">新建发票</span>
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">发票编号</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">客户名称</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">金额</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">开票日期</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">到期日</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{invoice.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{invoice.clientName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {invoice.currency === 'CNY' ? '¥' : '$'}{invoice.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusMap[invoice.status as keyof typeof statusMap].className
                      }`}>
                        {statusMap[invoice.status as keyof typeof statusMap].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{invoice.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{invoice.dueDate}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">显示 1-5 条，共 128 条</p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                上一页
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium">1</button>
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors">2</button>
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors">3</button>
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors">
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
