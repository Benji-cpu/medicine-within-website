import { describe, it, expect, vi } from 'vitest';
import webhookModule from '../api/kit-click-webhook.js';

const { createHandler, extractEmail, extractClickedUrl } = webhookModule;

function createFakeSupabase() {
  let rows = [];
  return {
    from() {
      return {
        async insert(newRows) {
          rows.push(...newRows);
          return { data: newRows, error: null };
        },
      };
    },
    _rows: () => rows,
  };
}

function fakeReqRes(body) {
  const req = { method: 'POST', body };
  const res = {
    statusCode: null,
    jsonBody: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.jsonBody = payload;
      return this;
    },
  };
  return { req, res };
}

describe('extractEmail', () => {
  it('reads subscriber.email_address if present', () => {
    expect(extractEmail({ subscriber: { email_address: 'a@b.com' } })).toBe('a@b.com');
  });
  it('falls back through several plausible field names', () => {
    expect(extractEmail({ email: 'c@d.com' })).toBe('c@d.com');
    expect(extractEmail({ email_address: 'e@f.com' })).toBe('e@f.com');
  });
  it('returns null when nothing matches', () => {
    expect(extractEmail({ nothing: true })).toBe(null);
  });
});

describe('extractClickedUrl', () => {
  it('reads link.url if present', () => {
    expect(extractClickedUrl({ link: { url: 'https://hipsy.nl/event/198567-x' } })).toBe(
      'https://hipsy.nl/event/198567-x'
    );
  });
  it('falls back to initiator_value', () => {
    expect(extractClickedUrl({ initiator_value: 'https://hipsy.nl/event/198566-x' })).toBe(
      'https://hipsy.nl/event/198566-x'
    );
  });
});

describe('kit-click-webhook handler', () => {
  it('classifies a known Hipsy event ID and logs the click', async () => {
    const supabase = createFakeSupabase();
    const handler = createHandler({ supabase });
    const { req, res } = fakeReqRes({
      subscriber: { email_address: 'Test@Example.com' },
      link: { url: 'https://hipsy.nl/event/198567-embodied-tantra-weekend-training' },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(supabase._rows()).toEqual([
      {
        email: 'test@example.com',
        clicked_url: 'https://hipsy.nl/event/198567-embodied-tantra-weekend-training',
        hipsy_event_id: 198567,
        offer_name: 'Embodied Tantra Weekend Training',
        raw_payload: req.body,
      },
    ]);
  });

  it('logs the raw payload even when email/url extraction fails', async () => {
    const supabase = createFakeSupabase();
    const handler = createHandler({ supabase });
    const { req, res } = fakeReqRes({ unexpected: 'shape' });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(supabase._rows()[0].email).toBe(null);
    expect(supabase._rows()[0].raw_payload).toEqual({ unexpected: 'shape' });
  });

  it('rejects non-POST requests', async () => {
    const supabase = createFakeSupabase();
    const handler = createHandler({ supabase });
    const { req, res } = fakeReqRes(undefined);
    req.method = 'GET';

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(supabase._rows()).toEqual([]);
  });
});
