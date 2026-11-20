#!/usr/bin/env node
/**
 * Load the Attar edition from a CSV (Section 8/9/10 = Oration/Letter/Saying) as standalone posts:
 * every post gets its own new post-base (Attar's numbering does not match the other editions).
 *
 * Usage:
 *   node --env-file=.env.strapi scripts/edition-import/load-attar.mjs attar.csv [--edition Attar] [--only 1.1,3.249] [--delete-old <postDocId,...>] [--apply]
 *
 * Posts already present for the edition (same sermonNumber) are skipped, so re-running is safe.
 */
import fs from 'node:fs';
import { readAttarCsv } from './read-attar-csv.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const csv = args[0];
const EDITION = opt('--edition') || 'Attar';
const ONLY = opt('--only')?.split(',');
const DELETE_OLD = opt('--delete-old')?.split(',') ?? [];
const APPLY = args.includes('--apply');
const BASE = (process.env.STRAPI_URL || 'https://cms.nahjalbalaghah.org').replace(/\/$/, '');
const TOKEN = process.env.STRAPI_TOKEN;
if (!csv || !TOKEN) {
  console.error('Usage: load-attar.mjs <file.csv> [--edition Attar] [--only ..] [--delete-old ids] [--apply]  (STRAPI_TOKEN required)');
  process.exit(1);
}

async function strapi(method, p, body) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${BASE}${p}`, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (res.ok) return text ? JSON.parse(text) : null;
    if (res.status >= 500 && attempt < 3) { await new Promise(r => setTimeout(r, 1000 * attempt)); continue; }
    throw new Error(`${method} ${p} -> ${res.status}: ${text.slice(0, 400)}`);
  }
}
async function fetchAll(p) {
  const out = [];
  for (let page = 1; ; page++) {
    const r = await strapi('GET', `${p}&pagination[page]=${page}&pagination[pageSize]=100`);
    out.push(...r.data);
    if (page >= r.meta.pagination.pageCount) return out;
  }
}

// Post-base heading/TocArabic: the title row's first lines (the descriptive header), capped in length
function headingOf(title) {
  const oneLine = title.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 2).join(' ').replace(/\s+/g, ' ');
  if (oneLine.length <= 200) return oneLine;
  const cut = oneLine.slice(0, 200);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

const { posts, notes } = readAttarCsv(csv);
const editions = (await strapi('GET', '/api/editions?pagination[pageSize]=100')).data;
const target = editions.find(e => e.title === EDITION);
if (!target) throw new Error(`Edition not found. Available: ${editions.map(e => e.title).join(', ')}`);
const existing = await fetchAll(`/api/posts?filters[editions][title][$eq]=${encodeURIComponent(EDITION)}&fields[0]=sermonNumber&populate[paragraphs][fields][0]=number&populate[post_base][fields][0]=documentId&populate[post_base][populate][posts][fields][0]=documentId`);
const toDelete = existing.filter(p => DELETE_OLD.includes(p.documentId));
if (toDelete.length !== DELETE_OLD.length) throw new Error(`--delete-old: not all ids are ${EDITION} posts`);
const existingNums = new Set(existing.filter(p => !DELETE_OLD.includes(p.documentId)).map(p => p.sermonNumber));

const plan = [], skipped = [];
for (const [num, p] of posts) {
  if (ONLY && !ONLY.includes(num)) continue;
  if (existingNums.has(num)) { skipped.push(`${num} (already loaded)`); continue; }
  if (!p.title) { skipped.push(`${num} (no title row)`); continue; }
  plan.push(p);
}
const byType = plan.reduce((a, p) => ({ ...a, [p.type]: (a[p.type] || 0) + 1 }), {});
console.log(`${posts.size} posts in CSV; ${plan.length} to create (${JSON.stringify(byType)}, ${plan.reduce((a, p) => a + p.paragraphs.length, 0)} paragraphs); ${skipped.length} skipped`);
if (toDelete.length) console.log(`Will delete old ${EDITION} posts: ${toDelete.map(p => `${p.sermonNumber} (${p.documentId}, ${p.paragraphs.length} paragraphs${p.post_base ? `, post-base ${p.post_base.documentId} with ${p.post_base.posts.length} post(s)` : ''})`).join('; ')}`);
if (skipped.length) console.log('Skipped:\n  ' + skipped.join('\n  '));
if (notes.length) console.log('Notes:\n  ' + notes.join('\n  '));
const sample = plan.find(p => p.key === '3.249') || plan[0];
if (sample) console.log(`\nSample ${sample.key}: heading "${headingOf(sample.title)}", paragraphs ${sample.paragraphs.map(x => x.number).join(', ') || '(none)'}`);
if (!APPLY) { console.log('\nDRY RUN — pass --apply to write.'); process.exit(0); }

// --- delete old posts (their paragraphs, and their post-base when it holds nothing else) ---
for (const p of toDelete) {
  for (const para of p.paragraphs) await strapi('DELETE', `/api/paragraphs/${para.documentId}`);
  await strapi('DELETE', `/api/posts/${p.documentId}`);
  if (p.post_base && p.post_base.posts.every(x => x.documentId === p.documentId)) await strapi('DELETE', `/api/post-bases/${p.post_base.documentId}`);
  console.log(`Deleted old post ${p.sermonNumber}`);
}

// --- create ---
const log = [];
const logPath = `scripts/edition-import/attar-import-log-${Date.now()}.json`;
let ok = 0; const failed = [];
const queue = [...plan];
await Promise.all(Array.from({ length: 3 }, async () => {
  for (let item; (item = queue.shift());) {
    const entry = { sermonNumber: item.key, paragraphs: [] };
    try {
      for (const para of item.paragraphs) {
        const r = await strapi('POST', '/api/paragraphs?status=published', { data: {
          arabic: para.ar, number: para.number, wasTitle: false, translations: [], editions: [target.documentId],
        } });
        entry.paragraphs.push(r.data.documentId);
      }
      const heading = headingOf(item.title);
      const base = await strapi('POST', '/api/post-bases?status=published', { data: { heading, TocArabic: heading, type: item.type } });
      entry.postBase = base.data.documentId;
      const r = await strapi('POST', '/api/posts?status=published', { data: {
        title: item.title, type: item.type, sermonNumber: item.key, translations: [],
        paragraphs: entry.paragraphs, editions: [target.documentId], post_base: entry.postBase,
      } });
      entry.post = r.data.documentId;
      if (++ok % 50 === 0) console.log(`  …${ok}/${plan.length}`);
    } catch (e) { failed.push(`${item.key}: ${e.message}`); }
    log.push(entry);
    fs.writeFileSync(logPath, JSON.stringify(log, null, 1));
  }
}));
console.log(`\nCreated ${ok}/${plan.length} posts. Log (post, post-base, paragraph documentIds): ${logPath}`);
if (failed.length) console.log(`Failed (${failed.length}):\n  ` + failed.join('\n  '));
