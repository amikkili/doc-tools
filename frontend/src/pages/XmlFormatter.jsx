import { useState } from 'react'
import { ArrowLeft, Copy, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function serializeNode(node, indentSize, level) {
  const pad = ' '.repeat(indentSize * level)
  const childPad = ' '.repeat(indentSize * (level + 1))

  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent.trim()
    return t ? t : ''
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.textContent}-->`
  }
  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    return `${pad}<?${node.target} ${node.data}?>`
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName
  const attrs = Array.from(node.attributes).map(a => ` ${a.name}="${a.value}"`).join('')
  const childNodes = Array.from(node.childNodes)

  if (childNodes.length === 0) return `${pad}<${tag}${attrs}/>`

  const childTexts = childNodes.filter(c => c.nodeType === Node.TEXT_NODE && c.textContent.trim())
  const childElements = childNodes.filter(c => c.nodeType === Node.ELEMENT_NODE)

  // Single text child → inline
  if (childTexts.length === 1 && childElements.length === 0) {
    return `${pad}<${tag}${attrs}>${childTexts[0].textContent.trim()}</${tag}>`
  }

  const children = childNodes
    .map(c => {
      const s = serializeNode(c, indentSize, level + 1)
      return s ? (c.nodeType === Node.ELEMENT_NODE || c.nodeType === Node.COMMENT_NODE ? s : childPad + s) : ''
    })
    .filter(Boolean)

  return `${pad}<${tag}${attrs}>\n${children.join('\n')}\n${pad}</${tag}>`
}

function beautifyXml(xml, indentSize) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml.trim(), 'text/xml')
  const err = doc.querySelector('parsererror')
  if (err) {
    const msg = err.textContent.replace(/\s+/g, ' ').trim().slice(0, 200)
    throw new Error(msg)
  }

  const header = '<?xml version="1.0" encoding="UTF-8"?>'
  const body = Array.from(doc.childNodes)
    .map(n => serializeNode(n, indentSize, 0))
    .filter(Boolean)
    .join('\n')

  return header + '\n' + body
}

function minifyXml(xml) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml.trim(), 'text/xml')
  const err = doc.querySelector('parsererror')
  if (err) throw new Error('Invalid XML')
  return new XMLSerializer().serializeToString(doc).replace(/>\s+</g, '><').trim()
}

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
    <price>12.99</price>
  </book>
  <book category="science">
    <title lang="en">A Brief History of Time</title>
    <author>Stephen Hawking</author>
    <year>1988</year>
    <price>15.99</price>
  </book>
</bookstore>`

export default function XmlFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState(2)

  const run = (fn, label) => {
    if (!input.trim()) { toast.error('Paste XML first'); return }
    try {
      setOutput(fn())
      setError('')
      toast.success(label)
    } catch (e) {
      setError(e.message); setOutput('')
      toast.error('Invalid XML')
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const validate = () => {
    if (!input.trim()) { toast.error('Paste XML first'); return }
    try {
      const doc = new DOMParser().parseFromString(input.trim(), 'text/xml')
      if (doc.querySelector('parsererror')) throw new Error('Parse error')
      setError(''); toast.success('Valid XML!')
    } catch {
      setError('Invalid XML'); toast.error('Invalid XML')
    }
  }

  const ta = "w-full h-80 font-mono text-sm border rounded-xl p-4 focus:outline-none focus:ring-2 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl font-mono font-bold text-orange-600">&lt;/&gt;</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">XML Formatter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Beautify, minify and validate XML documents</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => run(() => beautifyXml(input, indent), 'Formatted!')} className="btn-primary text-sm py-2 px-4">Beautify</button>
        <button onClick={() => run(() => minifyXml(input), 'Minified!')} className="btn-secondary text-sm py-2 px-4">Minify</button>
        <button onClick={validate} className="btn-secondary text-sm py-2 px-4">Validate</button>
        <button onClick={() => setInput(SAMPLE)} className="btn-secondary text-sm py-2 px-4">Sample</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-500 dark:text-gray-400">Indent:</label>
          <select value={indent} onChange={e => setIndent(Number(e.target.value))}
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
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Input XML</label>
          <textarea value={input} onChange={e => { setInput(e.target.value); setError('') }}
            placeholder="Paste your XML here..."
            className={`${ta} ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 dark:border-gray-700 focus:ring-orange-300'}`}
          />
          {error && <p className="text-xs text-red-500 mt-1 font-mono">{error}</p>}
        </div>
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Output</label>
          <textarea readOnly value={output} placeholder="Formatted XML appears here..."
            className={`${ta} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 focus:ring-0`}
          />
          {output && (
            <button onClick={copy}
              className="absolute top-8 right-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:shadow-sm transition-all">
              {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
