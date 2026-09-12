import { useState, useMemo } from 'react'
import { ArrowLeft, Copy, Check, ArrowRightLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function encodeBasic(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function encodeFull(text) {
  return Array.from(text).map(ch => {
    const cp = ch.codePointAt(0)
    if (cp > 127) return `&#x${cp.toString(16).toUpperCase()};`
    if (ch === '&') return '&amp;'
    if (ch === '<') return '&lt;'
    if (ch === '>') return '&gt;'
    if (ch === '"') return '&quot;'
    if (ch === "'") return '&#x27;'
    return ch
  }).join('')
}

function decodeEntities(text) {
  const div = document.createElement('div')
  div.innerHTML = text
  return div.textContent || div.innerText || ''
}

const NAMED_ENTITIES = [
  ['&amp;','&'],['&lt;','<'],['&gt;','>'],['&quot;','"'],['&apos;',"'"],
  ['&nbsp;',' '],['&copy;','©'],['&reg;','®'],['&trade;','™'],
  ['&mdash;','—'],['&ndash;','–'],['&hellip;','…'],['&euro;','€'],
  ['&pound;','£'],['&yen;','¥'],['&cent;','¢'],['&deg;','°'],
  ['&plusmn;','±'],['&times;','×'],['&divide;','÷'],['&frac12;','½'],
  ['&hearts;','♥'],['&spades;','♠'],['&clubs;','♣'],['&diams;','♦'],
  ['&larr;','←'],['&rarr;','→'],['&uarr;','↑'],['&darr;','↓'],
]

function CopyBtn({ value }) {
  const [c,setC]=useState(false)
  return (
    <button onClick={()=>{navigator.clipboard.writeText(value);setC(true);setTimeout(()=>setC(false),1500);toast.success('Copied!')}}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors">
      {c?<Check size={12}/>:<Copy size={12}/>} Copy
    </button>
  )
}

export default function HtmlEntityTool() {
  const [mode, setMode] = useState('encode') // encode | decode
  const [encodeMode, setEncodeMode] = useState('basic') // basic | full
  const [input, setInput] = useState('<p class="hello">Hello & "World" © 2024</p>')

  const output = useMemo(() => {
    if (!input) return ''
    if (mode === 'encode') return encodeMode === 'full' ? encodeFull(input) : encodeBasic(input)
    return decodeEntities(input)
  }, [input, mode, encodeMode])

  const swap = () => {
    setInput(output)
    setMode(m => m === 'encode' ? 'decode' : 'encode')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 text-lg">&amp;</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">HTML Entity Encoder / Decoder</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Encode special characters · Decode HTML entities · Named entity reference</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {['encode','decode'].map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${mode===m?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow':'text-gray-500 dark:text-gray-400'}`}>
              {m}
            </button>
          ))}
        </div>

        {mode==='encode' && (
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            {[['basic','Basic (&lt; &amp; &gt;)'],['full','Full (all non-ASCII)']].map(([k,l])=>(
              <button key={k} onClick={()=>setEncodeMode(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${encodeMode===k?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow':'text-gray-500 dark:text-gray-400'}`}>
                {l}
              </button>
            ))}
          </div>
        )}

        <button onClick={swap}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:border-indigo-300 transition-all ml-auto">
          <ArrowRightLeft size={14}/> Swap
        </button>
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input</span>
            <span className="text-xs text-gray-400">{input.length} chars</span>
          </div>
          <textarea
            rows={10} value={input} onChange={e=>setInput(e.target.value)}
            placeholder={mode==='encode' ? '<p>Hello & "World" © 2024</p>' : '&lt;p&gt;Hello &amp; World&lt;/p&gt;'}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output</span>
            <CopyBtn value={output}/>
          </div>
          <textarea
            rows={10} value={output} readOnly
            className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none resize-none cursor-text"
          />
        </div>
      </div>

      {/* Named entity reference */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Common Named Entities</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {NAMED_ENTITIES.map(([entity, char]) => (
            <button key={entity} onClick={()=>setInput(i=>i+entity)} title={`Insert ${entity}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm group">
              <span className="w-6 text-center font-semibold text-gray-700 dark:text-gray-300">{char}</span>
              <code className="text-xs text-gray-400 group-hover:text-indigo-500 font-mono">{entity}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
