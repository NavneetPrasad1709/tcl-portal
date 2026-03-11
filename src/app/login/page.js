'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        .auth-wrap * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="auth-wrap min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-10 w-full max-w-sm shadow-sm">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-[#111] rounded-lg flex items-center justify-center text-white text-xs font-semibold">
              T
            </div>
            <span className="text-sm font-semibold text-[#111]">TCL Portal</span>
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-[#111] mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-7">Sign in to your account</p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-500 text-xs px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#fafafa] border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#111] placeholder-gray-300 focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111] text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity mt-1"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Switch */}
          <p className="text-center text-xs text-gray-400 mt-6">
            No account?{' '}
            <Link href="/signup" className="text-[#111] font-medium hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </>
  )
}