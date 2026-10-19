/**
 * Use at Android packaging time to include verified historical source records
 * directly inside the APK. A failed download is a build failure: never
 * distribute an empty or fabricated offline archive.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const FEED = 'https://bettip.co.za/api/v1/lotto/draws.json'
const DEST = path.join(process.cwd(), 'public', 'data', 'lotto-seed.json')
const eraStart = '2026-06-01'
const games = {
  lotto: [6, 52, 52],
  'lotto-plus-1': [6, 52, 52],
  'lotto-5-max': [6, 52, 52],
  powerball: [5, 50, 16],
  'powerball-plus': [5, 50, 16],
  'powerball-xtra': [5, 50, 16],
  'daily-lotto': [5, 36, 0],
}

function normalize(row) {
  if (!row || !Object.hasOwn(games, row.game)) return null
  const [count, max, bonusMax] = games[row.game]
  if (typeof row.date !== 'string' || row.date < eraStart || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) return null
  if (!Array.isArray(row.numbers) || row.numbers.length !== count) return null
  if (row.numbers.some((n) => !Number.isInteger(n) || n < 1 || n > max)) return null
  if (new Set(row.numbers).size !== count) return null
  const bonus = row.bonusBall == null ? null : row.bonusBall
  if (bonusMax > 0 && (!Number.isInteger(bonus) || bonus < 1 || bonus > bonusMax)) return null
  if (!bonusMax && bonus !== null) return null
  if (row.game.startsWith('lotto') && row.numbers.includes(bonus)) return null
  return {
    game: row.game,
    date: row.date,
    numbers: row.numbers,
    bonusBall: bonus,
    verified: row.verified === true,
    official: row.official === true,
  }
}

const response = await fetch(FEED, { signal: AbortSignal.timeout(45000) })
if (!response.ok) throw Error(\`Draw snapshot failed: HTTP \${response.status}\`)
const payload = await response.json()
if (!Array.isArray(payload.data)) throw Error('Draw snapshot failed: unrecognized source data')
const all = payload.data.map(normalize).filter(Boolean)
const unique = [...new Map(all.map((row) => [\`\${row.game}:\${row.date}\`, row])).values()]
if (unique.length < 20) throw Error('Draw snapshot failed: current-era history looks incomplete')
await mkdir(path.dirname(DEST), { recursive: true })
await writeFile(DEST, JSON.stringify(unique) + '\n', 'utf8')
console.log(\`Bundled \${unique.length} real draw records from BetTip; current-rule era only.\`)
