import React, { useEffect, useState } from 'react';
import { Language, Invoice, User } from '../types';
import { saveBillingProfile } from '@/lib/api/billing-profiles';
import { updateProfile } from '@/lib/api/invoice';
import { useBillingProfiles } from '@/hooks/useBillingProfiles';
import { getSenderDefaultsFromBillingProfile } from '@/lib/billing-profiles';
import { calculateInvoiceTotal } from '@/lib/invoice';
import { isInvoicePaid, normalizeInvoiceStatus } from '@/lib/invoice-status';
import { getLocaleForLanguage } from '@/lib/language';

interface ProfileViewProps {
  records: Invoice[];
  templatesCount: number;
  user: User | null;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onRefreshBillingProfiles: () => Promise<void>;
  lang: Language;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface CopySet {
  pageTitle: string;
  pageDescription: string;
  memberSince: string;
  accountOwner: string;
  recordsLabel: string;
  templatesLabel: string;
  billedLabel: string;
  paidLabel: string;
  businessTitle: string;
  businessSubtitle: string;
  companyName: string;
  billingEmail: string;
  website: string;
  phone: string;
  address: string;
  notConfigured: string;
  subscriptionEyebrow: string;
  subscriptionTitle: string;
  usageLabel: string;
  usageReset: string;
  manageBilling: string;
  integrationsTitle: string;
  integrationsSubtitle: string;
  connected: string;
  pending: string;
  available: string;
  unavailable: string;
  teamTitle: string;
  teamSubtitle: string;
  inviteMembers: string;
  securityTitle: string;
  securitySubtitle: string;
  logout: string;
  editName: string;
  saving: string;
  saveButton: string;
  cancelButton: string;
  saveSuccess: string;
  saveError: string;
  businessSaveSuccess: string;
  businessSaveError: string;
  comingSoon: string;
  syncSettings: string;
  editBusiness: string;
  defaultSenderBadge: string;
  activeStatus: string;
}

function getCopy(lang: Language): CopySet {
  const copyByLang: Record<Language, CopySet> = {
    'zh-CN': {
      pageTitle: '账户设置',
      pageDescription: '管理你的个人资料、开票抬头与控制台订阅展示。',
      memberSince: '加入时间',
      accountOwner: '账户所有者',
      recordsLabel: '发票数量',
      templatesLabel: '模板数量',
      billedLabel: '累计开票',
      paidLabel: '已结清',
      businessTitle: '企业信息',
      businessSubtitle: '在这里设置新增发票时自动带入的默认抬头。Bill To 默认为空，从编辑器下拉选择。',
      companyName: '公司名称',
      billingEmail: '企业邮箱',
      website: '官方网站',
      phone: '联系电话',
      address: '注册地址',
      notConfigured: '未设置',
      subscriptionEyebrow: '当前方案',
      subscriptionTitle: 'Professional Plus',
      usageLabel: '本月开票额度',
      usageReset: '额度会在下个计费周期重置',
      manageBilling: '管理账单',
      integrationsTitle: '生态集成',
      integrationsSubtitle: '预留常用生态插件入口，不额外接入真实逻辑。',
      connected: '已连接',
      pending: '待处理',
      available: '可用',
      unavailable: '未关联',
      teamTitle: '企业协作',
      teamSubtitle: '后续升级团队版后，可以邀请成员共同管理发票、模板与客户资料。',
      inviteMembers: '邀请成员',
      securityTitle: '登录安全',
      securitySubtitle: '目前账号通过第三方授权登录，你可以在这里安全退出当前会话。',
      logout: '退出登录',
      editName: '编辑名称',
      saving: '保存中...',
      saveButton: '保存',
      cancelButton: '取消',
      saveSuccess: '个人资料已更新！',
      saveError: '更新失败，请重试',
      businessSaveSuccess: '默认抬头已更新！',
      businessSaveError: '默认抬头更新失败，请重试',
      comingSoon: '此功能稍后接入。',
      syncSettings: '同步设置',
      editBusiness: '编辑默认',
      defaultSenderBadge: '默认抬头',
      activeStatus: '启用中',
    },
    'zh-TW': {
      pageTitle: '帳戶設定',
      pageDescription: '管理你的個人資料、開票抬頭與控制台訂閱展示。',
      memberSince: '加入時間',
      accountOwner: '帳戶所有者',
      recordsLabel: '發票數量',
      templatesLabel: '模板數量',
      billedLabel: '累計開票',
      paidLabel: '已結清',
      businessTitle: '企業資訊',
      businessSubtitle: '在這裡設定新增發票時自動帶入的預設抬頭。Bill To 預設為空，從編輯器下拉選擇。',
      companyName: '公司名稱',
      billingEmail: '企業郵箱',
      website: '官方網站',
      phone: '聯絡電話',
      address: '註冊地址',
      notConfigured: '未设置',
      subscriptionEyebrow: '当前方案',
      subscriptionTitle: 'Professional Plus',
      usageLabel: '本月開票額度',
      usageReset: '額度會在下個計費週期重置',
      manageBilling: '管理帳單',
      integrationsTitle: '生態集成',
      integrationsSubtitle: '預留常用生態插件入口，不額外接入真實邏輯。',
      connected: '已連接',
      pending: '待處理',
      available: '可用',
      unavailable: '未關聯',
      teamTitle: '企業協作',
      teamSubtitle: '後續升級團隊版後，可以邀請成員共同管理發票、模板與客戶資料。',
      inviteMembers: '邀請成員',
      securityTitle: '登入安全',
      securitySubtitle: '目前帳號透過第三方授權登入，你可以在這裡安全登出目前會話。',
      logout: '登出',
      editName: '編輯名稱',
      saving: '保存中...',
      saveButton: '保存',
      cancelButton: '取消',
      saveSuccess: '個人資料已更新！',
      saveError: '更新失敗，請重試',
      businessSaveSuccess: '預設抬頭已更新！',
      businessSaveError: '預設抬頭更新失敗，請重試',
      comingSoon: '此功能稍後接入。',
      syncSettings: '同步設定',
      editBusiness: '編輯預設',
      defaultSenderBadge: '預設抬頭',
      activeStatus: '啟用中',
    },
    en: {
      pageTitle: 'Account Settings',
      pageDescription: 'Manage your identity, billing profile preview, and subscription modules from one place.',
      memberSince: 'Member Since',
      accountOwner: 'Account Owner',
      recordsLabel: 'Invoices',
      templatesLabel: 'Templates',
      billedLabel: 'Total Billed',
      paidLabel: 'Paid',
      businessTitle: 'Business Profile',
      businessSubtitle: 'Set the default sender used for new invoices here. Bill To stays empty until you choose a saved client in the editor.',
      companyName: 'Company Name',
      billingEmail: 'Billing Email',
      website: 'Website',
      phone: 'Phone',
      address: 'Registered Address',
      notConfigured: 'Not configured',
      subscriptionEyebrow: 'Current Plan',
      subscriptionTitle: 'Professional Plus',
      usageLabel: 'Monthly invoice capacity',
      usageReset: 'Usage resets at the next billing cycle',
      manageBilling: 'Manage Billing',
      integrationsTitle: 'Integrations',
      integrationsSubtitle: 'Reserved slots for ecosystem plugins without wiring external services yet.',
      connected: 'Connected',
      pending: 'Pending',
      available: 'Available',
      unavailable: 'Unavailable',
      teamTitle: 'Team Workspace',
      teamSubtitle: 'Upgrade to a team tier later to invite coworkers into invoices, templates, and client operations.',
      inviteMembers: 'Invite Members',
      securityTitle: 'Security',
      securitySubtitle: 'This account currently uses federated sign-in. Sign out here when you need to switch users.',
      logout: 'Logout',
      editName: 'Edit name',
      saving: 'Saving...',
      saveButton: 'Save',
      cancelButton: 'Cancel',
      saveSuccess: 'Profile updated successfully!',
      saveError: 'Update failed, please retry.',
      businessSaveSuccess: 'Default sender updated successfully!',
      businessSaveError: 'Failed to update the default sender. Please retry.',
      comingSoon: 'This action will be connected later.',
      syncSettings: 'Sync settings',
      editBusiness: 'Edit Default',
      defaultSenderBadge: 'Default Sender',
      activeStatus: 'Active',
    },
    th: {
      pageTitle: 'การตั้งค่าบัญชี',
      pageDescription: 'จัดการโปรไฟล์ ส่วนหัวใบแจ้งหนี้เริ่มต้น และโมดูลการสมัครสมาชิกของแดชบอร์ดได้จากที่เดียว',
      memberSince: 'สมาชิกตั้งแต่',
      accountOwner: 'เจ้าของบัญชี',
      recordsLabel: 'จำนวนใบแจ้งหนี้',
      templatesLabel: 'จำนวนเทมเพลต',
      billedLabel: 'ยอดออกบิลรวม',
      paidLabel: 'ชำระแล้ว',
      businessTitle: 'ข้อมูลธุรกิจ',
      businessSubtitle: 'ตั้งค่าผู้ส่งเริ่มต้นสำหรับใบแจ้งหนี้ใหม่ที่นี่ ส่วน Bill To จะว่างไว้จนกว่าคุณจะเลือกจากรายการในตัวแก้ไข',
      companyName: 'ชื่อบริษัท',
      billingEmail: 'อีเมลสำหรับออกบิล',
      website: 'เว็บไซต์',
      phone: 'โทรศัพท์',
      address: 'ที่อยู่จดทะเบียน',
      notConfigured: 'ยังไม่ได้ตั้งค่า',
      subscriptionEyebrow: 'แผนปัจจุบัน',
      subscriptionTitle: 'Professional Plus',
      usageLabel: 'โควตาออกบิลรายเดือน',
      usageReset: 'โควตาจะรีเซ็ตในรอบบิลถัดไป',
      manageBilling: 'จัดการการเรียกเก็บเงิน',
      integrationsTitle: 'การเชื่อมต่อ',
      integrationsSubtitle: 'สงวนพื้นที่ไว้สำหรับปลั๊กอินในระบบนิเวศ โดยยังไม่เชื่อมบริการภายนอกจริง',
      connected: 'เชื่อมต่อแล้ว',
      pending: 'รอดำเนินการ',
      available: 'พร้อมใช้',
      unavailable: 'ยังไม่เชื่อม',
      teamTitle: 'การทำงานร่วมกัน',
      teamSubtitle: 'ภายหลังคุณสามารถอัปเกรดเป็นแพ็กเกจทีมเพื่อเชิญสมาชิกมาจัดการใบแจ้งหนี้ เทมเพลต และข้อมูลลูกค้าได้',
      inviteMembers: 'เชิญสมาชิก',
      securityTitle: 'ความปลอดภัยในการเข้าสู่ระบบ',
      securitySubtitle: 'บัญชีนี้ใช้การเข้าสู่ระบบผ่านผู้ให้บริการภายนอก คุณสามารถออกจากระบบได้อย่างปลอดภัยที่นี่',
      logout: 'ออกจากระบบ',
      editName: 'แก้ไขชื่อ',
      saving: 'กำลังบันทึก...',
      saveButton: 'บันทึก',
      cancelButton: 'ยกเลิก',
      saveSuccess: 'อัปเดตโปรไฟล์แล้ว!',
      saveError: 'อัปเดตไม่สำเร็จ โปรดลองอีกครั้ง',
      businessSaveSuccess: 'อัปเดตผู้ส่งเริ่มต้นแล้ว!',
      businessSaveError: 'อัปเดตผู้ส่งเริ่มต้นไม่สำเร็จ โปรดลองอีกครั้ง',
      comingSoon: 'ฟีเจอร์นี้จะเชื่อมต่อในภายหลัง',
      syncSettings: 'ซิงก์การตั้งค่า',
      editBusiness: 'แก้ไขค่าเริ่มต้น',
      defaultSenderBadge: 'ผู้ส่งเริ่มต้น',
      activeStatus: 'ใช้งานอยู่',
    },
    id: {
      pageTitle: 'Pengaturan Akun',
      pageDescription: 'Kelola profil Anda, default billing profile, dan modul langganan dashboard dari satu tempat.',
      memberSince: 'Menjadi anggota sejak',
      accountOwner: 'Pemilik akun',
      recordsLabel: 'Jumlah invoice',
      templatesLabel: 'Jumlah template',
      billedLabel: 'Total ditagih',
      paidLabel: 'Lunas',
      businessTitle: 'Profil Bisnis',
      businessSubtitle: 'Atur pengirim default untuk invoice baru di sini. Bill To tetap kosong sampai Anda memilih klien tersimpan di editor.',
      companyName: 'Nama Perusahaan',
      billingEmail: 'Email Penagihan',
      website: 'Situs web',
      phone: 'Telepon',
      address: 'Alamat Terdaftar',
      notConfigured: 'Belum dikonfigurasi',
      subscriptionEyebrow: 'Paket Saat Ini',
      subscriptionTitle: 'Professional Plus',
      usageLabel: 'Kapasitas invoice bulanan',
      usageReset: 'Kuota akan direset pada siklus penagihan berikutnya',
      manageBilling: 'Kelola Penagihan',
      integrationsTitle: 'Integrasi',
      integrationsSubtitle: 'Slot disiapkan untuk plugin ekosistem tanpa menghubungkan layanan eksternal dulu.',
      connected: 'Terhubung',
      pending: 'Menunggu',
      available: 'Tersedia',
      unavailable: 'Belum terhubung',
      teamTitle: 'Kolaborasi Tim',
      teamSubtitle: 'Nanti Anda bisa upgrade ke paket tim untuk mengundang anggota mengelola invoice, template, dan data klien bersama.',
      inviteMembers: 'Undang Anggota',
      securityTitle: 'Keamanan Login',
      securitySubtitle: 'Akun ini saat ini menggunakan login pihak ketiga. Anda bisa keluar dengan aman di sini saat perlu berganti pengguna.',
      logout: 'Keluar',
      editName: 'Edit nama',
      saving: 'Menyimpan...',
      saveButton: 'Simpan',
      cancelButton: 'Batal',
      saveSuccess: 'Profil berhasil diperbarui!',
      saveError: 'Pembaruan gagal, silakan coba lagi.',
      businessSaveSuccess: 'Pengirim default berhasil diperbarui!',
      businessSaveError: 'Gagal memperbarui pengirim default. Silakan coba lagi.',
      comingSoon: 'Aksi ini akan disambungkan nanti.',
      syncSettings: 'Sinkronkan pengaturan',
      editBusiness: 'Edit Default',
      defaultSenderBadge: 'Pengirim Default',
      activeStatus: 'Aktif',
    },
  };

  return copyByLang[lang];
}

function formatCurrency(amount: number, currency: string, lang: Language) {
  try {
    return new Intl.NumberFormat(getLocaleForLanguage(lang), {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(getLocaleForLanguage(lang), {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

function formatMonth(date: string | undefined, lang: Language) {
  if (!date) return '--';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '--';

  return new Intl.DateTimeFormat(getLocaleForLanguage(lang), {
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function getWebsiteFromEmail(email: string | undefined) {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1];
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/75 px-5 py-4 shadow-[0_1.125rem_2.1875rem_-1.75rem_rgba(15,23,42,0.5)]">
      <div className={`text-[1.75rem] font-semibold tracking-[-0.04em] ${accent}`}>{value}</div>
      <div className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
    </div>
  );
}

function SettingField({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <div className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[0.9375rem] font-semibold text-slate-700">
        {value}
      </div>
    </div>
  );
}

function IntegrationCard({
  icon,
  name,
  status,
  tone,
}: {
  icon: string;
  name: string;
  status: string;
  tone: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_1.25rem_2.5rem_-2.125rem_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
          <i className={`${icon} text-[1.25rem]`}></i>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] ${tone}`}>
          {status}
        </span>
      </div>
      <div className="mt-5 text-[1.0625rem] font-semibold tracking-[-0.02em] text-slate-900">{name}</div>
    </div>
  );
}

const ProfileView: React.FC<ProfileViewProps> = ({
  records,
  templatesCount,
  user,
  onLogout,
  onUpdateUser,
  onRefreshBillingProfiles,
  lang,
  showToast,
}) => {
  const copy = getCopy(lang);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isBusinessEditing, setIsBusinessEditing] = useState(false);
  const [isBusinessSaving, setIsBusinessSaving] = useState(false);
  const [businessDraft, setBusinessDraft] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    setEditName(user?.name || '');
  }, [user?.name]);

  const billingProfiles = useBillingProfiles({
    userId: user?.id,
    lang,
    showToast,
  });

  const safeUserName = user?.name || '';
  const safeUserEmail = user?.email || '';
  const initials = safeUserName.slice(0, 2).toUpperCase();
  const billableRecords = records.filter((record) => {
    const normalizedStatus = normalizeInvoiceStatus(record.status);
    return normalizedStatus === 'Pending' || normalizedStatus === 'Paid';
  });
  const latestCurrency = billableRecords.find((record) => record.currency)?.currency || records.find((record) => record.currency)?.currency || 'USD';
  const totalBilled = billableRecords.reduce((sum, record) => sum + calculateInvoiceTotal(record), 0);
  const paidCount = billableRecords.filter((record) => isInvoicePaid(record)).length;
  const storedDefaultSender = getSenderDefaultsFromBillingProfile(
    billingProfiles.senderProfiles.find((profile) => profile.isDefault)
  );
  const defaultSender = {
    ...storedDefaultSender,
    name: storedDefaultSender.name || safeUserName,
    email: storedDefaultSender.email || safeUserEmail,
  };
  const website = getWebsiteFromEmail(defaultSender.email);
  const usageLimit = 200;
  const usageCurrent = Math.min(records.length, usageLimit);
  const usagePercent = usageCurrent === 0 ? 0 : Math.max((usageCurrent / usageLimit) * 100, 6);

  if (!user) return null;

  const handleComingSoon = () => {
    showToast?.(copy.comingSoon, 'info');
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);

    try {
      const { profile } = await updateProfile(editName.trim());
      const updatedUser = { ...user, name: editName.trim(), profile: profile || user.profile };
      onUpdateUser(updatedUser);
      localStorage.setItem('sb_user_session', JSON.stringify(updatedUser));
      setIsEditing(false);
      showToast?.(copy.saveSuccess, 'success');
    } catch (error) {
      console.error(copy.saveError, error);
      showToast?.(copy.saveError, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusinessProfile = async () => {
    if (!businessDraft.name.trim()) return;
    setIsBusinessSaving(true);

    try {
      await saveBillingProfile('sender', businessDraft, true);
      await billingProfiles.refresh();
      await onRefreshBillingProfiles();
      setIsBusinessEditing(false);
      showToast?.(copy.businessSaveSuccess, 'success');
    } catch (error) {
      console.error(copy.businessSaveError, error);
      showToast?.(copy.businessSaveError, 'error');
    } finally {
      setIsBusinessSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[92.5rem] px-4 py-6 md:px-6 lg:px-8 xl:px-10">
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_1.75rem_3.75rem_-2.625rem_rgba(15,23,42,0.45)]">
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.25fr)_minmax(22.5rem,0.95fr)]">
            <div className="p-6 md:p-8 xl:p-10">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-blue-600">{copy.pageTitle}</div>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{copy.pageDescription}</p>
                </div>
                <span className="rounded-full bg-blue-600 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_0.75rem_1.375rem_-1rem_rgba(37,99,235,0.58)]">
                  PRO
                </span>
              </div>

              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="relative shrink-0">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50 via-sky-50 to-blue-200 text-[2.375rem] font-semibold text-slate-800 shadow-[0_1.25rem_2.8125rem_-1.75rem_rgba(15,23,42,0.45)] ring-4 ring-white">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white bg-blue-600"></span>
                </div>

                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="max-w-xl space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="h-14 w-full rounded-2xl border border-blue-200 bg-white px-4 text-[1.875rem] font-semibold tracking-[-0.04em] text-slate-900 outline-none ring-0 focus:border-blue-500"
                        autoFocus
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving || !editName.trim()}
                          className="h-11 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSaving ? copy.saving : copy.saveButton}
                        </button>
                        <button
                          onClick={() => {
                            setEditName(user.name);
                            setIsEditing(false);
                          }}
                          className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
                        >
                          {copy.cancelButton}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="min-w-0 text-[2.375rem] font-semibold tracking-[-0.05em] text-slate-900">{user.name}</h1>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-slate-500 transition-all hover:border-blue-200 hover:text-blue-700"
                        >
                          {copy.editName}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span>{user.email}</span>
                        <span className="hidden h-1.5 w-1.5 rounded-full bg-slate-200 md:block"></span>
                        <span>{copy.memberSince} {formatMonth(user.profile?.created_at, lang)}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          {copy.accountOwner}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {user.provider}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50/70 p-6 md:p-8 xl:border-l xl:border-t-0 xl:p-10">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                <StatCard value={String(records.length)} label={copy.recordsLabel} accent="text-slate-900" />
                <StatCard value={String(templatesCount)} label={copy.templatesLabel} accent="text-slate-900" />
                <StatCard value={formatCurrency(totalBilled, latestCurrency, lang)} label={copy.billedLabel} accent="text-blue-600" />
                <StatCard value={String(paidCount)} label={copy.paidLabel} accent="text-emerald-600" />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(22.5rem,0.88fr)]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_1.75rem_3.75rem_-2.5rem_rgba(15,23,42,0.4)] md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className='flex-1'>
                <div className="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{copy.businessTitle}  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {copy.defaultSenderBadge}
                </span></div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{copy.businessSubtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">

                {isBusinessEditing ? (
                  <>
                    <button
                      onClick={handleSaveBusinessProfile}
                      disabled={isBusinessSaving || !businessDraft.name.trim()}
                      className="rounded-full bg-blue-600 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusinessSaving ? copy.saving : copy.saveButton}
                    </button>
                    <button
                      onClick={() => {
                        setBusinessDraft({
                          name: defaultSender.name || '',
                          email: defaultSender.email || '',
                          phone: defaultSender.phone || '',
                          address: defaultSender.address || '',
                        });
                        setIsBusinessEditing(false);
                      }}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-slate-500 transition-all hover:border-blue-200 hover:text-blue-700"
                    >
                      {copy.cancelButton}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setBusinessDraft({
                        name: defaultSender.name || '',
                        email: defaultSender.email || '',
                        phone: defaultSender.phone || '',
                        address: defaultSender.address || '',
                      });
                      setIsBusinessEditing(true);
                    }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-slate-500 transition-all hover:border-blue-200 hover:text-blue-700"
                  >
                    {copy.editBusiness}
                  </button>
                )}
              </div>
            </div>

            {isBusinessEditing ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.companyName}</div>
                  <input
                    value={businessDraft.name}
                    onChange={(event) => setBusinessDraft((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder={copy.companyName}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[0.9375rem] font-semibold text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <div className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.billingEmail}</div>
                  <input
                    value={businessDraft.email}
                    onChange={(event) => setBusinessDraft((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder={copy.billingEmail}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[0.9375rem] font-semibold text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
                <SettingField label={copy.website} value={getWebsiteFromEmail(businessDraft.email) || copy.notConfigured} />
                <div>
                  <div className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.phone}</div>
                  <input
                    value={businessDraft.phone}
                    onChange={(event) => setBusinessDraft((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder={copy.phone}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[0.9375rem] font-semibold text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.address}</div>
                  <textarea
                    value={businessDraft.address}
                    onChange={(event) => setBusinessDraft((prev) => ({ ...prev, address: event.target.value }))}
                    placeholder={copy.address}
                    className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[0.9375rem] font-semibold text-slate-700 outline-none resize-none focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <SettingField label={copy.companyName} value={defaultSender.name || copy.notConfigured} />
                <SettingField label={copy.billingEmail} value={defaultSender.email || copy.notConfigured} />
                <SettingField label={copy.website} value={website || copy.notConfigured} />
                <SettingField label={copy.phone} value={defaultSender.phone || copy.notConfigured} />
                <SettingField label={copy.address} value={defaultSender.address || copy.notConfigured} wide />
              </div>
            )}
          </section>

          <div className="space-y-8">
            <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#f8fbff_0%,#eaf3ff_58%,#dbeafe_100%)] p-6 text-slate-900 shadow-[0_1.875rem_4.375rem_-2.1875rem_rgba(37,99,235,0.18)] md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-blue-600">{copy.subscriptionEyebrow}</div>
                  <h2 className="mt-3 text-[2.125rem] font-semibold tracking-[-0.05em]">{copy.subscriptionTitle}</h2>
                </div>
                <span className="rounded-full bg-white/70 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
                  {copy.activeStatus}
                </span>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                  <span>{copy.usageLabel}</span>
                  <span className="font-semibold">{usageCurrent} / {usageLimit}</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#93c5fd_0%,#2563eb_100%)] transition-all"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-3 text-xs text-slate-500">{copy.usageReset}</div>
              </div>

              <button
                onClick={handleComingSoon}
                className="mt-8 h-14 w-full rounded-[1.25rem] bg-blue-600 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-all hover:scale-[1.01] hover:bg-blue-700"
              >
                {copy.manageBilling}
              </button>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_1.75rem_3.75rem_-2.5rem_rgba(15,23,42,0.4)] md:p-8">
              <div>
                <div className="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{copy.integrationsTitle}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{copy.integrationsSubtitle}</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <IntegrationCard icon="fab fa-stripe-s" name="Stripe" status={copy.connected} tone="bg-emerald-50 text-emerald-700" />
                <IntegrationCard icon="fab fa-paypal" name="PayPal" status={copy.pending} tone="bg-amber-50 text-amber-700" />
                <IntegrationCard icon="fas fa-file-invoice-dollar" name="QuickBooks" status={copy.unavailable} tone="bg-slate-100 text-slate-500" />
                <IntegrationCard icon="fab fa-slack" name="Slack" status={copy.available} tone="bg-blue-50 text-blue-700" />
              </div>
            </section>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_23.75rem]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_1.75rem_3.75rem_-2.5rem_rgba(15,23,42,0.4)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{copy.teamTitle}</div>
                <p className="mt-3 text-base font-semibold tracking-[-0.02em] text-slate-900">{copy.teamSubtitle}</p>
              </div>
              <button
                onClick={handleComingSoon}
                className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
              >
                {copy.inviteMembers}
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-red-100 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(254,242,242,0.75))] p-6 shadow-[0_1.75rem_3.75rem_-2.5rem_rgba(248,113,113,0.35)] md:p-8">
            <div className="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-red-400">{copy.securityTitle}</div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{copy.securitySubtitle}</p>
            <button
              onClick={onLogout}
              className="mt-8 h-12 w-full rounded-2xl bg-slate-950 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-all hover:bg-red-600"
            >
              {copy.logout}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
