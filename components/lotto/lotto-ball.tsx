'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const TONES = ['cyan', 'blue', 'violet', 'silver'] as const

const SIZES = {
  xs: 'size-7 text-[11px]',
  sm: 'size-9 text-[13px]',
  md: 'size-[38px] text-[15px] min-[400px]:size-11 min-[400px]:text-base',
  lg: 'size-13 text-lg',
  xl: 'size-16 text-2xl',
} as const

export type BallSize = keyof typeof SIZES

export function ballTone(n: number) {
  return TONES[Math.floor((n - 1) / 10) % TONES.length]
}

interface LottoBallProps {
  number: number | null
  size?: BallSize
  bonus?: boolean
  muted?: boolean
  highlight?: boolean
  revealIndex?: number
  className?: string
  label?: string
}

export function LottoBall({ number, size = 'md', bonus, muted, highlight, revealIndex, className, label }: LottoBallProps) {
  const tone = muted || number === null ? 'muted' : bonus ? 'bonus' : ballTone(number)
  const content = (
    <span
      className={cn('lotto-ball', SIZES[size], highlight && 'ring-2 ring-success ring-offset-2 ring-offset-background', className)}
      data-tone={tone}
      role="img"
      aria-label={label ?? (number === null ? 'Empty ball' : `${bonus ? 'Bonus ' : ''}${number}`)}
    >
      <span className="lotto-ball__face" aria-hidden="true">
        {number ?? '–'}
      </span>
    </span>
  )

  if (revealIndex === undefined) return content

  return (
    <motion.span
      className="inline-flex"
      initial={{ opacity: 0, y: -18, scale: 0.4, rotate: -120 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: revealIndex * 0.08 }}
    >
      {content}
    </motion.span>
  )
}

interface BallRowProps {
  main: number[]
  bonus?: number | null
  bonusLabel?: string | null
  size?: BallSize
  matches?: number[]
  bonusMatched?: boolean
  animate?: boolean
  animationKey?: string
  className?: string
}

export function BallRow({ main, bonus, bonusLabel, size = 'md', matches, bonusMatched, animate, animationKey, className }: BallRowProps) {
  return (
    <div key={animationKey} className={cn('flex flex-wrap items-center gap-1 min-[400px]:gap-1.5', className)}>
      {main.map((n, i) => (
        <LottoBall
          key={`${animationKey}-${n}`}
          number={n}
          size={size}
          highlight={matches?.includes(n)}
          revealIndex={animate ? i : undefined}
        />
      ))}
      {bonus != null && (
        <>
          <span className="mx-0.5 text-lg font-light text-muted-foreground" aria-hidden="true">
            +
          </span>
          <LottoBall
            number={bonus}
            size={size}
            bonus
            highlight={bonusMatched}
            revealIndex={animate ? main.length : undefined}
            label={`${bonusLabel ?? 'Bonus'} ${bonus}`}
          />
        </>
      )}
    </div>
  )
}
