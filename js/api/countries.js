import { capitalNameEs, countryNameEs } from '../i18n/es.js';

const BASE = 'https://countries.dev';

async function getJson(url) {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Countries API: ${res.status}`);
  return res.json();
}

export function normalizeCountry(raw) {
  if (!raw) return null;

  const languages = Array.isArray(raw.languages)
    ? Object.fromEntries(raw.languages.map((l) => [l.iso639_1 || l.name, l.name]))
    : raw.languages && typeof raw.languages === 'object' && !Array.isArray(raw.languages)
      ? raw.languages
      : {};

  const currencies = Array.isArray(raw.currencies)
    ? Object.fromEntries(raw.currencies.map((c) => [c.code, { name: c.name, symbol: c.symbol }]))
    : raw.currencies && typeof raw.currencies === 'object'
      ? raw.currencies
      : {};

  const capitalRaw = Array.isArray(raw.capital)
    ? raw.capital
    : raw.capital
      ? [raw.capital]
      : [];
  const capital = capitalRaw.map((c) => capitalNameEs(c));

  const code = raw.alpha2Code || raw.cca2 || '';
  const nameCommonEn =
    typeof raw.name === 'string' ? raw.name : raw.name?.common || raw.name?.official || '';
  const nameCommon = countryNameEs(code, nameCommonEn);
  const officialEn =
    typeof raw.name === 'object' ? raw.name?.official || nameCommonEn : raw.nativeName || nameCommonEn;

  return {
    cca2: code,
    cca3: raw.alpha3Code || raw.cca3 || '',
    name: {
      common: nameCommon,
      official: countryNameEs(code, officialEn),
      commonEn: nameCommonEn,
    },
    capital,
    capitalEn: capitalRaw,
    region: raw.region || '',
    subregion: raw.subregion || '',
    population: raw.population ?? null,
    languages,
    currencies,
    flags: raw.flags || {},
    flag: raw.flag || '',
    latlng: raw.latlng || [],
  };
}

function normalizeList(data) {
  if (!data) return [];
  const list = Array.isArray(data) ? data : [data];
  return list.map(normalizeCountry).filter(Boolean);
}

// ES → término que acepta countries.dev
const SEARCH_ALIASES = {
  egipto: 'Egypt',
  japón: 'Japan',
  japon: 'Japan',
  españa: 'Spain',
  espana: 'Spain',
  reino: 'United Kingdom',
  'reino unido': 'United Kingdom',
  estados: 'United States',
  'estados unidos': 'United States',
  eeuu: 'United States',
  brasil: 'Brazil',
  méxico: 'Mexico',
  mexico: 'Mexico',
  perú: 'Peru',
  peru: 'Peru',
  marruecos: 'Morocco',
  islandia: 'Iceland',
  tailandia: 'Thailand',
  rusia: 'Russia',
  alemania: 'Germany',
  italia: 'Italy',
  francia: 'France',
  portugal: 'Portugal',
  colombia: 'Colombia',
  argentina: 'Argentina',
};

export async function searchByName(query) {
  const q = query?.trim();
  if (!q) return [];
  const alias = SEARCH_ALIASES[q.toLowerCase()];
  const data =
    (await getJson(`${BASE}/name/${encodeURIComponent(alias || q)}`)) ||
    (alias ? null : await getJson(`${BASE}/name/${encodeURIComponent(q)}`));
  return normalizeList(data);
}

export async function getByRegion(region) {
  const r = region?.trim();
  if (!r) return [];
  const data = await getJson(`${BASE}/region/${encodeURIComponent(r)}`);
  return normalizeList(data);
}

export async function getByCode(code) {
  const c = code?.trim();
  if (!c) return null;
  const data = await getJson(`${BASE}/alpha/${encodeURIComponent(c)}`);
  if (!data) return null;
  return normalizeCountry(Array.isArray(data) ? data[0] : data);
}

export async function getByCodes(codes) {
  const list = codes.filter(Boolean);
  const results = await Promise.all(list.map((code) => getByCode(code)));
  return results.filter(Boolean);
}

export async function getFeatured() {
  return getByCodes(['PT', 'JP', 'CO']);
}

export async function exploreDestinations({ q = '', region = '' } = {}) {
  const query = q.trim();
  const reg = region.trim();

  if (query) {
    let results = await searchByName(query);
    if (reg) results = results.filter((c) => c.region === reg);
    return results.sort((a, b) => a.name.common.localeCompare(b.name.common, 'es'));
  }

  if (reg) {
    const results = await getByRegion(reg);
    return results
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 24);
  }

  return getByCodes(['PT', 'JP', 'CO', 'IS', 'PE', 'MA', 'ES', 'IT', 'FR', 'AR', 'MX', 'TH']);
}
