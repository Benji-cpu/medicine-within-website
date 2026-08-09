function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const { EVENTS_URL, HIPSY_PAGE_URL } = require('./hipsyEvents');
const INTEGRATION_URL = 'https://www.medicinewithin.nl/mentorship/integration.html';

// Rendered from live Hipsy data at send time, so a guide downloaded in November
// never invites anyone to an August temple. Empty list degrades to the events
// page rather than dropping the invitation.
function buildEventsBlock(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return `
          <p style="font-size: 16px; line-height: 1.7; color: #2C2825; margin: 0 0 8px;">
            <a href="${EVENTS_URL}" style="color: #209d9d;">See what's coming next &rarr;</a>
          </p>`;
  }

  const rows = events
    .map((e) => {
      // The Threshold workshop runs the same evening as the temple and is the
      // gentler way in. Shown under it, never instead of it.
      const also = e.alsoTitle
        ? `
                <br><span style="font-size: 13px; color: #6B6560;">New to this? Begin earlier that day with
                <a href="${escapeHtml(e.alsoUrl)}" style="color: #6B6560;">${escapeHtml(e.alsoTitle)}</a></span>`
        : '';
      return `
            <tr>
              <td style="padding: 8px 0; font-size: 15px; line-height: 1.6; color: #2C2825;">
                <span style="color: #6B6560;">${escapeHtml(e.date)}</span>&nbsp;&nbsp;
                <a href="${escapeHtml(e.url)}" style="color: #209d9d; text-decoration: none;">${escapeHtml(e.title)}</a>${also}
              </td>
            </tr>`;
    })
    .join('');

  return `
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0 0 16px;">${rows}
          </table>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
            <a href="${HIPSY_PAGE_URL}" style="color: #6B6560;">Every date, all in one place &rarr;</a>
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #2C2825; margin: 0;">
            And if a room full of people is not where you want to start, we can work
            one to one instead. <a href="${INTEGRATION_URL}" style="color: #209d9d;">That's here</a>.
            Your body knows which one it is.
          </p>`;
}

function buildWelcomeEmail({ firstName, leadMagnet, events = [] }) {
  const safeFirstName = escapeHtml(firstName);
  const html = `
    <div style="font-family: Georgia, serif; background: #f9f2ed; padding: 40px 20px;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #3d1f27; padding: 32px 40px;">
          <p style="color: #ffffff; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">Medicine Within</p>
        </div>
        <div style="padding: 40px;">
          <p style="font-size: 18px; color: #2C2825; margin: 0 0 24px;">Beloved ${safeFirstName},</p>

          <p style="font-size: 16px; line-height: 1.7; color: #2C2825; margin: 0 0 24px;">
            Here it is. Five practices. Ten minutes each, less if that's all you have today.
          </p>

          <p style="text-align: center; margin: 32px 0;">
            <a href="${leadMagnet.downloadUrl}" style="display: inline-block; background: #209d9d; color: #ffffff; text-decoration: none; font-size: 14px; letter-spacing: 0.05em; padding: 14px 32px; border-radius: 24px;">
              ${escapeHtml(leadMagnet.name)}
            </a>
          </p>

          <p style="font-size: 16px; line-height: 1.7; color: #2C2825; margin: 0 0 24px;">
            Do the first one tonight. Don't read all five. The body doesn't learn by reading.
          </p>

          <p style="font-size: 16px; line-height: 1.7; color: #2C2825; margin: 0 0 32px;">
            And if something moves while you're practising, tell me. Just reply. I'm here for you.
          </p>

          <p style="font-size: 16px; line-height: 1.7; color: #2C2825; margin: 0 0 4px;">
            With wild love &amp; devotion,<br>Sandi
          </p>

          <div style="border-top: 1px solid #EDE4DC; margin: 32px 0 24px;"></div>

          <p style="font-size: 15px; line-height: 1.7; color: #2C2825; margin: 0 0 16px;">
            P.S. I gather people in Amsterdam every month. Temple, circle, ceremony.
            When you're ready to do this in a room instead of alone, that's where I'll be.
          </p>
${buildEventsBlock(events)}
        </div>
      </div>
    </div>
  `;

  return {
    subject: leadMagnet.subject,
    html,
  };
}

function buildNotificationEmail({ firstName, lastName, phone, country, email, leadMagnet }) {
  const safeFirstName = escapeHtml(firstName);
  const safeLastName = lastName ? escapeHtml(lastName) : '';
  const safeEmail = escapeHtml(email);
  const fullName = safeLastName ? `${safeFirstName} ${safeLastName}` : safeFirstName;
  const extraLines = [
    phone ? `Phone: ${escapeHtml(phone)}` : null,
    country ? `Country: ${escapeHtml(country)}` : null,
  ].filter(Boolean);
  const html = `
    <div style="font-family: Georgia, serif; background: #f9f2ed; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px;">
        <p style="font-size: 16px; color: #2C2825; margin: 0 0 16px;">
          New subscriber for <strong>${leadMagnet.name}</strong>:
        </p>
        <p style="font-size: 16px; line-height: 1.7; color: #2C2825; margin: 0;">
          ${fullName}<br>
          <a href="mailto:${safeEmail}" style="color: #209d9d;">${safeEmail}</a>
          ${extraLines.length ? `<br>${extraLines.join('<br>')}` : ''}
        </p>
      </div>
    </div>
  `;

  return {
    // Plain-text email header, not interpolated into HTML - left unescaped on purpose
    subject: `New subscriber: ${firstName}${lastName ? ' ' + lastName : ''} wants ${leadMagnet.name}`,
    html,
  };
}

module.exports = { buildWelcomeEmail, buildNotificationEmail };
