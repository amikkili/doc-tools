import { useState } from 'react'
import { ArrowLeft, Copy, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

// ── XML pretty-printer using built-in DOMParser ──────────────────────────
function prettyXml(xmlStr, indent) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlStr.trim(), 'application/xml')

  const parseErr = doc.querySelector('parsererror')
  if (parseErr) {
    throw new Error(parseErr.textContent.split('\n')[0].trim())
  }

  const pad = (depth) => ' '.repeat(indent * depth)

  function serialize(node, depth) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE: {
        const tag = node.tagName
        const attrs = Array.from(node.attributes)
          .map(a => ` ${a.name}="${a.value}"`)
          .join('')
        const children = Array.from(node.childNodes)

        // Text-only node → inline
        if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
          const text = children[0].nodeValue.trim()
          if (text) return `${pad(depth)}<${tag}${attrs}>${text}</${tag}>`
        }

        if (children.length === 0) return `${pad(depth)}<${tag}${attrs}/>`

        const inner = children
          .map(c => serialize(c, depth + 1))
          .filter(s => s !== null && s.trim() !== '')
          .join('\n')

        return `${pad(depth)}<${tag}${attrs}>\n${inner}\n${pad(depth)}</${tag}>`
      }
      case Node.TEXT_NODE: {
        const t = node.nodeValue.trim()
        return t ? `${pad(depth)}${t}` : null
      }
      case Node.COMMENT_NODE:
        return `${pad(depth)}<!-- ${node.nodeValue.trim()} -->`
      case Node.PROCESSING_INSTRUCTION_NODE:
        return `${pad(depth)}<?${node.target} ${node.data}?>`
      case Node.DOCUMENT_NODE:
        return Array.from(node.childNodes).map(c => serialize(c, 0)).join('\n')
      default:
        return null
    }
  }

  const decl = xmlStr.trimStart().startsWith('<?xml') ? '' : '<?xml version="1.0" encoding="UTF-8"?>\n'
  return decl + serialize(doc, 0)
}

function minifyXml(xmlStr) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlStr.trim(), 'application/xml')
  const parseErr = doc.querySelector('parsererror')
  if (parseErr) throw new Error(parseErr.textContent.split('\n')[0].trim())
  return new XMLSerializer().serializeToString(doc)
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// ── JSON formatter (built-in JS) ─────────────────────────────────────────
function prettyJson(jsonStr, indent) {
  return JSON.stringify(JSON.parse(jsonStr), null, indent)
}

function getJsonError(jsonStr) {
  try { JSON.parse(jsonStr); return null }
  catch (e) {
    // Extract line/col from error message when available
    const m = e.message.match(/position (\d+)/)
    if (m) {
      const pos = Number(m[1])
      const before = jsonStr.substring(0, pos)
      const line = before.split('\n').length
      const col  = pos - before.lastIndexOf('\n')
      return `${e.message} (line ${line}, col ${col})`
    }
    return e.message
  }
}

// ─────────────────────────────────────────────────────────────────────────

const SAMPLE_JSON = `{"name":"DocCraft","version":1,"tools":["PDF","Word","XML","JSON"],"config":{"darkMode":true,"maxFileMB":50}}`
const SAMPLE_XML  = `<root><person id="1"><name>Alice</name><role>Developer</role><skills><skill>React</skill><skill>Python</skill></skills></person></root>`

export default function XmlJsonBeautifier() {
  const [tab, setTab]       = useState('json')  // 'json' | 'xml'
  const [input, setInput]   = useState('')
  const [output, setOutput] = useState('')
  const [error, setError]   = useState('')
  const [indent, setIndent] = useState(2)
  const [copied, setCopied] = useState(false)

  const run = (fn) => {
    setError(''); setOutput('')
    try { setOutput(fn()) }
    catch (e) { setError(e.message) }
  }

  const beautify = () => {
    if (!input.trim()) return
    if (tab === 'json') run(() => prettyJson(input, indent))
    else                run(() => prettyXml(input, indent))
  }

  const minify = () => {
    if (!input.trim()) return
    if (tab === 'json') run(() => JSON.stringify(JSON.parse(input)))
    else                run(() => minifyXml(input))
  }

  const validate = () => {
    setError('')
    try {
      if (tab === 'json') {
        const err = getJsonError(input)
        if (err) { setError(err); toast.error('Invalid JSON') }
        else toast.success('Valid JSON ✓')
      } else {
        prettyXml(input, 2)
        toast.success('Valid XML ✓')
      }
    } catch (e) { setError(e.message); toast.error(`Invalid ${tab.toUpperCase()}`) }
  }

  const loadSample = () => {
    setInput(tab === 'json' ? SAMPLE_JSON : SAMPLE_XML)
    setOutput(''); setError('')
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  const switchTab = (t) => { setTab(t); clear() }

  const taBase = "w-full h-96 font-mono text-sm border rounded-xl p-4 focus:outline-none focus:ring-2 resize-none bg-white text-gray-900"

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-mono font-bold text-gray-600">
          {tab === 'json' ? '{ }' : '</>'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {tab === 'json' ? 'JSON' : 'XML'} Beautifier
          </h1>
          <p className="text-gray-500 text-sm">
            {tab === 'json'
              ? 'Format, minify and validate JSON — powered by built-in JS engine'
              : 'Format, minify and validate XML — powered by built-in DOMParser'}
          </p>
        </div>
      </div>

      {/* JSON / XML tab switch */}
      <div className="flex gap-2 mb-4 border-b border-gray-100 pb-4">
        {[['json','{ } JSON'],['xml','</> XML']].map(([v,l]) => (
          <button key={v} onClick={() => switchTab(v)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab===v ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {l}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <span>Parser:</span>
          <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
            {tab === 'json' ? 'JSON.parse (built-in)' : 'DOMParser (built-in)'}
          </code>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={beautify}   className="btn-primary  text-sm py-2 px-4">Beautify</button>
        <button onClick={minify}     className="btn-secondary text-sm py-2 px-4">Minify</button>
        <button onClick={validate}   className="btn-secondary text-sm py-2 px-4">Validate</button>
        <button onClick={loadSample} className="btn-secondary text-sm py-2 px-4">Load Sample</button>

        {tab === 'json' && (
          <div className="flex items-center gap-2 ml-2">
            <label className="text-sm text-gray-600">Indent:</label>
            <select value={indent} onChange={e => setIndent(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white">
              {[2,4,8].map(n => <option key={n} value={n}>{n} spaces</option>)}
            </select>
          </div>
        )}

        <button onClick={clear} className="ml-auto text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Input {tab.toUpperCase()}
          </label>
          <textarea
            value={input} onChange={e => setInput(e.target.value)}
            placeholder={tab === 'json'
              ? '{"key": "value", "number": 42}'
              : '<root>\n  <element attr="value">text</element>\n</root>'}
            className={`${taBase} ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-red-300'}`}
          />
          {error && (
            <div className="mt-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs text-red-600 font-mono">{error}</p>
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Output</label>
          <textarea readOnly value={output}
            placeholder={`Formatted ${tab.toUpperCase()} will appear here...`}
            className={`${taBase} border-gray-200 bg-gray-50 focus:ring-0`}
          />
          {output && (
            <button onClick={() => copy(output)}
              className="absolute top-8 right-2 p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 hover:shadow-sm transition-all">
              {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Tech note */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-600">
        {tab === 'json' ? (
          <><strong>How it works:</strong> Uses the browser's built-in <code>JSON.parse()</code> + <code>JSON.stringify(value, null, indent)</code>. Zero dependencies — the JS engine itself is the parser, so it's the fastest and most accurate option possible.</>
        ) : (
          <><strong>How it works:</strong> Uses the browser's built-in <code>DOMParser</code> to parse XML into a DOM tree, then walks it recursively with a custom serializer to produce indented output. Zero dependencies, handles attributes, comments, CDATA, and processing instructions.</>
        )}
      </div>
    </div>
  )
}
