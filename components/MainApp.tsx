"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Invoice, TemplateType, ViewType, Language, User } from '../types';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, getUserInvoices, saveInvoice, deleteInvoice, batchSaveInvoices } from '@/lib/supabase-db';
import { saveTemplate } from '@/lib/supabase-templates';
import DashboardSidebar from './DashboardSidebar';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar'; // This is the right-side/inner sidebar, kept as is or renamed? (It was "Sidebar" in original imports, seemingly unused or small)
// Actually, looking at original code, Sidebar was imported. 
// Check line 11: import Sidebar from './Sidebar';
// And usage in MainApp.tsx... I need to see where Sidebar was used. 
// It was passed to the editor view?
// Wait, in previous `Sidebar.tsx` view it was empty/commented out.
// Let's just focus on adding DashboardSidebar.

import HomeView from './HomeView';
import RecordsView from './RecordsView';
import ProfileView from './ProfileView';
import BottomNav from './BottomNav';
import AuthView from './AuthView';
import AboutView from './AboutView';
import HelpView from './HelpView';

import AIChat from './AIChat';
import ShareDialog from './ShareDialog';
import EmailDialog from './EmailDialog';
import SaveTemplateDialog from './SaveTemplateDialog';
import TemplatesView from './TemplatesView';
import TemplateDetailView from './TemplateDetailView';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';
import SaveStatusIndicator from './SaveStatusIndicator';
import { smartGenerateLineItems } from '../services/geminiService';
import ScalableInvoiceContainer from './ScalableInvoiceContainer';
import { translations } from '../i18n';
import { useToast } from '../hooks/useToast';

declare var html2pdf: any;

const INITIAL_INVOICE: Invoice = {
  id: '',
  type: 'invoice',
  invoiceNumber: 'INV-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  sender: {
    name: '',
    email: '',
    address: '',
    disclaimerText: 'This is a computer generated document and no signature is required.\n此为电脑生成文件，无需签名。'
  },
  client: {
    name: '',
    email: '',
    address: ''
  },
  items: [
    { id: 'item-1', description: 'Example Service Item', quantity: 1, rate: 0 }
  ],
  taxRate: 0,
  currency: 'CNY',
  notes: '感谢您的支持！',
  status: 'Draft',
  visibility: {
    date: true,      // Date默认勾选（显示）
    dueDate: false   // Due Date默认不勾选（隐藏）
  }
};

const App: React.FC = () => {
  // 从本地存储初始化用户会话
  // Initialize safe for SSR
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Get initial view - default to 'records'
  const getInitialView = (): ViewType => {
    if (typeof window === 'undefined') return 'records';
    const savedUser = localStorage.getItem('sb_user_session');
    // Default to 'login' if no sessions, but allow 'records' if session exists (to be verified by async sync)
    return savedUser ? 'records' : 'login';
  };

  const [activeView, setActiveView] = useState<ViewType>(getInitialView());
  const [prevView, setPrevView] = useState<ViewType>('records');
  const [lang, setLang] = useState<Language>('en');
  const [invoice, setInvoice] = useState<Invoice>(INITIAL_INVOICE);
  const [records, setRecords] = useState<Invoice[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const syncRef = useRef<string | null>(null);
  const { toast, showToast, hideToast } = useToast();

  // 初始化：从 localStorage 加载数据 & 同步 Supabase session
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // 加载本地数据（作为后备）
    const savedUser = localStorage.getItem('sb_user_session');
    const savedRecords = localStorage.getItem('invoice_records_v2');

    if (savedRecords) {
      try { setRecords(JSON.parse(savedRecords)); } catch { }
    }

    // 同步用户 profile 和发票数据
    const syncUserData = async (authUser: any) => {
      if (!isMounted) return;

      // 如果发现已经在同步同一个用户，只需确保初始化标记已打开，然后返回
      if (syncRef.current === authUser.id) {
        setIsInitialized(true);
        return;
      }

      syncRef.current = authUser.id;

      try {
        console.log('[MainApp] 🔄 Syncing user data for:', authUser.email);

        // 1. 立即构建并设置基本用户状态，这会让 UI 从 Loading 切换到应用界面，而不是 AuthView
        const profile = await getUserProfile(authUser.id);
        if (!isMounted) return;

        const user: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url,
          provider: authUser.app_metadata?.provider || 'google',
          profile
        };
        setUser(user);

        // 2. 身份确定后，立即解除加载遮罩，提高响应速度
        setIsInitialized(true);

        // 3. 后续非阻塞同步：检测视图、同步发票数据
        const params = new URLSearchParams(window.location.search);
        const targetView = params.get('view') as ViewType;
        if (targetView && ['records', 'profile', 'editor', 'about', 'help', 'login'].includes(targetView)) {
          setActiveView(targetView);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        } else {
          // Default to records if logged in, otherwise login screen
          setActiveView(user ? 'records' : 'login');
        }

        let cloudInvoices: Invoice[] = [];
        try {
          cloudInvoices = await getUserInvoices(authUser.id);
        } catch (fetchError) {
          console.error('[MainApp] Error fetching invoices during sync:', fetchError);
        }

        if (!isMounted) return;

        if (cloudInvoices.length > 0) {
          setRecords(cloudInvoices);
        } else {
          const currentLocalRecords = localStorage.getItem('invoice_records_v2');
          const localRecords = currentLocalRecords ? JSON.parse(currentLocalRecords) : [];
          if (localRecords.length > 0) {
            await batchSaveInvoices(authUser.id, localRecords);
            const updatedCloud = await getUserInvoices(authUser.id);
            if (isMounted) setRecords(updatedCloud);
          }
        }
      } catch (error) {
        console.error('[MainApp] Sync failed:', error);
      } finally {
        // 兜底：确保无论如何都会关闭加载动画
        if (isMounted) setIsInitialized(true);
      }
    };

    // 设置安全超时，防止任何未知的死锁
    const safetyTimeout = setTimeout(() => {
      if (!isInitialized && isMounted) {
        console.warn('[MainApp] Initialization timeout hit, forcing UI display');
        setIsInitialized(true);
      }
    }, 5000);

    // 监听 Supabase 认证状态变化
    // onAuthStateChange 在大多数情况下会立即触发 'INITIAL_SESSION' 或 'SIGNED_IN'
    if (supabase.auth) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;

          console.log('[MainApp] 🔑 Auth event:', event, {
            user: session?.user?.email,
            hasSession: !!session
          });

          if (session?.user) {
            // 异步同步数据，不阻塞监听器
            syncUserData(session.user);
          } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
            // 处理登出或确认为空会话的状态
            if (event === 'SIGNED_OUT') {
              syncRef.current = null;
              setUser(null);
              setRecords([]);
              localStorage.removeItem('invoice_records_v2');
              localStorage.removeItem('sb_user_session');
            }
            setIsInitialized(true);
          } else {
            // 其他事件（可能是无 session 的初始状态）
            setIsInitialized(true);
          }
        }
      );

      return () => {
        isMounted = false;
        clearTimeout(safetyTimeout);
        subscription.unsubscribe();
      };
    } else {
      console.error('[MainApp] Supabase auth is not available');
      setIsInitialized(true);
      return () => {
        isMounted = false;
        clearTimeout(safetyTimeout);
      };
    }
  }, []);

  const [template, setTemplate] = useState<TemplateType>('minimalist');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isHeaderReversed, setIsHeaderReversed] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(true); // New State for Chat Logic
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [isNewInvoiceConfirmOpen, setIsNewInvoiceConfirmOpen] = useState(false);
  const [isCreatingNewInvoice, setIsCreatingNewInvoice] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // Track which record is being deleted
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state for logout loading transition

  // Save status tracking
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | undefined>();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // 曡听用户状态变化並同步存储
  useEffect(() => {
    if (!isInitialized) return;
    if (user) {
      localStorage.setItem('sb_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('sb_user_session');
    }
  }, [user, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('invoice_records_v2', JSON.stringify(records));
  }, [records, isInitialized]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setActiveView('records');
  };

  const changeView = (newView: ViewType) => {
    setPrevView(activeView);
    setActiveView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 退出登录核心逻辑
   * 1. 重置用户状态为 null
   * 2. 重置视图为 home（确保下次登录在首页）
   * 3. 清除 localStorage 会话
   * 4. 如果是 Google 登录，调用 Supabase signOut
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    // Smooth exit delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // 立即清除本地状态实现“简单直接”的退出
    syncRef.current = null;
    setUser(null);
    setRecords([]);
    localStorage.removeItem('sb_user_session');
    localStorage.removeItem('invoice_records_v2');

    // 异步执行服务器端退出，不阻塞 UI 响应
    const supabase = createClient();
    supabase.auth.signOut().catch(console.error);

    // Redirect to Landing Page
    window.location.href = '/';
  };

  const updateInvoice = (updates: Partial<Invoice>) => {
    setInvoice(prev => ({ ...prev, ...updates }));
  };

  // Sync template settings to invoice object
  useEffect(() => {
    setInvoice(prev => {
      if (prev.template === template && prev.isHeaderReversed === isHeaderReversed) return prev;
      return { ...prev, template, isHeaderReversed };
    });
  }, [template, isHeaderReversed]);

  /**
   * 创建新发票（含立即保存到数据库）
   */
  const handleStart = async (preset?: Partial<Invoice>) => {
    console.log('[handleStart] 开始创建新发票');
    console.log('[handleStart] preset:', preset);
    console.log('[handleStart] user:', user);

    const newId = Date.now().toString();

    // Determine default currency based on current language
    let defaultCurrency = 'USD';
    switch (lang) {
      case 'zh-TW': defaultCurrency = 'TWD'; break;
      default: defaultCurrency = 'USD';
    }

    const newInvoice = {
      ...INITIAL_INVOICE,
      currency: defaultCurrency,
      items: [
        { id: 'item-1', description: translations[lang].itemDescriptionExample || 'Example Service Item', quantity: 1, rate: 0 }
      ],
      ...preset, // Preset overrides defaults
      id: newId,
      invoiceNumber: `INV-${newId.slice(-6)}`
    };

    console.log('[handleStart] 新发票对象:', newInvoice);

    setInvoice(newInvoice);
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Immediately create record in database for logged-in users
    if (user?.id) {
      console.log('[handleStart] 用户已登录，准备保存到数据库');
      console.log('[handleStart] user.id:', user.id);
      console.log('[handleStart] user.provider:', user.provider);

      try {
        setSaveStatus('saving');
        console.log('[handleStart] 调用 saveInvoice...');

        await saveInvoice(user.id, newInvoice);

        console.log('[handleStart] ✅ saveInvoice 成功');
        setSaveStatus('saved');
        setLastSavedTime(new Date());

        // Reload records
        console.log('[handleStart] 重新加载发票列表...');
        const updated = await getUserInvoices(user.id);
        console.log('[handleStart] 获取到的发票列表:', updated);
        setRecords(updated);
        localStorage.setItem('invoice_records_v2', JSON.stringify(updated));
        console.log('[handleStart] ✅ 完成');
      } catch (error) {
        console.error('[handleStart] ❌ 保存失败:', error);
        setSaveStatus('error');
      }
    } else {
      console.warn('[handleStart] ⚠️ 用户未登录，跳过数据库保存');
    }
  };

  // Auto-save helper function
  const performSave = useCallback(async (isManual: boolean = false) => {
    if (!user?.id || !invoice.id) return;

    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    setSaveStatus('saving');

    try {
      await saveInvoice(user.id, invoice);
      setSaveStatus('saved');
      setLastSavedTime(new Date());

      // Reload records list
      const updated = await getUserInvoices(user.id);
      setRecords(updated);
      localStorage.setItem('invoice_records_v2', JSON.stringify(updated));

      // No alert needed - SaveStatusIndicator shows the status
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      // SaveStatusIndicator will show the error state
    }
  }, [user, invoice, lang]);

  // Manual save (for button clicks)
  const saveInvoiceToRecords = async () => {
    if (user?.id && user.provider === 'google') {
      await performSave(true);
    } else {
      // Guest users: save to localStorage only
      setRecords(prev => {
        const exists = prev.find(r => r.id === invoice.id);
        const newRecords = exists
          ? prev.map(r => r.id === invoice.id ? invoice : r)
          : [invoice, ...prev];
        localStorage.setItem('invoice_records_v2', JSON.stringify(newRecords));
        return newRecords;
      });
      showToast('账单已本地保存（登录后可同步云端）', 'success');
    }
  };

  // Save invoice as template
  const handleSaveAsTemplate = async (name: string, description: string) => {
    if (!user?.id) {
      showToast('Please login to save templates', 'warning');
      return;
    }

    try {
      await saveTemplate(user.id, name, description, invoice);
      showToast(translations[lang].templateSaved || 'Template saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving template:', error);
      showToast('Failed to save template. Please try again.', 'error');
      throw error;
    }
  };

  // Create invoice from template
  const handleUseTemplate = async (template: any) => {
    if (!user?.id) return;

    const newId = Date.now().toString();
    const newInvoice = {
      ...INITIAL_INVOICE,
      ...template.template_data,
      id: newId,
      invoiceNumber: `INV-${newId.slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client: {
        name: '',
        email: '',
        address: ''
      },
      status: 'Draft' as const
    };

    setInvoice(newInvoice);
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Immediately save the new invoice
    try {
      setSaveStatus('saving');
      await saveInvoice(user.id, newInvoice);
      setSaveStatus('saved');
      setLastSavedTime(new Date());
      const updated = await getUserInvoices(user.id);
      setRecords(updated);
      localStorage.setItem('invoice_records_v2', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving invoice from template:', error);
      setSaveStatus('error');
    }
  };

  // Auto-save effect (3 second debounce)
  useEffect(() => {
    // Only auto-save if logged in
    if (!user?.id || !invoice.id || activeView !== 'editor') return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      performSave(false);
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [invoice, user, activeView, performSave]);

  const handleSmartFill = async (prompt: string) => {
    setIsAiLoading(true);
    const items = await smartGenerateLineItems(prompt);
    if (items) {
      const formattedItems = items.map((item: any, index: number) => ({
        ...item,
        id: `ai-item-${Date.now()}-${index}`
      }));
      setInvoice(prev => ({ ...prev, items: [...prev.items, ...formattedItems] }));
    }
    setIsAiLoading(false);
  };

  const handleExportPdf = async () => {
    if (!printAreaRef.current || isExporting) return;
    setIsExporting(true);
    const opt = {
      margin: 0,
      filename: `${invoice.client.name ? invoice.client.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s_-]/g, '') : 'Client'}_${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await html2pdf().set(opt).from(printAreaRef.current).save();
    } catch (error) {
      console.error('PDF Generation failed', error);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        // If we end up here (shouldn't with getInitialView fix), show create new option
        return <HomeView onSelectTemplate={handleStart} onCreateEmpty={() => handleStart()} lang={lang} />;
      case 'records':
        if (!user) return <AuthView onLogin={handleLogin} lang={lang} targetView="records" showToast={showToast} />;
        return <RecordsView
          records={records}
          lang={lang}
          isDeletingId={isDeletingId}
          onEdit={(r) => {
            setInvoice(r);
            if (r.template) setTemplate(r.template);
            if (r.isHeaderReversed !== undefined) setIsHeaderReversed(r.isHeaderReversed);
            setActiveView('editor');
          }}
          onDelete={async (id) => {
            if (user?.id && user.provider === 'google') {
              // 云端删除
              setIsDeletingId(id); // 设置删除中状态
              try {
                await deleteInvoice(id);
                const updated = await getUserInvoices(user.id);
                setRecords(updated);
                localStorage.setItem('invoice_records_v2', JSON.stringify(updated));
              } catch (error) {
                console.error('删除失败:', error);
                showToast(translations[lang].deleteFailed || '删除失败，请重试', 'error');
              } finally {
                setIsDeletingId(null); // 清除删除中状态
              }
            } else {
              // 本地删除
              const newRecords = records.filter(r => r.id !== id);
              setRecords(newRecords);
              localStorage.setItem('invoice_records_v2', JSON.stringify(newRecords));
            }
          }}
          onExport={(r) => { setInvoice(r); setTimeout(handleExportPdf, 200); }}
          onNewDoc={handleStart}
        />;
      case 'profile':
        if (!user) return <AuthView onLogin={handleLogin} lang={lang} targetView="profile" showToast={showToast} />;
        return <ProfileView
          recordsCount={records.length}
          user={user}
          onLogout={handleLogout}
          onUpdateUser={(updatedUser) => setUser(updatedUser)}
          lang={lang}
          showToast={showToast}
        />;
      case 'templates':
        if (!user) return <AuthView onLogin={handleLogin} lang={lang} targetView="templates" showToast={showToast} />;
        return <TemplatesView
          lang={lang}
          userId={user.id}
          onUseTemplate={handleUseTemplate}
          onViewDetail={(template) => {
            setActiveTemplateId(template.id);
            setActiveView('template-detail');
          }}
          onNewDoc={handleStart}
        />;
      case 'template-detail':
        if (!user) return <AuthView onLogin={handleLogin} lang={lang} targetView="templates" showToast={showToast} />;
        if (!activeTemplateId) {
          setActiveView('templates');
          return null;
        }
        return <TemplateDetailViewWrapper
          templateId={activeTemplateId}
          lang={lang}
          user={user}
          onUseTemplate={handleUseTemplate}
          onBack={() => {
            setActiveView('templates');
            setActiveTemplateId(null);
          }}
          showToast={showToast}
        />;
      case 'about':
        return <AboutView lang={lang} onBack={() => setActiveView(prevView)} onCreateInvoice={handleStart} />;
      case 'help':
        return <HelpView lang={lang} onBack={() => setActiveView(prevView)} />;
      case 'editor':
        // Editor is now open to guests
        return (
          <>
            <SaveStatusIndicator status={saveStatus} lang={lang} lastSavedTime={lastSavedTime} />
            <div className="container mx-auto flex flex-col gap-6 relative">
              {/* Action Toolbar Removed - Moved to DashboardHeader */}

              {/* 表单和预览区 */}
              <div className="lg:flex gap-8" style={{ zoom: 0.9 }}>
                <div className="lg:w-1/2 flex flex-col gap-6">

                  <InvoiceForm invoice={invoice} onChange={updateInvoice} lang={lang} userId={user?.id} />
                  <div className="sm:hidden mt-10 mb-16 px-2">
                    <button
                      onClick={handleExportPdf}
                      disabled={isExporting}
                      className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 transition-all active:scale-95 active:shadow-inner"
                    >
                      {isExporting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-cloud-download-alt text-xl"></i>}
                      <span className="text-lg">{isExporting ? translations[lang].generating : translations[lang].exportPdf}</span>
                    </button>
                  </div>
                </div>

                <div className="lg:w-1/2 lg:sticky lg:top-24 self-start">
                  <div className="bg-slate-50 rounded-xl min-h-[450px] sm:min-h-[500px] flex justify-center items-start overflow-x-hidden overflow-y-auto shadow-sm border border-slate-200">
                    <ScalableInvoiceContainer>
                      <InvoicePreview invoice={invoice} template={template} isHeaderReversed={isHeaderReversed} lang={lang} />
                    </ScalableInvoiceContainer>
                  </div>
                </div>
              </div>

              {/* AI Floating Action Button & Modal */}
              <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">

                {/* Chat Window Modal/Popover */}
                <div
                  className={`pointer-events-auto transition-all duration-300 origin-bottom-right ${isAIChatOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-90 translate-y-4 pointer-events-none hidden'
                    }`}
                >
                  <div className="w-[90vw] sm:w-[380px] h-[500px] max-h-[70vh] shadow-2xl shadow-blue-900/20 rounded-2xl overflow-hidden">
                    <AIChat
                      currentInvoice={invoice}
                      onUpdateInvoice={updateInvoice}
                      lang={lang}
                      onClose={() => setIsAIChatOpen(false)}
                    />
                  </div>
                </div>

                {/* Share Dialog */}
                <ShareDialog
                  isOpen={isShareDialogOpen}
                  onClose={() => setIsShareDialogOpen(false)}
                  invoice={invoice}
                  lang={lang}
                />

                {/* Email Dialog */}
                <EmailDialog
                  isOpen={isEmailDialogOpen}
                  onClose={() => setIsEmailDialogOpen(false)}
                  invoice={invoice}
                  lang={lang}
                  showToast={showToast}
                />

                {/* Save Template Dialog */}
                <SaveTemplateDialog
                  isOpen={isSaveTemplateDialogOpen}
                  onClose={() => setIsSaveTemplateDialogOpen(false)}
                  onSave={handleSaveAsTemplate}
                  lang={lang}
                />

                {/* New Invoice Confirmation Dialog */}
                <ConfirmDialog
                  isOpen={isNewInvoiceConfirmOpen}
                  onClose={() => setIsNewInvoiceConfirmOpen(false)}
                  onConfirm={async () => {
                    setIsCreatingNewInvoice(true);

                    try {
                      // Step 1: Save current invoice if user is logged in
                      if (user?.id && invoice.id) {
                        showToast(translations[lang].savingCurrentInvoice || '正在保存当前发票...', 'info');
                        await saveInvoice(user.id, invoice);
                      }

                      // Step 2: Create new invoice
                      await handleStart();

                      // Step 3: Show success message
                      setIsNewInvoiceConfirmOpen(false);
                      showToast(translations[lang].newInvoiceCreated || '新发票创建成功！', 'success');
                    } catch (error) {
                      console.error('Error creating new invoice:', error);
                      showToast(translations[lang].createInvoiceFailed || '创建发票失败，请重试', 'error');
                    } finally {
                      setIsCreatingNewInvoice(false);
                    }
                  }}
                  title={translations[lang].newInvoiceConfirm || '创建新发票？'}
                  description={translations[lang].newInvoiceConfirmDesc || '当前发票将自动保存，然后创建新发票。确定继续吗？'}
                  confirmText={translations[lang].confirm || '确认'}
                  cancelText={translations[lang].cancel || '取消'}
                  variant="info"
                  isProcessing={isCreatingNewInvoice}
                />

                {/* FAB Trigger */}
                <button
                  onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                  className={`pointer-events-auto w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isAIChatOpen
                    ? 'bg-slate-800 text-white rotate-90 shadow-slate-900/30'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/40 animate-pulse-slow'
                    }`}
                >
                  {isAIChatOpen ? (
                    <i className="fas fa-times text-xl"></i>
                  ) : (
                    <i className="fas fa-magic text-xl"></i>
                  )}
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-100 animate-bounce">
            <i className="fas fa-file-invoice"></i>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">{translations[lang].welcomeSub || 'Loading SmartBill...'}</p>
        </div>
      </div>
    );
  }

  // Logout Transition Overlay
  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
              <i className="fas fa-sign-out-alt text-2xl"></i>
            </div>
            <div className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-2xl animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Signing out...</h3>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">See you soon</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md p-4">
          {/* Simple Header for Login Page */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4">
              <i className="fas fa-file-invoice text-xl"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium mt-2">Sign in to access your dashboard</p>
          </div>

          <AuthView onLogin={handleLogin} lang={lang} targetView="records" showToast={showToast} />

          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors inline-flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        user={user}
        activeView={activeView}
        setView={changeView}
        lang={lang}
        setLang={setLang}
        onLogout={handleLogout}
        onNewInvoice={() => handleStart()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative h-screen overflow-y-auto">
        <DashboardHeader
          user={user}
          lang={lang}
          activeView={activeView}
          invoice={invoice}
          saveStatus={saveStatus}
          lastSavedTime={lastSavedTime}
          isExporting={isExporting}
          onExportPdf={handleExportPdf}
          onSaveTemplate={() => setIsSaveTemplateDialogOpen(true)}
          onShare={() => setIsShareDialogOpen(true)}
          onLangChange={setLang}
          onBack={() => changeView('records')}
        />
        {/* Render content */}
        <main className="flex-1 p-4 lg:p-8">{renderContent()}</main>

        {/* Hidden Print Area */}
        <div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]">
          <div ref={printAreaRef} style={{ width: '210mm' }}>
            <InvoicePreview invoice={invoice} template={template} isHeaderReversed={isHeaderReversed} isForPdf={true} lang={lang} />
          </div>
        </div>

        {/* Mobile Bottom Navigation - Only show on small screens if needed, otherwise rely on responsive sidebar */}
        <div className="md:hidden">
          <BottomNav activeView={activeView} setView={setActiveView} lang={lang} />
        </div>

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    </div>
  );
};

// Wrapper component to fetch template data
const TemplateDetailViewWrapper: React.FC<{
  templateId: string;
  lang: Language;
  user: User;
  onUseTemplate: (template: any) => void;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}> = ({ templateId, lang, user, onUseTemplate, onBack, showToast }) => {
  const [template, setTemplate] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const t = translations[lang] || translations['en'];

  React.useEffect(() => {
    const loadTemplate = async () => {
      try {
        const { getTemplate } = await import('@/lib/supabase-templates');
        const data = await getTemplate(templateId);
        setTemplate(data);
      } catch (error) {
        console.error('Error loading template:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplate();
  }, [templateId]);

  const handleEdit = (template: any) => {
    // This would require passing more handlers from parent
    console.log('Edit template:', template);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const { deleteTemplate } = await import('@/lib/supabase-templates');
      await deleteTemplate(templateId);
      onBack();
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast('Failed to delete template', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Template not found</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TemplateDetailView
        template={template}
        lang={lang}
        onUseTemplate={() => onUseTemplate(template)}
        onEdit={() => handleEdit(template)}
        onDelete={() => setDeleteConfirmOpen(true)}
        onBack={onBack}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t.deleteDialogTitle?.replace('Invoice', 'Template') || 'Delete Template?'}
        description={t.deleteDialogDescription?.replace('invoice', 'template') || 'Are you sure you want to delete template {item}? This action cannot be undone.'}
        confirmText={t.deleteDialogConfirm || 'Delete'}
        cancelText={t.deleteDialogCancel || 'Cancel'}
        isDeleting={isDeleting}
        itemName={template.name}
      />

      {/* Full-page Deletion Loading Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-6 animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="relative">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 text-3xl">
                <i className="fas fa-trash-alt animate-bounce"></i>
              </div>
              <div className="absolute inset-0 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin"></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.deleting}</h3>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Processing...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default App;

