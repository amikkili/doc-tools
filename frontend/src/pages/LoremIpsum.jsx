import { useState } from 'react'
import { ArrowLeft, Copy, Check, RefreshCw, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const WORDS = `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci a odio nullam varius turpis ac commodo vehicula arcu orci volutpat tincidunt ornare massa eget egestas purus viverra accumsan in nisl nisi scelerisque eu ultrices vitae auctor eu augue ut lectus arcu bibendum at varius vel pharetra vel turpis nunc eget lorem dolor sed viverra ipsum nunc aliquet bibendum enim facilisis gravida`.split(' ')

function randomWord() { return WORDS[Math.floor(Math.random() * WORDS.length)] }

function sentence(minW = 6, maxW = 18) {
  const count = minW + Math.floor(Math.random() * (maxW - minW))
  const words = Array.from({ length: count }, randomWord)
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(' ') + '.'
}

function paragraph(minS = 3, maxS = 7) {
  const count = minS + Math.floor(Math.random() * (maxS - minS))
  return Array.from({ length: count }, sentence).join(' ')
}

function generate({ type, count, startLorem }) {
  if (type === 'words') {
    const words = Array.from({ length: count }, randomWord)
    if (startLorem) words.splice(0, 5, 'lorem', 'ipsum', 'dolor', 'sit', 'amet')
    return words.join(' ')
  }
  if (type === 'sentences') {
    const sentences = Array.from({ length: count }, sentence)
    if (startLorem) sentences[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    return sentences.join(' ')
  }
  // paragraphs
  const paras = Array.from({ length: count }, paragraph)
  if (startLorem) paras[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  return paras.join('\n\n')
}

export default function LoremIpsum() {
  const [type, setType] = useState('paragraphs')
  const [count, setCount] = useState(3)
  const [startLorem, setStartLorem] = useState(true)
  const [format, setFormat] = useState('plain') // 'plain' | 'html'
  const [text, setText] = useState(() => generate({ type: 'paragraphs', count: 3, startLorem: true }))
  const [copied, setCopied] = useState(false)

  const refresh = () => {
    setText(generate({ type, count, startLorem }))
  }

  const getOutput = () => {
    if (format === 'html') {
      if (type === 'paragraphs') return text.split('\n\n').map(p => `<p>${p}</p>`).join('\n')
      if (type === 'sentences') return `<p>${text}</p>`
      return `<p>${text}</p>`
    }
    return text
  }

  const output = getOutput()

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lorem-ipsum.txt'; a.click()
  }

  const wordCount = text.trim().split(/\s+/).length
  const charCount = text.length

  const PRESETS = [
    { label: '1 Para', type: 'paragraphs', count: 1 },
    { label: '3 Paras', type: 'paragraphs', count: 3 },
    { label: '5 Paras', type: 'paragraphs', count: 5 },
    { label: '50 Words', type: 'words', count: 50 },
    { label: '100 Words', type: 'words', count: 100 },
    { label: '5 Sentences', type: 'sentences', count: 5 },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">Aa</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lorem Ipsum Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Generate placeholder text for designs and prototypes</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-5 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Generate</label>
            <div className="flex gap-1.5">
              {['words', 'sentences', 'paragraphs'].map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize border transition-all ${type === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Count</label>
            <input
              type="number" min={1} max={type === 'words' ? 500 : type === 'sentences' ? 50 : 20}
              value={count} onChange={e => setCount(Math.max(1, Number(e.target.value)))}
              className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Format</label>
            <div className="flex gap-1.5">
              {['plain', 'html'].map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium uppercase border transition-all ${format === f ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Start with lorem */}
          <label className="flex items-center gap-2 cursor-pointer pb-1">
            <input type="checkbox" checked={startLorem} onChange={e => setStartLorem(e.target.checked)} className="rounded accent-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Start with "Lorem ipsum…"</span>
          </label>

          <button onClick={refresh}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm ml-auto">
            <RefreshCw size={14} /> Generate
          </button>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 self-center">Quick:</span>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => { setType(p.type); setCount(p.count); setText(generate({ type: p.type, count: p.count, startLorem })) }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all border border-transparent hover:border-orange-200">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex gap-4 text-xs text-gray-400">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
          </div>
          <div className="flex gap-2">
            <button onClick={download}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-orange-300 transition-all">
              <Download size={12} /> .txt
            </button>
            <button onClick={copy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors">
              {copied ? <Check size={12} /> : <Copy size={12} />} Copy
            </button>
          </div>
        </div>
        <div className="p-5 max-h-96 overflow-y-auto">
          <p className={`text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap ${format === 'html' ? 'font-mono text-xs' : 'text-sm'}`}>
            {output}
          </p>
        </div>
      </div>
    </div>
  )
}
