const { createClient } = require('@supabase/supabase-js');

// Vercel Cron pings this daily so the Supabase free-tier project never sits
// idle long enough to hit its 7-day auto-pause (see api/subscribe.js, which
// depends on the same project staying up).
module.exports = async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
    const { error } = await supabase.from('subscribers').select('id').limit(1);
    if (error) throw error;
    res.status(200).json({ ok: true, checkedAt: new Date().toISOString() });
  } catch (err) {
    console.error('keep-alive error', err);
    res.status(500).json({ error: 'Keep-alive check failed' });
  }
};
