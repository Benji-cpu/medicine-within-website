'use strict';

// Live upcoming events from Hipsy, for the lead magnet welcome email.
//
// The point of pulling these at send time rather than hardcoding them: a guide
// downloaded in November should invite people to November's temple, not to
// something that happened in August. Nothing here ever mentions a past event.

const BASE_URL = 'https://api.hipsy.nl/v1';
const EVENTS_URL = 'https://www.medicinewithin.nl/events/';
const HIPSY_PAGE_URL = 'https://hipsy.nl/medicine-within';
const FETCH_TIMEOUT_MS = 5000;

// Temple is the highest-earning line by a wide margin (roughly 12x a Kambô
// ceremony per event), so it is never allowed to fall off the bottom of the
// list. Selection below fills by category, not by pure chronology.
const CATEGORY_PATTERNS = [
  ['threshold', /art of embodied connection|the threshold/i],
  ['retreat', /retreat/i],
  ['immersion', /embodied tantra|weekend training|weekend immersion/i],
  ['kambo', /kamb[oô]/i],
  ['temple', /temple|eros|maithuna|cirque|euphoria|soulstice|solstice|equinox|blue lotus|devotion/i],
];

// How many of each category may appear. Temple leads, both monthly Kambô
// ceremonies are shown because she runs two a month and only listing one
// hides half the availability.
const CATEGORY_QUOTA = {
  temple: 2,
  immersion: 1,
  retreat: 1,
  kambo: 2,
};

function categorise(title) {
  for (const [name, pattern] of CATEGORY_PATTERNS) {
    if (pattern.test(title)) return name;
  }
  return 'other';
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Amsterdam',
  });
}

// Hipsy titles carry decoration meant for a listing page ("✧", "A 4-Day
// Archetypal...", trailing dates). In an email we want the name, not the poster.
function tidyTitle(title) {
  return String(title || '')
    .replace(/\s*[✧✦🌹🌿✨🔥🌟💕👁🪷⚡️🐍]+\s*/gu, ' ')
    .replace(/\s*[:|]\s*A \d+-Day.*$/i, '')
    .replace(/\s+\d{1,2}\/\d{1,2}\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    // Hipsy listings spell it "Kambo". In writing it is always Kambô.
    .replace(/\bKambo\b/g, 'Kambô')
    .trim();
}

function isBookable(event, now) {
  if (!event) return false;
  if (event.private || event.sold_out || event.disable_tickets) return false;

  // Prefer the end date so a multi-day weekend stays listed while it is running.
  const ends = new Date(event.date_until || event.date);
  if (Number.isNaN(ends.getTime())) return false;
  return ends.getTime() >= now.getTime();
}

// A Threshold workshop ("The Art of Embodied Connection") is never a standalone
// offer: it runs the same day as a temple and exists to walk newcomers into it.
// Listing it alone sends people to the warm-up and hides the thing that earns.
// So the temple leads, and the workshop rides along as the earlier door in.
function pairThresholdsWithTemples(events) {
  const temples = events.filter((e) => e.category === 'temple');

  return events
    .filter((e) => e.category !== 'threshold')
    .map((e) => {
      if (e.category !== 'temple') return e;
      const sameDay = events.find(
        (t) => t.category === 'threshold' && t.day === e.day
      );
      if (!sameDay) return e;
      return { ...e, alsoTitle: sameDay.title, alsoUrl: sameDay.url };
    })
    .concat(
      // A Threshold with no temple on the same day would otherwise vanish.
      events.filter(
        (e) =>
          e.category === 'threshold' &&
          !temples.some((t) => t.day === e.day)
      )
    )
    .sort((a, b) => a.starts - b.starts);
}

function selectByValue(events, quota = CATEGORY_QUOTA) {
  const taken = {};
  const picked = [];
  for (const e of events) {
    const cat = e.category;
    const allowed = quota[cat] !== undefined ? quota[cat] : 0;
    taken[cat] = taken[cat] || 0;
    if (taken[cat] < allowed) {
      taken[cat] += 1;
      picked.push(e);
    }
  }
  return picked.sort((a, b) => a.starts - b.starts);
}

async function fetchUpcomingEvents({
  apiKey = process.env.HIPSY_API_KEY,
  slug = process.env.HIPSY_ORGANISATION_SLUG,
  quota = CATEGORY_QUOTA,
  now = new Date(),
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!apiKey || !slug) return [];

  const url = `${BASE_URL}/organisation/${encodeURIComponent(slug)}/events?limit=25&period=upcoming`;

  let payload;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetchImpl(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      if (!res.ok) return [];
      payload = await res.json();
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    // A welcome email must never fail because ticketing is down. Fall back to
    // the events page link, which the template always renders anyway.
    return [];
  }

  const rows = Array.isArray(payload) ? payload : payload && payload.data;
  if (!Array.isArray(rows)) return [];

  const normalised = rows
    .filter((e) => isBookable(e, now))
    .map((e) => {
      const title = tidyTitle(e.title);
      return {
        title,
        category: categorise(title),
        date: formatDate(e.date),
        day: String(e.date).slice(0, 10),
        starts: new Date(e.date).getTime(),
        url: e.url_hipsy || e.url_ticketshop || EVENTS_URL,
      };
    })
    .filter((e) => e.title && e.url)
    .sort((a, b) => a.starts - b.starts);

  return selectByValue(pairThresholdsWithTemples(normalised), quota);
}

module.exports = {
  fetchUpcomingEvents,
  formatDate,
  tidyTitle,
  isBookable,
  categorise,
  pairThresholdsWithTemples,
  selectByValue,
  EVENTS_URL,
  HIPSY_PAGE_URL,
};
