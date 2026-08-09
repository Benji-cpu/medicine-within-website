const { LEAD_MAGNETS } = require('./leadMagnets');
const { buildWelcomeEmail, buildNotificationEmail } = require('./emailTemplate');
const { subscribeToConvertKit } = require('./convertkit');
const { fetchUpcomingEvents } = require('./hipsyEvents');

const DEFAULT_NOTIFY_TO = 'sandi@medicinewithin.nl';
// ConvertKit tag: "Women only"
const WOMENS_CONTENT_TAG_ID = 5463428;

async function findExistingSubscription(supabase, email, leadMagnetSlug) {
  const { data, error } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email', email)
    .eq('lead_magnet', leadMagnetSlug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function insertSubscription(supabase, { firstName, lastName, phone, country, email, leadMagnetSlug, wantsWomensContent }) {
  const { error } = await supabase.from('subscribers').insert([
    {
      first_name: firstName,
      last_name: lastName || null,
      phone: phone || null,
      country: country || null,
      email,
      lead_magnet: leadMagnetSlug,
      wants_womens_content: Boolean(wantsWomensContent),
    },
  ]);

  if (error) throw error;
}

async function handleSubscribeRequest(
  { firstName, lastName, phone, country, email, leadMagnet, wantsWomensContent },
  {
    supabase,
    sendEmail,
    leadMagnets = LEAD_MAGNETS,
    notifyTo = DEFAULT_NOTIFY_TO,
    convertKit = subscribeToConvertKit,
    convertKitApiSecret = process.env.CONVERTKIT_API_SECRET,
    upcomingEvents = fetchUpcomingEvents,
  }
) {
  // lastName is intentionally not required - first name + email is the
  // low-friction pair for a cold Instagram click. phone/country are optional
  // extras captured when offered, never blocking the signup.
  if (!firstName || !email || !leadMagnet) {
    return { statusCode: 400, body: { error: 'firstName, email, and leadMagnet are required.' } };
  }

  const leadMagnetConfig = leadMagnets[leadMagnet];
  if (!leadMagnetConfig) {
    return { statusCode: 400, body: { error: `Unknown lead magnet: ${leadMagnet}` } };
  }

  const existing = await findExistingSubscription(supabase, email, leadMagnet);
  if (existing) {
    return { statusCode: 200, body: { success: true, alreadySubscribed: true } };
  }

  try {
    await insertSubscription(supabase, { firstName, lastName, phone, country, email, leadMagnetSlug: leadMagnet, wantsWomensContent });
  } catch (error) {
    // Unique violation on (email, lead_magnet) - a concurrent request for the
    // same signup won the race between the check above and this insert.
    if (error && error.code === '23505') {
      return { statusCode: 200, body: { success: true, alreadySubscribed: true } };
    }
    throw error;
  }

  // Live Hipsy events for the P.S. Best-effort: an empty list falls back to the
  // events-page link, so ticketing being down never costs someone their guide.
  let events = [];
  try {
    events = await upcomingEvents();
  } catch (error) {
    events = [];
  }

  const { subject, html } = buildWelcomeEmail({ firstName, leadMagnet: leadMagnetConfig, events });
  await sendEmail({ to: email, subject, html });

  const notification = buildNotificationEmail({ firstName, lastName, phone, country, email, leadMagnet: leadMagnetConfig });
  await sendEmail({ to: notifyTo, subject: notification.subject, html: notification.html });

  // Best-effort: get the subscriber into ConvertKit so they land in the
  // regular newsletter, not just this one-off download. Never let a
  // ConvertKit outage block the signup - they already have their guide.
  // phone/country ride along as ConvertKit custom fields when provided -
  // NOTE: not yet verified live that ConvertKit auto-creates these custom
  // fields on first use; check the account after the first real signup
  // with a phone/country filled in before relying on this.
  const ckFields = {};
  if (phone) ckFields.phone_number = phone;
  if (country) ckFields.country = country;

  if (convertKitApiSecret && leadMagnetConfig.convertKitTagId) {
    try {
      await convertKit({
        apiSecret: convertKitApiSecret,
        tagId: leadMagnetConfig.convertKitTagId,
        email,
        firstName,
        ...(Object.keys(ckFields).length ? { fields: ckFields } : {}),
      });
    } catch (error) {
      console.error('ConvertKit sync failed for', email, leadMagnet, error);
    }
  }

  if (convertKitApiSecret && wantsWomensContent) {
    try {
      await convertKit({
        apiSecret: convertKitApiSecret,
        tagId: WOMENS_CONTENT_TAG_ID,
        email,
        firstName,
      });
    } catch (error) {
      console.error('ConvertKit Women only tag sync failed for', email, error);
    }
  }

  return { statusCode: 200, body: { success: true, alreadySubscribed: false } };
}

module.exports = { handleSubscribeRequest, findExistingSubscription, insertSubscription };
