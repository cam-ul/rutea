const DURATION = { info: 4500, warn: 6500, error: 8000 };
const MAX = 3;

let host = null;
let seq = 0;

function ensureHost() {
  if (host && document.body.contains(host)) return host;
  host = document.createElement('div');
  host.className = 'ui-toasts';
  host.setAttribute('role', 'status');
  host.setAttribute('aria-live', 'polite');
  document.body.appendChild(host);
  return host;
}

function dismiss(el) {
  if (!el) return;
  el.classList.add('ui-toast--out');
  setTimeout(() => el.remove(), 220);
}

export function showToast(message, tone = 'info') {
  if (!message) return;
  const root = ensureHost();
  while (root.children.length >= MAX) {
    root.firstElementChild?.remove();
  }

  const id = `toast-${seq++}`;
  const el = document.createElement('div');
  el.className = `ui-toast ui-toast--${tone}`;
  el.id = id;
  el.innerHTML = `
    <span class="ui-toast__msg"></span>
    <button type="button" class="ui-toast__close" aria-label="Cerrar aviso">×</button>
  `;
  el.querySelector('.ui-toast__msg').textContent = message;
  el.querySelector('.ui-toast__close').addEventListener('click', () => dismiss(el));
  root.appendChild(el);

  const ms = DURATION[tone] || DURATION.info;
  setTimeout(() => dismiss(el), ms);
}

export function showToasts(messages, tone = 'warn') {
  (messages || []).filter(Boolean).forEach((m) => showToast(m, tone));
}
