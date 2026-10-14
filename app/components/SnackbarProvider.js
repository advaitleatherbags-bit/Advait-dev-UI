'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

const SnackbarContext = createContext(null)

export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState(null)
  const timeoutRef = useRef(null)

  const dismissSnackbar = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    setSnackbar(null)
  }, [])

  const showSnackbar = useCallback((message, type = 'error') => {
    if (!message) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setSnackbar({ message: String(message), type })
    timeoutRef.current = setTimeout(() => {
      setSnackbar(null)
      timeoutRef.current = null
    }, 5000)
  }, [])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const contextValue = useMemo(() => ({ showSnackbar, dismissSnackbar }), [showSnackbar, dismissSnackbar])

  const isError = snackbar?.type === 'error'
  const isSuccess = snackbar?.type === 'success'
  const Icon = isError ? ExclamationCircleIcon : isSuccess ? CheckCircleIcon : InformationCircleIcon

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-5 top-5 z-[100] w-[calc(100%-2.5rem)] max-w-lg sm:right-8 sm:top-8" aria-live="assertive" aria-atomic="true">
        <AnimatePresence>
          {snackbar && (
            <motion.div
              key={`${snackbar.type}-${snackbar.message}`}
              role={isError ? 'alert' : 'status'}
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm shadow-xl ${
                isError
                  ? 'border-red-200 text-red-800 shadow-red-900/10'
                  : isSuccess
                    ? 'border-green-200 text-green-800 shadow-green-900/10'
                    : 'border-blue-200 text-blue-800 shadow-blue-900/10'
              }`}
            >
              <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isError ? 'text-red-500' : isSuccess ? 'text-green-500' : 'text-blue-500'}`} />
              <p className="flex-1 leading-5">{snackbar.message}</p>
              <button
                type="button"
                onClick={dismissSnackbar}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const context = useContext(SnackbarContext)
  if (!context) throw new Error('useSnackbar must be used inside SnackbarProvider')
  return context
}
