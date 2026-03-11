'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
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
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
    >
      <span style={{ background: cfg.dot }} className="w-1.5 h-1.5 rounded-full inline-block" />
      {cfg.label}
    </span>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: profileData } = await supabase
        .from('users').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: ordersData } = await supabase
        .from('orders').select('*').eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(ordersData || [])
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Stats derived from orders
  const totalOrders = orders.length
  const activeOrders = orders.filter(o => !['complete', 'shipped'].includes(o.status)).length
  const completedOrders = orders.filter(o => o.status === 'complete').length

  if (loading) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'); * { font-family: 'Poppins', sans-serif; }`}</style>
        <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        .order-row:hover { background: #fafafa; }
        .order-row { transition: background 0.15s ease; }
      `}</style>

      <div className="min-h-screen bg-[#f8f9fb]">

        {/* Navbar */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#111] rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <span className="font-semibold text-[#111] text-sm tracking-tight">TCL Portal</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-5">
              <Link
                href="/orders/new"
                className="bg-[#111] text-white text-xs font-medium px-4 py-2 rounded-xl hover:opacity-80 transition-opacity"
              >
                + New Order
              </Link>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {profile?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-gray-600 hidden sm:block">
                  {profile?.name?.split(' ')[0] || 'User'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main */}
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Welcome row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-[#111]">
                Welcome back, {profile?.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {profile?.organization || 'TCL Customer'} &nbsp;·&nbsp;
                <span className="text-[#111] font-medium">{profile?.loyalty_points || 0}</span> loyalty pts
              </p>
            </div>
            <Link
              href="/orders/new"
              className="self-start sm:self-auto bg-[#111] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-80 transition-opacity"
            >
              + Create New Order
            </Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-xs text-gray-400 font-medium mb-1">Total Orders</p>
              <p className="text-3xl font-semibold text-[#111]">{totalOrders}</p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-xs text-gray-400 font-medium mb-1">Active Orders</p>
              <p className="text-3xl font-semibold text-[#111]">{activeOrders}</p>
              <p className="text-xs text-gray-400 mt-1">In progress</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-400 font-medium mb-1">Completed</p>
              <p className="text-3xl font-semibold text-[#111]">{completedOrders}</p>
              <p className="text-xs text-gray-400 mt-1">Successfully delivered</p>
            </div>
          </div>

          {/* Orders table */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

            {/* Table header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-[#111]">Your Orders</h2>
              <span className="text-xs text-gray-400">{totalOrders} total</span>
            </div>

            {orders.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                  📦
                </div>
                <p className="text-sm font-medium text-gray-600">No orders yet</p>
                <p className="text-xs text-gray-400">Create your first order to get started</p>
                <Link
                  href="/orders/new"
                  className="mt-2 bg-[#111] text-white text-xs font-medium px-5 py-2.5 rounded-xl hover:opacity-80 transition-opacity"
                >
                  Create First Order
                </Link>
              </div>
            ) : (
              <div>
                {/* Column headers */}
                <div className="grid grid-cols-12 px-6 py-2.5 bg-gray-50 border-b border-gray-100">
                  <p className="col-span-4 text-xs font-medium text-gray-400">Event</p>
                  <p className="col-span-2 text-xs font-medium text-gray-400">Type</p>
                  <p className="col-span-2 text-xs font-medium text-gray-400">Due Date</p>
                  <p className="col-span-2 text-xs font-medium text-gray-400">Status</p>
                  <p className="col-span-2 text-xs font-medium text-gray-400 text-right">Action</p>
                </div>

                {orders.map((order, i) => (
                  <div
                    key={order.id}
                    className={`order-row grid grid-cols-12 px-6 py-4 items-center ${
                      i !== orders.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    {/* Event name */}
                    <div className="col-span-4">
                      <p className="text-sm font-medium text-[#111] truncate">{order.event_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.print_type?.replace(/_/g, ' ') || 'Print type TBD'}
                      </p>
                    </div>

                    {/* Order type */}
                    <div className="col-span-2">
                      <span className="text-xs text-gray-500 capitalize">
                        {order.order_type?.replace(/_/g, ' ') || '—'}
                      </span>
                    </div>

                    {/* Due date */}
                    <div className="col-span-2">
                      <span className="text-xs text-gray-500">
                        {order.due_date
                          ? new Date(order.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Action */}
                    <div className="col-span-2 flex justify-end">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs font-medium text-[#111] border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}