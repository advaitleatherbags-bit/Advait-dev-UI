'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function ProductDetail() {
  const params = useParams()
  const id = params.id
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [colors, setColors] = useState([])
  const [sizes, setSizes] = useState([])

  // ✅ Get token from localStorage
  const getToken = () => localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userId = user.userId

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    setError('')
    try {
      // ✅ Add Authorization header with token
      const response = await fetch(`${API_BASE}/Products/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        
        if (data.color) {
          const colorArray = data.color.split(',').map(c => c.trim())
          setColors(colorArray)
          setSelectedColor(colorArray[0] || '')
        }
        if (data.sizes) {
          const sizeArray = data.sizes.split(',').map(s => s.trim())
          setSizes(sizeArray)
          setSelectedSize(sizeArray[0] || '')
        }
      } else if (response.status === 401) {
        setError('Please login to view product details')
      } else if (response.status === 404) {
        setError('Product not found')
      } else {
        setError('Failed to load product')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
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
          productId: id,
          qty: quantity,
          price: product?.price || 0
        })
      })

      if (response.ok) {
        alert('Added to cart successfully!')
      } else {
        const err = await response.text()
        alert('Failed to add to cart: ' + err)
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">⚠️ {error}</h2>
        {error.includes('login') && (
          <a 
            href="/login"
            className="mt-4 inline-block bg-[#391F10] text-white px-6 py-2 rounded-lg hover:bg-[#2a1509] transition-all"
          >
            Go to Login
          </a>
        )}
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 ml-4 inline-block bg-gray-200 text-[#391F10] px-6 py-2 rounded-lg hover:bg-gray-300 transition-all"
        >
          Go Back Home
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-[#391F10] mb-2">Product Not Found</h2>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-96 md:h-[500px] bg-gray-100 rounded-2xl overflow-hidden shadow-lg"
        >
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600'}
            alt={product.title || 'Product'}
            className="w-full h-full object-cover"
          />
          {product.discountPercentage > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {product.discountPercentage}% OFF
            </span>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-2">
              {product.categoryName || 'Fashion'}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#391F10]">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="text-gray-500 text-sm mt-1">{product.subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-[#391F10]">${product.price}</span>
            {product.discountPercentage > 0 && (
              <span className="text-lg text-gray-400 line-through">
                ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#391F10] mb-3">Color</h3>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      selectedColor === color 
                        ? 'border-[#391F10] scale-110 shadow-lg' 
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#391F10] mb-3">Size</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 border-2 rounded-lg transition-all duration-300 font-medium ${
                      selectedSize === size
                        ? 'bg-[#391F10] text-white border-[#391F10] shadow-lg'
                        : 'border-gray-300 hover:border-[#391F10] hover:scale-105'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-[#391F10] mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-[#391F10] transition-all duration-300 text-xl font-bold"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-[#391F10] transition-all duration-300 text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={addToCart}
              disabled={addingToCart}
              className={`flex-1 bg-[#391F10] text-white px-8 py-4 rounded-full hover:bg-[#2a1509] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold text-base ${
                addingToCart ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ShoppingBagIcon className="h-5 w-5" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`px-6 py-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center gap-2 font-medium ${
                isWishlisted
                  ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                  : 'border-gray-300 hover:border-[#391F10] hover:scale-105'
              }`}
            >
              {isWishlisted ? (
                <>
                  <HeartSolid className="h-5 w-5" />
                  Wishlisted
                </>
              ) : (
                <>
                  <HeartIcon className="h-5 w-5" />
                  Add to Wishlist
                </>
              )}
            </motion.button>
          </div>

          {/* Product Details */}
          {product.productDetails && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-[#391F10] mb-4">Product Details</h3>
              <ul className="space-y-2">
                {product.productDetails.split(',').map((detail, index) => (
                  <li key={index} className="text-gray-600 flex items-start gap-2">
                    <span className="text-[#C9A96E] mt-1">✦</span>
                    {detail.trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
