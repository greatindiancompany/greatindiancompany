/**
 * Registry URLs are paired with briefs by rotation. A link is shown only when
 * its site is specifically associated with the brief's topic. Unmatched URLs
 * are omitted. This module does not invent replacement citations.
 */

const HOST_TOPICS = {
  'rbi.org.in': ['rbi', 'monetary', 'liquidity', 'banking', 'inflation', 'credit', 'payments', 'inclusion', 'trade', 'fx', 'state-finance'],
  'mof.gov.in': ['fiscal', 'budget', 'public-finance', 'state-finance'],
  'dea.gov.in': ['fiscal', 'budget', 'public-finance', 'state-finance'],
  'indiabudget.gov.in': ['fiscal', 'budget', 'public-finance'],
  'dpiit.gov.in': ['manufacturing', 'industrial'],
  'commerce.gov.in': ['trade', 'export'],
  'meity.gov.in': ['digital', 'ai', 'semiconductor', 'electronics', 'cybersecurity', 'digitalization'],
  'dot.gov.in': ['telecom', 'broadband', 'cybersecurity'],
  'mohfw.gov.in': ['healthcare', 'pharma'],
  'education.gov.in': ['education', 'skilling'],
  'mnre.gov.in': ['solar', 'hydrogen', 'energy'],
  'powermin.gov.in': ['energy', 'solar', 'power'],
  'moef.gov.in': ['climate', 'environment'],
  'morth.nic.in': ['logistics', 'freight'],
  'civilaviation.gov.in': ['aviation', 'tourism'],
  'shipmin.gov.in': ['ports', 'shipping'],
  'railministry.gov.in': ['rail', 'transit'],
  'irdai.gov.in': ['insurance'],
  'sebi.gov.in': ['ipo', 'markets'],
  'trai.gov.in': ['telecom', 'broadband'],
  'nsdcindia.org': ['skills', 'skilling', 'employment', 'workforce'],
  'skillindiadigital.gov.in': ['skills', 'skilling', 'employment', 'workforce'],
  'nabard.org': ['agri'],
  'sidbi.in': ['msme'],
  'digitalindia.gov.in': ['digital', 'digitalization'],
  'startupindia.gov.in': ['startup', 'venture'],
  'smartcities.gov.in': ['housing', 'urbanization'],
  'jalshakti-dowr.gov.in': ['water', 'sanitation'],
  'gst.gov.in': ['fiscal'],
  'iea.org': ['energy', 'solar', 'hydrogen', 'climate'],
  'ilo.org': ['employment', 'skills', 'workforce'],
};

function briefTokens(brief) {
  const tags = Array.isArray(brief?.tags) ? brief.tags : [];
  const cluster = typeof tags[0] === 'string' ? tags[0] : '';
  const title = typeof brief?.title === 'string' ? brief.title : '';
  return new Set(`${title} ${cluster}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

function topicMatches(tokens, topic) {
  return topic
    .toLowerCase()
    .split('-')
    .filter(Boolean)
    .every((part) => tokens.has(part));
}

export function citationHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export function isTopicalCitation(url, brief) {
  const host = citationHost(url);
  const topics = HOST_TOPICS[host];
  if (!topics) {
    return false;
  }

  const tokens = briefTokens(brief);
  return topics.some((topic) => topicMatches(tokens, topic));
}

export function filterTopicalSources(urls, brief) {
  if (!Array.isArray(urls)) {
    return [];
  }

  const kept = [];
  for (const url of urls) {
    if (typeof url !== 'string' || !isTopicalCitation(url, brief)) {
      continue;
    }
    if (!kept.includes(url)) {
      kept.push(url);
    }
  }
  return kept;
}

export function honestDescription(description) {
  if (typeof description !== 'string' || description.trim() === '') {
    return 'English template brief. This page does not verify sources.';
  }

  let next = description.trim();
  if (/^evidence-based analysis\b/i.test(next)) {
    return 'English template brief. This page does not verify sources or report a checked shift.';
  }

  next = next.replace(/\s+with primary-source links\.?$/i, '.');
  next = next.replace(/\s+using inputs from\s+.+$/i, '.');
  next = next.replace(/source-backed/gi, 'template');
  next = next.replace(/verifiable shifts/gi, 'notes');
  next = next.replace(/\s{2,}/g, ' ').replace(/\.\.+/g, '.').trim();
  return next;
}
