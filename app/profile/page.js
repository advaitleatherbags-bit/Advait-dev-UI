'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  CreditCardIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function Profile() {
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()
  
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [retryingOrderId, setRetryingOrderId] = useState(null)

  const fetchOrders = useCallback(async (authToken) => {
    setLoadingOrders(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } else {
        setError('Failed to fetch your orders. Please try again.')
      }
    } catch (err) {
      setError('Network error. Failed to load orders.')
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!user || !token) {
      router.push('/login')
      return
    }

    fetchOrders(token)
  }, [authLoading, user, token, router, fetchOrders])

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

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

  const handleRetryPayment = async (orderId) => {
    setRetryingOrderId(orderId)
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/retry-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        redirectToPayU(data)
      } else {
        const errMsg = await response.text()
        alert(errMsg || 'Failed to retry payment. Please try again.')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setRetryingOrderId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'PaymentFailed':
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#391F10] px-6 py-8 sm:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20">
                <UserIcon className="h-10 w-10 text-[#C9A96E]" />
              </div>
              <div className="text-white space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold">{user.username || 'My Profile'}</h1>
                <p className="text-[#C9A96E] font-medium text-sm capitalize">{user.role || 'Customer'}</p>
              </div>
            </div>
          </div>
          
          {/* Profile Details Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{user.emailAddress || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mobile Number</p>
                <p className="text-sm font-semibold text-gray-800">{user.mobileNumber || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Member Since</p>
                <p className="text-sm font-semibold text-gray-800">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Shipping Address</p>
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{user.shippingAddress || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="h-6 w-6 text-[#391F10]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#391F10]">Order History</h2>
            <span className="text-sm text-gray-400">({orders.length} orders)</span>
          </div>

          {loadingOrders ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-8 h-8 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 mt-3 text-sm">Retrieving your orders...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm text-center">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center space-y-4">
              <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-300" />
              <h3 className="text-lg font-bold text-[#391F10]">No orders found</h3>
              <p className="text-gray-500 max-w-sm mx-auto text-sm">
                You haven&apos;t placed any orders yet. Visit our shop and grab some amazing clothes!
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-[#391F10] text-white px-6 py-2.5 rounded-lg hover:bg-[#2a1509] transition-all text-sm font-semibold shadow-md"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrder === order.orderId
                return (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-gray-200 transition-all"
                  >
                    {/* Order Summary Bar */}
                    <div
                      onClick={() => toggleExpand(order.orderId)}
                      className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Order Number</p>
                          <p className="text-sm font-bold text-gray-800">{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Placed On</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Total Amount</p>
                          <p className="text-sm font-bold text-gray-800">INR {order.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-0.5">Status</p>
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 self-end md:self-auto">
                        {(order.orderStatus === 'Pending' || order.orderStatus === 'PaymentFailed') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRetryPayment(order.orderId)
                            }}
                            disabled={retryingOrderId === order.orderId}
                            className="bg-[#C9A96E] hover:bg-[#b8965a] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#391F10] px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            {retryingOrderId === order.orderId ? (
                              <>
                                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCardIcon className="h-3.5 w-3.5" />
                                Retry Payment
                              </>
                            )}
                          </button>
                        )}
                        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Order Details (Collapsible) */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-gray-100 bg-gray-50/30"
                        >
                          <div className="p-5 sm:p-6 space-y-6">
                            
                            {/* Items List */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</h4>
                              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                                {order.items.map((item) => (
                                  <div key={item.productId} className="p-4 flex items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                      <p className="text-sm font-semibold text-gray-800 hover:text-[#C9A96E] transition-colors">
                                        {item.productTitle}
                                      </p>
                                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-gray-800">INR {item.price.toFixed(2)}</p>
                                      <p className="text-xs text-gray-400">Total: INR {(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping & Tracking info (If available) */}
                            {(order.shiprocketOrderId || order.shiprocketShipmentId) && (
                              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipment & Delivery Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  {order.shiprocketOrderId && (
                                    <div>
                                      <span className="text-gray-500">Shiprocket Order ID:</span>{' '}
                                      <span className="font-semibold text-gray-800">{order.shiprocketOrderId}</span>
                                    </div>
                                  )}
                                  {order.shiprocketShipmentId && (
                                    <div>
                                      <span className="text-gray-500">Shiprocket Shipment ID:</span>{' '}
                                      <span className="font-semibold text-gray-800">{order.shiprocketShipmentId}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
