'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function ForgotPassword() {
  const router = useRouter()
  
  // Step 1: Email
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  
  // Step 2: OTP
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpSuccess, setOtpSuccess] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  
  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  
  // Step Management
  const [currentStep, setCurrentStep] = useState(1) // 1=Email, 2=OTP, 3=Password
  const [storedEmail, setStoredEmail] = useState('')

  // ✅ Step 1: Send OTP - POST /api/Auth/forgot-password
  const handleSendOtp = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setEmailError('Email address is required')
      return
    }
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address')
      return
    }

    setSendingOtp(true)
    setEmailError('')
    setEmailSuccess(false)

    try {
      const response = await fetch(`${API_BASE}/Auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailAddress: email })
      })

      if (response.ok) {
        setEmailSuccess(true)
        setStoredEmail(email)
        // Move to step 2 after 1.5 seconds
        setTimeout(() => {
          setCurrentStep(2)
        }, 1500)
      } else {
        const err = await response.text()
        setEmailError(err || 'Failed to send OTP. Please try again.')
      }
    } catch {
      setEmailError('Network error. Please check your connection.')
    } finally {
      setSendingOtp(false)
    }
  }

  // ✅ Step 2: Verify OTP - POST /api/Auth/verify-otp
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    
    if (!otp.trim()) {
      setOtpError('Verification code is required')
      return
    }
    if (otp.length < 4) {
      setOtpError('Please enter a valid verification code')
      return
    }

    setVerifyingOtp(true)
    setOtpError('')
    setOtpSuccess(false)

    try {
      const response = await fetch(`${API_BASE}/Auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: storedEmail,
          verificationCode: otp
        })
      })

      if (response.ok) {
        setOtpSuccess(true)
        // Move to step 3 after 1.5 seconds
        setTimeout(() => {
          setCurrentStep(3)
        }, 1500)
      } else {
        const err = await response.text()
        setOtpError(err || 'Invalid verification code. Please try again.')
      }
    } catch {
      setOtpError('Network error. Please check your connection.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  // ✅ Step 3: Reset Password - POST /api/Auth/reset-password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!newPassword.trim()) {
      setPasswordError('New password is required')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setResettingPassword(true)
    setPasswordError('')
    setPasswordSuccess(false)

    try {
      const response = await fetch(`${API_BASE}/Auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: storedEmail,
          verificationCode: otp,
          newPassword: newPassword
        })
      })

      if (response.ok) {
        setPasswordSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        const err = await response.text()
        setPasswordError(err || 'Failed to reset password. Please try again.')
      }
    } catch {
      setPasswordError('Network error. Please check your connection.')
    } finally {
      setResettingPassword(false)
    }
  }

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    setSendingOtp(true)
    setOtpError('')
    
    try {
      const response = await fetch(`${API_BASE}/Auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailAddress: storedEmail })
      })

      if (response.ok) {
        setOtpError('')
        alert('OTP resent successfully!')
      } else {
        const err = await response.text()
        setOtpError(err || 'Failed to resend OTP')
      }
    } catch {
      setOtpError('Network error. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  // ✅ Go back to previous step
  const goToStep = (step) => {
    setCurrentStep(step)
    setEmailError('')
    setOtpError('')
    setPasswordError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#391F10]/10 rounded-full flex items-center justify-center">
              <KeyIcon className="h-8 w-8 text-[#391F10]" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#391F10]">
            {currentStep === 1 && 'Forgot Password'}
            {currentStep === 2 && 'Verify OTP'}
            {currentStep === 3 && 'Reset Password'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {currentStep === 1 && 'Enter your email to receive a verification code'}
            {currentStep === 2 && `We sent a code to ${storedEmail}`}
            {currentStep === 3 && 'Enter your new password'}
          </p>
        </div>

        {/* ==================== STEP 1: EMAIL ==================== */}
        {currentStep === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {emailSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                OTP sent successfully! Redirecting...
              </div>
            )}

            {emailError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                {emailError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                  placeholder="Enter your email"
                  disabled={sendingOtp || emailSuccess}
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={sendingOtp || emailSuccess}
              className={`w-full py-3.5 rounded-lg font-semibold text-base transition-all duration-300 ${
                sendingOtp || emailSuccess
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#391F10] text-white hover:bg-[#2a1509] hover:shadow-lg'
              }`}
            >
              {sendingOtp ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                'Send OTP'
              )}
            </motion.button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-[#C9A96E] hover:text-[#b8965a] transition-colors flex items-center justify-center gap-1">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* ==================== STEP 2: OTP VERIFICATION ==================== */}
        {currentStep === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {otpSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                OTP verified! Redirecting...
              </div>
            )}

            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                {otpError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code *
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                  placeholder="Enter 6-digit code"
                  disabled={verifyingOtp || otpSuccess}
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Enter the verification code sent to {storedEmail}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={verifyingOtp || otpSuccess}
                className={`flex-1 py-3.5 rounded-lg font-semibold text-base transition-all duration-300 ${
                  verifyingOtp || otpSuccess
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#391F10] text-white hover:bg-[#2a1509] hover:shadow-lg'
                }`}
              >
                {verifyingOtp ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={sendingOtp}
                className="text-sm text-[#C9A96E] hover:text-[#b8965a] transition-colors"
              >
                {sendingOtp ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* ==================== STEP 3: RESET PASSWORD ==================== */}
        {currentStep === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                Password reset successfully! Redirecting to login...
              </div>
            )}

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                  placeholder="Min 6 characters"
                  disabled={resettingPassword || passwordSuccess}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                  placeholder="Confirm your new password"
                  disabled={resettingPassword || passwordSuccess}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={resettingPassword || passwordSuccess}
                className={`flex-1 py-3.5 rounded-lg font-semibold text-base transition-all duration-300 ${
                  resettingPassword || passwordSuccess
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#391F10] text-white hover:bg-[#2a1509] hover:shadow-lg'
                }`}
              >
                {resettingPassword ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <Link href="/login" className="text-sm text-[#C9A96E] hover:text-[#b8965a] transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? 'w-8 bg-[#391F10]'
                  : step < currentStep
                  ? 'w-6 bg-[#C9A96E]'
                  : 'w-6 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}