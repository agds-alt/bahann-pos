'use client'

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AboutPage() {
  const features = [
    {
      category: '📊 Dashboard & Analytics',
      items: [
        'Real-time revenue tracking and sales statistics',
        'Sales trend visualization (7/14/30 days)',
        'Top selling products ranking',
        'Low stock alerts with severity indicators',
        'Recent transactions monitoring',
        'Outlet-specific analytics filtering',
      ],
    },
    {
      category: '📦 Warehouse Management',
      items: [
        'Daily stock recording with auto-calculation',
        'Product and outlet selection via dropdown',
        'Stock movement tracking (in/out/beginning/ending)',
        'Real-time inventory monitoring',
        'Low stock threshold alerts (configurable)',
        'Comprehensive stock reports',
      ],
    },
    {
      category: '🛒 Point of Sale (POS)',
      items: [
        'Multi-item shopping cart system',
        'Product search and selection',
        'Multiple payment methods (Cash/Card/Transfer/E-Wallet)',
        'Automatic change calculation',
        'Professional thermal receipt printing (80mm)',
        'Sales transaction history',
      ],
    },
    {
      category: '📈 Reports & Analytics',
      items: [
        'Revenue trend charts (Line, Bar, Area)',
        'Daily revenue breakdown',
        'Product performance analysis',
        'Revenue distribution pie charts',
        'Sales history with advanced filtering',
        'Export capabilities (CSV/PDF ready)',
      ],
    },
    {
      category: '🏷️ Master Data Management',
      items: [
        'Product CRUD with SKU and categories',
        'Multiple outlet management',
        'Product search and filtering',
        'Category organization',
      ],
    },
    {
      category: '👤 User Management',
      items: [
        'Secure JWT authentication (7-day sessions)',
        'Role-based access control (Admin/Manager/User)',
        'User registration with outlet assignment',
        'Profile management',
        'Session management with Redis (optional)',
      ],
    },
  ]

  const techStack = [
    {
      category: 'Frontend',
      icon: '🎨',
      technologies: [
        { name: 'Next.js 16', description: 'React framework with App Router & Turbopack' },
        { name: 'React 19', description: 'UI library with latest features' },
        { name: 'TypeScript 5', description: 'Type-safe JavaScript' },
        { name: 'Tailwind CSS 4', description: 'Utility-first CSS framework' },
        { name: 'Recharts', description: 'Composable charting library' },
      ],
    },
    {
      category: 'Backend',
      icon: '⚙️',
      technologies: [
        { name: 'tRPC 11', description: 'End-to-end typesafe APIs' },
        { name: 'Supabase', description: 'PostgreSQL database & auth' },
        { name: 'Zod', description: 'TypeScript-first schema validation' },
        { name: 'Superjson', description: 'JSON serialization with type support' },
      ],
    },
    {
      category: 'Authentication & Security',
      icon: '🔐',
      technologies: [
        { name: 'JWT', description: 'JSON Web Tokens for stateless auth' },
        { name: 'bcryptjs', description: 'Password hashing' },
        { name: 'Redis (ioredis)', description: 'Optional session storage' },
      ],
    },
    {
      category: 'State Management',
      icon: '📡',
      technologies: [
        { name: 'TanStack Query', description: 'Async state management' },
        { name: 'tRPC React Query', description: 'Type-safe data fetching' },
      ],
    },
    {
      category: 'Architecture',
      icon: '🏗️',
      technologies: [
        { name: 'Domain-Driven Design', description: 'Clean architecture pattern' },
        { name: 'Repository Pattern', description: 'Data access abstraction' },
        { name: 'Use Cases', description: 'Business logic separation' },
        { name: 'Dependency Injection', description: 'Loose coupling' },
      ],
    },
  ]

  const stack = [
    { label: 'Framework', value: 'Next.js 16 (App Router, Turbopack)', color: 'bg-black' },
    { label: 'Language', value: 'TypeScript 5.9', color: 'bg-blue-600' },
    { label: 'Database', value: 'PostgreSQL (Supabase)', color: 'bg-green-600' },
    { label: 'API', value: 'tRPC 11 + React Query', color: 'bg-blue-500' },
    { label: 'Styling', value: 'Tailwind CSS 4', color: 'bg-cyan-600' },
    { label: 'Auth', value: 'JWT + Redis (optional)', color: 'bg-red-600' },
    { label: 'Charts', value: 'Recharts 3', color: 'bg-purple-600' },
    { label: 'Deployment', value: 'Vercel', color: 'bg-black' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-3">Bahann POS</h1>
        <p className="text-xl text-gray-600 mb-2">Warehouse & Point of Sale Management System</p>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
            v1.0.0
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
            Production Ready
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
            Open Source
          </span>
        </div>
      </div>

      {/* Features Breakdown */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>✨ Features Overview</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600 mb-6">
            Bahann POS adalah sistem manajemen warehouse dan point of sale yang dibangun dengan teknologi modern.
            Dirancang untuk memudahkan pengelolaan inventory, penjualan, dan analytics untuk bisnis retail.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">{feature.category}</h3>
                <ul className="space-y-2">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Technology Stack */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>🛠️ Technology Stack</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {techStack.map((category, index) => (
              <div key={index}>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.technologies.map((tech, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
                      <p className="font-semibold text-gray-900 mb-1">{tech.name}</p>
                      <p className="text-xs text-gray-600">{tech.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Stack Summary */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>📚 Stack Summary</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stack.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">{item.label}</span>
                <span className={`px-3 py-1 ${item.color} text-white text-sm font-semibold rounded-full`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Developer Profile */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>👨‍💻 Developer Profile</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
              AG
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AGDS Corp</h3>
              <p className="text-gray-600 mb-4">Full-Stack Developer & System Architect</p>

              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl">📧</span>
                  <a href="mailto:agdscid@gmail.com" className="text-blue-600 hover:underline font-semibold">
                    agdscid@gmail.com
                  </a>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl">📱</span>
                  <a href="https://wa.me/6287874415491" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-semibold">
                    +62 878-7441-5491
                  </a>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl">💻</span>
                  <a href="https://github.com/agds-alt" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline font-semibold">
                    github.com/agds-alt
                  </a>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <a
                  href="https://wa.me/6287874415491"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary">
                    💬 Contact via WhatsApp
                  </Button>
                </a>
                <a
                  href="https://github.com/agds-alt"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary">
                    🌟 GitHub Profile
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* License */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>📜 License</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <p className="text-gray-700">
                This project is licensed under the <strong>MIT License</strong>.
              </p>
              <p className="text-sm text-gray-600">
                You are free to use, modify, and distribute this software for commercial or non-commercial purposes.
              </p>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-900 font-mono">
                  Copyright © {new Date().getFullYear()} AGDS Corp. All rights reserved.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Version Info */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>🚀 Version Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Version</span>
                <span className="font-semibold text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Release Date</span>
                <span className="font-semibold text-gray-900">January 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Production Ready
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Last Updated</span>
                <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Credits & Thanks */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>🙏 Credits & Acknowledgments</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <p className="text-gray-700">
              Special thanks to the amazing open-source community and the following projects that made this application possible:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'Next.js', 'React', 'TypeScript', 'Tailwind CSS',
                'tRPC', 'Supabase', 'TanStack Query', 'Recharts',
                'Vercel', 'Zod', 'ioredis', 'bcryptjs',
              ].map((tech, index) => (
                <div key={index} className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg text-center">
                  <p className="font-semibold text-gray-900 text-sm">{tech}</p>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Contributing */}
      <Card variant="default" padding="lg">
        <CardHeader>
          <CardTitle>🤝 Contributing</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <p className="text-gray-700">
              Interested in contributing to Bahann POS? We welcome contributions from the community!
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Ways to contribute:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Report bugs and issues</li>
                <li>Suggest new features</li>
                <li>Improve documentation</li>
                <li>Submit pull requests</li>
                <li>Share feedback and ideas</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-blue-900 font-semibold mb-2">Get Started:</p>
              <code className="block p-3 bg-white rounded text-xs font-mono">
                git clone https://github.com/agds-alt/bahann-pos.git<br />
                cd bahann-pos<br />
                pnpm install<br />
                pnpm dev
              </code>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Support */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>💬 Need Help or Custom Development?</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Need custom features, enterprise support, or have questions about implementation?
            </p>
            <p className="text-gray-600 text-sm">
              Contact us for consultation, custom development, or enterprise solutions.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://wa.me/6287874415491?text=Hi%20AGDS,%20I'm%20interested%20in%20Bahann%20POS" target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg">
                  💬 WhatsApp: +62 878-7441-5491
                </Button>
              </a>
              <a href="mailto:agdscid@gmail.com?subject=Bahann%20POS%20Inquiry">
                <Button variant="secondary" size="lg">
                  📧 Email: agdscid@gmail.com
                </Button>
              </a>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Footer Note */}
      <div className="text-center py-8 border-t-2 border-gray-200">
        <p className="text-gray-600 mb-2">
          Built with ❤️ by <strong>AGDS Corp</strong>
        </p>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Bahann POS. All rights reserved.
        </p>
      </div>
    </div>
  )
}
