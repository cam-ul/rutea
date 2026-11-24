import { exploreDestinations } from '../api/countries.js';
import {
  bindPhotoFallback,
  brandedPlaceholder,
  destinationImage,
  getDestinationImage,
} from '../media/destinations.js';
import { addFavorite, isFavorite } from '../storage/favorites.js';
import {
  countrySnapshot,
  detailUrl,
  escapeHtml,
  exploreUrl,
  formatPopulation,
  normalizeRegionParam,
  qs,
  regionLabel,
  skeletonDestGrid,
} from '../utils.js';

const REGIONS = [
  { label: 'Todas', value: '' },
  { label: 'Europa', value: 'Europe' },
  { label: 'América', value: 'Americas' },
  { label: 'Asia', value: 'Asia' },
  { label: 'África', value: 'Africa' },
  { label: 'Oceanía', value: 'Oceania' },
];

function currentFilters() {
  const q = qs('q') || '';
  const regionRaw = qs('region') || '';
  const region = normalizeRegionParam(regionRaw);
  return { q, region };
}

function bindSearch(filters) {
  const form = document.querySelector('.search-pill');
  const input = form?.querySelector('input[name="q"]');
  if (input) input.value = filters.q;

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input?.value?.trim() || '';
    window.location.href = exploreUrl({ q, region: filters.region });
  });

  const btn = form?.querySelector('.btn, a.btn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      form.requestSubmit();
    });
  }
}

function renderPills(filters) {
  const list = document.querySelector('.pill-list');
  if (!list) return;
  list.innerHTML = REGIONS.map((r) => {
    const active = filters.region === r.value;
    return `<a href="${exploreUrl({ q: filters.q, region: r.value })}" class="pill${active ? ' pill-active' : ''}" data-region="${escapeHtml(r.value)}">${escapeHtml(r.label)}</a>`;
  }).join('');
}

function mediaHtml(country, photo, pending) {
  if (pending) {
    return `<div class="sk-block sk-media" data-skel="${escapeHtml(country.cca2)}" aria-hidden="true"></div>`;
  }
  return `<img class="photo" src="${escapeHtml(photo)}" alt="${escapeHtml(country.name.common)}" loading="lazy" data-code="${escapeHtml(country.cca2)}">`;
}

function destCard(country, photo, pending = false) {
  const capital = country.capital?.[0] || '—';
  const fav = isFavorite(country.cca2);
  return `
    <article class="card dest-card" data-code="${escapeHtml(country.cca2)}">
      <div class="media">
        ${mediaHtml(country, photo, pending)}
      </div>
      <div class="card-body">
        <h3>${escapeHtml(country.flag || '')} ${escapeHtml(country.name.common)}</h3>
        <p class="meta">${escapeHtml(regionLabel(country.region))} · ${escapeHtml(capital)} · ${escapeHtml(formatPopulation(country.population))}</p>
        <span class="badge badge-blue">${escapeHtml(regionLabel(country.region))}</span>
        <div class="actions">
          <a href="${detailUrl(country.cca2)}" class="btn btn-navy">Ver detalles</a>
          <button type="button" class="link-orange btn-fav" data-code="${escapeHtml(country.cca2)}">${fav ? 'En favoritos' : 'Favorito'}</button>
        </div>
      </div>
    </article>
  `;
}

function initialPhotos(countries) {
  return Object.fromEntries(
    countries.map((c) => {
      const local = destinationImage(c);
      return [
        c.cca2,
        {
          src: local || brandedPlaceholder(c.name.common),
          pending: !local,
        },
      ];
    })
  );
}

async function hydratePhotos(countries, photos) {
  await Promise.all(
    countries.map(async (country) => {
      const entry = photos[country.cca2];
      if (!entry?.pending) return;

      const resolved =
        (await getDestinationImage(country)) ||
        brandedPlaceholder(country.name.common);
      entry.src = resolved;
      entry.pending = false;

      const media = document.querySelector(
        `.dest-card[data-code="${country.cca2}"] .media`
      );
      if (!media) return;
      media.innerHTML = `<img class="photo" src="${escapeHtml(resolved)}" alt="${escapeHtml(country.name.common)}" loading="lazy" data-code="${escapeHtml(country.cca2)}">`;
      bindPhotoFallback(media);
    })
  );
}

function renderResults(countries, filters, photos) {
  const countEl = document.querySelector('.results-count');
  const grid = document.querySelector('.dest-grid');
  const empty = document.querySelector('.empty-card');

  if (!grid || !empty) return;

  if (!countries.length) {
    grid.hidden = true;
    grid.innerHTML = '';
    grid.removeAttribute('aria-busy');
    empty.hidden = false;
    const label = filters.q || regionLabel(filters.region) || 'tu búsqueda';
    empty.querySelector('h3').textContent = `Sin coincidencias para "${label}"`;
    if (countEl) countEl.textContent = '0 destinos';
    return;
  }

  empty.hidden = true;
  grid.hidden = false;
  grid.removeAttribute('aria-busy');
  grid.innerHTML = countries
    .map((c) => {
      const p = photos[c.cca2] || {
        src: brandedPlaceholder(c.name.common),
        pending: false,
      };
      return destCard(c, p.src, p.pending);
    })
    .join('');
  if (countEl) {
    countEl.textContent = `${countries.length} destino${countries.length === 1 ? '' : 's'}`;
  }

  bindPhotoFallback(grid);

  grid.querySelectorAll('.btn-fav').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      const country = countries.find((c) => c.cca2 === code);
      if (!country) return;
      const photo = photos[code]?.src || '';
      const result = addFavorite(countrySnapshot(country, photo));
      btn.textContent = result.already ? 'Ya en favoritos' : 'Guardado';
    });
  });
}

function showLoadingSkeleton() {
  const grid = document.querySelector('.dest-grid');
  const empty = document.querySelector('.empty-card');
  const countEl = document.querySelector('.results-count');
  if (empty) empty.hidden = true;
  if (countEl) countEl.textContent = 'Cargando destinos…';
  if (grid) {
    grid.hidden = false;
    grid.setAttribute('aria-busy', 'true');
    grid.innerHTML = skeletonDestGrid(6);
  }
}

async function init() {
  const filters = currentFilters();
  bindSearch(filters);
  renderPills(filters);
  showLoadingSkeleton();

  const grid = document.querySelector('.dest-grid');
  const empty = document.querySelector('.empty-card');

  try {
    const countries = await exploreDestinations(filters);
    const photos = initialPhotos(countries);
    renderResults(countries, filters, photos);
    await hydratePhotos(countries, photos);
  } catch (err) {
    console.error(err);
    if (grid) {
      grid.innerHTML = '';
      grid.hidden = true;
      grid.removeAttribute('aria-busy');
    }
    if (empty) {
      empty.hidden = false;
      empty.querySelector('h3').textContent = 'No se pudieron cargar los destinos';
      empty.querySelector('p').textContent = 'Inténtalo de nuevo en unos segundos.';
    }
  }
}

init();
