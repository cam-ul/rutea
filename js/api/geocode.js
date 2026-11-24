const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OPEN_METEO_GEO = 'https://geocoding-api.open-meteo.com/v1/search';

let lastNominatim = 0;

async function throttleNominatim() {
  const wait = 1100 - (Date.now() - lastNominatim);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastNominatim = Date.now();
}

async function geocodeNominatim(query, { countryCode } = {}) {
  await throttleNominatim();

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    addressdetails: '0',
  });
  if (countryCode) params.set('countrycodes', countryCode.toLowerCase());

  const res = await fetch(`${NOMINATIM}?${params}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'es',
    },
  });

  if (!res.ok) throw new Error(`Nominatim: ${res.status}`);
  const data = await res.json();
  if (!data?.length) return null;

  const hit = data[0];
  return {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    displayName: hit.display_name,
    source: 'nominatim',
  };
}

async function geocodeOpenMeteo(query, { countryCode } = {}) {
  const params = new URLSearchParams({
    name: query,
    count: '5',
    language: 'es',
    format: 'json',
  });

  const res = await fetch(`${OPEN_METEO_GEO}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo Geocoding: ${res.status}`);
  const data = await res.json();
  const results = data.results || [];
  if (!results.length) return null;

  const hit =
    (countryCode &&
      results.find((r) => r.country_code?.toUpperCase() === countryCode.toUpperCase())) ||
    results[0];

  return {
    lat: hit.latitude,
    lon: hit.longitude,
    displayName: [hit.name, hit.admin1, hit.country].filter(Boolean).join(', '),
    source: 'open-meteo-geo',
  };
}

export async function geocodePlace(query, opts = {}) {
  const q = query?.trim();
  if (!q) return null;

  try {
    const place = await geocodeNominatim(q, opts);
    if (place) return place;
  } catch {}

  try {
    return await geocodeOpenMeteo(q, opts);
  } catch {
    return null;
  }
}

export async function resolveCoords(country) {
  const capital = country.capital?.[0];
  const [fallbackLat, fallbackLon] = country.latlng || [];

  if (capital) {
    const place = await geocodePlace(capital, { countryCode: country.cca2 });
    if (place) {
      return {
        lat: place.lat,
        lon: place.lon,
        label: `${capital}, ${country.name?.common || ''}`.trim(),
        source: place.source,
      };
    }
  }

  if (fallbackLat != null && fallbackLon != null) {
    return {
      lat: fallbackLat,
      lon: fallbackLon,
      label: capital
        ? `${capital}, ${country.name?.common || ''}`.trim()
        : country.name?.common || 'Ubicación',
      source: 'countries-api',
    };
  }

  return null;
}
