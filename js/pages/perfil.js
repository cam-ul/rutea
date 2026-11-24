import { clearFavorites, countFavorites } from '../storage/favorites.js';
import { clearRoutes, countRoutes } from '../storage/routes.js';

function render() {
  const favs = countFavorites();
  const routes = countRoutes();
  const metrics = document.querySelectorAll('.metric strong');
  if (metrics[0]) metrics[0].textContent = String(favs);
  if (metrics[1]) metrics[1].textContent = String(routes);

  const labels = document.querySelectorAll('.metric span');
  if (labels[0]) labels[0].textContent = `destino${favs === 1 ? '' : 's'} en favoritos`;
  if (labels[1]) labels[1].textContent = `ruta${routes === 1 ? '' : 's'} guardadas`;
}

function init() {
  render();

  const actions = document.querySelector('.profile-card .actions');
  if (actions && !document.getElementById('btn-clear-data')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-clear-data';
    btn.className = 'link-orange';
    btn.textContent = 'Borrar datos de este sitio';
    btn.addEventListener('click', () => {
      if (!confirm('¿Borrar favoritos y rutas de este navegador?')) return;
      clearFavorites();
      clearRoutes();
      render();
    });
    actions.appendChild(btn);
  }
}

init();
