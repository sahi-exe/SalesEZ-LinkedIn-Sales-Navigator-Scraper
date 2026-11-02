const LEAD_HEADERS = ['Name', 'Job Title', 'Company', 'Company URL', 'Location', 'Profile URL'];

const SCRUB_EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2A00}-\u{2AFF}\u{2B05}-\u{2B07}\u{25A0}-\u{25FF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{1F1E6}-\u{1F1FF}\u{2022}\u{00B7}\u{2023}\u{2027}\u{2212}\u{203C}\u{2049}\u{2122}\u{2139}\u{2695}\u{269B}\u{2714}\u{2716}\u{2744}\u{2747}\u{26A0}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BF}\u{26C4}-\u{26CD}\u{26CE}\u{26CF}\u{26D1}-\u{26D3}\u{26D4}-\u{26E1}\u{26E3}-\u{26E4}\u{26E7}-\u{26FF}]+/gu;

const SCRUB_PRONOUNS_RE = /[\(\[]?\s*\b(?:he|him|his|she|her|hers|they|them|theirs|ze|hir)\b(?:\s*\/\s*\b(?:he|him|his|she|her|hers|they|them|theirs|ze|hir)\b)+\.?\s*[\)\]]?/gi;

const SCRUB_LEGAL_SUFFIX_RE = /\s+(?:(?:inc|llc|llp|ltd|limited|gmbh|corp|corporation|co|plc|s\.?a\.?|s\.?r\.?l\.?|kg|sp\.?\s*z\s*o\.?\s*o\.?|lp|co-op|cooperative|pty\.?\s*ltd\.?|pvt\.?\s*ltd\.?|jsc|ial|as|ab|ag|bv|nv)\b\.?)+$/i;

const SCRUB_TITLE_STOPWORDS = new Set([
  'the', 'of', 'de', 'van', 'von', 'der', 'den', 'und', 'and', 'for', 'at', 'in', 'on',
  'für', 'fyr', 'à', 'el', 'di', 'da', 'la', 'le', 'les', 'del', 'della', 'al', 'et', 'ov',
  'iz', 'na', 'za', 'od', 'do', 'dos', 'das', 'du', 'la'
]);

const SCRUB_ACRONYMS = new Set([
  'CEO', 'CTO', 'CFO', 'COO', 'CMO', 'CPO', 'CRO', 'CISO', 'CLEO', 'CHRO', 'VP', 'SVP',
  'AVP', 'GM', 'HR', 'IT', 'MBA', 'PHD', 'CA', 'CPA', 'USA', 'US', 'UK', 'EU', 'AI', 'ML',
  'LLC', 'APAC', 'EMEA', 'LATAM', 'USMC', 'NATO'
]);

function scrubCleanSpaces(str) {
  if (!str) return '';
  return String(str).replace(/[\p{Z}\t\r\n\u00A0]+/gu, ' ').trim();
}

function stripEmoji(str) {
  if (!str) return '';
  return String(str).replace(SCRUB_EMOJI_RE, '');
}

function stripPronouns(str) {
  if (!str) return '';
  const cleaned = String(str)
    .replace(SCRUB_PRONOUNS_RE, ' ')
    .replace(/[\(\[\{]\s*[\)\]\}]/g, ' ');
  return scrubCleanSpaces(cleaned).replace(/^[,;:\/|]+|[,;:\/|]+$/g, '').trim();
}

function scrubTitleSegment(segment) {
  const core = segment.replace(/^[^A-Za-z0-9]+/, '').replace(/[^A-Za-z0-9]+$/, '');
  if (!core) return segment;
  const upper = core.toUpperCase();
  if (SCRUB_ACRONYMS.has(upper)) return upper === 'PHD' ? 'PhD' : upper;
  const shout = /^[^a-z]*$/.test(core) && /[A-Z]/.test(core) && /[A-Za-z]{3,}/.test(core);
  const lower = core.toLowerCase();
  if (shout) return lower.charAt(0).toUpperCase() + lower.slice(1);
  return core.charAt(0).toUpperCase() + core.slice(1);
}

function toTitleCase(str) {
  if (!str) return '';
  const trimmed = scrubCleanSpaces(String(str));
  if (!trimmed) return '';
  const words = trimmed.split(' ');
  let wordIndex = 0;
  return words
    .map((w) => {
      if (!w) return w;
      const isFirstWord = wordIndex === 0;
      wordIndex += 1;
      const parts = w.split(/([-'’])/);
      let firstPart = true;
      return parts
        .map((part) => {
          if (part === '-' || part === "'" || part === '’') return part;
          const core = part.replace(/^[^A-Za-z0-9]+/, '').replace(/[^A-Za-z0-9]+$/, '');
          if (!core) return part;
          const lower = core.toLowerCase();
          if (!isFirstWord && firstPart && core.length <= 4 && SCRUB_TITLE_STOPWORDS.has(lower)) {
            firstPart = false;
            return lower;
          }
          firstPart = false;
          return scrubTitleSegment(part);
        })
        .join('');
    })
    .join(' ');
}

function cleanCompanyName(str) {
  if (!str) return '';
  let s = scrubCleanSpaces(stripEmoji(String(str)));
  for (let pass = 0; pass < 3; pass++) {
    if (!s) break;
    const next = s.replace(SCRUB_LEGAL_SUFFIX_RE, '');
    if (next === s) break;
    s = next;
  }
  return s.replace(/[\s.,;:()\[\]\-]+$/, '');
}

function sanitizeHttpUrl(url) {
  const value = String(url === undefined || url === null ? '' : url).trim();
  if (!value) return '';
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    return value;
  } catch (_) {
    return '';
  }
}

function sanitizeSpreadsheetCell(val) {
  const value = val === undefined || val === null ? '' : String(val);
  if (!value) return '';
  if (/^[\t\r]/.test(value)) return "'" + value;
  const first = value.match(/\S/);
  if (first && /^[=+\-@]/.test(first[0])) return "'" + value;
  return value;
}

function scrubLead(lead) {
  if (!lead) return lead;
  const name = toTitleCase(stripEmoji(stripPronouns(lead.name || '')));
  const company = cleanCompanyName(lead.company || '');
  const jobTitle = scrubCleanSpaces(stripEmoji(lead.jobTitle || ''));
  const location = scrubCleanSpaces(stripEmoji(lead.location || ''));
  const companyUrl = sanitizeHttpUrl(lead.companyUrl);
  const profileUrl = sanitizeHttpUrl(lead.profileUrl);
  return Object.assign({}, lead, { name, company, jobTitle, location, companyUrl, profileUrl });
}

function scrubLeads(leads) {
  return (Array.isArray(leads) ? leads : []).map(scrubLead);
}
