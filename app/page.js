'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HeroSection from './components/HeroSection'
import ProductCard from './components/ProductCard'
import { api } from './utils/api'

export default function Home() {
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

      {/* Leather Craftsmanship Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- the image is a static remote marketing asset. */}
              <img
                src="https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600"
                alt="Leather Craftsmanship"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <span className="inline-block px-3 py-1 bg-[#C9A96E]/10 rounded-full text-[#C9A96E] text-xs font-semibold uppercase tracking-wider">
                Since 2026
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#391F10]">
                Crafted with Excellence
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Each leather bag is meticulously handcrafted using premium full-grain leather. 
                Our artisans combine traditional techniques with modern designs to create 
                timeless pieces that last a lifetime.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">✓ Premium Full-Grain Leather</li>
                <li className="flex items-center gap-2">✓ Handcrafted by Skilled Artisans</li>
                <li className="flex items-center gap-2">✓ Lifetime Durability Guarantee</li>
              </ul>
            </motion.div>
          </div>
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
