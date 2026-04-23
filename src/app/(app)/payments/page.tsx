'use client'

import { type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Banknote, Smartphone, Building2, CreditCard, CheckCircle } from 'lucide-react'

const PAYMENT_METHODS: { icon: ReactNode; label: string; sub: string }[] = [
  { icon: <Banknote className="w-7 h-7" />,    label: 'Tunai',         sub: 'Cash' },
  { icon: <Smartphone className="w-7 h-7" />,  label: 'QRIS',          sub: 'Scan QR' },
  { icon: <Building2 className="w-7 h-7" />,   label: 'Transfer Bank', sub: 'Manual' },
  { icon: <CreditCard className="w-7 h-7" />,  label: 'Debit Card',    sub: 'EDC' },
  { icon: <CreditCard className="w-7 h-7" />,  label: 'Credit Card',   sub: 'EDC' },
]

export default function PaymentsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader title="Manajemen Pembayaran" subtitle="Kelola dan konfirmasi pembayaran yang masuk" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
        <StatCard icon={<Smartphone />}  label="QRIS Pending"         value="0" color="yellow" sub="Menunggu konfirmasi" />
        <StatCard icon={<Building2 />}   label="Transfer Pending"     value="0" color="blue"   sub="Menunggu konfirmasi" />
        <StatCard icon={<CheckCircle />}  label="Dikonfirmasi Hari Ini" value="0" color="green"  sub="Total pembayaran" />
      </div>

      <SectionCard title="Pembayaran Pending">
        <EmptyState
          icon={<CreditCard />}
          title="Integrasi segera hadir"
          description="Sistem pembayaran sudah siap. Integrasi penuh dengan POS akan segera tersedia."
          action={
            <Button variant="primary" onClick={() => window.location.href = '/pos/sales'}>
              Ke POS Sales
            </Button>
          }
        />
      </SectionCard>

      <SectionCard title="Metode Pembayaran Tersedia">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          {PAYMENT_METHODS.map(m => (
            <div key={m.label} className="flex flex-col items-center gap-1.5 p-3 md:p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
              <div className="text-gray-600 dark:text-gray-300">{m.icon}</div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 text-center">{m.label}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{m.sub}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
