# Maui Trip 2026

An offline-first, iPhone-focused itinerary hosted at:

<https://pelleindc-stack.github.io/maui-trip-2026/>

## Install on iPhone

1. Open the site in **Safari**.
2. Tap **Share**.
3. Scroll down and tap **Add to Home Screen**.
4. Turn on **Open as Web App**, then tap **Add**.
5. Launch it once while online. The header will confirm **Ready offline**.

Apple Maps navigation is separate from the web app cache. Download the West Maui offline map in Apple Maps before the Sunday drive.

## Local preview under the GitHub Pages base path

From the directory that contains this repository:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/maui-trip-2026/>. Testing from the parent directory reproduces the production `/maui-trip-2026/` path.

## Offline design

The service worker precaches the complete app shell, including the itinerary, icons and route map. Navigations use a network-first strategy with the cached itinerary as fallback. Same-origin assets use cache-first behavior. Apple Maps links intentionally remain external.
