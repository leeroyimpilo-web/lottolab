import type { GameDefinition } from './games'
import { drawUnique, secureRandom } from './random'
import type { NumberStat } from './stats'

export type GeneratorMode = 'random' | 'balanced' | 'historical'

export const GENERATOR_MODES: { id: GeneratorMode; label: string; description: string }[] = [
  { id: 'random', label: 'Random', description: 'Every number has the same chance, like the real draw machine.' },
  { id: 'balanced', label: 'Balanced', description: 'A mix of odd and even, low and high numbers.' },
  { id: 'historical', label: 'Historical Mix', description: 'Blends often-drawn numbers with the rest.' },
]

export interface Combination {
  main: number[]
  bonus: number | null
}

function pickBonus(game: GameDefinition, main: number[]) {
  if (game.bonusKind === 'powerball') return Math.floor(secureRandom() * game.bonusMax) + 1
  return null
}

function isBalanced(game: GameDefinition, nums: number[]) {
  const odd = nums.filter((n) => n % 2).length
  const low = nums.filter((n) => n <= game.mainMax / 2).length
  const half = game.mainCount / 2
  return Math.abs(odd - half) <= 1 && Math.abs(low - half) <= 1
}

export function generateCombination(game: GameDefinition, mode: GeneratorMode, freq: NumberStat[] = []): Combination {
  let main: number[]

  if (mode === 'balanced') {
    main = drawUnique(game.mainCount, game.mainMax, secureRandom)
    for (let i = 0; i < 200 && !isBalanced(game, main); i++) main = drawUnique(game.mainCount, game.mainMax, secureRandom)
  } else if (mode === 'historical' && freq.length) {
    const sorted = [...freq].sort((a, b) => b.count - a.count)
    const top = sorted.slice(0, Math.ceil(game.mainMax / 3)).map((s) => s.number)
    const fromTop = Math.ceil(game.mainCount / 2)
    const picks = drawUnique(fromTop, top.length, secureRandom).map((i) => top[i - 1])
    const rest = drawUnique(game.mainCount - fromTop, game.mainMax, secureRandom, picks)
    main = [...picks, ...rest].sort((a, b) => a - b)
  } else {
    main = drawUnique(game.mainCount, game.mainMax, secureRandom)
  }

  return { main, bonus: pickBonus(game, main) }
}

export function generateMany(game: GameDefinition, mode: GeneratorMode, count: number, freq: NumberStat[] = []) {
  return Array.from({ length: count }, () => generateCombination(game, mode, freq))
}

export function formatCombination(game: GameDefinition, combo: Combination) {
  const main = combo.main.map((n) => n.toString().padStart(2, '0')).join(' ')
  if (combo.bonus && game.bonusKind === 'powerball') return `${main} | PB ${combo.bonus.toString().padStart(2, '0')}`
  return main
}
