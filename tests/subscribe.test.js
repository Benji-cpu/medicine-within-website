import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSubscribeRequest } from '../lib/subscribe.js';
import subscribeModule from '../api/subscribe.js';

const { createHandler } = subscribeModule;

// Two lead magnets injected for these tests only (the real lib/leadMagnets.js
// currently ships just "body-remembers"). Proves the "signs up for a
// different lead magnet later" requirement without inventing a fake product
// in production config.
const TEST_LEAD_MAGNETS = {
  'body-remembers': {
    name: 'The Body Remembers',
    subject: 'Your guide is here: The Body Remembers',
    downloadUrl: 'https://medicinewithin.nl/assets/downloads/the-body-remembers.pdf',
    convertKitTagId: 999111,
  },
  'second-test-magnet': {
    name: 'Second Test Magnet',
    subject: 'Your Second Test Magnet guide',
    downloadUrl: 'https://medicinewithin.nl/assets/downloads/second-test-magnet.pdf',
    // Deliberately no convertKitTagId - proves the sync is skipped, not crashed, when unset.
  },
};

// In-memory stand-in for the subscribers table. No network, no real
// Supabase project touched.
function createFakeSupabase() {
  let rows = [];
  return {
    from() {
      return {
        select() {
          return {
            eq(field1, value1) {
              return {
                eq(field2, value2) {
                  return {
                    async maybeSingle() {
                      const match = rows.find((r) => r[field1] === value1 && r[field2] === value2);
                      return { data: match || null, error: null };
                    },
                  };
                },
              };
            },
          };
        },
        async insert(newRows) {
          rows.push(...newRows);
          return { data: newRows, error: null };
        },
      };
    },
    _rows: () => rows,
    _reset: () => {
      rows = [];
    },
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

describe('handleSubscribeRequest (unit, injected fakes — no real Supabase/Resend/ConvertKit ever constructed)', () => {
  let fakeSupabase;
  let sendEmail;
  let convertKit;

  beforeEach(() => {
    fakeSupabase = createFakeSupabase();
    sendEmail = vi.fn().mockResolvedValue({ id: 'fake-email-id' });
    convertKit = vi.fn().mockResolvedValue({ subscription: { id: 'fake-ck-id' } });
  });

  it('saves the subscriber and sends a welcome email on first signup', async () => {
    const result = await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers' },
      { supabase: fakeSupabase, sendEmail, convertKit, convertKitApiSecret: 'fake-secret', leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({ success: true, alreadySubscribed: false });

    expect(sendEmail).toHaveBeenCalledTimes(2);
    const emailPayload = sendEmail.mock.calls[0][0];
    expect(emailPayload.to).toBe('sandi@example.com');
    expect(emailPayload.subject).toBe('Your guide is here: The Body Remembers');
    expect(emailPayload.html).toContain('Hi Sandi,');
    expect(emailPayload.html).toContain('https://medicinewithin.nl/assets/downloads/the-body-remembers.pdf');

    const notifyPayload = sendEmail.mock.calls[1][0];
    expect(notifyPayload.to).toBe('sandi@medicinewithin.nl');
    expect(notifyPayload.subject).toBe('New subscriber: Sandi J wants The Body Remembers');
    expect(notifyPayload.html).toContain('sandi@example.com');

    expect(fakeSupabase._rows()).toEqual([
      {
        first_name: 'Sandi',
        last_name: 'J',
        email: 'sandi@example.com',
        lead_magnet: 'body-remembers',
        wants_womens_content: false,
      },
    ]);
  });

  it('sends the new-subscriber notification to a custom address when notifyTo is provided', async () => {
    const result = await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers' },
      { supabase: fakeSupabase, sendEmail, leadMagnets: TEST_LEAD_MAGNETS, notifyTo: 'inbox@medicinewithin.nl' }
    );

    expect(result.statusCode).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail.mock.calls[1][0].to).toBe('inbox@medicinewithin.nl');
  });

  it('does not re-send the email for a duplicate signup to the same lead magnet, but still reports success', async () => {
    const payload = { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers' };
    const deps = { supabase: fakeSupabase, sendEmail, leadMagnets: TEST_LEAD_MAGNETS };

    const first = await handleSubscribeRequest(payload, deps);
    const second = await handleSubscribeRequest(payload, deps);

    expect(first.body.alreadySubscribed).toBe(false);
    expect(second.statusCode).toBe(200);
    expect(second.body).toEqual({ success: true, alreadySubscribed: true });
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it('sends a new email when the same person signs up for a different lead magnet', async () => {
    const base = { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com' };
    const deps = { supabase: fakeSupabase, sendEmail, leadMagnets: TEST_LEAD_MAGNETS };

    const first = await handleSubscribeRequest({ ...base, leadMagnet: 'body-remembers' }, deps);
    const second = await handleSubscribeRequest({ ...base, leadMagnet: 'second-test-magnet' }, deps);

    expect(first.body.alreadySubscribed).toBe(false);
    expect(second.statusCode).toBe(200);
    expect(second.body).toEqual({ success: true, alreadySubscribed: false });

    expect(sendEmail).toHaveBeenCalledTimes(4);
    expect(sendEmail.mock.calls[0][0].subject).toBe('Your guide is here: The Body Remembers');
    expect(sendEmail.mock.calls[2][0].subject).toBe('Your Second Test Magnet guide');
  });

  it('rejects an unknown lead magnet slug without touching supabase or resend', async () => {
    const result = await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'totally-unknown' },
      { supabase: fakeSupabase, sendEmail, leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(result.statusCode).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('rejects requests missing required fields without touching supabase or resend', async () => {
    const result = await handleSubscribeRequest(
      { firstName: '', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers' },
      { supabase: fakeSupabase, sendEmail, leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(result.statusCode).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('reports alreadySubscribed instead of crashing when a concurrent request wins the insert race', async () => {
    // Simulates two near-simultaneous submissions: both pass findExistingSubscription
    // (neither sees a row yet), then the DB's unique(email, lead_magnet) constraint
    // rejects the second insert with a Postgres unique-violation (code 23505).
    const raceSupabase = createFakeSupabase();
    raceSupabase.from = () => ({
      select: fakeSupabase.from().select,
      async insert() {
        const error = new Error('duplicate key value violates unique constraint');
        error.code = '23505';
        return { data: null, error };
      },
    });

    const result = await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers' },
      { supabase: raceSupabase, sendEmail, leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({ success: true, alreadySubscribed: true });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('syncs the subscriber to ConvertKit with the lead magnet tag on first signup', async () => {
    await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers' },
      { supabase: fakeSupabase, sendEmail, convertKit, convertKitApiSecret: 'fake-secret', leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(convertKit).toHaveBeenCalledTimes(1);
    expect(convertKit).toHaveBeenCalledWith({
      apiSecret: 'fake-secret',
      tagId: 999111,
      email: 'sandi@example.com',
      firstName: 'Sandi',
    });
  });

  it('skips the ConvertKit sync when the lead magnet has no tag configured', async () => {
    await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'second-test-magnet' },
      { supabase: fakeSupabase, sendEmail, convertKit, convertKitApiSecret: 'fake-secret', leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(convertKit).not.toHaveBeenCalled();
  });

  it('skips the ConvertKit sync when no API secret is configured', async () => {
    await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers' },
      { supabase: fakeSupabase, sendEmail, convertKit, convertKitApiSecret: undefined, leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(convertKit).not.toHaveBeenCalled();
  });

  it('does not sync to ConvertKit on a duplicate signup to the same lead magnet', async () => {
    const payload = { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers' };
    const deps = { supabase: fakeSupabase, sendEmail, convertKit, convertKitApiSecret: 'fake-secret', leadMagnets: TEST_LEAD_MAGNETS };

    await handleSubscribeRequest(payload, deps);
    await handleSubscribeRequest(payload, deps);

    expect(convertKit).toHaveBeenCalledTimes(1);
  });

  it('still reports success and sends the welcome email even if the ConvertKit sync fails', async () => {
    convertKit.mockRejectedValue(new Error('ConvertKit is down'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers' },
      { supabase: fakeSupabase, sendEmail, convertKit, convertKitApiSecret: 'fake-secret', leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({ success: true, alreadySubscribed: false });
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('saves the opt-in and tags the subscriber Women only when wantsWomensContent is checked', async () => {
    await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers', wantsWomensContent: true },
      { supabase: fakeSupabase, sendEmail, convertKit, convertKitApiSecret: 'fake-secret', leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(fakeSupabase._rows()[0].wants_womens_content).toBe(true);

    // Called twice: once for the lead magnet tag, once for the Women only tag.
    expect(convertKit).toHaveBeenCalledTimes(2);
    expect(convertKit).toHaveBeenCalledWith({
      apiSecret: 'fake-secret',
      tagId: 5463428,
      email: 'sandi@example.com',
      firstName: 'Sandi',
    });
  });

  it('does not apply the Women only tag when the checkbox is left unchecked', async () => {
    await handleSubscribeRequest(
      { firstName: 'Sandi', lastName: 'J', email: 'sandi@example.com', leadMagnet: 'body-remembers', wantsWomensContent: false },
      { supabase: fakeSupabase, sendEmail, convertKit, convertKitApiSecret: 'fake-secret', leadMagnets: TEST_LEAD_MAGNETS }
    );

    expect(fakeSupabase._rows()[0].wants_womens_content).toBe(false);
    // Only the lead magnet tag call, not the Women only tag.
    expect(convertKit).toHaveBeenCalledTimes(1);
    expect(convertKit).not.toHaveBeenCalledWith(expect.objectContaining({ tagId: 5463428 }));
  });
});

describe('api/subscribe.js createHandler (real HTTP entrypoint shape, fake clients — no live Resend API ever called)', () => {
  it('calls the injected email function with the right recipient, subject, and download link', async () => {
    const fakeSupabase = createFakeSupabase();
    const sendEmail = vi.fn().mockResolvedValue({ id: 'fake-email-id' });
    const handler = createHandler({ supabase: fakeSupabase, sendEmail });

    const { req, res } = fakeReqRes({
      firstName: 'Maya',
      lastName: 'Rivera',
      email: 'maya@example.com',
      leadMagnet: 'body-remembers',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({ success: true, alreadySubscribed: false });

    expect(sendEmail).toHaveBeenCalledTimes(2);
    const sentPayload = sendEmail.mock.calls[0][0];
    expect(sentPayload.to).toBe('maya@example.com');
    expect(sentPayload.subject).toBe('Your guide is here: Come Home To Your Body');
    expect(sentPayload.html).toContain('https://medicinewithin.nl/assets/downloads/the-body-remembers.pdf');

    const notifyPayload = sendEmail.mock.calls[1][0];
    expect(notifyPayload.to).toBe('sandi@medicinewithin.nl');
    expect(notifyPayload.subject).toBe('New subscriber: Maya Rivera wants Come Home To Your Body');
  });

  it('rejects non-POST requests and never calls the email function', async () => {
    const fakeSupabase = createFakeSupabase();
    const sendEmail = vi.fn();
    const handler = createHandler({ supabase: fakeSupabase, sendEmail });

    const { req, res } = fakeReqRes(undefined);
    req.method = 'GET';

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
