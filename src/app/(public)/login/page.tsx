'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth-client'
import { vi } from '@/lib/i18n/vi'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

type Mode = 'login' | 'register'
const ROLES = [
  { value: 'farmer', label: vi.roles.farmer, icon: '🌱' },
  { value: 'facility', label: vi.roles.facility, icon: '🏭' },
  { value: 'distributor', label: vi.roles.distributor, icon: '🚚' },
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('farmer')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        const r = await signIn.email({ email, password })
        if (r.error) throw new Error(r.error.message)
      } else {
        // @ts-expect-error custom field role
        const r = await signUp.email({ email, password, name, role })
        if (r.error) throw new Error(r.error.message)
      }
      router.push(redirect); router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Đăng nhập thất bại')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
      <div className="text-center mb-6">
        <Link href="/" className="text-3xl">🌿</Link>
        <h1 className="text-xl font-bold text-gray-800 mt-3">
          {mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{vi.app.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-colors ${
                    role === r.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <span className="text-lg">{r.icon}</span>{r.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors mt-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        {mode === 'login'
          ? <><span>Chưa có tài khoản? </span><button onClick={() => setMode('register')} className="text-green-700 font-medium hover:underline">Đăng ký ngay</button></>
          : <><span>Đã có tài khoản? </span><button onClick={() => setMode('login')} className="text-green-700 font-medium hover:underline">Đăng nhập</button></>
        }
      </p>
      <div className="mt-6 p-3 bg-amber-50 rounded-lg text-xs text-amber-700 border border-amber-200">
        <p className="font-medium mb-1">💡 Demo: đăng ký email bất kỳ + mật khẩu 8+ ký tự</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="text-gray-400 text-sm">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
