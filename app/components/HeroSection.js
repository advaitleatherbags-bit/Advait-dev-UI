'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function HeroSection() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#391F10] via-[#1a0e08] to-[#102A39]">
      {/* Premium Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-[#C9A96E]/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-[#102A39]/30 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A96E]/5 rounded-full blur-3xl animate-rotate-slow" />
        
        {isMounted && (
          <>
            <div className="absolute top-20 left-10 w-40 h-40 bg-[#C9A96E]/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#C9A96E]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </>
        )}
        
        {isMounted && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1.5 h-1.5 bg-[#C9A96E]/30 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -120, 0],
                  x: [0, 40, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 2, 0],
                }}
                transition={{
                  duration: 6 + Math.random() * 8,
                  repeat: Infinity,
                  delay: Math.random() * 8,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #C9A96E 1px, transparent 0),
            linear-gradient(45deg, transparent 65%, rgba(201,169,110,0.03) 100%)
          `,
          backgroundSize: '40px 40px, 100% 100%',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* New Collection 2026 Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#C9A96E]/20 to-[#C9A96E]/5 backdrop-blur-md px-6 py-3 rounded-full border border-[#C9A96E]/30 relative group hover:bg-[#C9A96E]/25 transition-all duration-500"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A96E] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C9A96E]" />
              </span>
              <span className="text-[#C9A96E] text-sm font-semibold tracking-wider uppercase">
                ✨ New Collection 2026
              </span>
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05]">
                <span className="block relative">
                  Premium
                  <motion.span
                    className="absolute -bottom-3 left-0 w-0 h-1 bg-gradient-to-r from-[#C9A96E] to-transparent"
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 1.2 }}
                  />
                </span>
                <span className="block text-[#C9A96E] mt-4 relative">
                  Leather Bags
                  <motion.span
                    className="absolute -bottom-3 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9A96E] via-transparent to-[#C9A96E]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 1.5 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-lg leading-relaxed font-light">
              Discover handcrafted leather bags that blend timeless elegance with modern functionality. 
              Each piece tells a story of craftsmanship.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <Link href="/collection" className="bg-[#C9A96E] text-[#391F10] px-10 py-5 rounded-full hover:bg-[#b8965a] transition-all duration-500 shadow-2xl hover:shadow-[0_20px_60px_rgba(201,169,110,0.4)] flex items-center justify-center gap-3 font-bold text-base md:text-lg relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    Explore Collection
                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/new-arrivals" className="border-2 border-white/30 text-white px-10 py-5 rounded-full hover:bg-white hover:text-[#391F10] transition-all duration-500 font-medium text-base md:text-lg backdrop-blur-sm flex items-center justify-center gap-3 group hover:shadow-2xl hover:shadow-white/10">
                  <SparklesIcon className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  New Arrivals
                </Link>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-full flex items-center justify-center">
                  <span className="text-xl">👝</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Premium Leather</p>
                  <p className="text-gray-400 text-xs">Full-grain quality</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-full flex items-center justify-center">
                  <span className="text-xl">🔨</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Handcrafted</p>
                  <p className="text-gray-400 text-xs">By skilled artisans</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-full flex items-center justify-center">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">4.9★ Rating</p>
                  <p className="text-gray-400 text-xs">10K+ reviews</p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="grid grid-cols-3 gap-8 pt-4"
            >
              {[
                { number: '500+', label: 'Premium Bags', icon: '👜' },
                { number: '10K+', label: 'Happy Customers', icon: '❤️' },
                { number: '4.9★', label: 'Average Rating', icon: '⭐' },
              ].map((stat, index) => (
                <motion.div 
                  key={`stat-${index}`} 
                  className="text-center group"
                  whileHover={{ y: -6, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-[#C9A96E] mb-1 group-hover:text-white transition-colors duration-300">
                    {stat.number}
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 flex items-center justify-center gap-1.5">
                    <span>{stat.icon}</span>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Right Content - Category Cards */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-5">
              {[
                { icon: '👜', label: 'Handbags', color: 'from-rose-500/20 to-pink-500/20', delay: 0 },
                { icon: '💼', label: 'Briefcases', color: 'from-blue-500/20 to-indigo-500/20', delay: 0.1 },
                { icon: '🎒', label: 'Backpacks', color: 'from-amber-500/20 to-orange-500/20', delay: 0.2 },
                { icon: '👛', label: 'Wallets', color: 'from-emerald-500/20 to-teal-500/20', delay: 0.3 },
              ].map((item, index) => (
                <motion.div
                  key={`category-${index}`}
                  initial={{ opacity: 0, scale: 0.85, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.5 + item.delay, duration: 0.7, type: "spring" }}
                  whileHover={{ 
                    scale: 1.08, 
                    y: -12,
                    rotate: [0, 2, -2, 0],
                    transition: { duration: 0.4 }
                  }}
                  className={`bg-gradient-to-br ${item.color} backdrop-blur-md rounded-2xl p-7 text-center border border-white/10 hover:border-[#C9A96E]/50 transition-all duration-500 cursor-pointer group relative overflow-hidden shadow-xl`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#C9A96E]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="text-6xl md:text-7xl mb-4"
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {item.icon}
                    </motion.div>
                    <p className="text-white font-semibold text-base tracking-wide group-hover:text-[#C9A96E] transition-colors duration-300">
                      {item.label}
                    </p>
                    <motion.div 
                      className="mt-3 w-10 h-0.5 bg-[#C9A96E]/50 mx-auto"
                      whileHover={{ width: 20 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="mt-2 text-xs text-white/30 group-hover:text-white/50 transition-colors duration-300">
                      Explore →
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}