const randFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
})

const randFormatterCents = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
})

export function formatRand(value: number, cents = false) {
  return (cents ? randFormatterCents : randFormatter).format(value)
}

export function formatCompactRand(value: number) {
  if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m`
  if (value >= 1_000) return `R${Math.round(value / 1_000)}k`
  return `R${Math.round(value)}`
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-ZA').format(value)
}

export function formatDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', ...opts })
}

export function formatDayDate(iso: string | Date) {
  return formatDate(iso, { weekday: 'short' })
}

export function formatRelative(timestamp: number | null, now = Date.now()) {
  if (!timestamp) return 'Never'
  const diff = Math.max(0, now - timestamp)
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  return formatDate(new Date(timestamp))
}

export function formatOdds(odds: number) {
  return `1 in ${formatNumber(Math.round(odds))}`
}

export function pad(n: number) {
  return n.toString().padStart(2, '0')
}
