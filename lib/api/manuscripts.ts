import api from './api';
import { STATIC_MANUSCRIPTS } from '@/data/static-manuscripts';

export interface ManuscriptFile {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

// Library Item interface (individual manuscript details)
export interface LibraryItem {
  id: number;
  documentId: string;
  Sigla: string;
  libraryRef: string;
  City: string;
  Country: string;
  Date: string;
  catalogNumber: string;
  Completeness: string;
  Scribe: string;
  dimensions: string | null;
  originCity: string | null;
  Features: string;
  PermanentLink: string | null;
  Sequence: string;
  Format: string;
  AdditionalInfo: string | null;
  MoreInformation: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Library interface (collection/group of manuscripts)
export interface Library {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  library_items: LibraryItem[];
  manuscript: any | null;
}

export interface LibrariesApiResponse {
  data: Library[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Manuscript {
  id: number;
  documentId: string;
  section: string;
  library?: string | Library | Library[];
  libraries?: Library[];
  title?: string;
  description?: string;
  bookName?: string;
  siglaArabic?: string;
  siglaEnglish?: string;
  hijriYear?: string;
  gregorianYear?: string;
  holdingInstitution?: string;
  country?: string;
  city?: string;
  catalogNumber?: string;
  specialMerit?: string;
  rights?: string;
  binding?: string;
  acknowledgments?: string;
  accessRestriction?: string;
  repository?: string;
  partLocation?: string;
  cityOfOrigin?: string;
  countryOfOrigin?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  files: ManuscriptFile[];
}

export interface ManuscriptsApiResponse {
  data: Manuscript[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface TOCData {
  heading: string;
  TocEnglish: string;
  TocArabic: string;
}

export const manuscriptsApi = {
  /**
   * Get all manuscripts with populated files
   */
  async getAllManuscripts(page = 1, pageSize = 25): Promise<ManuscriptsApiResponse> {
    try {
      const response = await api.get('/api/manuscripts', {
        params: {
          'populate': '*',
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching manuscripts:', error);
      throw error;
    }
  },

  /**
   * Get manuscripts for a specific section
   * @param sectionNumber - The section number (e.g., "1.5", "1.1", "2.3")
   */
  async getManuscriptsBySection(sectionNumber: string, page = 1, pageSize = 25): Promise<ManuscriptsApiResponse> {
    try {
      const response = await api.get('/api/manuscripts', {
        params: {
          'filters[section][$eq]': sectionNumber,
          'populate': '*',
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching manuscripts for section ${sectionNumber}:`, error);
      throw error;
    }
  },

  /**
   * Get a single manuscript by ID
   */
  async getManuscriptById(id: string): Promise<Manuscript | null> {
    try {
      const response = await api.get(`/api/manuscripts/${id}`, {
        params: {
          'populate': '*',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching manuscript ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get manuscripts filtered by type (Oration, Letter, Saying)
   * Based on section prefix: 1.x = Oration, 2.x = Letter, 3.x = Saying
   */
  async getManuscriptsByType(type: 'oration' | 'letter' | 'saying', page = 1, pageSize = 25): Promise<ManuscriptsApiResponse> {
    try {
      let sectionPrefix = '';
      switch (type) {
        case 'oration':
          sectionPrefix = '1';
          break;
        case 'letter':
          sectionPrefix = '2';
          break;
        case 'saying':
          sectionPrefix = '3';
          break;
      }

      const response = await api.get('/api/manuscripts', {
        params: {
          'filters[section][$startsWith]': sectionPrefix,
          'populate': '*',
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching manuscripts for type ${type}:`, error);
      throw error;
    }
  },
};

/**
 * Normalize manuscript/library labels so catalog diacritics and filename
 * spellings (for example Naṣīrī/Nasiri) compare consistently.
 */
export function normalizeManuscriptIdentity(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function manuscriptMatchesLibrary(manuscript: Manuscript, library: Library): boolean {
  const linkedFromLibrary = Array.isArray(library.manuscript)
    ? library.manuscript
    : library.manuscript
      ? [library.manuscript]
      : [];

  if (linkedFromLibrary.some((linked: any) =>
    (linked?.id && linked.id === manuscript.id) ||
    (linked?.documentId && linked.documentId === manuscript.documentId)
  )) {
    return true;
  }

  const manuscriptLibraries = [
    ...((Array.isArray(manuscript.library) ? manuscript.library : manuscript.library ? [manuscript.library] : []) as any[]),
    ...((manuscript.libraries || []) as any[]),
  ];
  const normalizedLibraryName = normalizeManuscriptIdentity(library.name);

  if (manuscriptLibraries.some((linked: any) => {
    if (typeof linked === 'string') {
      return normalizeManuscriptIdentity(linked) === normalizedLibraryName;
    }
    return (
      (linked?.id && linked.id === library.id) ||
      (linked?.documentId && linked.documentId === library.documentId) ||
      (linked?.name && normalizeManuscriptIdentity(linked.name) === normalizedLibraryName)
    );
  })) {
    return true;
  }

  const searchableManuscriptText = normalizeManuscriptIdentity([
    manuscript.title,
    manuscript.description,
    manuscript.bookName,
    manuscript.siglaEnglish,
    typeof manuscript.library === 'string' ? manuscript.library : '',
    ...(manuscript.files || []).map(file => file.name),
  ].filter(Boolean).join(' '));

  const compactLibraryName = normalizedLibraryName.replace(/\s+/g, '');
  const compactManuscriptText = searchableManuscriptText.replace(/\s+/g, '');
  const aliases = new Set<string>([normalizedLibraryName, compactLibraryName]);

  // Include useful catalog metadata because uploaded page filenames often use
  // a siglum or shelfmark rather than the library's complete display name.
  for (const item of library.library_items || []) {
    for (const value of [item.Sigla, item.libraryRef, item.catalogNumber]) {
      const normalized = normalizeManuscriptIdentity(value || '');
      if (normalized.length > 2) {
        aliases.add(normalized);
        aliases.add(normalized.replace(/\s+/g, ''));
      }
    }
  }

  const genericWords = new Set([
    'library', 'manuscript', 'manuscripts', 'collection', 'archive',
    'national', 'university', 'institute', 'institution', 'museum', 'the',
  ]);
  for (const token of normalizedLibraryName.split(' ')) {
    if (token.length > 3 && !genericWords.has(token)) aliases.add(token);
  }

  if (compactLibraryName.includes('nasiri')) aliases.add('nasiri');
  if (compactLibraryName.includes('shahrastani') || compactLibraryName.includes('shahristani')) {
    aliases.add('shahrastani');
    aliases.add('shahristani');
  }
  if (compactLibraryName.includes('marashi')) {
    aliases.add('marashi');
    aliases.add('qum mar');
    aliases.add('qummar');
  }

  return Array.from(aliases).some(alias => {
    if (alias.length <= 3) return false;
    return searchableManuscriptText.includes(alias) || compactManuscriptText.includes(alias.replace(/\s+/g, ''));
  });
}

/**
 * Helper function to determine the content type based on section number
 */
export function getContentTypeFromSection(section: string): 'oration' | 'letter' | 'saying' | null {
  if (section.startsWith('1')) return 'oration';
  if (section.startsWith('2')) return 'letter';
  if (section.startsWith('3')) return 'saying';
  return null;
}

/**
 * Helper function to format manuscript image URL
 */
export function getManuscriptImageUrl(url: string, baseUrl = 'https://cms.nahjalbalaghah.org'): string {
  if (url.startsWith('http')) {
    return url;
  }
  return `${baseUrl}${url}`;
}

/**
 * Libraries API - for fetching manuscript collection names and details
 */
export const librariesApi = {
  /**
   * Get all libraries (manuscript names) with populated items
   */
  async getAllLibraries(page = 1, pageSize = 25): Promise<LibrariesApiResponse> {
    try {
      const response = await api.get('/api/libraries', {
        params: {
          'populate': '*',
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching libraries:', error);
      throw error;
    }
  },

  /**
   * Get a specific library by name
   * @param name - The library name (e.g., "Mar'ashi MS 3827")
   */
  async getLibraryByName(name: string): Promise<LibrariesApiResponse> {
    try {
      const response = await api.get('/api/libraries', {
        params: {
          'filters[name][$eq]': name,
          'populate': '*',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching library by name ${name}:`, error);
      throw error;
    }
  },

  /**
   * Get a specific library by ID
   */
  async getLibraryById(id: string): Promise<Library | null> {
    try {
      const response = await api.get(`/api/libraries/${id}`, {
        params: {
          'populate': '*',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching library ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search libraries by partial name match
   * @param searchTerm - Search term to match against library names
   */
  async searchLibraries(searchTerm: string, page = 1, pageSize = 25): Promise<LibrariesApiResponse> {
    try {
      const response = await api.get('/api/libraries', {
        params: {
          'filters[name][$containsi]': searchTerm,
          'populate': '*',
          'pagination[page]': page,
          'pagination[pageSize]': pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching libraries for "${searchTerm}":`, error);
      throw error;
    }
  },
};

/**
 * Helper function to convert LibraryItem to a format compatible with existing components
 */
export function convertLibraryItemToManuscriptDetails(library: Library, item?: LibraryItem) {
  const libraryItem = item || library.library_items[0];
  
  if (!libraryItem) {
    return {
      id: library.documentId,
      name: library.name,
      siglaEnglish: '',
      siglaArabic: '',
      library: '',
      city: '',
      country: '',
      date: '',
      catalogNumber: '',
      completeness: '',
      scribe: '',
      dimensions: '',
      originCity: '',
      features: '',
      permanentLink: '',
      orationSequence: '',
      format: '',
      additionalInfo: '',
    };
  }

  // Extract sigla - format is "M/م" -> siglaEnglish: "M", siglaArabic: "م"
  const siglaParts = libraryItem.Sigla?.split('/') || ['', ''];
  
  return {
    id: library.documentId,
    name: library.name,
    siglaEnglish: siglaParts[0]?.trim() || '',
    siglaArabic: siglaParts[1]?.trim() || '',
    library: libraryItem.libraryRef || '',
    city: libraryItem.City || '',
    country: libraryItem.Country || '',
    date: libraryItem.Date || '',
    catalogNumber: libraryItem.catalogNumber || '',
    completeness: libraryItem.Completeness || '',
    scribe: libraryItem.Scribe || '',
    dimensions: libraryItem.dimensions || '',
    originCity: libraryItem.originCity || '',
    features: libraryItem.Features || '',
    permanentLink: libraryItem.PermanentLink || '',
    orationSequence: libraryItem.Sequence || '',
    format: libraryItem.Format || '',
    additionalInfo: libraryItem.AdditionalInfo || '',
  };
}

// ---------------------------------------------------------------------------
// Manuscript workspace: light, per-section queries
//
// The viewer used to download every manuscript record (~6,000 records, ~23 MB)
// to show one section. These helpers fetch only what a view needs: the small
// library catalogue, the page records of one section, and a section index.
// ---------------------------------------------------------------------------

/** One page scan, with the smaller renditions Strapi generated for it. */
export interface ManuscriptPageImage {
  id: number;
  name: string;
  /** ~245px wide: filmstrips and cards */
  thumb: string;
  /** ~500px wide: larger previews */
  preview: string;
  /** ~1000px wide: the normal fit-to-pane view */
  display: string;
  /** Original scan: loaded only when zooming in past the display rendition */
  full: string;
  width?: number;
  height?: number;
}

export function toPageImage(file: ManuscriptFile): ManuscriptPageImage {
  const formats = file.formats || {};
  const pick = (...keys: string[]) => keys.map(key => formats[key]?.url).find(Boolean) as string | undefined;
  return {
    id: file.id,
    name: file.name,
    thumb: getManuscriptImageUrl(pick('thumbnail', 'small', 'medium', 'large') || file.url),
    preview: getManuscriptImageUrl(pick('small', 'medium', 'large') || file.url),
    display: getManuscriptImageUrl(pick('large', 'medium') || file.url),
    full: getManuscriptImageUrl(file.url),
    width: file.width,
    height: file.height,
  };
}

/** A physical manuscript ("library" in the CMS) with whatever catalogue details exist. */
export interface ManuscriptCatalogEntry {
  /** Library documentId */
  id: string;
  name: string;
  siglaEnglish: string;
  siglaArabic: string;
  date: string;
  city: string;
  country: string;
  holdingLibrary: string;
  /** Hijri year parsed from the date, for chronological ordering */
  year: number | null;
  /** Longer catalogue fields (empty strings where not recorded) */
  details: {
    catalogNumber: string;
    scribe: string;
    completeness: string;
    features: string;
    format: string;
    additionalInfo: string;
    dimensions: string;
    originCity: string;
  };
  library: Library;
}

function staticDetailsFor(name: string) {
  const compact = normalizeManuscriptIdentity(name).replace(/\s+/g, '');
  if (compact.includes('marashi')) return STATIC_MANUSCRIPTS.marashi;
  if (compact.includes('shahrastan') || compact.includes('shahristan')) return STATIC_MANUSCRIPTS.shahrastani;
  return null;
}

function toCatalogEntry(library: Library): ManuscriptCatalogEntry {
  const cms = convertLibraryItemToManuscriptDetails(library);
  const fallback = staticDetailsFor(library.name);
  const value = (cmsValue: string, fallbackValue?: string) =>
    cmsValue && cmsValue !== 'n/a' ? cmsValue : fallbackValue && fallbackValue !== 'n/a' ? fallbackValue : '';
  const date = value(cms.date, fallback?.date);
  const yearMatch = date.match(/(\d{3,4})\s*AH/i);
  return {
    id: library.documentId,
    name: library.name,
    siglaEnglish: value(cms.siglaEnglish, fallback?.siglaEnglish),
    siglaArabic: value(cms.siglaArabic, fallback?.siglaArabic),
    date,
    city: value(cms.city, fallback?.city),
    country: value(cms.country, fallback?.country),
    holdingLibrary: value(cms.library, fallback?.library),
    year: yearMatch ? parseInt(yearMatch[1], 10) : null,
    details: {
      catalogNumber: value(cms.catalogNumber, fallback?.catalogNumber),
      scribe: value(cms.scribe, fallback?.scribe),
      completeness: value(cms.completeness, fallback?.completeness),
      features: value(cms.features, fallback?.features),
      format: value(cms.format, fallback?.format),
      additionalInfo: value(cms.additionalInfo, fallback?.additionalInfo),
      dimensions: value(cms.dimensions, fallback?.dimensions),
      originCity: value(cms.originCity, fallback?.originCity),
    },
    library,
  };
}

/** Dated manuscripts first (oldest first), then the rest alphabetically. */
export function compareCatalogEntries(a: ManuscriptCatalogEntry, b: ManuscriptCatalogEntry) {
  if (a.year !== null && b.year !== null) return a.year - b.year;
  if (a.year !== null) return -1;
  if (b.year !== null) return 1;
  return a.name.localeCompare(b.name);
}

export const manuscriptCatalogApi = {
  /** All manuscripts with their catalogue items (~5 KB, unlike populate=* at ~1 MB). */
  async getCatalog(): Promise<ManuscriptCatalogEntry[]> {
    const response = await api.get('/api/libraries', {
      params: {
        'populate[library_items]': true,
        'pagination[pageSize]': 100,
      },
    });
    const libraries: Library[] = response.data?.data || [];
    return libraries.map(toCatalogEntry).sort(compareCatalogEntries);
  },

  /** Page records of one section (one record per manuscript, sometimes with duplicates). */
  async getSectionRecords(section: string): Promise<Manuscript[]> {
    const response = await api.get('/api/manuscripts', {
      params: {
        'filters[section][$eq]': section,
        'populate[0]': 'files',
        'populate[1]': 'library',
        'pagination[pageSize]': 100,
      },
    });
    return response.data?.data || [];
  },

  /** Any one page record of a manuscript, for cover thumbnails. */
  async getSampleRecord(libraryDocumentId: string): Promise<Manuscript | null> {
    const response = await api.get('/api/manuscripts', {
      params: {
        'filters[library][documentId][$eq]': libraryDocumentId,
        'populate[0]': 'files',
        'pagination[pageSize]': 1,
        'sort[0]': 'id:asc',
      },
    });
    return response.data?.data?.[0] || null;
  },
};

/** The pages one manuscript holds for a section. */
export interface SectionManuscript {
  entry: ManuscriptCatalogEntry;
  pages: ManuscriptPageImage[];
}

/**
 * Groups a section's page records by manuscript. Records not linked to a library are
 * matched by their file names. Where a manuscript has duplicate records for a section,
 * the one with the most pages wins (the extras are stray uploads).
 */
export function groupSectionRecords(records: Manuscript[], catalog: ManuscriptCatalogEntry[]): SectionManuscript[] {
  const best = new Map<string, Manuscript>();
  for (const record of records) {
    if (!record.files?.length) continue;
    const entry = catalog.find(candidate => manuscriptMatchesLibrary(record, candidate.library));
    if (!entry) continue;
    const current = best.get(entry.id);
    if (!current || record.files.length > current.files.length) best.set(entry.id, record);
  }
  return catalog
    .filter(entry => best.has(entry.id))
    .map(entry => ({ entry, pages: best.get(entry.id)!.files.map(toPageImage) }));
}

// ---- Section index (numbers and headings for the section picker) ----

export type ManuscriptSectionType = 'introduction' | 'oration' | 'letter' | 'saying';

export interface SectionIndexEntry {
  /** e.g. "1.12" */
  section: string;
  /** e.g. "12" */
  number: string;
  heading: string;
}

export const SECTION_TYPE_PREFIX: Record<ManuscriptSectionType, string> = {
  introduction: '0',
  oration: '1',
  letter: '2',
  saying: '3',
};

export function sectionTypeOf(section: string): ManuscriptSectionType {
  const prefix = section.trim().split('.')[0];
  if (prefix === '0') return 'introduction';
  if (prefix === '2') return 'letter';
  if (prefix === '3') return 'saying';
  return 'oration';
}

const sectionSortKey = (section: string) => section.trim().split('.').map(part => parseInt(part, 10) || 0);

export function compareSections(a: string, b: string) {
  const [a1, a2 = 0] = sectionSortKey(a);
  const [b1, b2 = 0] = sectionSortKey(b);
  return a1 - b1 || a2 - b2;
}

const POST_TYPE: Record<Exclude<ManuscriptSectionType, 'introduction'>, string> = {
  oration: 'Oration',
  letter: 'Letter',
  saying: 'Saying',
};

export const sectionIndexApi = {
  /** Every section of a type with its heading, from the Qutbuddin edition (~30 KB per 100). */
  async getSections(type: ManuscriptSectionType): Promise<SectionIndexEntry[]> {
    if (type === 'introduction') {
      return [{ section: '0.1', number: '1', heading: 'Raḍī’s Introduction' }];
    }

    const fetchPage = (page: number) =>
      api.get('/api/post-bases', {
        params: {
          'filters[posts][type][$eq]': POST_TYPE[type],
          'filters[posts][editions][title][$eqi]': 'Qutbuddin',
          'fields[0]': 'heading',
          'fields[1]': 'TocEnglish',
          'populate[posts][fields][0]': 'sermonNumber',
          'populate[posts][filters][editions][title][$eqi]': 'Qutbuddin',
          'pagination[pageSize]': 100,
          'pagination[page]': page,
        },
      });

    const first = await fetchPage(1);
    const pageCount = first.data?.meta?.pagination?.pageCount || 1;
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => fetchPage(i + 2))
    );

    const bySection = new Map<string, SectionIndexEntry>();
    for (const response of [first, ...rest]) {
      for (const base of response.data?.data || []) {
        for (const post of base.posts || []) {
          const section = (post.sermonNumber || '').trim();
          if (!section || bySection.has(section)) continue;
          bySection.set(section, {
            section,
            number: section.split('.')[1] || section,
            heading: base.heading || base.TocEnglish || '',
          });
        }
      }
    }
    return Array.from(bySection.values()).sort((a, b) => compareSections(a.section, b.section));
  },
};
