'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Star,
  Check,
  Download,
  Sparkles,
  Copy,
  AlertCircle
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import { createDefaultInvoice } from '@/lib/invoice-defaults';
import { TemplateType } from '@/types/invoice';
import { getUserInvoices } from '@/lib/invoices';
import {
  createTemplate,
  deleteTemplate,
  getUserTemplates,
  markTemplateUsed,
  updateTemplate,
  type InvoiceTemplateRecord
} from '@/lib/templates';
import { downloadInvoicePdf } from '@/lib/pdf-client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const baseTemplateOptions: Array<{ value: TemplateType; label: string; category: string }> = [
  { value: 'minimalist', label: '极简版', category: '通用' },
  { value: 'modern', label: '现代护眼版', category: '创意' },
  { value: 'professional', label: '商务严谨版', category: '商务' },
];

const emptyTemplateForm = {
  name: '',
  description: '',
  category: '自定义',
  baseTemplate: 'minimalist' as TemplateType,
};

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [templateList, setTemplateList] = useState<InvoiceTemplateRecord[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<InvoiceTemplateRecord | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplateRecord | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [latestInvoice, setLatestInvoice] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyTemplateForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id;

    let mounted = true;
    async function bootstrap(resolvedUserId: string) {
      try {
        setLoading(true);
        const [templates, invoices] = await Promise.all([
          getUserTemplates(resolvedUserId),
          getUserInvoices(resolvedUserId).catch(() => []),
        ]);
        if (!mounted) return;
        setTemplateList(templates);
        setLatestInvoice(invoices[0] || null);
      } catch (err) {
        console.error('Failed to load templates:', err);
        if (!mounted) return;
        setFeedback({ type: 'error', message: '模板加载失败，请刷新后重试。' });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap(userId);
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const previewSeedInvoice = useMemo(() => {
    const inv = createDefaultInvoice(user?.id);
    inv.invoiceNumber = latestInvoice?.invoiceNumber || 'INV-PREVIEW-001';

    if (latestInvoice) {
      inv.client = latestInvoice.client;
      inv.sender = latestInvoice.sender;
      inv.items = latestInvoice.items?.length > 0 ? latestInvoice.items : inv.items;
      inv.currency = latestInvoice.currency;
      inv.taxRate = latestInvoice.taxRate;
      inv.paymentInfo = latestInvoice.paymentInfo;
      inv.notes = latestInvoice.notes;
    } else {
      inv.client = {
        name: '示例客户公司',
        email: 'client@example.com',
        address: '上海市浦东新区张江高科技园区 100 号',
        phone: '138-0000-0000'
      };
      inv.sender = {
        name: '您的公司名称',
        email: 'contact@yourcompany.com',
        address: '北京市朝阳区望京 SOHO',
        phone: '400-888-8888',
        disclaimerText: '感谢您的惠顾，这是系统自动生成的预览发票。'
      };
      inv.items = [
        { id: '1', description: '网站高端定制开发服务', quantity: 1, rate: 15000, amount: 15000 },
        { id: '2', description: '一年的服务器托管及技术支持', quantity: 1, rate: 5000, amount: 5000 },
      ];
    }

    return inv;
  }, [latestInvoice, user?.id]);

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return templateList;
    return templateList.filter((template) =>
      [template.name, template.description, template.category]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [templateList, searchQuery]);

  const resetCreateForm = () => setCreateForm(emptyTemplateForm);

  const templatePreviewInvoice = (template: InvoiceTemplateRecord) => ({
    ...previewSeedInvoice,
    ...template.invoice,
    template: template.baseTemplate,
    invoiceNumber: template.invoice.invoiceNumber || previewSeedInvoice.invoiceNumber,
  });

  const handleUseTemplate = async (template: InvoiceTemplateRecord) => {
    const userId = user?.id;
    if (userId && !template.isDefault) {
      await markTemplateUsed(userId, template.id);
    }
    router.push(`/invoice/new?template=${template.baseTemplate}`);
  };

  const handleDeleteTemplate = async (template: InvoiceTemplateRecord) => {
    if (template.isDefault) {
      setFeedback({ type: 'error', message: '系统默认模板不支持删除。' });
      return;
    }

    const userId = user?.id;
    if (!userId || !confirm(`确定要删除模板「${template.name}」吗？`)) return;

    try {
      await deleteTemplate(userId, template.id);
      setTemplateList((prev) => prev.filter((item) => item.id !== template.id));
      setActiveDropdown(null);
      setFeedback({ type: 'success', message: `已删除模板「${template.name}」。` });
    } catch (err) {
      console.error('Delete template failed:', err);
      setFeedback({ type: 'error', message: '删除模板失败，请稍后重试。' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id;
    if (!editingTemplate || !userId) return;

    try {
      setSubmitting(true);
      const updated = await updateTemplate(userId, editingTemplate.id, {
        name: editingTemplate.name,
        description: editingTemplate.description,
        category: editingTemplate.category,
        baseTemplate: editingTemplate.baseTemplate,
        invoice: {
          ...editingTemplate.invoice,
          template: editingTemplate.baseTemplate,
        },
        colors: editingTemplate.colors,
      });
      setTemplateList((prev) => prev.map((template) => template.id === updated.id ? updated : template));
      setEditingTemplate(null);
      setActiveDropdown(null);
      setFeedback({ type: 'success', message: `模板「${updated.name}」已保存。` });
    } catch (err) {
      console.error('Update template failed:', err);
      setFeedback({ type: 'error', message: '保存模板失败，请稍后重试。' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSubmitting(true);
      const invoice = {
        ...previewSeedInvoice,
        id: `draft_${Date.now()}`,
        template: createForm.baseTemplate,
      };
      const created = await createTemplate(user.id, {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        category: createForm.category.trim() || '自定义',
        baseTemplate: createForm.baseTemplate,
        invoice,
      });
      setTemplateList((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      resetCreateForm();
      setFeedback({ type: 'success', message: `模板「${created.name}」创建成功。` });
    } catch (err) {
      console.error('Create template failed:', err);
      setFeedback({ type: 'error', message: '创建模板失败，请稍后重试。' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportTemplatePdf = async (template: InvoiceTemplateRecord) => {
    try {
      await downloadInvoicePdf({
        invoice: templatePreviewInvoice(template),
        fileName: template.name,
      });
      setFeedback({ type: 'success', message: `模板「${template.name}」的 PDF 已开始下载。` });
    } catch (err) {
      console.error('Export template PDF failed:', err);
      setFeedback({ type: 'error', message: '导出 PDF 失败，请稍后重试。' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
              <Sparkles className="h-3.5 w-3.5" />
              模板中心
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">发票模板</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              管理你的默认模板和自定义模板。现在支持创建、编辑、删除与实时预览，刷新后也会保留。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索模板名称、描述、分类..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 sm:w-80"
              />
            </div>
            <button
              onClick={() => {
                resetCreateForm();
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              新建模板
            </button>
          </div>
        </div>

        {feedback && (
          <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-rose-100 bg-rose-50 text-rose-700'}`}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">{feedback.message}</div>
            <button onClick={() => setFeedback(null)} className="text-current/70 transition hover:text-current">关闭</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">模板总数</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{templateList.length}</p>
            <p className="mt-2 text-xs text-slate-400">包含默认模板和你创建的专属模板</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">自定义模板</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{templateList.filter((item) => !item.isDefault).length}</p>
            <p className="mt-2 text-xs text-slate-400">支持编辑名称、描述、分类及基础样式</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">最近活动</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{templateList[0]?.lastUsed ? new Date(templateList[0].lastUsed).toLocaleDateString('zh-CN') : '暂无记录'}</p>
            <p className="mt-2 text-xs text-slate-400">使用模板后会自动更新最近使用时间</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center text-slate-500">
            正在加载模板数据...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => (
              <article
                key={template.id}
                className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.15),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
                  <div
                    className="pointer-events-none absolute left-1/2 top-[7%] w-[210mm] -translate-x-1/2 origin-top scale-[0.34] rounded-lg border border-slate-200 bg-white shadow-lg transition duration-500 group-hover:-translate-y-2"
                  >
                    <InvoicePreview invoice={templatePreviewInvoice(template)} template={template.baseTemplate} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/70 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-950/35 opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="rounded-2xl bg-white/90 p-3 text-slate-700 shadow-lg transition hover:scale-105 hover:bg-white"
                      title="预览模板"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:scale-105 hover:bg-blue-700"
                    >
                      <Check className="h-4 w-4" />
                      使用模板
                    </button>
                  </div>
                  {template.isDefault && (
                    <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-slate-900/10">
                      <Star className="h-3.5 w-3.5" />
                      默认模板
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{template.description}</p>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === template.id ? null : template.id);
                        }}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeDropdown === template.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-2xl shadow-slate-900/10">
                            <button
                              onClick={() => {
                                setPreviewTemplate(template);
                                setActiveDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" /> 预览
                            </button>
                            <button
                              onClick={() => {
                                setEditingTemplate(template);
                                setActiveDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={template.isDefault}
                            >
                              <Edit className="h-4 w-4" /> 编辑
                            </button>
                            <button
                              onClick={() => {
                                void handleExportTemplatePdf(template);
                                setActiveDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                              <Download className="h-4 w-4" /> 导出 PDF
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(template.name).catch(() => undefined);
                                setFeedback({ type: 'success', message: `已复制模板名：${template.name}` });
                                setActiveDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                              <Copy className="h-4 w-4" /> 复制名称
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={template.isDefault}
                            >
                              <Trash2 className="h-4 w-4" /> 删除
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{template.category}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">基础样式：{baseTemplateOptions.find((item) => item.value === template.baseTemplate)?.label || template.baseTemplate}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {template.colors.map((color) => (
                      <span key={color} className="h-5 w-5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-5 text-xs text-slate-400">
                    <span>最近使用：{template.lastUsed ? new Date(template.lastUsed).toLocaleDateString('zh-CN') : '暂无'}</span>
                    {!template.isDefault && <span>可编辑</span>}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" /> 预览
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                      <Check className="h-4 w-4" /> 应用模板
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        maxWidth="max-w-[1040px]"
        title={previewTemplate?.name}
        description={previewTemplate?.description}
      >
        {previewTemplate && (
          <div className="flex flex-col gap-6">
            <div className="max-h-[78vh] overflow-y-auto rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] p-4 sm:p-8 shadow-inner">
              <div className="mx-auto max-w-[210mm] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <InvoicePreview invoice={templatePreviewInvoice(previewTemplate)} template={previewTemplate.baseTemplate} />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                分类：{previewTemplate.category} · 基础样式：{baseTemplateOptions.find((item) => item.value === previewTemplate.baseTemplate)?.label || previewTemplate.baseTemplate}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  关闭预览
                </button>
                <button
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Check className="h-4 w-4" /> 使用此模板新建
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        title="编辑模板"
        description="修改模板的名称、描述、分类和基础样式。保存后会持久化到当前账号。"
        maxWidth="max-w-lg"
      >
        {editingTemplate && (
          <form onSubmit={handleSaveEdit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">模板名称</label>
                <input
                  type="text"
                  required
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">模板描述</label>
                <textarea
                  rows={4}
                  required
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">模板分类</label>
                <input
                  type="text"
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">基础样式</label>
                <select
                  value={editingTemplate.baseTemplate}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, baseTemplate: e.target.value as TemplateType })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  {baseTemplateOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="新建模板"
        description="基于现有模板样式快速创建你的专属模板。"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateTemplate} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">模板名称</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例如：咨询服务模板"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">模板描述</label>
              <textarea
                rows={4}
                required
                value={createForm.description}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="描述这个模板适合什么业务场景"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">模板分类</label>
              <input
                type="text"
                value={createForm.category}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">基础样式</label>
              <select
                value={createForm.baseTemplate}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, baseTemplate: e.target.value as TemplateType }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              >
                {baseTemplateOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            新建模板会保存当前基础样式和一份可直接预览的发票结构，后续可以继续编辑并用于快速新建发票。
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? '创建中...' : '创建模板'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
