// app/layout.js
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvider } from './context/AuthContext'
import ApiStatusChecker from './components/ApiStatusChecker'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata = {
  title: 'ADVIT - Premium Leather Bags | Elevate Your Style',
  description: 'Discover premium handcrafted leather bags at ADVIT. Shop luxury handbags, briefcases, backpacks, and wallets.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans antialiased bg-[#faf6f3]">
        <ApiStatusChecker>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen pt-16">{children}</main>
            <Footer />
          </AuthProvider>
        </ApiStatusChecker>
      </body>
    </html>
  )
}