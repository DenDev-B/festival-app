export async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error)
  }
}

export function scheduleNotification({ performanceId, title, venueName, start, minutesBefore }) {
  const notifyAt = new Date(start).getTime() - minutesBefore * 60 * 1000
  const now = Date.now()
  const delay = notifyAt - now
  if (delay < 0) return null

  const timeoutId = setTimeout(async () => {
    const sw = await navigator.serviceWorker?.ready
    if (sw) {
      sw.active.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title: `🔔 ${title}`,
        body: `${venueName} — через ${minutesBefore} мин`,
        tag: performanceId,
      })
    } else {
      new Notification(`🔔 ${title}`, {
        body: `${venueName} — через ${minutesBefore} мин`,
        tag: performanceId,
      })
    }
  }, delay)

  return timeoutId
}

export function cancelNotification(timeoutId) {
  if (timeoutId) clearTimeout(timeoutId)
}