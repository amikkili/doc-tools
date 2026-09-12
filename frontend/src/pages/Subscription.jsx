import { useState } from 'react'
import { Check, Zap, Crown, Building2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const PLANS = [
  {
    name: 'Free',
    monthly: 0,
    yearly: 0,
    icon: Zap,
    accent: 'gray',
    features: [
      'All 36+ tools unlocked',
      '25 MB max file size',
      'Basic PDF operations',
      'Client-side image tools',
      'No sign-up required',
    ],
    cta: 'Get Started Free',
    highlight: false,
    link: '/',
  },
  {
    name: 'Pro',
    monthly: 299,
    yearly: 199,
    icon: Crown,
    accent: 'red',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      '200 MB max file size',
      'Batch processing (20 files)',
      'Priority conversion queue',
      'No watermarks on output',
      'PDF password removal',
      'Advanced AI PDF Analyzer',
      'Email support (24h SLA)',
    ],
    cta: 'Start Pro',
    highlight: true,
    link: '/signin',
  },
  {
    name: 'Team',
    monthly: 999,
    yearly: 749,
    icon: Building2,
    accent: 'violet',
    features: [
      'Everything in Pro',
      '500 MB max file size',
      'Unlimited batch processing',
      'Up to 10 team members',
      'API access (1 000 req/day)',
      'Custom branding on output',
      'Priority phone support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlight: false,
    link: '/contact',
  },
]

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes — cancel from your account settings anytime. No lock-in, no questions asked. You keep access until the period ends.' },
  { q: 'Is my data safe?', a: 'Client-side tools never upload your files. Server-side conversions are deleted within 1 hour of processing.' },
  { q: 'Do I need a card for Free?', a: 'No. The Free plan needs zero payment details — start using all tools immediately.' },
  { q: 'What payment methods are accepted?', a: 'UPI, Debit/Credit card, Net Banking, and all major wallets via Razorpay.' },
  { q: 'Can I switch plans later?', a: 'Yes. Upgrade or downgrade anytime — prorated credits apply automatically.' },
  { q: 'Is there a student discount?', a: 'Yes! Email us from your college ID for 50% off the Pro plan.' },
]

export default function Subscription() {
  const [yearly, setYearly] = useState(false)

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white py-20 px-4 text-center">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-6">
            <Sparkles size={13} className="text-yellow-400" />
            Simple, transparent pricing
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
            The right plan for<br />
            <span className="bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">every workflow</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Start free — upgrade when you need more power. No hidden fees, ever.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-2">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${!yearly ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${yearly ? 'bg-white text-gray-900 shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Yearly
              <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">-33%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-4 mt-6 sm:-mt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {PLANS.map(({ name, monthly, yearly: yr, icon: Icon, accent, badge, features, cta, highlight, link }) => {
            const price = yearly ? yr : monthly
            const accentMap = {
              gray: { ring: 'border-gray-200 dark:border-gray-700', icon: 'bg-gray-100 dark:bg-gray-800 text-gray-500', btn: 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900' },
              red: { ring: 'border-red-500', icon: 'bg-red-100 dark:bg-red-900/40 text-red-500', btn: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' },
              violet: { ring: 'border-violet-400 dark:border-violet-600', icon: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600', btn: 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25' },
            }
            const a = accentMap[accent]

            return (
              <div
                key={name}
                className={`relative rounded-2xl border-2 ${a.ring} bg-white dark:bg-gray-900 flex flex-col p-7 transition-all duration-200 ${
                  highlight ? 'shadow-2xl md:scale-105 z-10' : 'shadow-md'
                }`}
              >
                {badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-red-500/40">
                      {badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${a.icon}`}>
                    <Icon size={20} />
                  </div>
                  <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{name}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                      {price === 0 ? 'Free' : `₹${price}`}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-400 text-sm mb-1.5">/mo</span>
                    )}
                  </div>
                  {yearly && price > 0 && (
                    <p className="text-xs text-green-500 font-semibold mt-1">
                      Save ₹{(monthly - yr) * 12}/yr vs monthly
                    </p>
                  )}
                  {price === 0 && (
                    <p className="text-xs text-gray-400 mt-1">No credit card needed</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                      <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        accent === 'red' ? 'bg-red-100 dark:bg-red-900/30' : accent === 'violet' ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <Check size={10} className={accent === 'red' ? 'text-red-500' : accent === 'violet' ? 'text-violet-500' : 'text-gray-500'} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to={link}
                  onClick={() => name === 'Pro' && toast.success('Redirecting to sign in…')}
                  className={`w-full text-center py-3 rounded-xl text-sm font-bold transition-colors ${a.btn}`}
                >
                  {cta}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          {['🔒 256-bit SSL encryption', '🚫 No lock-in contracts', '↩️ 7-day money-back guarantee', '🇮🇳 GST invoice included'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">{q}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA footer */}
        <div className="mt-12 text-center bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.15),transparent_70%)]" />
          <div className="relative">
            <p className="text-2xl font-extrabold mb-2">Still not sure?</p>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Start with Free — no card needed. Upgrade whenever you're ready.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/" className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                Try Free Now
              </Link>
              <Link to="/contact" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm border border-white/10">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
