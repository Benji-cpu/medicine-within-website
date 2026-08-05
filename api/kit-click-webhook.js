const { createClient } = require('@supabase/supabase-js');
const { classifyLink } = require('../lib/hipsyEventMap');

// Receives Kit's (ConvertKit v4) subscriber.link_click webhook and logs every
// click to Supabase. Kit's exact payload shape for this event isn't
// documented publicly, so this extracts email/URL defensively across several
// plausible field names and always stores the full raw payload - so nothing
// is lost even if the real shape differs from what's guessed here, and the
// parser can be corrected after seeing the first real delivery.
function extractEmail(body) {
  return (
    body?.subscriber?.email_address ||
    body?.subscriber?.email ||
    body?.email_address ||
    body?.email ||
    null
  );
}

function extractClickedUrl(body) {
  return (
    body?.link?.url ||
    body?.link_url ||
    body?.url ||
    body?.initiator_value ||
    body?.event?.initiator_value ||
    null
  );
}

function createHandler({ supabase }) {
  return async function webhookHandler(req, res) {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const body = req.body || {};
    const email = (extractEmail(body) || '').toLowerCase().trim();
    const clickedUrl = extractClickedUrl(body) || '';
    const { hipsyEventId, offerName } = classifyLink(clickedUrl);

    // Log every delivery regardless of whether extraction succeeded - the
    // raw payload is the source of truth if the field-name guesses above
    // turn out wrong.
    const { error } = await supabase.from('link_clicks').insert([
      {
        email: email || null,
        clicked_url: clickedUrl || null,
        hipsy_event_id: hipsyEventId,
        offer_name: offerName,
        raw_payload: body,
      },
    ]);

    if (error) {
      console.error('link_clicks insert failed', error);
      res.status(500).json({ error: 'Something went wrong.' });
      return;
    }

    res.status(200).json({ success: true });
  };
}

module.exports = async (req, res) => {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
  return createHandler({ supabase })(req, res);
};

module.exports.createHandler = createHandler;
module.exports.extractEmail = extractEmail;
module.exports.extractClickedUrl = extractClickedUrl;
