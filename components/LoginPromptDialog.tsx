'use client';

import React from 'react';
import { translations } from '../i18n';
import type { Language } from '../types';

interface LoginPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  isProcessing?: boolean;
  targetPath?: string;
  errorMessage?: string | null;
  lang?: Language;
}

function getTargetLabel(targetPath: string | undefined, t: any) {
  if (!targetPath) return t.loginTargetDashboard || 'the dashboard';
  if (targetPath.startsWith('/invoices/new')) return t.loginTargetNewInvoice || 'a new invoice';
  if (targetPath.startsWith('/templates')) return t.loginTargetTemplates || 'the templates workspace';
  if (targetPath.startsWith('/settings')) return t.loginTargetSettings || 'account settings';
  if (targetPath.startsWith('/dashboard')) return t.loginTargetDashboard || 'the dashboard';
  return t.loginTargetWorkspace || 'the workspace';
}

export default function LoginPromptDialog({
  isOpen,
  onClose,
  onContinue,
  isProcessing = false,
  targetPath,
  errorMessage,
  lang = 'en',
}: LoginPromptDialogProps) {
  if (!isOpen) return null;

  const t = translations[lang] || translations.en;
  const targetLabel = getTargetLabel(targetPath, t);
  const descriptionTemplate = t.loginPromptDescription || 'You are about to open {target}. Use Google sign-in once, then SmartBill will take you to the right console page automatically.';

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="marketing-login-title">
      <div
        className={`absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity ${isProcessing ? 'cursor-wait' : ''}`}
        onClick={() => {
          if (!isProcessing) onClose();
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)]">
        <div className="bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-6 pb-4 pt-6 sm:px-7">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_20px_40px_-24px_rgba(37,99,235,0.8)]">
            <i className="fab fa-google text-lg"></i>
          </div>
          <h2 id="marketing-login-title" className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
            {t.loginPromptTitle || 'Sign in to continue'}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {descriptionTemplate.replace('{target}', targetLabel)}
          </p>
        </div>

        <div className="px-6 pb-6 pt-4 sm:px-7">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {t.loginPromptPrivateRoutes || 'Private console routes require authentication. Public marketing pages stay accessible without login.'}
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t.loginPromptCancel || 'Cancel'}
            </button>
            <button
              onClick={onContinue}
              disabled={isProcessing}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <i className={`${isProcessing ? 'fas fa-circle-notch fa-spin' : 'fab fa-google'} text-sm`}></i>
              {isProcessing ? (t.loginPromptOpeningGoogle || 'Opening Google...') : (t.loginPromptContinueGoogle || 'Continue with Google')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
