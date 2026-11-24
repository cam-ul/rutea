import {
  bindPhotoFallback,
  brandedPlaceholder,
  getDestinationImage,
} from '../media/destinations.js';
import { getFavorites, removeFavorite } from '../storage/favorites.js';
import {
  createRouteUrl,
  detailUrl,
  escapeHtml,
  regionLabel,
  relativeSavedAt,
  skeletonList,
} from '../utils.js';

async function render() {
  const list = getFavorites();
  const stack = document.querySelector('main .stack');
  const lead = document.querySelector('.page-head .lead');
  if (!stack) return;

  if (lead) {
    lead.textContent =
      list.length === 0
        ? 'Aún no hay destinos en este dispositivo. Explora y guárdalos desde las fichas.'
        : `${list.length} destino${list.length === 1 ? '' : 's'} en este dispositivo. RUTEA evita duplicados.`;
  }

  if (!list.length) {
    stack.innerHTML = `
      <div class="card empty-card">
        <p class="eyebrow">SI LA LISTA ESTÁ VACÍA</p>
        <h3>Todavía no hay destinos guardados</h3>
        <p>Explora y usa "Agregar a favoritos". La selección permanece en este navegador.</p>
        <div class="actions">
          <a href="explorar.html" class="btn btn-orange">Explorar destinos</a>
        </div>
      </div>
    `;
    return;
  }

  stack.innerHTML = skeletonList('fav', Math.min(list.length, 4));

  const photos = await Promise.all(
    list.map(async (f) => {
      if (f.photo && !f.photo.startsWith('data:')) {
        return f.photo;
      }
      return (
        (await getDestinationImage({
          cca2: f.cca2,
          name: { common: f.name, commonEn: f.name },
          capital: f.capital ? [f.capital] : [],
        })) || brandedPlaceholder(f.name)
      );
    })
  );

  stack.innerHTML = list
    .map((f, i) => {
      const photo = photos[i];
      return `
    <article class="card fav-card" data-code="${escapeHtml(f.cca2)}">
      <img class="photo thumb" src="${escapeHtml(photo)}" alt="${escapeHtml(f.name)}" loading="lazy">
      <div class="fav-info">
        <h3>${escapeHtml(f.flagEmoji || '')} ${escapeHtml(f.name)}</h3>
        <p class="meta">${escapeHtml(f.capital || '—')} · ${escapeHtml(regionLabel(f.region))} · ${escapeHtml(relativeSavedAt(f.savedAt))}</p>
        <div class="actions">
          <a href="${detailUrl(f.cca2)}" class="btn btn-navy">Ver detalle</a>
          <a href="${createRouteUrl({ destino: f.name, code: f.cca2 })}" class="btn btn-outline">Pasar a ruta</a>
        </div>
      </div>
      <button type="button" class="link-orange fav-remove" data-code="${escapeHtml(f.cca2)}">Quitar</button>
    </article>`;
    })
    .join('');

  bindPhotoFallback(stack);

  stack.querySelectorAll('.fav-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFavorite(btn.dataset.code);
      render();
    });
  });
}

function init() {
  const stack = document.querySelector('main .stack');
  if (stack) stack.innerHTML = skeletonList('fav', 2);
  requestAnimationFrame(() => render());
}

init();
