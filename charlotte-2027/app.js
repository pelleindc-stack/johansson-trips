const APP_BASE = new URL('./', document.baseURI).pathname;
const tabs = [...document.querySelectorAll('.tabs button')];
const panels = [...document.querySelectorAll('.panel')];

function selectTab(id, updateHash = true) {
  if (!document.getElementById(id)) id = 'monday';
  tabs.forEach(button => {
    const active = button.dataset.tab === id;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  panels.forEach(panel => { const active = panel.id === id; panel.hidden = !active; panel.classList.toggle('active', active); });
  if (updateHash) history.replaceState(null, '', id === 'monday' ? location.pathname : `#${id}`);
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

tabs.forEach(button => button.addEventListener('click', () => selectTab(button.dataset.tab)));
window.addEventListener('hashchange', () => selectTab(location.hash.slice(1), false));
selectTab(location.hash.slice(1) || 'monday', false);

const connection = document.getElementById('connection-status');
const connectionLabel = document.getElementById('connection-label');
function updateConnection(state, label) { connection.className = `connection ${state}`; connectionLabel.textContent = label; }
function networkState() { if (!navigator.onLine) updateConnection('offline', 'Offline · ready'); else if (!navigator.serviceWorker?.controller) updateConnection('', 'Online · saving'); }
addEventListener('online', networkState); addEventListener('offline', networkState); networkState();

if ('serviceWorker' in navigator) addEventListener('load', async () => {
  try {
    const registration = await navigator.serviceWorker.register(`${APP_BASE}service-worker.js`, { scope: APP_BASE });
    await navigator.serviceWorker.ready;
    updateConnection('ready', navigator.onLine ? 'Ready offline' : 'Offline · ready');
    registration.update().catch(() => {});
  } catch { updateConnection('', navigator.onLine ? 'Online only' : 'Offline unavailable'); }
});
