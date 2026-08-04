import { Fragment, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'

type LoopingTitleProps = {
  text: string
  interval?: number
  stagger?: number
  delayChildren?: number
  className?: string
  highlight?: string
  highlightClass?: string
}

export function LoopingTitle({
  text,
  interval = 8000,
  stagger = 0.05,
  delayChildren = 0.2,
  className,
  highlight,
  highlightClass = 'text-primary-green',
}: LoopingTitleProps) {
  const [loopKey, setLoopKey] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => setLoopKey((prev) => prev + 1), interval)
    return () => clearInterval(id)
  }, [interval, reduceMotion])

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren },
    },
  }

  const character: Variants = {
    hidden: { opacity: 0, display: 'none' },
    visible: {
      opacity: 1,
      display: 'inline-block',
      transition: { duration: 0.01 },
    },
  }

  const start = highlight ? text.indexOf(highlight) : -1

  return (
    <motion.h1
      key={loopKey}
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {text.split('').map((char, index) => {
        if (index === start) {
          return (
            <Fragment key={index}>
              <br />
              <motion.span variants={character} className={highlightClass}>
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            </Fragment>
          )
        }
        return (
          <motion.span
            key={index}
            variants={character}
            className={start >= 0 && index > start ? highlightClass : undefined}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        )
      })}
    </motion.h1>
  )
}
