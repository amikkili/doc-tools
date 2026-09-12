import { useState } from 'react'
import axios from 'axios'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const COLOR = {
  green:  { ring: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  blue:   { ring: 'bg-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  yellow: { ring: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  red:    { ring: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
}

export default function ConversionQualityBadge({ file }) {
  const [loading, setLoading]   = useState(false)
  const [result,  setResult]    = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [ran, setRan]           = useState(false)

  const analyze = async () => {
    if (!file || loading) return
    setLoading(true)
    setRan(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post('/api/ml/conversion-quality', fd)
      setResult(res.data)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  // Auto-analyze on first file selection
  if (file && !ran && !loading) analyze()

  if (!file) return null

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
        <Loader2 size={15} className="animate-spin text-red-400" />
        Predicting conversion quality...
      </div>
    )
  }

  if (!result) return null

  const c = COLOR[result.color] ?? COLOR.blue

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden`}>
      {/* Summary row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Circular score */}
        <div className="relative w-12 h-12 shrink-0">
          <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke={result.color === 'green' ? '#22c55e' : result.color === 'blue' ? '#3b82f6' : result.color === 'yellow' ? '#eab308' : '#ef4444'}
              strokeWidth="3"
              strokeDasharray={`${(result.score / 100) * 94.2} 94.2`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${c.text}`}>
            {result.score}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${c.text}`}>
              Conversion Quality: {result.grade}
            </span>
            {result.is_scanned && (
              <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                Scanned PDF
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5 leading-snug">{result.recommendation}</p>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Breakdown */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2.5">
          {result.breakdown.map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-500">{item.score}/{item.max}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${c.ring}`}
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
            </div>
          ))}
          <p className="text-xs text-gray-400 pt-1">
            Analysed {result.total_pages} page{result.total_pages !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
