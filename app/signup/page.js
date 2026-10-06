'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  PhoneIcon, 
  HomeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { useSnackbar } from '../components/SnackbarProvider'

async function readResponseBody(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function getBackendErrorMessage(body) {
  if (typeof body === 'string') {
    const message = body.trim()
    return message && !/<(?:!doctype|html)[\s>]/i.test(message)
      ? message
      : 'Registration failed. Please try again.'
  }

  if (Array.isArray(body)) {
    const messages = body.filter((item) => typeof item === 'string' && item.trim())
    if (messages.length) return messages.join(' ')
  }

  const message = body?.message || body?.detail || body?.error || body?.errorMessage
  if (typeof message === 'string' && message.trim()) return message.trim()

  const validationErrors = body?.errors
  if (Array.isArray(validationErrors)) {
    const messages = validationErrors.filter((item) => typeof item === 'string' && item.trim())
    if (messages.length) return messages.join(' ')
  }

  if (validationErrors && typeof validationErrors === 'object') {
    const messages = Object.values(validationErrors)
      .flat(Infinity)
      .filter((item) => typeof item === 'string' && item.trim())
    if (messages.length) return [...new Set(messages)].join(' ')
  }

  if (typeof body?.title === 'string' && body.title.trim()) return body.title.trim()

  return 'Registration failed. Please try again.'
}

export default function SignUp() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter()
  const { showSnackbar } = useSnackbar()
  const { user, token, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    emailAddress: '',
    mobileNumber: '',
    password: '',
    Address: '',
    State: '',
    City: '',
    Pincode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (user || token) {
      if (user?.role === 'Admin' || user?.role === 'admin') {
        router.replace('/admin')
      } else {
        router.replace('/')
      }
    }
  }, [user, token, authLoading, router])

  if (authLoading || user || token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      showSnackbar('Username is required')
      return false
    }
    if (!formData.emailAddress.trim()) {
      showSnackbar('Email address is required')
      return false
    }
    if (!formData.emailAddress.includes('@')) {
      showSnackbar('Please enter a valid email address')
      return false
    }
    if (!formData.mobileNumber.trim()) {
      showSnackbar('Mobile number is required')
      return false
    }
    if (formData.mobileNumber.length < 10) {
      showSnackbar('Please enter a valid mobile number')
      return false
    }
    if (!formData.password.trim()) {
      showSnackbar('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      showSnackbar('Password must be at least 6 characters')
      return false
    }
    if (!formData.Address.trim()) {
      showSnackbar('Address is required')
      return false
    }
    if (!formData.State.trim()) {
      showSnackbar('State is required')
      return false
    }
    if (!formData.City.trim()) {
      showSnackbar('City is required')
      return false
    }
    if (!formData.Pincode.trim()) {
      showSnackbar('Pincode is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          emailAddress: formData.emailAddress,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
          Address: formData.Address,
          State: formData.State,
          City: formData.City,
          Pincode: formData.Pincode
        })
      })

      const data = await readResponseBody(response)

      if (response.ok) {
        setSuccess(true)
        // Token save NAHI karna - user abhi verified nahi hai
        // Redirect to OTP verification page with email
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(formData.emailAddress)}`)
        }, 1500)
      } else {
        showSnackbar(getBackendErrorMessage(data))
      }
    } catch {
      showSnackbar('Network error. Please check your connection.')
    } finally {
      setLoading(false)
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
          <h2 className="text-2xl sm:text-3xl font-bold text-[#391F10]">Create Account</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">Join the ADVAIT family</p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            Account created! Redirecting to OTP verification...
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                placeholder="Enter username"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                placeholder="user@example.com"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number *
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                placeholder="6487968651"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Password with Show/Hide */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                placeholder="Min 6 characters"
                required
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <div className="relative">
              <HomeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                rows="2"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                placeholder="Enter shipping address"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="State"
                value={formData.State}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                placeholder="Enter state"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <div className="relative">
              <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="City"
                value={formData.City}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                placeholder="Enter city"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode *
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="Pincode"
                value={formData.Pincode}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                placeholder="Enter pincode"
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
                Creating Account...
              </div>
            ) : success ? (
              'Account Created!'
            ) : (
              'Create Account'  
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C9A96E] hover:text-[#b8965a] font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>

    </div>
  )
}
