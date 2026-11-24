import { getByCode, getByCodes, getFeatured } from '../api/countries.js';
import { getForecast, summarizeCurrent } from '../api/weather.js';
import { resolveCoords } from '../api/geocode.js';
import {
  bindPhotoFallback,
  brandedPlaceholder,
  getDestinationImage,
} from '../media/destinations.js';
import { suggestDestinations, validateRecommendPrefs } from '../recommend.js';
import { addFavorite, isFavorite } from '../storage/favorites.js';
import { showToasts } from '../ui/toast.js';
import {
  countrySnapshot,
  createRouteUrl,
  detailUrl,
  escapeHtml,
  exploreUrl,
  formatPopulation,
  regionLabel,
  skeletonDestGrid,
  skeletonFeatured,
  skeletonWeather,
} from '../utils.js';

function bindSearch() {
  const form = document.querySelector('.hero .search-pill');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = form.querySelector('input[name="q"]')?.value?.trim() || '';
    window.location.href = exploreUrl({ q });
  });
  const btn = form.querySelector('.btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      form.requestSubmit();
    });
  }
}

function bindRegionLinks() {
  document.querySelectorAll('.mini-links a').forEach((a) => {
    const label = a.textContent.trim();
    a.href = exploreUrl({ region: label });
  });
}

async function renderFeatured(countries) {
  const grid = document.querySelector('.featured-grid');
  if (!grid || !countries.length) return;

  const [big, ...side] = countries;
  const photos = await Promise.all(
    countries.map(
      async (c) => (await getDestinationImage(c)) || brandedPlaceholder(c.name.common)
    )
  );
  const bigPhoto = photos[0];
  const capital = big.capital?.[0] || '—';

  grid.innerHTML = `
    <article class="card featured-big" data-code="${escapeHtml(big.cca2)}">
      <div class="media">
        <img class="photo" src="${escapeHtml(bigPhoto)}" alt="${escapeHtml(big.name.common)}" loading="lazy">
      </div>
      <div class="card-body">
        <p class="eyebrow">DESTACADO</p>
        <h2>${escapeHtml(big.flag || '')} ${escapeHtml(big.name.common)}</h2>
        <p class="meta">${escapeHtml(capital)} · ${escapeHtml(regionLabel(big.region))} · ${escapeHtml(formatPopulation(big.population))} de habitantes</p>
        <p>Capital, idiomas, moneda y clima actual en una sola ficha. El punto de partida más claro para armar una ruta.</p>
        <div class="actions">
          <a href="${detailUrl(big.cca2)}" class="btn btn-orange">Ver detalle</a>
          <button type="button" class="link-orange btn-fav" data-code="${escapeHtml(big.cca2)}">${isFavorite(big.cca2) ? 'En favoritos' : 'Agregar a favoritos'}</button>
        </div>
      </div>
    </article>
    <div class="featured-side">
      ${side
        .map((c, i) => {
          const photo = photos[i + 1];
          const cap = c.capital?.[0] || '—';
          return `
          <article class="card featured-small">
            <div class="media">
              <img class="photo" src="${escapeHtml(photo)}" alt="${escapeHtml(c.name.common)}" loading="lazy">
            </div>
            <div class="card-body">
              <h3>${escapeHtml(c.flag || '')} ${escapeHtml(c.name.common)}</h3>
              <p class="meta">${escapeHtml(cap)} · ${escapeHtml(regionLabel(c.region))}</p>
              <span class="badge badge-blue">${escapeHtml(cap)}</span>
              <div class="actions"><a href="${detailUrl(c.cca2)}" class="btn btn-navy">Ver detalles</a></div>
            </div>
          </article>`;
        })
        .join('')}
    </div>
  `;

  bindPhotoFallback(grid);

  grid.querySelector('.btn-fav')?.addEventListener('click', () => {
    const result = addFavorite(countrySnapshot(big, bigPhoto));
    const btn = grid.querySelector('.btn-fav');
    if (btn) btn.textContent = result.already ? 'Ya estaba en favoritos' : 'Guardado en favoritos';
  });
}

async function renderOriginWeather(country) {
  const card = document.querySelector('.weather-card');
  if (!card || !country) return;

  card.innerHTML = skeletonWeather();
  const capital = country.capital?.[0] || country.name.common;
  const countryName = country.name.common;
  try {
    const coords = await resolveCoords(country);
    if (!coords) throw new Error('Sin coordenadas');
    const data = await getForecast(coords.lat, coords.lon, { days: 3 });
    const current = summarizeCurrent(data);
    card.innerHTML = `
      <div class="card-head"><h3>Clima al salir</h3><span class="badge badge-peach">Origen</span></div>
      <p class="meta origin-weather-place">${escapeHtml(capital)}, capital de ${escapeHtml(countryName)}</p>
      <div class="weather-now">
        <span class="sun-box">
          <svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
            <circle cx="24" cy="24" r="9" fill="#FF6B1A"/>
            <g stroke="#FF6B1A" stroke-width="3" stroke-linecap="round"><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M10 38l4-4M34 14l4-4"/></g>
          </svg>
        </span>
        <div>
          <strong class="temp">${current.temp}°</strong>
          <span class="meta">${escapeHtml(current.label)} · sensación ${current.feelsLike}°</span>
        </div>
      </div>
      <p>No es un destino sugerido: es el clima de la capital del país desde el que sales (según el selector de la izquierda).</p>
      <a href="${detailUrl(country.cca2)}" class="btn btn-peach">Ver ficha de ${escapeHtml(countryName)}</a>
    `;
  } catch {
    card.innerHTML = `
      <div class="card-head"><h3>Clima al salir</h3><span class="badge badge-peach">Origen</span></div>
      <p>No se pudo cargar el clima de ${escapeHtml(capital)} (${escapeHtml(countryName)}).</p>
    `;
  }
}

async function loadOriginWeather(code) {
  const cca2 = (code || 'CO').toUpperCase();
  try {
    const country = await getByCode(cca2);
    if (country) await renderOriginWeather(country);
  } catch (err) {
    console.error(err);
  }
}

function bindRecommender() {
  const form = document.getElementById('recommend-form');
  const results = document.getElementById('recommend-results');
  if (!form || !results) return;

  form.origen?.addEventListener('change', () => {
    loadOriginWeather(form.origen.value);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const presupuesto = form.presupuesto.value;
    const dias = form.dias.value;
    const clima = form.clima.value;
    const experiencia = form.experiencia.value;
    const origen = form.origen?.value || 'CO';

    const validation = validateRecommendPrefs({
      presupuesto,
      dias,
      origen,
      clima,
      experiencia,
    });

    showToasts(validation.errors, 'error');
    showToasts(validation.warnings, 'warn');

    if (!validation.ok) {
      if (Number(presupuesto) <= 0) form.presupuesto.focus();
      else if (Number(dias) < 1) form.dias.focus();
      return;
    }

    const suggestions = suggestDestinations({
      presupuesto,
      dias,
      clima,
      experiencia,
      origen,
    });

    const tight = Number(presupuesto) < 500 || Number(dias) < 3;
    results.hidden = false;
    results.innerHTML = `
      <div class="recommend-results-head">
        <p class="eyebrow">SUGERENCIAS</p>
        <h3>${tight ? 'Opciones realistas con tu presupuesto y tiempo' : 'Destinos que encajan con tu perfil'}</h3>
        <p class="meta">Salida desde ${escapeHtml(form.origen.selectedOptions[0]?.text || origen)} · ${escapeHtml(String(presupuesto))} USD · ${escapeHtml(String(dias))} día${Number(dias) === 1 ? '' : 's'}</p>
      </div>
      <div class="dest-grid recommend-grid">${skeletonDestGrid(3)}</div>
    `;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const grid = results.querySelector('.recommend-grid');
    if (!suggestions.length) {
      grid.innerHTML = `
        <div class="card empty-card" style="grid-column:1/-1">
          <h3>Presupuesto o días insuficientes</h3>
          <p>Con esos números no hay un destino viable en el catálogo (sobre todo si buscas un vuelo largo). Sube el presupuesto o los días, o elige un origen distinto.</p>
          <a href="explorar.html" class="btn btn-orange">Ir a explorar</a>
        </div>`;
      return;
    }

    try {
      const countries = await getByCodes(suggestions.map((s) => s.code));
      const byCode = Object.fromEntries(countries.map((c) => [c.cca2, c]));
      const photos = await Promise.all(
        suggestions.map(async (s) => {
          const country = byCode[s.code];
          return (
            (country && (await getDestinationImage(country))) ||
            brandedPlaceholder(country?.name?.common || s.code)
          );
        })
      );

      grid.innerHTML = suggestions
        .map((s, i) => {
          const country = byCode[s.code];
          if (!country) return '';
          const capital = country.capital?.[0] || '—';
          const photo = photos[i];
          const badge =
            s.reach === 'local'
              ? 'badge-peach'
              : s.reach === 'regional'
                ? 'badge-blue'
                : 'badge-peach';
          return `
            <article class="card dest-card">
              <div class="media">
                <img class="photo" src="${escapeHtml(photo)}" alt="${escapeHtml(country.name.common)}" loading="lazy">
              </div>
              <div class="card-body">
                <h3>${escapeHtml(country.flag || '')} ${escapeHtml(country.name.common)}</h3>
                <p class="meta">${escapeHtml(capital)} · ${escapeHtml(regionLabel(country.region))}</p>
                <span class="badge ${badge}">${escapeHtml(s.reachLabel || '')}</span>
                <p>${escapeHtml(s.blurb)}</p>
                ${
                  s.feasible === false
                    ? `<p class="meta">Referencia mínima orientativa: ~${s.minBudget} USD y ${s.minDays} días.</p>`
                    : ''
                }
                <div class="actions">
                  <a href="${detailUrl(country.cca2)}" class="btn btn-navy">Ver detalle</a>
                  <a href="${createRouteUrl({ destino: country.name.common, code: country.cca2 })}" class="link-orange">Crear ruta</a>
                </div>
              </div>
            </article>`;
        })
        .join('');
      bindPhotoFallback(grid);
    } catch (err) {
      console.error(err);
      grid.innerHTML = `
        <div class="card empty-card" style="grid-column:1/-1">
          <h3>No se pudieron cargar las sugerencias</h3>
          <p>Inténtalo de nuevo en unos segundos.</p>
        </div>`;
    }
  });
}

async function init() {
  bindSearch();
  bindRegionLinks();
  bindRecommender();

  const grid = document.querySelector('.featured-grid');
  const weather = document.querySelector('.weather-card');
  const origen = document.getElementById('rec-origen')?.value || 'CO';
  if (grid) grid.innerHTML = skeletonFeatured();
  if (weather) weather.innerHTML = skeletonWeather();

  try {
    const [featured] = await Promise.all([
      getFeatured(),
      loadOriginWeather(origen),
    ]);
    const ordered = ['PT', 'JP', 'CO']
      .map((code) => featured.find((c) => c.cca2 === code))
      .filter(Boolean);
    await renderFeatured(ordered);
  } catch (err) {
    console.error(err);
    if (grid) {
      grid.insertAdjacentHTML(
        'beforebegin',
        '<div class="alert alert-error">No se pudieron cargar los destinos destacados.</div>'
      );
    }
  }
}

init();
