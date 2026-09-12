import { useState, useMemo } from 'react'
import { ArrowLeft, Copy, Check, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')          // strip /* comments */
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')      // compact around syntax chars
    .replace(/\s+/g, ' ')                       // collapse whitespace
    .replace(/;\s*}/g, '}')                     // remove last ; in block
    .replace(/\s*{\s*/g, '{')
    .replace(/}\s*/g, '} ')
    .replace(/  +/g, ' ')
    .trim()
}

function minifyJs(js) {
  return js
    .replace(/\/\/[^\n]*/g, '')                // strip // comments
    .replace(/\/\*[\s\S]*?\*\//g, '')          // strip /* */ comments
    .replace(/\n\s*\n/g, '\n')                 // collapse blank lines
    .replace(/[ \t]+/g, ' ')                   // collapse spaces/tabs
    .replace(/ *([\+\-\*\/=<>!&|,;:\?{}\[\]()]) */g, '$1')  // compact around operators
    .replace(/\n+/g, '\n')
    .trim()
}

function beautifyCss(css) {
  let indent = 0
  const lines = []
  css.replace(/\/\*[\s\S]*?\*\//g,'').split('').forEach(ch => {
    if (ch==='{') { lines.push(' {'); indent++; lines.push('\n' + '  '.repeat(indent)) }
    else if (ch==='}') { indent=Math.max(0,indent-1); lines.push('\n'+'  '.repeat(indent)+'}'); lines.push('\n'+'  '.repeat(indent)) }
    else if (ch===';') { lines.push(';'); lines.push('\n'+'  '.repeat(indent)) }
    else lines.push(ch)
  })
  return lines.join('').replace(/\n +\n/g,'\n').trim()
}

const CSS_SAMPLE = `/* Main styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.button {
  display: inline-flex;
  align-items: center;
  background-color: #ef4444;
  color: #ffffff;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background-color 200ms;
}

.button:hover {
  background-color: #dc2626;
}`

const JS_SAMPLE = `// Utility functions
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/* Format bytes to human-readable */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}`

export default function CssJsMinifier() {
  const [lang, setLang] = useState('css')
  const [action, setAction] = useState('minify')
  const [input, setInput] = useState(CSS_SAMPLE)
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => {
    if (!input.trim()) return ''
    try {
      if (lang === 'css') return action === 'minify' ? minifyCss(input) : beautifyCss(input)
      return minifyJs(input)
    } catch { return input }
  }, [input, lang, action])

  const savings = input.length > 0 ? Math.round((1 - output.length / input.length) * 100) : 0

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
    toast.success('Copied!')
  }

  const download = () => {
    const ext = lang === 'css' ? 'css' : 'js'
    const blob = new Blob([output], {type:'text/plain'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `minified.${ext}`; a.click()
  }

  const switchLang = (l) => {
    setLang(l)
    setInput(l === 'css' ? CSS_SAMPLE : JS_SAMPLE)
    setAction('minify')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center font-bold text-amber-600 text-sm">{'{}'}</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CSS / JS Minifier</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Minify & beautify CSS and JavaScript · See size savings</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {['css','js'].map(l=>(
            <button key={l} onClick={()=>switchLang(l)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold uppercase transition-all ${lang===l?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow':'text-gray-500 dark:text-gray-400'}`}>
              {l}
            </button>
          ))}
        </div>
        {lang==='css' && (
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            {['minify','beautify'].map(a=>(
              <button key={a} onClick={()=>setAction(a)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${action===a?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow':'text-gray-500 dark:text-gray-400'}`}>
                {a}
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        {input && (
          <div className="flex items-center gap-3 ml-auto text-sm">
            <span className="text-gray-400">{input.length} → {output.length} chars</span>
            {savings > 0 && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                −{savings}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Input</span>
            <button onClick={()=>setInput('')} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
          </div>
          <textarea rows={18} value={input} onChange={e=>setInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output</span>
            <div className="flex gap-2">
              <button onClick={download}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-amber-300 transition-all">
                <Download size={11}/> .{lang}
              </button>
              <button onClick={copy}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors">
                {copied?<Check size={11}/>:<Copy size={11}/>} Copy
              </button>
            </div>
          </div>
          <textarea rows={18} value={output} readOnly
            className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10 text-gray-900 dark:text-gray-100 text-xs font-mono focus:outline-none resize-none cursor-text"
          />
        </div>
      </div>
    </div>
  )
}
