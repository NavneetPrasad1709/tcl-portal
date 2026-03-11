'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

const statusConfig = {
  new:                { label: 'New',                dot: '#3b82f6', bg: '#eff6ff', color: '#1d4ed8' },
  proof_pending:      { label: 'Proof Pending',      dot: '#f59e0b', bg: '#fffbeb', color: '#b45309' },
  proof_ready:        { label: 'Proof Ready',        dot: '#8b5cf6', bg: '#f5f3ff', color: '#6d28d9' },
  approved:           { label: 'Approved',           dot: '#10b981', bg: '#ecfdf5', color: '#065f46' },
  in_production:      { label: 'In Production',      dot: '#f97316', bg: '#fff7ed', color: '#c2410c' },
  shipped:            { label: 'Shipped',            dot: '#06b6d4', bg: '#ecfeff', color: '#0e7490' },
  complete:           { label: 'Complete',           dot: '#6b7280', bg: '#f9fafb', color: '#374151' },
  pending:            { label: 'Pending',            dot: '#f59e0b', bg: '#fffbeb', color: '#b45309' },
  revision_requested: { label: 'Revision Requested', dot: '#f97316', bg: '#fff7ed', color: '#c2410c' },
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending
  return (
    <span
      style={{ background: cfg.bg, color: cfg.color }}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
    >
      <span style={{ background: cfg.dot }} className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" />
      {cfg.label}
    </span>
  )
}

export default function ProofsPage() {
  const [proofs, setProofs] = useState([])
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [revisionText, setRevisionText] = useState({})
  const [showRevision, setShowRevision] = useState({})
  const [submitting, setSubmitting] = useState({})
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: orderData } = await supabase
        .from('orders').select('*').eq('id', params.id).single()
      setOrder(orderData)

      const { data: proofsData } = await supabase
        .from('proofs').select('*, products(name)').eq('order_id', params.id)
      setProofs(proofsData || [])

      setLoading(false)
    }
    loadData()
  }, [])

  async function handleApprove(proofId) {
    setSubmitting(prev => ({ ...prev, [proofId]: 'approving' }))

    const { error } = await supabase
      .from('proofs').update({ status: 'approved' }).eq('id', proofId)

    if (error) {
      alert('Error: ' + error.message)
      setSubmitting(prev => ({ ...prev, [proofId]: null }))
      return
    }

    const updatedProofs = proofs.map(p =>
      p.id === proofId ? { ...p, status: 'approved' } : p
    )
    setProofs(updatedProofs)
    setSubmitting(prev => ({ ...prev, [proofId]: null }))

    const allApproved = updatedProofs.every(p => p.status === 'approved')
    if (allApproved && updatedProofs.length > 0) {
      await supabase.from('orders').update({ status: 'approved' }).eq('id', params.id)
      setOrder(prev => ({ ...prev, status: 'approved' }))
    }
  }

  async function handleRevision(proofId) {
    const notes = revisionText[proofId]
    if (!notes?.trim()) { alert('Please describe the changes needed.'); return }

    setSubmitting(prev => ({ ...prev, [proofId]: 'revising' }))

    const { data: { user } } = await supabase.auth.getUser()

    const { error: revError } = await supabase
      .from('revision_requests')
      .insert({ proof_id: proofId, customer_id: user.id, notes })

    if (revError) {
      alert('Error: ' + revError.message)
      setSubmitting(prev => ({ ...prev, [proofId]: null }))
      return
    }

    await supabase.from('proofs').update({ status: 'revision_requested' }).eq('id', proofId)

    setProofs(proofs.map(p => p.id === proofId ? { ...p, status: 'revision_requested' } : p))
    setShowRevision(prev => ({ ...prev, [proofId]: false }))
    setRevisionText(prev => ({ ...prev, [proofId]: '' }))
    setSubmitting(prev => ({ ...prev, [proofId]: null }))
  }

  const totalProofs   = proofs.length
  const approvedCount = proofs.filter(p => p.status === 'approved').length
  const pendingCount  = proofs.filter(p => p.status === 'pending').length
  const revisionCount = proofs.filter(p => p.status === 'revision_requested').length

  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'); *{font-family:'Poppins',sans-serif;}`}</style>
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading proofs...</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        .proof-card { transition: box-shadow 0.15s ease; }
        .proof-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
      `}</style>

      <div className="min-h-screen bg-[#f8f9fb]">

        {/* Navbar */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/orders/${params.id}`)}
                className="text-gray-400 hover:text-[#111] transition-colors text-sm"
              >
                ← Back
              </button>
              <span className="text-gray-200">/</span>
              <span className="text-sm text-gray-400 truncate max-w-[160px]">{order?.event_name}</span>
              <span className="text-gray-200">/</span>
              <span className="text-sm font-semibold text-[#111]">Proof Review</span>
            </div>
            <StatusBadge status={order?.status} />
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#111]">Review Proofs for Your Order</h1>
            <p className="text-sm text-gray-400 mt-1">
              Approve proofs or request changes — all proofs must be approved before production
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Proofs',   value: totalProofs,   color: '#3b82f6' },
              { label: 'Approved',       value: approvedCount, color: '#10b981' },
              { label: 'Pending Review', value: pendingCount,  color: '#f59e0b' },
              { label: 'Revision Sent',  value: revisionCount, color: '#f97316' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <p style={{ color: stat.color }} className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* No proofs */}
          {proofs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <p className="text-4xl mb-3">🎨</p>
              <p className="text-sm font-semibold text-gray-600 mb-1">No proofs ready yet</p>
              <p className="text-xs text-gray-400">Your designer is working on mockups — check back soon</p>
            </div>
          ) : (
            <div className="flex gap-6">

              {/* LEFT: Proof cards */}
              <div className="flex-1 space-y-5">
                {proofs.map((proof) => (
                  <div key={proof.id} className="proof-card bg-white rounded-2xl border border-gray-100 overflow-hidden">

                    {/* Proof header */}
                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-gray-400 tracking-wide">
                            PROOF#{String(proof.proof_number).padStart(6, '0')}
                          </span>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs text-gray-400">
                            {proof.uploaded_at
                              ? new Date(proof.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#111]">
                          {proof.products?.name || 'Product'}
                        </p>
                      </div>
                      <StatusBadge status={proof.status} />
                    </div>

                    <div className="flex flex-col lg:flex-row">

                      {/* Mockup image */}
                      <div className="lg:w-64 bg-[#f8f9fb] flex flex-col items-center justify-center p-6 flex-shrink-0 gap-3">
                        {proof.mockup_image_url ? (
                          <>
                            <img
                              src={proof.mockup_image_url}
                              alt={`Proof ${proof.proof_number}`}
                              className="max-h-52 max-w-full rounded-xl object-contain"
                              onError={e => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                            <div className="hidden flex-col items-center justify-center text-center">
                              <span className="text-4xl mb-2">🖼️</span>
                              <p className="text-xs text-gray-400">Mockup unavailable</p>
                            </div>
                            <a
                              href={proof.mockup_image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              Click here to view real imaging
                            </a>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center h-44">
                            <span className="text-4xl mb-2">🖼️</span>
                            <p className="text-xs text-gray-400">Mockup image here</p>
                          </div>
                        )}
                      </div>

                      {/* Details + actions */}
                      <div className="flex-1 p-6">

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Product</p>
                            <p className="text-sm font-medium text-[#111]">{proof.products?.name || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Color</p>
                            <p className="text-sm font-medium text-[#111]">{proof.color || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Print Type</p>
                            <p className="text-sm font-medium text-[#111] capitalize">
                              {proof.print_type?.replace(/_/g, ' ') || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Est. Ship Date</p>
                            <p className="text-sm font-medium text-[#111]">
                              {proof.est_ship_date
                                ? new Date(proof.est_ship_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                : 'TBD'}
                            </p>
                          </div>
                        </div>

                        {/* Price tiers */}
                        {proof.price_tiers && (
                          <div className="mb-5">
                            <p className="text-xs text-gray-400 mb-2">Price per Piece</p>
                            <div className="bg-[#f8f9fb] rounded-xl p-3 space-y-1.5">
                              {Object.entries(proof.price_tiers).map(([qty, price]) => (
                                <div key={qty} className="flex justify-between text-xs">
                                  <span className="text-gray-500">{qty} pcs</span>
                                  <span className="font-semibold text-[#111]">{price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons — pending */}
                        {proof.status === 'pending' && (
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleApprove(proof.id)}
                                disabled={submitting[proof.id] === 'approving'}
                                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                              >
                                {submitting[proof.id] === 'approving' ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Approving...
                                  </>
                                ) : '✓ Approve Proof'}
                              </button>
                              <button
                                onClick={() => setShowRevision(prev => ({ ...prev, [proof.id]: !prev[proof.id] }))}
                                className="flex-1 bg-white border-2 border-orange-400 text-orange-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-50 transition-colors"
                              >
                                ✏️ Request Changes
                              </button>
                            </div>

                            {/* Revision form */}
                            {showRevision[proof.id] && (
                              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
                                <p className="text-xs font-semibold text-orange-800">What changes are needed?</p>
                                <textarea
                                  value={revisionText[proof.id] || ''}
                                  onChange={e => setRevisionText(prev => ({ ...prev, [proof.id]: e.target.value }))}
                                  rows={3}
                                  placeholder="e.g. Make the logo larger, change the color to navy blue..."
                                  className="w-full bg-white border border-orange-200 rounded-xl px-4 py-3 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-orange-400 transition-colors resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleRevision(proof.id)}
                                    disabled={submitting[proof.id] === 'revising'}
                                    className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-semibold hover:opacity-80 disabled:opacity-50 transition-opacity"
                                  >
                                    {submitting[proof.id] === 'revising' ? 'Submitting...' : 'Submit Revision Request'}
                                  </button>
                                  <button
                                    onClick={() => setShowRevision(prev => ({ ...prev, [proof.id]: false }))}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status banners */}
                        {proof.status === 'approved' && (
                          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2">
                            <span className="text-green-500 text-lg">✓</span>
                            <div>
                              <p className="text-sm font-semibold text-green-700">Proof Approved</p>
                              <p className="text-xs text-green-500">This proof has been approved for production</p>
                            </div>
                          </div>
                        )}

                        {proof.status === 'revision_requested' && (
                          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-2">
                            <span className="text-orange-500 text-lg">✏️</span>
                            <div>
                              <p className="text-sm font-semibold text-orange-700">Revision Requested</p>
                              <p className="text-xs text-orange-500">Your designer has been notified and is reviewing changes</p>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT: Sidebar */}
              <div className="w-72 flex-shrink-0 space-y-4">

                {/* Order Type display */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Type</p>
                  <div className="space-y-2">
                    {[
                      { value: 'group_order', label: 'Group Order', sub: "Suggested if you're ready with sizes and quantities" },
                      { value: 'get_a_link',  label: 'Get a Link',  sub: 'Suggested if people are ordering individually' },
                    ].map(opt => (
                      <div
                        key={opt.value}
                        className={`p-3 rounded-xl border-2 ${order?.order_type === opt.value ? 'border-[#111] bg-gray-50' : 'border-gray-100'}`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${order?.order_type === opt.value ? 'border-[#111]' : 'border-gray-300'}`}>
                            {order?.order_type === opt.value && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-[#111]">{opt.label}</p>
                        </div>
                        <p className="text-xs text-gray-400 pl-5">{opt.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ready to Order */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-[#111] mb-1">Ready to Order?</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Once you have approved your proofs, proceed to production.
                  </p>
                  <button
                    onClick={async () => {
                      await supabase.from('orders').update({ status: 'in_production' }).eq('id', params.id)
                      setOrder(prev => ({ ...prev, status: 'in_production' }))
                      router.push(`/orders/${params.id}`)
                    }}
                    disabled={approvedCount === 0}
                    className="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-80 disabled:opacity-30 transition-opacity flex items-center justify-center gap-2"
                  >
                    🛒 Send to Production
                  </button>
                  {approvedCount > 0 && (
                    <p className="text-xs text-green-600 text-center mt-2">
                      {approvedCount} proof{approvedCount > 1 ? 's' : ''} approved
                    </p>
                  )}
                  {approvedCount === 0 && (
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Approve at least one proof to continue
                    </p>
                  )}
                </div>

                {/* Need Assistance */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-[#111] mb-1">Need Assistance?</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Our custom apparel specialists are here to help with any questions about your order.
                  </p>
                  <button className="w-full bg-white border border-gray-200 text-[#111] py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors">
                    Contact Specialist
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
