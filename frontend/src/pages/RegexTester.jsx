import { useState, useMemo } from 'react'
import { ArrowLeft, Copy, Check, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const FLAGS = [
  { flag: 'g', label: 'g', title: 'Global — find all matches' },
  { flag: 'i', label: 'i', title: 'Case insensitive' },
  { flag: 'm', label: 'm', title: 'Multiline — ^ and $ match line boundaries' },
  { flag: 's', label: 's', title: 'Dotall — . matches newlines too' },
]

const EXAMPLES = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'g', text: 'Contact us at hello@doccraft.io or support@example.com for help.' },
  { label: 'URL', pattern: 'https?:\\/\\/[^\\s]+', flags: 'g', text: 'Visit https://doccraft.io or http://example.com/path?q=1' },
  { label: 'Date', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g', text: 'Meeting on 2024-01-15 and follow-up on 2024-02-20.' },
  { label: 'IPv4', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', flags: 'g', text: 'Server IPs: 192.168.1.1 and 10.0.0.255' },
  { label: 'Hex Color', pattern: '#[0-9a-fA-F]{3,6}', flags: 'g', text: 'Colors: #fff, #FF5733, #3498db, #aabbcc' },
  { label: 'Phone (IN)', pattern: '[6-9]\\d{9}', flags: 'g', text: 'Call us: 9876543210 or 8123456789' },
]

function highlight(text, matches) {
  if (!matches.length) return [{ type: 'text', value: text }]
  const parts = []
  let cursor = 0
  matches.forEach((m, i) => {
    if (m.index > cursor) parts.push({ type: 'text', value: text.slice(cursor, m.index) })
    parts.push({ type: 'match', value: m[0], index: i })
    cursor = m.index + m[0].length
  })
  if (cursor < text.length) parts.push({ type: 'text', value: text.slice(cursor) })
  return parts
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}')
  const [activeFlags, setActiveFlags] = useState(new Set(['g', 'i']))
  const [testText, setTestText] = useState('Contact us at hello@doccraft.io or support@example.com for help.')
  const [copied, setCopied] = useState(false)

  const toggleFlag = (f) => setActiveFlags(prev => {
    const next = new Set(prev)
    next.has(f) ? next.delete(f) : next.add(f)
    return next
  })

  const { regex, error, matches } = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matches: [] }
    try {
      const flags = [...activeFlags].join('')
      const r = new RegExp(pattern, flags)
      const m = []
      if (flags.includes('g')) {
        let match
        const safe = new RegExp(pattern, flags)
        while ((match = safe.exec(testText)) !== null) {
          m.push(match)
          if (match[0].length === 0) safe.lastIndex++
        }
      } else {
        const match = r.exec(testText)
        if (match) m.push(match)
      }
      return { regex: r, error: null, matches: m }
    } catch (e) {
      return { regex: null, error: e.message, matches: [] }
    }
  }, [pattern, activeFlags, testText])

  const parts = useMemo(() => highlight(testText, matches), [testText, matches])

  const copyRegex = () => {
    const flags = [...activeFlags].join('')
    navigator.clipboard.writeText(`/${pattern}/${flags}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Regex copied!')
  }

  const loadExample = (ex) => {
    setPattern(ex.pattern)
    setActiveFlags(new Set(ex.flags.split('')))
    setTestText(ex.text)
  }

  const MATCH_COLORS = [
    'bg-yellow-200 dark:bg-yellow-800/70 text-yellow-900 dark:text-yellow-100',
    'bg-green-200 dark:bg-green-800/70 text-green-900 dark:text-green-100',
    'bg-blue-200 dark:bg-blue-800/70 text-blue-900 dark:text-blue-100',
    'bg-pink-200 dark:bg-pink-800/70 text-pink-900 dark:text-pink-100',
    'bg-purple-200 dark:bg-purple-800/70 text-purple-900 dark:text-purple-100',
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-2xl font-mono font-bold text-rose-600 dark:text-rose-400">.*</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Regex Tester</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Build and test regular expressions with live match highlighting</p>
        </div>
      </div>

      {/* Examples */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider self-center">Examples:</span>
        {EXAMPLES.map(ex => (
          <button key={ex.label} onClick={() => loadExample(ex)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all">
            {ex.label}
          </button>
        ))}
      </div>

      {/* Pattern bar */}
      <div className={`flex items-center gap-2 border-2 rounded-xl px-4 py-2 mb-2 transition-colors ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
        <span className="text-gray-400 font-mono text-lg">/</span>
        <input
          value={pattern}
          onChange={e => setPattern(e.target.value)}
          placeholder="Enter regex pattern…"
          className="flex-1 font-mono text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none placeholder-gray-300"
        />
        <span className="text-gray-400 font-mono text-lg">/</span>
        {/* Flag toggles */}
        <div className="flex gap-1 ml-1">
          {FLAGS.map(({ flag, label, title }) => (
            <button key={flag} onClick={() => toggleFlag(flag)} title={title}
              className={`w-7 h-7 rounded-md text-xs font-mono font-bold transition-all ${activeFlags.has(flag) ? 'bg-rose-500 text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={copyRegex} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm mb-4 px-1">
          <AlertCircle size={14} />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Stats */}
      {!error && (
        <div className="flex gap-4 mb-4 text-sm">
          <span className={`font-semibold ${matches.length ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </span>
          {matches.length > 0 && matches[0].length > 1 && (
            <span className="text-gray-400">{matches[0].length - 1} capture group{matches[0].length > 2 ? 's' : ''}</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Test string */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Test String</label>
          <textarea
            rows={10}
            value={testText}
            onChange={e => setTestText(e.target.value)}
            placeholder="Enter text to test against…"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 transition resize-none font-mono"
          />
        </div>

        {/* Highlighted output */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Match Highlights</label>
          <div className="w-full min-h-[14rem] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-sm font-mono leading-relaxed whitespace-pre-wrap break-all">
            {parts.map((p, i) =>
              p.type === 'text'
                ? <span key={i} className="text-gray-700 dark:text-gray-300">{p.value}</span>
                : <mark key={i} className={`rounded px-0.5 ${MATCH_COLORS[p.index % MATCH_COLORS.length]}`}>{p.value}</mark>
            )}
            {!testText && <span className="text-gray-300">Highlighted matches appear here…</span>}
          </div>
        </div>
      </div>

      {/* Match list */}
      {matches.length > 0 && (
        <div className="mt-5">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Match Details
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {matches.map((m, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 border ${MATCH_COLORS[i % MATCH_COLORS.length]} border-transparent`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold opacity-60">Match {i + 1} · index {m.index}</span>
                  <span className="text-xs opacity-60">{m[0].length} chars</span>
                </div>
                <p className="font-mono font-semibold text-sm break-all">"{m[0]}"</p>
                {m.length > 1 && (
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {[...m].slice(1).map((g, gi) => (
                      <span key={gi} className="text-xs opacity-70">
                        Group {gi + 1}: <span className="font-mono">{g ?? 'undefined'}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
