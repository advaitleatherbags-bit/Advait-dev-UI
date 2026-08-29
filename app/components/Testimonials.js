'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const testimonials = [
  {
    id: 'test-1',
    name: 'Priya Sharma',
    role: 'Fashion Enthusiast',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    content: 'ADVIT has completely transformed my wardrobe. The quality is exceptional and the designs are timeless.'
  },
  {
    id: 'test-2',
    name: 'Ananya Patel',
    role: 'Style Blogger',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    content: 'I absolutely love the collection at ADVIT. Every piece is carefully curated and beautifully crafted.'
  },
  {
    id: 'test-3',
    name: 'Meera Reddy',
    role: 'Corporate Professional',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100',
    content: 'The perfect blend of style and comfort. I always get compliments when I wear ADVIT.'
  }
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Join thousands of satisfied customers who trust ADVIT</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={50}
                  height={50}
                  className="rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-[#391F10]">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">&quot;{testimonial.content}&quot;</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
