const { LEAD_MAGNETS } = require('./leadMagnets');
const { buildWelcomeEmail, buildNotificationEmail } = require('./emailTemplate');

const DEFAULT_NOTIFY_TO = 'sandi@medicinewithin.nl';

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

async function insertSubscription(supabase, { firstName, lastName, email, leadMagnetSlug }) {
  const { error } = await supabase.from('subscribers').insert([
    {
      first_name: firstName,
      last_name: lastName,
      email,
      lead_magnet: leadMagnetSlug,
    },
  ]);

  if (error) throw error;
}

async function handleSubscribeRequest(
  { firstName, lastName, email, leadMagnet },
  { supabase, sendEmail, leadMagnets = LEAD_MAGNETS, notifyTo = DEFAULT_NOTIFY_TO }
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
    await insertSubscription(supabase, { firstName, lastName, email, leadMagnetSlug: leadMagnet });
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

  return { statusCode: 200, body: { success: true, alreadySubscribed: false } };
}

module.exports = { handleSubscribeRequest, findExistingSubscription, insertSubscription };
