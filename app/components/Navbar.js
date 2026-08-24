'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingBagIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon
  // ❌ Removed: MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [userId, setUserId] = useState(null)

  const pathname = usePathname()

  // Get user from localStorage ONLY in browser
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserId(user.userId || null)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        setUserId(null)
      }
    } else {
      setUserId(null)
    }
  }, [])

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  // Fetch cart count
  const fetchCartCount = async () => {
    if (!userId) {
      setCartCount(0)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/Cart/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()

        const totalItems = Array.isArray(data)
          ? data.reduce((sum, item) => sum + (item.qty || 0), 0)
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

  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    if (!userId) {
      setWishlistCount(0)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/UserLikes`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
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

  // Fetch counts after user is available
  useEffect(() => {
    if (!userId) {
      setCartCount(0)
      setWishlistCount(0)
      return
    }

    fetchCartCount()
    fetchWishlistCount()

    const interval = setInterval(() => {
      fetchCartCount()
      fetchWishlistCount()
    }, 10000)

    return () => clearInterval(interval)
  }, [userId])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
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

          {/* ✅ Desktop Actions - NO SEARCH */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">

            {/* ❌ SEARCH ICON REMOVED */}

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

            {/* Login */}
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

                {/* Mobile Login */}
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="bg-[#C9A96E] text-[#391F10] px-6 py-2.5 rounded-full text-center font-semibold flex-1"
                >
                  Sign In
                </Link>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  )
}