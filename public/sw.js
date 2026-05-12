// A simple dummy service worker to trigger the PWA install prompt.
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Let the browser do its default thing
});
