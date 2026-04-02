const CACHE = 'bake-it-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Don't cache API calls
  if (url.pathname.startsWith('/api/')) return;

  // Network first for navigation
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/'))
    );
    return;
  }

  // Cache first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    })
  );
});

// ─── Timer notifications ──────────────────────────────────────────────────────
// The app posts messages to schedule/cancel step timers.
// We use setTimeout in the SW which survives tab close on most platforms.
// On iOS PWA the SW may be killed, so the app also uses a fallback.

const timers = new Map(); // stepId -> timeoutId

self.addEventListener('message', e => {
  const { type, stepId, stepName, delayMs, tag } = e.data || {};

  if (type === 'SCHEDULE_TIMER') {
    // Cancel any existing timer for this step
    if (timers.has(stepId)) clearTimeout(timers.get(stepId));

    if (delayMs <= 0) {
      // Already overdue — fire immediately
      fireNotification(stepId, stepName, tag);
      return;
    }

    const tid = setTimeout(() => {
      fireNotification(stepId, stepName, tag);
      timers.delete(stepId);
    }, delayMs);
    timers.set(stepId, tid);
  }

  if (type === 'CANCEL_TIMER') {
    if (timers.has(stepId)) {
      clearTimeout(timers.get(stepId));
      timers.delete(stepId);
    }
  }

  if (type === 'CANCEL_ALL_TIMERS') {
    for (const [, tid] of timers) clearTimeout(tid);
    timers.clear();
  }
});

function fireNotification(stepId, stepName, tag) {
  self.registration.showNotification('Step complete', {
    body: `${stepName || 'Step'} is done — time to move on.`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: tag || `step-${stepId}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 300],
    actions: [
      { action: 'open', title: 'Open Bake' },
    ],
  });
}

// When user taps the notification, focus the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});
