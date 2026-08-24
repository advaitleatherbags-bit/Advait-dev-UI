'use client'

import { motion } from 'framer-motion'
import { TruckIcon, ShieldCheckIcon, ArrowPathIcon, CreditCardIcon } from '@heroicons/react/24/outline'

const features = [
  {
    id: 'feature-1',
    icon: TruckIcon,
    title: 'Free Shipping',
    description: 'Free delivery on orders over $100'
  },
  {
    id: 'feature-2',
    icon: ShieldCheckIcon,
    title: 'Secure Payment',
    description: '100% secure payment methods'
  },
  {
    id: 'feature-3',
    icon: ArrowPathIcon,
    title: 'Easy Returns',
    description: '30-day return policy'
  },
  {
    id: 'feature-4',
    icon: CreditCardIcon,
    title: 'Best Prices',
    description: 'Guaranteed best prices'
  }
]

export default function Features() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#391F10] to-[#102A39]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group cursor-pointer"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="h-8 w-8 text-[#C9A96E]" />
                </div>
              </div>
              <h3 className="font-semibold text-white text-base md:text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm md:text-base">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}