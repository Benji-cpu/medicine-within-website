#!/usr/bin/env node
/**
 * Page freshness check for Medicine Within offering pages.
 *
 * Flags copy that has gone stale with time. It REPORTS, it never edits:
 * these are hand-written sales pages and a silent find-replace would mangle them.
 *
 * Checks:
 *   1. Named events referenced on a page whose date has already passed.
 *   2. Hipsy event links pointing at events that are over.
 *   3. Seasonal language (equinox / solstice / autumn / winter) that no longer matches the season.
 *   4. Upcoming Hipsy temple nights that are NOT yet referenced on the membership page.
 *
 * Writes .masterminds-context/PAGE-FRESHNESS.md and exits 1 if anything is stale.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const SITE = path.join(process.env.HOME, 'medicine-within-website');
const DB   = path.join(process.env.HOME, 'medicine-within-hipsy-agent', 'data', 'medicine-within.db');
const OUT  = path.join(SITE, '.masterminds-context', 'PAGE-FRESHNESS.md');
const PAGES = ['offerings/living-temple.html', 'offerings/living-temple.draft.html',
               'offerings/temple-work.html', 'offerings/embodied-connection.html',
               'offerings/embodied-connection.draft.html'];

const today = new Date().toISOString().slice(0, 10);
const issues = [];

// Seasonal windows: word -> [validFromMMDD, validToMMDD]
const SEASONS = {
  equinox:  ['08-15', '10-15'],
  solstice: ['11-15', '01-10'],
  autumn:   ['08-15', '11-30'],
  samhain:  ['09-15', '11-05'],
};

function inWindow(mmdd, [from, to]) {
  return from <= to ? (mmdd >= from && mmdd <= to)
                    : (mmdd >= from || mmdd <= to);   // wraps the year
}

let events = [];
try {
  const db = new DatabaseSync(DB);
  events = db.prepare(
    "SELECT title, date(date) d, url_hipsy FROM events WHERE date(date) >= date('now','-400 day') ORDER BY date"
  ).all();
} catch (e) {
  issues.push(['ERROR', 'all', `Could not read the Hipsy DB (${e.message}). Run: cd ~/medicine-within-hipsy-agent && node pull.js && node build-sqlite.js`]);
}

// Short, human names we actually write in copy, mapped to their real event rows
function shortNames(title) {
  const t = title.replace(/[✧✦]/g, ' ').trim();
  const out = new Set();
  const colon = t.split(':')[0].trim();
  if (colon.length > 5) out.add(colon);
  const dash = t.split(/\s+[-–]\s+/)[0].trim();
  if (dash.length > 5) out.add(dash);
  out.add(t);
  return [...out].filter(n => n.length > 6 && n.length < 60);
}

for (const rel of PAGES) {
  const file = path.join(SITE, rel);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const visible = html.replace(/<!--[\s\S]*?-->/g, '');

  // 1 + 2. past events still named or linked
  for (const ev of events) {
    if (ev.d >= today) continue;
    if (ev.url_hipsy && visible.includes(ev.url_hipsy)) {
      issues.push(['PAST LINK', rel, `Links to "${ev.title.slice(0, 45)}" which was ${ev.d}`]);
    }
    for (const n of shortNames(ev.title)) {
      if (visible.includes(n)) {
        issues.push(['PAST EVENT', rel, `Still names "${n}" (was ${ev.d})`]);
        break;
      }
    }
  }

  // 3. seasonal language out of season
  const mmdd = today.slice(5);
  for (const [word, win] of Object.entries(SEASONS)) {
    const re = new RegExp(`\\b${word}\\b`, 'i');
    if (re.test(visible) && !inWindow(mmdd, win)) {
      issues.push(['OUT OF SEASON', rel, `Uses "${word}" but today is ${today}. Rewrite the seasonal framing.`]);
    }
  }
}

// 4. upcoming temples missing from the membership page
const memberPage = ['offerings/living-temple.html', 'offerings/living-temple.draft.html']
  .map(p => path.join(SITE, p)).find(fs.existsSync);
if (memberPage) {
  const html = fs.readFileSync(memberPage, 'utf8');
  const soon = events.filter(e => e.d >= today && e.d <= new Date(Date.now() + 100 * 864e5).toISOString().slice(0, 10))
                     .filter(e => /temple|tantrik|eros|intimacy/i.test(e.title))
                     .filter(e => !/kambo/i.test(e.title));
  for (const ev of soon) {
    if (ev.url_hipsy && !html.includes(ev.url_hipsy)) {
      issues.push(['NOT LINKED', path.basename(memberPage), `Upcoming "${ev.title.slice(0, 45)}" (${ev.d}) is not linked on the membership page`]);
    }
  }
}

const lines = [`# Page freshness check`, ``, `Run: ${new Date().toISOString()}`, ``];
if (!issues.length) {
  lines.push(`**All clear.** No past events referenced, no out-of-season language, every upcoming temple is linked.`);
} else {
  lines.push(`## ${issues.length} thing(s) need a human edit`, ``,
             `These are hand-written sales pages. Nothing here is auto-fixed on purpose.`, ``,
             `| What | Page | Detail |`, `|---|---|---|`);
  for (const [k, p, d] of issues) lines.push(`| **${k}** | \`${p}\` | ${d} |`);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join('\n') + '\n');
console.log(lines.join('\n'));
process.exit(issues.length ? 1 : 0);
