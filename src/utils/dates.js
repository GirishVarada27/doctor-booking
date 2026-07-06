const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
]

function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Returns the next `count` dates (from today) where the doctor works.
export function getAvailableDates(workDays, count = 6) {
  const dates = []
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  while (dates.length < count) {
    if (workDays.includes(cursor.getDay())) {
      dates.push({
        key: toDateKey(cursor),
        label: `${DAY_LABELS[cursor.getDay()]}, ${MONTH_LABELS[cursor.getMonth()]} ${cursor.getDate()}`,
      })
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}
