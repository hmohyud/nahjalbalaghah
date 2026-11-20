'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ManuscriptStudio, type CompareView, type StudioState, type StudyMode } from '@/app/components/manuscripts';

const SECTION_PATTERN = /^\d+\.\d+$/;

/**
 * /manuscripts/view. The URL keeps the view shareable:
 *   ?section=1.12&mode=compare&ms=<id>,<id>&view=details
 * Older links still work: mode=single|reading|comparison and library=<id>.
 */
const ManuscriptsContent = () => {
  const searchParams = useSearchParams();

  const [section, setSection] = useState(() => {
    const fromUrl = (searchParams.get('section') || '').trim();
    return SECTION_PATTERN.test(fromUrl) ? fromUrl : '1.1';
  });

  const [initial] = useState(() => {
    const modeParam = searchParams.get('mode');
    const mode: StudyMode =
      modeParam === 'compare' || modeParam === 'comparison' ? 'compare'
        : modeParam === 'edition' || modeParam === 'reading' ? 'edition'
          : 'single';
    const ms = searchParams.get('ms');
    return {
      mode,
      manuscripts: ms ? ms.split(',').map(id => id.trim()).filter(Boolean) : undefined,
      preferred: searchParams.get('library') || undefined,
      compareView: (searchParams.get('view') === 'details' ? 'details' : 'pages') as CompareView,
    };
  });

  const stateRef = useRef<StudioState>({
    mode: initial.mode,
    manuscripts: initial.manuscripts || [],
    compareView: initial.compareView,
  });

  const writeUrl = useCallback((currentSection: string) => {
    const state = stateRef.current;
    const params = new URLSearchParams();
    params.set('section', currentSection);
    if (state.mode !== 'single') params.set('mode', state.mode);
    if (state.manuscripts.length) params.set('ms', state.manuscripts.join(','));
    if (state.mode === 'compare' && state.compareView === 'details') params.set('view', 'details');
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}`);
  }, []);

  useEffect(() => {
    writeUrl(section);
  }, [section, writeUrl]);

  const handleStateChange = useCallback((state: StudioState) => {
    stateRef.current = state;
    writeUrl(section);
  }, [section, writeUrl]);

  return (
    <ManuscriptStudio
      variant="page"
      section={section}
      onSectionChange={setSection}
      initialMode={initial.mode}
      initialManuscripts={initial.manuscripts}
      preferredManuscript={initial.preferred}
      initialCompareView={initial.compareView}
      onStateChange={handleStateChange}
    />
  );
};

export default ManuscriptsContent;
