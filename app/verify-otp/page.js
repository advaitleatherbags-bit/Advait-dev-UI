'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSnackbar } from '../components/SnackbarProvider'
import { 
  CheckCircleIcon, 
  EnvelopeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

function VerifyOtpContent() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter()
  const { showSnackbar } = useSnackbar()
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get('email') || ''

  const [emailInput, setEmailInput] = useState(emailFromQuery)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!emailInput.trim()) {
      showSnackbar('Email address is required')
      return
    }
    if (!otp.trim()) {
      showSnackbar('Please enter the OTP')
      return
    }
    if (otp.length < 4) {
      showSnackbar('Please enter a valid OTP')
      return
    }

    setLoading(true)
    setResendMsg('')

    try {
      const response = await fetch(`${API_BASE}/Auth/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailAddress: emailInput,
          verificationCode: otp
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        showSnackbar(data.message || 'Invalid OTP. Please try again.')
      }
    } catch {
      showSnackbar('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!emailInput.trim()) {
      showSnackbar('Please enter your email address first')
      return
    }

    setResending(true)
    setResendMsg('')

    try {
      const response = await fetch(`${API_BASE}/Auth/resend-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddress: emailInput })
      })

      const data = await response.json()

      if (response.ok) {
        setResendMsg('OTP resent successfully! Check your email.')
      } else {
        showSnackbar(data.message || 'Failed to resend OTP')
      }
    } catch {
      showSnackbar('Network error. Please check your connection.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-[#391F10]/10 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-8 w-8 text-[#391F10]" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#391F10]">Verify Your Email</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Enter the OTP sent to your email
          </p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            Email verified successfully! Redirecting to login...
          </motion.div>
        )}

        {resendMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5 text-blue-500" />
            {resendMsg}
          </motion.div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {!emailFromQuery && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent text-sm"
                  placeholder="Enter your registered email"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>
          )}

          {emailFromQuery && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
              OTP sent to: <strong className="text-[#391F10]">{emailFromQuery}</strong>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP *
            </label>
            <div className="relative">
              <ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent text-sm tracking-widest text-center font-semibold"
                placeholder="Enter OTP"
                maxLength={6}
                required
                disabled={loading || success}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || success}
            className={`w-full py-3.5 rounded-lg font-semibold text-base transition-all duration-300 ${
              loading || success
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#391F10] text-white hover:bg-[#2a1509] hover:shadow-lg'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </div>
            ) : success ? (
              'Verified!'
            ) : (
              'Verify OTP'
            )}
          </motion.button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the OTP?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || success}
              className="text-[#C9A96E] hover:text-[#b8965a] font-semibold transition-colors disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </p>
        </div>

        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <p className="text-gray-600 text-sm">
            Already verified?{' '}
            <Link href="/login" className="text-[#C9A96E] hover:text-[#b8965a] font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyOtp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}
