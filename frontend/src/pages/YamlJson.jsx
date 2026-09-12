import { useState } from 'react'
import { ArrowLeft, Copy, Check, Trash2, ArrowLeftRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { load as yamlLoad, dump as yamlDump } from 'js-yaml'

const SAMPLE_JSON = `{
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": false
  },
  "database": {
    "engine": "postgres",
    "name": "mydb",
    "pool": 5
  },
  "tags": ["web", "api", "v2"],
  "debug": true
}`

const SAMPLE_YAML = `server:
  host: localhost
  port: 8080
  ssl: false
database:
  engine: postgres
  name: mydb
  pool: 5
tags:
  - web
  - api
  - v2
debug: true`

export default function YamlJson() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [leftLabel, setLeftLabel] = useState('YAML')
  const [rightLabel, setRightLabel] = useState('JSON')
  const [error, setError] = useState('')
  const [copiedLeft, setCopiedLeft] = useState(false)
  const [copiedRight, setCopiedRight] = useState(false)

  const isYamlToJson = leftLabel === 'YAML'

  const convert = () => {
    if (!left.trim()) { toast.error(`Paste ${leftLabel} first`); return }
    setError('')
    try {
      if (isYamlToJson) {
        const obj = yamlLoad(left)
        setRight(JSON.stringify(obj, null, 2))
      } else {
        const obj = JSON.parse(left)
        setRight(yamlDump(obj, { indent: 2, lineWidth: 100 }))
      }
      toast.success('Converted!')
    } catch (e) {
      setError(e.message)
      setRight('')
      toast.error('Conversion failed')
    }
  }

  const swap = () => {
    setLeft(right); setRight(left)
    setLeftLabel(rightLabel); setRightLabel(leftLabel)
    setError('')
  }

  const loadSample = () => {
    if (isYamlToJson) { setLeft(SAMPLE_YAML); setRight('') }
    else { setLeft(SAMPLE_JSON); setRight('') }
    setError('')
  }

  const copyLeft = () => {
    navigator.clipboard.writeText(left)
    setCopiedLeft(true); setTimeout(() => setCopiedLeft(false), 2000)
  }
  const copyRight = () => {
    navigator.clipboard.writeText(right)
    setCopiedRight(true); setTimeout(() => setCopiedRight(false), 2000)
    toast.success('Copied!')
  }

  const ta = "w-full h-96 font-mono text-sm border rounded-xl p-4 focus:outline-none focus:ring-2 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  const labelColor = { YAML: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', JSON: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">🔄</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">YAML ↔ JSON Converter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Convert between YAML and JSON formats</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={convert} className="btn-primary text-sm py-2 px-4">Convert →</button>
        <button onClick={swap} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5">
          <ArrowLeftRight size={14} /> Swap
        </button>
        <button onClick={loadSample} className="btn-secondary text-sm py-2 px-4">Sample</button>
        <button onClick={() => { setLeft(''); setRight(''); setError('') }}
          className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto">
          <Trash2 size={16} />
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${labelColor[leftLabel]}`}>{leftLabel}</span>
            <button onClick={copyLeft} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded transition-colors">
              {copiedLeft ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            </button>
          </div>
          <textarea value={left} onChange={e => { setLeft(e.target.value); setError('') }}
            placeholder={`Paste ${leftLabel} here...`}
            className={`${ta} ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 dark:border-gray-700 focus:ring-purple-300'}`}
          />
        </div>
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${labelColor[rightLabel]}`}>{rightLabel}</span>
            {right && (
              <button onClick={copyRight} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded transition-colors">
                {copiedRight ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </button>
            )}
          </div>
          <textarea readOnly value={right} placeholder={`${rightLabel} output appears here...`}
            className={`${ta} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 focus:ring-0`}
          />
        </div>
      </div>
    </div>
  )
}
