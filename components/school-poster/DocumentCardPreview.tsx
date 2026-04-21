import React from 'react';
import PreviewImage from '@/components/school-poster/PreviewImage';
import type { SchoolPosterBrand } from '@/types';

interface DocumentCardPreviewProps {
  brand?: SchoolPosterBrand;
  className?: string;
}

function hasValue(value?: string) {
  return Boolean(value && value.trim());
}

export default function DocumentCardPreview({ brand, className = '' }: DocumentCardPreviewProps) {
  const showBrandHeader = hasValue(brand?.logo) || hasValue(brand?.title) || hasValue(brand?.subtitle);

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_2.5rem_4.5rem_-2.2rem_rgba(15,23,42,0.38)] ${className}`}>
      <div className="relative min-h-[35rem] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,249,255,0.96),_rgba(255,255,255,0.92)_52%,_rgba(240,247,255,0.98)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-14 bg-[linear-gradient(90deg,rgba(232,241,252,0.95)_0%,rgba(255,255,255,0.72)_45%,rgba(214,229,247,0.9)_100%)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 48%, 0 100%)' }} />
        {showBrandHeader && (
          <div className="absolute left-8 right-8 top-8 overflow-hidden rounded-[1.7rem] border border-[#bdd8ee] bg-[linear-gradient(180deg,#d7eaf7_0%,#dcedf9_100%)] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.4rem] bg-white/60 p-3 shadow-[0_1rem_2rem_-1.4rem_rgba(15,23,42,0.35)]">
                <PreviewImage
                  src={brand?.logo}
                  alt={brand?.title || 'Brand logo'}
                  className="h-full w-full object-contain"
                  fallbackTitle="Logo"
                  fallbackSubtitle="Upload brand"
                />
              </div>
              <div className="min-w-0 flex-1">
                {hasValue(brand?.title) && (
                  <p className="text-[0.82rem] font-semibold tracking-[0.18em] text-[#1f4fa1]">
                    {brand?.title}
                  </p>
                )}
                {hasValue(brand?.subtitle) && (
                  <p className="mt-2 max-w-[8rem] whitespace-pre-line text-[1.32rem] font-black uppercase leading-[1.02] tracking-[0.08em] text-[#0d43a3]">
                    {brand?.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className={`absolute left-8 right-8 bottom-8 rounded-[1.6rem] border border-slate-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,253,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${showBrandHeader ? 'top-[9.75rem]' : 'top-8'}`} />
        <div className="absolute right-10 top-10 h-20 w-20 rounded-full bg-[#d9ebfb]/70 blur-xl" />
        <div className="absolute bottom-12 left-10 h-24 w-24 rounded-full bg-[#edf5ff] blur-2xl" />
      </div>
    </div>
  );
}
