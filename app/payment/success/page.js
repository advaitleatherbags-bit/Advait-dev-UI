'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  HomeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Get orderId from URL params OR localStorage
      const urlOrderId = searchParams.get('orderId')
      const savedOrderId = localStorage.getItem('currentOrderId')

      console.log('📦 URL OrderId:', urlOrderId)
      console.log('💾 Saved OrderId:', savedOrderId)

      const finalOrderId = urlOrderId || savedOrderId || ''

      if (finalOrderId) {
        setOrderId(finalOrderId)

        // Clear localStorage
        localStorage.removeItem('currentOrderId')
        localStorage.removeItem('paymentId')
      }

      // If no orderId, redirect to home after 3 seconds
      if (!finalOrderId) {
        console.log('⚠️ No orderId found, redirecting to home')

        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    } catch (error) {
      console.error('Error in payment success:', error)

      setTimeout(() => {
        router.push('/')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If no orderId after loading, show error
  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>

          <h2 className="text-xl font-bold text-[#391F10] mb-2">
            Order Not Found
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            We couldn't find your order details. Please contact support.
          </p>

          <Link
            href="/"
            className="inline-block bg-[#391F10] text-white px-6 py-2 rounded-lg hover:bg-[#2a1509] transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 200
            }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white">
            Payment Successful!
          </h1>

          <p className="text-green-100 mt-1">
            Your order has been placed successfully
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Order ID</span>

              <span className="font-mono font-medium text-[#391F10]">
                #{orderId.slice(0, 8)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">
                Payment Status
              </span>

              <span className="text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Completed
              </span>
            </div>

            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Date</span>

              <span className="text-[#391F10] font-medium">
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              We'll send you an email confirmation with your order details.
            </p>

            <p className="text-gray-500 text-xs mt-1">
              Your order will be delivered within 3-5 business days
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-[#391F10] text-white px-6 py-3 rounded-xl hover:bg-[#2a1509] transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              <HomeIcon className="h-5 w-5" />
              Continue Shopping
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

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Need help? Contact us at support@advit.com
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}