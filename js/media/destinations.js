const BASE = 'assets/destinations';

const BY_CODE = {
  PT: `${BASE}/PT.jpg`,
  JP: `${BASE}/JP.jpg`,
  CO: `${BASE}/CO.jpg`,
  IS: `${BASE}/IS.jpg`,
  PE: `${BASE}/PE.jpg`,
  MA: `${BASE}/MA.jpg`,
  ES: `${BASE}/ES.jpg`,
  IT: `${BASE}/IT.jpg`,
  FR: `${BASE}/FR.jpg`,
  AR: `${BASE}/AR.jpg`,
  MX: `${BASE}/MX.jpg`,
  TH: `${BASE}/TH.jpg`,
  RU: `${BASE}/RU.jpg`,
  DE: `${BASE}/DE.jpg`,
  GB: `${BASE}/GB.jpg`,
  BR: `${BASE}/BR.jpg`,
  US: `${BASE}/US.jpg`,
  EG: `${BASE}/EG.jpg`,
  CN: `${BASE}/CN.jpg`,
  IN: `${BASE}/IN.jpg`,
  ID: `${BASE}/ID.jpg`,
  PK: `${BASE}/PK.jpg`,
  BD: `${BASE}/BD.jpg`,
  PH: `${BASE}/PH.jpg`,
  VN: `${BASE}/VN.jpg`,
  KR: `${BASE}/KR.jpg`,
  TR: `${BASE}/TR.jpg`,
  MY: `${BASE}/MY.jpg`,
};

const cache = new Map();
const pending = new Map();

function localImage(code) {
  if (!code) return null;
  return BY_CODE[String(code).toUpperCase()] || null;
}

function enlargeWikiThumb(url) {
  if (!url) return '';
  return url.replace(/\/\d+px-/, '/800px-');
}

function probeImage(url, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = '';
      resolve(false);
    }, timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
}

async function wikiImage(query) {
  const q = query?.trim();
  if (!q) return null;
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = await res.json();
  const src = data.originalimage?.source || data.thumbnail?.source;
  if (!src) return null;
  const enlarged = enlargeWikiThumb(src);
  const ok = await probeImage(enlarged);
  return ok ? enlarged : null;
}

// Cascada: local → Wikipedia (si el probe carga) → null (placeholder en UI)
export async function getDestinationImage(countryOrCode) {
  let code = '';
  let capital = '';
  let name = '';

  if (typeof countryOrCode === 'string') {
    code = countryOrCode.toUpperCase();
  } else if (countryOrCode) {
    code = (countryOrCode.cca2 || '').toUpperCase();
    capital = countryOrCode.capitalEn?.[0] || '';
    name = countryOrCode.name?.commonEn || countryOrCode.name?.common || '';
    if (!capital && countryOrCode.capital?.[0]) capital = countryOrCode.capital[0];
  }

  const cacheKey = code || name || capital;
  if (cacheKey && cache.has(cacheKey)) return cache.get(cacheKey);

  const local = localImage(code);
  if (local) {
    if (cacheKey) cache.set(cacheKey, local);
    return local;
  }

  if (cacheKey && pending.has(cacheKey)) return pending.get(cacheKey);

  const task = (async () => {
    const queries = [capital, name].filter(Boolean);
    for (const q of queries) {
      try {
        const img = await wikiImage(q);
        if (img) {
          cache.set(cacheKey, img);
          return img;
        }
      } catch {}
    }
    cache.set(cacheKey, null);
    return null;
  })();

  if (cacheKey) pending.set(cacheKey, task);
  try {
    return await task;
  } finally {
    pending.delete(cacheKey);
  }
}

// Solo assets locales (síncrono)
export function destinationImage(countryOrCode) {
  if (!countryOrCode) return null;
  if (typeof countryOrCode === 'string') return localImage(countryOrCode);
  return localImage(countryOrCode.cca2) || null;
}

export function hasDestinationImage(code) {
  return Boolean(localImage(code));
}

export function brandedPlaceholder(title = 'RUTEA') {
  const safe = String(title || 'RUTEA')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const short = safe.length > 32 ? `${safe.slice(0, 30)}…` : safe;

  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#081C38"/>
          <stop offset="100%" stop-color="#122B4D"/>
        </linearGradient>
      </defs>
      <rect fill="url(#bg)" width="800" height="450"/>
      <g transform="translate(268 110)">
        <g transform="translate(0 0) scale(0.78)">
          <path d="M32 70C32 70 8 46 8 30a24 24 0 0 1 48 0c0 16-24 40-24 40Z" fill="#122B4D" stroke="#2C4A75" stroke-width="1.5"/>
          <circle cx="32" cy="27" r="19" fill="none" stroke="#FF6B1A" stroke-width="6"/>
          <path d="M18 30 30 14l6 8 4-4 8 12Z" fill="#FF6B1A"/>
          <path d="M14 36 26 24l6 8 6-6 12 14c-4 8-10 16-18 24C24 62 16 48 14 36Z" fill="#081C38"/>
          <path d="M34 34c-8 3-6 8 0 10s8 6 0 12" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
        </g>
        <text x="68" y="42" fill="#FFFFFF" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="34" font-weight="800" letter-spacing="3">RUTEA</text>
        <rect x="68" y="50" width="136" height="3.5" rx="2" fill="#FF6B1A"/>
      </g>
      <text x="400" y="275" text-anchor="middle" fill="#FFE2CE" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="38" font-weight="700">${short}</text>
    </svg>`
  )}`;
}

/** @deprecated usar brandedPlaceholder */
export function placeholderImageDataUri(title) {
  return brandedPlaceholder(title || 'RUTEA');
}

// onerror → placeholder; una sola vez por img
export function bindPhotoFallback(root = document, titleAttr = 'alt') {
  root.querySelectorAll('img.photo, img.photo-wide').forEach((img) => {
    if (img.dataset.fallbackBound) return;
    img.dataset.fallbackBound = '1';
    img.addEventListener('error', () => {
      const title = img.getAttribute(titleAttr) || img.alt || 'RUTEA';
      img.src = brandedPlaceholder(title);
    });
  });
}
