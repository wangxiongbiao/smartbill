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
  const copy = lang === 'zh-TW'
    ? {
      title: '確認登出？',
      description: '登出後將返回首頁，之後仍然可以重新登入繼續使用目前帳號。',
      confirmText: '登出',
      cancelText: '取消',
    }
    : {
      title: 'Sign out now?',
      description: 'You will be returned to the homepage and can sign back in again at any time.',
      confirmText: 'Sign out',
      cancelText: 'Cancel',
    };

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
