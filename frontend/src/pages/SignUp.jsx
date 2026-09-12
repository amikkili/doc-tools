import { FileText, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SignUp() {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Please enter your name'); return }
    if (!form.email) { toast.error('Please enter your email'); return }
    if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    toast.success('Account created!')
    setForm({ name: '', email: '', password: '' })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow" style={{ background: 'linear-gradient(135deg,#fb7185,#f43f5e)' }}>
              <FileText size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold" style={{ color: '#1e1b4b' }}>DocCraft</span>
          </div>

          <h2 className="text-xl font-bold text-center mb-1 text-gray-900 dark:text-white">Create your account</h2>
          <p className="text-sm text-center text-gray-500 mb-6">Join DocCraft — it's free forever</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" placeholder="Your name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-rose-400 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-rose-400 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:border-rose-400 dark:bg-gray-800 dark:text-gray-100" />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#fb7185,#f43f5e)' }}>
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold" style={{ color: '#f43f5e' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
