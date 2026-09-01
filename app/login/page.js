'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function Login() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
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
    if (!formData.identifier.trim()) {
      setError('Email or mobile number is required')
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
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`${API_BASE}/Auth/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Keep only the token locally; AuthProvider loads the profile from /Auth/me.
        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('expiresAt', data.expiresAt)
          window.dispatchEvent(new Event('advit:auth-updated'))
          window.dispatchEvent(new Event('advit:commerce-updated'))
          
          setSuccess(true)
          
          // Redirect to home after 1.5 seconds
          setTimeout(() => {
            if(data.role === 'Admin'){
              router.push('/admin')
            } else {
              router.push('/')
            }
          }, 1500)
        } else {
          setError('Invalid response from server')
        }
      } else {
        setError(data.message || 'Invalid email/mobile or password')
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
          <h2 className="text-2xl sm:text-3xl font-bold text-[#391F10]">Welcome Back</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">Sign in to your account</p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            Login successful! Redirecting...
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
          {/* Email/Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or Mobile Number *
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] focus:border-transparent transition-all text-sm"
                placeholder="user@example.com or 6487968651"
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
                placeholder="Enter your password"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-[#391F10] rounded border-gray-300 focus:ring-[#391F10]"
                disabled={loading || success}
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
          <Link href="/forgot-password" className="text-sm text-[#C9A96E] hover:text-[#b8965a] transition-colors">
  Forgot password?
</Link>
          </div>

          {/* Submit Button */}
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
                Signing In...
              </div>
            ) : success ? (
              'Logged In!'
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#C9A96E] hover:text-[#b8965a] font-semibold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Token Info (Debug - Remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
            <p className="font-medium mb-1">💡 Debug Info:</p>
            <p>Token saved in localStorage after successful login</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
