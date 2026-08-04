// Subscribes an email to a ConvertKit tag (creates or updates the subscriber
// and applies the tag in one call). Uses the legacy v3 API - see memory
// convertkit_api.md: the v4 API rejects the stored keys, v3 works.
async function subscribeToConvertKit({ apiSecret, tagId, email, firstName, fields }) {
  const response = await fetch(`https://api.convertkit.com/v3/tags/${tagId}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      api_secret: apiSecret,
      email,
      first_name: firstName,
      ...(fields ? { fields } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ConvertKit tag subscribe failed (${response.status}): ${body}`);
  }

  return response.json();
}

module.exports = { subscribeToConvertKit };
