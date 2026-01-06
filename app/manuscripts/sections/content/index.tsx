'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Select from '@/app/components/select';
import ManuscriptViewer from '@/app/components/manuscript-viewer';
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
      <div className="bg-[var(--color-parchment)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
            <p className="text-[var(--color-warm-gray)] font-body">Loading manuscripts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-parchment)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Scroll className="w-16 h-16 text-[var(--color-stone)] mx-auto mb-4" />
            <p className="text-red-600 font-body mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const manuscriptPages = selectedManuscript?.files?.map(file => getManuscriptImageUrl(file.url)) || [];
  const contentTypeLabel = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);

  return (
    <div className="bg-[var(--color-parchment)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Filter Bar */}
        <div className="mb-8">
          <div className="relative bg-white border border-[var(--color-stone)]">
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body mb-2">Manuscript</label>
                  <Select options={libraryOptions} value={selectedLibrary?.documentId || ''} onChange={handleLibraryChange} placeholder="Select Manuscript..." className="w-full" />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body mb-2">Type</label>
                  <Select options={typeOptions} value={selectedType} onChange={handleTypeChange} placeholder="Select Type..." className="w-full" />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase text-[var(--color-warm-gray)] font-body mb-2">Number</label>
                  <Select options={numberOptions} value={selectedNumber} onChange={handleNumberChange} placeholder="Select Number..." className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title Bar - FIXED: All text is now white for proper contrast */}
        <div className="mb-8">
          <div className="relative bg-[var(--color-primary)] p-6 lg:p-8">
            {/* Corner accents in gold */}
            <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-[var(--color-accent)]" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-[var(--color-accent)]" />
            
            {/* Main title - white text */}
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-white">
              {selectedManuscript 
                ? `${currentLibraryDetails.name} - ${contentTypeLabel} ${selectedNumber}` 
                : `${currentLibraryDetails.name} - ${contentTypeLabel}`}
            </h2>
            
            {/* Date and Location - white text with gold icons */}
            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
              {(selectedManuscript?.gregorianYear || currentLibraryDetails.date) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                  <span className="text-white/60 font-body">Date:</span>
                  <span className="text-white font-body">{selectedManuscript?.gregorianYear || currentLibraryDetails.date}</span>
                </div>
              )}
              {(selectedManuscript?.city || currentLibraryDetails.city) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-accent)]" />
                  <span className="text-white/60 font-body">Location:</span>
                  <span className="text-white font-body">
                    {selectedManuscript?.city || currentLibraryDetails.city}
                    {(selectedManuscript?.country || currentLibraryDetails.country) && `, ${selectedManuscript?.country || currentLibraryDetails.country}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`grid grid-cols-1 ${selectedManuscript ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
          {/* Viewer */}
          <div className={`${selectedManuscript ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
            {availableSections.length === 0 ? (
              <div className="relative bg-white border border-[var(--color-stone)] p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
                <Scroll className="w-16 h-16 text-[var(--color-stone)] mx-auto mb-4" />
                <h3 className="font-display text-xl text-[var(--color-ink)] mb-2">No {contentTypeLabel} Available</h3>
                <p className="text-[var(--color-warm-gray)] font-body max-w-md">
                  Manuscript images for <span className="font-medium text-[var(--color-charcoal)]">{selectedLibrary?.name || 'this library'}</span> are currently being digitized and will be available soon.
                </p>
              </div>
            ) : selectedManuscript && manuscriptPages.length > 0 ? (
              <ManuscriptViewer pages={manuscriptPages} bookName={selectedManuscript.bookName || ''} />
            ) : (
              <div className="relative bg-white border border-[var(--color-stone)] p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
                <p className="text-[var(--color-warm-gray)] font-body">No manuscript available for this selection.</p>
              </div>
            )}
          </div>

          {/* Metadata Panel */}
          {selectedManuscript && (
            <div className="lg:col-span-1">
              <div className="sticky top-36">
                <div className="relative bg-white border border-[var(--color-stone)]">
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[var(--color-accent)]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[var(--color-accent)]" />
                  
                  <div className="p-6">
                    {/* Header */}
                    <h3 className="font-display text-xl text-[var(--color-ink)] mb-4 pb-4 border-b border-[var(--color-stone)]">
                      Manuscript Details
                    </h3>
                    
                    {/* Current Library Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body">Current Library:</span>
                      <span className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-xs font-body">
                        {currentLibraryDetails.name}
                      </span>
                    </div>
                    
                    {/* Metadata Fields */}
                    <div className="space-y-5">
                      {/* Sigla */}
                      {(currentLibraryDetails.siglaEnglish || currentLibraryDetails.siglaArabic) && (
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-1">Sigla</span>
                            <div className="flex items-center gap-3">
                              {currentLibraryDetails.siglaEnglish && (
                                <span className="text-[var(--color-ink)] font-body font-medium">{currentLibraryDetails.siglaEnglish}</span>
                              )}
                              {currentLibraryDetails.siglaArabic && (
                                <span className="font-taha text-[var(--color-ink)] text-lg" dir="rtl">{currentLibraryDetails.siglaArabic}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Library */}
                      {currentLibraryDetails.library && (
                        <div className="flex items-start gap-3">
                          <Building2 className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-1">Library</span>
                            <span className="text-[var(--color-charcoal)] font-body">{currentLibraryDetails.library}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* City & Country */}
                      {(currentLibraryDetails.city || currentLibraryDetails.country) && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-1">Location</span>
                            <span className="text-[var(--color-charcoal)] font-body">
                              {currentLibraryDetails.city}{currentLibraryDetails.city && currentLibraryDetails.country && ', '}{currentLibraryDetails.country}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Date */}
                      {currentLibraryDetails.date && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-1">Date (Hijri/Gregorian)</span>
                            <span className="text-[var(--color-charcoal)] font-body">{currentLibraryDetails.date}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Catalog Number */}
                      {currentLibraryDetails.catalogNumber && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-1">Catalog no.</span>
                            <span className="text-[var(--color-charcoal)] font-body">{currentLibraryDetails.catalogNumber}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Completeness */}
                      {currentLibraryDetails.completeness && (
                        <div className="pt-4 border-t border-[var(--color-stone)]">
                          <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-2">Completeness</span>
                              <p className="text-[var(--color-charcoal)] font-body text-sm leading-relaxed">{currentLibraryDetails.completeness}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Scribe */}
                      {currentLibraryDetails.scribe && currentLibraryDetails.scribe !== 'n/a' && (
                        <div className="flex items-start gap-3">
                          <User className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-1">Scribe</span>
                            <span className="text-[var(--color-charcoal)] font-body">{currentLibraryDetails.scribe}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Features */}
                      {currentLibraryDetails.features && (
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-1">Features</span>
                            <span className="text-[var(--color-charcoal)] font-body">{currentLibraryDetails.features}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Format */}
                      {currentLibraryDetails.format && (
                        <div className="pt-4 border-t border-[var(--color-stone)]">
                          <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-2">Format</span>
                          <p className="text-[var(--color-charcoal)] font-body text-sm leading-relaxed">{currentLibraryDetails.format}</p>
                        </div>
                      )}
                      
                      {/* Additional Info */}
                      {currentLibraryDetails.additionalInfo && (
                        <div className="pt-4 border-t border-[var(--color-stone)]">
                          <span className="text-xs tracking-[0.05em] uppercase text-[var(--color-warm-gray)] font-body block mb-2">Additional Information</span>
                          <div className="bg-[var(--color-cream)] p-4 border-l-2 border-[var(--color-accent)]">
                            <p className="text-[var(--color-charcoal)] font-body text-sm leading-relaxed italic">
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
