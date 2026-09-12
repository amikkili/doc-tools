import { useState, useCallback } from 'react'
import { ArrowLeft, Copy, Check, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function parseError(jsonStr, err) {
  const match = err.message.match(/position (\d+)/)
  if (!match) return { message: err.message }
  const pos = parseInt(match[1])
  const before = jsonStr.slice(0, pos)
  const lines = before.split('\n')
  return { message: err.message, line: lines.length, col: lines[lines.length - 1].length + 1 }
}

const SAMPLE = `{
  "name": "DocCraft",
  "version": "1.0",
  "tools": ["PDF", "JSON", "YAML"],
  "active": true,
  "meta": { "author": "dev", "year": 2024 }
}`

export default function JsonValidator() {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState(null) // null | 'valid' | 'invalid'
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState(2)

  const validate = useCallback(() => {
    if (!input.trim()) { toast.error('Paste some JSON first'); return }
    try {
      JSON.parse(input)
      setStatus('valid'); setError(null)
    } catch (e) {
      setStatus('invalid'); setError(parseError(input, e))
    }
  }, [input])

  const beautify = () => {
    try {
      setInput(JSON.stringify(JSON.parse(input), null, indent))
      setStatus('valid'); setError(null)
    } catch (e) { setStatus('invalid'); setError(parseError(input, e)) }
  }

  const minify = () => {
    try {
      setInput(JSON.stringify(JSON.parse(input)))
      setStatus('valid'); setError(null)
    } catch (e) { setStatus('invalid'); setError(parseError(input, e)) }
  }

  const copy = () => {
    navigator.clipboard.writeText(input)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const clear = () => { setInput(''); setStatus(null); setError(null) }

  const borderColor =
    status === 'valid' ? 'border-green-400 focus:ring-green-300' :
    status === 'invalid' ? 'border-red-400 focus:ring-red-300' :
    'border-gray-200 dark:border-gray-700 focus:ring-red-300'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">✅</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">JSON Validator</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Validate JSON with exact error location, beautify and minify</p>
        </div>
      </div>

      {/* Status banner */}
      {status && (
        <div className={`flex items-start gap-3 mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${
          status === 'valid'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
        }`}>
          {status === 'valid'
            ? <><CheckCircle size={16} className="mt-0.5 shrink-0" /><span>Valid JSON</span></>
            : <><XCircle size={16} className="mt-0.5 shrink-0" />
                <span>
                  {error?.message}
                  {error?.line && <span className="ml-2 font-normal opacity-75">— Line {error.line}, Column {error.col}</span>}
                </span>
              </>
          }
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={validate} className="btn-primary text-sm py-2 px-4">Validate</button>
        <button onClick={beautify} className="btn-secondary text-sm py-2 px-4">Beautify</button>
        <button onClick={minify} className="btn-secondary text-sm py-2 px-4">Minify</button>
        <button onClick={() => setInput(SAMPLE)} className="btn-secondary text-sm py-2 px-4">Sample</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-500 dark:text-gray-400">Indent:</label>
          <select value={indent} onChange={e => setIndent(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
          </select>
        </div>
        <button onClick={copy} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} Copy
        </button>
        <button onClick={clear} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
          <Trash2 size={16} />
        </button>
      </div>

      <textarea
        value={input}
        onChange={e => { setInput(e.target.value); setStatus(null); setError(null) }}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) validate() }}
        placeholder={'Paste JSON here and click Validate (or press Ctrl+Enter)...\n\n{\n  "key": "value"\n}'}
        className={`w-full h-96 font-mono text-sm border rounded-xl p-4 focus:outline-none focus:ring-2 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${borderColor}`}
      />
      <p className="text-xs text-gray-400 mt-1">Tip: Ctrl+Enter to validate</p>
    </div>
  )
}
