'use client'

import { motion, AnimatePresence } from 'framer-motion'

export function Providers({ children }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  )
}