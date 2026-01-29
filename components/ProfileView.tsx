
import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../i18n';
import { updateUserProfile } from '@/lib/supabase-db';

interface ProfileViewProps {
  recordsCount: number;
  user: User | null;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  lang: Language;
  showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ recordsCount, user, onLogout, onUpdateUser, lang, showToast }) => {
  const t = translations[lang] || translations['en'];
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoutClick = () => {
    onLogout();
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;

    setIsSaving(true);
    try {
      await updateUserProfile(user.id, { full_name: editName });
      const updatedUser = { ...user, name: editName };
      if (onUpdateUser) onUpdateUser(updatedUser);
      localStorage.setItem('sb_user_session', JSON.stringify(updatedUser));
      setIsEditing(false);
      showToast?.('个人信息已更新！', 'success');
    } catch (error) {
      console.error('更新失败:', error);
      showToast?.('更新失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8 mb-10">
      <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-200 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <div className="relative inline-block mb-6">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-black uppercase">
              {user.name.slice(0, 2)}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full max-w-xs mx-auto px-4 py-2 text-center text-2xl font-bold border-2 border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              autoFocus
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving || !editName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setEditName(user.name);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="group">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{user.name}</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 text-xs text-blue-600 font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i className="fas fa-edit mr-1"></i>编辑
            </button>
          </div>
        )}
        <p className="text-slate-400 font-bold text-sm mt-1">{user.email}</p>
        <div className="mt-4">
          <span className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
            {t.proMember || 'PRO MEMBER'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
            <span className="block text-2xl font-black text-blue-600">{recordsCount}</span>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mt-1 block">{t.records}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
            <span className="block text-2xl font-black text-indigo-600">PRO</span>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mt-1 block">{t.accountLevel || 'LEVEL'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-4">{t.layoutSettings}</h3>
        <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden">
          <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 border-b border-slate-100 group text-left">
            <div className="flex items-center gap-4 text-slate-700 font-bold">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-building text-slate-400"></i>
              </div>
              {t.businessSettings || 'Business Profile'}
            </div>
            <i className="fas fa-chevron-right text-slate-300"></i>
          </button>

          <button onClick={handleLogoutClick} className="w-full flex items-center justify-between p-5 hover:bg-red-50 text-red-600 font-black group text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100/50 rounded-xl flex items-center justify-center">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              {t.submitLogin === '立即登錄' ? '退出目前賬號' : 'Sign Out'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
