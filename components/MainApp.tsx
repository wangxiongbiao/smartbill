"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Invoice, TemplateType, ViewType, Language, User } from '../types';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile, getUserInvoices, saveInvoice, deleteInvoice, batchSaveInvoices, getLatestInvoice } from '@/lib/supabase-db';
import Header from './Header';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import Sidebar from './Sidebar';
import HomeView from './HomeView';
import RecordsView from './RecordsView';
import ProfileView from './ProfileView';
import BottomNav from './BottomNav';
import AuthView from './AuthView';
import AboutView from './AboutView';
import HelpView from './HelpView';
import Footer from './Footer';
import AIChat from './AIChat';
import ShareDialog from './ShareDialog';
import EmailDialog from './EmailDialog';
import SaveStatusIndicator from './SaveStatusIndicator';
import { smartGenerateLineItems } from '../services/geminiService';
import { translations } from '../i18n';

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
    { id: 'item-1', description: '示例服务项目', quantity: 1, rate: 0 }
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

  const [activeView, setActiveView] = useState<ViewType>('home');
  const [prevView, setPrevView] = useState<ViewType>('home');
  const [lang, setLang] = useState<Language>('en');
  const [invoice, setInvoice] = useState<Invoice>(INITIAL_INVOICE);
  const [records, setRecords] = useState<Invoice[]>([]);

  const syncRef = useRef<string | null>(null);

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
        if (targetView && ['home', 'records', 'profile', 'editor', 'about', 'help'].includes(targetView)) {
          setActiveView(targetView);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
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
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // Track which record is being deleted

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
    // 立即清除本地状态实现“简单直接”的退出
    syncRef.current = null;
    setUser(null);
    setRecords([]);
    localStorage.removeItem('sb_user_session');
    localStorage.removeItem('invoice_records_v2');

    // 异步执行服务器端退出，不阻塞 UI 响应
    const supabase = createClient();
    supabase.auth.signOut().catch(console.error);

    changeView('home');
    window.scrollTo(0, 0);
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

    // Fetch latest invoice for auto-fill (if user is logged in and no preset is provided)
    let latestInvoiceData: Partial<Invoice> = {};
    if (user?.id && !preset) {
      try {
        console.log('[handleStart] Fetching latest invoice for auto-fill...');
        const latestInvoice = await getLatestInvoice(user.id);
        if (latestInvoice) {
          // Extract fields EXCLUDING client and items
          latestInvoiceData = {
            sender: latestInvoice.sender,
            paymentInfo: latestInvoice.paymentInfo,
            taxRate: latestInvoice.taxRate,
            currency: latestInvoice.currency,
            notes: latestInvoice.notes,
            template: latestInvoice.template,
            isHeaderReversed: latestInvoice.isHeaderReversed,
            visibility: latestInvoice.visibility,
            columnConfig: latestInvoice.columnConfig,
          };
          console.log('[handleStart] ✅ Auto-filled from latest invoice');
        } else {
          console.log('[handleStart] No previous invoice found, using defaults');
        }
      } catch (error) {
        console.error('[handleStart] ⚠️ Failed to fetch latest invoice:', error);
        // Continue with empty data if fetch fails
      }
    }

    const newInvoice = {
      ...INITIAL_INVOICE,
      currency: defaultCurrency,
      ...latestInvoiceData, // Apply auto-filled data from latest invoice
      ...preset, // Preset overrides auto-fill
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
      alert('账单已本地保存（登录后可同步云端）');
    }
  };

  // Auto-save effect (3 second debounce)
  useEffect(() => {
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
      filename: `${invoice.type === 'invoice' ? 'Invoice' : 'Receipt'}_${invoice.invoiceNumber}.pdf`,
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
        return <HomeView onSelectTemplate={handleStart} onCreateEmpty={() => handleStart()} lang={lang} />;
      case 'records':
        if (!user) return <AuthView onLogin={handleLogin} lang={lang} targetView="records" />;
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
                alert(translations[lang].deleteFailed || '删除失败，请重试');
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
        if (!user) return <AuthView onLogin={handleLogin} lang={lang} targetView="profile" />;
        return <ProfileView
          recordsCount={records.length}
          user={user}
          onLogout={handleLogout}
          onUpdateUser={(updatedUser) => setUser(updatedUser)}
          lang={lang}
        />;
      case 'about':
        return <AboutView lang={lang} onBack={() => setActiveView(prevView)} onCreateInvoice={handleStart} />;
      case 'help':
        return <HelpView lang={lang} onBack={() => setActiveView(prevView)} />;
      case 'editor':
        if (!user) return <AuthView onLogin={handleLogin} lang={lang} targetView="editor" />;
        return (
          <>
            <SaveStatusIndicator status={saveStatus} lang={lang} lastSavedTime={lastSavedTime} />
            <div className="container mx-auto px-4 py-8 flex flex-col gap-6 relative">
              {/* 表单和预览区 */}
              <div className="lg:flex gap-8" style={{ zoom: 0.9 }}>
                <div className="lg:w-1/2 flex flex-col gap-6">
                  <Sidebar
                    template={template}
                    setTemplate={setTemplate}
                    onSmartFill={handleSmartFill}
                    isAiLoading={isAiLoading}
                    isHeaderReversed={isHeaderReversed}
                    // setIsHeaderReversed={setIsHeaderReversed}
                    onSave={saveInvoiceToRecords}
                    onShare={() => setIsShareDialogOpen(true)}
                    lang={lang}
                  />
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
                  <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 sm:p-6 space-y-6">
                    {/* Top Buttons (Matching InvoiceForm style) */}
                    {/* Top Buttons (Matching Sidebar Action Buttons) */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsShareDialogOpen(true)}
                        className="flex-1 py-3 bg-indigo-50 text-indigo-600 font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-share-alt"></i> {translations[lang].shareLink?.split(' ')[0] || 'Share'}
                      </button>
                      <button
                        onClick={() => setIsEmailDialogOpen(true)}
                        className="flex-1 py-3 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-envelope"></i> {translations[lang].sendEmail || 'Email'}
                      </button>
                      <button
                        onClick={saveInvoiceToRecords}
                        className="flex-1 py-3 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-save"></i> {translations[lang].save}
                      </button>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-xl min-h-[450px] sm:min-h-[500px] flex justify-center items-start overflow-x-hidden overflow-y-auto border border-slate-100">
                      <div className="w-full transform origin-top transition-transform duration-500 flex-shrink-0">
                        <InvoicePreview invoice={invoice} template={template} isHeaderReversed={isHeaderReversed} lang={lang} />
                      </div>
                    </div>
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

  return (
    <div className="min-h-screen flex flex-col pb-24 sm:pb-0 bg-slate-50">
      <Header
        activeView={activeView}
        setView={setActiveView}
        onPrint={handleExportPdf}
        isExporting={isExporting}
        lang={lang}
        setLang={setLang}
      />
      <main className="flex-1 ">{renderContent()}</main>

      {/* 网站页脚 */}
      <Footer
        lang={lang}
        setView={changeView}
        onNewDoc={(type) => handleStart({ type })}
      />

      <div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]">
        <div ref={printAreaRef} style={{ width: '210mm' }}>
          <InvoicePreview invoice={invoice} template={template} isHeaderReversed={isHeaderReversed} isForPdf={true} lang={lang} />
        </div>
      </div>
      <BottomNav activeView={activeView} setView={setActiveView} lang={lang} />
    </div>
  );
};

export default App;
