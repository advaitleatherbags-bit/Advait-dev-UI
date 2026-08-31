'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShoppingBagIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'New Arrivals', path: '/new-arrivals' },
  { name: 'Collection', path: '/collection' },
  { name: 'Sale', path: '/sale' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [apiError, setApiError] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  // User details are loaded by AuthProvider from /Auth/me.

  // ✅ Fetch cart count with error handling
  const fetchCartCount = async () => {
    const token = getToken()
    if (!token || !user) {
      setCartCount(0)
      return
    }

    try {
      const userId = user.id || user.userId
      const response = await fetch(`${API_BASE}/Cart/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const totalItems = Array.isArray(data)
          ? data.reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0)
          : 0
        setCartCount(totalItems)
      } else {
        setCartCount(0)
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error)
      setCartCount(0)
    }
  }

  // ✅ Fetch wishlist count with error handling
  const fetchWishlistCount = async () => {
    const token = getToken()
    if (!token || !user) {
      setWishlistCount(0)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/UserLikes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const count = Array.isArray(data) ? data.length : 0
        setWishlistCount(count)
      } else {
        setWishlistCount(0)
      }
    } catch (error) {
      console.error('Failed to fetch wishlist count:', error)
      setWishlistCount(0)
    }
  }

  // ✅ Logout
  const handleLogout = () => {
    logout()
    setCartCount(0)
    setWishlistCount(0)
    setShowDropdown(false)
    setApiError(false)
    router.push('/')
  }

  // ==================== USE EFFECTS ====================
  
  useEffect(() => {
    if (user) {
      fetchCartCount()
      fetchWishlistCount()
    } else {
      setCartCount(0)
      setWishlistCount(0)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchCartCount()
      fetchWishlistCount()
    }, 10000)

    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const refreshBadges = () => {
      // Refresh counts after sign in or payment return.
      fetchCartCount()
      fetchWishlistCount()
    }

    window.addEventListener('advit:commerce-updated', refreshBadges)
    window.addEventListener('advit:auth-updated', refreshBadges)
    return () => {
      window.removeEventListener('advit:commerce-updated', refreshBadges)
      window.removeEventListener('advit:auth-updated', refreshBadges)
    }
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.user-dropdown')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showDropdown])

  // ==================== RENDER ====================

  return (
    <>
      {/* ✅ API Error Banner - Shows when API is down */}
      {apiError && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-16 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 text-center shadow-lg"
        >
          <div className="flex items-center justify-center gap-3 max-w-7xl mx-auto">
            <ExclamationTriangleIcon className="h-5 w-5 text-white animate-pulse" />
            <span className="text-sm font-medium">
              ⚠️ We&apos;re experiencing technical difficulties. Some features may be unavailable.
            </span>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
              We&apos;ll be back soon!
            </span>
          </div>
        </motion.div>
      )}

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          apiError ? 'mt-10' : ''
        } ${
          scrolled
            ? 'bg-[#391F10] shadow-2xl'
            : 'bg-[#391F10]/90 backdrop-blur-xl'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="relative group">
              <motion.h1
                className="text-2xl md:text-3xl font-bold tracking-wider text-white"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                ADVIT
              </motion.h1>

              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-[#C9A96E] transition-all duration-500 group-hover:w-full" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    pathname === link.path
                      ? 'text-[#C9A96E]'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}

                  {pathname === link.path && (
                    <motion.span
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A96E]"
                      transition={{
                        type: 'spring',
                        stiffness: 300
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="text-gray-300 hover:text-white transition-colors relative group p-2 hover:bg-white/10 rounded-full"
              >
                <HeartIcon className="h-5 w-5" />

                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                  >
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="text-gray-300 hover:text-white transition-colors relative group p-2 hover:bg-white/10 rounded-full"
              >
                <ShoppingBagIcon className="h-5 w-5" />

                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-[#C9A96E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </Link>

              {/* ✅ User Profile OR Sign In */}
              {loading ? (
                <div className="w-24 h-9 bg-white/10 rounded-full animate-pulse" />
              ) : user ? (
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 bg-[#C9A96E]/10 hover:bg-[#C9A96E]/20 text-white px-4 py-2 rounded-full transition-all duration-300 border border-[#C9A96E]/20"
                  >
                    <UserIcon className="h-4 w-4 text-[#C9A96E]" />
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {user.username || user.emailAddress || 'User'}
                    </span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-[#391F10]">
                            {user.username || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.emailAddress || ''}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                          >
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            My Profile / Orders
                          </Link>
                          {user.role === 'Admin' || user.role === 'admin' ? (
                            <Link
                              href="/admin"
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#C9A96E] hover:bg-gray-50 transition-colors font-medium border-t border-gray-100"
                            >
                              <UserIcon className="h-4 w-4 text-[#C9A96E]" />
                              Admin Panel
                            </Link>
                          ) : null}
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full border-t border-gray-100"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="bg-[#C9A96E] text-[#391F10] px-6 py-2.5 rounded-full hover:bg-[#b8965a] transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl"
                  >
                    Sign In
                  </Link>
                </motion.div>
              )}

            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-[#1a0e08] border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-4">

                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                      pathname === link.path
                        ? 'bg-[#391F10] text-[#C9A96E]'
                        : 'text-gray-300 hover:bg-[#391F10] hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {user && (user.role === 'Admin' || user.role === 'admin') && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                      pathname === '/admin'
                        ? 'bg-[#391F10] text-[#C9A96E]'
                        : 'text-[#C9A96E] hover:bg-[#391F10]'
                    }`}
                  >
                    Admin Panel
                  </Link>
                )}

                <div className="flex items-center space-x-4 pt-4 border-t border-white/10">

                  {/* Mobile Wishlist */}
                  <Link
                    href="/wishlist"
                    className="text-gray-300 hover:text-white transition-colors p-2 relative"
                  >
                    <HeartIcon className="h-6 w-6" />

                    {wishlistCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* Mobile Cart */}
                  <Link
                    href="/cart"
                    className="text-gray-300 hover:text-white transition-colors p-2 relative"
                  >
                    <ShoppingBagIcon className="h-6 w-6" />

                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#C9A96E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Mobile Login/User */}
                  {loading ? (
                    <div className="flex-1 bg-white/5 rounded-full h-9 animate-pulse" />
                  ) : user ? (
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 bg-[#C9A96E]/10 text-white px-4 py-2.5 rounded-full text-center font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <UserIcon className="h-4 w-4 text-[#C9A96E]" />
                      {user.username || 'User'}
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="bg-[#C9A96E] text-[#391F10] px-6 py-2.5 rounded-full text-center font-semibold flex-1"
                    >
                      Sign In
                    </Link>
                  )}

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.nav>
    </>
  )
}
