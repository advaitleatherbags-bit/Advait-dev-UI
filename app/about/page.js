'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

// Testimonials Data - Leather Bags Customers
const testimonials = [
  {
    id: 'test-1',
    name: 'Rahul Sharma',
    role: 'Business Professional',
    content: 'The leather briefcase I bought from ADVIT is absolutely stunning. The quality is unmatched and it gets better with age.',
    rating: 5
  },
  {
    id: 'test-2',
    name: 'Priya Patel',
    role: 'Fashion Blogger',
    content: 'Ive been using my ADVIT leather handbag for over a year now and it still looks brand new. Truly premium quality!',
    rating: 5
  },
  {
    id: 'test-3',
    name: 'Amit Kumar',
    role: 'Entrepreneur',
    content: 'The craftsmanship on these leather bags is exceptional. Every detail is perfect. Highly recommend!',
    rating: 5
  },
  {
    id: 'test-4',
    name: 'Sneha Reddy',
    role: 'Corporate Executive',
    content: 'My go-to leather tote for work. Its elegant, durable, and gets compliments everywhere I go.',
    rating: 5
  },
  {
    id: 'test-5',
    name: 'Vikram Singh',
    role: 'Business Owner',
    content: 'Ive been a loyal customer for years. The quality and service are unmatched. Best leather bags in India.',
    rating: 5
  },
  {
    id: 'test-6',
    name: 'Kavya Nair',
    role: 'Fashion Influencer',
    content: 'ADVIT is my go-to for premium leather accessories. Their collections are always on point and timeless.',
    rating: 5
  }
]

// Categories Data - Leather Bags Categories
const categories = [
  { id: 'cat-1', name: 'Handbags', icon: '👜', bg: 'from-pink-50 to-purple-50' },
  { id: 'cat-2', name: 'Briefcases', icon: '💼', bg: 'from-blue-50 to-indigo-50' },
  { id: 'cat-3', name: 'Backpacks', icon: '🎒', bg: 'from-amber-50 to-orange-50' },
  { id: 'cat-4', name: 'Wallets', icon: '👛', bg: 'from-emerald-50 to-teal-50' },
  { id: 'cat-5', name: 'Messenger Bags', icon: '📁', bg: 'from-purple-50 to-pink-50' },
  { id: 'cat-6', name: 'Luggage', icon: '🧳', bg: 'from-red-50 to-rose-50' },
]

// Instagram Posts - Leather Fashion
const instagramPosts = [
  { id: 'insta-1', url: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400' },
  { id: 'insta-2', url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400' },
  { id: 'insta-3', url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400' },
  { id: 'insta-4', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400' },
  { id: 'insta-5', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
  { id: 'insta-6', url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400' },
]

export default function About() {
  return (
    <div className="min-h-screen py-8 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        
        {/* Shop by Category Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-20"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#391F10] mb-2 sm:mb-3 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
              Explore our premium leather bag collection
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: parseInt(category.id.split('-')[1]) * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group cursor-pointer"
              >
                <Link href={`/collection?category=${category.name.toLowerCase()}`}>
                  <div className={`bg-gradient-to-br ${category.bg} rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all duration-300 shadow-sm hover:shadow-xl border-2 border-transparent hover:border-[#C9A96E]`}>
                    <div className="text-3xl sm:text-5xl md:text-6xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-[#391F10] text-xs sm:text-sm md:text-base">{category.name}</h3>
                    <div className="mt-1 sm:mt-2 w-6 sm:w-8 h-0.5 bg-[#C9A96E] mx-auto group-hover:w-8 sm:group-hover:w-12 transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Customer Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 sm:mb-20"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#391F10] mb-2 sm:mb-3 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
              Real stories from real customers who love ADVIT leather
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#C9A96E]/20 to-[#C9A96E]/5 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 border-2 border-[#C9A96E]/20">
                    👤
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#391F10] text-sm sm:text-base">{testimonial.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-2 sm:mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic text-sm sm:text-base">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Instagram Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#391F10] mb-2 sm:mb-3 tracking-tight">
              Follow Us on Instagram
            </h2>
            <p className="text-sm sm:text-base text-gray-500">@advit_leather</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {instagramPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <Link href="#">
                  <img
                    src={post.url}
                    alt={`Instagram post ${index + 1}`}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2 sm:pb-4">
                    <span className="text-white text-[8px] sm:text-xs font-medium bg-black/40 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">View</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}