import { cn } from '@/lib/utils'
import { motion, type SpringOptions, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'

export type AnimatedNumberProps = {
  value: number
  className?: string
  springOptions?: SpringOptions
  decimals?: number
}

/**
 * AnimatedNumber renders a physics-based spring counter that counts up to the target value.
 * Supports configurable decimal precision and locale string formatting.
 */
export function AnimatedNumber({
  value,
  className,
  springOptions = { bounce: 0, damping: 20, stiffness: 100 },
  decimals = 0,
}: AnimatedNumberProps) {
  const spring = useSpring(0, springOptions)
  const display = useTransform(spring, (current) => {
    if (decimals > 0) {
      return current.toFixed(decimals)
    }
    return Math.round(current).toLocaleString()
  })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <motion.span className={cn('tabular-nums font-mono', className)}>
      {display}
    </motion.span>
  )
}
