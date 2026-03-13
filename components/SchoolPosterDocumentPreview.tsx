import React from 'react';
import DocumentCardPreview from '@/components/school-poster/DocumentCardPreview';
import type { SchoolPoster } from '@/types';

interface SchoolPosterDocumentPreviewProps {
  poster: SchoolPoster;
}

export default function SchoolPosterDocumentPreview({ poster: _poster }: SchoolPosterDocumentPreviewProps) {
  return (
    <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(219,238,251,0.95),_rgba(255,255,255,0.9)_55%)] p-10 shadow-[0_2.5rem_5rem_-2.5rem_rgba(15,23,42,0.25)]">
      <div className="mx-auto w-[32rem] max-w-full">
        <DocumentCardPreview brand={_poster.shell.brand} />
      </div>
    </div>
  );
}
