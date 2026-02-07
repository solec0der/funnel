const CACHE_NAME = "funnel-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Network-first strategy
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {
    title: "Funnel",
    body: "New notification",
  };

  const tag = data.tag || data.notificationId || "funnel-default";
  const isCritical = data.priority === "critical";

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag,
      requireInteraction: isCritical,
      data: {
        url: data.url || "/",
        notificationId: data.notificationId,
        priority: data.priority,
      },
      actions: [
        { action: "open", title: "Open" },
        { action: "archive", title: "Archive" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { url, notificationId } = event.notification.data || {};

  if (event.action === "archive" && notificationId) {
    // POST to archive endpoint, then focus app
    event.waitUntil(
      fetch(`/api/notifications/${notificationId}/archive`, {
        method: "POST",
      })
        .catch(() => {})
        .then(() => focusOrOpen(url || "/"))
    );
    return;
  }

  // Default: open the notification URL
  event.waitUntil(focusOrOpen(url || "/"));
});

async function focusOrOpen(url) {
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of windowClients) {
    if (client.url === url && "focus" in client) {
      return client.focus();
    }
  }

  return clients.openWindow(url);
}
