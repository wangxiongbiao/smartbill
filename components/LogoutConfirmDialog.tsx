import ConfirmDialog from '@/components/ConfirmDialog';
import type { Language } from '@/types';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
  lang?: Language;
}

export default function LogoutConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
  lang = 'en',
}: LogoutConfirmDialogProps) {
  const copyByLang = {
    en: {
      title: 'Sign out now?',
      description: 'You will be returned to the homepage and can sign back in again at any time.',
      confirmText: 'Sign out',
      cancelText: 'Cancel',
    },
    'zh-CN': {
      title: '确认登出？',
      description: '登出后将返回首页，之后仍然可以重新登录继续使用当前账号。',
      confirmText: '登出',
      cancelText: '取消',
    },
    'zh-TW': {
      title: '確認登出？',
      description: '登出後將返回首頁，之後仍然可以重新登入繼續使用目前帳號。',
      confirmText: '登出',
      cancelText: '取消',
    },
    th: {
      title: 'ยืนยันการออกจากระบบ?',
      description: 'คุณจะถูกพากลับไปที่หน้าแรก และสามารถเข้าสู่ระบบอีกครั้งได้ทุกเมื่อ',
      confirmText: 'ออกจากระบบ',
      cancelText: 'ยกเลิก',
    },
    id: {
      title: 'Keluar sekarang?',
      description: 'Anda akan kembali ke beranda dan dapat masuk lagi kapan saja.',
      confirmText: 'Keluar',
      cancelText: 'Batal',
    },
  } satisfies Record<Language, {
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
  }>;
  const copy = copyByLang[lang];

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={copy.title}
      description={copy.description}
      confirmText={copy.confirmText}
      cancelText={copy.cancelText}
      isProcessing={isProcessing}
      variant="danger"
    />
  );
}
