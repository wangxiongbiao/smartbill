import React from 'react';
import PosterShellPreview from '@/components/school-poster/PosterShellPreview';
import type { SchoolPoster } from '@/types';

interface SchoolPosterPreviewProps {
  poster: SchoolPoster;
}

export default function SchoolPosterPreview({ poster }: SchoolPosterPreviewProps) {
  return <PosterShellPreview poster={poster} />;
}
