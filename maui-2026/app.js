const APP_BASE = new URL('./', document.baseURI).pathname;

const tabs = [...document.querySelectorAll('.tabs button')];
const panels = [...document.querySelectorAll('.panel')];
function selectTab(id, updateHash = true) {
  if (!document.getElementById(id)) id = 'today';
  tabs.forEach(button => {
    const selected = button.dataset.tab === id || (button.dataset.tab === 'more' && (id === 'photos' || id === 'maps' || id === 'hikes'));
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

const photoLinks = [...document.querySelectorAll('.photo-grid a')];
const viewer = document.getElementById('photo-viewer');
const viewerImage = document.getElementById('viewer-image');
const viewerCaption = document.getElementById('viewer-caption');
const viewerCounter = document.getElementById('viewer-counter');
const viewerPrevious = document.getElementById('viewer-previous');
const viewerNext = document.getElementById('viewer-next');
const viewerClose = document.getElementById('viewer-close');
let photoIndex = 0;
let touchStartX = 0;

function renderPhoto() {
  const link = photoLinks[photoIndex];
  const thumbnail = link.querySelector('img');
  viewerImage.src = link.href;
  viewerImage.alt = thumbnail.alt;
  viewerCaption.textContent = link.closest('figure').querySelector('figcaption').textContent;
  viewerCounter.textContent = `${photoIndex + 1} of ${photoLinks.length}`;
}

function movePhoto(direction) {
  photoIndex = (photoIndex + direction + photoLinks.length) % photoLinks.length;
  renderPhoto();
}

photoLinks.forEach((link, index) => {
  link.setAttribute('aria-haspopup', 'dialog');
  link.addEventListener('click', event => {
    event.preventDefault();
    photoIndex = index;
    renderPhoto();
    viewer.showModal();
    document.body.classList.add('viewer-open');
  });
});

viewerPrevious.addEventListener('click', () => movePhoto(-1));
viewerNext.addEventListener('click', () => movePhoto(1));
viewerClose.addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => document.body.classList.remove('viewer-open'));
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') movePhoto(-1);
  if (event.key === 'ArrowRight') movePhoto(1);
});
viewer.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
viewer.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 45) movePhoto(distance > 0 ? -1 : 1);
}, { passive: true });

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
      // Remove the legacy repository-wide worker left by the single-trip site.
      const legacyScope = new URL('../', document.baseURI).href;
      const legacyRegistration = await navigator.serviceWorker.getRegistration(legacyScope);
      if (legacyRegistration && legacyRegistration.scope === legacyScope) await legacyRegistration.unregister();
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
