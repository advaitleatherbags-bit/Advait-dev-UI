'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function Cart() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [total, setTotal] = useState(0)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const userId = user?.userId || user?.id || user?.userID || user?.user_Id || null

  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  useEffect(() => {
    if (userId) {
      fetchCart()
    } else {
      setLoading(false)
    }
  }, [userId])

  // ✅ GET /api/Cart/user/{userId}
  const fetchCart = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('📦 Fetching cart for userId:', userId)
      const response = await fetch(`${API_BASE}/Cart/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const items = Array.isArray(data) ? data : []
        setCartItems(items)
        calculateTotal(items)
      } else if (response.status === 401) {
        setError('Please login to view cart')
      } else {
        setError('Failed to load cart')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.price * item.qty), 0)
    setTotal(sum)
  }

  // ✅ PUT /api/Cart/{cartId}
  const updateQuantity = async (cartId, newQty) => {
    if (newQty < 1) return

    setUpdating(true)
    try {
      const item = cartItems.find(item => item.cartId === cartId)
      const response = await fetch(`${API_BASE}/Cart/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          userID: userId,
          productID: item?.productId,
          qty: newQty,
          price: item?.price
        })
      })

      if (response.ok) {
        await fetchCart()
      } else {
        alert('Failed to update quantity')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  // ✅ DELETE /api/Cart/{cartId}
  const removeItem = async (cartId) => {
    if (!confirm('Remove this item from cart?')) return

    try {
      const response = await fetch(`${API_BASE}/Cart/${cartId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        await fetchCart()
      } else {
        alert('Failed to remove item')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    }
  }

  // ✅ CHECKOUT - POST /api/orders/checkout
  const handleCheckout = async () => {
    if (!getToken()) {
      alert('Please login to checkout')
      window.location.href = '/login'
      return
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    setCheckoutLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        redirectToPayU(data)
      } else {
        const err = await response.text()
        setError(err || 'Failed to initiate checkout')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  // ✅ Redirect to PayU
  const redirectToPayU = (checkout) => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = checkout.paymentUrl

    for (const [name, value] of Object.entries(checkout.fields)) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    }

    localStorage.setItem('currentOrderId', checkout.orderId)
    localStorage.setItem('paymentId', checkout.paymentId)

    document.body.appendChild(form)
    form.submit()
  }

  // ✅ Get product image
  const getProductImage = (item) => {
    if (item.productImageUrl) return item.productImageUrl
    if (item.imageUrl) return item.imageUrl
    if (item.image) return item.image
    if (item.productImage) return item.productImage
    return 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200'
  }

  const getProductName = (item) => {
    if (item.productTitle) return item.productTitle
    if (item.productName) return item.productName
    if (item.title) return item.title
    if (item.name) return item.name
    return 'Product'
  }

  const getProductColor = (item) => {
    if (item.productColor) return item.productColor
    if (item.color) return item.color
    return null
  }

  const getProductSizes = (item) => {
    if (item.productSizes) return item.productSizes
    if (item.sizes) return item.sizes
    return null
  }

  if (!userId && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center bg-white min-h-screen">
        <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-[#391F10] mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Please login to view your cart</p>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#391F10]">Shopping Cart</h1>
        <span className="text-sm text-gray-500">({cartItems.length} items)</span>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBagIcon className="h-20 w-20 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-[#391F10] mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">Start shopping to add items!</p>
          <Link 
            href="/"
            className="inline-block bg-[#391F10] text-white px-8 py-3 rounded-lg hover:bg-[#2a1509] transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => {
                const imageUrl = getProductImage(item)
                const productName = getProductName(item)
                const color = getProductColor(item)
                const sizes = getProductSizes(item)
                const price = item.price || 0
                
                return (
                  <motion.div
                    key={item.cartId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 sm:p-6 border border-gray-100"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=100'
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-[#391F10] text-sm sm:text-base truncate">
                              {productName}
                            </h3>
                            {(color || sizes) && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {color && (
                                  <span className="text-xs text-gray-500">
                                    Color: <span className="font-medium">{color}</span>
                                  </span>
                                )}
                                {sizes && (
                                  <span className="text-xs text-gray-500">
                                    Size: <span className="font-medium">{sizes}</span>
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-sm font-medium text-[#391F10] mt-1">
                              ${price.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.cartId)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg flex-shrink-0"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateQuantity(item.cartId, item.qty - 1)}
                            disabled={updating || item.qty <= 1}
                            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:border-[#391F10] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId, item.qty + 1)}
                            disabled={updating}
                            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:border-[#391F10] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-bold text-[#391F10] ml-auto">
                            ${(price * item.qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-20">
              <h2 className="text-lg font-bold text-[#391F10] mb-4">Order Summary</h2>
              <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4">
                <span>Total</span>
                <span className="text-[#391F10]">${total.toFixed(2)}</span>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mt-3">
                  {error}
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                disabled={checkoutLoading || cartItems.length === 0}
                className={`w-full py-3.5 rounded-lg font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${
                  checkoutLoading || cartItems.length === 0
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-[#391F10] text-white hover:bg-[#2a1509] hover:shadow-lg'
                }`}
              >
                {checkoutLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay Now
                    <ArrowRightIcon className="h-5 w-5" />
                  </>
                )}
              </motion.button>

              <Link 
                href="/"
                className="block text-center text-sm text-[#C9A96E] hover:text-[#b8965a] transition-colors mt-4"
              >
                Continue Shopping →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
