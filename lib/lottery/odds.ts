import type { GameDefinition } from './games'

export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return Math.round(r)
}

export interface DivisionRule {
  division: number
  label: string
  main: number
  bonus: boolean | null
}

const LOTTO_RULES: DivisionRule[] = [
  { division: 1, label: '6 numbers', main: 6, bonus: null },
  { division: 2, label: '5 + Bonus', main: 5, bonus: true },
  { division: 3, label: '5 numbers', main: 5, bonus: false },
  { division: 4, label: '4 + Bonus', main: 4, bonus: true },
  { division: 5, label: '4 numbers', main: 4, bonus: false },
  { division: 6, label: '3 + Bonus', main: 3, bonus: true },
  { division: 7, label: '3 numbers', main: 3, bonus: false },
  { division: 8, label: '2 + Bonus', main: 2, bonus: true },
]

const POWERBALL_RULES: DivisionRule[] = [
  { division: 1, label: '5 + PowerBall', main: 5, bonus: true },
  { division: 2, label: '5 numbers', main: 5, bonus: false },
  { division: 3, label: '4 + PowerBall', main: 4, bonus: true },
  { division: 4, label: '4 numbers', main: 4, bonus: false },
  { division: 5, label: '3 + PowerBall', main: 3, bonus: true },
  { division: 6, label: '3 numbers', main: 3, bonus: false },
  { division: 7, label: '2 + PowerBall', main: 2, bonus: true },
  { division: 8, label: '1 + PowerBall', main: 1, bonus: true },
  { division: 9, label: 'PowerBall only', main: 0, bonus: true },
]

const DAILY_RULES: DivisionRule[] = [
  { division: 1, label: '5 numbers', main: 5, bonus: null },
  { division: 2, label: '4 numbers', main: 4, bonus: null },
  { division: 3, label: '3 numbers', main: 3, bonus: null },
  { division: 4, label: '2 numbers', main: 2, bonus: null },
]

export function divisionRules(game: GameDefinition): DivisionRule[] {
  if (game.family === 'powerball') return POWERBALL_RULES
  if (game.family === 'daily') return DAILY_RULES
  return LOTTO_RULES
}

/** Exact probability of matching exactly k main balls. */
function mainMatchProbability(game: GameDefinition, k: number) {
  const { mainMax: n, mainCount: p } = game
  return (choose(p, k) * choose(n - p, p - k)) / choose(n, p)
}

/** Probability for a single board to land in a division, from first principles. */
export function divisionProbability(game: GameDefinition, rule: DivisionRule): number {
  const pMain = mainMatchProbability(game, rule.main)
  if (rule.bonus === null) return pMain
  if (game.family === 'powerball') {
    const pb = 1 / game.bonusMax
    return pMain * (rule.bonus ? pb : 1 - pb)
  }
  // Lotto: the bonus is drawn from the balls left in the drum after the main draw.
  const remaining = game.mainMax - game.mainCount
  const pBonus = (game.mainCount - rule.main) / remaining
  return pMain * (rule.bonus ? pBonus : 1 - pBonus)
}

export function divisionOdds(game: GameDefinition, rule: DivisionRule) {
  return Math.round(1 / divisionProbability(game, rule))
}

export function jackpotOdds(game: GameDefinition) {
  return divisionOdds(game, divisionRules(game)[0])
}

export function anyPrizeOdds(game: GameDefinition) {
  const p = divisionRules(game).reduce((s, r) => s + divisionProbability(game, r), 0)
  return 1 / p
}

export function matchDivision(
  game: GameDefinition,
  mainMatches: number,
  bonusMatched: boolean,
): DivisionRule | null {
  for (const rule of divisionRules(game)) {
    if (rule.main !== mainMatches) continue
    if (rule.bonus === null || rule.bonus === bonusMatched) return rule
  }
  return null
}
