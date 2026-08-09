import { describe, it, expect } from 'vitest';
import hipsyEvents from '../lib/hipsyEvents.js';
import emailTemplate from '../lib/emailTemplate.js';

const { fetchUpcomingEvents, tidyTitle, isBookable } = hipsyEvents;
const { buildWelcomeEmail } = emailTemplate;

const NOW = new Date('2026-08-09T12:00:00Z');

function event(overrides) {
  return {
    title: 'Temple of Euphoria',
    date: '2026-09-20T18:00:00.000000Z',
    date_until: '2026-09-20T23:00:00.000000Z',
    url_hipsy: 'https://hipsy.nl/event/1-temple',
    sold_out: false,
    private: false,
    disable_tickets: false,
    ...overrides,
  };
}

function fetchReturning(rows) {
  return async () => ({ ok: true, json: async () => ({ data: rows }) });
}

const opts = (rows) => ({
  apiKey: 'k',
  slug: 'medicine-within',
  now: NOW,
  fetchImpl: fetchReturning(rows),
});

describe('isBookable', () => {
  it('drops events that have already finished', () => {
    expect(isBookable(event({ date: '2026-07-01T18:00:00Z', date_until: '2026-07-01T23:00:00Z' }), NOW)).toBe(false);
  });

  it('keeps a multi-day event that is still running', () => {
    const running = event({ date: '2026-08-08T17:00:00Z', date_until: '2026-08-10T11:00:00Z' });
    expect(isBookable(running, NOW)).toBe(true);
  });

  it('drops sold out, private, and ticketless events', () => {
    expect(isBookable(event({ sold_out: true }), NOW)).toBe(false);
    expect(isBookable(event({ private: true }), NOW)).toBe(false);
    expect(isBookable(event({ disable_tickets: true }), NOW)).toBe(false);
  });
});

describe('tidyTitle', () => {
  it('always spells Kambo with the circumflex', () => {
    expect(tidyTitle('Kambo Ceremony 12/09')).toBe('Kambô Ceremony');
  });

  it('strips listing decoration', () => {
    expect(tidyTitle('TEMPLE OF EUPHORIA ✧  A Microdosed Temple')).toBe('TEMPLE OF EUPHORIA A Microdosed Temple');
  });
});

describe('fetchUpcomingEvents', () => {
  it('returns only future events, soonest first', async () => {
    const rows = [
      event({ title: 'Later Temple', date: '2026-10-17T18:00:00Z', date_until: '2026-10-17T23:00:00Z' }),
      event({ title: 'Past Temple', date: '2026-06-01T18:00:00Z', date_until: '2026-06-01T23:00:00Z' }),
      event({ title: 'Soon Temple', date: '2026-08-21T18:00:00Z', date_until: '2026-08-21T23:00:00Z' }),
    ];
    const out = await fetchUpcomingEvents(opts(rows));
    expect(out.map((e) => e.title)).toEqual(['Soon Temple', 'Later Temple']);
    expect(out[0].date).toBe('21 August');
  });

  it('shows both monthly Kambo ceremonies, not just the next one', async () => {
    const rows = [
      event({ title: 'Kambo Ceremony 12/09', date: '2026-09-12T09:00:00Z', date_until: '2026-09-12T12:00:00Z' }),
      event({ title: 'Kambo Ceremony 26/09', date: '2026-09-26T09:00:00Z', date_until: '2026-09-26T12:00:00Z' }),
    ];
    const out = await fetchUpcomingEvents(opts(rows));
    expect(out).toHaveLength(2);
    expect(out.every((e) => e.category === 'kambo')).toBe(true);
  });

  it('pairs a Threshold workshop under the temple it precedes, never instead of it', async () => {
    const rows = [
      event({ title: 'The Art of Embodied Connection™ - Theme: Homecoming', date: '2026-09-20T14:00:00Z', date_until: '2026-09-20T17:00:00Z' }),
      event({ title: 'TEMPLE OF EUPHORIA ✧ A Microdosed Tantrik Temple Night', date: '2026-09-20T19:00:00Z', date_until: '2026-09-20T23:59:00Z' }),
    ];
    const out = await fetchUpcomingEvents(opts(rows));
    expect(out).toHaveLength(1);
    expect(out[0].category).toBe('temple');
    expect(out[0].alsoTitle).toContain('Art of Embodied Connection');
  });

  it('keeps a Threshold workshop that has no temple on its day', async () => {
    const rows = [
      event({ title: 'The Art of Embodied Connection™ - Theme: Homecoming', date: '2026-09-20T14:00:00Z', date_until: '2026-09-20T17:00:00Z' }),
    ];
    const out = await fetchUpcomingEvents({ ...opts(rows), quota: { threshold: 1 } });
    expect(out).toHaveLength(1);
    expect(out[0].category).toBe('threshold');
  });

  it('never drops a temple in favour of Kambo ceremonies', async () => {
    const rows = [
      event({ title: 'Kambo Ceremony 12/09', date: '2026-09-12T09:00:00Z', date_until: '2026-09-12T12:00:00Z' }),
      event({ title: 'Kambo Ceremony 26/09', date: '2026-09-26T09:00:00Z', date_until: '2026-09-26T12:00:00Z' }),
      event({ title: 'Kambo Ceremony 10/10', date: '2026-10-10T09:00:00Z', date_until: '2026-10-10T12:00:00Z' }),
      event({ title: 'Dark Eros: A Tantrik Temple', date: '2026-10-17T19:00:00Z', date_until: '2026-10-17T23:59:00Z' }),
    ];
    const out = await fetchUpcomingEvents(opts(rows));
    expect(out.some((e) => e.category === 'temple')).toBe(true);
    expect(out.filter((e) => e.category === 'kambo')).toHaveLength(2);
  });

  it('returns an empty list when Hipsy fails rather than throwing', async () => {
    const out = await fetchUpcomingEvents({
      apiKey: 'k',
      slug: 's',
      now: NOW,
      fetchImpl: async () => {
        throw new Error('network down');
      },
    });
    expect(out).toEqual([]);
  });

  it('returns an empty list when credentials are missing', async () => {
    expect(await fetchUpcomingEvents({ apiKey: '', slug: '', now: NOW })).toEqual([]);
  });
});

describe('welcome email', () => {
  const magnet = { name: 'Come Home To Your Body', subject: 's', downloadUrl: 'https://x/y.pdf' };

  it('lists live events in the P.S.', () => {
    const { html } = buildWelcomeEmail({
      firstName: 'Anna',
      leadMagnet: magnet,
      events: [{ title: 'Kambô Ceremony', date: '12 September', url: 'https://hipsy.nl/event/2' }],
    });
    expect(html).toContain('Kambô Ceremony');
    expect(html).toContain('12 September');
    expect(html).toContain('https://hipsy.nl/event/2');
  });

  it('still invites people when no events come back', () => {
    const { html } = buildWelcomeEmail({ firstName: 'Anna', leadMagnet: magnet, events: [] });
    expect(html).toContain('medicinewithin.nl/events');
    expect(html).toContain("When you're ready to do this in a room instead of alone");
  });

  it('never contains an em dash', () => {
    const { html } = buildWelcomeEmail({ firstName: 'Anna', leadMagnet: magnet, events: [] });
    expect(html).not.toContain('—');
  });
});
