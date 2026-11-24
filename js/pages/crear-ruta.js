import { getByCode, searchByName } from '../api/countries.js';
import { getFavorites } from '../storage/favorites.js';
import { buildDaysFromComments, getRoute, saveRoute } from '../storage/routes.js';
import { escapeHtml, qs } from '../utils.js';

function fieldError(input, message) {
  let err = input.parentElement.querySelector('.field-error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error';
    input.parentElement.appendChild(err);
  }
  err.textContent = message || '';
  input.classList.toggle('input-invalid', Boolean(message));
}

function validate(form) {
  let ok = true;
  const nombre = form.nombre;
  const destino = form.destino;
  const viajeros = form.viajeros;
  const salida = form.salida;
  const regreso = form.regreso;
  const presupuesto = form.presupuesto;

  if (!nombre.value.trim()) {
    fieldError(nombre, 'Indica un nombre para el viaje.');
    ok = false;
  } else fieldError(nombre, '');

  if (!destino.value.trim()) {
    fieldError(destino, 'Indica un destino.');
    ok = false;
  } else fieldError(destino, '');

  if (!viajeros.value || Number(viajeros.value) < 1) {
    fieldError(viajeros, 'Al menos 1 viajero.');
    ok = false;
  } else fieldError(viajeros, '');

  if (!salida.value) {
    fieldError(salida, 'Fecha de salida requerida.');
    ok = false;
  } else fieldError(salida, '');

  if (!regreso.value) {
    fieldError(regreso, 'Fecha de regreso requerida.');
    ok = false;
  } else if (salida.value && regreso.value < salida.value) {
    fieldError(regreso, 'El regreso debe ser posterior a la salida.');
    ok = false;
  } else fieldError(regreso, '');

  if (presupuesto.value === '' || Number(presupuesto.value) < 0) {
    fieldError(presupuesto, 'Presupuesto inválido.');
    ok = false;
  } else fieldError(presupuesto, '');

  return ok;
}

function readDayNotes() {
  return Array.from(document.querySelectorAll('#days-fields textarea[data-day]')).map((ta, i) => ({
    title: `Día ${i + 1}`,
    note: ta.value.trim() || `Plan libre · día ${i + 1}`,
  }));
}

function renderDaysEditor(salida, regreso, existingDays = [], comentarios = '') {
  const wrap = document.getElementById('days-editor');
  const fields = document.getElementById('days-fields');
  if (!wrap || !fields) return;

  const draft = buildDaysFromComments(salida, regreso, comentarios);
  if (!draft.length) {
    wrap.hidden = true;
    fields.innerHTML = '';
    return;
  }

  wrap.hidden = false;
  fields.innerHTML = draft
    .map((d, i) => {
      const prev = existingDays[i]?.note;
      const note =
        prev && prev !== `Plan libre · día ${i + 1}`
          ? prev
          : i === 0 && comentarios
            ? comentarios
            : d.note;
      return `
        <div class="field">
          <label for="day-note-${i}">${escapeHtml(d.title)}</label>
          <textarea id="day-note-${i}" data-day="${i}" rows="2" placeholder="Qué quieres hacer este día…">${escapeHtml(note === `Plan libre · día ${i + 1}` ? '' : note)}</textarea>
        </div>`;
    })
    .join('');
}

function fillForm(data) {
  const form = document.getElementById('route-form');
  if (!form || !data) return;
  form.nombre.value = data.name || '';
  form.destino.value = data.destino || '';
  form.code.value = data.code || '';
  form.viajeros.value = data.viajeros || 1;
  form.salida.value = data.salida || '';
  form.regreso.value = data.regreso || '';
  form.presupuesto.value = data.presupuesto ?? '';
  form.comentarios.value = data.comentarios || '';
  if (data.id) form.dataset.id = data.id;
  renderDaysEditor(data.salida, data.regreso, data.days || [], data.comentarios || '');
}

function fillDatalist() {
  const list = document.getElementById('destinos-list');
  if (!list) return;
  const favs = getFavorites();
  list.innerHTML = favs
    .map((f) => `<option value="${escapeHtml(f.name)}" data-code="${escapeHtml(f.cca2)}"></option>`)
    .join('');
}

async function resolveDestinationMeta(destino, code) {
  try {
    if (code) {
      const c = await getByCode(code);
      if (c) {
        return {
          code: c.cca2,
          destino: c.name.common,
          capital: c.capital?.[0] || '',
          lat: c.latlng?.[0] ?? null,
          lon: c.latlng?.[1] ?? null,
        };
      }
    }
    const results = await searchByName(destino);
    const c = results[0];
    if (c) {
      return {
        code: c.cca2,
        destino: c.name.common,
        capital: c.capital?.[0] || '',
        lat: c.latlng?.[0] ?? null,
        lon: c.latlng?.[1] ?? null,
      };
    }
  } catch {}
  return { code: code || '', destino, capital: '', lat: null, lon: null };
}

function lockDestino(form, reason = '') {
  const input = form.destino;
  if (!input) return;
  input.readOnly = true;
  input.removeAttribute('list');
  input.classList.add('input-locked');
  input.setAttribute('aria-readonly', 'true');
  let hint = input.parentElement.querySelector('.field-hint');
  if (!hint) {
    hint = document.createElement('span');
    hint.className = 'field-hint meta';
    input.parentElement.appendChild(hint);
  }
  hint.textContent = reason || 'Destino fijado para esta ruta.';
}

async function init() {
  const form = document.getElementById('route-form');
  const head = document.querySelector('.page-head');
  fillDatalist();

  const id = qs('id');
  const destinoQ = qs('destino');
  const codeQ = qs('code');
  let existingDays = [];
  let lockDestination = false;

  if (id) {
    const route = getRoute(id);
    if (route) {
      existingDays = route.days || [];
      fillForm(route);
      lockDestination = Boolean(route.destino || route.code);
      if (head) {
        head.querySelector('.eyebrow').textContent = 'EDITAR RUTA';
        head.querySelector('h1').textContent = route.name;
        head.querySelector('.lead').textContent =
          'Estás editando un plan existente. Guardar actualiza solo esta ruta; el resto de Mis rutas no cambia.';
      }
      document.title = `Editar ruta · RUTEA`;
    }
  } else {
    if (head) {
      head.querySelector('.eyebrow').textContent = 'CREAR RUTA';
      head.querySelector('h1').textContent = 'Nueva ruta de viaje';
      head.querySelector('.lead').textContent =
        'Cada guardado añade un plan nuevo a Mis rutas. Define destino, fechas, presupuesto y una nota por día.';
    }
    document.title = 'Crear ruta · RUTEA';
    if (destinoQ) form.destino.value = destinoQ;
    if (codeQ) form.code.value = codeQ;
    if (codeQ && !destinoQ) {
      try {
        const c = await getByCode(codeQ);
        if (c) {
          form.destino.value = c.name.common;
          form.code.value = c.cca2;
        }
      } catch {
        /* dejamos el code de la query */
      }
    }
    if (form.destino.value && !form.nombre.value) {
      form.nombre.value = `Viaje a ${form.destino.value}`;
    }
    lockDestination = Boolean(destinoQ || codeQ);
  }

  if (lockDestination && form.destino.value.trim()) {
    lockDestino(
      form,
      'Destino fijado desde la ficha o la ruta. Para otro país, crea una ruta nueva.'
    );
  }

  const syncDays = () => {
    const current = readDayNotes();
    renderDaysEditor(
      form.salida.value,
      form.regreso.value,
      current.length ? current : existingDays,
      form.comentarios.value.trim()
    );
  };

  form.salida.addEventListener('change', syncDays);
  form.regreso.addEventListener('change', syncDays);
  form.comentarios.addEventListener('blur', () => {
    if (!document.querySelector('#days-fields textarea')) syncDays();
  });

  form.destino.addEventListener('change', () => {
    const fav = getFavorites().find(
      (f) => f.name.toLowerCase() === form.destino.value.trim().toLowerCase()
    );
    if (fav) form.code.value = fav.cca2;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Guardando…';
    }

    const meta = await resolveDestinationMeta(form.destino.value.trim(), form.code.value.trim());
    let days = readDayNotes();
    if (!days.length) {
      days = buildDaysFromComments(
        form.salida.value,
        form.regreso.value,
        form.comentarios.value.trim()
      );
    }

    const payload = {
      id: form.dataset.id || undefined,
      name: form.nombre.value.trim(),
      destino: meta.destino || form.destino.value.trim(),
      code: meta.code,
      viajeros: Number(form.viajeros.value),
      salida: form.salida.value,
      regreso: form.regreso.value,
      presupuesto: Number(form.presupuesto.value),
      comentarios: form.comentarios.value.trim(),
      capital: meta.capital,
      lat: meta.lat,
      lon: meta.lon,
      days,
    };

    const saved = saveRoute(payload);
    window.location.href = `detalle-ruta.html?id=${encodeURIComponent(saved.id)}`;
  });
}

init();
