function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildWelcomeEmail({ firstName, leadMagnet }) {
  const safeFirstName = escapeHtml(firstName);
  const html = `
    <div style="font-family: Georgia, serif; background: #f9f2ed; padding: 40px 20px;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <div style="background: #3d1f27; padding: 32px 40px;">
          <p style="color: #ffffff; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">Medicine Within</p>
        </div>
        <div style="padding: 40px;">
          <p style="font-size: 18px; color: #2C2825; margin: 0 0 16px;">Hi ${safeFirstName},</p>
          <p style="font-size: 16px; line-height: 1.7; color: #2C2825; margin: 0 0 24px;">
            Thank you for requesting <strong>${leadMagnet.name}</strong>. Your copy is ready below.
          </p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${leadMagnet.downloadUrl}" style="display: inline-block; background: #209d9d; color: #ffffff; text-decoration: none; font-size: 14px; letter-spacing: 0.05em; padding: 14px 32px; border-radius: 24px;">
              Download ${leadMagnet.name}
            </a>
          </p>
          <p style="font-size: 14px; line-height: 1.7; color: #6B6560; margin: 24px 0 0;">
            With gratitude,<br>Medicine Within
          </p>
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
