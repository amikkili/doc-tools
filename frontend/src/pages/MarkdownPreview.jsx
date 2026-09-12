import { useState, useMemo } from 'react'
import { ArrowLeft, Copy, Check, Download, Eye, Code } from 'lucide-react'
import { Link } from 'react-router-dom'
import { marked } from 'marked'
import toast from 'react-hot-toast'

marked.setOptions({ gfm: true, breaks: true })

const SAMPLE = `# DocCraft Markdown Preview

Welcome to the **Markdown → HTML** previewer. Everything you type on the left renders live on the right.

## Features

- Live preview as you type
- GitHub Flavored Markdown (GFM) support
- Copy rendered HTML
- Download as \`.html\` file

## Code Example

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`
console.log(greet('DocCraft'))
\`\`\`

## Table

| Tool | Category | Free? |
|------|----------|-------|
| QR Generator | Dev Tools | ✅ |
| Regex Tester | Dev Tools | ✅ |
| PDF Merger | PDF Tools | ✅ |

## Blockquote

> "The best tool is the one you actually use."
> — Someone wise

## Task List

- [x] Add Markdown preview
- [x] Add Regex tester
- [x] Add QR generator
- [ ] Add more tools!

---

*Happy writing!*
`

export default function MarkdownPreview() {
  const [md, setMd] = useState(SAMPLE)
  const [view, setView] = useState('split') // 'split' | 'preview' | 'html'
  const [copied, setCopied] = useState(false)

  const html = useMemo(() => marked(md), [md])

  const copyHtml = () => {
    navigator.clipboard.writeText(html)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('HTML copied!')
  }

  const download = () => {
    const full = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; line-height: 1.7; }
    h1,h2,h3 { margin-top: 1.5em; } pre { background: #f4f4f5; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { font-family: 'Fira Code', monospace; font-size: 0.9em; } blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #6b7280; margin: 0; }
    table { border-collapse: collapse; width: 100%; } th,td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; } th { background: #f9fafb; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${html}
</body>
</html>`
    const blob = new Blob([full], { type: 'text/html' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'document.html'; a.click()
    toast.success('Downloaded as HTML!')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">📝</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Markdown → HTML</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Live preview with GitHub Flavored Markdown</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
            {[['split', 'Split'], ['preview', 'Preview'], ['html', 'HTML']].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={copyHtml}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-indigo-300 transition-all">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />} Copy HTML
          </button>
          <button onClick={download}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors">
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-gray-400 mb-4">
        <span>{md.length} chars</span>
        <span>{md.split('\n').length} lines</span>
        <span>{md.trim().split(/\s+/).filter(Boolean).length} words</span>
      </div>

      {/* Editor area */}
      <div className={`grid gap-4 ${view === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
        style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>

        {/* Markdown input */}
        {(view === 'split' || view === 'html') && view !== 'preview' && (
          <div className="flex flex-col">
            {view === 'html' && (
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Code size={12} /> Generated HTML
              </label>
            )}
            {view === 'split' && (
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Markdown</label>
            )}
            <textarea
              value={view === 'html' ? html : md}
              onChange={view === 'split' ? e => setMd(e.target.value) : undefined}
              readOnly={view === 'html'}
              className={`flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition ${view === 'html' ? 'bg-gray-50 dark:bg-gray-800/50 cursor-default text-xs' : 'bg-white dark:bg-gray-800'}`}
            />
          </div>
        )}

        {/* Preview */}
        {(view === 'split' || view === 'preview') && (
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Eye size={12} /> Preview
            </label>
            <div
              className="flex-1 overflow-y-auto px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 prose prose-sm dark:prose-invert max-w-none"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>

      {/* Prose styles injected globally for this preview */}
      <style>{`
        .prose h1,.prose h2,.prose h3,.prose h4 { font-weight:700; margin-top:1.25em; margin-bottom:0.5em; color: inherit; }
        .prose h1 { font-size:1.75em; } .prose h2 { font-size:1.4em; } .prose h3 { font-size:1.15em; }
        .prose p { margin:0.75em 0; line-height:1.7; }
        .prose ul,.prose ol { padding-left:1.5em; margin:0.5em 0; }
        .prose li { margin:0.25em 0; }
        .prose code { background:rgba(99,102,241,0.1); color:#6366f1; padding:0.15em 0.4em; border-radius:4px; font-size:0.875em; }
        .prose pre { background:#1e1e2e; color:#cdd6f4; padding:1rem; border-radius:12px; overflow-x:auto; margin:1em 0; }
        .prose pre code { background:none; color:inherit; padding:0; }
        .prose blockquote { border-left:3px solid #6366f1; padding-left:1rem; color:#6b7280; margin:1em 0; font-style:italic; }
        .prose table { border-collapse:collapse; width:100%; margin:1em 0; font-size:0.875em; }
        .prose th,.prose td { border:1px solid #e5e7eb; padding:0.5rem 0.75rem; }
        .prose th { background:#f9fafb; font-weight:600; }
        .dark .prose th { background:#1f2937; } .dark .prose th,.dark .prose td { border-color:#374151; }
        .prose hr { border:none; border-top:2px solid #e5e7eb; margin:1.5em 0; }
        .dark .prose hr { border-color:#374151; }
        .prose a { color:#6366f1; text-decoration:underline; }
        .prose strong { font-weight:700; }
        .prose em { font-style:italic; }
        input[type="checkbox"] { margin-right:0.4em; }
      `}</style>
    </div>
  )
}
