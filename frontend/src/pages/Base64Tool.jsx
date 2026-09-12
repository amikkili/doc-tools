import { useState } from 'react'
import { ArrowLeft, Copy, ArrowRightLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode')
  const [error, setError] = useState('')

  const process = () => {
    setError('')
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input))))
      }
    } catch {
      setError(mode === 'decode' ? 'Invalid Base64 string' : 'Encoding failed')
      setOutput('')
    }
  }

  const swap = () => {
    setInput(output)
    setOutput('')
    setMode(m => m === 'encode' ? 'decode' : 'encode')
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl">🔡</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base64 Encode / Decode</h1>
          <p className="text-gray-500 text-sm">Encode text to Base64 or decode Base64 back to text</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Mode toggle */}
        <div className="flex gap-2">
          {['encode','decode'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${mode===m ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {m}
            </button>
          ))}
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            {mode === 'encode' ? 'Plain Text' : 'Base64 String'}
          </label>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
            className="w-full h-36 font-mono text-sm border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
        </div>

        <div className="flex gap-3">
          <button onClick={process} className="btn-primary flex-1">{mode === 'encode' ? 'Encode' : 'Decode'}</button>
          <button onClick={swap} className="btn-secondary px-4 flex items-center gap-2"><ArrowRightLeft size={16} /> Swap</button>
        </div>

        {/* Output */}
        {(output || error) && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
              </label>
              {output && <button onClick={() => copy(output)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"><Copy size={12}/> Copy</button>}
            </div>
            {error ? (
              <p className="text-sm text-red-500 font-mono">{error}</p>
            ) : (
              <textarea readOnly value={output}
                className="w-full h-36 font-mono text-sm border border-gray-200 rounded-xl p-4 bg-gray-50 resize-none focus:outline-none" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
