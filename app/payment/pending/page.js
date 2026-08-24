'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ClockIcon, 
  HomeIcon, 
  ArrowPathIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'

export default function PaymentPending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <ClockIcon className="h-12 w-12 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Payment Pending!</h1>
          <p className="text-yellow-100 mt-1">Your payment is being processed</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-center">
            <p className="text-sm text-gray-600">
              Please wait while we confirm your payment. You'll receive a confirmation shortly.
            </p>
          </div>

          <div className="space-y-3">
            <Link 
              href="/"
              className="w-full bg-[#391F10] text-white px-6 py-3 rounded-xl hover:bg-[#2a1509] transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              <HomeIcon className="h-5 w-5" />
              Go to Home
            </Link>
            <Link 
              href="/orders"
              className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              View Orders
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}