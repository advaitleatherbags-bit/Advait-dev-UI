'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function PaymentProcessing() {
  const [orderId, setOrderId] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const savedOrderId = localStorage.getItem('currentOrderId')
    if (savedOrderId) {
      setOrderId(savedOrderId)
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (savedOrderId) {
            // ✅ YAHAN CHANGE KARO
            // Pehle: /payment/success/${savedOrderId}
            // Same hi hai - dynamic route
            window.location.href = `/payment/success/${savedOrderId}`
          } else {
            window.location.href = '/'
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <ArrowPathIcon className="h-10 w-10 text-blue-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-[#391F10] mb-2">Redirecting to Secure Payment...</h1>
        <p className="text-gray-500 text-sm mb-4">Please wait while we redirect you to the payment gateway.</p>

        {orderId && (
          <p className="text-xs text-gray-400">Order ID: <span className="font-mono font-medium">#{orderId.slice(0, 8)}</span></p>
        )}

        <div className="mt-6 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-blue-600 rounded-full"
          />
        </div>

        <p className="text-xs text-gray-400 mt-4">Redirecting in {countdown} seconds...</p>
        <p className="text-xs text-gray-400 mt-2">Do not close this page.</p>
      </motion.div>
    </div>
  )
}