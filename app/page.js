'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HeroSection from './components/HeroSection'
import ProductCard from './components/ProductCard'
import { api } from './utils/api'
import { useSnackbar } from './components/SnackbarProvider'

export default function Home() {
  const { showSnackbar } = useSnackbar()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await api.get('/Products')
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      showSnackbar('Could not load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <HeroSection />
      
      {/* ✅ New Collection 2026 Banner */}
      <section className="py-4 bg-gradient-to-r from-[#C9A96E]/10 to-[#C9A96E]/5 border-y border-[#C9A96E]/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-sm text-[#391F10] font-medium">
              ✨ Introducing our <span className="text-[#C9A96E] font-bold">New Collection 2026</span> — Handcrafted leather bags for the modern individual
            </p>
          </motion.div>
        </div>
      </section>
      
      <section className="py-8 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xl sm:text-3xl md:text-5xl font-bold text-[#391F10] mb-2 sm:mb-3 tracking-tight"
            >
              Premium Leather Collection
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xs sm:text-sm md:text-base text-gray-500"
            >
              Handcrafted leather bags for the modern individual
            </motion.p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#391F10] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
              {products.slice(0, 20).map((product) => (
                <motion.div
                  key={product.productId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  viewport={{ once: true }}
                  className="w-full"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-6 sm:mt-12">
            <motion.a
              href="/collection"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-[#391F10] text-white px-6 sm:px-10 py-2.5 sm:py-4 rounded-full hover:bg-[#2a1509] transition-all duration-300 shadow-lg text-sm sm:text-base font-medium hover:shadow-xl"
            >
              View All Bags
            </motion.a>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 bg-[#FBF8F3]">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#C9A96E]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#391F10]/5 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl space-y-5 rounded-2xl border border-[#C9A96E]/20 bg-white/80 p-6 text-center shadow-lg shadow-[#391F10]/5 backdrop-blur-sm sm:p-10"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C9A96E]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#A27D3B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E]" />
                Our Story
              </span>
              <h2 className="text-3xl font-bold leading-tight text-[#391F10] sm:text-4xl">
                Crafted for the journeys that matter.
              </h2>
              <p className="leading-relaxed text-gray-600">
                Each leather bag is meticulously handcrafted using premium full-grain leather. 
                Our artisans combine traditional techniques with modern designs to create 
                timeless pieces that last a lifetime.
              </p>
              <ul className="grid gap-3 border-t border-[#C9A96E]/15 pt-5 text-sm text-gray-600 sm:grid-cols-3">
                <li className="flex items-center justify-center gap-2"><span className="text-[#C9A96E]">✓</span> Premium Leather</li>
                <li className="flex items-center justify-center gap-2"><span className="text-[#C9A96E]">✓</span> Skilled Artisans</li>
                <li className="flex items-center justify-center gap-2"><span className="text-[#C9A96E]">✓</span> Made to Last</li>
              </ul>
            </motion.div>
        </div>
      </section>

      {/* Deal of the Day */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#391F10] to-[#102A39] rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-3xl" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <span className="inline-block px-3 sm:px-4 py-0.5 sm:py-1 bg-[#C9A96E]/20 rounded-full text-[#C9A96E] text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                🔥 Limited Time Offer
              </span>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4">Up to 40% Off</h2>
              <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6">On premium leather bags. Limited stock!</p>
              <a href="/sale" className="inline-block bg-[#C9A96E] text-[#391F10] px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-[#b8965a] transition-all duration-300 text-sm sm:text-base">
                Shop Sale
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
