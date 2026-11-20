'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Select } from '@/app/components/ui';
import { ManuscriptViewer } from '@/app/components/manuscripts';
import {
  manuscriptsApi,
  Manuscript,
  getManuscriptImageUrl,
  librariesApi,
  Library,
  convertLibraryItemToManuscriptDetails,
  getContentTypeFromSection
} from '@/api/manuscripts';
import { STATIC_MANUSCRIPTS } from '@/data/static-manuscripts';
import { Loader2, Scroll, Calendar, MapPin, BookOpen, Building2, FileText, User, Info } from 'lucide-react';

const ManuscriptsContent = () => {
  const searchParams = useSearchParams();
  const sectionFromUrl = searchParams.get('section');

  const [allManuscripts, setAllManuscripts] = useState<Manuscript[]>([]);
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [selectedType, setSelectedType] = useState<'oration' | 'letter' | 'saying'>('oration');
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlSection, setUrlSection] = useState<string | null>(null);

  const getSectionDisplayNumber = useCallback((section: string): string => {
    const parts = section.split('.');
    return parts.length > 1 ? parts[1] : section;
  }, []);

  useEffect(() => {
    if (sectionFromUrl) {
      const type = getContentTypeFromSection(sectionFromUrl);
      if (type) setSelectedType(type);
      setUrlSection(sectionFromUrl);
      setSelectedNumber(getSectionDisplayNumber(sectionFromUrl));
    }
  }, [sectionFromUrl, getSectionDisplayNumber]);

  const manuscriptBelongsToLibrary = useCallback((manuscript: Manuscript, library: Library): boolean => {
    if (manuscript.library && manuscript.library === library.name) {
      return true;
    }

    const libraryName = library.name.toLowerCase();

    if (manuscript.files && manuscript.files.length > 0) {
      const fileNamesJoined = manuscript.files.map(f => f.name?.toLowerCase() || '').join(' ');

      if (libraryName.includes('mar') && libraryName.includes('ashi')) {
        return fileNamesJoined.includes("mar'ashi") ||
               fileNamesJoined.includes("marashi") ||
               fileNamesJoined.includes("mar_ashi");
      }

      if (libraryName.includes('shahrastan')) {
        return fileNamesJoined.includes('shahrastan');
      }

      const significantPart = libraryName.split(' ')[0];
      if (significantPart.length > 3) {
        return fileNamesJoined.includes(significantPart);
      }
    }

    return false;
  }, []);

  const filteredByLibraryAndType = useMemo(() => {
    if (!selectedLibrary) return [];

    return allManuscripts.filter(m => {
      const type = getContentTypeFromSection(m.section || '');
      const isTypeMatch = type === selectedType;
      const isLibraryMatch = manuscriptBelongsToLibrary(m, selectedLibrary);
      return isTypeMatch && isLibraryMatch;
    });
  }, [allManuscripts, selectedType, selectedLibrary, manuscriptBelongsToLibrary]);

  const availableSections = useMemo(() => {
    return [...filteredByLibraryAndType].sort((a, b) => {
      const numA = parseInt(getSectionDisplayNumber(a.section || ''), 10);
      const numB = parseInt(getSectionDisplayNumber(b.section || ''), 10);
      return numA - numB;
    });
  }, [filteredByLibraryAndType, getSectionDisplayNumber]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [librariesResponse, manuscriptsResponse] = await Promise.all([
          librariesApi.getAllLibraries(1, 100),
          manuscriptsApi.getAllManuscripts(1, 400)
        ]);

        const fetchedManuscripts = manuscriptsResponse.data || [];
        setAllManuscripts(fetchedManuscripts);

        if (librariesResponse.data && librariesResponse.data.length > 0) {
          setLibraries(librariesResponse.data);

          const libraryWithManuscripts = librariesResponse.data.find(lib => {
            const libName = lib.name.toLowerCase();
            return fetchedManuscripts.some(m => {
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

          const libraryWithItems = librariesResponse.data.find(l => l.library_items.length > 0);
          setSelectedLibrary(libraryWithManuscripts || libraryWithItems || librariesResponse.data[0]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load manuscripts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
      } else if (!urlSection) {
        manuscriptToSelect = availableSections[0];
        const newNumber = getSectionDisplayNumber(manuscriptToSelect.section || '');
        setSelectedNumber(newNumber);
        setSelectedManuscript(manuscriptToSelect);
      } else {
        setSelectedManuscript(null);
      }
    } else {
      setSelectedManuscript(null);
    }
  }, [availableSections, selectedNumber, selectedLibrary, getSectionDisplayNumber, urlSection]);

  const handleLibraryChange = (value: string) => {
    const library = libraries.find(l => l.documentId === value);
    if (library) setSelectedLibrary(library);
    setUrlSection(null);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as 'oration' | 'letter' | 'saying');
    setSelectedNumber('');
    setUrlSection(null);
  };

  const handleNumberChange = (value: string) => {
    setSelectedNumber(value);
  };

  const libraryOptions = libraries.map(lib => ({
    value: lib.documentId,
    label: lib.name
  }));

  const typeOptions = [
    { value: 'oration', label: 'Orations' },
    { value: 'letter', label: 'Letters' },
    { value: 'saying', label: 'Sayings' }
  ];

  const numberOptions = useMemo(() => {
    const uniqueNumbers = Array.from(new Set(availableSections.map(m => getSectionDisplayNumber(m.section || ''))));
    return uniqueNumbers.map(num => ({ value: num, label: num }));
  }, [availableSections, getSectionDisplayNumber]);

  const getCurrentLibraryDetails = () => {
    const name = selectedLibrary?.name?.toLowerCase() || '';
    if (name.includes("mar'ashi") || name.includes("marashi")) return STATIC_MANUSCRIPTS.marashi;
    if (name.includes('shahrastan')) return STATIC_MANUSCRIPTS.shahrastani;

    if (selectedLibrary && selectedLibrary.library_items && selectedLibrary.library_items.length > 0) {
      return convertLibraryItemToManuscriptDetails(selectedLibrary);
    }

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

  return (
    <div className="ms-content">
      <div className="ms-content__container">
        {/* Filter Bar */}
        <div className="ms-content__section">
          <div className="ms-content__panel">
            <div className="ms-content__corner--tl" />
            <div className="ms-content__corner--br" />

            <div className="ms-content__filter-inner">
              <div className="ms-content__filter-grid">
                <div>
                  <label className="ms-content__filter-label">Manuscript</label>
                  <Select options={libraryOptions} value={selectedLibrary?.documentId || ''} onChange={handleLibraryChange} placeholder="Select Manuscript..." className="w-full" />
                </div>
                <div>
                  <label className="ms-content__filter-label">Type</label>
                  <Select options={typeOptions} value={selectedType} onChange={handleTypeChange} placeholder="Select Type..." className="w-full" />
                </div>
                <div>
                  <label className="ms-content__filter-label">Number</label>
                  <Select options={numberOptions} value={selectedNumber} onChange={handleNumberChange} placeholder="Select Number..." className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title Bar */}
        <div className="ms-content__section">
          <div className="ms-content__title-bar">
            {/* Corner accents in gold */}
            <div className="ms-content__corner--tl-lg" />
            <div className="ms-content__corner--br-lg" />

            {/* Main title */}
            <h2 className="ms-content__title">
              {selectedManuscript
                ? `${currentLibraryDetails.name} - ${contentTypeLabel} ${selectedNumber}`
                : `${currentLibraryDetails.name} - ${contentTypeLabel}`}
            </h2>

            {/* Date and Location */}
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
          </div>
        </div>

        {/* Main Content */}
        <div className={selectedManuscript ? 'ms-content__grid--with-sidebar' : 'ms-content__grid'}>
          {/* Viewer */}
          <div>
            {availableSections.length === 0 ? (
              <div className="ms-content__panel ms-content__empty">
                <div className="ms-content__corner--tl" />
                <div className="ms-content__corner--br" />
                <Scroll className="w-16 h-16 ms-content__empty-icon" />
                <h3 className="ms-content__empty-title">No {contentTypeLabel} Available</h3>
                <p className="ms-content__empty-text">
                  Manuscript images for <span className="ms-content__empty-highlight">{selectedLibrary?.name || 'this library'}</span> are currently being digitized and will be available soon.
                </p>
              </div>
            ) : selectedManuscript && manuscriptPages.length > 0 ? (
              <ManuscriptViewer pages={manuscriptPages} bookName={selectedManuscript.bookName || ''} />
            ) : (
              <div className="ms-content__panel ms-content__empty">
                <div className="ms-content__corner--tl" />
                <div className="ms-content__corner--br" />
                <p className="ms-content__fallback-text">No manuscript available for this selection.</p>
              </div>
            )}
          </div>

          {/* Metadata Panel */}
          {selectedManuscript && (
            <div>
              <div className="ms-content__metadata-sticky">
                <div className="ms-content__panel">
                  <div className="ms-content__corner--tl" />
                  <div className="ms-content__corner--br" />

                  <div className="ms-content__metadata-inner">
                    {/* Header */}
                    <h3 className="ms-content__metadata-header">
                      Manuscript Details
                    </h3>

                    {/* Current Library Badge */}
                    <div className="ms-content__metadata-library-row">
                      <span className="ms-content__metadata-library-label">Current Library:</span>
                      <span className="ms-content__metadata-library-badge">
                        {currentLibraryDetails.name}
                      </span>
                    </div>

                    {/* Metadata Fields */}
                    <div className="ms-content__metadata-fields">
                      {/* Sigla */}
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
                                <span className="ms-content__metadata-value--arabic">{currentLibraryDetails.siglaArabic}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Library */}
                      {currentLibraryDetails.library && (
                        <div className="ms-content__metadata-row">
                          <Building2 className="w-4 h-4 ms-content__metadata-icon" />
                          <div>
                            <span className="ms-content__metadata-label">Library</span>
                            <span className="ms-content__metadata-value">{currentLibraryDetails.library}</span>
                          </div>
                        </div>
                      )}

                      {/* City & Country */}
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

                      {/* Date */}
                      {currentLibraryDetails.date && (
                        <div className="ms-content__metadata-row">
                          <Calendar className="w-4 h-4 ms-content__metadata-icon" />
                          <div>
                            <span className="ms-content__metadata-label">Date (Hijri/Gregorian)</span>
                            <span className="ms-content__metadata-value">{currentLibraryDetails.date}</span>
                          </div>
                        </div>
                      )}

                      {/* Catalog Number */}
                      {currentLibraryDetails.catalogNumber && (
                        <div className="ms-content__metadata-row">
                          <FileText className="w-4 h-4 ms-content__metadata-icon" />
                          <div>
                            <span className="ms-content__metadata-label">Catalog no.</span>
                            <span className="ms-content__metadata-value">{currentLibraryDetails.catalogNumber}</span>
                          </div>
                        </div>
                      )}

                      {/* Completeness */}
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

                      {/* Scribe */}
                      {currentLibraryDetails.scribe && currentLibraryDetails.scribe !== 'n/a' && (
                        <div className="ms-content__metadata-row">
                          <User className="w-4 h-4 ms-content__metadata-icon" />
                          <div>
                            <span className="ms-content__metadata-label">Scribe</span>
                            <span className="ms-content__metadata-value">{currentLibraryDetails.scribe}</span>
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      {currentLibraryDetails.features && (
                        <div className="ms-content__metadata-row">
                          <BookOpen className="w-4 h-4 ms-content__metadata-icon" />
                          <div>
                            <span className="ms-content__metadata-label">Features</span>
                            <span className="ms-content__metadata-value">{currentLibraryDetails.features}</span>
                          </div>
                        </div>
                      )}

                      {/* Format */}
                      {currentLibraryDetails.format && (
                        <div className="ms-content__metadata-divider">
                          <span className="ms-content__metadata-label--wide">Format</span>
                          <p className="ms-content__metadata-value--sm">{currentLibraryDetails.format}</p>
                        </div>
                      )}

                      {/* Additional Info */}
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
        </div>
      </div>
    </div>
  );
};

export default ManuscriptsContent;
