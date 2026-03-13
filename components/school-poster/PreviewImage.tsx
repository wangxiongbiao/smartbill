import React from 'react';

function ImageFallback({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-sky-100 text-center ${className || ''}`}>
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
        <i className="fas fa-school text-2xl"></i>
      </div>
      <p className="text-sm font-semibold tracking-[0.2em] text-slate-500 uppercase">{title}</p>
      {subtitle && <p className="mt-2 max-w-[12rem] text-xs leading-5 text-slate-400">{subtitle}</p>}
    </div>
  );
}

export default function PreviewImage({
  src,
  alt,
  className,
  fallbackTitle,
  fallbackSubtitle,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
  fallbackSubtitle?: string;
}) {
  if (!src) {
    return <ImageFallback title={fallbackTitle} subtitle={fallbackSubtitle} className={className} />;
  }

  return <img src={src} alt={alt} className={className} />;
}
