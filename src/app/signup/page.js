'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) { setError(signupError.message); setLoading(false); return }

    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      name,
      email,
      organization,
      user_type: 'customer',
      loyalty_points: 0
    })

    if (profileError) { setError(profileError.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        .auth-wrap * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="auth-wrap min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl p-10 w-full max-w-sm shadow-sm">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-[#111] rounded-lg flex items-center justify-center text-white text-xs font-semibold">
              T
            </div>
            <span className="text-sm font-semibold text-[#111]">TCL Portal</span>
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-[#111] mb-1">Create account</h1>
          <p className="text-sm text-gray-400 mb-7">Start managing your orders</p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-500 text-xs px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Navneet Prasad"
                required
                className="w-full bg-[#fafafa] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#fafafa] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Organization
                <span className="text-gray-300 text-xs font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Alpha Phi, University of Alabama"
                className="w-full bg-[#fafafa] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111] text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity mt-1"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Switch */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#111] font-medium hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </>
  )
}