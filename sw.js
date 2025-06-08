// sw.js - Service Worker

self.addEventListener('install', event => {
  // Activate immediately after installation
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

// Listen for push events or notification triggers
// For now, we only handle notification display requests sent from the page

self.addEventListener('notificationclick', event => {
  event.notification.close();

  // Focus or open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
