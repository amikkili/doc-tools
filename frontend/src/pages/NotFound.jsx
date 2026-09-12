import { Link, useLocation } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

const SUGGESTIONS = [
  { icon: '🔗', label: 'Merge PDF', path: '/merge-pdf' },
  { icon: '📝', label: 'Word to PDF', path: '/word-to-pdf' },
  { icon: '{ }', label: 'JSON Beautifier', path: '/json-beautifier' },
  { icon: '🖼️', label: 'WebP Converter', path: '/webp-converter' },
]

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16 text-center bg-gray-50 dark:bg-gray-950">

      {/* Big 404 */}
      <div className="relative mb-6 select-none">
        <p className="text-[10rem] sm:text-[14rem] font-extrabold text-gray-100 dark:text-gray-800 leading-none tracking-tighter">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-red-500 rounded-3xl flex items-center justify-center shadow-xl shadow-red-500/30">
            <span className="text-4xl">📄</span>
          </div>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">
        Page not found
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-2">
        The page <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{pathname}</span> doesn't exist.
      </p>
      <p className="text-gray-400 dark:text-gray-500 text-sm mb-10">
        It may have been moved, renamed, or never existed.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 mb-14">
        <Link
          to="/"
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md"
        >
          <Home size={16} /> Go Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-md">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          <Search size={12} /> Popular tools
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SUGGESTIONS.map(s => (
            <Link
              key={s.path}
              to={s.path}
              className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all shadow-sm"
            >
              <span className="text-xl leading-none">{s.icon}</span>
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
