import { useState } from 'react'
import { ArrowLeft, Copy, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'sql-formatter'

const LANGUAGES = [
  { value: 'sql', label: 'Generic SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'tsql', label: 'T-SQL (MSSQL)' },
  { value: 'plsql', label: 'PL/SQL (Oracle)' },
  { value: 'bigquery', label: 'BigQuery' },
]

const SAMPLE = `SELECT u.id, u.name, u.email, p.plan_name, COUNT(o.id) AS order_count, SUM(o.total) AS total_spent FROM users u LEFT JOIN subscriptions s ON s.user_id = u.id LEFT JOIN plans p ON p.id = s.plan_id LEFT JOIN orders o ON o.user_id = u.id WHERE u.created_at >= '2024-01-01' AND u.status = 'active' GROUP BY u.id, u.name, u.email, p.plan_name HAVING SUM(o.total) > 100 ORDER BY total_spent DESC LIMIT 50;`

export default function SqlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [lang, setLang] = useState('sql')
  const [tabWidth, setTabWidth] = useState(2)
  const [keywordCase, setKeywordCase] = useState('upper')
  const [copied, setCopied] = useState(false)

  const formatSql = () => {
    if (!input.trim()) { toast.error('Paste SQL first'); return }
    try {
      const result = format(input, {
        language: lang,
        tabWidth,
        keywordCase,
        linesBetweenQueries: 2,
      })
      setOutput(result); setError('')
      toast.success('Formatted!')
    } catch (e) {
      setError(e.message); setOutput('')
      toast.error('Format failed')
    }
  }

  const minifySql = () => {
    if (!input.trim()) { toast.error('Paste SQL first'); return }
    const minified = input.replace(/\s+/g, ' ').trim()
    setOutput(minified); setError('')
    toast.success('Minified!')
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const ta = "w-full h-80 font-mono text-sm border rounded-xl p-4 focus:outline-none focus:ring-2 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">🗄️</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SQL Formatter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Format and minify SQL queries — MySQL, PostgreSQL, SQLite, T-SQL and more</p>
        </div>
      </div>

      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={formatSql} className="btn-primary text-sm py-2 px-4">Format</button>
        <button onClick={minifySql} className="btn-secondary text-sm py-2 px-4">Minify</button>
        <button onClick={() => setInput(SAMPLE)} className="btn-secondary text-sm py-2 px-4">Sample</button>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <select value={lang} onChange={e => setLang(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <select value={keywordCase} onChange={e => setKeywordCase(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
            <option value="preserve">preserve</option>
          </select>
          <select value={tabWidth} onChange={e => setTabWidth(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
        <button onClick={() => { setInput(''); setOutput(''); setError('') }}
          className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Input SQL</label>
          <textarea value={input} onChange={e => { setInput(e.target.value); setError('') }}
            placeholder="Paste SQL query here..."
            className={`${ta} ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-300'}`}
          />
          {error && <p className="text-xs text-red-500 mt-1 font-mono">{error}</p>}
        </div>
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Formatted SQL</label>
          <textarea readOnly value={output} placeholder="Formatted SQL appears here..."
            className={`${ta} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 focus:ring-0`}
          />
          {output && (
            <button onClick={copy}
              className="absolute top-8 right-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 transition-all">
              {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
