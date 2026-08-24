'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const categories = [
  { id: 'cat-1', name: 'Dresses', icon: '👗', color: '#391F10', bg: 'from-pink-50 to-purple-50' },
  { id: 'cat-2', name: 'Tops', icon: '👚', color: '#102A39', bg: 'from-blue-50 to-cyan-50' },
  { id: 'cat-3', name: 'Outerwear', icon: '🧥', color: '#391F10', bg: 'from-amber-50 to-orange-50' },
  { id: 'cat-4', name: 'Traditional', icon: '👘', color: '#102A39', bg: 'from-emerald-50 to-teal-50' },
  { id: 'cat-5', name: 'Accessories', icon: '👜', color: '#391F10', bg: 'from-purple-50 to-pink-50' },
  { id: 'cat-6', name: 'Footwear', icon: '👠', color: '#102A39', bg: 'from-red-50 to-rose-50' },
]

export default function CategorySection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">
            Find exactly what you're looking for in our curated collections
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: parseInt(category.id.split('-')[1]) * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group cursor-pointer"
            >
              <Link href={`/collection?category=${category.name.toLowerCase()}`}>
                <div className={`bg-gradient-to-br ${category.bg} rounded-2xl p-6 text-center transition-all duration-300 shadow-sm hover:shadow-xl border-2 border-transparent hover:border-[#C9A96E]`}>
                  <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-[#391F10] text-sm md:text-base">{category.name}</h3>
                  <div className="mt-2 w-8 h-0.5 bg-[#C9A96E] mx-auto group-hover:w-12 transition-all duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}