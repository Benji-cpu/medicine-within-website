const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { handleSubscribeRequest } = require('../lib/subscribe');

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || 'sandi@medicinewithin.nl';
const NOTIFY_ADDRESS = process.env.SUBSCRIBER_NOTIFY_ADDRESS || 'sandi@medicinewithin.nl';

// Builds a request handler from injected dependencies. Used directly by
// tests (with fake supabase / sendEmail) and wrapped with real clients below
// for the actual Vercel entrypoint.
function createHandler({ supabase, sendEmail, notifyTo }) {
  return async function subscribeHandler(req, res) {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { firstName, lastName, email, leadMagnet, wantsWomensContent } = req.body || {};
      const result = await handleSubscribeRequest(
        { firstName, lastName, email, leadMagnet, wantsWomensContent },
        { supabase, sendEmail, notifyTo }
      );
      res.status(result.statusCode).json(result.body);
    } catch (err) {
      console.error('subscribe error', err);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  };
}

// The real Vercel entrypoint. Clients are constructed per-request (not at
// module load) so importing this file for its `createHandler` export never
// requires real Supabase/Resend credentials to be present.
module.exports = async (req, res) => {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const sendEmail = (payload) => resend.emails.send({ from: FROM_ADDRESS, ...payload });
  return createHandler({ supabase, sendEmail, notifyTo: NOTIFY_ADDRESS })(req, res);
};

module.exports.createHandler = createHandler;
