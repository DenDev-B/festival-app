const STORAGE_KEY = 'festival_reminders'

export function getReminders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch { return [] }
}

export function saveReminder(reminder) {
  const reminders = getReminders()
  const exists = reminders.find(r => r.performanceId === reminder.performanceId)
  if (exists) return false
  reminders.push(reminder)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
  return true
}

export function removeReminder(performanceId) {
  const reminders = getReminders().filter(r => r.performanceId !== performanceId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

export function hasReminder(performanceId) {
  return getReminders().some(r => r.performanceId === performanceId)
}

export function clearOldReminders() {
  const now = new Date()
  const reminders = getReminders().filter(r => new Date(r.end) > now)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}
