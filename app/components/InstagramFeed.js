'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const instagramPosts = [
  { id: 'insta-1', url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400' },
  { id: 'insta-2', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' },
  { id: 'insta-3', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42f5?w=400' },
  { id: 'insta-4', url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400' },
  { id: 'insta-5', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' },
  { id: 'insta-6', url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400' }
]

export default function InstagramFeed() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#391F10] mb-2 tracking-tight">
            Follow Us on Instagram
          </h2>
          <p className="text-gray-500 text-sm md:text-base">@advit_fashion</p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {instagramPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <Link href="#">
                <Image
                  src={post.url}
                  alt={`Instagram post ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <span className="text-white text-xs font-medium bg-black/40 px-3 py-1 rounded-full">View</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}