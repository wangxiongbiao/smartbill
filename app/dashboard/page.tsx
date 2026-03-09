'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Plus, Search, Filter, Eye, Edit, Trash2, FileText, Loader2, Download } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getUserInvoices, deleteInvoice } from '@/lib/invoices';
import InvoicePdfPreviewDialog from '@/components/invoice/InvoicePdfPreviewDialog';
import { Invoice } from '@/types/invoice';

const statusMap = {
  paid: { label: '已付款', className: 'bg-green-100 text-green-700' },
  sent: { label: '待付款', className: 'bg-yellow-100 text-yellow-700' },
  draft: { label: '草稿', className: 'bg-gray-100 text-gray-700' },
  overdue: { label: '已逾期', className: 'bg-red-100 text-red-700' },
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 加载发票数据
  useEffect(() => {
    if (!user?.id) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    async function loadInvoices(userId: string) {
      try {
        setLoading(true);
        const data = await getUserInvoices(userId);
        setInvoices(data);
      } catch (err) {
        console.error('加载发票失败:', err);
        setError('加载发票数据失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    }

    loadInvoices(user.id);
  }, [user]);

  // 计算统计数据
  const stats = React.useMemo(() => {
    const normalizeStatus = (status?: string) => (status || 'Draft').toLowerCase();

    const calculateLineAmount = (item: Invoice['items'][number]) => {
      if (item.amount !== undefined && item.amount !== '') {
        const amount = Number(item.amount);
        if (Number.isFinite(amount)) {
          return amount;
        }
      }

      return Number(item.quantity || 0) * Number(item.rate || 0);
    };

    const calculateTotal = (inv: Invoice) => {
      return inv.items.reduce((sum, item) => sum + calculateLineAmount(item), 0);
    };

    const totalRevenue = invoices
      .filter(inv => normalizeStatus(inv.status) === 'paid')
      .reduce((sum, inv) => sum + calculateTotal(inv), 0);

    const pendingAmount = invoices
      .filter(inv => normalizeStatus(inv.status) === 'sent')
      .reduce((sum, inv) => sum + calculateTotal(inv), 0);

    const pendingCount = invoices.filter(inv => normalizeStatus(inv.status) === 'sent').length;

    // 获取本月新增
    const now = new Date();
    const thisMonthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date || inv.updatedAt || '');
      return invDate.getMonth() === now.getMonth() &&
        invDate.getFullYear() === now.getFullYear();
    });

    return {
      totalRevenue,
      pendingAmount,
      pendingCount,
      totalCount: invoices.length,
      thisMonthCount: thisMonthInvoices.length,
      calculateTotal
    };
  }, [invoices]);

  // 搜索过滤
  const filteredInvoices = React.useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const query = searchQuery.toLowerCase();
    return invoices.filter(inv =>
      inv.invoiceNumber?.toLowerCase().includes(query) ||
      inv.client?.name?.toLowerCase().includes(query) ||
      inv.client?.address?.toLowerCase().includes(query)
    );
  }, [invoices, searchQuery]);

  // 分页
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 删除发票
  const handleDelete = async (invoiceId: string) => {
    if (!confirm('确定要删除这张发票吗？')) return;
    try {
      await deleteInvoice(invoiceId);
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败，请重试');
    }
  };

  const handlePreviewPdf = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
  };

  // 获取状态显示
  const getStatusDisplay = (status?: string) => {
    const key = (status || 'Draft').toLowerCase() as keyof typeof statusMap;
    return statusMap[key] || statusMap.draft;
  };

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN');
    } catch (e) {
      return '-';
    }
  };

  const formatCurrency = (invoice: Invoice) => {
    const total = stats.calculateTotal(invoice);

    try {
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: invoice.currency || 'USD',
      }).format(total);
    } catch {
      return `${invoice.currency || 'USD'} ${total.toFixed(2)}`;
    }
  };

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-500">初始化中...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-500">加载中...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            刷新重试
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">总收入</p>
                <p className="text-2xl font-bold text-gray-800">¥{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              已付款收入
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">待付款发票</p>
                <p className="text-2xl font-bold text-gray-800">¥{stats.pendingAmount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">{stats.pendingCount} 张发票待处理</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">发票总数</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-4">
              {stats.thisMonthCount > 0 ? `本月新增 ${stats.thisMonthCount} 张` : '本月暂无新增'}
            </p>
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
                  placeholder="搜索发票编号或客户名称..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors text-sm">
                <Filter className="w-4 h-4" />
                筛选
              </button>
              <Link
                href="/invoice/new"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-sm font-semibold !text-white"
                style={{ color: 'white' }}
              >
                <Plus className="w-4 h-4" style={{ color: 'white' }} />
                <span style={{ color: 'white' }}>新建发票</span>
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredInvoices.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchQuery ? '没有找到匹配的发票' : '暂无发票数据'}
                </p>
                {!searchQuery && (
                  <Link
                    href="/invoice/new"
                    className="text-primary hover:underline text-sm"
                  >
                    创建第一张发票 →
                  </Link>
                )}
              </div>
            ) : (
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
                  {paginatedInvoices.map((invoice) => {
                    const status = getStatusDisplay(invoice.status);
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber || invoice.id.slice(0, 8)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {invoice.client?.name || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(invoice)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{formatDate(invoice.date || invoice.updatedAt)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{formatDate(invoice.dueDate)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/invoice/${invoice.id}?view=preview`}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/invoice/${invoice.id}?edit=true`}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handlePreviewPdf(invoice)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="预览并下载 PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredInvoices.length > 0 && (
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                显示 {Math.min((currentPage - 1) * itemsPerPage + 1, filteredInvoices.length)}-
                {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} 条，
                共 {filteredInvoices.length} 条
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${currentPage === page
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <InvoicePdfPreviewDialog
        invoice={previewInvoice}
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
      />
    </DashboardLayout>
  );
}
