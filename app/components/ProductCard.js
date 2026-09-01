'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const productId = product?.productId || product?.id
  const productName = product?.title || product?.name
  const productPrice = product?.price
  const productImage = product?.imageUrl || product?.imageUrls?.[0] || product?.image
  const secondaryImage = product?.imageUrls?.[1] || (product?.images?.length > 1 ? product.images[1].imageUrl : null)
  const productCategory = product?.categoryName || product?.category
  const discount = product?.discountPercentage || 0
  const label = product?.label || product?.badge
  const userId = user?.userId || user?.id || null

  const getToken = () => localStorage.getItem('token')

  useEffect(() => {
    setLoading(false)
  }, [])

  // ✅ Check wishlist status
  const checkWishlist = async () => {
    if (!userId || !productId) {
      setLoading(false)
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
        const likes = Array.isArray(data) ? data : []
        const found = likes.some(item => item.productId === productId)
        setIsWishlisted(found)
      }
    } catch (error) {
      console.error('Failed to check wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkWishlist()
  }, [productId, userId])

  if (!product) return null

  // ✅ Add to Wishlist
  const addToWishlist = async () => {
    if (!userId) {
      alert('Please login to add to wishlist')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/UserLikes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          productId: productId
        })
      })

      if (response.ok) {
        setIsWishlisted(true)
        window.dispatchEvent(new Event('advit:commerce-updated'))
      } else {
        alert('Failed to add to wishlist')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  // ✅ Remove from Wishlist
  const removeFromWishlist = async () => {
    if (!userId) return

    try {
      const response = await fetch(`${API_BASE}/UserLikes`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const likes = Array.isArray(data) ? data : []
        const like = likes.find(item => item.productId === productId)
        
        if (like && like.id) {
          const deleteResponse = await fetch(`${API_BASE}/UserLikes/${like.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${getToken()}`
            }
          })

          if (deleteResponse.ok) {
            setIsWishlisted(false)
            window.dispatchEvent(new Event('advit:commerce-updated'))
          } else {
            alert('Failed to remove from wishlist')
          }
        }
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  const toggleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!userId) {
      alert('Please login to add to wishlist')
      return
    }

    if (isWishlisted) {
      await removeFromWishlist()
    } else {
      await addToWishlist()
    }
  }

  // ✅ Add to Cart
  const addToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      alert('Please login to add items to cart')
      return
    }

    setAddingToCart(true)
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
          price: productPrice
        })
      })

      if (response.ok) {
        alert('Added to cart successfully!')
        window.dispatchEvent(new Event('advit:commerce-updated'))
      } else {
        alert('Failed to add to cart')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  let badgeText = null
  let badgeColor = ''

  if (discount > 0 || label === 'Sale') {
    badgeText = 'SALE'
    badgeColor = 'bg-red-500'
  } else if (label === 'New') {
    badgeText = 'NEW'
    badgeColor = 'bg-[#C9A96E]'
  } else if (label === 'Best Seller') {
    badgeText = 'BEST SELLER'
    badgeColor = 'bg-purple-500'
  } else if (label === 'Premium') {
    badgeText = 'PREMIUM'
    badgeColor = 'bg-[#102A39]'
  } else if (label) {
    badgeText = label.toUpperCase()
    badgeColor = 'bg-[#391F10]'
  }

  let originalPrice = null
  if (discount > 0) {
    originalPrice = (productPrice / (1 - discount / 100)).toFixed(2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-xl border border-gray-100 hover:border-[#C9A96E]/40 hover:shadow-xl transition-all duration-400 overflow-hidden w-full h-full flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
        <Link href={`/products/${productId}`} className="relative w-full h-full block">
          {/* eslint-disable-next-line @next/next/no-img-element -- product images use runtime API URLs. */}
          <img
            src={productImage || 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'}
            alt={productName || 'Product'}
            className={`object-cover transition-all duration-700 w-full h-full ${
              secondaryImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'
            }}
          />
          {secondaryImage && (
            /* eslint-disable-next-line @next/next/no-img-element -- product images use runtime API URLs. */
            <img
              src={secondaryImage}
              alt={`${productName || 'Product'} alternate view`}
              className="absolute inset-0 object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 w-full h-full"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          )}
        </Link>
        
        {badgeText && (
          <motion.span
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`absolute top-2 left-2 ${badgeColor} text-white px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold shadow-lg z-10 uppercase tracking-wider`}
          >
            {badgeText}
          </motion.span>
        )}

        {/* ✅ Wishlist Button - Properly Centered */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleWishlist}
          className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-2 sm:p-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 z-20 flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isWishlisted ? 'filled' : 'empty'}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center"
            >
              {isWishlisted ? (
                <HeartSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 hover:text-red-500 transition-colors" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="p-2 sm:p-3 flex-1 flex flex-col">
        <div className="mb-1 flex-1">
          <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider font-medium">
            {productCategory || 'Fashion'}
          </p>
          <Link href={`/products/${productId}`}>
            <h3 className="font-semibold text-[#391F10] text-xs sm:text-sm hover:text-[#C9A96E] transition-colors line-clamp-2 leading-tight mt-0.5">
              {productName || 'Product'}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="text-sm sm:text-base font-bold text-[#391F10]">
              ${productPrice || '0.00'}
            </span>
            {originalPrice && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through sm:ml-1.5">
                ${originalPrice}
              </span>
            )}
          </div>
          {/* ✅ Add to Cart Button - Properly Centered */}
          <button
            onClick={addToCart}
            disabled={addingToCart}
            className={`bg-[#391F10] text-white p-2 sm:p-2.5 rounded-full hover:bg-[#2a1509] transition-all duration-300 flex-shrink-0 flex items-center justify-center ${
              addingToCart ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ShoppingBagIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
