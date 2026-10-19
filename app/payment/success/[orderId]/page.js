'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircleIcon, HomeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useSnackbar } from '../../../components/SnackbarProvider'
import OrderProgressBar from '../../../components/OrderProgressBar'

const API_BASE = '/api/backend'

export default function PaymentSuccess() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId

  const [loading, setLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
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

    setLoading(true)
    setError('')
    setPaymentStatus(null)
    setIsRedirecting(false)

    const token = getToken()
    if (!token) {
      setError('Please log in to view this order.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/payment-status/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const norm = (data.orderStatus || data.status || '').toLowerCase()
        const isSuccessful =
          norm === 'confirmed' ||
          norm === 'confirm' ||
          norm === 'placed' ||
          norm === 'paid' ||
          norm === 'success'

        // If status is not Confirmed/Placed (e.g. Pending or Failed), redirect immediately without showing success UI
        if (!isSuccessful) {
          setIsRedirecting(true)
          router.replace(`/payment/failure/${orderId}`)
          return
        }

        setPaymentStatus(data)
        setLoading(false)
      } else {
        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.message ||
          (response.status === 401
            ? 'Please log in to view this order.'
            : response.status === 404
            ? 'Order not found or does not belong to your account.'
            : 'Failed to fetch payment status')
        setError(errorMessage)
        showSnackbar(errorMessage)
        setLoading(false)
      }
    } catch (error) {
      setError('Network error. Please try again.')
      showSnackbar('Network error. Please try again.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentStatus()
  }, [orderId])

  useEffect(() => {
    const norm = (paymentStatus?.orderStatus || paymentStatus?.status || '').toLowerCase()
    if (norm === 'confirmed' || norm === 'confirm' || norm === 'placed' || norm === 'paid' || norm === 'success') {
      localStorage.removeItem('currentOrderId')
      localStorage.removeItem('paymentId')
    }
  }, [paymentStatus])

  if (error) {
    const isAuthError =
      error.toLowerCase().includes('token') ||
      error.toLowerCase().includes('unauthorized') ||
      error.toLowerCase().includes('log in') ||
      error.toLowerCase().includes('login')
    const isOwnerError =
      error.toLowerCase().includes('belong') ||
      error.toLowerCase().includes('user')

    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">{isAuthError || isOwnerError ? '🔒' : '⚠️'}</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {isAuthError ? 'Authentication Required' : isOwnerError ? 'Access Denied' : 'Order Not Found'}
          </h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <div className="space-y-3">
            {isAuthError && (
              <Link
                href="/login"
                className="w-full inline-block bg-[#391F10] text-white px-6 py-2.5 rounded-lg hover:bg-[#2a1509] transition-all font-medium shadow-md"
              >
                Log In
              </Link>
            )}
            <Link
              href="/"
              className={`w-full inline-block ${
                isAuthError
                  ? 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                  : 'bg-[#391F10] text-white hover:bg-[#2a1509]'
              } px-6 py-2.5 rounded-lg transition-all font-medium`}
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading || isRedirecting || !paymentStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">
            {isRedirecting ? 'Redirecting to payment details...' : 'Checking payment status...'}
          </p>
        </div>
      </div>
    )
  }

  const norm = (paymentStatus?.orderStatus || paymentStatus?.status || '').toLowerCase()
  const isPlaced = norm === 'placed'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">
            {isPlaced ? 'Order Placed Successfully!' : 'Order Confirmed!'}
          </h1>
          <p className="text-green-100 mt-1">
            {isPlaced
              ? 'Your order has been placed with delivery partners'
              : 'Your payment was successful and order is confirmed'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Bar:
              - If Placed -> shows Pending -> Confirm -> Placed
              - If Confirmed -> shows Pending -> Confirm */}
          <OrderProgressBar status={isPlaced ? 'Placed' : 'Confirmed'} />

          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono font-medium text-[#391F10]">#{orderId?.slice(0, 8)}</span>
            </div>
            {paymentStatus && (
              <>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-[#391F10]">
                    {paymentStatus.currency === 'INR' ? '₹' : '$'}{paymentStatus.amount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-[#391F10]">{paymentStatus.paymentMethod || 'Online'}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Success ({paymentStatus.orderStatus || paymentStatus.status || 'Confirmed'})
                  </span>
                </div>
              </>
            )}
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
            <p className="text-gray-600 text-sm">We&apos;ll send you an email confirmation with your order details.</p>
            <p className="text-gray-500 text-xs mt-1">Your order will be delivered within 3-5 business days</p>
          </div>

          <div className="space-y-3">
            <Link href="/" className="w-full bg-[#391F10] text-white px-6 py-3 rounded-xl hover:bg-[#2a1509] transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl">
              <HomeIcon className="h-5 w-5" />
              Continue Shopping
            </Link>
            <Link href="/profile" className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
              <ShoppingBagIcon className="h-5 w-5" />
              View Orders
            </Link>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Need help? Contact us at support@advit.com</p>
        </div>
      </motion.div>
    </div>
  )
}
