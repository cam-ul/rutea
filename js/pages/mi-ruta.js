import { deleteRoute, getRoutes } from '../storage/routes.js';
import { escapeHtml, formatDateRange, formatMoney, skeletonList } from '../utils.js';

function render() {
  const routes = getRoutes();
  const stack = document.querySelector('main .stack');
  const countEl = document.getElementById('routes-count');
  if (!stack) return;

  if (countEl) {
    countEl.textContent = routes.length
      ? `${routes.length} ruta${routes.length === 1 ? '' : 's'} guardada${routes.length === 1 ? '' : 's'}`
      : 'Sin rutas todavía';
  }

  if (!routes.length) {
    stack.innerHTML = `
      <div class="card empty-card">
        <p class="eyebrow">SIN RUTAS</p>
        <h3>Todavía no hay planes guardados</h3>
        <p>Una ruta = un viaje concreto (destino, fechas y presupuesto). Puedes crear tantas como quieras; no sustituyen a las anteriores.</p>
        <div class="actions">
          <a href="crear-ruta.html" class="btn btn-orange">Crear mi primera ruta</a>
          <a href="favoritos.html" class="link-orange">Partir de un favorito</a>
        </div>
      </div>
    `;
    return;
  }

  stack.innerHTML = `
    ${routes
      .map(
        (r) => `
    <article class="card route-card" data-id="${escapeHtml(r.id)}">
      <div class="route-dates">
        <b>${escapeHtml(formatDateRange(r.salida, r.regreso))}</b>
        <span class="meta">${escapeHtml(String(r.viajeros))} viajero${r.viajeros === 1 ? '' : 's'}</span>
      </div>
      <div class="route-main">
        <h3>${escapeHtml(r.name)}</h3>
        <p class="meta">${escapeHtml(r.destino || 'Sin destino')} · presupuesto ${escapeHtml(formatMoney(r.presupuesto))} USD</p>
      </div>
      <div class="actions">
        <a href="detalle-ruta.html?id=${encodeURIComponent(r.id)}" class="btn btn-navy">Ver</a>
        <a href="crear-ruta.html?id=${encodeURIComponent(r.id)}" class="btn btn-outline">Editar</a>
        <button type="button" class="link-orange btn-delete" data-id="${escapeHtml(r.id)}">Eliminar</button>
      </div>
    </article>`
      )
      .join('')}
    <div class="card empty-card route-add-card">
      <h3>¿Otro viaje?</h3>
      <p>Crear una ruta nueva no borra las que ya tienes. Quedan todas en esta lista.</p>
      <div class="actions">
        <a href="crear-ruta.html" class="btn btn-orange">Nueva ruta</a>
      </div>
    </div>
  `;

  stack.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('¿Eliminar esta ruta?')) return;
      deleteRoute(btn.dataset.id);
      render();
    });
  });
}

function init() {
  const stack = document.querySelector('main .stack');
  if (stack) stack.innerHTML = skeletonList('route', 2);
  requestAnimationFrame(() => render());
}

init();
