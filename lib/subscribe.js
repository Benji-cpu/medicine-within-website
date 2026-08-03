const { LEAD_MAGNETS } = require('./leadMagnets');
const { buildWelcomeEmail, buildNotificationEmail } = require('./emailTemplate');
const { subscribeToConvertKit } = require('./convertkit');

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

async function insertSubscription(supabase, { firstName, lastName, email, leadMagnetSlug, wantsWomensContent }) {
  const { error } = await supabase.from('subscribers').insert([
    {
      first_name: firstName,
      last_name: lastName,
      email,
      lead_magnet: leadMagnetSlug,
      wants_womens_content: Boolean(wantsWomensContent),
    },
  ]);

  if (error) throw error;
}

async function handleSubscribeRequest(
  { firstName, lastName, email, leadMagnet, wantsWomensContent },
  {
    supabase,
    sendEmail,
    leadMagnets = LEAD_MAGNETS,
    notifyTo = DEFAULT_NOTIFY_TO,
    convertKit = subscribeToConvertKit,
    convertKitApiSecret = process.env.CONVERTKIT_API_SECRET,
  }
) {
  if (!firstName || !lastName || !email || !leadMagnet) {
    return { statusCode: 400, body: { error: 'firstName, lastName, email, and leadMagnet are required.' } };
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
    await insertSubscription(supabase, { firstName, lastName, email, leadMagnetSlug: leadMagnet, wantsWomensContent });
  } catch (error) {
    // Unique violation on (email, lead_magnet) - a concurrent request for the
    // same signup won the race between the check above and this insert.
    if (error && error.code === '23505') {
      return { statusCode: 200, body: { success: true, alreadySubscribed: true } };
    }
    throw error;
  }

  const { subject, html } = buildWelcomeEmail({ firstName, leadMagnet: leadMagnetConfig });
  await sendEmail({ to: email, subject, html });

  const notification = buildNotificationEmail({ firstName, lastName, email, leadMagnet: leadMagnetConfig });
  await sendEmail({ to: notifyTo, subject: notification.subject, html: notification.html });

  // Best-effort: get the subscriber into ConvertKit so they land in the
  // regular newsletter, not just this one-off download. Never let a
  // ConvertKit outage block the signup - they already have their guide.
  if (convertKitApiSecret && leadMagnetConfig.convertKitTagId) {
    try {
      await convertKit({
        apiSecret: convertKitApiSecret,
        tagId: leadMagnetConfig.convertKitTagId,
        email,
        firstName,
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
