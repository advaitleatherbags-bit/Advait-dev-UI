'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  HeartIcon, 
  TrashIcon, 
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../context/AuthContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export default function Wishlist() {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userId = user?.userId || user?.id || user?.userID || user?.user_Id || null

  const fetchWishlist = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/UserLikes`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWishlistItems(Array.isArray(data) ? data : [])
      } else if (response.status === 401) {
        setError('Please login to view wishlist')
      } else {
        setError('Failed to load wishlist')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) {
      fetchWishlist()
    } else {
      setLoading(false)
    }
  }, [fetchWishlist, userId])

  // ✅ DELETE /api/UserLikes/{id}
  const removeFromWishlist = async (id, productTitle) => {
    if (!confirm(`Remove "${productTitle}" from wishlist?`)) return

    try {
      const response = await fetch(`${API_BASE}/UserLikes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== id))
      } else {
        alert('Failed to remove from wishlist')
      }
    } catch {
      alert('Network error. Please try again.')
    }
  }

  // ✅ Add to Cart from Wishlist
  const addToCart = async (productId, price) => {
    if (!userId) {
      alert('Please login to add items to cart')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/Cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          userId: userId,
          productId: productId,
          qty: 1,
          price: price
        })
      })

      if (response.ok) {
        alert('Added to cart successfully!')
      } else {
        alert('Failed to add to cart')
      }
    } catch {
      alert('Network error. Please try again.')
    }
  }

  if (!userId && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center bg-white min-h-screen">
        <HeartIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-[#391F10] mb-2">Wishlist is Empty</h2>
        <p className="text-gray-500 mb-6">Please login to view your wishlist</p>
        <Link 
          href="/login"
          className="inline-block bg-[#391F10] text-white px-8 py-3 rounded-lg hover:bg-[#2a1509] transition-all"
        >
          Login to Continue
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center bg-white min-h-screen">
        <div className="w-8 h-8 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center bg-white min-h-screen">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 bg-[#391F10] text-white px-6 py-2 rounded-lg hover:bg-[#2a1509] transition-all"
        >
          Go Back Home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 bg-white min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#391F10]">My Wishlist</h1>
        <span className="text-sm text-gray-500">({wishlistItems.length} items)</span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <HeartIcon className="h-20 w-20 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-[#391F10] mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mb-6">Start adding items you love!</p>
          <Link 
            href="/"
            className="inline-block bg-[#391F10] text-white px-8 py-3 rounded-lg hover:bg-[#2a1509] transition-all"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {wishlistItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Product Image */}
                <Link href={`/products/${item.productId}`}>
                  <div className="relative h-48 bg-gray-50 overflow-hidden">
                    <img
                      src={item.productImageUrl || 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'}
                      alt={item.productTitle || 'Product'}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'
                      }}
                    />
                    {item.productDiscountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {item.productDiscountPercentage}% OFF
                      </span>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md">
                      <HeartSolid className="h-4 w-4 text-red-500" />
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="font-semibold text-[#391F10] text-sm hover:text-[#C9A96E] transition-colors line-clamp-1">
                      {item.productTitle || 'Product'}
                    </h3>
                  </Link>
                  {item.productSubtitle && (
                    <p className="text-xs text-gray-400 line-clamp-1">{item.productSubtitle}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-lg font-bold text-[#391F10]">
                        ${item.productPrice || '0.00'}
                      </span>
                      {item.productDiscountPercentage > 0 && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">
                          ${(item.productPrice / (1 - item.productDiscountPercentage / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {(item.productColor || item.productSizes) && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.productColor && (
                        <span className="text-[10px] text-gray-500">
                          Color: <span className="font-medium">{item.productColor}</span>
                        </span>
                      )}
                      {item.productSizes && (
                        <span className="text-[10px] text-gray-500">
                          Size: <span className="font-medium">{item.productSizes}</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => addToCart(item.productId, item.productPrice)}
                      className="flex-1 bg-[#391F10] text-white text-xs py-1.5 rounded-lg hover:bg-[#2a1509] transition-all flex items-center justify-center gap-1"
                    >
                      <ShoppingBagIcon className="h-3 w-3" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id, item.productTitle)}
                      className="px-3 py-1.5 bg-red-50 text-red-500 text-xs rounded-lg hover:bg-red-100 transition-all flex items-center gap-1"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
