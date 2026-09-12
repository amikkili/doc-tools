import { useState, useEffect } from 'react'
import { ArrowLeft, Copy, Check, Upload, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import CryptoJS from 'crypto-js'
import toast from 'react-hot-toast'

const ALGOS = [
  { id: 'MD5',     fn: (s) => CryptoJS.MD5(s).toString() },
  { id: 'SHA-1',   fn: (s) => CryptoJS.SHA1(s).toString() },
  { id: 'SHA-256', fn: (s) => CryptoJS.SHA256(s).toString() },
  { id: 'SHA-512', fn: (s) => CryptoJS.SHA512(s).toString() },
  { id: 'SHA-3',   fn: (s) => CryptoJS.SHA3(s).toString() },
  { id: 'RIPEMD-160', fn: (s) => CryptoJS.RIPEMD160(s).toString() },
]

const HMAC_ALGOS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']

export default function HashGenerator() {
  const [input, setInput] = useState('Hello, DocCraft!')
  const [upper, setUpper] = useState(false)
  const [mode, setMode] = useState('text') // 'text' | 'hmac'
  const [hmacKey, setHmacKey] = useState('')
  const [hmacAlgo, setHmacAlgo] = useState('SHA-256')
  const [copied, setCopied] = useState(null)
  const [hashes, setHashes] = useState({})

  useEffect(() => {
    if (mode === 'hmac') {
      try {
        const fn = {
          'MD5': CryptoJS.HmacMD5,
          'SHA-1': CryptoJS.HmacSHA1,
          'SHA-256': CryptoJS.HmacSHA256,
          'SHA-512': CryptoJS.HmacSHA512,
        }[hmacAlgo]
        const h = fn(input, hmacKey).toString()
        setHashes({ [hmacAlgo]: h })
      } catch { setHashes({}) }
    } else {
      const result = {}
      ALGOS.forEach(a => { try { result[a.id] = a.fn(input) } catch {} })
      setHashes(result)
    }
  }, [input, upper, mode, hmacKey, hmacAlgo])

  const fmt = (h) => upper ? h.toUpperCase() : h.toLowerCase()

  const copy = (id, val) => {
    navigator.clipboard.writeText(fmt(val))
    setCopied(id); setTimeout(() => setCopied(null), 2000)
    toast.success(`${id} copied!`)
  }

  const onFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const wb = CryptoJS.lib.WordArray.create(e.target.result)
      const result = {}
      ALGOS.forEach(a => {
        try {
          const fns = { 'MD5': CryptoJS.MD5, 'SHA-1': CryptoJS.SHA1, 'SHA-256': CryptoJS.SHA256, 'SHA-512': CryptoJS.SHA512, 'SHA-3': CryptoJS.SHA3, 'RIPEMD-160': CryptoJS.RIPEMD160 }
          result[a.id] = fns[a.id](wb).toString()
        } catch {}
      })
      setHashes(result)
      setInput(`[File: ${file.name}]`)
      toast.success(`Hashed ${file.name}`)
    }
    reader.readAsArrayBuffer(file)
  }

  const displayedAlgos = mode === 'hmac' ? [hmacAlgo] : ALGOS.map(a => a.id)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl">#</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hash Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">MD5, SHA-1, SHA-256, SHA-512, SHA-3 and more</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 mb-5 w-fit">
        {['text', 'hmac'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${mode === m ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow' : 'text-gray-500 dark:text-gray-400'}`}>
            {m === 'text' ? 'Text / File' : 'HMAC'}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <textarea
            rows={4} value={input} onChange={e => setInput(e.target.value)}
            placeholder="Enter text to hash…"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none"
          />
          <button onClick={() => { setInput(''); setHashes({}) }}
            className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 transition-colors" title="Clear">
            <RefreshCw size={14} />
          </button>
        </div>

        {mode === 'hmac' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={hmacKey} onChange={e => setHmacKey(e.target.value)}
              placeholder="Secret key…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
            <div className="flex gap-2">
              {HMAC_ALGOS.map(a => (
                <button key={a} onClick={() => setHmacAlgo(a)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${hmacAlgo === a ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={upper} onChange={e => setUpper(e.target.checked)} className="rounded accent-emerald-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Uppercase output</span>
          </label>
          {mode === 'text' && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">
              <Upload size={14} />
              Hash a file
              <input type="file" className="hidden" onChange={e => onFile(e.target.files[0])} />
            </label>
          )}
        </div>
      </div>

      {/* Hash outputs */}
      <div className="space-y-3">
        {displayedAlgos.map(id => {
          const val = hashes[id]
          if (!val) return null
          return (
            <div key={id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{id}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300">{fmt(val).length} hex chars</span>
                  <button onClick={() => copy(id, val)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    {copied === id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <p className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{fmt(val)}</p>
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-400">
        {[
          ['MD5', '128-bit · Fast, not collision-safe'],
          ['SHA-256', '256-bit · Industry standard'],
          ['SHA-512', '512-bit · Highest security'],
        ].map(([name, desc]) => (
          <div key={name} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            <p className="font-bold text-gray-500 dark:text-gray-400 mb-0.5">{name}</p>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
