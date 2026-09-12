import { useState } from 'react'
import { ArrowLeft, Copy, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function serializeHtmlNode(node, indentSize, level) {
  const pad = ' '.repeat(indentSize * level)
  const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])

  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent.replace(/\n/g, '').replace(/\s+/g, ' ').trim()
    return t ? t : ''
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!-- ${node.textContent.trim()} -->`
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName.toLowerCase()
  const attrs = Array.from(node.attributes)
    .map(a => a.value ? ` ${a.name}="${a.value}"` : ` ${a.name}`)
    .join('')

  if (VOID.has(tag)) return `${pad}<${tag}${attrs}>`

  const children = Array.from(node.childNodes)
    .map(c => serializeHtmlNode(c, indentSize, level + 1))
    .filter(Boolean)

  if (children.length === 0) return `${pad}<${tag}${attrs}></${tag}>`

  // Inline elements or single text content
  if (children.length === 1 && !children[0].includes('\n') && children[0].length < 80) {
    return `${pad}<${tag}${attrs}>${children[0].trim()}</${tag}>`
  }

  return `${pad}<${tag}${attrs}>\n${children.map(c => c.startsWith(' ') ? c : ' '.repeat(indentSize * (level + 1)) + c).join('\n')}\n${pad}</${tag}>`
}

function beautifyHtml(html, indentSize) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const hasHtmlTag = /<html[\s>]/i.test(html)
  const hasBodyTag = /<body[\s>]/i.test(html)

  if (hasHtmlTag || hasBodyTag) {
    // Full document
    const doctype = '<!DOCTYPE html>'
    const htmlEl = doc.documentElement
    return doctype + '\n' + serializeHtmlNode(htmlEl, indentSize, 0)
  }

  // Fragment
  const body = doc.body
  return Array.from(body.childNodes)
    .map(n => serializeHtmlNode(n, indentSize, 0))
    .filter(Boolean)
    .join('\n')
}

function minifyHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')        // strip comments
    .replace(/>\s+</g, '><')                // collapse whitespace between tags
    .replace(/\s{2,}/g, ' ')               // collapse internal whitespace
    .replace(/\s*=\s*/g, '=')              // remove spaces around =
    .trim()
}

const SAMPLE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sample Page</title>
</head>
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <h1>Hello, World!</h1>
    <p>This is a sample HTML document.</p>
  </main>
</body>
</html>`

export default function HtmlTools() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState(2)

  const run = (fn, label) => {
    if (!input.trim()) { toast.error('Paste HTML first'); return }
    try {
      setOutput(fn()); setError('')
      toast.success(label)
    } catch (e) {
      setError(e.message); setOutput('')
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const ta = "w-full h-80 font-mono text-sm border rounded-xl p-4 focus:outline-none focus:ring-2 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-2xl">🌐</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">HTML Minifier / Beautifier</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Format or minify HTML — works with full documents and fragments</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => run(() => beautifyHtml(input, indent), 'HTML beautified!')} className="btn-primary text-sm py-2 px-4">Beautify</button>
        <button onClick={() => run(() => minifyHtml(input), 'HTML minified!')} className="btn-secondary text-sm py-2 px-4">Minify</button>
        <button onClick={() => setInput(SAMPLE)} className="btn-secondary text-sm py-2 px-4">Sample</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-500 dark:text-gray-400">Indent:</label>
          <select value={indent} onChange={e => setIndent(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>
        <button onClick={copy} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5">
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} Copy
        </button>
        <button onClick={() => { setInput(''); setOutput(''); setError('') }}
          className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Input HTML</label>
          <textarea value={input} onChange={e => { setInput(e.target.value); setError('') }}
            placeholder="Paste HTML here (full document or fragment)..."
            className={`${ta} ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 dark:border-gray-700 focus:ring-rose-300'}`}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Output</label>
          <textarea readOnly value={output} placeholder="Result appears here..."
            className={`${ta} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 focus:ring-0`}
          />
          {output && (
            <button onClick={copy}
              className="absolute top-8 right-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-700 transition-all">
              {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
            </button>
          )}
        </div>
      </div>

      {output && (
        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex gap-6">
          <span>Input: {input.length.toLocaleString()} chars</span>
          <span>Output: {output.length.toLocaleString()} chars</span>
          <span className={output.length < input.length ? 'text-green-500' : 'text-orange-400'}>
            {output.length < input.length
              ? `↓ ${Math.round((1 - output.length / input.length) * 100)}% smaller`
              : `↑ ${Math.round((output.length / input.length - 1) * 100)}% larger`}
          </span>
        </div>
      )}
    </div>
  )
}
