"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Invoice, TemplateType, ViewType, Language, User } from '../types';
import Header from './Header';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import Sidebar from './Sidebar';
import HomeView from './HomeView';
import RecordsView from './RecordsView';
import ProfileView from './ProfileView';
import BottomNav from './BottomNav';
import AuthView from './AuthView';
import Footer from './Footer';
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
    address: ''
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
  status: 'Draft'
};

const App: React.FC = () => {
  // 从本地存储初始化用户会话
  // Initialize safe for SSR
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [activeView, setActiveView] = useState<ViewType>('home');
  const [lang, setLang] = useState<Language>('zh-TW');
  const [invoice, setInvoice] = useState<Invoice>(INITIAL_INVOICE);
  const [records, setRecords] = useState<Invoice[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('sb_user_session');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { }
    }

    const savedRecords = localStorage.getItem('invoice_records_v2');
    if (savedRecords) {
      try { setRecords(JSON.parse(savedRecords)); } catch { }
    }
    setIsInitialized(true);
  }, []);

  const [template, setTemplate] = useState<TemplateType>('professional');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAppReversed, setIsAppReversed] = useState(false);
  const [isHeaderReversed, setIsHeaderReversed] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // 曡听用户状态变化并同步存储
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
    setActiveView('home');
  };

  /**
   * 退出登录核心逻辑
   * 1. 重置用户状态为 null
   * 2. 重置视图为 home（确保下次登录在首页）
   * 3. 清除 localStorage 会话
   */
  const handleLogout = () => {
    localStorage.removeItem('sb_user_session');
    setUser(null);
    setActiveView('home');
    window.scrollTo(0, 0);
  };

  const updateInvoice = (updates: Partial<Invoice>) => {
    setInvoice(prev => ({ ...prev, ...updates }));
  };

  const startNewInvoice = (templateData?: Partial<Invoice>) => {
    const newId = Date.now().toString();
    setInvoice({
      ...INITIAL_INVOICE,
      ...templateData,
      id: newId,
      invoiceNumber: `${templateData?.type === 'receipt' ? 'REC' : 'INV'}-${(records.length + 1).toString().padStart(3, '0')}`,
    });
    setActiveView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveInvoiceToRecords = () => {
    setRecords(prev => {
      const exists = prev.find(r => r.id === invoice.id);
      if (exists) return prev.map(r => r.id === invoice.id ? invoice : r);
      return [invoice, ...prev];
    });
    alert('账单已成功保存！');
  };

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
        return <HomeView onSelectTemplate={startNewInvoice} onCreateEmpty={() => startNewInvoice()} lang={lang} />;
      case 'records':
        if (!user) return <AuthView onLogin={handleLogin} />;
        return <RecordsView records={records} onEdit={(r) => { setInvoice(r); setActiveView('editor'); }} onDelete={(id) => setRecords(prev => prev.filter(r => r.id !== id))} onExport={(r) => { setInvoice(r); setTimeout(handleExportPdf, 200); }} />;
      case 'profile':
        if (!user) return <AuthView onLogin={handleLogin} />;
        return <ProfileView recordsCount={records.length} user={user} onLogout={handleLogout} />;
      case 'editor':
        return (
          <div className={`container mx-auto px-4 py-8 lg:flex gap-8 ${isAppReversed ? 'flex-row-reverse' : ''}`}>
            <div className="lg:w-1/2 flex flex-col gap-6">
              <Sidebar
                template={template}
                setTemplate={setTemplate}
                onSmartFill={handleSmartFill}
                isAiLoading={isAiLoading}
                isAppReversed={isAppReversed}
                setIsAppReversed={setIsAppReversed}
                isHeaderReversed={isHeaderReversed}
                setIsHeaderReversed={setIsHeaderReversed}
                onSave={saveInvoiceToRecords}
              />
              <InvoiceForm invoice={invoice} onChange={updateInvoice} />
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
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-bold"><i className="fas fa-eye mr-2"></i> 实时预览</span>
                  <button onClick={saveInvoiceToRecords} className="bg-blue-600 px-3 py-1 rounded text-xs font-bold">{translations[lang].save}</button>
                </div>
                <div className="p-2 sm:p-8 bg-slate-100 min-h-[450px] sm:min-h-[500px] flex justify-center items-start overflow-x-hidden overflow-y-auto">
                  <div className="transform origin-top transition-transform duration-500 scale-[0.38] xs:scale-[0.45] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.6] xl:scale-[0.85] flex-shrink-0">
                    <InvoicePreview invoice={invoice} template={template} isHeaderReversed={isHeaderReversed} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

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
      <main className="flex-1 pt-16">{renderContent()}</main>

      {/* 网站页脚 */}
      <Footer />

      <div className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1]">
        <div ref={printAreaRef} style={{ width: '210mm' }}>
          <InvoicePreview invoice={invoice} template={template} isHeaderReversed={isHeaderReversed} isForPdf={true} />
        </div>
      </div>
      <BottomNav activeView={activeView} setView={setActiveView} lang={lang} />
    </div>
  );
};

export default App;
