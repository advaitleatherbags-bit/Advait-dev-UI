'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, TrashIcon, PencilIcon, XMarkIcon,
  PhotoIcon, FolderIcon, TagIcon,
  CheckCircleIcon, ExclamationCircleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function Admin() {
  const router = useRouter()
  
  // ==================== ADMIN ROLE CHECK ====================
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    // ✅ No token → redirect to login
    if (!token) {
      router.push('/login')
      return
    }

    // ✅ No user data → redirect to login
    if (!storedUser) {
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      
      // ✅ Check if user role is Admin
      if (userData.role === 'Admin' || userData.role === 'admin') {
        setIsAuthorized(true)
      } else {
        // ❌ Not admin → redirect to home
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to parse user:', error)
      router.push('/login')
    } finally {
      setAuthChecking(false)
    }
  }, [router])

  // ==================== STATE ====================
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categorySubmitting, setCategorySubmitting] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    subtitle: '',
    discountPercentage: '',
    price: '',
    label: '',
    description: '',
    productDetails: '',
    color: '',
    sizes: '',
    imageUrl: ''
  })

  // ==================== HELPERS ====================
  const getToken = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }
  
  const headers = () => ({
    'Authorization': `Bearer ${getToken()}`
  })

  // ==================== PRODUCTS API ====================
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/Products`, { headers: headers() })
      if (res.ok) {
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (formDataObj) => {
    return fetch(`${API_BASE}/Products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formDataObj
    })
  }

  const updateProduct = async (id, formDataObj) => {
    return fetch(`${API_BASE}/Products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formDataObj
    })
  }

  const deleteProduct = async (id) => {
    return fetch(`${API_BASE}/Products/${id}`, {
      method: 'DELETE',
      headers: headers()
    })
  }

  const getProduct = async (id) => {
    return fetch(`${API_BASE}/Products/${id}`, { headers: headers() })
  }

  // ==================== CATEGORIES API ====================
  const fetchCategories = async () => {
    setCategoryLoading(true)
    try {
      const res = await fetch(`${API_BASE}/Categories`, { headers: headers() })
      if (res.ok) {
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      setError('Failed to fetch categories')
    } finally {
      setCategoryLoading(false)
    }
  }

  const createCategory = async (name) => {
    return fetch(`${API_BASE}/Categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers()
      },
      body: JSON.stringify({ categoryName: name })
    })
  }

  const updateCategory = async (id, name) => {
    return fetch(`${API_BASE}/Categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers()
      },
      body: JSON.stringify({ categoryName: name })
    })
  }

  const deleteCategory = async (id) => {
    return fetch(`${API_BASE}/Categories/${id}`, {
      method: 'DELETE',
      headers: headers()
    })
  }

  const getCategory = async (id) => {
    return fetch(`${API_BASE}/Categories/${id}`, { headers: headers() })
  }

  // ==================== IMAGE UPLOAD ====================
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ==================== LOAD DATA ====================
  useEffect(() => {
    if (isAuthorized) {
      fetchProducts()
      fetchCategories()
    }
  }, [isAuthorized])

  // ==================== PRODUCT HANDLERS ====================
  const handleProductChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    setError('')
  }

  const resetProductForm = () => {
    setFormData({
      categoryId: '',
      title: '',
      subtitle: '',
      discountPercentage: '',
      price: '',
      label: '',
      description: '',
      productDetails: '',
      color: '',
      sizes: '',
      imageUrl: ''
    })
    setImageFile(null)
    setImagePreview('')
    setValidationErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setEditingProduct(null)
    setShowProductForm(false)
    setError('')
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.categoryId) errors.categoryId = 'Category is required'
    if (!formData.title?.trim()) errors.title = 'Title is required'
    if (!formData.subtitle?.trim()) errors.subtitle = 'Subtitle is required'
    if (!formData.description?.trim()) errors.description = 'Description is required'
    if (!formData.productDetails?.trim()) errors.productDetails = 'ProductDetails is required'
    if (!formData.color?.trim()) errors.color = 'Color is required'
    if (!formData.sizes?.trim()) errors.sizes = 'Sizes is required'
    if (!formData.label) errors.label = 'Label is required'
    if (!formData.price || formData.price <= 0) errors.price = 'Price is required and must be greater than 0'
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError('Please fill all required fields')
      const firstError = document.querySelector('.border-red-500')
      if (firstError) {
        firstError.focus()
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const formDataObj = new FormData()
      formDataObj.append('CategoryId', formData.categoryId)
      formDataObj.append('Title', formData.title.trim())
      formDataObj.append('Subtitle', formData.subtitle.trim())
      formDataObj.append('DiscountPercentage', formData.discountPercentage || '0')
      formDataObj.append('Price', formData.price)
      formDataObj.append('Label', formData.label)
      formDataObj.append('Description', formData.description.trim())
      formDataObj.append('ProductDetails', formData.productDetails.trim())
      formDataObj.append('Color', formData.color.trim())
      formDataObj.append('Sizes', formData.sizes.trim())
      
      if (imageFile) {
        formDataObj.append('ImageFile', imageFile)
      }

      let response
      if (editingProduct) {
        response = await updateProduct(editingProduct.productId, formDataObj)
      } else {
        response = await createProduct(formDataObj)
      }

      if (response.ok) {
        await response.json()
        setSuccess(editingProduct ? 'Product updated successfully!' : 'Product added successfully!')
        fetchProducts()
        resetProductForm()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const err = await response.json()
        if (err.errors) {
          setValidationErrors(err.errors)
          setError('Validation failed. Please check all fields.')
        } else {
          setError(err.title || 'Failed to save product')
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProductDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      const res = await deleteProduct(id)
      if (res.ok) {
        setSuccess('Product deleted!')
        fetchProducts()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to delete')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const handleProductEdit = async (id) => {
    try {
      const res = await getProduct(id)
      if (res.ok) {
        const p = await res.json()
        setFormData({
          categoryId: p.categoryId || '',
          title: p.title || '',
          subtitle: p.subtitle || '',
          discountPercentage: p.discountPercentage || '',
          price: p.price || '',
          label: p.label || '',
          description: p.description || '',
          productDetails: p.productDetails || '',
          color: p.color || '',
          sizes: p.sizes || '',
          imageUrl: p.imageUrl || ''
        })
        if (p.imageUrl) {
          setImagePreview(p.imageUrl)
        }
        setEditingProduct(p)
        setShowProductForm(true)
        setValidationErrors({})
      }
    } catch (err) {
      setError('Failed to fetch product')
    }
  }

  // ==================== CATEGORY HANDLERS ====================
  const resetCategoryForm = () => {
    setCategoryName('')
    setEditingCategory(null)
    setShowCategoryForm(false)
    setError('')
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    setCategorySubmitting(true)
    setError('')
    setSuccess('')

    if (!categoryName.trim()) {
      setError('Category name is required')
      setCategorySubmitting(false)
      return
    }

    try {
      let response
      if (editingCategory) {
        response = await updateCategory(editingCategory.categoryId, categoryName)
      } else {
        response = await createCategory(categoryName)
      }

      if (response.ok) {
        setSuccess(editingCategory ? 'Category updated!' : 'Category added!')
        fetchCategories()
        resetCategoryForm()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const err = await response.text()
        setError(err || 'Failed to save category')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setCategorySubmitting(false)
    }
  }

  const handleCategoryDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return
    try {
      const res = await deleteCategory(id)
      if (res.ok) {
        setSuccess('Category deleted!')
        fetchCategories()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to delete')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const handleCategoryEdit = async (id) => {
    try {
      const res = await getCategory(id)
      if (res.ok) {
        const c = await res.json()
        setCategoryName(c.categoryName)
        setEditingCategory(c)
        setShowCategoryForm(true)
      }
    } catch (err) {
      setError('Failed to fetch category')
    }
  }

  const hasError = (field) => {
    return validationErrors[field] !== undefined
  }

  const getError = (field) => {
    return validationErrors[field] || ''
  }

  // ==================== LOADING / UNAUTHORIZED ====================
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect in useEffect
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#391F10]">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Manage products & categories</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                resetProductForm()
                setShowProductForm(!showProductForm)
                setShowCategoryForm(false)
              }}
              className="bg-[#391F10] text-white px-5 py-2.5 rounded-lg hover:bg-[#2a1509] transition-all flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
            >
              <PlusIcon className="h-4 w-4" />
              {showProductForm ? 'Close Product' : 'Add Product'}
            </button>
            <button
              onClick={() => {
                resetCategoryForm()
                setShowCategoryForm(!showCategoryForm)
                setShowProductForm(false)
              }}
              className="bg-[#102A39] text-white px-5 py-2.5 rounded-lg hover:bg-[#0d1f2a] transition-all flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
            >
              <FolderIcon className="h-4 w-4" />
              {showCategoryForm ? 'Close Category' : 'Add Category'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            {error}
          </div>
        )}

        {/* REST OF THE CODE - Category Form, Product Form, Tables */}
        {/* ... Keep all the existing JSX for forms and tables ... */}
        
        {/* Category Form */}
        <AnimatePresence>
          {showCategoryForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
            >
              <div className="px-6 py-4 bg-[#102A39] flex justify-between items-center">
                <h2 className="text-white font-semibold">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <button onClick={resetCategoryForm} className="text-white/70 hover:text-white">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCategorySubmit} className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#102A39] focus:border-transparent text-sm"
                    placeholder="Category name (e.g., Dresses)"
                    required
                  />
                  <button
                    type="submit"
                    disabled={categorySubmitting}
                    className={`px-6 py-2.5 rounded-lg font-medium text-sm text-white transition-all ${
                      categorySubmitting ? 'bg-gray-400' : 'bg-[#102A39] hover:bg-[#0d1f2a]'
                    }`}
                  >
                    {categorySubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Form */}
        <AnimatePresence>
          {showProductForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
            >
              <div className="px-6 py-4 bg-[#391F10] flex justify-between items-center">
                <h2 className="text-white font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={resetProductForm} className="text-white/70 hover:text-white">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleProductSubmit} className="p-6" encType="multipart/form-data">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                      {hasError('categoryId') && (
                        <span className="text-red-500 text-xs ml-1">{getError('categoryId')}</span>
                      )}
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleProductChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm ${
                        hasError('categoryId') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                      {hasError('title') && (
                        <span className="text-red-500 text-xs ml-1">{getError('title')}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleProductChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm ${
                        hasError('title') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Product title"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle *
                      {hasError('subtitle') && (
                        <span className="text-red-500 text-xs ml-1">{getError('subtitle')}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleProductChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm ${
                        hasError('subtitle') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Product subtitle"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                      {hasError('price') && (
                        <span className="text-red-500 text-xs ml-1">{getError('price')}</span>
                      )}
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleProductChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm ${
                        hasError('price') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="99.99"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm"
                      placeholder="20"
                      min="0"
                      max="100"
                    />
                  </div>

                  {/* Label */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label *
                      {hasError('label') && (
                        <span className="text-red-500 text-xs ml-1">{getError('label')}</span>
                      )}
                    </label>
                    <select
                      name="label"
                      value={formData.label}
                      onChange={handleProductChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm ${
                        hasError('label') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Label</option>
                      <option value="New">New</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Premium">Premium</option>
                      <option value="Sale">Sale</option>
                      <option value="Limited">Limited</option>
                      <option value="Trending">Trending</option>
                      <option value="Handmade">Handmade</option>
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color *
                      {hasError('color') && (
                        <span className="text-red-500 text-xs ml-1">{getError('color')}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleProductChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm ${
                        hasError('color') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="#391F10, #102A39"
                    />
                  </div>

                  {/* Sizes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sizes *
                      {hasError('sizes') && (
                        <span className="text-red-500 text-xs ml-1">{getError('sizes')}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="sizes"
                      value={formData.sizes}
                      onChange={handleProductChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm ${
                        hasError('sizes') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="S, M, L, XL"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image File
                      {hasError('ImageFile') && (
                        <span className="text-red-500 text-xs ml-1">{getError('ImageFile')}</span>
                      )}
                    </label>
                    <div className="flex items-center gap-4">
                      <div 
                        className={`flex-1 border-2 border-dashed rounded-lg p-4 hover:border-[#391F10] transition-all cursor-pointer ${
                          hasError('ImageFile') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <CloudArrowUpIcon className="h-6 w-6 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {imageFile ? imageFile.name : 'Click to upload image'}
                          </span>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </div>
                      {imagePreview && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-lg hover:bg-red-600 transition-all"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Upload JPG, PNG, WEBP (Max 5MB)</p>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                      {hasError('description') && (
                        <span className="text-red-500 text-xs ml-1">{getError('description')}</span>
                      )}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleProductChange}
                      rows="3"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm ${
                        hasError('description') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Product description..."
                    />
                  </div>

                  {/* Product Details */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Details *
                      {hasError('productDetails') && (
                        <span className="text-red-500 text-xs ml-1">{getError('productDetails')}</span>
                      )}
                    </label>
                    <textarea
                      name="productDetails"
                      value={formData.productDetails}
                      onChange={handleProductChange}
                      rows="2"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#391F10] text-sm ${
                        hasError('productDetails') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Material, care instructions, fit..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-all ${
                      submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#391F10] hover:bg-[#2a1509]'
                    }`}
                  >
                    {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-[#391F10] flex items-center gap-2">
              <FolderIcon className="h-5 w-5" />
              Categories ({categories.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoryLoading ? (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No categories found</td></tr>
                ) : (
                  categories.map((cat, i) => (
                    <tr key={cat.categoryId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#102A39]/10 rounded-full text-sm font-medium text-[#102A39]">
                          <TagIcon className="h-3 w-3" />
                          {cat.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(cat.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCategoryEdit(cat.categoryId)}
                            className="p-1.5 text-gray-400 hover:text-[#102A39] transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCategoryDelete(cat.categoryId, cat.categoryName)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-[#391F10] flex items-center gap-2">
              <PhotoIcon className="h-5 w-5" />
              Products ({products.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No products found</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <PhotoIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-[#391F10]">{p.title}</p>
                            <p className="text-xs text-gray-400">{p.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {categories.find(c => c.categoryId === p.categoryId)?.categoryName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#391F10]">${p.price}</td>
                      <td className="px-4 py-3 text-sm">
                        {p.discountPercentage > 0 ? (
                          <span className="text-red-500 font-medium">{p.discountPercentage}%</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {p.label && (
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            p.label === 'Sale' ? 'bg-red-100 text-red-600' :
                            p.label === 'New' ? 'bg-green-100 text-green-600' :
                            p.label === 'Best Seller' ? 'bg-purple-100 text-purple-600' :
                            p.label === 'Premium' ? 'bg-amber-100 text-amber-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {p.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleProductEdit(p.productId)}
                            className="p-1.5 text-gray-400 hover:text-[#C9A96E] transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleProductDelete(p.productId, p.title)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}