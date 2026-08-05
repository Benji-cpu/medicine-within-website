// Maps Hipsy event IDs (the numeric prefix in hipsy.nl/event/{id}-{slug}) to a
// human-readable offer name, for classifying which offer a tracked link click
// belongs to. Slugs drift over time (the same event ID gets re-titled), so
// classification matches on the numeric ID extracted from the URL, never the
// full slug string.
//
// Update this list whenever a new event goes live and its Hipsy link starts
// appearing in a ConvertKit broadcast - the click webhook only classifies IDs
// present here, everything else falls through as "unclassified".
const HIPSY_EVENT_MAP = {
  156215: 'Kambo Ceremony',
  198567: 'Embodied Tantra Weekend Training',
  198566: 'Deeper Intimacy Advanced Tantrik Temple',
  196455: 'Kambo Ceremony',
  196456: 'Kambo Ceremony',
  232545: 'The Art of Embodied Connection (Homecoming)',
  228092: 'Temple of Euphoria',
  196458: 'Kambo Ceremony',
  168401: 'Sacred Feminine Embodiment Retreat',
  196460: 'Kambo Ceremony',
  234551: 'The Art of Embodied Connection (The Unmasking)',
  234554: 'Dark Eros: A Tantrik Temple of Grief & Longing',
  196461: 'Kambo Ceremony',
  196462: 'Kambo Ceremony',
  198574: 'Embodied Tantra Weekend Training',
  198573: 'Deeper Intimacy Advanced Tantrik Temple',
  196464: 'Kambo Ceremony',
  196465: 'Kambo Ceremony',
  196470: 'Kambo Ceremony',
  234575: 'The Art of Embodied Connection (Being Received)',
  234590: 'Dark Eros: A Tantrik Temple of Grief & Longing',
};

function extractHipsyEventId(url) {
  const match = /hipsy\.nl\/event\/(\d+)-/i.exec(url || '');
  return match ? Number(match[1]) : null;
}

function classifyLink(url) {
  const id = extractHipsyEventId(url);
  if (id === null) return { hipsyEventId: null, offerName: null };
  return { hipsyEventId: id, offerName: HIPSY_EVENT_MAP[id] || null };
}

module.exports = { HIPSY_EVENT_MAP, extractHipsyEventId, classifyLink };
