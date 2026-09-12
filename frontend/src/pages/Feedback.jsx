import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'

const TOOLS = [
  'Merge PDF', 'Split PDF', 'Compress PDF', 'Word to PDF', 'PDF to Word',
  'JSON Beautifier', 'YAML ↔ JSON', 'JWT Debugger', 'CSS Gradient Maker',
  'Image Cropper', 'Color Palette', 'Other',
]

export default function Feedback() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [form, setForm] = useState({ tool: '', comment: '', email: '' })

  const submit = (e) => {
    e.preventDefault()
    if (!rating) { toast.error('Please give a star rating'); return }
    if (!form.comment.trim()) { toast.error('Please leave a comment'); return }
    toast.success('Thank you for your feedback!')
    setRating(0); setForm({ tool: '', comment: '', email: '' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">Share Your Feedback</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Your feedback helps us improve DocCraft for everyone.</p>
      </div>

      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-7 space-y-5">

        {/* Star rating */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">How would you rate your experience?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                type="button" key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className="transition-colors"
                  fill={(hover || rating) >= n ? '#f97316' : 'none'}
                  stroke={(hover || rating) >= n ? '#f97316' : '#d1d5db'}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
            </p>
          )}
        </div>

        {/* Tool selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Which tool are you reviewing? (optional)</label>
          <select
            value={form.tool}
            onChange={e => setForm(f => ({ ...f, tool: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition"
          >
            <option value="">Select a tool…</option>
            {TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Feedback</label>
          <textarea
            rows={5} placeholder="Tell us what you think — what's working, what could be better…"
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition resize-none"
          />
        </div>

        {/* Email (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email <span className="text-gray-400 font-normal">(optional — so we can follow up)</span></label>
          <input
            type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition"
          />
        </div>

        <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors">
          Submit Feedback
        </button>
      </form>
    </div>
  )
}
