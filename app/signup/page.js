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
  ExclamationCircleIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export default function SignUp() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter()
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
  const [error, setError] = useState('')
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
    setError('')
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required')
      return false
    }
    if (!formData.emailAddress.trim()) {
      setError('Email address is required')
      return false
    }
    if (!formData.emailAddress.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.mobileNumber.trim()) {
      setError('Mobile number is required')
      return false
    }
    if (formData.mobileNumber.length < 10) {
      setError('Please enter a valid mobile number')
      return false
    }
    if (!formData.password.trim()) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (!formData.Address.trim()) {
      setError('Address is required')
      return false
    }
    if (!formData.State.trim()) {
      setError('State is required')
      return false
    }
    if (!formData.City.trim()) {
      setError('City is required')
      return false
    }
    if (!formData.Pincode.trim()) {
      setError('Pincode is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

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

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Keep only the token locally; AuthProvider loads the profile from /Auth/me.
        if (data.token) {
          localStorage.setItem('token', data.token)
          window.dispatchEvent(new Event('advit:auth-updated'))
          window.dispatchEvent(new Event('advit:commerce-updated'))
        }
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
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
          <p className="text-gray-500 text-sm sm:text-base mt-1">Join the ADVIT family</p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            Account created successfully! Redirecting...
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2"
          >
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            {error}
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
              <MapPinIcon
               className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
