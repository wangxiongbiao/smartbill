import React from 'react';
import PosterShellPreview from '@/components/school-poster/PosterShellPreview';
import type { Language, SchoolPoster } from '@/types';

interface SchoolPosterPreviewProps {
  poster: SchoolPoster;
  lang?: Language;
  editable?: boolean;
  onChange?: (poster: SchoolPoster) => void;
}

export default function SchoolPosterPreview({ poster, lang, editable = false, onChange }: SchoolPosterPreviewProps) {
  return <PosterShellPreview poster={poster} lang={lang} editable={editable} onChange={onChange} />;
}
