import { useState } from 'react'
import { ArrowLeft, Copy, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function JsonBeautifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState(2)

  const beautify = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, indent))
      setError('')
    } catch (e) {
      setError(e.message); setOutput('')
    }
  }

  const minify = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input)))
      setError('')
    } catch (e) {
      setError(e.message); setOutput('')
    }
  }

  const validate = () => {
    try {
      JSON.parse(input)
      toast.success('Valid JSON!')
      setError('')
    } catch (e) {
      setError(e.message)
      toast.error('Invalid JSON')
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const textareaBase = "w-full h-96 font-mono text-sm border rounded-xl p-4 focus:outline-none focus:ring-2 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-mono font-bold text-gray-700 dark:text-gray-200">{'{ }'}</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">JSON Beautifier</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Format, validate and minify JSON</p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={beautify} className="btn-primary text-sm py-2 px-4">Beautify</button>
        <button onClick={minify} className="btn-secondary text-sm py-2 px-4">Minify</button>
        <button onClick={validate} className="btn-secondary text-sm py-2 px-4">Validate</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-600 dark:text-gray-400">Indent:</label>
          <select value={indent} onChange={e => setIndent(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
            {[2,4,8].map(n => <option key={n} value={n}>{n} spaces</option>)}
          </select>
        </div>
        <button onClick={() => { setInput(''); setOutput(''); setError('') }}
          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Input JSON</label>
          <textarea
            value={input} onChange={e => setInput(e.target.value)}
            placeholder={'Paste your JSON here...\n\n{\n  "name": "DocCraft",\n  "version": 1\n}'}
            className={`${textareaBase} ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 dark:border-gray-700 focus:ring-red-300'}`}
          />
          {error && <p className="text-xs text-red-500 mt-1 font-mono">{error}</p>}
        </div>
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Output</label>
          <textarea readOnly value={output}
            placeholder="Formatted JSON will appear here..."
            className={`${textareaBase} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 focus:ring-0`}
          />
          {output && (
            <button onClick={copy}
              className="absolute top-8 right-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:shadow-sm transition-all">
              {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
