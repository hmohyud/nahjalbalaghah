// Parses an edition CSV (Section,Number,Arabic) where Section 8/9/10 = Oration/Letter/Saying,
// stored as sermonNumber 1.N / 2.N / 3.N (the edition keeps its own numbering).
// Excel saved the top-level numbers as decimals, so "8.10" arrives as "8.1", "8.100" as "8.1", etc.
// Rows are in order, so each top-level number is resolved to the smallest value greater than the
// previous one whose decimal form matches; "N.M.P" paragraph rows are kept as text and are exact.
import fs from 'node:fs';

export const TYPES = { 8: 'Oration', 9: 'Letter', 10: 'Saying' };
const NEW_PREFIX = { 8: 1, 9: 2, 10: 3 };

function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// "8.1" could be 8.1, 8.10, 8.100 … pick the smallest > prev whose decimal string equals it
function resolve(raw, prev) {
  const frac = raw.split('.')[1].replace(/0+$/, '');
  for (let n = prev + 1; n < prev + 2000; n++) {
    if (String(n).replace(/0+$/, '') === frac) return n;
  }
  return null;
}

export function readAttarCsv(file) {
  const rows = parseCsv(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
  const posts = new Map(); const notes = [];
  const last = { 8: 0, 9: 0, 10: 0 };
  // The unnumbered "gharib" section (rows "10_1"…, introduced by a "Subsection" row) follows a saying;
  // it is stored as paragraphs N.1, N.2 … of that saying, with the intro text prefixed to the first one.
  let gharibIntro = null, gharibFor = null;
  for (const r of rows.slice(1)) {
    const sectionCell = (r[0] || '').trim();
    const num = (r[1] || '').trim(); const ar = (r[2] || '').trim();
    if (/^subsection$/i.test(sectionCell)) { gharibIntro = ar; gharibFor = `3.${last[10]}`; continue; }
    if (/^end of subsection$/i.test(sectionCell)) { gharibFor = null; continue; }
    const g = num.match(/^10_(\d+)$/);
    if (g) {
      const post = gharibFor && posts.get(gharibFor);
      if (!post || !ar) { notes.push(`skipped gharib row ${num}`); continue; }
      const text = +g[1] === 1 && gharibIntro ? `${gharibIntro}\n${ar}` : ar;
      post.paragraphs.push({ number: `${gharibFor}.${g[1]}`, ar: text });
      continue;
    }
    const m = num.match(/^(8|9|10)\.(\d+)(?:\.(\d+))?$/);
    if (!m) { if (num || ar) notes.push(`skipped row "${sectionCell.slice(0, 20)}" / "${num}"`); continue; }
    const sec = +m[1];
    let n, para = null;
    if (m[3] !== undefined) {
      n = +m[2]; para = +m[3];
      if (n < last[sec]) { notes.push(`paragraph ${num} is out of order, skipped`); continue; }
    } else {
      n = resolve(num, last[sec]);
      if (n == null) { notes.push(`cannot resolve ${num}`); continue; }
    }
    last[sec] = n;
    const key = `${NEW_PREFIX[sec]}.${n}`;
    if (!ar) { notes.push(`${key}${para ? '.' + para : ''}: empty Arabic, skipped`); continue; }
    const post = posts.get(key) ?? posts.set(key, { key, type: TYPES[sec], title: null, paragraphs: [] }).get(key);
    if (para == null) {
      if (post.title) notes.push(`${key}: second title row (${num}) — appended`);
      post.title = post.title ? `${post.title}\n${ar}` : ar;
    } else post.paragraphs.push({ number: `${key}.${para}`, ar });
  }
  return { posts, notes };
}
