'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [pricingMode, setPricingMode] = useState<'subscription' | 'onetime'>('subscription')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🏷️</span>
              <span className="text-2xl font-bold text-blue-600">Bahann POS</span>
            </div>
            <nav className="hidden md:flex gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pricing</a>
              <a href="#comparison" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Comparison</a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">FAQ</a>
            </nav>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
            <span className="font-semibold">🚀 Enterprise POS dengan Harga SME</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Pricing & Plans
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="#pricing"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Lihat Pricing
            </a>
            <Link
              href="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Fitur Lengkap untuk Bisnis Modern
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola bisnis retail dalam satu platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 mt-0.5">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Lihat Bahann POS Beraksi
            </h2>
            <p className="text-xl text-gray-300">
              Demo lengkap sistem POS kami dalam 3 menit
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
              {/* Placeholder for video - replace with actual video embed */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
                <div className="text-center">
                  <button className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110 mb-4 mx-auto">
                    <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                  </button>
                  <p className="text-white text-lg font-semibold">Watch Demo Video</p>
                  <p className="text-white/70 text-sm mt-2">3:24 minutes</p>
                </div>
              </div>
              {/* Uncomment this when you have actual video
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                title="Bahann POS Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              */}
            </div>

            {/* Video Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">500+</div>
                <div className="text-gray-400 text-sm mt-1">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">50K+</div>
                <div className="text-gray-400 text-sm mt-1">Transactions/Day</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">99.9%</div>
                <div className="text-gray-400 text-sm mt-1">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Toggle */}
      <section className="py-12 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setPricingMode('subscription')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                pricingMode === 'subscription'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600'
              }`}
            >
              Monthly Subscription
            </button>
            <button
              onClick={() => setPricingMode('onetime')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                pricingMode === 'onetime'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600'
              }`}
            >
              One-Time Purchase
            </button>
          </div>
          <p className="mt-4 text-gray-600">💡 Hemat 20% dengan paket tahunan!</p>
        </div>
      </section>

      {/* Pricing Cards - Subscription */}
      {pricingMode === 'subscription' && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Starter */}
              <PricingCard
                name="Starter"
                price="399rb"
                period="/bulan"
                discount="20% OFF"
                description="Perfect untuk bisnis yang baru mulai"
                features={[
                  '1 Outlet',
                  '3 Users',
                  'Basic POS',
                  'Basic Inventory',
                  'Email Support',
                  'Standard Reports',
                  'Cloud Backup',
                ]}
                buttonText="Pilih Starter"
                buttonVariant="secondary"
              />

              {/* Professional */}
              <PricingCard
                name="Professional"
                price="1,2jt"
                period="/bulan"
                discount="20% OFF"
                description="Recommended untuk bisnis berkembang"
                features={[
                  '3 Outlets',
                  '10 Users',
                  'Full POS Features',
                  'Advanced Inventory',
                  'Priority Support',
                  'Advanced Reports + Export',
                  'Audit Logs',
                  'API Access',
                  'Offline Mode',
                ]}
                buttonText="Pilih Professional"
                buttonVariant="primary"
                popular
              />

              {/* Business */}
              <PricingCard
                name="Business"
                price="2,8jt"
                period="/bulan"
                discount="20% OFF"
                description="Untuk bisnis dengan multiple outlets"
                features={[
                  '10 Outlets',
                  '25 Users',
                  'All Professional Features',
                  'Dedicated Support Channel',
                  'Custom Reports',
                  'Multiple Payment Gateways',
                  'Training Sessions',
                  'QRIS Integration',
                ]}
                buttonText="Pilih Business"
                buttonVariant="secondary"
              />

              {/* Enterprise */}
              <PricingCard
                name="Enterprise"
                price="6,5jt"
                period="/bulan"
                discount="19% OFF"
                description="Solusi lengkap untuk enterprise"
                features={[
                  'Unlimited Outlets',
                  'Unlimited Users',
                  'All Business Features',
                  '24/7 Support + SLA',
                  'Dedicated Account Manager',
                  'Custom Integrations',
                  'White-label Option',
                  'On-premise Deployment',
                ]}
                buttonText="Contact Sales"
                buttonVariant="primary"
              />
            </div>
          </div>
        </section>
      )}

      {/* Pricing Cards - One-Time */}
      {pricingMode === 'onetime' && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* SME Package */}
              <PricingCard
                name="SME Package"
                price="75jt"
                discount="12% OFF"
                description="One-time license untuk SME"
                features={[
                  '1-3 Outlets',
                  '5-10 Users',
                  'Basic Support (Email)',
                  'Setup & Training',
                  'Lifetime License',
                  'Free Updates (1 year)',
                  'Source Code (+30%)',
                ]}
                buttonText="Get Quote"
                buttonVariant="secondary"
              />

              {/* Business Package */}
              <PricingCard
                name="Business Package"
                price="150jt"
                discount="14% OFF"
                description="Complete solution untuk bisnis"
                features={[
                  '5-10 Outlets',
                  'Unlimited Users',
                  'Priority Support',
                  'Dedicated Onboarding',
                  'Source Code Included',
                  '1x Minor Customization',
                  'Free Updates (2 years)',
                  'Self-Host Option',
                ]}
                buttonText="Get Quote"
                buttonVariant="primary"
                popular
              />

              {/* Enterprise Package */}
              <PricingCard
                name="Enterprise Package"
                price="300jt"
                discount="14% OFF"
                description="Full enterprise solution"
                features={[
                  'Unlimited Outlets',
                  'Unlimited Users',
                  '24/7 Priority Support',
                  'Dedicated Account Manager',
                  'Full Source Code + Docs',
                  '3 Major Feature Development',
                  'White-label Option',
                  'SLA Guarantee',
                  'Lifetime Updates',
                ]}
                buttonText="Contact Sales"
                buttonVariant="primary"
              />
            </div>
          </div>
        </section>
      )}

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50" id="comparison">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Compare with Competitors
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                    <th className="py-4 px-6 text-left font-semibold">Feature</th>
                    <th className="py-4 px-6 text-center font-semibold">Bahann POS</th>
                    <th className="py-4 px-6 text-center font-semibold">Moka POS</th>
                    <th className="py-4 px-6 text-center font-semibold">iReap POS</th>
                    <th className="py-4 px-6 text-center font-semibold">Pawoon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-semibold">Monthly Price</td>
                    <td className="py-4 px-6 text-center">Rp 1,2jt</td>
                    <td className="py-4 px-6 text-center">Rp 1,2jt</td>
                    <td className="py-4 px-6 text-center">Rp 800rb</td>
                    <td className="py-4 px-6 text-center">Rp 999rb</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6">Multi-outlet</td>
                    <td className="py-4 px-6 text-center text-green-600 text-2xl">✓</td>
                    <td className="py-4 px-6 text-center text-green-600 text-2xl">✓</td>
                    <td className="py-4 px-6 text-center text-green-600 text-2xl">✓</td>
                    <td className="py-4 px-6 text-center text-green-600 text-2xl">✓</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6">Offline Mode</td>
                    <td className="py-4 px-6 text-center text-green-600 text-2xl">✓</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                    <td className="py-4 px-6 text-center text-gray-600">Limited</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6">Source Code</td>
                    <td className="py-4 px-6 text-center text-green-600 text-2xl">✓</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6">Self-hosted</td>
                    <td className="py-4 px-6 text-center text-green-600 text-2xl">✓</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6">Advanced Audit Logs</td>
                    <td className="py-4 px-6 text-center text-green-600 text-2xl">✓</td>
                    <td className="py-4 px-6 text-center text-gray-600">Basic</td>
                    <td className="py-4 px-6 text-center text-gray-600">Basic</td>
                    <td className="py-4 px-6 text-center text-gray-600">Basic</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6">One-time Purchase</td>
                    <td className="py-4 px-6 text-center text-green-600 text-2xl">✓</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                    <td className="py-4 px-6 text-center text-red-600 text-2xl">✗</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dipercaya oleh Ratusan Bisnis
            </h2>
            <p className="text-xl text-gray-600">
              Lihat apa kata mereka tentang Bahann POS
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 border-t pt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </div>

                {/* Business Stats */}
                {testimonial.stats && (
                  <div className="mt-4 pt-4 border-t flex justify-between text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{testimonial.stats.outlets}</div>
                      <div className="text-xs text-gray-600">Outlets</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{testimonial.stats.transactions}</div>
                      <div className="text-xs text-gray-600">Trans/Day</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6 font-semibold">Trusted by leading brands:</p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              <div className="text-2xl font-bold text-gray-700">🏪 Minimart Chain</div>
              <div className="text-2xl font-bold text-gray-700">👗 Fashion Boutique</div>
              <div className="text-2xl font-bold text-gray-700">🍔 F&B Franchise</div>
              <div className="text-2xl font-bold text-gray-700">💊 Pharmacy Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <div className="p-6 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <span className="text-2xl text-gray-600">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </div>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Siap Untuk Upgrade Bisnis Anda?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Dapatkan demo gratis dan konsultasi dengan tim kami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Now
            </Link>
            <a
              href="mailto:sales@agdscorp.com"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏷️</span>
                <span className="text-xl font-bold">Bahann POS</span>
              </div>
              <p className="text-gray-400">
                Enterprise POS dengan Harga SME. Built with modern technology for Indonesian businesses.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-blue-400">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#comparison" className="hover:text-white transition-colors">Features</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-blue-400">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-blue-400">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Bahann POS by AGDS Corp. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Live Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Window */}
        {chatOpen && (
          <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">Bahann POS Support</h3>
                <p className="text-xs opacity-90">We typically reply within minutes</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {/* Welcome Message */}
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  B
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[80%]">
                  <p className="text-sm text-gray-800">
                    👋 Halo! Selamat datang di Bahann POS. Ada yang bisa kami bantu?
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 mt-4">
                <p className="text-xs text-gray-600 font-semibold mb-2">Quick Actions:</p>
                <button className="w-full text-left bg-white hover:bg-blue-50 p-3 rounded-xl shadow-sm transition-colors text-sm">
                  💰 Tanya tentang pricing
                </button>
                <button className="w-full text-left bg-white hover:bg-blue-50 p-3 rounded-xl shadow-sm transition-colors text-sm">
                  📅 Schedule demo
                </button>
                <button className="w-full text-left bg-white hover:bg-blue-50 p-3 rounded-xl shadow-sm transition-colors text-sm">
                  📞 Request callback
                </button>
                <button className="w-full text-left bg-white hover:bg-blue-50 p-3 rounded-xl shadow-sm transition-colors text-sm">
                  📧 Email support
                </button>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-600 text-sm"
                />
                <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-semibold text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`${
            chatOpen ? 'hidden' : 'flex'
          } items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105`}
        >
          <span className="text-2xl">💬</span>
          <span className="font-semibold">Chat with Us</span>
          {/* Notification Dot */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    </div>
  )
}

interface PricingCardProps {
  name: string
  price: string
  period?: string
  discount: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant: 'primary' | 'secondary'
  popular?: boolean
}

function PricingCard({
  name,
  price,
  period,
  discount,
  description,
  features,
  buttonText,
  buttonVariant,
  popular = false,
}: PricingCardProps) {
  return (
    <div
      className={`relative bg-white rounded-2xl p-8 shadow-xl transition-all hover:-translate-y-2 ${
        popular ? 'border-2 border-blue-600 scale-105' : 'border border-gray-200'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-1 rounded-full text-sm font-bold">
          🔥 POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-blue-600">Rp {price}</span>
        {period && <span className="text-gray-600">{period}</span>}
        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          {discount}
        </span>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
          buttonVariant === 'primary'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
        }`}
      >
        {buttonText}
      </Link>
    </div>
  )
}

const faqs = [
  {
    question: 'Apa perbedaan antara one-time purchase dan subscription?',
    answer: 'One-time purchase: Anda membeli lisensi sekali dan dapat menggunakan software selamanya. Cocok untuk bisnis yang ingin full ownership. Subscription: Anda membayar bulanan dan mendapat akses + updates otomatis + cloud hosting + support.',
  },
  {
    question: 'Apakah ada biaya setup atau implementasi?',
    answer: 'Untuk paket Professional ke atas, setup dan training sudah included. Untuk Starter plan, ada biaya setup Rp 5 juta (optional) yang mencakup instalasi, konfigurasi awal, dan training 1 hari.',
  },
  {
    question: 'Apakah bisa trial dulu sebelum beli?',
    answer: 'Ya! Kami menyediakan free trial 14 hari untuk semua paket subscription. Untuk one-time purchase, kami bisa arrange demo lengkap dan POC (Proof of Concept).',
  },
  {
    question: 'Apakah data saya aman?',
    answer: 'Absolutely! Kami menggunakan enkripsi tingkat enterprise, database PostgreSQL yang reliable, dan backup otomatis harian. Untuk one-time purchase, Anda bahkan bisa self-host di server sendiri.',
  },
  {
    question: 'Bagaimana dengan support dan maintenance?',
    answer: 'Subscription: Support sudah included sesuai tier paket. One-time purchase: Free support 1 tahun, setelah itu optional maintenance contract Rp 500rb - 1,5jt/bulan.',
  },
  {
    question: 'Apakah bisa custom sesuai kebutuhan bisnis saya?',
    answer: 'Tentu! Kami menyediakan custom development mulai dari Rp 15 juta per feature. Untuk Enterprise package, Anda sudah dapat 3 major custom features included.',
  },
]

// Features data
const features = [
  {
    icon: '🏪',
    title: 'Point of Sale',
    description: 'POS yang cepat dan mudah digunakan untuk transaksi harian',
    points: [
      'Multi-payment methods (Cash, Card, QRIS)',
      'Barcode scanner & camera support',
      'Receipt printing & email',
      'Discount & promotion codes',
    ],
  },
  {
    icon: '📦',
    title: 'Inventory Management',
    description: 'Kelola stok dengan mudah di multiple outlets',
    points: [
      'Real-time stock tracking',
      'Stock alerts & notifications',
      'Transfer antar outlet',
      'Stock opname & adjustment',
    ],
  },
  {
    icon: '📊',
    title: 'Reports & Analytics',
    description: 'Dashboard real-time dan laporan komprehensif',
    points: [
      'Sales trend analysis',
      'Top products ranking',
      'Revenue breakdown',
      'Export to PDF/Excel',
    ],
  },
  {
    icon: '👥',
    title: 'User Management',
    description: 'Control akses dengan role & permission system',
    points: [
      'Multi-user support',
      'Role-based access (Admin, Manager, Cashier)',
      'Activity audit logs',
      'Permission customization',
    ],
  },
  {
    icon: '💰',
    title: 'Cash Management',
    description: 'Atur cash session dan closing dengan mudah',
    points: [
      'Opening/closing balance',
      'Cash reconciliation',
      'Payment method breakdown',
      'Shift handover reports',
    ],
  },
  {
    icon: '🔄',
    title: 'Offline Mode',
    description: 'Tetap bisa transaksi walaupun internet mati',
    points: [
      'Offline transaction queue',
      'Auto-sync when online',
      'Local data cache',
      'Zero downtime operations',
    ],
  },
]

// Testimonials data
const testimonials = [
  {
    name: 'Budi Santoso',
    role: 'Owner',
    company: 'Toko Sejahtera (Minimart Chain)',
    text: 'Sejak pakai Bahann POS, operasional 5 outlet saya jadi jauh lebih efisien. Audit trail-nya sangat membantu untuk tracking semua aktivitas. Recommended!',
    stats: {
      outlets: '5',
      transactions: '500+',
    },
  },
  {
    name: 'Siti Rahma',
    role: 'Manager',
    company: 'Boutique Elegan',
    text: 'UI-nya user-friendly banget, karyawan baru bisa langsung pakai tanpa training lama. Feature offline mode-nya lifesaver pas internet down!',
    stats: {
      outlets: '3',
      transactions: '200+',
    },
  },
  {
    name: 'Ahmad Wijaya',
    role: 'CEO',
    company: 'Warung Kopi Network',
    text: 'Harga kompetitif dengan fitur enterprise level. Custom development team-nya responsive banget. Worth every rupiah!',
    stats: {
      outlets: '12',
      transactions: '1.5K+',
    },
  },
  {
    name: 'Linda Kusuma',
    role: 'Operations Manager',
    company: 'Pharmacy Plus',
    text: 'Inventory management-nya precise, stock alert otomatis, dan reporting lengkap. Sangat membantu untuk bisnis farmasi yang butuh tracking ketat.',
    stats: {
      outlets: '8',
      transactions: '800+',
    },
  },
  {
    name: 'Rudi Hartono',
    role: 'Franchise Owner',
    company: 'Ayam Geprek Franchise',
    text: 'Multi-outlet management-nya excellent. Bisa monitor semua cabang real-time dari dashboard. Cash reconciliation juga jadi gampang banget.',
    stats: {
      outlets: '15',
      transactions: '2K+',
    },
  },
  {
    name: 'Diana Putri',
    role: 'Store Manager',
    company: 'Fashion District',
    text: 'Support team-nya super helpful, response cepat. Feature promotion code-nya powerful untuk campaign marketing kami. Highly recommended!',
    stats: {
      outlets: '4',
      transactions: '350+',
    },
  },
]
