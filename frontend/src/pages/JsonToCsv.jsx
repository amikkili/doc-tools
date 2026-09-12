import { useState } from 'react'
import { ArrowLeft, Copy, Check, Trash2, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function flattenObject(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(acc, flattenObject(val, fullKey))
    } else {
      acc[fullKey] = val
    }
    return acc
  }, {})
}

function toCsvCell(val) {
  if (val === null || val === undefined) return ''
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
  return str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

function jsonToCsv(jsonStr, flatten) {
  const raw = JSON.parse(jsonStr)
  const arr = Array.isArray(raw) ? raw : [raw]
  if (arr.length === 0) throw new Error('Array is empty')

  const rows = flatten ? arr.map(r => (typeof r === 'object' && r !== null ? flattenObject(r) : { value: r })) : arr
  const headers = [...new Set(rows.flatMap(r => Object.keys(r)))]
  const csvRows = rows.map(r => headers.map(h => toCsvCell(r[h])).join(','))
  return [headers.join(','), ...csvRows].join('\r\n')
}

const SAMPLE = `[
  { "id": 1, "name": "Alice", "email": "alice@example.com", "age": 30, "city": "New York" },
  { "id": 2, "name": "Bob", "email": "bob@example.com", "age": 25, "city": "London" },
  { "id": 3, "name": "Carol", "email": "carol@example.com", "age": 35, "city": "Tokyo" }
]`

export default function JsonToCsv() {
  const [input, setInput] = useState('')
  const [csv, setCsv] = useState('')
  const [error, setError] = useState('')
  const [flatten, setFlatten] = useState(true)
  const [copied, setCopied] = useState(false)
  const [preview, setPreview] = useState([])

  const convert = () => {
    if (!input.trim()) { toast.error('Paste JSON first'); return }
    try {
      const result = jsonToCsv(input, flatten)
      setCsv(result); setError('')

      // Build preview table (first 10 rows)
      const lines = result.split('\r\n')
      const headers = lines[0].split(',')
      const rows = lines.slice(1, 11).map(line => {
        // Simple CSV parse for preview
        const cells = []
        let current = '', inQ = false
        for (const ch of line) {
          if (ch === '"') inQ = !inQ
          else if (ch === ',' && !inQ) { cells.push(current); current = '' }
          else current += ch
        }
        cells.push(current)
        return cells
      })
      setPreview({ headers, rows })
      toast.success('Converted!')
    } catch (e) {
      setError(e.message); setCsv(''); setPreview([])
      toast.error('Conversion failed')
    }
  }

  const download = () => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'data.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const copy = () => {
    navigator.clipboard.writeText(csv)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl">📊</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">JSON to CSV</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Convert JSON arrays to CSV with optional nested object flattening</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={convert} className="btn-primary text-sm py-2 px-4">Convert to CSV</button>
        <button onClick={() => setInput(SAMPLE)} className="btn-secondary text-sm py-2 px-4">Sample</button>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none ml-auto">
          <input type="checkbox" checked={flatten} onChange={e => setFlatten(e.target.checked)}
            className="rounded" />
          Flatten nested objects
        </label>
        {csv && (
          <>
            <button onClick={copy} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5">
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} Copy
            </button>
            <button onClick={download} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5">
              <Download size={14} /> Download
            </button>
          </>
        )}
        <button onClick={() => { setInput(''); setCsv(''); setError(''); setPreview([]) }}
          className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Input JSON</label>
          <textarea value={input} onChange={e => { setInput(e.target.value); setError('') }}
            placeholder={`Paste a JSON array here:\n[\n  { "id": 1, "name": "Alice" },\n  { "id": 2, "name": "Bob" }\n]`}
            className={`w-full h-64 font-mono text-sm border rounded-xl p-4 focus:outline-none focus:ring-2 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
              error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 dark:border-gray-700 focus:ring-emerald-300'
            }`}
          />
          {error && <p className="text-xs text-red-500 mt-1 font-mono">{error}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Output CSV</label>
          <textarea readOnly value={csv} placeholder="CSV output appears here..."
            className="w-full h-64 font-mono text-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:outline-none resize-none bg-gray-50 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Preview table */}
      {preview.headers && preview.headers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Preview {preview.rows.length < 10 ? '' : '(first 10 rows)'}
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {preview.headers.map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {preview.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-gray-700 dark:text-gray-300 max-w-xs truncate">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
