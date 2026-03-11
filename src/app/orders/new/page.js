'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PRINT_TYPES = [
  {
    value: 'screen_print',
    label: 'Screen Printing',
    desc: 'Classic ink-based prints through mesh screens — great for large quantities and vibrant colors.',
    bestFor: 'Large orders, simple designs',
    minQty: '12 pieces',
    days: '7 days',
    popular: true,
    img: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80',
  },
  {
    value: 'embroidery',
    label: 'Embroidery',
    desc: 'Best used for items such as hats and polos.',
    bestFor: 'Professional look, polos, hats, small logos',
    minQty: '6 pieces',
    days: '10 days',
    popular: true,
    img: 'https://images.unsplash.com/photo-1558171813-f5bc08e12b4c?w=400&q=80',
  },
  {
    value: 'puff_print',
    label: 'Puff Print',
    desc: 'Best used for a raised look.',
    bestFor: 'Dimensional designs, logos, premium feel',
    minQty: '24 pieces',
    days: '10 days',
    popular: false,
    img: 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=400&q=80',
  },
  {
    value: 'foil',
    label: 'Foil Print',
    desc: 'Metallic shine that catches the eye.',
    bestFor: 'Bold statements, event merch',
    minQty: '24 pieces',
    days: '12 days',
    popular: false,
    img: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400&q=80',
  },
  {
    value: 'dye_sublimation',
    label: 'Dye Sublimation',
    desc: 'Full color all-over printing.',
    bestFor: 'All-over prints, photographic designs',
    minQty: '6 pieces',
    days: '14 days',
    popular: false,
    img: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&q=80',
  },
]

const categoryImages = {
  'T-Shirts':    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
  'Sweatshirts': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80',
  'Headwear':    'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&q=80',
  'Polos':       'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80',
  'Outerwear':   'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
}

// ── helpers ───────────────────────────────────────────────

function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'Main Details',   sub: 'Choose Product & Color' },
    { n: 2, label: 'Design Details', sub: 'Front & Back Design Info' },
    { n: 3, label: 'Print Type',     sub: 'Select your print type' },
  ]
  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
              ${step === s.n ? 'bg-[#111] border-[#111] text-white'
              : step > s.n  ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white border-gray-200 text-gray-400'}`}>
              {step > s.n ? '✓' : s.n}
            </div>
            <div className="hidden sm:block">
              <p className={`text-xs font-semibold ${step >= s.n ? 'text-[#111]' : 'text-gray-400'}`}>{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-3 rounded-full ${step > s.n ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function ProductCard({ product, selected, onToggle }) {
  const imgSrc = categoryImages[product.category] || categoryImages['T-Shirts']
  const [imgError, setImgError] = useState(false)

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all overflow-hidden
      ${selected ? 'border-[#111] shadow-md' : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}>

      {/* Image */}
      <div className="relative bg-gray-50 h-44 overflow-hidden">
        {product.is_featured && (
          <span className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            ★ Featured
          </span>
        )}
        {selected && (
          <span className="absolute top-3 right-3 z-10 bg-[#111] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            ✓ Added
          </span>
        )}
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-4xl">👕</span>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-semibold text-sm text-[#111] leading-snug">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 mb-3">{product.sku}</p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Turnaround</p>
            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
              {product.turnaround_days}–{product.turnaround_days + 3} days
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Starting at</p>
            <p className="text-base font-bold text-[#111]">${product.starting_price}</p>
          </div>
        </div>

        <button
          onClick={() => onToggle(product.id)}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all
            ${selected
              ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200'
              : 'bg-[#111] text-white hover:opacity-80'}`}
        >
          {selected ? 'Remove' : 'Add to Order'}
        </button>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────

export default function NewOrderPage() {
  const [step, setStep] = useState(1)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Products')
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    event_name: '',
    due_date: '',
    order_type: 'group_order',
    selected_products: [],
    front_design_description: '',
    back_design_description: '',
    print_type: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('is_featured', { ascending: false })
      setProducts(data || [])
    }
    load()
  }, [])

  function update(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function toggleProduct(id) {
    setFormData(prev => {
      const sel = prev.selected_products
      return {
        ...prev,
        selected_products: sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id],
      }
    })
  }

  const categories = ['All Products', ...new Set(products.map(p => p.category)), 'Featured']

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    if (activeFilter === 'All Products') return matchSearch
    if (activeFilter === 'Featured') return matchSearch && p.is_featured
    return matchSearch && p.category === activeFilter
  })

  async function handleSubmit() {
    setLoading(true)
    const { error } = await supabase.from('orders').insert({
      customer_id: user.id,
      event_name: formData.event_name,
      due_date: formData.due_date,
      order_type: formData.order_type,
      products_selected: formData.selected_products,
      front_design_description: formData.front_design_description,
      back_design_description: formData.back_design_description,
      print_type: formData.print_type,
      status: 'new',
    })
    if (error) { alert('Error: ' + error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const canGoStep2 = formData.event_name && formData.due_date && formData.selected_products.length > 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        .file-drop:hover { border-color: #111 !important; background: #fafafa; }
        .print-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.08); }
        .print-card { transition: all 0.15s ease; }
      `}</style>

      <div className="min-h-screen bg-[#f8f9fb]">

        {/* Navbar */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-[#111] transition-colors text-sm">
                ← Back
              </Link>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#111] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <span className="font-semibold text-[#111] text-sm">Create a New Order</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xs font-medium text-gray-500 border border-gray-200 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
          </div>
        </nav>

        {/* Step indicator */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <StepIndicator step={step} />
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-6">

            {/* ── LEFT SIDEBAR ── */}
            <div className="w-72 flex-shrink-0 space-y-4">

              {/* Order Type */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Type</p>
                <div className="space-y-2">
                  {[
                    { value: 'group_order', label: 'Group Order', sub: 'Create and submit an order directly' },

                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => update('order_type', opt.value)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all
                        ${formData.order_type === opt.value
                          ? 'border-[#111] bg-gray-50'
                          : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${formData.order_type === opt.value ? 'border-[#111]' : 'border-gray-300'}`}>
                          {formData.order_type === opt.value &&
                            <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />}
                        </div>
                        <p className="text-sm font-semibold text-[#111]">{opt.label}</p>
                      </div>
                      <p className="text-xs text-gray-400 pl-5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Details</p>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.event_name}
                    onChange={e => update('event_name', e.target.value)}
                    placeholder="Spring Rush 2025"
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => update('due_date', e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
              </div>

              {/* Selected products */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Selected</p>
                  <span className="bg-[#111] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {formData.selected_products.length}
                  </span>
                </div>
                {formData.selected_products.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No products selected yet</p>
                ) : (
                  <div className="space-y-2">
                    {formData.selected_products.map(pid => {
                      const p = products.find(x => x.id === pid)
                      if (!p) return null
                      const thumb = categoryImages[p.category] || categoryImages['T-Shirts']
                      return (
                        <div key={pid} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={thumb}
                              alt={p.name}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                              onError={e => { e.target.style.display='none' }}
                            />
                            <p className="text-xs font-medium text-[#111] truncate">{p.name}</p>
                          </div>
                          <button
                            onClick={() => toggleProduct(pid)}
                            className="text-gray-300 hover:text-red-400 transition-colors text-lg font-bold flex-shrink-0"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT CONTENT ── */}
            <div className="flex-1 min-w-0">

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Notice */}
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3.5 flex gap-3">
                    <span className="text-amber-500 text-sm mt-0.5 flex-shrink-0">⚠</span>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      We will try to accommodate new product requests but cannot guarantee availability or specific timelines.
                      If you can't find what you're looking for, you can submit a product suggestion below.
                    </p>
                  </div>

                  {/* Search + filters */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm">🔍</span>
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-[#fafafa] border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map(f => (
                        <button
                          key={f}
                          onClick={() => setActiveFilter(f)}
                          className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all
                            ${activeFilter === f
                              ? 'bg-[#111] text-white border-[#111]'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                        >
                          {f} ({
                            f === 'All Products' ? products.length
                            : f === 'Featured' ? products.filter(p => p.is_featured).length
                            : products.filter(p => p.category === f).length
                          })
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product grid */}
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                      <p className="text-2xl mb-2">🔍</p>
                      <p className="text-sm text-gray-500">No products found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProducts.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          selected={formData.selected_products.includes(product.id)}
                          onToggle={toggleProduct}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {[
                    { key: 'front', label: 'Front Design', file: frontFile, setFile: setFrontFile, descKey: 'front_design_description', placeholder: 'e.g. Bold, vintage, minimal...' },
                    { key: 'back',  label: 'Back Design',  file: backFile,  setFile: setBackFile,  descKey: 'back_design_description',  placeholder: 'e.g. Clean, collegiate, bold text...' },
                  ].map(side => (
                    <div key={side.key} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">🎨</span>
                        <h3 className="text-sm font-semibold text-[#111]">{side.label}</h3>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 mb-2">What's your idea? How do you want your design to look?</p>
                        <textarea
                          value={formData[side.descKey]}
                          onChange={e => update(side.descKey, e.target.value)}
                          rows={4}
                          placeholder={`Describe your ${side.key} design idea...`}
                          className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors resize-none"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Upload Design Files</p>
                        <label className="file-drop block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer transition-all">
                          <input
                            type="file"
                            accept="image/*,.pdf,.ai,.eps"
                            className="hidden"
                            onChange={e => side.setFile(e.target.files[0])}
                          />
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-400 text-xl">
                              ↑
                            </div>
                            {side.file ? (
                              <p className="text-xs font-medium text-green-600">✓ {side.file.name}</p>
                            ) : (
                              <>
                                <p className="text-xs font-medium text-gray-600">Drag & drop files here</p>
                                <p className="text-xs text-gray-400">or click to browse</p>
                              </>
                            )}
                          </div>
                        </label>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Design Direction</p>
                        <input
                          type="text"
                          placeholder={side.placeholder}
                          className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">🔍</span>
                    <input
                      type="text"
                      placeholder="Type here to search Print type"
                      className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PRINT_TYPES.map(pt => (
                      <div
                        key={pt.value}
                        onClick={() => update('print_type', pt.value)}
                        className={`print-card bg-white rounded-2xl border-2 overflow-hidden cursor-pointer
                          ${formData.print_type === pt.value ? 'border-[#111]' : 'border-gray-100'}`}
                      >
                        <div className="relative h-36 overflow-hidden bg-gray-100">
                          {pt.popular && (
                            <span className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                              ★ Popular
                            </span>
                          )}
                          {formData.print_type === pt.value && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                              <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-green-600 text-sm">✓</div>
                            </div>
                          )}
                          <img
                            src={pt.img}
                            alt={pt.label}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-sm text-[#111] mb-1">{pt.label}</p>
                          <p className="text-xs text-gray-500 leading-relaxed mb-3">{pt.desc}</p>
                          <div className="space-y-1.5 text-xs border-t border-gray-50 pt-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Best for:</span>
                              <span className="text-gray-700 font-medium text-right max-w-[140px]">{pt.bestFor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Min quantity:</span>
                              <span className="text-gray-700 font-medium">{pt.minQty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Turnaround:</span>
                              <span className="text-gray-700 font-medium">{pt.days}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-[#111]">{formData.selected_products.length}</span> products selected
            </p>
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="text-sm font-medium text-gray-600 border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && !canGoStep2}
                  className="bg-[#111] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-80 disabled:opacity-30 transition-opacity"
                >
                  {step === 1 ? 'Next: Design Details →' : 'Next: Print Type →'}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.print_type || loading}
                  className="bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-80 disabled:opacity-30 transition-opacity"
                >
                  {loading ? 'Submitting...' : '🎉 Submit Order'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="h-20" />
      </div>
    </>
  )
}