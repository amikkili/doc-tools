import { useState } from 'react'
import { ArrowLeft, Copy, Check, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return JSON.parse(atob(str))
}

function decodeJwt(token) {
  const parts = token.trim().split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT: expected 3 dot-separated parts')
  return {
    header: b64urlDecode(parts[0]),
    payload: b64urlDecode(parts[1]),
    signature: parts[2],
    raw: parts,
  }
}

function formatTimestamp(ts) {
  try {
    const d = new Date(ts * 1000)
    return `${d.toLocaleString()} (${new Date().toISOString().slice(0,10) === d.toISOString().slice(0,10) ? 'today' : Math.round((d - new Date()) / 86400000) + ' days'})`
  } catch { return String(ts) }
}

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export default function JwtDebugger() {
  const [token, setToken] = useState('')
  const [decoded, setDecoded] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(null)

  const decode = (t = token) => {
    const val = t.trim()
    if (!val) { toast.error('Paste a JWT first'); return }
    try {
      setDecoded(decodeJwt(val)); setError('')
    } catch (e) {
      setError(e.message); setDecoded(null)
    }
  }

  const copyPart = (text, label) => {
    navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text)
    setCopied(label); setTimeout(() => setCopied(null), 2000)
    toast.success('Copied!')
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = decoded?.payload?.exp
  const iat = decoded?.payload?.iat
  const nbf = decoded?.payload?.nbf
  const isExpired = exp && now > exp
  const isNotYetValid = nbf && now < nbf

  const SectionCard = ({ title, color, data, label, partIndex }) => (
    <div className={`rounded-xl border-2 ${color} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider opacity-60">{title}</span>
          {partIndex !== undefined && decoded?.raw && (
            <p className="text-xs font-mono opacity-50 mt-0.5 truncate max-w-48">{decoded.raw[partIndex].slice(0, 32)}…</p>
          )}
        </div>
        <button onClick={() => copyPart(data, label)}
          className="text-current opacity-40 hover:opacity-80 transition-opacity">
          {copied === label ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">🔑</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">JWT Debugger</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Decode and inspect JSON Web Tokens — header, payload, expiry</p>
        </div>
      </div>

      {/* Token input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">JWT Token</label>
        <textarea
          value={token}
          onChange={e => {
            setToken(e.target.value)
            if (e.target.value.trim()) decode(e.target.value)
            else { setDecoded(null); setError('') }
          }}
          placeholder="Paste JWT here: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
          rows={3}
          className={`w-full font-mono text-sm border rounded-xl p-4 focus:outline-none focus:ring-2 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
            error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-300'
          }`}
        />
        {error && <p className="text-xs text-red-500 mt-1 font-mono">{error}</p>}
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => decode()} className="btn-primary text-sm py-2 px-4">Decode</button>
        <button onClick={() => { setToken(SAMPLE_JWT); decode(SAMPLE_JWT) }} className="btn-secondary text-sm py-2 px-4">Load Sample</button>
        <button onClick={() => { setToken(''); setDecoded(null); setError('') }}
          className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto">
          <Trash2 size={16} />
        </button>
      </div>

      {decoded && (
        <div className="space-y-4">
          {/* Expiry status */}
          {(exp || isNotYetValid) && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
              isExpired || isNotYetValid
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
            }`}>
              {isExpired || isNotYetValid
                ? <AlertTriangle size={15} />
                : <CheckCircle size={15} />}
              {isExpired && `Token expired: ${formatTimestamp(exp)}`}
              {isNotYetValid && `Token not yet valid (nbf): ${formatTimestamp(nbf)}`}
              {!isExpired && !isNotYetValid && exp && `Token valid — expires ${formatTimestamp(exp)}`}
            </div>
          )}

          {/* Timestamp info */}
          {(iat || exp || nbf) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {iat && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <p className="text-gray-400 uppercase font-semibold text-[10px] mb-1">Issued At</p>
                <p className="font-mono text-gray-700 dark:text-gray-300">{new Date(iat * 1000).toLocaleString()}</p>
              </div>}
              {exp && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <p className="text-gray-400 uppercase font-semibold text-[10px] mb-1">Expires At</p>
                <p className={`font-mono ${isExpired ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{new Date(exp * 1000).toLocaleString()}</p>
              </div>}
              {nbf && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <p className="text-gray-400 uppercase font-semibold text-[10px] mb-1">Not Before</p>
                <p className="font-mono text-gray-700 dark:text-gray-300">{new Date(nbf * 1000).toLocaleString()}</p>
              </div>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard
              title="Header — Algorithm & Type"
              color="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100"
              data={decoded.header} label="header" partIndex={0}
            />
            <SectionCard
              title="Payload — Claims"
              color="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10 text-purple-900 dark:text-purple-100"
              data={decoded.payload} label="payload" partIndex={1}
            />
          </div>

          <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Signature (not verified — client-side only)</span>
              <button onClick={() => copyPart(decoded.signature, 'sig')}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                {copied === 'sig' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">{decoded.signature}</p>
          </div>

          <p className="text-xs text-gray-400 text-center">
            ⚠️ Signature verification requires the secret key and happens server-side. Never share your signing keys.
          </p>
        </div>
      )}
    </div>
  )
}
