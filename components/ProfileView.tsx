
import React from 'react';
import { User } from '../types';

interface ProfileViewProps {
  recordsCount: number;
  user: User;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ recordsCount, user, onLogout }) => {
  const handleLogoutClick = () => {
    // 增加移动端常见的确认对话框，防止误触
    if (window.confirm('您确定要退出当前账号吗？所有未保存的草稿可能会丢失。')) {
      onLogout();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-10 mb-10">
      <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-200 text-center shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-xl shadow-blue-100 uppercase">
            {user.name.slice(0, 2)}
          </div>
          {user.provider === 'facebook' && (
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#1877F2] border-4 border-white rounded-full flex items-center justify-center text-white text-[10px]">
              <i className="fab fa-facebook"></i>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{user.name}</h2>
        <p className="text-slate-400 font-bold text-sm mt-1">{user.email}</p>
        <div className="mt-4">
          <span className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
            {user.provider === 'facebook' ? 'FACEBOOK 已授权' : '专业版会员'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-10">
          <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl text-center border border-slate-100">
            <span className="block text-2xl sm:text-3xl font-black text-blue-600">{recordsCount}</span>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mt-1 block">发票总数</span>
          </div>
          <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl text-center border border-slate-100">
            <span className="block text-2xl sm:text-3xl font-black text-indigo-600">Pro</span>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mt-1 block">账户等级</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-4">偏好设置</h3>
        <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <button className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-slate-50 transition-colors border-b border-slate-100 group text-left">
            <div className="flex items-center gap-4 text-slate-700 font-bold">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-building text-slate-400"></i>
              </div>
              企业资料设置
            </div>
            <i className="fas fa-chevron-right text-slate-300"></i>
          </button>
          
          <button className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-slate-50 transition-colors border-b border-slate-100 group text-left">
            <div className="flex items-center gap-4 text-slate-700 font-bold">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-bell text-slate-400"></i>
              </div>
              通知与提醒
            </div>
            <i className="fas fa-chevron-right text-slate-300"></i>
          </button>

          {/* 退出登录按钮 - 针对移动端优化 */}
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-red-50 transition-colors text-red-600 font-black group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100/50 rounded-xl flex items-center justify-center">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              退出当前账号
            </div>
            <span className="text-xs opacity-50 font-medium">Log out</span>
          </button>
        </div>
      </div>

      <div className="text-center pt-4 opacity-30">
        <p className="text-[10px] text-slate-900 font-bold uppercase tracking-[0.4em]">SmartBill Pro v2.5.0</p>
      </div>
    </div>
  );
};

export default ProfileView;
