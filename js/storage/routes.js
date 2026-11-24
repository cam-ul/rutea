const KEY = 'rutea:routes';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function uid() {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getRoutes() {
  return read().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

export function getRoute(id) {
  return read().find((r) => r.id === id) || null;
}

export function saveRoute(input) {
  const list = read();
  const now = new Date().toISOString();

  if (input.id) {
    const idx = list.findIndex((r) => r.id === input.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...input, updatedAt: now };
      write(list);
      return list[idx];
    }
  }

  const route = {
    id: input.id || uid(),
    name: input.name || 'Sin nombre',
    destino: input.destino || '',
    code: input.code || '',
    viajeros: Number(input.viajeros) || 1,
    salida: input.salida || '',
    regreso: input.regreso || '',
    presupuesto: Number(input.presupuesto) || 0,
    comentarios: input.comentarios || '',
    days: Array.isArray(input.days) ? input.days : [],
    lat: input.lat ?? null,
    lon: input.lon ?? null,
    capital: input.capital || '',
    createdAt: now,
    updatedAt: now,
  };
  list.push(route);
  write(list);
  return route;
}

export function deleteRoute(id) {
  const next = read().filter((r) => r.id !== id);
  write(next);
  return next;
}

export function countRoutes() {
  return read().length;
}

export function clearRoutes() {
  write([]);
}

export function buildDaysFromComments(salida, regreso, comentarios) {
  if (!salida || !regreso) return [];
  const start = new Date(`${salida}T12:00:00`);
  const end = new Date(`${regreso}T12:00:00`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [];

  const days = [];
  const cursor = new Date(start);
  let i = 1;
  while (cursor <= end && i <= 14) {
    days.push({
      title: `Día ${i}`,
      note: i === 1 && comentarios ? comentarios : `Plan libre · día ${i}`,
    });
    cursor.setDate(cursor.getDate() + 1);
    i += 1;
  }
  if (days.length && comentarios) days[0].note = comentarios;
  return days;
}
