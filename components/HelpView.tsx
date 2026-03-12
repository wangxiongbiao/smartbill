'use client';
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n';

interface HelpViewProps {
  lang: Language;
  onBack: () => void;
}

type HelpCopy = {
  supportBadge: string;
  heroTitle: string;
  heroDescription: string;
  learnMore: string;
  cards: string[];
  step1Title: string;
  step1Description: string;
  supportPng: string;
  multiCurrency: string;
  step2Title: string;
  step2Description: string;
  tryPrompt: string;
  promptExample: string;
  step3Title: string;
  step3Description: string;
  tryNow: string;
  faqTitle: string;
  faqDescription: string;
  businessWorkspace: string;
  aiTech: string;
  exportSuccess: string;
};

type FaqItem = { q: string; a: string };

const HelpView: React.FC<HelpViewProps> = ({ lang, onBack }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const t = translations[lang] || translations['en'];
  const englishCopy: HelpCopy = {
      supportBadge: 'Customer Support',
      heroTitle: 'How can we help?',
      heroDescription: 'From AI-assisted filling to polished PDF exports, find the tutorials and answers you need here.',
      learnMore: 'Learn More',
      cards: ['Quick Start', 'AI Tricks', 'Customizing', 'Exports'],
      step1Title: 'Enter Basic Business Info',
      step1Description: 'Start by filling in your company name and address in the editor. You can upload your logo for branding, then add the client details in the recipient area.',
      supportPng: 'Supports PNG/JPG',
      multiCurrency: 'Multi-currency ready',
      step2Title: 'Generate with AI Assistant',
      step2Description: 'Do not want to type every field manually? Describe the work in the sidebar and AI will extract pricing, quantities, and descriptions into the invoice table.',
      tryPrompt: 'Try This Prompt',
      promptExample: '"I worked 4 development days last week at $2,000 per day, plus a $500 logo design."',
      step3Title: 'Preview, Sign & Export',
      step3Description: 'Check the invoice layout live, sign it with the built-in signature pad, and export a polished high-resolution PDF when everything looks right.',
      tryNow: 'Try Now',
      faqTitle: 'General FAQ',
      faqDescription: 'Find quick answers to the questions people ask most.',
      businessWorkspace: 'Business Workspace',
      aiTech: 'AI Technology',
      exportSuccess: 'Successful Export',
    };
  const traditionalChineseCopy: HelpCopy = {
      supportBadge: '客戶支援',
      heroTitle: '我們能幫您解決什麼？',
      heroDescription: '從 AI 智能填充到專業 PDF 匯出，這裡有您需要的一切教學與解答。',
      learnMore: '了解更多',
      cards: ['快速上手', 'AI 技巧', '風格定制', '導出管理'],
      step1Title: '填寫基本業務資訊',
      step1Description: '在編輯器中先填寫公司名稱與地址。你也可以點擊「上傳 Logo」加入品牌識別，接著在「發送至」區域填入客戶資料。',
      supportPng: '支援 PNG/JPG',
      multiCurrency: '多幣種切換',
      step2Title: '使用 AI 助手一鍵生成',
      step2Description: '不想手動逐欄輸入？直接在側邊欄描述工作內容，AI 會自動提取單價、數量與描述，快速填入發票明細。',
      tryPrompt: '試試這段提示詞',
      promptExample: '「我上週做了 4 天開發，每天 2000 元，以及一個 500 元的標誌設計。」',
      step3Title: '預覽、簽名並導出',
      step3Description: '在右側即時查看發票樣式，使用電子簽名板完成簽署，確認後即可下載高解析度、專業的 PDF 文件。',
      tryNow: '現在去試試',
      faqTitle: '常見問題 FAQ',
      faqDescription: '快速找到您最關心的問題答案',
      businessWorkspace: '商務工作空間',
      aiTech: 'AI 技術示意',
      exportSuccess: '成功導出示意',
    };
  const simplifiedChineseCopy: HelpCopy = {
      supportBadge: '客户支持',
      heroTitle: '我们能帮你解决什么？',
      heroDescription: '从 AI 智能填写到高质量 PDF 导出，这里整理了最常用的操作说明和答疑。',
      learnMore: '了解更多',
      cards: ['快速上手', 'AI 技巧', '样式定制', '导出管理'],
      step1Title: '填写基础业务信息',
      step1Description: '先在编辑器里填写公司名称、地址和联系方式。你也可以上传 Logo，再在客户区域补齐对方信息。',
      supportPng: '支持 PNG/JPG',
      multiCurrency: '支持多币种',
      step2Title: '使用 AI 助手生成内容',
      step2Description: '不想手动逐项录入时，可以直接描述服务内容，AI 会帮你提取单价、数量和描述并填入表格。',
      tryPrompt: '试试这个提示词',
      promptExample: '“我上周做了 4 天开发，每天 2000 元，另外还有一个 500 元的 Logo 设计。”',
      step3Title: '预览、签名并导出',
      step3Description: '确认版式后，可以直接在系统里签名，再导出成清晰、专业的 PDF 文件。',
      tryNow: '现在去试试',
      faqTitle: '常见问题',
      faqDescription: '快速查看大家最常问的几个问题。',
      businessWorkspace: '商务工作区',
      aiTech: 'AI 技术示意',
      exportSuccess: '导出成功示意',
    };
  const thaiCopy: HelpCopy = {
      supportBadge: 'ฝ่ายสนับสนุนลูกค้า',
      heroTitle: 'เราช่วยอะไรคุณได้บ้าง?',
      heroDescription: 'ตั้งแต่การกรอกข้อมูลด้วย AI ไปจนถึงการส่งออก PDF แบบมืออาชีพ ที่นี่รวมคำอธิบายและคำตอบที่ใช้บ่อยที่สุดไว้ให้แล้ว',
      learnMore: 'ดูเพิ่มเติม',
      cards: ['เริ่มต้นเร็ว', 'เทคนิค AI', 'ปรับแต่งสไตล์', 'การส่งออก'],
      step1Title: 'กรอกข้อมูลธุรกิจพื้นฐาน',
      step1Description: 'เริ่มจากชื่อบริษัท ที่อยู่ และข้อมูลติดต่อในตัวแก้ไข คุณสามารถอัปโหลดโลโก้ แล้วเพิ่มข้อมูลลูกค้าในส่วนผู้รับได้ทันที',
      supportPng: 'รองรับ PNG/JPG',
      multiCurrency: 'รองรับหลายสกุลเงิน',
      step2Title: 'สร้างรายการด้วยผู้ช่วย AI',
      step2Description: 'หากไม่ต้องการกรอกทีละช่อง เพียงอธิบายงานของคุณ AI จะดึงราคา จำนวน และคำอธิบายไปใส่ในตารางใบแจ้งหนี้ให้',
      tryPrompt: 'ลองใช้พรอมต์นี้',
      promptExample: '"สัปดาห์ก่อนฉันทำงานพัฒนา 4 วัน วันละ $2,000 และออกแบบโลโก้อีก $500"',
      step3Title: 'พรีวิว เซ็น และส่งออก',
      step3Description: 'ตรวจสอบเลย์เอาต์แบบเรียลไทม์ เซ็นด้วยแผงลายเซ็นในตัว แล้วส่งออกเป็น PDF ที่คมชัดเมื่อทุกอย่างพร้อม',
      tryNow: 'ลองใช้งานตอนนี้',
      faqTitle: 'คำถามที่พบบ่อย',
      faqDescription: 'ดูคำตอบสั้น ๆ สำหรับคำถามที่ผู้ใช้ถามบ่อยที่สุด',
      businessWorkspace: 'พื้นที่ทำงานธุรกิจ',
      aiTech: 'เทคโนโลยี AI',
      exportSuccess: 'ตัวอย่างการส่งออกสำเร็จ',
    };
  const indonesianCopy: HelpCopy = {
      supportBadge: 'Dukungan Pelanggan',
      heroTitle: 'Ada yang bisa kami bantu?',
      heroDescription: 'Mulai dari pengisian dengan AI hingga ekspor PDF yang rapi, halaman ini merangkum panduan dan jawaban yang paling sering dibutuhkan.',
      learnMore: 'Pelajari lebih lanjut',
      cards: ['Mulai Cepat', 'Trik AI', 'Kustomisasi', 'Ekspor'],
      step1Title: 'Masukkan Info Bisnis Dasar',
      step1Description: 'Mulailah dengan nama perusahaan, alamat, dan kontak di editor. Anda juga bisa mengunggah logo lalu menambahkan detail klien di bagian penerima.',
      supportPng: 'Mendukung PNG/JPG',
      multiCurrency: 'Siap multi-mata uang',
      step2Title: 'Gunakan Asisten AI',
      step2Description: 'Jika tidak ingin mengetik satu per satu, jelaskan pekerjaan Anda dan AI akan mengisi harga, jumlah, dan deskripsi ke tabel faktur.',
      tryPrompt: 'Coba Prompt Ini',
      promptExample: '"Minggu lalu saya bekerja 4 hari pengembangan dengan tarif $2.000 per hari, ditambah desain logo seharga $500."',
      step3Title: 'Pratinjau, Tanda Tangan, dan Ekspor',
      step3Description: 'Periksa tata letak secara langsung, tanda tangani dengan pad bawaan, lalu ekspor ke PDF beresolusi tinggi saat semuanya sudah sesuai.',
      tryNow: 'Coba sekarang',
      faqTitle: 'FAQ Umum',
      faqDescription: 'Temukan jawaban cepat untuk pertanyaan yang paling sering diajukan.',
      businessWorkspace: 'Ruang Kerja Bisnis',
      aiTech: 'Teknologi AI',
      exportSuccess: 'Contoh Ekspor Berhasil',
    };
  const copyByLang = {
    en: englishCopy,
    'zh-CN': simplifiedChineseCopy,
    'zh-TW': traditionalChineseCopy,
    th: thaiCopy,
    id: indonesianCopy,
  } satisfies Record<Language, HelpCopy>;
  const copy = copyByLang[lang];

  const handleImageLoad = (key: string) => setLoadedImages(prev => ({ ...prev, [key]: true }));
  const handleImageError = (key: string) => setFailedImages(prev => ({ ...prev, [key]: true }));

  const englishFaq: FaqItem[] = [
      { q: 'Is my data secure?', a: 'Absolutely. SmartBill Pro prioritizes local storage. Your invoice data stays in your browser and sensitive info is not uploaded to our servers unless you manually save it.' },
      { q: 'How to use AI for faster billing?', a: 'Find "AI Smart Fill" in the sidebar. Just type: "I designed 3 logos for my client at $500 each," and AI will automatically create the line items and totals.' },
      { q: 'What if PDF format is incorrect?', a: 'For best results, use Chrome or Safari. Ensure the preview looks correct before exporting.' },
      { q: 'Can I customize invoice numbers?', a: 'Yes. In the first row of the form, you can modify the number.' },
    ];
  const traditionalChineseFaq: FaqItem[] = [
      { q: '我生成的資料安全嗎？', a: '絕對安全。SmartBill Pro 優先採用本地存儲技術。您的發票資料儲存在自己的瀏覽器中，除非您點擊「保存」或「導出」，否則敏感財務資訊不會上傳到我們的伺服器。' },
      { q: '如何利用 AI 加速開票？', a: '在編輯器側邊欄中找到「AI 智能填充」。您只需輸入：「我今天為客戶設計了 3 個 Logo，每個 500 元」，AI 就會自動為您建立明細行並計算總價。' },
      { q: 'PDF 匯出格式不正確怎麼辦？', a: '為了獲得最佳效果，建議使用 Chrome 或 Safari 瀏覽器。匯出前，請確保預覽視窗顯示正常。' },
      { q: '可以自定義發票編號嗎？', a: '可以。在「發票資訊」表單的第一行，您可以隨時修改發票編號。' },
    ];
  const simplifiedChineseFaq: FaqItem[] = [
      { q: '我的数据安全吗？', a: '是的。SmartBill 优先使用本地存储，除非你主动保存或同步，否则敏感发票数据不会被上传。' },
      { q: '怎么用 AI 更快开票？', a: '打开侧边栏里的 AI 智能填写，直接描述你的工作内容，系统会自动生成对应的明细、数量和金额。' },
      { q: 'PDF 导出排版不对怎么办？', a: '建议使用 Chrome 或 Safari，并在导出前先确认右侧预览是否正常。' },
      { q: '可以自定义发票编号吗？', a: '可以。你可以在发票信息区域随时修改编号。' },
    ];
  const thaiFaq: FaqItem[] = [
      { q: 'ข้อมูลของฉันปลอดภัยหรือไม่?', a: 'ปลอดภัย SmartBill ให้ความสำคัญกับการเก็บข้อมูลในเครื่องเป็นหลัก ข้อมูลใบแจ้งหนี้จะไม่ถูกอัปโหลด เว้นแต่คุณจะเลือกบันทึกหรือซิงก์เอง' },
      { q: 'จะใช้ AI เพื่อออกใบแจ้งหนี้ให้เร็วขึ้นได้อย่างไร?', a: 'เปิด AI Smart Fill ที่แถบด้านข้าง แล้วพิมพ์รายละเอียดงานของคุณ ระบบจะสร้างรายการ จำนวน และยอดเงินให้อัตโนมัติ' },
      { q: 'ถ้าไฟล์ PDF จัดวางผิดควรทำอย่างไร?', a: 'แนะนำให้ใช้ Chrome หรือ Safari และตรวจสอบตัวอย่างทางด้านขวาก่อนส่งออกทุกครั้ง' },
      { q: 'ปรับเลขที่ใบแจ้งหนี้เองได้หรือไม่?', a: 'ได้ คุณสามารถแก้ไขหมายเลขใบแจ้งหนี้ได้ในส่วนข้อมูลเอกสาร' },
    ];
  const indonesianFaq: FaqItem[] = [
      { q: 'Apakah data saya aman?', a: 'Ya. SmartBill memprioritaskan penyimpanan lokal, jadi data sensitif tidak akan diunggah kecuali Anda memilih untuk menyimpan atau menyinkronkannya.' },
      { q: 'Bagaimana cara menggunakan AI agar penagihan lebih cepat?', a: 'Buka AI Smart Fill di sidebar, jelaskan pekerjaan Anda, lalu sistem akan membuat item, jumlah, dan nilainya secara otomatis.' },
      { q: 'Bagaimana jika tata letak PDF tidak sesuai?', a: 'Gunakan Chrome atau Safari untuk hasil terbaik, lalu pastikan pratinjau di sisi kanan sudah benar sebelum ekspor.' },
      { q: 'Bisakah saya mengubah nomor faktur?', a: 'Bisa. Anda dapat mengedit nomor faktur kapan saja di bagian informasi dokumen.' },
    ];
  const faqByLang = {
    en: englishFaq,
    'zh-CN': simplifiedChineseFaq,
    'zh-TW': traditionalChineseFaq,
    th: thaiFaq,
    id: indonesianFaq,
  } satisfies Record<Language, FaqItem[]>;
  const faqData = faqByLang[lang];

  const TutorialImage = ({ id, src, alt, icon, gradient }: { id: string, src: string, alt: string, icon: string, gradient: string }) => {
    const isLoaded = loadedImages[id];
    const isFailed = failedImages[id];
    return (
      <div className="flex-1 relative group">
        <div className={`absolute -inset-4 ${gradient.replace('from-', 'bg-').split(' ')[0]}/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all`}></div>
        <div className="relative rounded-[2.5rem] shadow-2xl border-[12px] border-white w-full h-[350px] overflow-hidden bg-slate-50 flex items-center justify-center">
          {!isLoaded && !isFailed && <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center"><i className="fas fa-circle-notch fa-spin text-slate-300 text-3xl"></i></div>}
          {isFailed ? (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center text-white p-10 text-center`}>
              <i className={`fas ${icon} text-6xl mb-6 opacity-40`}></i>
              <p className="font-semibold uppercase tracking-widest text-sm mb-1">{alt}</p>
            </div>
          ) : (
            <img src={src} alt={alt} onLoad={() => handleImageLoad(id)} onError={() => handleImageError(id)} className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-90"><i className="fas fa-arrow-left"></i></button>
        <div className="flex flex-col items-center"><span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-0.5">{copy.supportBadge}</span><span className="text-sm font-semibold text-slate-900 uppercase tracking-widest">{t.helpCenter}</span></div>
        <div className="w-10"></div>
      </nav>

      <section className="bg-white pt-16 pb-32 px-6 text-center border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent -z-10"></div>
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-100 mb-2 rotate-3"><i className="fas fa-life-ring text-3xl"></i></div>
          <h1 className="text-4xl md:text-6xl font-semibold text-slate-900 tracking-tight leading-none">{copy.heroTitle}</h1>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">{copy.heroDescription}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 -mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 mb-20 relative z-30">
        {[{ icon: 'fa-play', title: copy.cards[0], color: 'bg-emerald-500' }, { icon: 'fa-brain', title: copy.cards[1], color: 'bg-blue-600' }, { icon: 'fa-palette', title: copy.cards[2], color: 'bg-indigo-600' }, { icon: 'fa-file-pdf', title: copy.cards[3], color: 'bg-blue-600' }].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all cursor-pointer">
            <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl mb-4 shadow-lg group-hover:rotate-12 transition-transform`}><i className={`fas ${item.icon}`}></i></div>
            <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{copy.learnMore}</span>
          </div>
        ))}
      </div>

      <section className="max-w-5xl mx-auto px-6 space-y-32">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6"><div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xl">1</div><h2 className="text-3xl font-semibold text-slate-900">{copy.step1Title}</h2><p className="text-slate-500 font-medium leading-relaxed">{copy.step1Description}</p><div className="pt-4 flex gap-4"><span className="flex items-center gap-2 text-xs font-semibold text-slate-400"><i className="fas fa-check-circle text-emerald-500"></i> {copy.supportPng}</span><span className="flex items-center gap-2 text-xs font-semibold text-slate-400"><i className="fas fa-check-circle text-emerald-500"></i> {copy.multiCurrency}</span></div></div>
          <TutorialImage id="step1" src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80" alt={copy.businessWorkspace} icon="fa-briefcase" gradient="from-slate-700 to-slate-900" />
        </div>
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="flex-1 space-y-6"><div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xl">2</div><h2 className="text-3xl font-semibold text-slate-900">{copy.step2Title}</h2><p className="text-slate-500 font-medium leading-relaxed">{copy.step2Description}</p><div className="bg-blue-50 p-6 rounded-3xl border border-blue-100"><p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">{copy.tryPrompt}</p><p className="text-sm font-medium italic text-slate-600">{copy.promptExample}</p></div></div>
          <TutorialImage id="step2" src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80" alt={copy.aiTech} icon="fa-brain" gradient="from-blue-500 to-indigo-700" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6"><div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-semibold text-xl">3</div><h2 className="text-3xl font-semibold text-slate-900">{copy.step3Title}</h2><p className="text-slate-500 font-medium leading-relaxed">{copy.step3Description}</p><div className="pt-2"><button onClick={onBack} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-semibold text-sm uppercase tracking-widest hover:bg-black transition-all">{copy.tryNow}</button></div></div>
          <TutorialImage id="step3" src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80" alt={copy.exportSuccess} icon="fa-file-pdf" gradient="from-emerald-400 to-teal-600" />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-40">
        <div className="text-center mb-16"><h2 className="text-4xl font-semibold text-slate-900 uppercase tracking-tighter mb-4">{copy.faqTitle}</h2><p className="text-slate-400 font-medium">{copy.faqDescription}</p></div>
        <div className="space-y-4">
          {faqData.map((item, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} className="w-full px-8 py-7 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"><span className="font-semibold text-slate-800 text-lg pr-8">{item.q}</span><div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeFaq === idx ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}><i className="fas fa-chevron-down text-xs"></i></div></button>
              {activeFaq === idx && <div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed animate-in slide-in-from-top-2 duration-300"><div className="h-px bg-slate-100 mb-6 w-full"></div>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HelpView;
