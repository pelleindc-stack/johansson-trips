const APP_BASE = new URL('./', document.baseURI).pathname;

const stops = [
  { name: 'Kapalua Bay Parking', time: 'Arrive 8:50 AM', note: 'Beach and trail start.', map: 'https://maps.apple.com/?daddr=20.997744,-156.666019&q=Kapalua%20Bay%20Public%20Parking&dirflg=d' },
  { name: 'Kapalua Coastal Trail', time: 'Start 9:00 AM', note: "Walk toward Oneloa and Dragon's Teeth.", map: 'https://maps.apple.com/?daddr=20.997744,-156.666019&q=Kapalua%20Bay%20Public%20Parking&dirflg=d' },
  { name: "Dragon's Teeth Parking", time: 'Arrive 10:45 AM', note: '30–45 minute side walk.', map: 'https://maps.apple.com/?daddr=Dragon%27s%20Teeth%20Access%20Trail%2C%20Lower%20Honoapiilani%20Rd%2C%20Lahaina%2C%20HI%2096761&dirflg=d' },
  { name: 'D.T. Fleming Beach', time: 'Arrive 11:30 AM', note: 'Short beach/restroom stop.', map: 'https://maps.apple.com/?daddr=D.T.%20Fleming%20Park%2C%20Lower%20Honoapiilani%20Rd%2C%20Lahaina%2C%20HI%2096761&dirflg=d' },
  { name: 'Honolua Bay Lookout', time: 'Arrive 12:00 PM', note: 'Lookout or short forest walk.', map: 'https://maps.apple.com/?daddr=Honolua%20Bay%20Lookout%2C%20Honoapiilani%20Hwy%2C%20Lahaina%2C%20HI%2096761&dirflg=d' },
  { name: 'Honolua Store', time: 'Arrive 12:45 PM', note: 'Quick lunch.', map: 'https://maps.apple.com/?daddr=Honolua%20Store%2C%20502%20Office%20Rd%2C%20Lahaina%2C%20HI%2096761&dirflg=d' },
  { name: 'Nakalele Blowhole Parking', time: 'Arrive 1:45 PM', note: 'Stay well back on dry rock. Turn around here.', map: 'https://maps.apple.com/?daddr=21.024424,-156.590498&q=Nakalele%20Blowhole%20Parking&dirflg=d' },
  { name: 'Return to Westin', time: 'Leave 3:15 PM', note: 'Return the same way. Arrive 4:30–5:00 PM.', map: 'https://maps.apple.com/?daddr=The%20Westin%20Ka%27anapali%20Ocean%20Resort%20Villas%2C%206%20Kai%20Ala%20Dr%2C%20Lahaina%2C%20HI%2096761&dirflg=d' }
];

const storage = {
  get(key, fallback) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private mode may reject storage. */ } }
};

const tabs = [...document.querySelectorAll('.tabs button')];
const panels = [...document.querySelectorAll('.panel')];
function selectTab(id, updateHash = true) {
  if (!document.getElementById(id)) id = 'today';
  tabs.forEach(button => {
    const selected = button.dataset.tab === id;
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
selectTab(location.hash.slice(1) || 'today', false);

document.querySelectorAll('.checklist input').forEach((checkbox, index) => {
  const key = `maui-check-${index}`;
  checkbox.checked = storage.get(key, '0') === '1';
  checkbox.addEventListener('change', () => storage.set(key, checkbox.checked ? '1' : '0'));
});

const heading = document.getElementById('next-stop-heading');
const time = document.getElementById('next-stop-time');
const note = document.getElementById('next-stop-note');
const mapLink = document.getElementById('next-stop-map');
const progress = document.getElementById('stop-progress');
const previous = document.getElementById('previous-stop');
const complete = document.getElementById('complete-stop');
const timelineItems = [...document.querySelectorAll('#timeline li[data-stop-index]')];
let stopIndex = Math.min(Math.max(Number(storage.get('maui-next-stop', '0')) || 0, 0), stops.length - 1);

function renderStop(focus = false) {
  const stop = stops[stopIndex];
  heading.textContent = stop.name;
  time.textContent = stop.time;
  note.textContent = stop.note;
  mapLink.href = stop.map;
  progress.textContent = `${stopIndex + 1} of ${stops.length}`;
  previous.disabled = stopIndex === 0;
  complete.textContent = stopIndex === stops.length - 1 ? 'Route complete ✓' : 'Mark visited →';
  timelineItems.forEach((item, index) => {
    item.classList.toggle('current', index === stopIndex);
    item.classList.toggle('visited', index < stopIndex);
    if (index === stopIndex) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
  });
  storage.set('maui-next-stop', String(stopIndex));
  if (focus) heading.focus({ preventScroll: true });
}
complete.addEventListener('click', () => { if (stopIndex < stops.length - 1) { stopIndex += 1; renderStop(true); } });
previous.addEventListener('click', () => { if (stopIndex > 0) { stopIndex -= 1; renderStop(true); } });
document.getElementById('reset-route').addEventListener('click', () => { stopIndex = 0; renderStop(true); });
timelineItems.forEach(item => item.querySelector('button').addEventListener('click', () => { stopIndex = Number(item.dataset.stopIndex); renderStop(); document.querySelector('.next-stop').scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
renderStop();

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
