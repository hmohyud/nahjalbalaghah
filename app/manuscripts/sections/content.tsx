'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ManuscriptStudio, type CompareView, type StudioState, type StudyMode } from '@/app/components/manuscripts';

const SECTION_PATTERN = /^\d+\.\d+$/;
const SLOT_PATTERN = /^(ms|ed):.+/;

/**
 * /manuscripts/view. The URL keeps the view shareable:
 *   ?section=1.12                                   one manuscript
 *   ?section=1.12&mode=edition&ms=<id>&ed=Attar     a manuscript beside an edition's text
 *   ?section=1.12&mode=compare&cols=ms:<id>,ed:Qutbuddin,ms:<id>&view=details
 * Older links still work: mode=single|reading|comparison, ms=<id>,<id> and library=<id>.
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
    const msList = (searchParams.get('ms') || '').split(',').map(id => id.trim()).filter(Boolean);
    const cols = (searchParams.get('cols') || '').split(',').map(key => key.trim()).filter(key => SLOT_PATTERN.test(key));
    // Older Compare links listed the manuscripts in ms= (even a single one)
    const compare = cols.length ? cols : mode === 'compare' && msList.length ? msList.map(id => `ms:${id}`) : undefined;
    return {
      mode,
      manuscript: msList[0],
      edition: searchParams.get('ed') || undefined,
      compare,
      preferred: searchParams.get('library') || undefined,
      compareView: (searchParams.get('view') === 'details' ? 'details' : 'pages') as CompareView,
    };
  });

  const stateRef = useRef<StudioState | null>(null);

  const writeUrl = useCallback((currentSection: string) => {
    const state = stateRef.current;
    const params = new URLSearchParams();
    params.set('section', currentSection);
    if (state) {
      if (state.mode !== 'single') params.set('mode', state.mode);
      if (state.manuscript) params.set('ms', state.manuscript);
      if (state.mode === 'edition') params.set('ed', state.edition);
      if (state.mode === 'compare' && state.compare.length) params.set('cols', state.compare.join(','));
      if (state.mode === 'compare' && state.compareView === 'details') params.set('view', 'details');
    }
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}`);
  }, []);

  useEffect(() => {
    if (stateRef.current) writeUrl(section);
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
      initialManuscript={initial.manuscript}
      initialEdition={initial.edition}
      initialCompare={initial.compare}
      preferredManuscript={initial.preferred}
      initialCompareView={initial.compareView}
      onStateChange={handleStateChange}
    />
  );
};

export default ManuscriptsContent;
