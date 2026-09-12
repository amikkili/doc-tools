import { useState, useMemo, useRef } from 'react'
import { ArrowLeft, Copy, Check, Download, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

// ── Dirty sample ───────────────────────────────────────────────
const SAMPLE = [
  '1  # include<stdio.h>',
  '2  #include<conio.h>',
  '3  ',
  '4  /* Lab Program 3 – Sum of Two Numbers */',
  '5  void main( )',
  '6  {',
  '7    int a, b, sum;',
  '8    printf(“Enter two numbers: ”);',
  '9    scanf(“%d %d”, &a, &b);',
  '10   sum = a + b;',
  '11   if(a! =b){',
  '12     printf(“Not Equal\\n”);',
  '13   }',
  '14   printf(“\\nSum = %d”, sum);',
  '15   getch( );',
  '16   return 0;',
  '17 }',
].join('\r\n')

// ── Fix definitions ────────────────────────────────────────────
const ALL_FIXES = [
  { id: 'bom',        label: 'Remove BOM',            desc: 'Byte-order mark at file start'         },
  { id: 'crlf',       label: 'Fix CRLF endings',       desc: 'Windows \\r\\n → Unix \\n'              },
  { id: 'invisible',  label: 'Remove hidden chars',   desc: 'Zero-width spaces, soft hyphens'       },
  { id: 'nbsp',       label: 'Non-breaking spaces',   desc: 'U+00A0 → regular space'                },
  { id: 'quotes',     label: 'Straighten quotes',     desc: '“” ‘’ → " \''      },
  { id: 'ligatures',  label: 'Expand ligatures',      desc: 'ﬁﬂ → fi fl (common in PDFs)' },
  { id: 'dashes',     label: 'Fix em/en dashes',      desc: '–— → - in operator context'  },
  { id: 'operators',  label: 'Fix split operators',   desc: '! = → !=, < < → <<, - > → ->'          },
  { id: 'preproc',    label: '#directive spacing',    desc: '# include → #include'                   },
  { id: 'linenums',   label: 'Strip line numbers',    desc: 'Auto-detects and removes 1  2  3 ...'   },
  { id: 'trailing',   label: 'Trim trailing spaces',  desc: 'Remove spaces at end of each line'      },
  { id: 'blanklines', label: 'Collapse blank lines',  desc: 'Max 2 consecutive empty lines'          },
]

// ── Core cleaner ───────────────────────────────────────────────
function cleanCode(raw, lang, opts) {
  let t = raw
  const log = []
  const rec = (id, label, icon, n) => { if (n > 0) log.push({ id, label, icon, n }) }

  if (opts.bom && t.startsWith('﻿')) { t = t.slice(1); rec('bom', 'BOM removed', '🔣', 1) }

  if (opts.crlf) {
    const n = (t.match(/\r\n/g) || []).length + (t.match(/\r(?!\n)/g) || []).length
    t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    rec('crlf', 'CRLF fixed', '↵', n)
  }

  if (opts.invisible) {
    const re = new RegExp('[\u200b\u200c\u200d\u00ad\u2028\u2029\u202f\u2060\ufeff]', 'g')
    const n = (t.match(re) || []).length
    t = t.replace(re, '')
    rec('invisible', 'Hidden chars removed', '👻', n)
  }

  if (opts.nbsp) {
    const n = (t.match(/ /g) || []).length
    t = t.replace(/ /g, ' ')
    rec('nbsp', 'Non-breaking spaces', '·', n)
  }

  if (opts.quotes) {
    const QM = { '“': '"', '”': '"', '‘': "'", '’': "'", '«': '"', '»': '"', '„': '"', '‚': "'" }
    let n = 0
    for (const [from, to] of Object.entries(QM)) {
      const m = t.split(from).length - 1; n += m
      if (m) t = t.replaceAll(from, to)
    }
    rec('quotes', 'Curly quotes fixed', '“”', n)
  }

  if (opts.ligatures) {
    const LIG = { 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi', 'ﬄ': 'ffl' }
    let n = 0
    for (const [from, to] of Object.entries(LIG)) {
      const m = t.split(from).length - 1; n += m
      if (m) t = t.replaceAll(from, to)
    }
    rec('ligatures', 'Ligatures expanded', 'ﬁ', n)
  }

  if (opts.dashes && lang !== 'sql') {
    const n = (t.match(/[–—]/g) || []).length
    t = t.replace(/[–—]/g, '-')
    rec('dashes', 'Em/en dashes → -', '—', n)
  }

  if (opts.linenums) {
    const lines = t.split('\n')
    const nonEmpty = lines.filter(l => l.trim())
    if (nonEmpty.length >= 3) {
      const RE = /^\s*\d{1,3}\s*[.|:)]?\s{1,4}/
      const numbered = nonEmpty.filter(l => RE.test(l))
      if (numbered.length / nonEmpty.length >= 0.55) {
        t = lines.map(l => l.replace(RE, '')).join('\n')
        rec('linenums', 'Line numbers stripped', '🔢', numbered.length)
      }
    }
  }

  if (opts.operators) {
    let n = 0
    const OPS = [
      [/< </g, '<<'], [/> >/g, '>>'],
      [/- >/g, '->'], [/: :/g, '::'],
      [/\+ \+/g, '++'],
      ...(lang !== 'sql' ? [[/(?<![<!-])- -(?!-)/g, '--']] : []),
      [/! =/g, '!='], [/= =/g, '=='],
      [/> =/g, '>='], [/< =/g, '<='],
      [/& &/g, '&&'], [/\| \|/g, '||'],
      [/\+ =/g, '+='], [/- =/g, '-='],
      [/\* =/g, '*='], [/\/ =/g, '/='], [/% =/g, '%='],
    ]
    for (const [re, rep] of OPS) {
      const m = (t.match(re) || []).length; n += m
      t = t.replace(re, rep)
    }
    rec('operators', 'Split operators fixed', '⊕', n)
  }

  if (opts.preproc) {
    const before = t
    t = t.replace(/(^|\n)#[ \t]+(include|define|ifdef|ifndef|endif|pragma|if\b|else|elif|undef|error)/gm, (_, nl, kw) => nl + '#' + kw)
    if (t !== before) rec('preproc', '#directive spacing', '#', 1)
  }

  if (opts.trailing) {
    const before = t
    t = t.split('\n').map(l => l.trimEnd()).join('\n')
    if (t !== before) rec('trailing', 'Trailing whitespace', '⎵', 1)
  }

  if (opts.blanklines) {
    const before = t
    t = t.replace(/\n{3,}/g, '\n\n')
    if (t !== before) rec('blanklines', 'Excess blank lines', '↕', 1)
  }

  t = t.replace(/^\n+/, '').replace(/\n+$/, '\n')
  return { text: t, log }
}

// ── Language detection ─────────────────────────────────────────
function detectLang(code) {
  const s = code.slice(0, 2000)
  if (/#include\s*[<"]/.test(s)) {
    if (/cout\s*<<|cin\s*>>|namespace\s+std|<iostream>|<vector>|::/.test(s)) return 'cpp'
    return 'c'
  }
  if (/public\s+class\s|System\.out\.|import\s+java\./.test(s)) return 'java'
  if (/def\s+\w+\s*\(|import\s+\w+|print\s*\(/.test(s)) return 'python'
  if (/SELECT\s+|INSERT\s+INTO|CREATE\s+TABLE/i.test(s)) return 'sql'
  if (/function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|console\.log/.test(s)) return 'js'
  return 'c'
}

const LANGS = ['auto', 'c', 'c++', 'java', 'python', 'sql', 'other']
const EXT   = { c: 'c', cpp: 'cpp', 'c++': 'cpp', java: 'java', python: 'py', sql: 'sql', js: 'js', other: 'txt' }

export default function LabCodeCleaner() {
  const [input, setInput]     = useState(SAMPLE)
  const [lang, setLang]       = useState('auto')
  const [opts, setOpts]       = useState(() => Object.fromEntries(ALL_FIXES.map(f => [f.id, true])))
  const [copied, setCopied]   = useState(false)
  const [showOrig, setShowOrig] = useState(false)
  const textareaRef = useRef(null)

  const effectiveLang = lang === 'auto' ? detectLang(input) : lang

  const { text: cleanText, log } = useMemo(
    () => input.trim() ? cleanCode(input, effectiveLang, opts) : { text: '', log: [] },
    [input, effectiveLang, opts]
  )

  const outputLines = useMemo(() => {
    if (!cleanText) return []
    const cLines = cleanText.split('\n')
    const oLines = input.split('\n')
    return cLines.map((line, i) => ({ line, changed: line !== (oLines[i] ?? '') }))
  }, [cleanText, input])

  const origLines = useMemo(() => input.split('\n'), [input])

  const saved   = input.length - cleanText.length
  const changedN = outputLines.filter(l => l.changed).length
  const ext      = EXT[effectiveLang] || 'txt'

  const copy = () => {
    const text = showOrig ? input : cleanText
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast.success('Copied to clipboard!')
    })
  }

  const download = () => {
    const blob = new Blob([cleanText], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cleaned.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const toggleOpt = (id) => setOpts(prev => ({ ...prev, [id]: !prev[id] }))

  const handlePaste = () => {
    // showOrig resets on new paste
    setShowOrig(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl">🧹</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lab Code Cleaner</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Paste PDF lab manual code — fixes curly quotes, line numbers, split operators & 9 more issues instantly</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Language tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5">
          {LANGS.map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                lang === l
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              {l}
            </button>
          ))}
        </div>

        {/* Detected lang badge */}
        {lang === 'auto' && input.trim() && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Detected: <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{effectiveLang}</span>
          </span>
        )}

        {/* Stats */}
        {input.trim() && (
          <div className="ml-auto flex items-center gap-3 text-sm text-gray-400">
            <span>{input.length.toLocaleString()} → {cleanText.length.toLocaleString()} chars</span>
            {saved > 0 && (
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                −{((saved / input.length) * 100).toFixed(1)}%
              </span>
            )}
            {changedN > 0 && (
              <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                {changedN} line{changedN > 1 ? 's' : ''} changed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Split editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Input */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">● Dirty code</span>
            <div className="flex gap-2">
              <button onClick={() => { setInput(SAMPLE); setShowOrig(false) }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <RefreshCw size={12} /> Load sample
              </button>
              <button onClick={() => { setInput(''); setShowOrig(false) }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                Clear
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); setShowOrig(false) }}
            onPaste={handlePaste}
            spellCheck={false}
            placeholder={'Paste your lab manual code here…\n\nAuto-cleans as you type. Fixes curly quotes,\nline numbers, split operators, CRLF and more.'}
            className="flex-1 w-full min-h-72 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-xs leading-relaxed resize-none outline-none focus:border-emerald-400 dark:focus:border-emerald-600 transition-colors"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">● Clean code</span>
            <div className="flex items-center gap-2">
              {changedN > 0 && (
                <button onClick={() => setShowOrig(v => !v)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline">
                  {showOrig ? 'Show clean' : 'Show original'}
                </button>
              )}
              <button onClick={copy}
                className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg transition-colors">
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={download} disabled={!cleanText}
                className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40">
                <Download size={12} /> .{ext}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-72 rounded-xl border border-gray-700 bg-[#0d1117] overflow-auto">
            {!input.trim() ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 text-sm gap-2 p-8 text-center">
                <span className="text-3xl">📋</span>
                <span>Paste code on the left — fixes apply instantly</span>
              </div>
            ) : showOrig ? (
              <div className="p-2">
                {origLines.map((line, i) => (
                  <div key={i} className="flex items-baseline min-h-[1.65em] pr-3">
                    <span className="select-none text-[11px] text-gray-600 min-w-[36px] text-right pr-3 flex-shrink-0 font-mono">{i + 1}</span>
                    <span className="text-[#e6edf3] opacity-60 font-mono text-xs leading-relaxed whitespace-pre">{line}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2">
                {outputLines.map(({ line, changed }, i) => (
                  <div key={i}
                    className={`flex items-baseline min-h-[1.65em] pr-3 border-l-2 ${changed ? 'bg-emerald-500/[0.07] border-emerald-500/40' : 'border-transparent'}`}>
                    <span className={`select-none text-[11px] min-w-[36px] text-right pr-3 flex-shrink-0 font-mono ${changed ? 'text-emerald-500/60' : 'text-gray-600'}`}>{i + 1}</span>
                    <span className="text-[#e6edf3] font-mono text-xs leading-relaxed whitespace-pre">{line}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fix badges */}
      <div className="flex flex-wrap gap-2 mb-6 min-h-[36px] items-center">
        {!input.trim() ? (
          <span className="text-sm text-gray-400 italic">Paste code to see what gets cleaned</span>
        ) : log.length === 0 ? (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            ✅ Already clean — no changes needed
          </span>
        ) : log.map(f => (
          <span key={f.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span>{f.icon}</span>
            {f.label}
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{f.n}</span>
          </span>
        ))}
      </div>

      {/* Options */}
      <details className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gray-50 dark:bg-gray-800/50 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors list-none">
          <span>⚙ Fix options</span>
          <span className="font-normal text-xs">
            {Object.values(opts).every(Boolean) ? 'all 12 enabled' : `${Object.values(opts).filter(Boolean).length} of 12`}
          </span>
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
          {ALL_FIXES.map(f => (
            <label key={f.id} title={f.desc}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
              <input type="checkbox" checked={opts[f.id]} onChange={() => toggleOpt(f.id)}
                className="accent-emerald-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{f.label}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 hidden group-hover:inline truncate">{f.desc}</span>
            </label>
          ))}
        </div>
      </details>
    </div>
  )
}
