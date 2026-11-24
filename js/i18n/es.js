const regionNames =
  typeof Intl !== 'undefined' && Intl.DisplayNames
    ? new Intl.DisplayNames(['es'], { type: 'region' })
    : null;

const CAPITAL_ES = {
  Lisbon: 'Lisboa',
  Tokyo: 'Tokio',
  Bogotá: 'Bogotá',
  Reykjavík: 'Reikiavik',
  Lima: 'Lima',
  Rabat: 'Rabat',
  Madrid: 'Madrid',
  Rome: 'Roma',
  Paris: 'París',
  'Buenos Aires': 'Buenos Aires',
  'Mexico City': 'Ciudad de México',
  Bangkok: 'Bangkok',
  Moscow: 'Moscú',
  Berlin: 'Berlín',
  London: 'Londres',
  Brasília: 'Brasilia',
  Brasilia: 'Brasilia',
  'Washington, D.C.': 'Washington D. C.',
  Cairo: 'El Cairo',
};

export function countryNameEs(code, fallback = '') {
  const c = String(code || '').toUpperCase();
  if (c && regionNames) {
    try {
      const label = regionNames.of(c);
      if (label) return label;
    } catch {
      /* DisplayNames.of falla con códigos raros */
    }
  }
  return fallback || c;
}

export function capitalNameEs(name) {
  if (!name) return '';
  return CAPITAL_ES[name] || name;
}
