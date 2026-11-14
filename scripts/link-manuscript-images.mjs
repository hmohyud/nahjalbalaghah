#!/usr/bin/env node
/**
 * Create manuscript entries linking already-uploaded Media Library images to posts.
 *
 * Input CSV: first column "No." (section), then one column per library, matched by header
 * (see LIBRARIES below; unknown columns are reported and ignored). Cells hold comma-separated
 * image refs like "AH-images-16, AH- images-17", "pict0021, pict0-165" or "1782m-00009".
 *
 * Only creates entries for (section, library) pairs that have no entry yet.
 * Existing entries are never modified — differences are reported instead.
 *
 * Usage:
 *   node --env-file=.env.strapi scripts/link-manuscript-images.mjs scripts/manuscript-list.csv [--apply] [--only 1.8,1.9]
 *     [--library marashi|nasiri|tehran|rampur|chester|mashhad|iraq|aligarh] [--edition "<title>"] [--skip 3.339:chester]
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const csvPath = args[0];
const APPLY = args.includes('--apply');
const ONLY = opt('--only')?.split(',').map(s => s.trim());
const ONLY_LIB = opt('--library');
const SKIP = opt('--skip')?.split(',').map(s => s.trim()); // "3.339:chester" -- rows known to be wrong in the sheet
const BASE = (process.env.STRAPI_URL || 'https://cms.nahjalbalaghah.org').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_TOKEN;
// Existing manuscript entries (and the posts they link to) use this edition.
const EDITION = opt('--edition') || 'Qutbuddin (Minimal)';

if (!csvPath) { console.error('Usage: node --env-file=.env.strapi scripts/link-manuscript-images.mjs <file.csv> [--apply]'); process.exit(1); }
if (!TOKEN) { console.error('STRAPI_TOKEN not set (use --env-file=.env.strapi)'); process.exit(1); }

// header: CSV column title. library: name of the Library entry to link (optional).
// fileName may return several candidate names; exactly one must exist in the Media Library.
const LIBRARIES = [
  {
    key: 'marashi', header: "Mar'ashi", label: "Mar'ashi",
    // "AH-images275-AH-images-276", "*****-AH-images-337", "AH-images-223-****" -> every number is a page
    parse: (cell) => (cell.match(/\d+/g) || []).map(Number),
    fileName: (n) => `Qum_Mar'ashi Library 3827_469 AH-images-${String(n).padStart(3, '0')}.jpg`,
    owns: (name) => name.startsWith("Qum_Mar'ashi Library 3827"),
  },
  {
    key: 'nasiri', header: 'Nasiri', label: 'Nasiri',
    // "pict0021", "pict0-165", "pict080", "pict00105", "oict0159", "pict0-191-pict0-192"
    parse: (cell) => (cell.replace(/[a-z]+0*-?/gi, ' ').match(/\d+/g) || []).map(Number),
    fileName: (n) => `PICT${String(n).padStart(4, '0')}.JPG`,
    owns: (name) => /^PICT\d+\.JPG$/i.test(name),
  },
  {
    key: 'tehran', header: 'Tehran University', label: 'Tehran', library: 'Naṣīrī', // Tehran, Nasiri Chihil Sutun
    // "1782m-00009, 1782m-00010"; "****" = missing
    parse: (cell) => (cell.replace(/1782m-/gi, ' ').match(/\d+/g) || []).map(Number),
    fileName: (n) => `1782m-${String(n).padStart(5, '0')}.jpg`,
    owns: (name) => /^1782m-\d+\.jpg$/i.test(name),
  },
  {
    key: 'rampur', header: 'Rampur Raza', label: 'Rampur', library: 'Rampur Raza 1190',
    // "facsimile (553Ah)-page-069", "****-219"
    parse: (cell) => (cell.replace(/facsimile \(553Ah\)/gi, ' ').match(/\d+/g) || []).map(Number),
    // Later pages were uploaded with a " -by MaxAI" suffix
    fileName: (n) => [`Facsimile (553 Ah.)-${String(n).padStart(3, '0')}.jpg`, `Facsimile (553 Ah.)-${String(n).padStart(3, '0')} -by MaxAI.jpg`],
    owns: (name) => /^Facsimile \(553 Ah\.\)/i.test(name),
  },
  {
    key: 'chester', header: 'Chester Beatty', label: 'Chester', library: 'Chester Beatty 50',
    // "5451_163, 5451_162"
    strict: /^5451_\d+$/,
    parse: (cell) => (cell.match(/5451_(\d+)/g) || []).map(s => +s.slice(5)),
    fileName: (n) => `5451_${String(n).padStart(3, '0')}.jpg`,
    owns: (name) => /^5451_\d+\.jpg$/.test(name),
  },
  {
    key: 'mashhad', header: 'Astan Quds-Mashhad', label: 'Mashhad', library: 'Imam Reza Library-Mashhad 13847',
    // "00004, 00005"; a pair far apart ("00131, 00137") is a first-last range
    strict: /^\d{5}$/,
    parse: (cell) => (cell.match(/\d+/g) || []).map(Number),
    fileName: (n) => `${String(n).padStart(5, '0')}.jpg`,
    owns: (name) => /^\d{5}\.jpg$/.test(name),
    order: (n) => n,
    fromOrder: (i) => i,
  },
  {
    key: 'iraq', header: 'Iraq', label: 'Iraq', library: 'Iraqi National Museum 356',
    // "007-0014-IMG000012, 007-0014-IMG000012-2" (two sides per image; "0077-" is a typo for "007-");
    // a pair far apart ("IMG000038, IMG000042") is a first-last range
    strict: /^0077?-0014-IMG0*\d+(-2)?$/,
    parse: (cell) => [...cell.matchAll(/IMG0*(\d+)(-2)?/g)].map(m => `${+m[1]}${m[2] || ''}`),
    fileName: (k) => { const [n, side] = k.split('-'); return `IRQ-007-0014-00-IMG${n.padStart(6, '0')}${side ? '-2' : ''}.jpg`; },
    owns: (name) => /^IRQ-007-0014/.test(name),
    order: (k) => { const [n, side] = k.split('-'); return +n * 2 + (side ? 1 : 0); },
    fromOrder: (i) => `${Math.floor(i / 2)}${i % 2 ? '-2' : ''}`,
  },
  {
    key: 'aligarh', header: 'Aligarh', label: 'Aligarh', library: 'Maulana Azad, AMU 485',
    // "Nahj Aligarh MS 538H V2-067"; tolerates the sheet's typos ("Nshj", "V1 -004", "V1-0012", "538 V1-057")
    parse: (cell) => [...cell.matchAll(/V\s*([12])\s*-\s*0*(\d+)/gi)].map(m => `${m[1]}-${m[2]}`),
    fileName: (k) => { const [v, p] = k.split('-'); return `Nahj Aligarh MS 538H v${v}-${p.padStart(3, '0')}.jpg`; },
    owns: (name) => /^Nahj Aligarh MS/i.test(name),
  },
].filter(l => !ONLY_LIB || l.key === ONLY_LIB);

async function strapi(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

async function fetchAll(path) {
  const out = [];
  for (let page = 1; ; page++) {
    const r = await strapi('GET', `${path}${path.includes('?') ? '&' : '?'}pagination[page]=${page}&pagination[pageSize]=100`);
    out.push(...r.data);
    if (page >= r.meta.pagination.pageCount) return out;
  }
}

// --- CSV ---
const splitCells = (line) => {
  const out = []; let f = '', q = false;
  for (const c of line) { if (c === '"') q = !q; else if (c === ',' && !q) { out.push(f); f = ''; } else f += c; }
  out.push(f); return out.map(s => s.trim());
};
const normSection = (s) => {
  if (/^\?+$/.test(s) || s === 'مقدمه') return '0.1'; // introduction row
  if (/\.\d{5,}$/.test(s)) return String(+(+s).toFixed(3)).replace(/^(\d+\.\d*?)0*$/, '$1'); // Excel float artifacts
  return s;
};
// Excel turns 1.10 / 1.100 into "1.1", and the sheet has duplicated numbers ("1.153, 1.153, 1.154, 1.156").
// Rows are in order, so number each one as previous + 1 within its chapter, and report every change.
const renumbered = [];
const sequenceSection = (raw, prev) => {
  const [major, minor] = raw.split('.');
  if (!prev || prev.major !== major || minor === undefined) return raw;
  const expected = String(prev.minor + 1);
  if (minor === expected || +minor > +expected) return raw; // in sequence, or a genuine gap
  renumbered.push(`${raw} -> ${major}.${expected}`);
  return `${major}.${expected}`;
};

const [headerLine, ...lines] = fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
const headers = splitCells(headerLine);
for (const lib of LIBRARIES) lib.column = headers.indexOf(lib.header);
const ignoredColumns = headers.slice(1).filter(h => !LIBRARIES.some(l => l.header === h));
const activeLibraries = LIBRARIES.filter(l => l.column >= 0);

const rows = {}; // section -> { [lib.key]: [n] }
const unclear = new Map(); // `${section}|${lib}` -> cell text that couldn't be read reliably
let prev = null;
for (const line of lines) {
  const cells = splitCells(line);
  const section = sequenceSection(normSection(cells[0]), prev);
  const [major, minor] = section.split('.');
  prev = { major, minor: +minor };
  const row = rows[section] ??= {};
  for (const lib of activeLibraries) {
    const cell = cells[lib.column] || '';
    const list = row[lib.key] ??= [];
    // "****" alone means the page is missing; refs mixed with "*" or malformed refs are left for a person to check
    const parts = cell.split(',').map(s => s.trim()).filter(Boolean);
    if (lib.strict && !/^\*+$/.test(cell) && parts.some(p => !lib.strict.test(p))) { unclear.set(`${section}|${lib.key}`, cell); continue; }
    for (const n of lib.parse(cell)) if (!list.includes(n)) list.push(n);
  }
}

// --- Strapi state ---
console.log('Loading Media Library, manuscripts, posts, editions…');
const media = await strapi('GET', '/api/upload/files?fields[0]=name');
const mediaByName = new Map();
for (const f of media) (mediaByName.get(f.name) ?? mediaByName.set(f.name, []).get(f.name)).push(f);

const manuscripts = await fetchAll('/api/manuscripts?fields[0]=section&populate[files][fields][0]=name');
const existing = new Map(); // `${section}|${lib}` -> [entry]
for (const m of manuscripts) for (const lib of activeLibraries) {
  if ((m.files || []).some(f => lib.owns(f.name))) {
    const k = `${String(m.section).trim()}|${lib.key}`;
    (existing.get(k) ?? existing.set(k, []).get(k)).push(m);
  }
}

const editions = (await strapi('GET', '/api/editions')).data;
const edition = editions.find(e => e.title === EDITION);
if (!edition) throw new Error(`Edition "${EDITION}" not found`);

const libraryEntries = await fetchAll('/api/libraries?fields[0]=name');
for (const lib of activeLibraries.filter(l => l.library)) {
  lib.libraryEntry = libraryEntries.find(e => e.name === lib.library);
  if (!lib.libraryEntry) throw new Error(`Library "${lib.library}" not found. Available: ${libraryEntries.map(e => e.name).join(', ')}`);
}

const posts = await fetchAll('/api/posts?fields[0]=sermonNumber&populate[editions][fields][0]=title');
const postBySection = new Map();
for (const p of posts) {
  const s = String(p.sermonNumber ?? '').trim();
  if (!s) continue;
  const eds = Array.isArray(p.editions) ? p.editions : p.editions ? [p.editions] : [];
  const isQutbuddin = eds.some(e => e.title === EDITION);
  const cur = postBySection.get(s);
  if (!cur || (isQutbuddin && !cur.isQutbuddin)) postBySection.set(s, { documentId: p.documentId, isQutbuddin });
}
console.log(`  ${media.length} files, ${manuscripts.length} manuscript entries, ${posts.length} posts`);

// --- Plan ---
const plan = [], skipped = [], problems = [], incomplete = [];
for (const [section, row] of Object.entries(rows)) {
  if (ONLY && !ONLY.includes(section)) continue;
  for (const lib of activeLibraries) {
    let nums = row[lib.key] || [];
    const key = `${section}|${lib.key}`;
    if (existing.has(key)) { skipped.push(`${section} ${lib.label}`); continue; }
    if (SKIP?.includes(`${section}:${lib.key}`)) { problems.push(`${section} ${lib.label}: skipped by --skip`); continue; }
    if (unclear.has(key)) { problems.push(`${section} ${lib.label}: unclear cell "${unclear.get(key)}" (not created)`); continue; }
    if (!nums.length) continue;
    // Two refs more than one page apart are the first and last page of a range
    if (lib.order && nums.length === 2) {
      const [a, b] = nums.map(lib.order);
      if (b < a) { problems.push(`${section} ${lib.label}: pages out of order [${nums.join(', ')}] (not created)`); continue; }
      if (b - a > 1) {
        nums = Array.from({ length: b - a + 1 }, (_, i) => lib.fromOrder(a + i))
          .filter((k, i, all) => i === 0 || i === all.length - 1 || mediaByName.has(lib.fileName(k)));
      }
    }
    const fileIds = [];
    for (const n of nums) {
      const names = [lib.fileName(n)].flat();
      const hits = names.flatMap(name => mediaByName.get(name) || []);
      if (hits.length !== 1) { problems.push(`${section} ${lib.label}: ${names.join(' / ')} found ${hits.length}x`); continue; }
      fileIds.push(hits[0].id);
    }
    if (!fileIds.length) continue;
    // A partial entry would block a later run from adding the missing pages, so leave it out.
    if (fileIds.length < nums.length) { incomplete.push(`${section} ${lib.label}`); continue; }
    const post = postBySection.get(section);
    if (!post) problems.push(`${section} ${lib.label}: no post with sermonNumber ${section} (entry created without post link)`);
    plan.push({ section, lib, nums, fileIds, post });
  }
}

for (const p of plan) console.log(`CREATE ${p.section.padEnd(6)} ${p.lib.label.padEnd(9)} pages [${p.nums.join(' ')}]${p.post ? '' : '  (no post)'}`);
console.log(`\n${plan.length} to create (${activeLibraries.map(l => `${l.label}: ${plan.filter(p => p.lib === l).length}`).join(', ')}), ${skipped.length} skipped (entry already exists)`);
console.log(`Edition: ${edition.title} (#${edition.id})`);
if (incomplete.length) console.log(`Not created, some pages missing from the Media Library (${incomplete.length}): ${incomplete.join(', ')}`);
if (ignoredColumns.length) console.log(`Columns not loaded (no library config): ${ignoredColumns.join(', ')}`);
if (renumbered.length) console.log(`\nSection numbers corrected from row order (${renumbered.length}):\n  ` + renumbered.join('\n  '));
if (problems.length) console.log(`\nWarnings (${problems.length}):\n  ` + problems.join('\n  '));

if (!APPLY) { console.log('\nDRY RUN — pass --apply to write.'); process.exit(0); }

// --- Apply ---
let ok = 0; const failed = []; const created = [];
const queue = [...plan];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let p; (p = queue.shift());) {
    try {
      const r = await strapi('POST', '/api/manuscripts?status=published', {
        data: {
          section: p.section,
          files: p.fileIds,
          editions: [edition.documentId],
          ...(p.post && { post: p.post.documentId }),
          ...(p.lib.libraryEntry && { library: p.lib.libraryEntry.documentId }),
        },
      });
      created.push({ section: p.section, library: p.lib.label, documentId: r.data.documentId });
      if (++ok % 50 === 0) console.log(`  …${ok}/${plan.length}`);
    } catch (e) { failed.push(`${p.section} ${p.lib.label}: ${e.message}`); }
  }
}));
const logPath = `scripts/manuscript-import-log-${Date.now()}.json`;
fs.writeFileSync(logPath, JSON.stringify(created, null, 2));
console.log(`\nCreated ${ok}/${plan.length}. Log of created entries: ${logPath}`);
if (failed.length) console.log(`Failed (${failed.length}):\n  ` + failed.join('\n  '));
