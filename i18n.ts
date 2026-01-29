
import { Language } from './types';

export const translations: Record<Language, any> = {
  'en': {
    home: 'Home',
    make: 'Create',
    makeInvoice: 'Make Invoice',
    makeReceipt: 'Make Receipt',
    templates: 'Invoice Templates',
    records: 'Records',
    profile: 'Profile',
    heroTitle: 'Professional Invoices',
    heroSub: 'SmartBill Pro is the premier billing platform designed for modern entrepreneurs and freelancers. We help global users improve billing efficiency and build a professional brand image through innovative AI technology and minimalist design.',
    createEmpty: 'Create Blank',
    exportPdf: 'Export PDF',
    generating: 'Generating...',
    save: 'Save',
    saveToRecords: 'Save to Records',
    items: 'Line Items',
    summary: 'Summary',
    tax: 'Tax',
    total: 'Total',
    // Auth
    login: 'Login',
    register: 'Register',
    welcomeBack: 'Welcome Back',
    welcomeSub: 'Please sign in to your account',
    joinPro: 'Join our professional billing journey',
    facebookLogin: 'Login with Facebook',
    orEmail: 'OR USE EMAIL',
    email: 'Email Address',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    submitLogin: 'Login Now',
    submitRegister: 'Register Now',
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    // Sidebar & AI
    aiAssistant: 'AI Smart Fill',
    aiAssistantDesc: 'Describe your work, let Gemini draft the items.',
    aiPlaceholder: "e.g., 'I did 5 hours of website coding and 2 logo designs...'",
    generateItems: 'Generate Items',
    thinking: 'Thinking...',
    selectTemplate: 'Select Template',
    layoutSettings: 'Layout Settings',
    swapLayout: 'Swap App Layout',
    flipHeader: 'Flip Invoice Header',
    // AIChat
    aiHeaderTitle: 'AI Quick Create',
    aiHeaderSub: 'Create invoice in one sentence',
    aiStatusOnline: 'Online',
    aiWelcome: '👋 Create invoice in one sentence!\ne.g., Invoice Apple Inc., web dev $5000',
    aiError: 'Sorry, I encountered an error communicating with the server.',
    aiPlaceholderInput: 'Press Enter to send, Shift + Enter for new line',
    // Form
    invoiceMode: 'Invoice Mode',
    receiptMode: 'Estimates Mode',
    addCustomField: 'Add Field',
    fieldName: 'Label',
    fieldValue: 'Value',
    visibility: 'Visibility',
    invNo: 'Invoice No.',
    recNo: 'Receipt No.',
    currency: 'Currency',
    billFrom: 'Bill From (Your Info)',
    billTo: 'Bill To (Client Info)',
    logoUp: 'Upload Logo',
    namePlaceholder: 'Business/Personal Name',
    addrPlaceholder: 'Address and contact info',
    clientName: 'Client Name',
    clientAddr: 'Client Address',
    itemDesc: 'Item Description',
    quantity: 'Qty',
    rate: 'Rate',
    amount: 'Amount',
    addItems: '+ Add Item',
    taxRate: 'Tax Rate / VAT (%)',
    signature: 'E-Signature',
    signPlaceholder: 'Handwrite your signature here',
    signClear: 'Clear and Resign',
    payable: 'TOTAL PAYABLE',
    notes: 'Notes',
    notesPlaceholder: 'Notes or instructions...',
    // Records
    history: 'History Records',
    manageRecords: 'Manage your generated invoices and bills',
    totalCount: 'Total {count} items',
    emptyTitle: 'No Records',
    emptySub: 'Start making invoices, they will show up here.',
    goToHome: 'Start Creating Invoice',
    newInvoice: 'New Invoice',
    newInvoiceShort: 'New',
    newInvoiceConfirm: 'Start a new invoice?',
    newInvoiceConfirmDesc: 'Any unsaved changes will be lost. Are you sure you want to create a new invoice?',
    savingCurrentInvoice: 'Saving current invoice...',
    newInvoiceCreated: 'New invoice created successfully!',
    createInvoiceFailed: 'Failed to create invoice, please try again',
    confirm: 'Confirm',
    cancel: 'Cancel',
    amountTotal: 'Total Amount',
    // Footer
    footerDesc: 'SmartBill Pro is the premier billing platform designed for modern entrepreneurs and freelancers. We help global users improve billing efficiency through innovative AI technology.',
    productFeatures: 'Products',
    support: 'Support',
    aboutUs: 'About Us',
    helpCenter: 'Help Center',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contactUs: 'Contact Us',
    supportEmail: 'Official Support',
    serviceTime: 'Service Time',
    monToFri: 'Mon - Fri',
    pacificTime: '9:00 AM - 5:00 PM (PT)',
    systemOk: 'System Online',
    copyright: '© {year} SMARTBILL PRO. Precise Billing, Smart Future.',
    // Industries
    ind_freelance: 'Freelance',
    ind_construction: 'Construction',
    ind_retail: 'Retail',
    ind_consulting: 'Consulting',
    ind_design: 'Creative Design',
    // Save Status
    saving: 'Saving...',
    saved_status: 'Saved',
    save_failed: 'Save failed',
    just_now: 'just now',
    mins_ago: '{mins} mins ago',
    // Share
    shareTitle: 'Share Invoice',
    shareSubtitle: 'Generate a link to share this invoice',
    shareLink: 'SHARE LINK',
    copy: 'Copy',
    copied: 'Copied',
    scanToShare: 'Scan QR Code',
    createShareLink: 'Create Share Link',
    createProLinkDesc: 'Create a professional, secure link to share your invoice with clients.',
    allowPdfDownload: 'Allow PDF Download',
    expiresIn: 'Expires In',
    neverExpires: 'Never',
    days7: '7 days',
    days30: '30 days',
    generateLink: 'Generate Link',
    shareCreated: 'Created',
    revoke: 'Revoke',
    readOnly: 'Read Only Mode',
    downloadPdf: 'Download PDF Invoice',
    createYourOwn: 'Create Your Professional Invoice',
    startFree: 'Start Free',
    invalidLink: 'This link is invalid or expired',
    createNow: 'Create Now',
    // Email
    sendEmail: 'Send Email',
    emailError: 'Error sending email',
    resendTestLimit: 'Resend Test Mode: You can only send to your own email address.',
    shareEmail: 'Send by Email',
    shareEmailDesc: 'Send this invoice directly to your client',
    emailSentTitle: 'Email Sent!',
    emailSentDesc: 'The invoice has been successfully sent to the recipient.',
    sendAnother: 'Send Another',
    recipientEmail: 'Recipient Email',
    emailInfo: 'The client will receive an email with a secure link to view and download this invoice.',
    linkWillBeCreated: 'A share link will be automatically created.',
    sendInvoice: 'Send Invoice',
    // Payment Info
    paymentInfo: 'Payment Info',
    bankName: 'Bank Name',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    extraInfo: 'Additional Info (SWIFT/IBAN)',
    // Column Configurator
    customizeColumns: 'Customize Columns',
    columnName: 'Column Name',
    newColumnName: 'New column name...',
    add: 'Add',
    visible: 'Visible',
    hidden: 'Hidden',
    deleteColumn: 'Delete Column',
    systemColumn: 'System Column',
    // QR Code & Logo
    uploadQR: 'Upload QR Code',
    removeQR: 'Remove QR',
    removeLogo: 'Remove Logo',
    // Payment Field Configurator
    configurePaymentFields: 'Configure Payment Fields',
    newFieldName: 'New field name...',
    deleteField: 'Delete Field',
    systemField: 'System Field',
    // Preview
    authorizedSignature: 'Authorized Signature',
    disclaimerText: 'Notes',
    poweredBy: 'Powered by SmartBill Pro',
    // Image Picker
    imagePickerTitle: 'Select Image',
    imagePickerLogo: 'Select Logo',
    imagePickerQRCode: 'Select QR Code',
    uploadNewImage: 'Upload New Image',
    selectFromHistory: 'Select from History',
    noHistoryImages: 'No history images',
    deleteImage: 'Delete',
    deleteImageConfirm: 'Are you sure to delete this image?',
    imageUploadedAt: 'Uploaded at',
    clickToSelect: 'Click to select',
    uploadingImage: 'Uploading...',
    deletingImage: 'Deleting...',
    loadingHistory: 'Loading history...',
    // Delete
    deleting: 'Deleting...',
    deleteSuccess: 'Deleted successfully',
    deleteFailed: 'Delete failed, please retry',
    // Delete Dialog
    deleteDialogTitle: 'Delete Invoice?',
    deleteDialogDescription: 'Are you sure you want to delete invoice {item}? This action cannot be undone.',
    deleteDialogConfirm: 'Delete',
    deleteDialogCancel: 'Cancel',
    // Templates
    myTemplates: 'My Templates',
    saveAsTemplate: 'Save as Template',
    templateName: 'Template Name',
    templateDescription: 'Template Description',
    templateNamePlaceholder: 'e.g., Consulting Service Invoice Template',
    templateDescPlaceholder: 'Describe the purpose and features of this template',
    saveTemplate: 'Save Template',
    useTemplate: 'Use Template',
    editTemplate: 'Edit Template',
    deleteTemplate: 'Delete Template',
    updateTemplate: 'Update Template',
    templateSaved: 'Template Saved Successfully',
    templateUpdated: 'Template Updated Successfully',
    templateDeleted: 'Template Deleted',
    noTemplates: 'No templates saved yet',
    noTemplatesDesc: 'Save your frequently used invoice configurations as templates for quick reuse.',
    templateDetail: 'Template Detail',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    usageCount: 'Used',
    usageTimes: '{count} times',
    confirmDeleteTemplate: 'Are you sure you want to delete this template?',
    viewTemplates: 'View Templates',
    createFromTemplate: 'Create from Template',
    templatePreview: 'Template Preview',
    backToTemplates: 'Back to Templates',
    // SEO Content
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      {
        q: 'How do I create a professional invoice for free?',
        a: 'With SmartBill Pro, you can create a professional invoice in seconds. Simply select a template, fill in your business details, client information, and line items, then export as a PDF. No registration is required for basic use.'
      },
      {
        q: 'What should be included in an invoice?',
        a: 'A professional invoice should include your business name and contact info, client info, a unique invoice number, date, due date, a clear description of services/products, quantities, rates, tax information, and payment instructions.'
      },
      {
        q: 'Can I use SmartBill Pro on my mobile device?',
        a: 'Yes! SmartBill Pro is fully responsive and works perfectly on smartphones and tablets. You can create, manage, and send invoices on the go.'
      },
      {
        q: 'Is my data secure?',
        a: 'We take data privacy seriously. If you create an account, your data is securely stored in our cloud. If you use it as a guest, your data remains in your local browser storage.'
      }
    ],
    whySmartBill: 'Why Choose SmartBill Pro?',
    features: [
      {
        title: 'AI-Powered Efficiency',
        desc: 'Our AI Smart Fill helps you draft invoice items from simple descriptions, saving you time and effort.'
      },
      {
        title: 'Professional Templates',
        desc: 'Choose from a variety of designer-made templates tailored for different industries like freelancing, consulting, and retail.'
      },
      {
        title: 'Zero Friction',
        desc: 'Start billing immediately without mandatory registration. We believe in getting you paid faster.'
      }
    ],
    // New SEO Content: Use Cases & Testimonials
    industriesTitle: 'Tailored for Every Industry',
    industriesList: [
      {
        title: 'Freelancers',
        desc: 'Get paid faster with professional templates designed for writers, designers, and developers.',
        icon: 'fa-laptop-code'
      },
      {
        title: 'Contractors',
        desc: 'Detailed breakdown of materials and labor for construction and renovation projects.',
        icon: 'fa-hard-hat'
      },
      {
        title: 'Small Business',
        desc: 'Streamline your billing process with tax-compliant invoices for retail and services.',
        icon: 'fa-store'
      },
      {
        title: 'Consultants',
        desc: 'Bill for your time and expertise with hourly rate templates and clear service descriptions.',
        icon: 'fa-briefcase'
      },
      {
        title: 'Legal Services',
        desc: 'Professional billing formats for law firms and attorneys with retainer management.',
        icon: 'fa-gavel'
      },
      {
        title: 'Medical',
        desc: 'HIPAA-compliant invoice templates for private practices, therapists, and dental clinics.',
        icon: 'fa-stethoscope'
      },
      {
        title: 'Automotive',
        desc: 'Clear parts and labor separation for auto repair shops and mechanics.',
        icon: 'fa-wrench'
      },
      {
        title: 'Photography',
        desc: 'Beautiful invoice designs for photographers, videographers, and creative studios.',
        icon: 'fa-camera'
      }
    ],
    testimonialsTitle: 'Trusted by 10,000+ Users',
    testimonialsList: [
      {
        name: 'Sarah Jenkins',
        role: 'Graphic Designer',
        content: 'This **free invoice generator** is a lifesaver! I used to spend hours on billing, now it takes seconds.',
        rating: 5
      },
      {
        name: 'Mike Ross',
        role: 'Construction Contractor',
        content: 'Finally, a simple **bill maker** that works perfectly on my phone while I am on the job site.',
        rating: 5
      },
      {
        name: 'Emily Chen',
        role: 'Marketing Consultant',
        content: 'The **professional invoice templates** help me look great in front of my clients. Highly recommended!',
        rating: 5
      },
      {
        name: 'David Miller',
        role: 'Small Business Owner',
        content: 'I love that there is **no signup required**. Just open the page, fill it out, and download the PDF. Best tool ever.',
        rating: 5
      },
      {
        name: 'Jessica Lee',
        role: 'Freelance Writer',
        content: 'SmartBill Pro is the **best invoice app** I have found. The templates are clean, modern, and easy to customize.',
        rating: 5
      },
      {
        name: 'Robert Taylor',
        role: 'Auto Mechanic',
        content: 'Great for separating parts and labor. My customers appreciate the clear and professional invoices.',
        rating: 5
      }
    ]
  },
  'zh-TW': {
    home: '首頁',
    make: '製作',
    makeInvoice: '製作發票',
    makeReceipt: '製作收據',
    templates: '發票模版',
    records: '發票',
    profile: '我的',
    heroTitle: '專業發票 觸手可及',
    heroSub: 'SmartBill Pro 是專為現代企業家和自由職業者打造的頂級開票平台。我們通過創新的 AI 技術和極簡的設計，幫助全球用戶提升計費效率，塑造專業品牌形象。',
    createEmpty: '創建空白發票',
    exportPdf: '導出 PDF',
    generating: '生成中...',
    save: '保存',
    saveToRecords: '保存發票',
    items: '明細清單',
    summary: '總計摘要',
    tax: '稅率',
    total: '應付總額',
    // Auth
    login: '登錄',
    register: '註冊',
    welcomeBack: '歡迎回來',
    welcomeSub: '請登錄您的賬戶',
    joinPro: '開啟您的專業開票之旅',
    facebookLogin: '通過 Facebook 登錄',
    orEmail: '或使用郵箱',
    email: '郵箱地址',
    password: '安全密碼',
    forgotPassword: '忘記密碼？',
    submitLogin: '立即登錄',
    submitRegister: '立即註冊',
    noAccount: '還沒有賬戶？',
    hasAccount: '已經有賬戶了？',
    // Sidebar & AI
    aiAssistant: 'AI 智能填充',
    aiAssistantDesc: '描述您的工作，讓 ai 草擬明細。',
    aiPlaceholder: "例如：'我做了5小時的網頁開發和2個標誌設計...'",
    generateItems: '生成明细',
    thinking: '思考中...',
    selectTemplate: '選擇模版',
    layoutSettings: '佈局設置',
    swapLayout: '切換應用佈局',
    flipHeader: '反轉發票頁眉',
    // AIChat
    aiHeaderTitle: 'AI 快速創建',
    aiHeaderSub: '一句話生成發票',
    aiStatusOnline: '在線',
    aiWelcome: '👋 一句話快速創建發票！\n例如：給蘋果公司，網站開發 5 萬元',
    aiError: '抱歉，與服務器通信時發生錯誤。',
    aiPlaceholderInput: '按 Enter 发送，Shift + Enter 换行',
    // Form
    invoiceMode: '發票模式',
    receiptMode: '收據模式',
    addCustomField: '添加字段',
    fieldName: '字段名',
    fieldValue: '內容',
    visibility: '可見性',
    invNo: '發票編號',
    recNo: '收據編號',
    currency: '貨幣單位',
    billFrom: '來自 (您的信息)',
    billTo: '發送至 (客戶信息)',
    logoUp: '上傳 Logo',
    namePlaceholder: '企業/個人名稱',
    addrPlaceholder: '地址及聯絡方式',
    clientName: '客戶名稱',
    clientAddr: '客戶收件地址',
    itemDesc: '項目描述',
    quantity: '數量',
    rate: '單價',
    amount: '金額',
    addItems: '+ 添加項目',
    taxRate: '稅率 (%)',
    signature: '電子簽名',
    signPlaceholder: '在此區域手寫您的簽名',
    signClear: '清除重新簽署',
    payable: '應付總額',
    notes: '備註說明',
    notesPlaceholder: '感謝您的支持！',
    // Records
    history: '歷史發票',
    manageRecords: '管理您已生成的發票和賬單',
    totalCount: '共 {count} 份',
    emptyTitle: '暫無發票',
    emptySub: '開始製作發票，發票將顯示在這裡。',
    goToHome: '开始创建发票',
    newInvoice: '新建發票',
    newInvoiceShort: '新建',
    newInvoiceConfirm: '確定要創建新發票嗎？',
    newInvoiceConfirmDesc: '當前發票將自動保存，然後創建新發票。確定繼續嗎？',
    savingCurrentInvoice: '正在保存當前發票...',
    newInvoiceCreated: '新發票創建成功！',
    createInvoiceFailed: '創建發票失敗，請重試',
    confirm: '確認',
    cancel: '取消',
    amountTotal: '賬單總額',
    // Footer
    footerDesc: 'SmartBill Pro 是專為現代企業家和自由職業者打造的頂級開票平台。我們通過創新的 AI 技術，幫助全球用戶提升計費效率。',
    productFeatures: '產品功能',
    support: '公司/支持',
    aboutUs: '關於我們',
    helpCenter: '幫助中心',
    privacy: '隱私政策',
    terms: '服務條款',
    contactUs: '聯繫我們',
    supportEmail: '官方支持郵箱',
    serviceTime: '服務時間',
    monToFri: '週一至週五',
    pacificTime: '上午 9:00 - 下午 5:00 (太平洋時間)',
    systemOk: '系統運行正常',
    copyright: '© {year} SMARTBILL PRO. 精準計費，智領未來.',
    // Industries
    ind_freelance: '自由職業',
    ind_construction: '建築裝修',
    ind_retail: '零售貿易',
    ind_consulting: '諮詢服務',
    ind_design: '創意設計',
    // Save Status
    saving: '保存中...',
    saved_status: '已保存',
    save_failed: '保存失敗',
    just_now: '剛剛',
    mins_ago: '{mins} 分鐘前',
    // Share
    shareTitle: '分享發票',
    shareSubtitle: '生成分享鏈接，讓他人查看或下載此發票',
    shareLink: '分享鏈接',
    copy: '複製鏈接',
    copied: '已複製',
    scanToShare: '掃描二維碼分享',
    createShareLink: '創建分享鏈接',
    createProLinkDesc: '創建一個專業、安全的鏈接與客戶分享您的發票。',
    allowPdfDownload: '允許下載 PDF',
    expiresIn: '有效期',
    neverExpires: '永久有效',
    days7: '7天',
    days30: '30天',
    generateLink: '生成鏈接',
    shareCreated: '創建於',
    revoke: '撤銷鏈接',
    readOnly: '只讀模式',
    downloadPdf: '下載 PDF 發票',
    createYourOwn: '創建您的專業發票',
    startFree: '免費開始',
    invalidLink: '此分享鏈接無效或已過期',
    createNow: '立即創建',
    // Email
    sendEmail: '發送郵件',
    emailError: '發送郵件失敗',
    resendTestLimit: '測試模式：您只能發送郵件到自己的郵箱地址。',
    shareEmail: '通過郵件發送',
    shareEmailDesc: '將此發票直接發送給您的客戶',
    emailSentTitle: '郵件已發送！',
    emailSentDesc: '發票已成功發送給收件人。',
    sendAnother: '發送另一封',
    recipientEmail: '收件人郵箱',
    emailInfo: '客戶將收到一封包含安全鏈接的郵件，用於查看和下載此發票。',
    linkWillBeCreated: '將自動生成分享鏈接。',
    sendInvoice: '發送發票',
    // Payment Info
    paymentInfo: '收款信息',
    bankName: '銀行名稱',
    accountName: '賬戶名稱',
    accountNumber: '銀行賬號',
    extraInfo: '附加信息 (SWIFT/IBAN)',
    // Column Configurator
    customizeColumns: '自定義列',
    columnName: '列名稱',
    newColumnName: '新列名稱...',
    add: '添加',
    visible: '可見',
    hidden: '隱藏',
    deleteColumn: '刪除列',
    systemColumn: '系統列',
    // QR Code & Logo
    uploadQR: '上傳二維碼',
    removeQR: '移除二維碼',
    removeLogo: '移除 Logo',
    // Payment Field Configurator
    configurePaymentFields: '配置收款字段',
    newFieldName: '新字段名稱...',
    deleteField: '刪除字段',
    systemField: '系統字段',
    // Preview
    authorizedSignature: '授權簽名',
    disclaimerText: '備註',
    poweredBy: 'SmartBill Pro 提供技術支持',
    // Image Picker
    imagePickerTitle: '選擇圖片',
    imagePickerLogo: '選擇 Logo',
    imagePickerQRCode: '選擇收款碼',
    uploadNewImage: '上傳新圖片',
    selectFromHistory: '從歷史記錄選擇',
    noHistoryImages: '暫無歷史記錄',
    deleteImage: '刪除',
    deleteImageConfirm: '確定要刪除這張圖片嗎？',
    imageUploadedAt: '上傳於',
    clickToSelect: '點擊選擇',
    uploadingImage: '上傳中...',
    deletingImage: '刪除中...',
    loadingHistory: '加載中...',
    // Delete
    deleting: '刪除中...',
    deleteSuccess: '刪除成功',
    deleteFailed: '刪除失敗，請重試',
    // Delete Dialog
    deleteDialogTitle: '確定刪除發票？',
    deleteDialogDescription: '確定要刪除發票 {item} 嗎？此操作無法復原。',
    deleteDialogConfirm: '刪除',
    deleteDialogCancel: '取消',
    // Templates
    myTemplates: '我的模板',
    saveAsTemplate: '保存為模板',
    templateName: '模板名稱',
    templateDescription: '模板描述',
    templateNamePlaceholder: '例如：諮詢服務發票模板',
    templateDescPlaceholder: '描述此模板的用途和特點',
    saveTemplate: '保存模板',
    useTemplate: '使用模板',
    editTemplate: '編輯模板',
    deleteTemplate: '刪除模板',
    updateTemplate: '更新模板',
    templateSaved: '模板保存成功',
    templateUpdated: '模板更新成功',
    templateDeleted: '模板已刪除',
    noTemplates: '還沒有保存任何模板',
    noTemplatesDesc: '將常用的發票配置保存為模板，以便快速復用。',
    templateDetail: '模板詳情',
    createdAt: '創建時間',
    updatedAt: '更新時間',
    usageCount: '使用次數',
    usageTimes: '{count} 次',
    confirmDeleteTemplate: '確定要刪除此模板嗎？',
    viewTemplates: '查看模板',
    createFromTemplate: '從模板創建',
    templatePreview: '模板預覽',
    backToTemplates: '返回模板列表',
    // SEO Content
    faqTitle: '常見問題解答',
    faqs: [
      {
        q: '如何免費創建專業發票？',
        a: '使用 SmartBill Pro，您可以在幾秒鐘內創建專業發票。只需選擇一個模板，填寫您的企業詳情、客戶信息和項目明細，然後導出為 PDF。基本使用無需註冊。'
      },
      {
        q: '發票中應該包含哪些內容？',
        a: '專業發票應包括您的企業名稱和聯繫信息、客戶信息、唯一的發票編號、日期、截止日期、服務/產品的清晰描述、數量、單價、稅務信息和付款說明。'
      },
      {
        q: '我可以在移動設備上使用 SmartBill Pro 嗎？',
        a: '可以！SmartBill Pro 完全採用響應式設計，在智慧型手機和平板電腦上運行良好。您可以隨時隨地創建、管理和發送發票。'
      },
      {
        q: '我的數據安全嗎？',
        a: '我們非常重視數據隱私。如果您創建賬戶，您的數據將安全地存儲在我們的雲端。如果您以訪客身份使用，您的數據將保留在您的本地瀏覽器存儲中。'
      }
    ],
    whySmartBill: '為什麼選擇 SmartBill Pro？',
    features: [
      {
        title: 'AI 驅動效率',
        desc: '我們的 AI 智能填充可幫助您根據簡單的描述草擬發票項目，為您節省時間和精力。'
      },
      {
        title: '專業模板',
        desc: '針對自由職業、諮詢和零售等不同行業，選擇各種由設計師製作的模板。'
      },
      {
        title: '零門檻使用',
        desc: '無需強制註冊即可立即開始開票。我們致力於讓您更快地收到款項。'
      }
    ],
    // New SEO Content: Use Cases & Testimonials
    industriesTitle: '專為各行各業量身定制',
    industriesList: [
      {
        title: '自由職業者',
        desc: '為作家、設計師和開發者設計的專業模板，助您更快獲得報酬。',
        icon: 'fa-laptop-code'
      },
      {
        title: '工程承包商',
        desc: '適用於建築和裝修項目的材料與人工詳細清單。',
        icon: 'fa-hard-hat'
      },
      {
        title: '小型企業',
        desc: '適用於零售和服務業的稅務合規發票，簡化您的計費流程。',
        icon: 'fa-store'
      },
      {
        title: '諮詢顧問',
        desc: '通過時薪模板和清晰的服務描述，為您的時間和專業知識計費。',
        icon: 'fa-briefcase'
      },
      {
        title: '法律服務',
        desc: '律師事務所和律師的專業計費格式，支持預付金管理。',
        icon: 'fa-gavel'
      },
      {
        title: '醫療保健',
        desc: '適用於私人診所、治療師和牙科診所的符合 HIPAA 標準的發票模板。',
        icon: 'fa-stethoscope'
      },
      {
        title: '汽車維修',
        desc: '清晰區分汽車維修店和機械師的零件和人工費用。',
        icon: 'fa-wrench'
      },
      {
        title: '攝影工作室',
        desc: '適用於攝影師、錄像師和創意工作室的精美發票設計。',
        icon: 'fa-camera'
      }
    ],
    testimonialsTitle: '超過 10,000 名用戶信賴',
    testimonialsList: [
      {
        name: 'Sarah Jenkins',
        role: '多媒體設計師',
        content: '這個**免費發票生成器**真是救星！我以前花幾個小時做賬單，現在只需幾秒鐘。',
        rating: 5
      },
      {
        name: 'Mike Ross',
        role: '建築承包商',
        content: '終於找到了一個簡單的**賬單製作工具**，在工地上用手機就能完美操作。',
        rating: 5
      },
      {
        name: 'Emily Chen',
        role: '營銷顧問',
        content: '這些**專業發票模板**讓我在客戶面前看起來非常專業。強烈推薦！',
        rating: 5
      },
      {
        name: 'David Miller',
        role: '小企業主',
        content: '我喜歡它**無需註冊**。只需打開頁面，填寫並下載 PDF。這是有史以來最好的工具。',
        rating: 5
      },
      {
        name: 'Jessica Lee',
        role: '自由撰稿人',
        content: 'SmartBill Pro 是我發現的**最好的發票應用程序**。模板乾淨、現代且易於自定義。',
        rating: 5
      },
      {
        name: 'Robert Taylor',
        role: '汽車修理工',
        content: '非常適合分開零件和人工。我的客戶非常欣賞清晰專業的發票。',
        rating: 5
      }
    ]
  },
};

