import { getByCode } from '../api/countries.js';
import { resolveCoords } from '../api/geocode.js';
import { getForecast, summarizeCurrent, summarizeDaily } from '../api/weather.js';
import { deleteRoute, getRoute } from '../storage/routes.js';
import {
  detailUrl,
  escapeHtml,
  formatDateRange,
  formatMoney,
  qs,
  showAlert,
  skeletonWeather,
} from '../utils.js';

function renderRoute(route) {
  const alert = document.querySelector('.alert');
  showAlert(alert, 'Ruta guardada en este navegador.', true);

  document.title = `${route.name} · Detalle de la ruta · RUTEA`;

  const head = document.querySelector('.page-head');
  if (head) {
    head.querySelector('h1').innerHTML = `${escapeHtml(route.name)} <span class="badge badge-peach">${escapeHtml(route.destino || 'Viaje')}</span>`;
    head.querySelector('.lead').textContent = `${formatDateRange(route.salida, route.regreso)} · ${route.viajeros} viajero${route.viajeros === 1 ? '' : 's'} · ${formatMoney(route.presupuesto)} USD. Este es un plan; puedes crear otros en Mis rutas.`;
    head.querySelector('.actions').innerHTML = `
      <a href="crear-ruta.html?id=${encodeURIComponent(route.id)}" class="btn btn-orange">Editar esta ruta</a>
      <a href="crear-ruta.html" class="btn btn-outline">Nueva ruta</a>
      <a href="mi-ruta.html" class="btn btn-outline">Ver todas</a>
      ${route.code ? `<a href="${detailUrl(route.code)}" class="link-orange">Ficha del destino</a>` : ''}
      <button type="button" class="link-orange" id="btn-delete">Eliminar</button>
    `;
    head.querySelector('#btn-delete')?.addEventListener('click', () => {
      if (!confirm('¿Eliminar esta ruta?')) return;
      deleteRoute(route.id);
      window.location.href = 'mi-ruta.html';
    });
  }

  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const days = route.days?.length
      ? route.days
      : [{ title: 'Día 1', note: route.comentarios || 'Sin actividades detalladas todavía.' }];
    timeline.innerHTML = days
      .map(
        (d) => `
      <li>
        <h3>${escapeHtml(d.title)}</h3>
        <p>${escapeHtml(d.note || '')}</p>
      </li>`
      )
      .join('');
  }
}

function renderWeatherCard(place, current, daily) {
  return `
    <div class="card-head"><h3>Clima en ${escapeHtml(place)}</h3><span class="badge badge-peach">Hoy</span></div>
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

async function renderWeather(route) {
  const card = document.querySelector('.detail-grid .card');
  if (!card) return;

  card.innerHTML = skeletonWeather();

  let lat = route.lat;
  let lon = route.lon;
  let place = route.capital || route.destino || 'Destino';

  try {
    if (route.code) {
      const country = await getByCode(route.code);
      if (country) {
        place = country.capital?.[0] || country.name.common;
        const coords = await resolveCoords(country);
        if (coords) {
          lat = coords.lat;
          lon = coords.lon;
          place = coords.label.split(',')[0] || place;
        }
      }
    }

    if (lat == null || lon == null) {
      card.innerHTML = `
        <div class="card-head"><h3>Clima previsto</h3><span class="badge badge-peach">${escapeHtml(place)}</span></div>
        <p>No hay coordenadas para consultar el clima de este destino.</p>
      `;
      return;
    }

    const data = await getForecast(lat, lon, { days: 4 });
    const current = summarizeCurrent(data);
    const daily = summarizeDaily(data, 3);
    card.innerHTML = renderWeatherCard(place, current, daily);
  } catch (err) {
    console.error(err);
    card.innerHTML = `
      <div class="card-head"><h3>Clima previsto</h3><span class="badge badge-peach">${escapeHtml(place)}</span></div>
      <p>No se pudo cargar el clima en este momento.</p>
    `;
  }
}

async function init() {
  const id = qs('id');
  const route = id ? getRoute(id) : null;
  const weatherCard = document.querySelector('.detail-grid .card');
  if (weatherCard) weatherCard.innerHTML = skeletonWeather();

  if (!route) {
    showAlert(document.querySelector('.alert'), 'No se encontró la ruta. Crea una nueva desde Mi ruta.', true);
    document.querySelector('.page-head h1').textContent = 'Ruta no encontrada';
    document.querySelector('.page-head .lead').textContent = 'Es posible que se haya eliminado de este navegador.';
    document.querySelector('.page-head .actions').innerHTML =
      '<a href="mi-ruta.html" class="btn btn-orange">Volver a mis rutas</a><a href="crear-ruta.html" class="btn btn-outline">Crear ruta</a>';
    document.querySelector('.timeline').innerHTML = '';
    if (weatherCard) weatherCard.hidden = true;
    return;
  }

  renderRoute(route);
  await renderWeather(route);
}

init();
