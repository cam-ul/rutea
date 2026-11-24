import { countryNameEs } from './i18n/es.js';

export const EXPERIENCES = [
  { value: 'ciudad', label: 'Ciudad y cultura' },
  { value: 'naturaleza', label: 'Naturaleza' },
  { value: 'playa', label: 'Playa y relax' },
  { value: 'aventura', label: 'Aventura' },
];

export const CLIMATES = [
  { value: 'calido', label: 'Cálido' },
  { value: 'templado', label: 'Templado' },
  { value: 'frio', label: 'Frío' },
];

// Orígenes usados para estimar alcance y mínimos de presupuesto
export const ORIGINS = [
  { code: 'CO', region: 'Americas' },
  { code: 'MX', region: 'Americas' },
  { code: 'AR', region: 'Americas' },
  { code: 'ES', region: 'Europe' },
  { code: 'PE', region: 'Americas' },
  { code: 'US', region: 'Americas' },
  { code: 'BR', region: 'Americas' },
  { code: 'CL', region: 'Americas' },
].map((o) => ({ ...o, label: countryNameEs(o.code, o.code) }));

const CATALOG = [
  { code: 'PT', region: 'Europe', climate: 'templado', experience: 'ciudad', budget: 'medio', duration: 'corto', minBudget: 700, minDays: 4, blurb: 'Capital atlántica compacta, ideal para una primera ruta urbana.' },
  { code: 'ES', region: 'Europe', climate: 'templado', experience: 'ciudad', budget: 'medio', duration: 'medio', minBudget: 650, minDays: 4, blurb: 'Ciudades y costa en distancias cortas; buen equilibrio costo/experiencia.' },
  { code: 'IT', region: 'Europe', climate: 'templado', experience: 'ciudad', budget: 'medio', duration: 'medio', minBudget: 800, minDays: 5, blurb: 'Arte, comida y trenes; encaja bien en una o dos semanas.' },
  { code: 'FR', region: 'Europe', climate: 'templado', experience: 'ciudad', budget: 'alto', duration: 'medio', minBudget: 900, minDays: 5, blurb: 'Cultura urbana densa; presupuesto un poco más holgado ayuda.' },
  { code: 'IS', region: 'Europe', climate: 'frio', experience: 'naturaleza', budget: 'alto', duration: 'corto', minBudget: 1100, minDays: 4, blurb: 'Paisaje extremo y clima fresco; perfecto en pocos días intensos.' },
  { code: 'JP', region: 'Asia', climate: 'templado', experience: 'ciudad', budget: 'alto', duration: 'largo', minBudget: 1400, minDays: 10, blurb: 'Ciudades, templos y tren; rinde más con al menos dos semanas.' },
  { code: 'TH', region: 'Asia', climate: 'calido', experience: 'playa', budget: 'bajo', duration: 'medio', minBudget: 900, minDays: 7, blurb: 'Clima cálido y costos contenidos para playa o islas.' },
  { code: 'MA', region: 'Africa', climate: 'calido', experience: 'aventura', budget: 'bajo', duration: 'corto', minBudget: 700, minDays: 4, blurb: 'Mercados, desierto y medinas; viaje corto con contraste.' },
  { code: 'PE', region: 'Americas', climate: 'templado', experience: 'aventura', budget: 'medio', duration: 'medio', minBudget: 500, minDays: 5, blurb: 'Andes y costa; ruta con componente aventura y cultura.' },
  { code: 'CO', region: 'Americas', climate: 'calido', experience: 'naturaleza', budget: 'bajo', duration: 'medio', minBudget: 250, minDays: 3, blurb: 'Clima cálido, naturaleza y ciudades a buen precio.' },
  { code: 'MX', region: 'Americas', climate: 'calido', experience: 'playa', budget: 'medio', duration: 'medio', minBudget: 450, minDays: 5, blurb: 'Playas y cultura; flexible en presupuesto moderado.' },
  { code: 'AR', region: 'Americas', climate: 'templado', experience: 'naturaleza', budget: 'medio', duration: 'largo', minBudget: 550, minDays: 7, blurb: 'Distancias amplias; mejor con más días para combinar ciudad y paisaje.' },
  { code: 'BR', region: 'Americas', climate: 'calido', experience: 'playa', budget: 'medio', duration: 'largo', minBudget: 550, minDays: 7, blurb: 'Costa y ciudades grandes; aprovecha una estancia más larga.' },
  { code: 'EG', region: 'Africa', climate: 'calido', experience: 'aventura', budget: 'bajo', duration: 'corto', minBudget: 900, minDays: 5, blurb: 'Historia y clima seco; buen destino corto si el presupuesto cubre el traslado.' },
  { code: 'US', region: 'Americas', climate: 'templado', experience: 'ciudad', budget: 'alto', duration: 'largo', minBudget: 1200, minDays: 7, blurb: 'Ciudades y parques; suele pedir más presupuesto y días.' },
  { code: 'GB', region: 'Europe', climate: 'frio', experience: 'ciudad', budget: 'alto', duration: 'corto', minBudget: 900, minDays: 4, blurb: 'Clima fresco y museos; ideal para un city break.' },
  { code: 'DE', region: 'Europe', climate: 'frio', experience: 'ciudad', budget: 'medio', duration: 'corto', minBudget: 750, minDays: 4, blurb: 'Ciudades conectadas y clima fresco; fácil de hacer en pocos días.' },
  { code: 'RU', region: 'Europe', climate: 'frio', experience: 'ciudad', budget: 'medio', duration: 'medio', minBudget: 900, minDays: 6, blurb: 'Invierno marcado y capitales densas; mejor con varias jornadas.' },
];

const REACH_MIN = {
  local: { budget: 80, days: 1 },
  regional: { budget: 350, days: 3 },
  longhaul: { budget: 800, days: 5 },
};

function originRegion(code) {
  const hit = ORIGINS.find((o) => o.code === code) || CATALOG.find((c) => c.code === code);
  return hit?.region || '';
}

export function travelReach(originCode, dest) {
  const origin = String(originCode || '').toUpperCase();
  const destCode = typeof dest === 'string' ? dest : dest?.code;
  if (origin && destCode && origin === destCode) return 'local';
  const oRegion = originRegion(origin);
  const dRegion = typeof dest === 'object' ? dest.region : CATALOG.find((c) => c.code === destCode)?.region;
  if (oRegion && dRegion && oRegion === dRegion) return 'regional';
  return 'longhaul';
}

function effectiveMinimums(entry, reach) {
  const base = REACH_MIN[reach] || REACH_MIN.longhaul;
  if (reach === 'local') {
    return {
      budget: Math.min(entry.minBudget, 200),
      days: Math.min(entry.minDays, 2),
    };
  }
  if (reach === 'regional') {
    return {
      budget: Math.max(base.budget, Math.round(entry.minBudget * 0.65)),
      days: Math.max(base.days, Math.round(entry.minDays * 0.7)),
    };
  }
  return {
    budget: Math.max(base.budget, entry.minBudget),
    days: Math.max(base.days, entry.minDays),
  };
}

function blurbForReach(entry, reach, originCode) {
  const destName = countryNameEs(entry.code, entry.code);
  const originName = countryNameEs(originCode, originCode);
  if (reach === 'local') {
    return `Viaje dentro de ${destName}: con poco presupuesto y pocos días puedes armar una ruta regional (ciudades cercanas, naturaleza o costa) sin vuelo intercontinental.`;
  }
  if (reach === 'regional') {
    return `Desde ${originName}, ${destName} es un salto regional. ${entry.blurb}`;
  }
  return `Desde ${originName}, llegar a ${destName} implica vuelo largo: el presupuesto debe cubrir traslado y estancia. ${entry.blurb}`;
}

function budgetTier(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 'medio';
  if (n <= 900) return 'bajo';
  if (n <= 2000) return 'medio';
  return 'alto';
}

function durationTier(days) {
  const n = Number(days);
  if (!Number.isFinite(n) || n <= 0) return 'medio';
  if (n <= 5) return 'corto';
  if (n <= 14) return 'medio';
  return 'largo';
}

function scoreEntry(entry, prefs, reach) {
  let score = 0;
  if (entry.climate === prefs.climate) score += 3;
  if (entry.experience === prefs.experience) score += 3;
  if (entry.budget === prefs.budget) score += 2;
  else if (
    (prefs.budget === 'alto' && entry.budget !== 'alto') ||
    (prefs.budget === 'medio' && entry.budget === 'bajo')
  ) {
    score += 1;
  }
  if (entry.duration === prefs.duration) score += 2;
  else if (
    (prefs.duration === 'largo' && entry.duration === 'medio') ||
    (prefs.duration === 'medio' && entry.duration === 'corto')
  ) {
    score += 1;
  }

  if (reach === 'local') score += 4;
  else if (reach === 'regional') score += 2;

  const mins = effectiveMinimums(entry, reach);
  if (prefs.amount < mins.budget) score -= 5;
  if (prefs.days < mins.days) score -= 4;
  if (prefs.amount >= mins.budget && prefs.days >= mins.days) score += 2;

  return score;
}

// errors bloquean el submit; warnings solo avisan
export function validateRecommendPrefs(prefs) {
  const amount = Number(prefs.presupuesto);
  const days = Number(prefs.dias);
  const errors = [];
  const warnings = [];

  if (!prefs.origen) errors.push('Indica desde qué país sales.');
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('Indica un presupuesto en USD.');
  } else if (amount < 50) {
    errors.push('Presupuesto demasiado bajo para sugerir un viaje.');
  } else if (amount < 200) {
    warnings.push(
      'Presupuesto muy corto: priorizamos destinos cercanos o un viaje dentro de tu propio país. Un salto intercontinental (p. ej. Egipto desde Colombia) no es realista con este monto.'
    );
  } else if (amount < 500) {
    warnings.push(
      'Presupuesto ajustado: encajan mejor rutas locales o regionales. Destinos lejanos pedirán más margen.'
    );
  }

  if (!Number.isFinite(days) || days < 1) {
    errors.push('Indica al menos 1 día de duración.');
  } else if (days === 1) {
    warnings.push(
      'Con 1 día solo tiene sentido un plan muy local (misma ciudad o alrededores). No sugerimos destinos que requieran vuelo largo.'
    );
  } else if (days < 3) {
    warnings.push('Pocos días: priorizamos destinos cercanos o city breaks cortos.');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function suggestDestinations(prefs) {
  const climate = prefs.clima || 'templado';
  const experience = prefs.experiencia || 'ciudad';
  const amount = Number(prefs.presupuesto) || 0;
  const days = Number(prefs.dias) || 0;
  const origin = String(prefs.origen || 'CO').toUpperCase();
  const budget = prefs.budget || budgetTier(amount);
  const duration = prefs.duration || durationTier(days);

  const ranked = CATALOG.map((entry) => {
    const reach = travelReach(origin, entry);
    const mins = effectiveMinimums(entry, reach);
    const feasible = amount >= mins.budget && days >= mins.days;
    const score = scoreEntry(entry, { climate, experience, budget, duration, amount, days }, reach);
    return {
      ...entry,
      reach,
      score,
      feasible,
      minBudget: mins.budget,
      minDays: mins.days,
      blurb: blurbForReach(entry, reach, origin),
      reachLabel:
        reach === 'local' ? 'Viaje local' : reach === 'regional' ? 'Salto regional' : 'Vuelo largo',
    };
  })
    .filter((e) => e.score > 0 && e.feasible)
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code));

  if (ranked.length) return ranked.slice(0, 3);

  // Sin candidatos viables: locales/regionales baratos aunque queden justos de presupuesto
  const fallback = CATALOG.map((entry) => {
    const reach = travelReach(origin, entry);
    if (reach === 'longhaul') return null;
    const mins = effectiveMinimums(entry, reach);
    return {
      ...entry,
      reach,
      score: scoreEntry(entry, { climate, experience, budget, duration, amount, days }, reach) + 1,
      feasible: false,
      minBudget: mins.budget,
      minDays: mins.days,
      blurb: blurbForReach(entry, reach, origin),
      reachLabel: reach === 'local' ? 'Viaje local' : 'Salto regional',
    };
  })
    .filter(Boolean)
    .sort((a, b) => a.minBudget - b.minBudget || b.score - a.score);

  return fallback.slice(0, 3);
}

export function catalogCodes() {
  return CATALOG.map((c) => c.code);
}
