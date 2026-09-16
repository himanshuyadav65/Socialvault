/**
 * Shared HTML Entity & Unicode Decoder
 * Accurately decodes Hindi (Devanagari), emojis, single/double quotes,
 * decimal (&#039;, &#2319;) and hex (&#x90f;, &#x1F525;) entities.
 */

const namedEntities = {
  'amp': '&',
  'quot': '"',
  'apos': "'",
  'lt': '<',
  'gt': '>',
  'nbsp': ' ',
  'copy': '©',
  'reg': '®',
  'trade': '™',
  'hellip': '…',
  'mdash': '—',
  'ndash': '–',
  'ldquo': '“',
  'rdquo': '”',
  'lsquo': '‘',
  'rsquo': '’',
  'bull': '•',
  'middot': '·',
  'permil': '‰',
  'prime': '′',
  'Prime': '″',
  'hearts': '♥',
  'clubs': '♣',
  'diams': '♦',
  'spades': '♠'
};

function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  let prev = '';
  let curr = str;
  let iterations = 0;

  while (curr !== prev && iterations < 4) {
    prev = curr;
    iterations++;

    // Hex entities: &#x90f;, &#X1F525;, etc.
    curr = curr.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => {
      try {
        const cp = parseInt(hex, 16);
        return (cp >= 0 && cp <= 0x10FFFF) ? String.fromCodePoint(cp) : match;
      } catch (e) {
        return match;
      }
    });

    // Decimal entities: &#039;, &#128293;, &#10;, etc.
    curr = curr.replace(/&#([0-9]+);/g, (match, dec) => {
      try {
        const cp = parseInt(dec, 10);
        return (cp >= 0 && cp <= 0x10FFFF) ? String.fromCodePoint(cp) : match;
      } catch (e) {
        return match;
      }
    });

    // Named entities
    curr = curr.replace(/&([a-zA-Z]+);/g, (match, name) => {
      const lower = name.toLowerCase();
      return namedEntities[lower] !== undefined ? namedEntities[lower] : match;
    });
  }

  return curr;
}

function cleanSocialHandle(name, fallback = 'creator') {
  if (!name || typeof name !== 'string') return `@${fallback}`;
  const decoded = decodeHtmlEntities(name).trim();
  if (decoded.startsWith('@') && /^[a-zA-Z0-9._]{2,30}$/.test(decoded.slice(1))) {
    return decoded;
  }
  // Remove quotes/apostrophes so e.g. "Student's" doesn't become "student039s" or "student_s"
  const withoutQuotes = decoded.replace(/['’"“”`]/g, '');
  // Extract Latin characters for handle (e.g. "National Students Union" -> "nationalstudentsunion")
  const latinOnly = withoutQuotes.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
  if (latinOnly && latinOnly.length >= 2) {
    return `@${latinOnly}`;
  }
  return `@${fallback}`;
}

module.exports = {
  decodeHtmlEntities,
  cleanSocialHandle
};
