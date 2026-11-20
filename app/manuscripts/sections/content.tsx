'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Select } from '@/app/components/ui';
import { ManuscriptViewer } from '@/app/components/manuscripts';
import ContentDescription from '@/app/components/content/content-description';
import {
  manuscriptsApi,
  Manuscript,
  getManuscriptImageUrl,
  librariesApi,
  Library,
  convertLibraryItemToManuscriptDetails,
  manuscriptMatchesLibrary,
} from '@/api/manuscripts';
import { Post, orationsApi, lettersApi, sayingsApi } from '@/api/posts';
import { STATIC_MANUSCRIPTS } from '@/data/static-manuscripts';
import {
  Loader2, Scroll, Calendar, MapPin, BookOpen, Building2, FileText, User, Info,
  GitCompare, Layout, Image as ImageIcon
} from 'lucide-react';

type SectionType = 'oration' | 'letter' | 'saying' | 'introduction' | 'conclusion';
type ViewMode = 'single' | 'reading' | 'comparison';

const ManuscriptsContent = () => {
  const searchParams = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  // Set by the cards on /manuscripts and the "View manuscript" links on /manuscripts/information
  const modeFromUrl = searchParams.get('mode');
  const libraryFromUrl = searchParams.get('library');

  const [allManuscripts, setAllManuscripts] = useState<Manuscript[]>([]);
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [selectedType, setSelectedType] = useState<SectionType>('oration');
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlSection, setUrlSection] = useState<string | null>(null);

  // Parallel reading and comparison
  const [viewMode, setViewMode] = useState<ViewMode>(
    modeFromUrl === 'reading' || modeFromUrl === 'comparison' ? modeFromUrl : 'single'
  );
  const [normalizedContent, setNormalizedContent] = useState<Post | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [secondManuscript, setSecondManuscript] = useState<Manuscript | null>(null);
  const [secondLibrary, setSecondLibrary] = useState<Library | null>(null);
  const [compareCount, setCompareCount] = useState<2 | 3>(2);
  const [thirdManuscript, setThirdManuscript] = useState<Manuscript | null>(null);
  const [thirdLibrary, setThirdLibrary] = useState<Library | null>(null);

  const getSectionDisplayNumber = useCallback((section: string): string => {
    const parts = section.split('.');
    return parts.length > 1 ? parts[1] : section;
  }, []);

  const getTypeFromSection = useCallback((section: string): 'oration' | 'letter' | 'saying' | 'introduction' | null => {
    if (section.startsWith('1')) return 'oration';
    if (section.startsWith('2')) return 'letter';
    if (section.startsWith('3')) return 'saying';
    if (section.startsWith('0')) return 'introduction';
    return null;
  }, []);

  // Initialize from URL if present
  useEffect(() => {
    if (sectionFromUrl) {
      const type = getTypeFromSection(sectionFromUrl);
      if (type) setSelectedType(type);
      setUrlSection(sectionFromUrl);
      setSelectedNumber(getSectionDisplayNumber(sectionFromUrl));
    }
  }, [sectionFromUrl, getSectionDisplayNumber, getTypeFromSection]);

  // Fetch the critical edition text for parallel reading
  useEffect(() => {
    const fetchNormalizedContent = async () => {
      if (viewMode !== 'reading' || !selectedNumber) {
        setNormalizedContent(null);
        return;
      }

      try {
        setIsContentLoading(true);
        const sectionNum = selectedType === 'oration' ? `1.${selectedNumber}` :
          selectedType === 'letter' ? `2.${selectedNumber}` :
            selectedType === 'saying' ? `3.${selectedNumber}` :
              selectedType === 'introduction' ? `0.${selectedNumber}` :
                selectedType === 'conclusion' ? `0.${selectedNumber}` : '';

        if (!sectionNum) return;

        let post = null;
        if (selectedType === 'oration') post = await orationsApi.getOrationBySermonNumber(sectionNum);
        else if (selectedType === 'letter') post = await lettersApi.getLetterBySermonNumber(sectionNum);
        else if (selectedType === 'saying') post = await sayingsApi.getSayingBySermonNumber(sectionNum);

        setNormalizedContent(post);
      } catch (err) {
        console.error('Error fetching normalized content:', err);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchNormalizedContent();
  }, [viewMode, selectedNumber, selectedType]);

  const manuscriptBelongsToLibrary = useCallback((manuscript: Manuscript, library: Library): boolean => {
    return manuscriptMatchesLibrary(manuscript, library);
  }, []);

  const filterByLibraryAndType = useCallback((library: Library | null) => {
    if (!library) return [];
    return allManuscripts.filter(m => {
      const section = m.section || '';
      const type = getTypeFromSection(section);
      const isTypeMatch = selectedType === 'introduction' || selectedType === 'conclusion'
        ? section.startsWith('0')
        : type === selectedType;
      return isTypeMatch && manuscriptBelongsToLibrary(m, library);
    });
  }, [allManuscripts, selectedType, manuscriptBelongsToLibrary, getTypeFromSection]);

  const sortBySectionNumber = useCallback((list: Manuscript[]) => {
    return [...list].sort((a, b) => {
      const numA = parseInt(getSectionDisplayNumber(a.section || ''), 10);
      const numB = parseInt(getSectionDisplayNumber(b.section || ''), 10);
      return numA - numB;
    });
  }, [getSectionDisplayNumber]);

  const availableSections = useMemo(
    () => sortBySectionNumber(filterByLibraryAndType(selectedLibrary)),
    [filterByLibraryAndType, selectedLibrary, sortBySectionNumber]
  );
  const secondAvailableSections = useMemo(
    () => sortBySectionNumber(filterByLibraryAndType(secondLibrary)),
    [filterByLibraryAndType, secondLibrary, sortBySectionNumber]
  );
  const thirdAvailableSections = useMemo(
    () => sortBySectionNumber(filterByLibraryAndType(thirdLibrary)),
    [filterByLibraryAndType, thirdLibrary, sortBySectionNumber]
  );

  // The whole manuscript of the selected library as one page sequence, so Next/Previous in
  // single view walk through every page. Sections share pages (several short sayings on one
  // page), so pages are listed once, in the order sections first reach them.
  const fullManuscript = useMemo(() => {
    if (!selectedLibrary) return { pages: [] as { url: string; sections: string[] }[], startIndex: new Map<string, number>() };
    const sectionKey = (s: string) => s.split('.').map(n => parseInt(n, 10) || 0);
    const ordered = allManuscripts
      .filter(m => manuscriptBelongsToLibrary(m, selectedLibrary) && m.files?.length)
      .sort((a, b) => {
        const [a1, a2] = sectionKey(a.section || ''), [b1, b2] = sectionKey(b.section || '');
        return a1 - b1 || a2 - b2;
      });
    const pages: { url: string; sections: string[] }[] = [];
    const indexByUrl = new Map<string, number>();
    const startIndex = new Map<string, number>(); // section -> index of its first page
    for (const m of ordered) {
      for (const file of m.files || []) {
        let i = indexByUrl.get(file.url);
        if (i === undefined) {
          i = pages.push({ url: file.url, sections: [] }) - 1;
          indexByUrl.set(file.url, i);
        }
        if (!pages[i].sections.includes(m.section)) pages[i].sections.push(m.section);
        if (!startIndex.has(m.section)) startIndex.set(m.section, i);
      }
    }
    return { pages, startIndex };
  }, [allManuscripts, selectedLibrary, manuscriptBelongsToLibrary]);

  const [fullPageIndex, setFullPageIndex] = useState(0);

  // Choosing a section from the dropdowns jumps to its first page, unless the current page
  // already belongs to it (which is the case when the selection followed the page, below)
  useEffect(() => {
    if (!selectedManuscript) return;
    const onCurrentPage = fullManuscript.pages[fullPageIndex]?.sections.includes(selectedManuscript.section);
    if (onCurrentPage) return;
    const start = fullManuscript.startIndex.get(selectedManuscript.section);
    if (start !== undefined) setFullPageIndex(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManuscript, fullManuscript]);

  // Paging past the end of a section moves the Type/Number selection to the section on the new page
  const handleFullPageChange = (index: number) => {
    setFullPageIndex(index);
    const sections = fullManuscript.pages[index]?.sections || [];
    if (!sections.length || (selectedManuscript && sections.includes(selectedManuscript.section))) return;
    const section = sections[0];
    const type = getTypeFromSection(section);
    if (type && type !== selectedType && !(type === 'introduction' && selectedType === 'conclusion')) setSelectedType(type);
    setSelectedNumber(getSectionDisplayNumber(section));
    setUrlSection(null);
  };

  const sectionLabel = (section: string) => {
    const type = getTypeFromSection(section);
    const label = type === 'oration' ? 'Oration' : type === 'letter' ? 'Letter' : type === 'saying' ? 'Saying' : 'Introduction';
    return `${label} ${getSectionDisplayNumber(section)}`;
  };

  const comparisonNumbers = useMemo(() => {
    const nums1 = availableSections.map(m => getSectionDisplayNumber(m.section || ''));
    const nums2 = secondAvailableSections.map(m => getSectionDisplayNumber(m.section || ''));
    const nums3 = thirdAvailableSections.map(m => getSectionDisplayNumber(m.section || ''));

    const union = new Set<string>([...nums1, ...nums2, ...(compareCount === 3 ? nums3 : [])]);
    const commonSet = new Set<string>(nums1);
    for (const n of Array.from(commonSet)) {
      if (!nums2.includes(n)) commonSet.delete(n);
    }
    if (compareCount === 3) {
      for (const n of Array.from(commonSet)) {
        if (!nums3.includes(n)) commonSet.delete(n);
      }
    }

    const toSorted = (values: string[]) =>
      [...values].sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0));

    return {
      union: toSorted(Array.from(union)),
      common: toSorted(Array.from(commonSet)),
    };
  }, [availableSections, compareCount, getSectionDisplayNumber, secondAvailableSections, thirdAvailableSections]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [librariesResponse, firstPageManuscripts] = await Promise.all([
          librariesApi.getAllLibraries(1, 100),
          manuscriptsApi.getAllManuscripts(1, 100)
        ]);

        const fetchedLibraries = librariesResponse.data || [];
        setLibraries(fetchedLibraries);

        let allFetchedManuscripts = firstPageManuscripts.data || [];
        const totalPages = firstPageManuscripts.meta?.pagination?.pageCount || 1;

        if (totalPages > 1) {
          const remainingPages = [];
          for (let p = 2; p <= totalPages; p++) {
            remainingPages.push(manuscriptsApi.getAllManuscripts(p, 100));
          }
          const additionalResponses = await Promise.all(remainingPages);
          additionalResponses.forEach(response => {
            if (response.data) {
              allFetchedManuscripts = [...allFetchedManuscripts, ...response.data];
            }
          });
        }

        setAllManuscripts(allFetchedManuscripts);

        if (fetchedLibraries.length > 0) {
          // Prefer a library that has manuscript images available
          const libraryWithManuscripts = fetchedLibraries.find(lib => {
            const libName = lib.name.toLowerCase();
            return allFetchedManuscripts.some(m => {
              if (m.files && m.files.length > 0) {
                const fileNames = m.files.map(f => f.name?.toLowerCase() || '').join(' ');
                if (libName.includes('mar') && libName.includes('ashi')) {
                  return fileNames.includes("mar'ashi") || fileNames.includes("marashi") || fileNames.includes("mar_ashi");
                }
                const significantPart = libName.split(' ')[0];
                if (significantPart.length > 3) {
                  return fileNames.includes(significantPart);
                }
              }
              return false;
            });
          });

          const libraryWithItems = fetchedLibraries.find(l => l.library_items?.length > 0);
          const requestedLibrary = libraryFromUrl ? fetchedLibraries.find(l => l.documentId === libraryFromUrl) : undefined;
          const first = requestedLibrary || libraryWithManuscripts || libraryWithItems || fetchedLibraries[0];
          const second = fetchedLibraries.find(l => l.documentId !== first.documentId) || first;
          const third = fetchedLibraries.find(l => l.documentId !== first.documentId && l.documentId !== second.documentId) || second;
          setSelectedLibrary(first);
          setSecondLibrary(second);
          setThirdLibrary(third);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load manuscripts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (availableSections.length > 0) {
      let manuscriptToSelect = null;

      if (selectedNumber) {
        manuscriptToSelect = availableSections.find(m =>
          getSectionDisplayNumber(m.section || '') === selectedNumber
        );
      }

      if (manuscriptToSelect) {
        setSelectedManuscript(manuscriptToSelect);
      } else if (!urlSection && viewMode !== 'comparison') {
        // Only default to the first one if not from URL
        manuscriptToSelect = availableSections[0];
        const newNumber = getSectionDisplayNumber(manuscriptToSelect.section || '');
        setSelectedNumber(newNumber);
        setSelectedManuscript(manuscriptToSelect);
      } else {
        // In comparison mode the selected number may only exist in one of
        // the other libraries. Keep the number and leave this column empty.
        setSelectedManuscript(null);
      }
    } else {
      setSelectedManuscript(null);
    }
  }, [availableSections, selectedNumber, selectedLibrary, getSectionDisplayNumber, urlSection, viewMode]);

  // Second manuscript (comparison mode)
  useEffect(() => {
    if (viewMode === 'comparison' && secondAvailableSections.length > 0) {
      let manuscriptToSelect = null;

      if (selectedNumber) {
        manuscriptToSelect = secondAvailableSections.find(m =>
          getSectionDisplayNumber(m.section || '') === selectedNumber
        );
      }

      if (manuscriptToSelect) {
        setSecondManuscript(manuscriptToSelect);
      } else if (selectedNumber) {
        setSecondManuscript(null);
      }
    } else if (viewMode !== 'comparison') {
      setSecondManuscript(null);
    }
  }, [secondAvailableSections, selectedNumber, secondLibrary, getSectionDisplayNumber, viewMode]);

  // Third manuscript (comparison mode, three-way)
  useEffect(() => {
    if (viewMode === 'comparison' && compareCount === 3 && thirdAvailableSections.length > 0) {
      let manuscriptToSelect = null;

      if (selectedNumber) {
        manuscriptToSelect = thirdAvailableSections.find(m =>
          getSectionDisplayNumber(m.section || '') === selectedNumber
        );
      }

      if (manuscriptToSelect) {
        setThirdManuscript(manuscriptToSelect);
      } else if (selectedNumber) {
        setThirdManuscript(null);
      }
      return;
    }

    setThirdManuscript(null);
  }, [compareCount, getSectionDisplayNumber, selectedNumber, thirdAvailableSections, thirdLibrary, viewMode]);

  useEffect(() => {
    if (viewMode !== 'comparison') return;
    const allowed = comparisonNumbers.union;
    if (allowed.length === 0) return;
    if (!selectedNumber || !allowed.includes(selectedNumber)) {
      setSelectedNumber(allowed[0]);
    }
  }, [comparisonNumbers.union, selectedNumber, viewMode]);

  const handleLibraryChange = (value: string) => {
    const library = libraries.find(l => l.documentId === value);
    if (library) setSelectedLibrary(library);
    setUrlSection(null);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as SectionType);
    setSelectedNumber('');
    setUrlSection(null);
  };

  const handleNumberChange = (value: string) => {
    setSelectedNumber(value);
  };

  const handleSecondLibraryChange = (value: string) => {
    const library = libraries.find(l => l.documentId === value);
    if (library) setSecondLibrary(library);
  };

  const handleThirdLibraryChange = (value: string) => {
    const library = libraries.find(l => l.documentId === value);
    if (library) setThirdLibrary(library);
  };

  const libraryOptions = libraries.map(lib => ({
    value: lib.documentId,
    label: lib.name
  }));

  const typeOptions = [
    { value: 'oration', label: 'Orations' },
    { value: 'letter', label: 'Letters' },
    { value: 'saying', label: 'Sayings' },
    { value: 'introduction', label: 'Introduction' },
    { value: 'conclusion', label: 'Conclusion' }
  ];

  const numberOptions = useMemo(() => {
    const uniqueNumbers = viewMode === 'comparison'
      ? (comparisonNumbers.union.length > 0 ? comparisonNumbers.union : [])
      : Array.from(new Set(availableSections.map(m => getSectionDisplayNumber(m.section || ''))));
    return uniqueNumbers.map(num => ({ value: num, label: num }));
  }, [availableSections, comparisonNumbers.union, getSectionDisplayNumber, viewMode]);

  const getCurrentLibraryDetails = () => {
    if (selectedLibrary && selectedLibrary.library_items && selectedLibrary.library_items.length > 0) {
      return convertLibraryItemToManuscriptDetails(selectedLibrary);
    }
    const name = selectedLibrary?.name?.toLowerCase() || '';
    if (name.includes("mar'ashi") || name.includes("marashi")) return STATIC_MANUSCRIPTS.marashi;
    if (name.includes('shahrastan')) return STATIC_MANUSCRIPTS.shahrastani;

    return selectedLibrary ? {
      id: selectedLibrary.documentId,
      name: selectedLibrary.name,
      siglaEnglish: '', siglaArabic: '', library: '', city: '', country: '',
      date: '', catalogNumber: '', completeness: '', scribe: '', dimensions: '',
      originCity: '', features: '', permanentLink: '', orationSequence: '',
      format: '', additionalInfo: '',
    } : {
      id: '',
      name: 'Select Manuscript',
      siglaEnglish: '', siglaArabic: '', library: '', city: '', country: '',
      date: '', catalogNumber: '', completeness: '', scribe: '', dimensions: '',
      originCity: '', features: '', permanentLink: '', orationSequence: '',
      format: '', additionalInfo: '',
    };
  };

  const currentLibraryDetails = getCurrentLibraryDetails();

  if (isLoading) {
    return (
      <div className="ms-content">
        <div className="ms-content__container ms-content__container--centered">
          <div className="ms-content__loading-text">
            <Loader2 className="w-12 h-12 ms-content__spinner" />
            <p className="ms-content__loading-message">Loading manuscripts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ms-content">
        <div className="ms-content__container ms-content__container--centered">
          <div className="ms-content__loading-text">
            <Scroll className="w-16 h-16 ms-content__error-icon" />
            <p className="ms-content__error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const manuscriptPages = selectedManuscript?.files?.map(file => getManuscriptImageUrl(file.url)) || [];
  const contentTypeLabel = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);

  const comparisonColumns = [
    { label: 'Manuscript 1', library: selectedLibrary, manuscript: selectedManuscript, sections: availableSections },
    { label: 'Manuscript 2', library: secondLibrary, manuscript: secondManuscript, sections: secondAvailableSections },
    ...(compareCount === 3
      ? [{ label: 'Manuscript 3', library: thirdLibrary, manuscript: thirdManuscript, sections: thirdAvailableSections }]
      : []),
  ];

  const modeButtons: { mode: ViewMode; label: string; icon: React.ElementType }[] = [
    { mode: 'single', label: 'Single View', icon: Layout },
    { mode: 'reading', label: 'Parallel Reading', icon: BookOpen },
    { mode: 'comparison', label: 'Comparison', icon: GitCompare },
  ];

  const renderUnavailable = (libraryName: string | undefined, pending = false) => (
    <div className="ms-content__panel ms-content__empty">
      <div className="ms-content__corner--tl" />
      <div className="ms-content__corner--br" />
      <Scroll className="w-16 h-16 ms-content__empty-icon" />
      <h3 className="ms-content__empty-title">No {contentTypeLabel} Available</h3>
      <p className="ms-content__empty-text">
        Manuscript images for <span className="ms-content__empty-highlight">{libraryName || 'this library'}</span>{' '}
        {pending ? 'are pending.' : 'are currently being digitized and will be available soon.'}
      </p>
    </div>
  );

  const renderFallback = (message: string) => (
    <div className="ms-content__panel ms-content__empty">
      <div className="ms-content__corner--tl" />
      <div className="ms-content__corner--br" />
      <p className="ms-content__fallback-text">{message}</p>
    </div>
  );

  const mainGridClass = viewMode === 'reading'
    ? 'ms-content__grid--reading'
    : viewMode === 'single' && selectedManuscript
      ? 'ms-content__grid--with-sidebar'
      : 'ms-content__grid';

  return (
    <div className="ms-content">
      <div className="ms-content__container">
        {/* View Mode */}
        <div className="ms-content__section ms-content__mode-row">
          <div className="ms-content__mode-switch" role="tablist" aria-label="Viewer mode">
            {modeButtons.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                role="tab"
                aria-selected={viewMode === mode}
                onClick={() => setViewMode(mode)}
                className={`ms-content__mode-btn ${viewMode === mode ? 'ms-content__mode-btn--active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {viewMode === 'comparison' && (
            <div className="ms-content__mode-note">
              <GitCompare className="w-4 h-4 ms-content__mode-note-icon" />
              {compareCount === 3 ? 'Comparing three manuscripts side-by-side' : 'Comparing two manuscripts side-by-side'}
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="ms-content__section">
          <div className="ms-content__panel">
            <div className="ms-content__corner--tl" />
            <div className="ms-content__corner--br" />

            <div className="ms-content__filter-inner">
              <div className={`ms-content__filter-grid ${viewMode === 'comparison' ? (compareCount === 3 ? 'ms-content__filter-grid--compare-3' : 'ms-content__filter-grid--compare-2') : ''}`}>
                <div>
                  <label className="ms-content__filter-label">{viewMode === 'comparison' ? 'Manuscript 1' : 'Manuscript'}</label>
                  <Select options={libraryOptions} value={selectedLibrary?.documentId || ''} onChange={handleLibraryChange} placeholder="Select Manuscript..." className="w-full" />
                </div>
                {viewMode === 'comparison' && (
                  <div>
                    <label className="ms-content__filter-label">Manuscript 2</label>
                    <Select options={libraryOptions} value={secondLibrary?.documentId || ''} onChange={handleSecondLibraryChange} placeholder="Select Manuscript..." className="w-full" />
                  </div>
                )}
                {viewMode === 'comparison' && compareCount === 3 && (
                  <div>
                    <label className="ms-content__filter-label">Manuscript 3</label>
                    <Select options={libraryOptions} value={thirdLibrary?.documentId || ''} onChange={handleThirdLibraryChange} placeholder="Select Manuscript..." className="w-full" />
                  </div>
                )}
                <div>
                  <label className="ms-content__filter-label">Type</label>
                  <Select options={typeOptions} value={selectedType} onChange={handleTypeChange} placeholder="Select Type..." className="w-full" />
                </div>
                <div>
                  <label className="ms-content__filter-label">Number</label>
                  <Select options={numberOptions} value={selectedNumber} onChange={handleNumberChange} placeholder="Select Number..." className="w-full" />
                </div>
                {viewMode === 'comparison' && (
                  <div>
                    <label className="ms-content__filter-label">Compare</label>
                    <Select
                      options={[
                        { value: '2', label: '2 manuscripts' },
                        { value: '3', label: '3 manuscripts' },
                      ]}
                      value={String(compareCount)}
                      onChange={(v) => setCompareCount(v === '3' ? 3 : 2)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Title Bar */}
        <div className="ms-content__section">
          <div className="ms-content__title-bar">
            <div className="ms-content__corner--tl-lg" />
            <div className="ms-content__corner--br-lg" />

            <h2 className="ms-content__title">
              {viewMode === 'comparison'
                ? `Comparing: ${selectedLibrary?.name || 'Manuscript 1'}${secondLibrary ? ` & ${secondLibrary.name}` : ''}${compareCount === 3 && thirdLibrary ? ` & ${thirdLibrary.name}` : ''} — ${contentTypeLabel} ${selectedNumber}`
                : selectedManuscript
                  ? `${currentLibraryDetails.name} - ${contentTypeLabel} ${selectedNumber}`
                  : `${currentLibraryDetails.name} - ${contentTypeLabel}`}
            </h2>

            {viewMode !== 'comparison' && (
              <div className="ms-content__title-meta">
                {(selectedManuscript?.gregorianYear || currentLibraryDetails.date) && (
                  <div className="ms-content__title-meta-item">
                    <Calendar className="w-4 h-4 ms-content__title-meta-icon" />
                    <span className="ms-content__title-meta-label">Date:</span>
                    <span className="ms-content__title-meta-value">{selectedManuscript?.gregorianYear || currentLibraryDetails.date}</span>
                  </div>
                )}
                {(selectedManuscript?.city || currentLibraryDetails.city) && (
                  <div className="ms-content__title-meta-item">
                    <MapPin className="w-4 h-4 ms-content__title-meta-icon" />
                    <span className="ms-content__title-meta-label">Location:</span>
                    <span className="ms-content__title-meta-value">
                      {selectedManuscript?.city || currentLibraryDetails.city}
                      {(selectedManuscript?.country || currentLibraryDetails.country) && `, ${selectedManuscript?.country || currentLibraryDetails.country}`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'comparison' ? (
          <div className={`ms-content__compare-grid ${compareCount === 3 ? 'ms-content__compare-grid--three' : ''}`}>
            {comparisonColumns.map((column) => {
              const pages = column.manuscript?.files?.map(file => getManuscriptImageUrl(file.url)) || [];
              return (
                <div key={column.label}>
                  <div className="ms-content__compare-label">
                    {column.library?.name || (column.manuscript ? getManuscriptDisplayName(column.manuscript) : column.label)}
                  </div>
                  {column.sections.length === 0
                    ? renderUnavailable(column.library?.name, true)
                    : column.manuscript && pages.length > 0
                      ? <ManuscriptViewer pages={pages} bookName={column.manuscript.bookName || ''} />
                      : renderFallback(selectedNumber
                        ? `No manuscript for ${contentTypeLabel} ${selectedNumber} in this library.`
                        : 'Select a number to compare.')}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={mainGridClass}>
            {/* Viewer */}
            <div>
              {availableSections.length === 0 ? (
                renderUnavailable(selectedLibrary?.name)
              ) : viewMode === 'single' && fullManuscript.pages.length > 0 ? (
                <ManuscriptViewer
                  pages={fullManuscript.pages.map(p => getManuscriptImageUrl(p.url))}
                  bookName={selectedManuscript?.bookName || selectedLibrary?.name || ''}
                  currentPage={fullPageIndex}
                  onPageChange={handleFullPageChange}
                  caption={(fullManuscript.pages[fullPageIndex]?.sections || []).map(sectionLabel).join(', ')}
                />
              ) : selectedManuscript && manuscriptPages.length > 0 ? (
                <ManuscriptViewer pages={manuscriptPages} bookName={selectedManuscript.bookName || ''} />
              ) : (
                renderFallback('No manuscript available for this selection.')
              )}
            </div>

            {/* Metadata Panel */}
            {viewMode === 'single' && selectedManuscript && (
              <div>
                <div className="ms-content__metadata-sticky">
                  <div className="ms-content__panel">
                    <div className="ms-content__corner--tl" />
                    <div className="ms-content__corner--br" />

                    <div className="ms-content__metadata-inner">
                      <h3 className="ms-content__metadata-header">
                        Manuscript Details
                      </h3>

                      <div className="ms-content__metadata-library-row">
                        <span className="ms-content__metadata-library-label">Current Library:</span>
                        <span className="ms-content__metadata-library-badge">
                          {currentLibraryDetails.name}
                        </span>
                      </div>

                      <div className="ms-content__metadata-fields">
                        {(currentLibraryDetails.siglaEnglish || currentLibraryDetails.siglaArabic) && (
                          <div className="ms-content__metadata-row">
                            <BookOpen className="w-4 h-4 ms-content__metadata-icon" />
                            <div>
                              <span className="ms-content__metadata-label">Sigla</span>
                              <div className="ms-content__metadata-sigla">
                                {currentLibraryDetails.siglaEnglish && (
                                  <span className="ms-content__metadata-value--medium">{currentLibraryDetails.siglaEnglish}</span>
                                )}
                                {currentLibraryDetails.siglaArabic && (
                                  <span className="ms-content__metadata-value--arabic" dir="rtl">{currentLibraryDetails.siglaArabic}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {currentLibraryDetails.library && (
                          <div className="ms-content__metadata-row">
                            <Building2 className="w-4 h-4 ms-content__metadata-icon" />
                            <div>
                              <span className="ms-content__metadata-label">Library</span>
                              <span className="ms-content__metadata-value">{currentLibraryDetails.library}</span>
                            </div>
                          </div>
                        )}

                        {(currentLibraryDetails.city || currentLibraryDetails.country) && (
                          <div className="ms-content__metadata-row">
                            <MapPin className="w-4 h-4 ms-content__metadata-icon" />
                            <div>
                              <span className="ms-content__metadata-label">Location</span>
                              <span className="ms-content__metadata-value">
                                {currentLibraryDetails.city}{currentLibraryDetails.city && currentLibraryDetails.country && ', '}{currentLibraryDetails.country}
                              </span>
                            </div>
                          </div>
                        )}

                        {currentLibraryDetails.date && (
                          <div className="ms-content__metadata-row">
                            <Calendar className="w-4 h-4 ms-content__metadata-icon" />
                            <div>
                              <span className="ms-content__metadata-label">Date (Hijri/Gregorian)</span>
                              <span className="ms-content__metadata-value">{currentLibraryDetails.date}</span>
                            </div>
                          </div>
                        )}

                        {currentLibraryDetails.catalogNumber && (
                          <div className="ms-content__metadata-row">
                            <FileText className="w-4 h-4 ms-content__metadata-icon" />
                            <div>
                              <span className="ms-content__metadata-label">Catalog no.</span>
                              <span className="ms-content__metadata-value">{currentLibraryDetails.catalogNumber}</span>
                            </div>
                          </div>
                        )}

                        {currentLibraryDetails.completeness && (
                          <div className="ms-content__metadata-divider">
                            <div className="ms-content__metadata-row">
                              <Info className="w-4 h-4 ms-content__metadata-icon" />
                              <div>
                                <span className="ms-content__metadata-label--wide">Completeness</span>
                                <p className="ms-content__metadata-value--sm">{currentLibraryDetails.completeness}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentLibraryDetails.scribe && currentLibraryDetails.scribe !== 'n/a' && (
                          <div className="ms-content__metadata-row">
                            <User className="w-4 h-4 ms-content__metadata-icon" />
                            <div>
                              <span className="ms-content__metadata-label">Scribe</span>
                              <span className="ms-content__metadata-value">{currentLibraryDetails.scribe}</span>
                            </div>
                          </div>
                        )}

                        {currentLibraryDetails.features && (
                          <div className="ms-content__metadata-row">
                            <BookOpen className="w-4 h-4 ms-content__metadata-icon" />
                            <div>
                              <span className="ms-content__metadata-label">Features</span>
                              <span className="ms-content__metadata-value">{currentLibraryDetails.features}</span>
                            </div>
                          </div>
                        )}

                        {currentLibraryDetails.format && (
                          <div className="ms-content__metadata-divider">
                            <span className="ms-content__metadata-label--wide">Format</span>
                            <p className="ms-content__metadata-value--sm">{currentLibraryDetails.format}</p>
                          </div>
                        )}

                        {currentLibraryDetails.additionalInfo && (
                          <div className="ms-content__metadata-divider">
                            <span className="ms-content__metadata-label--wide">Additional Information</span>
                            <div className="ms-content__metadata-info-block">
                              <p className="ms-content__metadata-info-text">
                                {currentLibraryDetails.additionalInfo}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Parallel Reading: critical edition text */}
            {viewMode === 'reading' && (
              <div className="ms-content__panel ms-content__reading-panel">
                <div className="ms-content__corner--tl" />
                <div className="ms-content__corner--br" />
                <div className="ms-content__reading-header">
                  <BookOpen className="w-4 h-4 ms-content__reading-header-icon" />
                  <h3 className="ms-content__reading-title">Normalized Content (Critical Edition)</h3>
                </div>
                <div className="ms-content__reading-body">
                  {isContentLoading ? (
                    <div className="ms-content__reading-status">
                      <Loader2 className="w-8 h-8 ms-content__spinner" />
                      <p className="ms-content__fallback-text">Fetching {contentTypeLabel} content...</p>
                    </div>
                  ) : normalizedContent ? (
                    selectedType === 'oration' || selectedType === 'letter' || selectedType === 'saying' ? (
                      <ContentDescription
                        content={normalizedContent}
                        contentType={selectedType === 'oration' ? 'orations' : selectedType === 'letter' ? 'letters' : 'sayings'}
                      />
                    ) : (
                      <div className="ms-content__reading-status">
                        <p className="ms-content__fallback-text">
                          Normalized content is currently available only for Orations, Letters, and Sayings.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="ms-content__reading-status">
                      <ImageIcon className="w-10 h-10 ms-content__empty-icon" />
                      <p className="ms-content__fallback-text">
                        No normalized content found for {contentTypeLabel} {selectedNumber}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Library/manuscript name for a comparison column
const getManuscriptDisplayName = (ms: Manuscript): string => {
  if (ms.bookName) return ms.bookName;
  if (typeof ms.library === 'string') return ms.library;
  if (Array.isArray(ms.library) && ms.library[0]?.name) return ms.library[0].name;
  if (ms.library && typeof ms.library === 'object' && 'name' in ms.library) return ms.library.name;
  if (ms.libraries?.[0]?.name) return ms.libraries[0].name;
  const firstFileName = ms.files?.[0]?.name?.toLowerCase() || '';
  if (firstFileName.includes("mar'ashi") || firstFileName.includes("marashi") || firstFileName.includes("qum_mar")) return "Mar'ashi MS";
  if (firstFileName.includes("shahrastan")) return "Shahrastani MS";
  if (firstFileName.includes("rampur")) return "Rampur Raza MS";
  return `Manuscript ${ms.id}`;
};

export default ManuscriptsContent;
