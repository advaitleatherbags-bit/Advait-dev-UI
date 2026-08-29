'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { XCircleIcon, HomeIcon, ArrowPathIcon, ShoppingBagIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function PaymentFailure() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId

  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState(null)

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  const fetchPaymentStatus = async () => {
    if (!orderId) {
      router.push('/')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/payment-status/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentStatus(data)

        // ✅ Agar status "Paid" hai toh success page pe redirect
        if (data.status === 'Paid' || data.status === 'Success' || data.status === 'success') {
          router.replace(`/payment/success/${orderId}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentStatus()
  }, [orderId])

  const retryPayment = async () => {
    if (!orderId) {
      alert('No order found to retry')
      return
    }

    setRetrying(true)
    setError('')

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
        if (data.paymentUrl && data.fields) {
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = data.paymentUrl

          for (const [name, value] of Object.entries(data.fields)) {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = name
            input.value = String(value)
            form.appendChild(input)
          }

          document.body.appendChild(form)
          form.submit()
        } else {
          setError('Invalid payment response from server')
        }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <XCircleIcon className="h-12 w-12 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Payment Failed!</h1>
          <p className="text-red-100 mt-1">We couldn't process your payment</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Payment Error</p>
                <p className="text-sm text-red-600 mt-1">Your payment could not be processed. Please check your payment method and try again.</p>
                {orderId && <p className="text-xs text-red-500 mt-2 font-mono">Order ID: #{orderId.slice(0, 8)}</p>}
              </div>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">{error}</div>}

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Possible reasons:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-red-400">•</span>Insufficient balance in your account</li>
              <li className="flex items-start gap-2"><span className="text-red-400">•</span>Invalid card details or expired card</li>
              <li className="flex items-start gap-2"><span className="text-red-400">•</span>Network connectivity issues</li>
              <li className="flex items-start gap-2"><span className="text-red-400">•</span>Bank declined the transaction</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={retryPayment}
              disabled={retrying || !orderId}
              className={`w-full px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                retrying || !orderId
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

            <Link href="/cart" className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
              <ShoppingBagIcon className="h-5 w-5" />
              Review Cart
            </Link>

            <Link href="/" className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
              <HomeIcon className="h-5 w-5" />
              Go to Home
            </Link>
          </div>

          <div className="text-center bg-yellow-50 rounded-xl p-3 border border-yellow-100">
            <p className="text-xs text-yellow-700">💡 Need help? Contact us at <span className="font-medium">support@advit.com</span></p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Your card has not been charged for this transaction</p>
        </div>
      </motion.div>
    </div>
  )
}