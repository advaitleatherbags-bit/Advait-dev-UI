'use client'

import { useState, useEffect } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function ApiStatusChecker({ children }) {
  const [isServerDown, setIsServerDown] = useState(false)
  const [checking, setChecking] = useState(true)

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/Products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000)
      })

      if (response.status >= 500 && response.status < 600) {
        setIsServerDown(true)
      } else {
        setIsServerDown(false)
      }
    } catch (error) {
      console.error('API Status Check Failed:', error.message)
      setIsServerDown(true)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4 text-sm">Connecting to server...</p>
        </div>
      </div>
    )
  }

  // Server Down - Full Page Fallback
  if (isServerDown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon - Simple emoji, no dependency */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl animate-pulse">
            📡
          </div>

          <h1 className="text-2xl font-bold text-[#391F10] mb-2">
            Server Unavailable
          </h1>
          
          <p className="text-gray-500 text-sm mb-6">
            Our server is currently down or undergoing maintenance. 
            Please try again in a few minutes.
          </p>

          {/* Status Details */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Server Status</span>
              <span className="flex items-center gap-2 text-amber-600 font-medium">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Offline
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Last Check</span>
              <span className="text-gray-500">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Try Again Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#391F10] text-white px-6 py-3 rounded-xl hover:bg-[#2a1509] transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            🔄 Try Again
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Need help? Contact us at{' '}
            <a href="mailto:support@advit.com" className="text-[#C9A96E] hover:underline">
              support@advit.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  return children
}