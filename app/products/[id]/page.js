'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { HeartIcon, ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const getToken = () => localStorage.getItem('token')

export default function ProductDetail() {
  const params = useParams()
  const id = params.id
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [colors, setColors] = useState([])
  const [sizes, setSizes] = useState([])

  const { user } = useAuth()
  const userId = user?.userId || user?.id || null

  const fetchProduct = useCallback(async () => {
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
        
        // Gather all colors from product and image variants
        const allColors = new Set()
        if (data.color) {
          data.color.split(',').map(c => c.trim()).filter(Boolean).forEach(c => allColors.add(c))
        }
        if (Array.isArray(data.images)) {
          data.images.forEach(img => {
            if (img.color && img.color.trim()) allColors.add(img.color.trim())
          })
        }
        const colorArray = Array.from(allColors)
        setColors(colorArray)
        setSelectedColor(colorArray[0] || '')

        // Gather all sizes from product and image variants
        const allSizes = new Set()
        if (data.sizes) {
          data.sizes.split(',').map(s => s.trim()).filter(Boolean).forEach(s => allSizes.add(s))
        }
        if (Array.isArray(data.images)) {
          data.images.forEach(img => {
            if (img.size && img.size.trim()) allSizes.add(img.size.trim())
          })
        }
        const sizeArray = Array.from(allSizes)
        setSizes(sizeArray)
        setSelectedSize(sizeArray[0] || '')
      } else if (response.status === 401) {
        setError('Please login to view product details')
      } else if (response.status === 404) {
        setError('Product not found')
      } else {
        setError('Failed to load product')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [fetchProduct, id])

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
        window.dispatchEvent(new Event('advit:commerce-updated'))
      } else {
        const err = await response.text()
        alert('Failed to add to cart: ' + err)
      }
    } catch {
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
        <p className="text-gray-600">The product you&apos;re looking for doesn&apos;t exist.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 bg-[#391F10] text-white px-6 py-2 rounded-lg hover:bg-[#2a1509] transition-all"
        >
          Go Back Home
        </button>
      </div>
    )
  }

  const productImages = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : (product?.imageUrls?.length > 0
        ? product.imageUrls.map((url, i) => ({
            productImageId: `url-${i}`,
            imageUrl: url,
            color: product?.color || '',
            size: product?.sizes || '',
            isPrimary: i === 0
          }))
        : (product?.imageUrl ? [{
            productImageId: 'primary',
            imageUrl: product.imageUrl,
            color: product?.color || '',
            size: product?.sizes || '',
            isPrimary: true
          }] : []))

  const currentImageObj = productImages[activeImageIndex] || productImages[0]
  const currentImage = currentImageObj?.imageUrl || product?.imageUrl || 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600'

  const handlePrevImage = (e) => {
    e.stopPropagation()
    const nextIdx = activeImageIndex === 0 ? productImages.length - 1 : activeImageIndex - 1
    setActiveImageIndex(nextIdx)
    const img = productImages[nextIdx]
    if (img?.color) setSelectedColor(img.color)
    if (img?.size) setSelectedSize(img.size)
  }

  const handleNextImage = (e) => {
    e.stopPropagation()
    const nextIdx = activeImageIndex === productImages.length - 1 ? 0 : activeImageIndex + 1
    setActiveImageIndex(nextIdx)
    const img = productImages[nextIdx]
    if (img?.color) setSelectedColor(img.color)
    if (img?.size) setSelectedSize(img.size)
  }

  const handleThumbnailClick = (idx) => {
    setActiveImageIndex(idx)
    const img = productImages[idx]
    if (img?.color && img.color.trim()) {
      setSelectedColor(img.color.trim())
    }
    if (img?.size && img.size.trim()) {
      setSelectedSize(img.size.trim())
    }
  }

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    const targetIdx = productImages.findIndex((img) => {
      const imgColor = img.color?.toLowerCase()?.trim()
      const target = color.toLowerCase().trim()
      return imgColor && (imgColor === target || imgColor.includes(target) || target.includes(imgColor))
    })
    if (targetIdx !== -1) {
      setActiveImageIndex(targetIdx)
    }
  }

  const handleSizeSelect = (size) => {
    setSelectedSize(size)
    const targetIdx = productImages.findIndex((img) => {
      const imgSize = img.size?.toLowerCase()?.trim()
      const target = size.toLowerCase().trim()
      return imgSize && (imgSize === target || imgSize.includes(target) || target.includes(imgSize))
    })
    if (targetIdx !== -1) {
      setActiveImageIndex(targetIdx)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image Gallery */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          {/* Main Display Image */}
          <div className="relative h-96 md:h-[500px] bg-gray-100 rounded-2xl overflow-hidden shadow-lg group">
            <AnimatePresence mode="wait">
              {/* eslint-disable-next-line @next/next/no-img-element -- product images use runtime API URLs. */}
              <motion.img
                key={currentImage}
                src={currentImage}
                alt={product.title || 'Product'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                {product.discountPercentage}% OFF
              </span>
            )}

            {/* Active Variant Pill (Color & Size) */}
            {(currentImageObj?.color || currentImageObj?.size) && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#391F10] shadow-md border border-gray-100 z-10 flex items-center gap-1.5">
                {currentImageObj.color && (
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: currentImageObj.color }}
                  />
                )}
                <span>
                  {[currentImageObj.color, currentImageObj.size].filter(Boolean).join(' • ')}
                </span>
              </div>
            )}

            {/* Navigation Arrows (if multiple images) */}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-200 opacity-80 hover:opacity-100 hover:scale-110 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-200 opacity-80 hover:opacity-100 hover:scale-110 z-10"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>

                {/* Counter Badge */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm z-10 font-medium">
                  {activeImageIndex + 1} / {productImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Strip (if multiple images) */}
          {productImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {productImages.map((img, idx) => {
                const thumbUrl = img.imageUrl || img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleThumbnailClick(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      activeImageIndex === idx
                        ? 'border-[#391F10] ring-2 ring-[#C9A96E]/50 scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- product images use runtime API URLs. */}
                    <img
                      src={thumbUrl}
                      alt={`${product.title} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {img.color && (
                      <span
                        className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: img.color }}
                        title={`Color: ${img.color}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
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
              <h3 className="font-semibold text-[#391F10] mb-3 flex items-center gap-2">
                Color: {selectedColor && <span className="text-sm font-normal text-gray-600 capitalize">{selectedColor}</span>}
              </h3>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      selectedColor === color 
                        ? 'border-[#391F10] ring-2 ring-[#C9A96E]/50 scale-110 shadow-lg' 
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
              <h3 className="font-semibold text-[#391F10] mb-3 flex items-center gap-2">
                Size: {selectedSize && <span className="text-sm font-normal text-gray-600">{selectedSize}</span>}
              </h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
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
