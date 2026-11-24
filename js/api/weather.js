import { weatherLabel, weekdayShort } from '../utils.js';

const BASE = 'https://api.open-meteo.com/v1/forecast';

export async function getForecast(lat, lon, { days = 4 } = {}) {
  if (lat == null || lon == null) throw new Error('Coordenadas requeridas');

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: String(Math.min(Math.max(days, 1), 16)),
  });

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo: ${res.status}`);
  return res.json();
}

export function summarizeCurrent(data) {
  const c = data.current;
  if (!c) return null;
  return {
    temp: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    wind: Math.round(c.wind_speed_10m),
    code: c.weather_code,
    label: weatherLabel(c.weather_code),
  };
}

function formatDegrees(n) {
  return `${n}\u00A0°C`;
}

function formatTempRange(min, max) {
  return `Entre ${formatDegrees(min)} y ${formatDegrees(max)}`;
}

function rangeNote(min, max, codes = []) {
  const rainy = codes.some((c) => c >= 51 && c <= 82);
  const snowy = codes.some((c) => c >= 71 && c <= 77);
  const avg = (min + max) / 2;

  if (snowy || avg <= 0) {
    return rainy || snowy
      ? 'Frío intenso, posible nieve o precipitación. Prioriza abrigo y calzado adecuado.'
      : 'Frío intenso según el pronóstico. Prioriza abrigo y capas térmicas.';
  }
  if (avg < 12) {
    return rainy
      ? 'Clima fresco, posible lluvia. Útil para decidir abrigo y capas.'
      : 'Clima fresco según el pronóstico. Útil para decidir abrigo y capas.';
  }
  if (avg > 28) {
    return rainy
      ? 'Calor, posible lluvia. Hidratación y ropa ligera.'
      : 'Calor según el pronóstico. Hidratación y ropa ligera.';
  }
  return rainy
    ? 'Clima templado, posible lluvia en los próximos días. Útil para decidir capas.'
    : 'Condiciones templadas según el pronóstico. Útil para decidir capas.';
}

export function summarizeDaily(data, limit = 3) {
  const d = data.daily;
  if (!d?.time?.length) return [];

  return d.time.slice(1, 1 + limit).map((date, i) => {
    const idx = i + 1;
    const max = Math.round(d.temperature_2m_max[idx]);
    const min = Math.round(d.temperature_2m_min[idx]);
    const code = d.weather_code[idx];
    return {
      date,
      label: idx === 1 ? 'Mañana' : weekdayShort(date),
      temp: max,
      range: formatTempRange(min, max),
      code,
      condition: weatherLabel(code),
    };
  });
}

export function summarizeRange(data) {
  const d = data.daily;
  if (!d?.temperature_2m_max?.length) return null;
  const max = Math.round(Math.max(...d.temperature_2m_max));
  const min = Math.round(Math.min(...d.temperature_2m_min));
  return {
    min,
    max,
    rangeLabel: formatTempRange(min, max),
    note: rangeNote(min, max, d.weather_code || []),
  };
}
