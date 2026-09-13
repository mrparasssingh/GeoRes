import { type ReactNode, useRef, useState } from 'react'
import {
  motion,
  useInView,
  type Variant,
  type Transition,
  type UseInViewOptions,
} from 'motion/react'

export type InViewProps = {
  children: ReactNode
  variants?: {
    hidden: Variant
    visible: Variant
  }
  transition?: Transition
  viewOptions?: UseInViewOptions
  once?: boolean
  className?: string
}

const defaultVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

/**
 * InView triggers an entrance animation when the element scrolls into the browser viewport.
 * If `once` is set to true, the element remains in the visible state after its first appearance.
 */
export function InView({
  children,
  variants = defaultVariants,
  transition = { duration: 0.5, ease: 'easeOut' },
  viewOptions = { margin: '0px 0px -50px 0px' },
  once = true,
  className,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, viewOptions)
  const [isViewed, setIsViewed] = useState(false)

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      onAnimationComplete={() => {
        if (once) setIsViewed(true)
      }}
      animate={isInView || isViewed ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
