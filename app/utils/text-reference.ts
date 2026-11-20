
export type TextRefType = 'oration' | 'letter' | 'saying' | 'introduction' | 'conclusion';

export interface ParsedTextRef {
  type: TextRefType;
  number: string;
  sectionNumber: string;
}

export function parseTextReference(textRef: string): ParsedTextRef | null {
  if (!textRef || typeof textRef !== 'string') {
    return null;
  }

  const trimmed = textRef.trim();
  const parts = trimmed.split('.');

  if (parts.length < 2) {
    return null;
  }

  const prefix = parts[0];
  const sectionNumber = parts.slice(1).join('.');

  let type: TextRefType;

  switch (prefix) {
    case '1':
      type = 'oration';
      break;
    case '2':
      type = 'letter';
      break;
    case '3':
      type = 'saying';
      break;
    case '0':
      type = 'introduction';
      break;
    case '4':
      type = 'conclusion';
      break;
    default:
      return null;
  }

  return {
    type,
    number: trimmed,
    sectionNumber,
  };
}

export function getTextRefRoutePath(parsed: ParsedTextRef): string {
  switch (parsed.type) {
    case 'oration':
      return `/content/details/orations/${parsed.sectionNumber}?highlightRef=${parsed.number}`;
    case 'letter':
      return `/content/details/letters/${parsed.sectionNumber}?highlightRef=${parsed.number}`;
    case 'saying':
      return `/content/details/sayings/${parsed.sectionNumber}?highlightRef=${parsed.number}`;
    case 'introduction':
      return `/radis?highlightRef=${parsed.number}`;
    case 'conclusion':
      return `/conclusions?highlightRef=${parsed.sectionNumber}`;
    default:
      return '/';
  }
}

export function getContentTypeName(type: TextRefType): string {
  switch (type) {
    case 'oration':
      return 'Orations';
    case 'letter':
      return 'Letters';
    case 'saying':
      return 'Sayings';
    case 'introduction':
      return 'Introduction';
    case 'conclusion':
      return 'Conclusion';
    default:
      return 'Unknown';
  }
}

export function getContentTypeSlug(type: TextRefType): 'Oration' | 'Letter' | 'Saying' | 'Radis' | 'Conclusion' {
  switch (type) {
    case 'oration':
      return 'Oration';
    case 'letter':
      return 'Letter';
    case 'saying':
      return 'Saying';
    case 'introduction':
      return 'Radis';
    case 'conclusion':
      return 'Conclusion';
    default:
      return 'Oration';
  }
}

export function getTextRefTypeColor(type: TextRefType): string {
  switch (type) {
    case 'oration':
      return 'text-ref-chip--oration';
    case 'letter':
      return 'text-ref-chip--letter';
    case 'saying':
      return 'text-ref-chip--saying';
    case 'introduction':
      return 'text-ref-chip--introduction';
    case 'conclusion':
      return 'text-ref-chip--conclusion';
    default:
      return 'text-ref-chip--unknown';
  }
}
