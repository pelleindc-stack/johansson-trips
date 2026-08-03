const APP_BASE = new URL('./', document.baseURI).pathname;

const tabs = [...document.querySelectorAll('.tabs button')];
const panels = [...document.querySelectorAll('.panel')];
function selectTab(id, updateHash = true) {
  if (!document.getElementById(id)) id = 'today';
  tabs.forEach(button => {
    const selected = button.dataset.tab === id || (button.dataset.tab === 'more' && (id === 'maps' || id === 'hikes'));
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  panels.forEach(panel => {
    const selected = panel.id === id;
    panel.classList.toggle('active', selected);
    panel.hidden = !selected;
  });
  if (updateHash) history.replaceState(null, '', id === 'today' ? location.pathname + location.search : `#${id}`);
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
tabs.forEach(button => button.addEventListener('click', () => selectTab(button.dataset.tab)));
document.querySelectorAll('[data-open-panel]').forEach(button => button.addEventListener('click', () => selectTab(button.dataset.openPanel)));
selectTab(location.hash.slice(1) || 'today', false);

const connection = document.getElementById('connection-status');
const connectionLabel = document.getElementById('connection-label');
function showConnection(state, label) {
  connection.className = `connection ${state}`;
  connectionLabel.textContent = label;
}
function updateNetworkStatus() {
  if (!navigator.onLine) showConnection('offline', 'Offline · ready');
  else if (!navigator.serviceWorker?.controller) showConnection('', 'Online · saving');
}
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);
updateNetworkStatus();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(`${APP_BASE}service-worker.js`, { scope: APP_BASE });
      await navigator.serviceWorker.ready;
      showConnection('ready', navigator.onLine ? 'Ready offline' : 'Offline · ready');
      registration.update().catch(() => {});
    } catch {
      showConnection('', navigator.onLine ? 'Online only' : 'Offline unavailable');
    }
  });
} else {
  showConnection('', navigator.onLine ? 'Online only' : 'Offline unavailable');
}
