'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  HomeIcon,
  ArrowPathIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const getToken = () => localStorage.getItem('token')

export default function PaymentStatus() {
  const params = useParams()
  const orderId = params.orderId

  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)

  // ✅ GET /api/orders/{orderId}/payment-status
  const fetchPaymentStatus = useCallback(async () => {
    if (!orderId) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/payment-status`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else if (response.status === 404) {
        setError('Order not found')
      } else {
        setError('Failed to fetch payment status')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchPaymentStatus()
  }, [fetchPaymentStatus])

  // ✅ Retry Payment - POST /api/orders/{orderId}/retry-payment
  const retryPayment = async () => {
    if (!orderId) return

    setRetrying(true)
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/retry-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to PayU with new payment details
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.paymentUrl

        for (const [name, value] of Object.entries(data.fields)) {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = name
          input.value = value
          form.appendChild(input)
        }

        document.body.appendChild(form)
        form.submit()
      } else {
        const err = await response.text()
        setError(err || 'Failed to retry payment')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Checking payment status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#391F10] mb-2">Error</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-[#391F10] text-white px-6 py-2 rounded-lg hover:bg-[#2a1509] transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // ✅ Success State
  if (status?.status === 'Paid' || status?.status === 'Success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-white mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
            <p className="text-green-100 text-sm">Your order is confirmed.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
              <p className="text-sm text-gray-600">
                Order ID: <span className="font-mono font-medium">#{orderId}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className="text-green-600 font-medium">Paid</span>
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/" className="w-full bg-[#391F10] text-white px-6 py-3 rounded-xl hover:bg-[#2a1509] transition-all flex items-center justify-center gap-2 font-medium">
                <HomeIcon className="h-5 w-5" />
                Continue Shopping
              </Link>
              <Link href="/orders" className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium">
                <ShoppingBagIcon className="h-5 w-5" />
                View Orders
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ✅ Pending State
  if (status?.status === 'Pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-8 text-center">
            <ClockIcon className="h-16 w-16 text-white mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white">Payment Pending</h1>
            <p className="text-yellow-100 text-sm">Your payment is being processed.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-center">
              <p className="text-sm text-gray-600">
                Order ID: <span className="font-mono font-medium">#{orderId}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className="text-yellow-600 font-medium">Pending</span>
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={fetchPaymentStatus}
                className="w-full bg-[#391F10] text-white px-6 py-3 rounded-xl hover:bg-[#2a1509] transition-all flex items-center justify-center gap-2 font-medium"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Check Status Again
              </button>
              <Link href="/" className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium">
                <HomeIcon className="h-5 w-5" />
                Go Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ✅ Failure / Rejected State with Retry
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-8 text-center">
          <XCircleIcon className="h-16 w-16 text-white mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
          <p className="text-red-100 text-sm">Your payment could not be processed.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-mono font-medium">#{orderId}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Status: <span className="text-red-600 font-medium">Failed</span>
            </p>
          </div>
          <div className="space-y-3">
            {/* ✅ Retry Payment Button */}
            <button
              onClick={retryPayment}
              disabled={retrying}
              className={`w-full px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                retrying
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-[#391F10] text-white hover:bg-[#2a1509] hover:shadow-lg'
              }`}
            >
              {retrying ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-5 w-5" />
                  Retry Payment
                </>
              )}
            </button>
            <Link href="/cart" className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium">
              <ShoppingBagIcon className="h-5 w-5" />
              Review Cart
            </Link>
            <Link href="/" className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium">
              <HomeIcon className="h-5 w-5" />
              Go Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
