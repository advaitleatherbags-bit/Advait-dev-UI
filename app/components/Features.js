'use client'

import { motion } from 'framer-motion'
import { TruckIcon, ShieldCheckIcon, ArrowPathIcon, CreditCardIcon, GiftIcon, ClockIcon } from '@heroicons/react/24/outline'

const features = [
  {
    id: 'feature-1',
    icon: TruckIcon,
    title: 'Free & Fast Shipping',
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
    icon: GiftIcon,
    title: 'Gift Ready',
    description: 'Complimentary gift wrapping'
  },
  {
    id: 'feature-5',
    icon: ClockIcon,
    title: '24/7 Support',
    description: 'Customer service always available'
  },
  {
    id: 'feature-6',
    icon: CreditCardIcon,
    title: 'Best Prices',
    description: 'Guaranteed best prices'
  }
]

export default function Features() {
  return (
    <section className="py-16 md:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#391F10] mb-2">
            Why Choose ADVIT?
          </h2>
          <p className="text-gray-500 text-base max-w-2xl mx-auto">
            We&apos;re committed to providing the best shopping experience
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="text-center group cursor-pointer bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#C9A96E] transition-all duration-500 hover:shadow-xl"
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#C9A96E]/10 to-[#C9A96E]/5 rounded-2xl flex items-center justify-center group-hover:bg-[#C9A96E] group-hover:scale-110 transition-all duration-500">
                  <feature.icon className="h-7 w-7 text-[#391F10] group-hover:text-white transition-all duration-300" />
                </div>
              </div>
              <h3 className="font-semibold text-[#391F10] text-sm md:text-base mb-1">{feature.title}</h3>
              <p className="text-gray-500 text-xs md:text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
