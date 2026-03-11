'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const statusConfig = {
  new:           { label: 'New',           dot: '#3b82f6', bg: '#eff6ff', color: '#1d4ed8' },
  proof_pending: { label: 'Proof Pending', dot: '#f59e0b', bg: '#fffbeb', color: '#b45309' },
  proof_ready:   { label: 'Proof Ready',   dot: '#8b5cf6', bg: '#f5f3ff', color: '#6d28d9' },
  approved:      { label: 'Approved',      dot: '#10b981', bg: '#ecfdf5', color: '#065f46' },
  in_production: { label: 'In Production', dot: '#f97316', bg: '#fff7ed', color: '#c2410c' },
  shipped:       { label: 'Shipped',       dot: '#06b6d4', bg: '#ecfeff', color: '#0e7490' },
  complete:      { label: 'Complete',      dot: '#6b7280', bg: '#f9fafb', color: '#374151' },
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.new
  return (
    <span
      style={{ background: cfg.bg, color: cfg.color }}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
    >
      <span style={{ background: cfg.dot }} className="w-1.5 h-1.5 rounded-full inline-block" />
      {cfg.label}
    </span>
  )
}

function InfoTile({ label, value }) {
  return (
    <div className="bg-[#f8f9fb] rounded-xl p-4">
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#111] capitalize">{value || '—'}</p>
    </div>
  )
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    async function loadOrder() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) { router.push('/dashboard'); return }

      setOrder(data)
      setLoading(false)
    }
    loadOrder()
  }, [])

  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'); *{font-family:'Poppins',sans-serif;}`}</style>
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading order...</p>
        </div>
      </div>
    </>
  )

  const shortId = order.id?.slice(0, 8).toUpperCase()

  const timeline = [
    { key: 'new',           label: 'Order confirmed' },
    { key: 'proof_pending', label: 'Proof pending' },
    { key: 'proof_ready',   label: 'Art preparation complete' },
    { key: 'approved',      label: 'Final approval' },
    { key: 'in_production', label: 'In production' },
    { key: 'shipped',       label: 'Shipped' },
    { key: 'complete',      label: 'Complete' },
  ]
  const currentIdx = timeline.findIndex((t) => t.key === order.status)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#f8f9fb]">

        {/* Navbar */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-[#111] transition-colors text-sm"
              >
                ← My Orders
              </button>
              <span className="text-gray-200">/</span>
              <span className="text-sm font-semibold text-[#111]">ORDER#{shortId}</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-xs font-medium text-gray-500 border border-gray-200 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                + Add Additional Units
              </button>
              <button className="text-xs font-medium text-gray-500 border border-gray-200 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                ? Need Help
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Summary chips */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="bg-white border border-gray-100 text-xs font-medium text-gray-600 px-3 py-1.5 rounded-full">
              {order.products_selected?.length || 0} Product{order.products_selected?.length !== 1 ? 's' : ''} in Order
            </span>
            <span className="bg-white border border-gray-100 text-xs font-medium text-gray-600 px-3 py-1.5 rounded-full">
              📅 Due {order.due_date
                ? new Date(order.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A'}
            </span>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: Main content */}
            <div className="lg:col-span-2 space-y-5">

              {/* Order Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h1 className="text-xl font-semibold text-[#111]">{order.event_name}</h1>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoTile
                    label="Due Date"
                    value={order.due_date
                      ? new Date(order.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : null}
                  />
                  <InfoTile label="Order Type" value={order.order_type?.replace(/_/g, ' ')} />
                  <InfoTile label="Print Type" value={order.print_type?.replace(/_/g, ' ')} />
                  <InfoTile label="Order ID" value={`#${shortId}`} />
                </div>
              </div>

              {/* Design Details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-blue-500">🎨</span>
                  <h2 className="text-sm font-semibold text-[#111]">Design Details</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">Front Design</p>
                    <div className="bg-[#f8f9fb] rounded-xl p-4">
                      {order.front_design_description ? (
                        <p className="text-sm text-gray-700 leading-relaxed">{order.front_design_description}</p>
                      ) : (
                        <p className="text-sm text-gray-300 italic">No description provided</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-50" />

                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">Back Design</p>
                    <div className="bg-[#f8f9fb] rounded-xl p-4">
                      {order.back_design_description ? (
                        <p className="text-sm text-gray-700 leading-relaxed">{order.back_design_description}</p>
                      ) : (
                        <p className="text-sm text-gray-300 italic">No description provided</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Design files */}
                {(order.front_design_file || order.back_design_file) && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-xs font-medium text-gray-400 mb-3">Design Files</p>
                    <div className="flex gap-2 flex-wrap">
                      {order.front_design_file && (
                        <a
                          href={order.front_design_file}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#111] border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          ↓ Front File
                        </a>
                      )}
                      {order.back_design_file && (
                        <a
                          href={order.back_design_file}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#111] border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          ↓ Back File
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View Proofs CTA */}
              <Link
                href={`/orders/${order.id}/proofs`}
                className="flex items-center justify-center gap-2 w-full bg-[#111] text-white py-3.5 rounded-2xl text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                🖼️ View Proofs & Mockups →
              </Link>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="space-y-5">

              {/* Order Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#111]">Order Summary</h3>
                  <button className="text-xs text-blue-500 font-medium hover:underline">Approve</button>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-gray-700 font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Type</span>
                    <span className="text-gray-700 font-medium capitalize">
                      {order.order_type?.replace(/_/g, ' ') || '—'}
                    </span>
                  </div>
                  <div className="border-t border-gray-50 pt-2.5 flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-gray-700 font-medium">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-gray-700 font-medium">$0.00</span>
                  </div>
                  <div className="border-t border-gray-50 pt-2.5 flex justify-between">
                    <span className="font-semibold text-[#111]">Total</span>
                    <span className="font-semibold text-[#111]">—</span>
                  </div>
                </div>
              </div>

              {/* Production Status */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-blue-500">🕐</span>
                  <h3 className="text-sm font-semibold text-[#111]">Production Status</h3>
                </div>
                <div className="space-y-3">
                  {timeline.map((t, i) => {
                    const done = i <= currentIdx
                    const current = i === currentIdx
                    return (
                      <div key={t.key} className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            current
                              ? 'bg-blue-500 text-white'
                              : done
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-300'
                          }`}
                        >
                          {done && !current ? '✓' : current ? '●' : ''}
                        </div>
                        <p
                          className={`text-xs ${
                            current ? 'font-semibold text-[#111]' : done ? 'text-gray-600' : 'text-gray-300'
                          }`}
                        >
                          {t.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-[#111] mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: '↓', label: 'Download Invoice' },
                    { icon: '📦', label: 'Track Package' },
                    { icon: '💬', label: 'Contact Support' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="w-full flex items-center gap-2.5 text-xs font-medium text-gray-600 border border-gray-100 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all text-left"
                    >
                      <span>{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
