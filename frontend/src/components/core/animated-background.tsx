import { cn } from '@/lib/utils'
import { AnimatePresence, type Transition, motion } from 'motion/react'
import {
  Children,
  cloneElement,
  type ReactElement,
  useState,
  useId,
} from 'react'

export type AnimatedBackgroundProps = {
  children:
    | ReactElement<{ 'data-id': string }>[]
    | ReactElement<{ 'data-id': string }>
  defaultValue?: string
  value?: string | null
  onValueChange?: (newActiveId: string | null) => void
  className?: string
  transition?: Transition
  enableHover?: boolean
}

/**
 * AnimatedBackground renders a shared sliding indicator behind its child elements.
 * Uses layoutId so Motion smoothly interpolates the bounding box across active or hovered items.
 */
export function AnimatedBackground({
  children,
  defaultValue,
  value,
  onValueChange,
  className,
  transition = { type: 'spring', bounce: 0.15, duration: 0.4 },
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(defaultValue ?? null)
  const uniqueId = useId()

  const activeId = value !== undefined ? value : internalActiveId

  const handleSetActiveId = (id: string | null) => {
    if (value === undefined) {
      setInternalActiveId(id)
    }
    onValueChange?.(id)
  }

  return Children.map(children, (child: any, index) => {
    if (!child) return null
    const id = child.props['data-id']

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(defaultValue ?? null),
        }
      : {
          onClick: (e: any) => {
            child.props.onClick?.(e)
            handleSetActiveId(id)
          },
        }

    return cloneElement(
      child,
      {
        key: id ?? index,
        className: cn('relative inline-flex', child.props.className),
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0', className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        <div className="relative z-10 w-full flex items-center justify-center">{child.props.children}</div>
      </>
    )
  })
}
