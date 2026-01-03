
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 mt-auto no-print relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                <i className="fas fa-file-invoice text-lg"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                  SmartBill
                </span>
                <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mt-1">
                  Professional Pro
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">
              SmartBill Pro 是专为现代企业家和自由职业者打造的顶级开票平台。我们通过创新的 AI 技术和极简的设计，帮助全球用户提升计费效率，塑造专业品牌形象。
            </p>
          </div>


          {/* Contact Info */}
          <div className="md:col-span-8 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">联系我们</h4>
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">官方支持邮箱</p>
                  <p className="text-sm font-black text-slate-900 select-all">support@smartbillpro@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">服务时间</p>
                  <p className="text-sm font-black text-slate-900">周一至周五</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">上午9:00 - 下午5:00 (太平洋时间)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} SMARTBILL PRO. 精准计费，智领未来.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              系统运行正常
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
