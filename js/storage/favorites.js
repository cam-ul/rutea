const KEY = 'rutea:favorites';

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

export function getFavorites() {
  return read().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

export function isFavorite(cca2) {
  return read().some((f) => f.cca2 === cca2);
}

export function addFavorite(snapshot) {
  if (!snapshot?.cca2) return { ok: false, list: read(), already: false };
  const list = read();
  if (list.some((f) => f.cca2 === snapshot.cca2)) {
    return { ok: true, list, already: true };
  }
  list.push({ ...snapshot, savedAt: snapshot.savedAt || new Date().toISOString() });
  write(list);
  return { ok: true, list, already: false };
}

export function removeFavorite(cca2) {
  const next = read().filter((f) => f.cca2 !== cca2);
  write(next);
  return next;
}

export function countFavorites() {
  return read().length;
}

export function clearFavorites() {
  write([]);
}
