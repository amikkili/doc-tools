import { useState } from 'react'
import { ArrowLeft, Copy, ArrowRightLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function UrlEncodeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode')
  const [error, setError] = useState('')

  const process = () => {
    setError('')
    try {
      setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input))
    } catch {
      setError('Invalid URL encoded string')
      setOutput('')
    }
  }

  const swap = () => {
    setInput(output)
    setOutput('')
    setMode(m => m === 'encode' ? 'decode' : 'encode')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center text-2xl">🔗</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">URL Encode / Decode</h1>
          <p className="text-gray-500 text-sm">Percent-encode URLs or decode them back</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex gap-2">
          {['encode','decode'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${mode===m ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {m}
            </button>
          ))}
        </div>

        <textarea value={input} onChange={e => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Enter URL or text to encode...\ne.g. https://example.com/search?q=hello world' : 'Enter encoded URL to decode...\ne.g. https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world'}
          className="w-full h-36 font-mono text-sm border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />

        <div className="flex gap-3">
          <button onClick={process} className="btn-primary flex-1">{mode === 'encode' ? 'Encode' : 'Decode'}</button>
          <button onClick={swap} className="btn-secondary px-4 flex items-center gap-2"><ArrowRightLeft size={16} /> Swap</button>
        </div>

        {(output || error) && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</label>
              {output && <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!') }}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"><Copy size={12}/> Copy</button>}
            </div>
            {error ? <p className="text-sm text-red-500 font-mono">{error}</p> :
              <textarea readOnly value={output}
                className="w-full h-36 font-mono text-sm border border-gray-200 rounded-xl p-4 bg-gray-50 resize-none focus:outline-none" />
            }
          </div>
        )}
      </div>
    </div>
  )
}
