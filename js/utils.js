export function skeletonFeatured() {
  return `
    <article class="card featured-big sk-card">
      <div class="media"><div class="sk-block sk-media"></div></div>
      <div class="card-body">
        <div class="sk-line sk-w-30"></div>
        <div class="sk-line sk-title"></div>
        <div class="sk-line sk-w-70"></div>
        <div class="sk-line sk-w-90"></div>
        <div class="sk-actions"><span class="sk-pill"></span><span class="sk-pill sk-pill-sm"></span></div>
      </div>
    </article>
    <div class="featured-side">
      <article class="card featured-small sk-card">
        <div class="media"><div class="sk-block sk-media"></div></div>
        <div class="card-body">
          <div class="sk-line sk-title"></div>
          <div class="sk-line sk-w-50"></div>
          <div class="sk-actions"><span class="sk-pill"></span></div>
        </div>
      </article>
      <article class="card featured-small sk-card">
        <div class="media"><div class="sk-block sk-media"></div></div>
        <div class="card-body">
          <div class="sk-line sk-title"></div>
          <div class="sk-line sk-w-50"></div>
          <div class="sk-actions"><span class="sk-pill"></span></div>
        </div>
      </article>
    </div>`;
}

export function skeletonDestGrid(count = 6) {
  return Array.from({ length: count }, () => `
    <article class="card dest-card sk-card">
      <div class="media"><div class="sk-block sk-media"></div></div>
      <div class="card-body">
        <div class="sk-line sk-title"></div>
        <div class="sk-line sk-w-70"></div>
        <div class="sk-line sk-w-30"></div>
        <div class="sk-actions"><span class="sk-pill"></span></div>
      </div>
    </article>`).join('');
}

export function skeletonWeather() {
  return `
    <div class="card-head"><div class="sk-line sk-w-50"></div><span class="sk-pill sk-pill-sm"></span></div>
    <div class="weather-now">
      <div class="sk-block sk-avatar"></div>
      <div style="flex:1">
        <div class="sk-line sk-title"></div>
        <div class="sk-line sk-w-70"></div>
      </div>
    </div>
    <div class="sk-line sk-w-90"></div>
    <div class="sk-actions"><span class="sk-pill"></span></div>`;
}

export function skeletonDetail() {
  return {
    info: Array.from({ length: 6 }, () => `
      <div class="info-cell"><span class="sk-line sk-w-50"></span><b class="sk-line sk-w-70"></b></div>`).join(''),
    weather: `
      <div class="card-head"><div class="sk-line sk-w-50"></div><span class="sk-pill sk-pill-sm"></span></div>
      <div class="weather-now">
        <div class="sk-block sk-avatar"></div>
        <div style="flex:1"><div class="sk-line sk-title"></div><div class="sk-line sk-w-70"></div></div>
      </div>
      <div class="forecast">
        <div class="sk-block" style="height:88px;border-radius:16px"></div>
        <div class="sk-block" style="height:88px;border-radius:16px"></div>
        <div class="sk-block" style="height:88px;border-radius:16px"></div>
      </div>`,
    location: `
      <div class="sk-line sk-w-30"></div>
      <div class="sk-line sk-title"></div>
      <div class="sk-line sk-w-50"></div>`,
  };
}

export function skeletonList(kind = 'fav', count = 3) {
  if (kind === 'route') {
    return Array.from({ length: count }, () => `
      <article class="card route-card sk-card">
        <div><div class="sk-line sk-w-70"></div><div class="sk-line sk-w-50"></div></div>
        <div><div class="sk-line sk-title"></div><div class="sk-line sk-w-70"></div></div>
        <div class="sk-actions"><span class="sk-pill"></span><span class="sk-pill sk-pill-sm"></span></div>
      </article>`).join('');
  }
  return Array.from({ length: count }, () => `
    <article class="card fav-card sk-card">
      <div class="sk-block sk-thumb"></div>
      <div class="fav-info" style="flex:1">
        <div class="sk-line sk-title"></div>
        <div class="sk-line sk-w-70"></div>
        <div class="sk-actions"><span class="sk-pill"></span><span class="sk-pill"></span></div>
      </div>
    </article>`).join('');
}

export const REGION_MAP = {
  europe: 'Europe',
  europa: 'Europe',
  americas: 'Americas',
  america: 'Americas',
  américa: 'Americas',
  asia: 'Asia',
  africa: 'Africa',
  áfrica: 'Africa',
  oceania: 'Oceania',
  oceanía: 'Oceania',
};

export const REGION_LABELS = {
  Europe: 'Europa',
  Americas: 'América',
  Asia: 'Asia',
  Africa: 'África',
  Oceania: 'Oceanía',
  Antarctic: 'Antártida',
};

const WMO = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla escarchada',
  51: 'Llovizna ligera',
  53: 'Llovizna',
  55: 'Llovizna intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia',
  65: 'Lluvia intensa',
  71: 'Nieve ligera',
  73: 'Nieve',
  75: 'Nieve intensa',
  80: 'Chubascos',
  81: 'Chubascos',
  82: 'Chubascos fuertes',
  95: 'Tormenta',
  96: 'Tormenta con granizo',
  99: 'Tormenta fuerte',
};

export function weatherLabel(code) {
  return WMO[code] ?? 'Condición variable';
}

export function formatPopulation(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m.toLocaleString('es-ES', { maximumFractionDigits: 1 })} millones`;
  }
  return n.toLocaleString('es-ES');
}

export function formatLanguages(languages) {
  if (!languages || typeof languages !== 'object') return '—';
  return Object.values(languages).join(', ') || '—';
}

export function formatCurrencies(currencies) {
  if (!currencies || typeof currencies !== 'object') return '—';
  return Object.entries(currencies)
    .map(([code, c]) => `${c.name || code}${c.symbol ? ` (${c.symbol})` : ` (${code})`}`)
    .join(', ');
}

export function formatCoords(lat, lon) {
  if (lat == null || lon == null) return '—';
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'O';
  return `${Math.abs(lat).toFixed(2)}° ${ns}, ${Math.abs(lon).toFixed(2)}° ${ew}`;
}

export function regionLabel(region) {
  return REGION_LABELS[region] || region || '—';
}

export function normalizeRegionParam(value) {
  if (!value) return '';
  const key = value.trim().toLowerCase();
  return REGION_MAP[key] || value;
}

export function qs(name, url = window.location.href) {
  return new URL(url).searchParams.get(name);
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function relativeSavedAt(iso) {
  if (!iso) return 'guardado recientemente';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return 'guardado hoy';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return 'guardado hoy';
  const days = Math.floor(hours / 24);
  if (days === 1) return 'guardado ayer';
  if (days < 7) return 'guardado esta semana';
  return `guardado el ${new Date(iso).toLocaleDateString('es-ES')}`;
}

export function formatDateRange(start, end) {
  if (!start || !end) return 'Sin fechas';
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  return `${a.toLocaleDateString('es-ES', opts)} – ${b.toLocaleDateString('es-ES', opts)}`;
}

export function formatMoney(n) {
  if (n == null || n === '') return '—';
  return Number(n).toLocaleString('es-ES');
}

export function weekdayShort(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString('es-ES', { weekday: 'short' });
}

export function showAlert(el, message, visible = true) {
  if (!el) return;
  el.hidden = !visible;
  if (message) el.textContent = message;
}

export function setLoading(el, loading, text = 'Cargando…') {
  if (!el) return;
  if (loading) {
    el.dataset.prevHtml = el.innerHTML;
    el.innerHTML = `<p class="meta loading-msg">${escapeHtml(text)}</p>`;
  } else if (el.dataset.prevHtml != null) {
    el.innerHTML = el.dataset.prevHtml;
    delete el.dataset.prevHtml;
  }
}

export function countrySnapshot(country, photo = '') {
  const [lat, lon] = country.latlng || [];
  return {
    cca2: country.cca2,
    name: country.name?.common || '',
    officialName: country.name?.official || '',
    capital: country.capital?.[0] || '',
    region: country.region || '',
    flag: country.flags?.svg || country.flags?.png || '',
    flagEmoji: country.flag || '',
    photo: photo || '',
    lat: lat ?? null,
    lon: lon ?? null,
    savedAt: new Date().toISOString(),
  };
}

export function detailUrl(cca2) {
  return `detalle-destino.html?code=${encodeURIComponent(cca2)}`;
}

export function exploreUrl({ q = '', region = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (region) params.set('region', region);
  const s = params.toString();
  return s ? `explorar.html?${s}` : 'explorar.html';
}

export function createRouteUrl({ destino = '', code = '' } = {}) {
  const params = new URLSearchParams();
  if (destino) params.set('destino', destino);
  if (code) params.set('code', code);
  const s = params.toString();
  return s ? `crear-ruta.html?${s}` : 'crear-ruta.html';
}
