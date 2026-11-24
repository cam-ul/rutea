import { getByCode, searchByName } from '../api/countries.js';
import { resolveCoords } from '../api/geocode.js';
import { getForecast, summarizeCurrent, summarizeDaily } from '../api/weather.js';
import {
  bindPhotoFallback,
  brandedPlaceholder,
  getDestinationImage,
} from '../media/destinations.js';
import { addFavorite, isFavorite, removeFavorite } from '../storage/favorites.js';
import {
  countrySnapshot,
  createRouteUrl,
  escapeHtml,
  formatCoords,
  formatCurrencies,
  formatLanguages,
  formatPopulation,
  qs,
  regionLabel,
  showAlert,
  skeletonDetail,
  skeletonWeather,
} from '../utils.js';

async function loadCountry() {
  const code = qs('code');
  const name = qs('name') || qs('q');

  if (code) {
    const country = await getByCode(code);
    if (country) return country;
  }

  if (name) {
    const list = await searchByName(name);
    if (list.length) return list[0];
  }

  return getByCode('PT');
}

function showSkeletons() {
  const sk = skeletonDetail();
  const photo = document.querySelector('.photo-wide');
  const info = document.querySelector('.info-grid');
  const weather = document.querySelector('.detail-grid .stack:last-child .card:first-child');
  const location = document.querySelector('.card-dark');
  const title = document.querySelector('.page-head h1');

  if (title) {
    title.innerHTML =
      '<span class="sk-line sk-title" style="width:220px;display:inline-block;margin:0;vertical-align:middle"></span>';
  }

  if (photo) {
    const placeholder = document.createElement('div');
    placeholder.className = 'sk-block sk-photo';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.dataset.skeletonPhoto = '1';
    photo.replaceWith(placeholder);
  }
  if (info) info.innerHTML = sk.info;
  if (weather) weather.innerHTML = sk.weather;
  if (location) location.innerHTML = sk.location;
}

async function renderHeader(country, coords) {
  const title = document.querySelector('.page-head h1');
  const lead = document.querySelector('.page-head .lead');
  const actions = document.querySelector('.page-head .actions');
  const capital = country.capital?.[0] || 'su capital';
  const photoUrl =
    (await getDestinationImage(country)) || brandedPlaceholder(country.name.common);

  document.title = `${country.name.common} · Detalle del destino · RUTEA`;

  if (title) {
    title.innerHTML = `
      <span class="flag">${escapeHtml(country.flag || '')}</span>
      ${escapeHtml(country.name.common)}
      <span class="badge badge-peach">${escapeHtml(regionLabel(country.region))}</span>
    `;
  }

  if (lead) {
    lead.textContent = `Información geográfica para decidir, y el clima de ${capital} para acotar fechas. Desde aquí puedes guardar el destino o convertirlo en ruta.`;
  }

  if (actions) {
    const fav = isFavorite(country.cca2);
    actions.innerHTML = `
      <a href="${createRouteUrl({ destino: country.name.common, code: country.cca2 })}" class="btn btn-orange">Crear ruta</a>
      <button type="button" class="link-orange" id="btn-fav-toggle">${fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}</button>
      <a href="explorar.html" class="btn btn-outline">Volver a explorar</a>
    `;

    actions.querySelector('#btn-fav-toggle')?.addEventListener('click', () => {
      const alertEl = document.querySelector('.alert');
      if (isFavorite(country.cca2)) {
        removeFavorite(country.cca2);
        actions.querySelector('#btn-fav-toggle').textContent = 'Agregar a favoritos';
        showAlert(alertEl, '', false);
      } else {
        addFavorite(countrySnapshot(country, photoUrl));
        actions.querySelector('#btn-fav-toggle').textContent = 'Quitar de favoritos';
        showAlert(
          alertEl,
          `${country.name.common} está en favoritos. No se duplicará si lo vuelves a guardar.`,
          true
        );
      }
    });
  }

  const photoSlot = document.querySelector('[data-skeleton-photo], .photo-wide');
  if (photoSlot) {
    const img = document.createElement('img');
    img.className = 'photo photo-wide';
    img.src = photoUrl;
    img.alt = country.name.common;
    photoSlot.replaceWith(img);
    bindPhotoFallback(img.parentElement || document);
  }

  const [lat, lon] = country.latlng || [];
  const info = document.querySelector('.info-grid');
  if (info) {
    info.innerHTML = `
      <div class="info-cell"><span>Capital</span><b>${escapeHtml(country.capital?.[0] || '—')}</b></div>
      <div class="info-cell"><span>Región</span><b>${escapeHtml(regionLabel(country.region))}</b></div>
      <div class="info-cell"><span>Población</span><b>${escapeHtml(formatPopulation(country.population))}</b></div>
      <div class="info-cell"><span>Idiomas</span><b>${escapeHtml(formatLanguages(country.languages))}</b></div>
      <div class="info-cell"><span>Moneda</span><b>${escapeHtml(formatCurrencies(country.currencies))}</b></div>
      <div class="info-cell"><span>Ubicación</span><b>${escapeHtml(formatCoords(coords?.lat ?? lat, coords?.lon ?? lon))}</b></div>
    `;
  }
}

function renderLocation(coords) {
  const card = document.querySelector('.card-dark');
  if (!card || !coords) return;
  card.innerHTML = `
    <p class="eyebrow">Ubicación geográfica</p>
    <h3>${escapeHtml(coords.label)}</h3>
    <p class="coords">Lat ${coords.lat.toFixed(4)} · Lon ${coords.lon.toFixed(4)}</p>
  `;
}

function renderWeather(capital, current, daily) {
  const card = document.querySelector('.detail-grid .stack:last-child .card:first-child');
  if (!card || !current) return;

  card.innerHTML = `
    <div class="card-head"><h3>Clima en ${escapeHtml(capital)}</h3><span class="badge badge-peach">Hoy</span></div>
    <div class="weather-now">
      <span class="dot-big"></span>
      <div>
        <strong class="temp">${current.temp}°</strong>
        <span class="meta">${escapeHtml(current.label)} · ${current.humidity} % humedad · viento ${current.wind} km/h</span>
      </div>
    </div>
    <h4>Pronóstico básico</h4>
    <div class="forecast">
      ${daily
        .map(
          (d) => `
        <div class="mini-card">
          <span>${escapeHtml(d.label)}</span>
          <b>${d.temp}°</b>
          <small>${escapeHtml(d.condition)}</small>
        </div>`
        )
        .join('')}
    </div>
  `;
}

async function init() {
  const alert = document.querySelector('.alert');
  showAlert(alert, '', false);
  showSkeletons();

  try {
    const country = await loadCountry();
    if (!country) throw new Error('Destino no encontrado');

    if (isFavorite(country.cca2)) {
      showAlert(
        alert,
        `${country.name.common} está en favoritos. No se duplicará si lo vuelves a guardar.`,
        true
      );
    } else {
      showAlert(alert, '', false);
    }

    await renderHeader(country, null);

    const weatherCard = document.querySelector('.detail-grid .stack:last-child .card:first-child');
    const locationCard = document.querySelector('.card-dark');
    if (weatherCard) weatherCard.innerHTML = skeletonWeather();
    if (locationCard) locationCard.innerHTML = skeletonDetail().location;

    const coords = await resolveCoords(country);
    if (coords) {
      renderLocation(coords);
      const [lat, lon] = country.latlng || [];
      const ubicacion = document.querySelector('.info-grid .info-cell:last-child b');
      if (ubicacion) ubicacion.textContent = formatCoords(coords.lat ?? lat, coords.lon ?? lon);

      const weather = await getForecast(coords.lat, coords.lon, { days: 4 });
      renderWeather(
        country.capital?.[0] || country.name.common,
        summarizeCurrent(weather),
        summarizeDaily(weather, 3)
      );
    } else if (weatherCard) {
      weatherCard.innerHTML = `
        <div class="card-head"><h3>Clima</h3></div>
        <p>No hay coordenadas para consultar el clima.</p>
      `;
    }
  } catch (err) {
    console.error(err);
    showAlert(alert, 'No se pudo cargar el destino. Intenta desde Explorar.', true);
    alert?.classList.add('alert-error');
  }
}

init();
