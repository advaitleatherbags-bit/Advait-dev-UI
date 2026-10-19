'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSnackbar } from '../../../components/SnackbarProvider'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  XCircleIcon,
  HomeIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import OrderProgressBar from '../../../components/OrderProgressBar'

const API_BASE = '/api/backend'

export default function PaymentFailure() {
  const { showSnackbar } = useSnackbar()
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId

  const [loading, setLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [retrying, setRetrying] = useState(false)
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

        // If status is Confirm or Placed, redirect immediately without showing failure UI
        if (isSuccessful) {
          setIsRedirecting(true)
          router.replace(`/payment/success/${orderId}`)
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
      console.error('Failed to fetch payment status:', error)
      showSnackbar('Could not load payment status. Please try again.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentStatus()
  }, [orderId])

  const retryPayment = async () => {
    if (!orderId) {
      showSnackbar('No order found to retry')
      return
    }

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
          showSnackbar('Invalid payment response from server')
        }
      } else {
        const errorData = await response.json().catch(() => null)
        const err = errorData?.message || (await response.text().catch(() => ''))
        showSnackbar(err || 'Failed to retry payment')
      }
    } catch {
      showSnackbar('Network error. Please try again.')
    } finally {
      setRetrying(false)
    }
  }

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
            {isRedirecting ? 'Redirecting to order confirmation...' : 'Checking payment status...'}
          </p>
        </div>
      </div>
    )
  }

  const rawStatus = (paymentStatus?.orderStatus || paymentStatus?.status || '').toLowerCase()
  const isPending =
    rawStatus === 'pending' ||
    paymentStatus?.paymentStatus?.toLowerCase() === 'pending' ||
    !rawStatus
  const isFailed =
    rawStatus === 'failed' ||
    rawStatus === 'paymentfailed' ||
    rawStatus === 'rejected' ||
    rawStatus === 'fail'

  const currentStatusLabel = isPending ? 'Pending' : isFailed ? 'Failed' : paymentStatus?.status || 'Failed'

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isPending
        ? 'bg-gradient-to-br from-amber-50 to-orange-50'
        : 'bg-gradient-to-br from-red-50 to-rose-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header Banner */}
        <div
          className={`px-6 py-8 text-center ${
            isPending
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : 'bg-gradient-to-r from-red-500 to-rose-500'
          }`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            {isPending ? (
              <ClockIcon className="h-12 w-12 text-white" />
            ) : (
              <XCircleIcon className="h-12 w-12 text-white" />
            )}
          </motion.div>
          <h1 className="text-2xl font-bold text-white">
            {isPending ? 'Payment Pending' : 'Payment Failed!'}
          </h1>
          <p className="text-white/90 mt-1">
            {isPending
              ? 'We are awaiting confirmation for your transaction'
              : "We couldn't process your payment"}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Bar (Pending -> Failed OR Pending active) */}
          <OrderProgressBar status={currentStatusLabel} />

          {/* Status Details Box */}
          <div
            className={`rounded-xl p-4 border ${
              isPending
                ? 'bg-amber-50 border-amber-100'
                : 'bg-red-50 border-red-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {isPending ? (
                <ClockIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      isPending ? 'text-amber-800' : 'text-red-700'
                    }`}
                  >
                    {isPending ? 'Payment Pending' : 'Payment Failed'}
                  </p>
                  {/* Payment Status Indicator: Red for failed, Amber for pending */}
                  {isPending ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      Failed
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm mt-1.5 ${
                    isPending ? 'text-amber-700' : 'text-red-600'
                  }`}
                >
                  {isPending
                    ? 'Your payment attempt is pending confirmation. You can retry payment if your payment was interrupted.'
                    : 'Your payment could not be processed. Please check your payment method or contact your bank.'}
                </p>

                <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-1">
                  {orderId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Order ID</span>
                      <span
                        className={`font-mono font-medium ${
                          isPending ? 'text-amber-800' : 'text-red-700'
                        }`}
                      >
                        #{orderId.slice(0, 8)}
                      </span>
                    </div>
                  )}
                  {paymentStatus?.amount && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Amount</span>
                      <span
                        className={`font-semibold ${
                          isPending ? 'text-amber-800' : 'text-red-700'
                        }`}
                      >
                        {paymentStatus.currency === 'INR' ? '₹' : '$'}
                        {paymentStatus.amount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons:
              - If status is Pending -> Show Retry button, Review Cart, and Go to Home
              - If status is Fail -> Show ONLY Go to Home page */}
          <div className="space-y-3">
            {isPending ? (
              <>
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

                <Link
                  href="/cart"
                  className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  Review Cart
                </Link>

                <Link
                  href="/"
                  className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                >
                  <HomeIcon className="h-5 w-5" />
                  Go to Home
                </Link>
              </>
            ) : (
              /* If status is Failed -> ONLY Show Go to Home page */
              <Link
                href="/"
                className="w-full bg-[#391F10] text-white px-6 py-3 rounded-xl hover:bg-[#2a1509] transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
              >
                <HomeIcon className="h-5 w-5" />
                Go to Home
              </Link>
            )}
          </div>

          <div className="text-center bg-yellow-50 rounded-xl p-3 border border-yellow-100">
            <p className="text-xs text-yellow-700">
              💡 Need help? Contact us at{' '}
              <span className="font-medium">support@advit.com</span>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            {isPending
              ? 'If money was deducted from your account, it will be updated or refunded shortly.'
              : 'Your card has not been charged for this failed transaction'}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
