'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { 
  PlusIcon, TrashIcon, PencilIcon, XMarkIcon,
  PhotoIcon, FolderIcon, TagIcon,
  CheckCircleIcon, ExclamationCircleIcon,
  CloudArrowUpIcon, ShoppingBagIcon
} from '@heroicons/react/24/outline'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function Admin() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  // ==================== ADMIN ROLE CHECK ====================
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
    } else if (user.role === 'Admin' || user.role === 'admin') {
      setIsAuthorized(true)
    } else {
      router.push('/')
    }

    setAuthChecking(false)
  }, [authLoading, router, user])

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
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [deletedImageIds, setDeletedImageIds] = useState([])
  const [primaryImageId, setPrimaryImageId] = useState(null)
  const [primaryNewIndex, setPrimaryNewIndex] = useState(0)
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
    imageUrl: ''
  })

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')
  const [pushingOrderId, setPushingOrderId] = useState(null)

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

  // ==================== ORDERS API ====================
  const fetchOrders = async () => {
    setOrdersLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/orders`, { headers: headers() })
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } else {
        setError('Failed to fetch orders')
      }
    } catch (err) {
      setError('Failed to fetch orders')
    } finally {
      setOrdersLoading(false)
    }
  }

const handleShiprocketPush = async (order) => {
  if (!confirm('Are you sure you want to push this order to Shiprocket?')) return

  setPushingOrderId(order.orderId)
  setError('')
  setSuccess('')

  try {
    const shiprocketData = {
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      pickupLocation: 'home'
    }

    const res = await fetch(
      `${API_BASE}/orders/${order.orderId}/shiprocket-push`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers()
        },
        body: JSON.stringify(shiprocketData)
      }
    )

    if (res.ok) {
      fetchOrders()
    } else {
      const err = await res.json()
      setError(err.message || 'Failed to push order to Shiprocket')
    }
  } catch (err) {
    setError('Network error. Failed to push order.')
  } finally {
    setPushingOrderId(null)
  }
}

  // ==================== IMAGE UPLOAD ====================
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImageFiles(prev => [...prev, ...files])

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [
          ...prev,
          {
            file,
            name: file.name,
            url: reader.result,
            color: '',
            size: ''
          }
        ])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeNewImage = (indexToRemove) => {
    setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove))
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove))
    if (primaryNewIndex === indexToRemove) {
      setPrimaryNewIndex(0)
    } else if (primaryNewIndex > indexToRemove) {
      setPrimaryNewIndex(prev => prev - 1)
    }
  }

  const removeExistingImage = (imageId) => {
    if (imageId !== 'legacy') {
      setDeletedImageIds(prev => [...prev, imageId])
    }
    setExistingImages(prev => prev.filter(img => img.productImageId !== imageId))
    if (primaryImageId === imageId) {
      setPrimaryImageId(null)
    }
  }

  const updateNewImageMeta = (index, field, value) => {
    setImagePreviews(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const updateExistingImageMeta = (imageId, field, value) => {
    setExistingImages(prev => prev.map(item => (item.productImageId === imageId ? { ...item, [field]: value } : item)))
  }

  // ==================== LOAD DATA ====================
useEffect(() => {
  if (!isAuthorized) return

  fetchProducts()
  fetchCategories()
  fetchOrders()
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
      imageUrl: ''
    })
    setImageFiles([])
    setImagePreviews([])
    setExistingImages([])
    setDeletedImageIds([])
    setPrimaryImageId(null)
    setPrimaryNewIndex(0)
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
      
      // Multi-image upload and variant metadata support
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formDataObj.append('ImageFiles', file)
        })
        const primFile = imageFiles[primaryNewIndex] || imageFiles[0]
        if (primFile) {
          formDataObj.append('ImageFile', primFile)
        }
      }

      // Per-image variant metadata (color, size, isPrimary)
      const imageMetadata = [
        ...existingImages.map((img) => ({
          productImageId: img.productImageId !== 'legacy' ? img.productImageId : null,
          color: img.color?.trim() || '',
          size: img.size?.trim() || '',
          isPrimary: primaryImageId ? primaryImageId === img.productImageId : (img.isPrimary && imageFiles.length === 0)
        })),
        ...imagePreviews.map((prev, idx) => ({
          newFileIndex: idx,
          color: prev.color?.trim() || '',
          size: prev.size?.trim() || '',
          isPrimary: !primaryImageId && primaryNewIndex === idx
        }))
      ]

      formDataObj.append('ImageMetadataJson', JSON.stringify(imageMetadata))

      imagePreviews.forEach((prev) => {
        formDataObj.append('ImageColors', prev.color?.trim() || '')
        formDataObj.append('ImageSizes', prev.size?.trim() || '')
      })

      if (deletedImageIds.length > 0) {
        deletedImageIds.forEach((id) => {
          formDataObj.append('DeletedImageIds', id)
        })
      }

      if (primaryImageId) {
        formDataObj.append('PrimaryImageId', primaryImageId)
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
          imageUrl: p.imageUrl || ''
        })

        const imgs = Array.isArray(p.images) && p.images.length > 0
          ? p.images.map((img) => ({
              productImageId: img.productImageId,
              imageUrl: img.imageUrl,
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder,
              color: img.color || '',
              size: img.size || ''
            }))
          : (p.imageUrl ? [{
              productImageId: 'legacy',
              imageUrl: p.imageUrl,
              isPrimary: true,
              displayOrder: 0,
              color: '',
              size: ''
            }] : [])
        setExistingImages(imgs)
        const prim = imgs.find(img => img.isPrimary)
        if (prim && prim.productImageId !== 'legacy') {
          setPrimaryImageId(prim.productImageId)
        } else {
          setPrimaryImageId(null)
        }
        setImageFiles([])
        setImagePreviews([])
        setDeletedImageIds([])
        setPrimaryNewIndex(0)
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
            <p className="text-gray-500 text-sm">Manage products, categories & orders</p>
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

        {/* Tabs Control */}
        <div className="flex border-b border-gray-200 mb-6 gap-2">
          <button
            onClick={() => {
              setActiveTab('products')
              setShowProductForm(false)
              setShowCategoryForm(false)
            }}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'products'
                ? 'border-[#391F10] text-[#391F10]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('categories')
              setShowProductForm(false)
              setShowCategoryForm(false)
            }}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'categories'
                ? 'border-[#102A39] text-[#102A39]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('orders')
              setShowProductForm(false)
              setShowCategoryForm(false)
            }}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#C9A96E] text-[#C9A96E]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders ({orders.length})
          </button>
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

                  {/* Multi-Image Upload & Management */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Product Images
                        {hasError('ImageFile') && (
                          <span className="text-red-500 text-xs ml-1">{getError('ImageFile')}</span>
                        )}
                      </label>
                      <span className="text-xs text-gray-400">
                        {existingImages.length + imagePreviews.length} image{existingImages.length + imagePreviews.length === 1 ? '' : 's'} total
                      </span>
                    </div>

                    {/* Upload Drop Area */}
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 hover:border-[#391F10] transition-all cursor-pointer bg-gray-50/50 hover:bg-white ${
                        hasError('ImageFile') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                        <div className="text-center">
                          <span className="text-sm font-medium text-[#391F10]">Click to browse images</span>
                          <span className="text-sm text-gray-500"> or select multiple files</span>
                        </div>
                        <p className="text-xs text-gray-400">Supports JPG, PNG, WEBP (Max 5MB each)</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Preview & Existing Images Grid */}
                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {/* Existing Images */}
                        {existingImages.map((img) => {
                          const isPrimary = primaryImageId
                            ? primaryImageId === img.productImageId
                            : (img.isPrimary && imagePreviews.length === 0);

                          return (
                            <div
                              key={img.productImageId || img.imageUrl}
                              className={`relative group rounded-lg overflow-hidden border-2 bg-white flex flex-col shadow-sm transition-all ${
                                isPrimary ? 'border-[#C9A96E] ring-2 ring-[#C9A96E]/20 shadow-md' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                <img
                                  src={img.imageUrl}
                                  alt="Existing product"
                                  className="w-full h-full object-cover"
                                />

                                {/* Primary Badge or Set Primary Button */}
                                {isPrimary ? (
                                  <span className="absolute top-1 left-1 bg-[#391F10] text-[#C9A96E] text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                    ★ Primary
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPrimaryImageId(img.productImageId);
                                      setPrimaryNewIndex(-1);
                                    }}
                                    className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-white/90 text-gray-700 text-[10px] font-medium px-1.5 py-0.5 rounded shadow hover:bg-white transition-opacity"
                                  >
                                    Make Primary
                                  </button>
                                )}

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeExistingImage(img.productImageId);
                                  }}
                                  className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 shadow hover:bg-red-600 transition-all opacity-80 group-hover:opacity-100"
                                  title="Remove image"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Per-Image Variant Controls */}
                              <div className="p-2 border-t border-gray-100 flex flex-col gap-2 bg-gray-50/50 text-xs">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-500 font-medium w-9">Color:</span>
                                    {/* Clickable Color Swatch Box that opens color palette */}
                                    <label className="relative flex-1 flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-md hover:border-[#391F10] transition-all cursor-pointer shadow-xs group/color">
                                      <span
                                        className="w-4 h-4 rounded-full border border-gray-300 shadow-inner flex-shrink-0"
                                        style={{ backgroundColor: img.color || '#391F10' }}
                                      />
                                      <span className="text-[11px] font-mono text-gray-700 flex-1 truncate">
                                        {img.color || '#391F10'}
                                      </span>
                                      <span className="text-[9px] text-gray-400 group-hover/color:text-[#391F10] font-medium transition-colors">
                                        Palette
                                      </span>
                                      <input
                                        type="color"
                                        value={img.color && /^#[0-9A-F]{6}$/i.test(img.color) ? img.color : '#391F10'}
                                        onChange={(e) => updateExistingImageMeta(img.productImageId, 'color', e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                      />
                                    </label>
                                  </div>
                                  {/* Quick Palette Swatches */}
                                  <div className="flex items-center justify-between pl-10 pr-0.5 pt-0.5">
                                    {['#000000', '#FFFFFF', '#391F10', '#C9A96E', '#DC2626', '#2563EB', '#16A34A'].map((hex) => (
                                      <button
                                        key={hex}
                                        type="button"
                                        onClick={() => updateExistingImageMeta(img.productImageId, 'color', hex)}
                                        className={`w-3.5 h-3.5 rounded-full border transition-all hover:scale-125 ${
                                          (img.color || '').toLowerCase() === hex.toLowerCase() ? 'ring-1 ring-[#391F10] scale-110' : 'border-gray-300'
                                        }`}
                                        style={{ backgroundColor: hex }}
                                        title={`Set color to ${hex}`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-500 font-medium w-9">Size:</span>
                                  <input
                                    type="text"
                                    value={img.size || ''}
                                    onChange={(e) => updateExistingImageMeta(img.productImageId, 'size', e.target.value)}
                                    placeholder="e.g. M / L / One Size"
                                    className="flex-1 px-1.5 py-1 text-[11px] border border-gray-200 rounded-md focus:border-[#391F10] focus:ring-0 bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* New Upload Previews */}
                        {imagePreviews.map((preview, idx) => {
                          const isPrimary = !primaryImageId && primaryNewIndex === idx;

                          return (
                            <div
                              key={idx}
                              className={`relative group rounded-lg overflow-hidden border-2 bg-white flex flex-col shadow-sm transition-all ${
                                isPrimary ? 'border-[#C9A96E] ring-2 ring-[#C9A96E]/20 shadow-md' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                <img
                                  src={preview.url}
                                  alt={preview.name || 'New upload'}
                                  className="w-full h-full object-cover"
                                />

                                {/* Primary Badge or Set Primary Button */}
                                {isPrimary ? (
                                  <span className="absolute top-1 left-1 bg-[#391F10] text-[#C9A96E] text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                    ★ Primary
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPrimaryNewIndex(idx);
                                      setPrimaryImageId(null);
                                    }}
                                    className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-white/90 text-gray-700 text-[10px] font-medium px-1.5 py-0.5 rounded shadow hover:bg-white transition-opacity"
                                  >
                                    Make Primary
                                  </button>
                                )}

                                {/* New Indicator Tag */}
                                <span className="absolute bottom-1 left-1 bg-green-600/90 text-white text-[9px] font-semibold px-1 rounded shadow">
                                  New
                                </span>

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNewImage(idx);
                                  }}
                                  className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 shadow hover:bg-red-600 transition-all opacity-80 group-hover:opacity-100"
                                  title="Remove image"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Per-Image Variant Controls */}
                              <div className="p-2 border-t border-gray-100 flex flex-col gap-2 bg-gray-50/50 text-xs">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-500 font-medium w-9">Color:</span>
                                    {/* Clickable Color Swatch Box that opens color palette */}
                                    <label className="relative flex-1 flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-md hover:border-[#391F10] transition-all cursor-pointer shadow-xs group/color">
                                      <span
                                        className="w-4 h-4 rounded-full border border-gray-300 shadow-inner flex-shrink-0"
                                        style={{ backgroundColor: preview.color || '#391F10' }}
                                      />
                                      <span className="text-[11px] font-mono text-gray-700 flex-1 truncate">
                                        {preview.color || '#391F10'}
                                      </span>
                                      <span className="text-[9px] text-gray-400 group-hover/color:text-[#391F10] font-medium transition-colors">
                                        Palette
                                      </span>
                                      <input
                                        type="color"
                                        value={preview.color && /^#[0-9A-F]{6}$/i.test(preview.color) ? preview.color : '#391F10'}
                                        onChange={(e) => updateNewImageMeta(idx, 'color', e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                      />
                                    </label>
                                  </div>
                                  {/* Quick Palette Swatches */}
                                  <div className="flex items-center justify-between pl-10 pr-0.5 pt-0.5">
                                    {['#000000', '#FFFFFF', '#391F10', '#C9A96E', '#DC2626', '#2563EB', '#16A34A'].map((hex) => (
                                      <button
                                        key={hex}
                                        type="button"
                                        onClick={() => updateNewImageMeta(idx, 'color', hex)}
                                        className={`w-3.5 h-3.5 rounded-full border transition-all hover:scale-125 ${
                                          (preview.color || '').toLowerCase() === hex.toLowerCase() ? 'ring-1 ring-[#391F10] scale-110' : 'border-gray-300'
                                        }`}
                                        style={{ backgroundColor: hex }}
                                        title={`Set color to ${hex}`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-500 font-medium w-9">Size:</span>
                                  <input
                                    type="text"
                                    value={preview.size || ''}
                                    onChange={(e) => updateNewImageMeta(idx, 'size', e.target.value)}
                                    placeholder="e.g. M / L / One Size"
                                    className="flex-1 px-1.5 py-1 text-[11px] border border-gray-200 rounded-md focus:border-[#391F10] focus:ring-0 bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Quick Add More Tile */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="min-h-[160px] rounded-lg border-2 border-dashed border-gray-300 hover:border-[#391F10] flex flex-col items-center justify-center text-gray-400 hover:text-[#391F10] transition-all bg-white p-4"
                        >
                          <PlusIcon className="h-6 w-6 mb-1" />
                          <span className="text-xs font-medium">Add More</span>
                          <span className="text-[10px] text-gray-400">Variant photos</span>
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      Tip: You can assign a specific Color and Size to each image. Click &quot;Make Primary&quot; to set the default catalog cover.
                    </p>
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
        {activeTab === 'categories' && (
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

        )}

        {/* Products Table */}
        {activeTab === 'products' && (
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
                          <div className="relative w-10 h-10 flex-shrink-0">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <PhotoIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            {(p.images?.length > 1 || p.imageUrls?.length > 1) && (
                              <span 
                                className="absolute -bottom-1 -right-1 bg-[#391F10] text-[#C9A96E] text-[9px] font-bold px-1 rounded-full border border-white shadow-sm"
                                title={`${p.images?.length || p.imageUrls?.length} images`}
                              >
                                {p.images?.length || p.imageUrls?.length}
                              </span>
                            )}
                          </div>
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
        )}

        {/* Orders Table */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-[#391F10] flex items-center gap-2">
                <ShoppingBagIcon className="h-5 w-5" />
                Orders ({orders.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shiprocket Details</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersLoading ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading orders...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{order.customerName|| 'N/A'}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-800">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[#391F10]">INR {order.totalAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.productId} className="text-xs">
                                <span className="font-semibold">{item.productTitle}</span> (x{item.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            order.orderStatus === 'Shipped' ? 'bg-green-100 text-green-800 border-green-200' :
                            order.orderStatus === 'Placed' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            order.orderStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            order.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 space-y-0.5">
                          {order.shiprocketOrderId ? (
                            <div>ID: <span className="font-semibold">{order.shiprocketOrderId}</span></div>
                          ) : null}
                          {order.shiprocketShipmentId ? (
                            <div>Shipment: <span className="font-semibold">{order.shiprocketShipmentId}</span></div>
                          ) : null}
                          {!order.shiprocketOrderId && !order.shiprocketShipmentId ? (
                            <span className="text-gray-400 italic">Not pushed</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {!order.shiprocketOrderId && !order.shiprocketShipmentId ? (
                            <button
                              onClick={() => handleShiprocketPush(order)}
                              disabled={pushingOrderId === order.orderId}
                              className="bg-[#C9A96E] hover:bg-[#b8965a] disabled:bg-gray-300 text-[#391F10] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1"
                            >
                              {pushingOrderId === order.orderId ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-[#391F10] border-t-transparent rounded-full animate-spin" />
                                  Pushing...
                                </>
                              ) : (
                                'Confirm'
                              )}
                            </button>
                          ) : (
                            <span className="text-green-600 text-xs font-semibold">Pushed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
