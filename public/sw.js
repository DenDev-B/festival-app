self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, tag } = event.data
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
    })
  }
})