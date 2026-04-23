'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { useTheme } from '@/lib/theme/ThemeContext'
import {
  ShoppingCart, Package, BarChart3, WifiOff, Users, Shield,
  Sun, Moon, MessageCircle, Check, Zap, DollarSign, Headphones,
  Store, UtensilsCrossed, Coffee, Shirt, Pill, ShoppingBag,
  ArrowRight,
} from 'lucide-react'

const WA_NUMBER = '6287874415491'
function buildWaLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
}

interface ChatMessage { from: 'bot' | 'user'; text: string }

const QUICK_ACTIONS = [
  { label: 'Tanya harga', waMessage: 'Halo, saya ingin tanya harga paket Laku POS.' },
  { label: 'Jadwalkan demo', waMessage: 'Halo, saya ingin jadwalkan demo Laku POS.' },
  { label: 'Jadi mitra', waMessage: 'Halo, saya tertarik jadi mitra Laku POS.' },
  { label: 'Pertanyaan lain', waMessage: 'Halo, saya punya pertanyaan tentang Laku POS.' },
]

const INDUSTRIES: { icon: ReactNode; label: string }[] = [
  { icon: <Store className="w-3.5 h-3.5" />, label: 'Warung' },
  { icon: <UtensilsCrossed className="w-3.5 h-3.5" />, label: 'Warung Makan' },
  { icon: <Coffee className="w-3.5 h-3.5" />, label: 'Kafe' },
  { icon: <Shirt className="w-3.5 h-3.5" />, label: 'Fashion' },
  { icon: <Pill className="w-3.5 h-3.5" />, label: 'Apotek' },
  { icon: <ShoppingBag className="w-3.5 h-3.5" />, label: 'Minimarket' },
]

const FEATURES: { icon: ReactNode; title: string; desc: string; points: string[] }[] = [
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    title: 'POS Cepat',
    desc: 'Transaksi dalam hitungan detik. Dukung cash, transfer, dan QRIS.',
    points: ['Multi-metode pembayaran', 'Barcode & kamera scanner', 'Cetak struk otomatis', 'Diskon & promo'],
  },
  {
    icon: <Package className="w-5 h-5" />,
    title: 'Stok Real-time',
    desc: 'Pantau stok dari mana saja. Alert otomatis saat barang hampir habis.',
    points: ['Notifikasi stok menipis', 'Riwayat pergerakan stok', 'Multi-outlet', 'Stok opname mudah'],
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Laporan Lengkap',
    desc: 'Dashboard penjualan real-time. Tahu produk terlaris setiap hari.',
    points: ['Grafik penjualan harian', 'Produk terlaris', 'Ekspor PDF & Excel', 'Laporan per kasir'],
  },
  {
    icon: <WifiOff className="w-5 h-5" />,
    title: 'Mode Offline',
    desc: 'Internet mati? Transaksi tetap jalan. Data sync otomatis saat online.',
    points: ['Transaksi tanpa internet', 'Auto-sync real-time', 'Data tidak hilang', 'Zero downtime'],
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Manajemen Kasir',
    desc: 'Tambah kasir, atur hak akses, dan pantau aktivitas mereka.',
    points: ['Multi-kasir per toko', 'Kontrol hak akses', 'Audit log lengkap', 'Shift & closing'],
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Aman & Terpercaya',
    desc: 'Data Anda terenkripsi dan terisolasi. Hanya Anda yang bisa akses.',
    points: ['Enkripsi end-to-end', 'Data terisolasi per toko', 'Backup otomatis', 'Row Level Security'],
  },
]

const FAQS = [
  { q: 'Apakah benar-benar gratis?', a: 'Ya! Paket Gratis tidak perlu kartu kredit dan bisa dipakai selamanya. Limit 100 transaksi/bulan — cukup untuk warung yang baru mulai.' },
  { q: 'Bisa dipakai di HP?', a: 'Tentu! Laku POS dirancang mobile-first. Buka di browser HP, langsung bisa transaksi tanpa install aplikasi.' },
  { q: 'Bagaimana kalau internet mati?', a: 'Ada mode offline. Transaksi tetap berjalan dan data akan sync otomatis begitu internet kembali.' },
  { q: 'Apakah data saya aman?', a: 'Data setiap warung terisolasi penuh. Hanya Anda yang bisa akses. Kami pakai enkripsi dan Row Level Security.' },
]

const TRUST_BADGES = [
  { icon: <Check className="w-3.5 h-3.5" />, label: 'Gratis Selamanya' },
  { icon: <WifiOff className="w-3.5 h-3.5" />, label: 'Mode Offline' },
  { icon: <Store className="w-3.5 h-3.5" />, label: 'Multi-outlet' },
  { icon: <Shield className="w-3.5 h-3.5" />, label: 'Open Source' },
]

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [pricingMode, setPricingMode] = useState<'subscription' | 'onetime'>('subscription')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [quickActionsVisible, setQuickActionsVisible] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  function openWa(msg: string) { window.open(buildWaLink(msg), '_blank', 'noopener,noreferrer') }

  function handleQuickAction(action: { label: string; waMessage: string }) {
    setQuickActionsVisible(false)
    setChatMessages(p => [...p, { from: 'user', text: action.label }])
    setTimeout(() => {
      setChatMessages(p => [...p, { from: 'bot', text: 'Baik! Kami sambungkan ke tim kami via WhatsApp sekarang.' }])
      setTimeout(() => openWa(action.waMessage), 800)
    }, 500)
  }

  function handleSend() {
    const text = chatMessage.trim()
    if (!text) return
    setQuickActionsVisible(false)
    setChatMessages(p => [...p, { from: 'user', text }])
    setChatMessage('')
    setTimeout(() => {
      setChatMessages(p => [...p, { from: 'bot', text: 'Terima kasih! Tim kami akan balas via WhatsApp sekarang.' }])
      setTimeout(() => openWa(`Halo, saya punya pertanyaan: ${text}`), 800)
    }, 500)
  }

  const feat = FEATURES[activeFeature]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Laku POS" className="w-7 h-7" />
            <span className="text-lg font-bold text-green-600">Laku POS</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#fitur" className="hover:text-green-600 transition-colors">Fitur</a>
            <a href="#harga" className="hover:text-green-600 transition-colors">Harga</a>
            <a href="#faq" className="hover:text-green-600 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <button onClick={toggleTheme} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle dark mode">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/login" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-green-600 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO (compact — includes industry pills + 3 steps + trust badges) ── */}
      <section className="pt-12 md:pt-16 pb-10 md:pb-14 px-4 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-gray-950">
        <div className="max-w-5xl mx-auto">
          {/* Headline + CTA */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
              Kasir Digital <span className="text-green-600">untuk Warung</span> Indonesia
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Kelola penjualan, stok, dan laporan dari HP. Tanpa ribet, tanpa mahal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <Link href="/register" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-base font-bold px-7 py-3.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Mulai Gratis Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
              <a href={buildWaLink('Halo, saya ingin jadwalkan demo Laku POS.')} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-7 py-3.5 rounded-xl hover:border-green-600 hover:text-green-600 transition-all">
                <MessageCircle className="w-4 h-4" /> Minta Demo
              </a>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tanpa kartu kredit · Setup &lt; 5 menit · Data 100% milik Anda
            </p>
          </div>

          {/* Industry pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {INDUSTRIES.map((ind, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                {ind.icon} {ind.label}
              </span>
            ))}
          </div>

          {/* App preview mockup */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 text-left">
                  app.lakupos.id/dashboard
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Omset', value: 'Rp 1,2jt', color: 'bg-green-500' },
                    { label: 'Transaksi', value: '24', color: 'bg-blue-500' },
                    { label: 'Terjual', value: '67', color: 'bg-purple-500' },
                    { label: 'Alert', value: '3', color: 'bg-orange-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow-sm">
                      <div className={`w-5 h-1 rounded-full ${s.color} mb-1.5`} />
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{s.label}</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Penjualan 7 Hari</span>
                    <span className="text-[10px] text-green-600 font-semibold">+18%</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-12">
                    {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                      <div key={i} className="flex-1">
                        <div className="w-full bg-green-500 rounded-t opacity-80" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 steps — horizontal compact */}
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-2xl mx-auto" id="cara-kerja">
            {[
              { n: '1', t: 'Daftar Gratis', d: 'Buat akun 1 menit' },
              { n: '2', t: 'Setup Toko', d: 'Tambah produk & kasir' },
              { n: '3', t: 'Mulai Jualan', d: 'Langsung pakai di HP' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-9 h-9 bg-green-600 text-white text-sm font-bold rounded-full flex items-center justify-center mx-auto mb-2">
                  {step.n}
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{step.t}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES (tabbed — one viewport) ── */}
      <section className="py-12 md:py-16 px-4 bg-gray-50 dark:bg-gray-900" id="fitur">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Semua yang Warung Butuhkan</h2>
            <p className="text-gray-600 dark:text-gray-400">Satu aplikasi, tidak perlu software lain.</p>
          </div>

          {/* Feature tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {FEATURES.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeFeature === i
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                }`}
              >
                {f.icon}
                <span className="hidden sm:inline">{f.title}</span>
              </button>
            ))}
          </div>

          {/* Active feature detail */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-xl flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feat.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{feat.desc}</p>
                <ul className="space-y-2">
                  {feat.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Trust badges sidebar */}
              <div className="md:w-56 flex flex-row md:flex-col gap-2 md:border-l md:border-gray-100 md:dark:border-gray-700 md:pl-6">
                {TRUST_BADGES.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 flex-1 md:flex-none">
                    <span className="text-green-600">{b.icon}</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING (compact) ── */}
      <section className="py-12 md:py-16 px-4 bg-white dark:bg-gray-950" id="harga">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Harga Transparan</h2>
            <p className="text-gray-600 dark:text-gray-400">Mulai gratis, upgrade kapan saja.</p>

            <div className="inline-flex mt-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1 gap-1">
              {(['subscription', 'onetime'] as const).map(mode => (
                <button key={mode} onClick={() => setPricingMode(mode)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${pricingMode === mode ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
                  {mode === 'subscription' ? 'Berlangganan' : 'Sekali Bayar'}
                </button>
              ))}
            </div>
          </div>

          {pricingMode === 'subscription' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <PricingCard name="Gratis" price="Rp 0" badge="SELAMANYA" badgeColor="bg-green-500"
                desc="Warung baru coba"
                features={['1 Outlet, 1 Kasir', 'POS Dasar', '100 transaksi/bulan', 'Laporan Harian']}
                cta="Daftar Gratis" href="/register" />
              <PricingCard name="Warung" price="Rp 99rb" period="/bln" badge="TERJANGKAU" badgeColor="bg-orange-500"
                desc="Warung aktif harian"
                features={['Transaksi Unlimited', 'POS + Inventori', 'Mode Offline', 'Support WA']}
                cta="Pilih Warung" waMsg="Halo, saya tertarik paket Warung Laku POS (Rp 99rb/bulan)." />
              <PricingCard name="Starter" price="Rp 299rb" period="/bln"
                desc="Toko berkembang"
                features={['3 Pengguna', 'Inventori Lanjutan', 'Ekspor PDF & Excel', 'Backup Cloud']}
                cta="Pilih Starter" waMsg="Halo, saya tertarik paket Starter Laku POS (Rp 299rb/bulan)." />
              <PricingCard name="Professional" price="Rp 1,2jt" period="/bln" badge="POPULER" badgeColor="bg-blue-500"
                desc="Multi-outlet"
                features={['3 Outlet, 10 User', 'Audit Log & API', 'Laporan Kustom', 'Support Prioritas']}
                cta="Pilih Pro" waMsg="Halo, saya tertarik paket Professional Laku POS (Rp 1,2jt/bulan)." popular />
            </div>
          )}

          {pricingMode === 'onetime' && (
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <PricingCard name="SME" price="Rp 75jt" badge="SEUMUR HIDUP" badgeColor="bg-gray-600"
                desc="UKM — bayar sekali"
                features={['1–3 Outlet', 'Setup & Pelatihan', 'Update 1 Tahun', 'Source Code (+30%)']}
                cta="Minta Penawaran" waMsg="Halo, saya tertarik paket One-Time SME Laku POS (Rp 75jt)." />
              <PricingCard name="Business" price="Rp 150jt" badge="TERLENGKAP" badgeColor="bg-green-600"
                desc="Termasuk source code"
                features={['5–10 Outlet', 'Source Code', 'Self-Host', 'Update 2 Tahun']}
                cta="Minta Penawaran" waMsg="Halo, saya tertarik paket One-Time Business Laku POS (Rp 150jt)." popular />
              <PricingCard name="Enterprise" price="Rp 300jt" badge="WHITE-LABEL" badgeColor="bg-purple-600"
                desc="Enterprise + white-label"
                features={['Unlimited Outlet', 'Fitur Custom', 'SLA Garansi', 'Account Manager']}
                cta="Hubungi Sales" waMsg="Halo, saya tertarik paket Enterprise Laku POS (Rp 300jt)." />
            </div>
          )}

          {/* Upsell strip */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-green-600">
                <DollarSign className="w-5 h-5" />
                <Zap className="w-5 h-5" />
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Pengguna awal? Harga dikunci selamanya</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Feedback langsung ke developer + support personal via WA.</p>
              </div>
            </div>
            <a href={buildWaLink('Halo, saya ingin tanya paket Laku POS.')} target="_blank" rel="noopener noreferrer"
              className="shrink-0 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" /> Hubungi Sales
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ (compact — 4 items) ── */}
      <section className="py-12 md:py-16 px-4 bg-gray-50 dark:bg-gray-900" id="faq">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-6">Pertanyaan Umum</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-green-300 dark:hover:border-green-700 transition-all overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3.5">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 pr-4">{faq.q}</h3>
                  <span className="text-green-600 font-bold text-lg shrink-0">{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA (compact) ── */}
      <section className="py-12 md:py-16 px-4 bg-green-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Siap Bikin Warung Makin Laku?</h2>
          <p className="text-base mb-6 opacity-90">Daftar gratis sekarang. Tanpa kartu kredit, tanpa install.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-white text-green-600 hover:bg-green-50 font-bold px-7 py-3.5 rounded-xl transition-all hover:shadow-lg flex items-center justify-center gap-2">
              Mulai Gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={buildWaLink('Halo, saya ingin konsultasi Laku POS.')} target="_blank" rel="noopener noreferrer"
              className="border-2 border-white hover:bg-white/10 font-bold px-7 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER (compact) ── */}
      <footer className="bg-gray-950 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo.svg" alt="Laku POS" className="w-6 h-6" />
                <span className="text-lg font-bold text-green-400">Laku POS</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">Kasir digital modern untuk warung dan toko kecil Indonesia.</p>
            </div>
            <div className="flex gap-10">
              <div>
                <h4 className="font-semibold text-green-400 text-sm mb-2">Produk</h4>
                <ul className="space-y-1.5 text-gray-400 text-sm">
                  <li><a href="#fitur" className="hover:text-white transition-colors">Fitur</a></li>
                  <li><a href="#harga" className="hover:text-white transition-colors">Harga</a></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">Daftar</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 text-sm mb-2">Bantuan</h4>
                <ul className="space-y-1.5 text-gray-400 text-sm">
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><a href={buildWaLink('Halo, butuh bantuan Laku POS.')} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-gray-500 text-xs">
            <p>&copy; 2026 Laku POS. Hak cipta dilindungi.</p>
            <p>Dibuat untuk warung Indonesia</p>
          </div>
        </div>
      </footer>

      {/* ── CHAT WIDGET ── */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen && (
          <div className="mb-4 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="bg-green-600 text-white p-3.5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">L</div>
                <div>
                  <h3 className="font-bold text-sm">Laku POS Support</h3>
                  <p className="text-[11px] opacity-80">Biasanya balas dalam menit</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 rounded-full p-1.5 transition-colors text-lg">✕</button>
            </div>
            <div className="h-72 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">L</div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
                  <p className="text-sm text-gray-800 dark:text-gray-200">Halo! Ada yang bisa kami bantu?</p>
                </div>
              </div>
              {quickActionsVisible && (
                <div className="space-y-2">
                  {QUICK_ACTIONS.map(a => (
                    <button key={a.label} onClick={() => handleQuickAction(a)}
                      className="w-full text-left bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 px-3 py-2.5 rounded-xl shadow-sm transition-colors text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
              {chatMessages.map((msg, i) => (
                msg.from === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="bg-green-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm max-w-[80%] text-sm">{msg.text}</div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">L</div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%] text-sm text-gray-800 dark:text-gray-200">{msg.text}</div>
                  </div>
                )
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              <div className="flex gap-2">
                <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ketik pesan..." className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-full text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500" />
                <button onClick={handleSend} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors">Kirim</button>
              </div>
            </div>
          </div>
        )}
        <button onClick={() => setChatOpen(!chatOpen)}
          className={`${chatOpen ? 'hidden' : 'flex'} relative items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold`}>
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Chat</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </button>
      </div>
    </div>
  )
}

interface PricingCardProps {
  name: string; price: string; period?: string
  badge?: string; badgeColor?: string
  desc: string; features: string[]
  cta: string; popular?: boolean
  href?: string; waMsg?: string
}

function PricingCard({ name, price, period, badge, badgeColor, desc, features, cta, popular, href, waMsg }: PricingCardProps) {
  const btnClass = `block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
    popular
      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
      : 'bg-gray-50 dark:bg-gray-700 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-500 hover:bg-green-50 dark:hover:bg-gray-600'
  }`
  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 md:p-5 border transition-all hover:-translate-y-0.5 hover:shadow-lg ${
      popular ? 'border-green-500 shadow-md' : 'border-gray-100 dark:border-gray-700'
    }`}>
      {popular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
          POPULER
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{name}</h3>
        {badge && !popular && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white ${badgeColor}`}>{badge}</span>}
      </div>
      <div className="mb-1 flex items-baseline gap-0.5">
        <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{price}</span>
        {period && <span className="text-gray-500 dark:text-gray-400 text-xs">{period}</span>}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{desc}</p>
      <ul className="space-y-1.5 mb-4">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
            <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />{f}
          </li>
        ))}
      </ul>
      {href ? (
        <Link href={href} className={btnClass}>{cta}</Link>
      ) : (
        <a href={buildWaLink(waMsg!)} target="_blank" rel="noopener noreferrer" className={btnClass}>{cta}</a>
      )}
    </div>
  )
}
