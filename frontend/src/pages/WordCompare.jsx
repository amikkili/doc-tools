import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import DiffMatchPatch from 'diff-match-patch'

const dmp = new DiffMatchPatch()

// DIFF_DELETE = -1, DIFF_INSERT = 1, DIFF_EQUAL = 0
const DIFF_DELETE = -1
const DIFF_INSERT = 1
const DIFF_EQUAL  =  0

function computeDiff(textA, textB, mode) {
  if (mode === 'word') {
    // Tokenize into words + whitespace, map each unique token → a private-use unicode char
    const tokenize = (text) => text.split(/(\s+)/)
    const tokensA = tokenize(textA)
    const tokensB = tokenize(textB)

    // Build vocab: unique token → char code (starting at U+E000)
    const vocab = new Map()
    let code = 0xE000
    const encode = (tokens) =>
      tokens.map(t => {
        if (!vocab.has(t)) vocab.set(t, String.fromCodePoint(code++))
        return vocab.get(t)
      }).join('')

    const encA = encode(tokensA)
    const encB = encode(tokensB)

    // Reverse map char → token
    const reverseVocab = new Map([...vocab.entries()].map(([t, c]) => [c, t]))

    const rawDiffs = dmp.diff_main(encA, encB, false)
    // No semantic cleanup — keep per-token granularity
    dmp.diff_cleanupMerge(rawDiffs)

    return rawDiffs.map(([op, chars]) => ({
      op,
      text: [...chars].map(c => reverseVocab.get(c) ?? c).join('')
    }))
  } else {
    // Character-level diff with semantic cleanup
    const diffs = dmp.diff_main(textA, textB)
    dmp.diff_cleanupSemantic(diffs)
    return diffs.map(([op, text]) => ({ op, text }))
  }
}

export default function WordCompare() {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [compared, setCompared] = useState(false)
  const [mode, setMode] = useState('word')  // 'word' | 'char'

  const diffs = useMemo(() => compared ? computeDiff(textA, textB, mode) : [], [compared, textA, textB, mode])

  const stats = useMemo(() => ({
    added:   diffs.filter(d => d.op === DIFF_INSERT).reduce((s, d) => s + d.text.trim().split(/\s+/).filter(Boolean).length, 0),
    removed: diffs.filter(d => d.op === DIFF_DELETE).reduce((s, d) => s + d.text.trim().split(/\s+/).filter(Boolean).length, 0),
    equal:   diffs.filter(d => d.op === DIFF_EQUAL).reduce((s, d)  => s + d.text.trim().split(/\s+/).filter(Boolean).length, 0),
  }), [diffs])

  const taBase = "w-full h-72 border border-gray-200 bg-white text-gray-900 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none placeholder-gray-400"

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">🔍</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Word Compare</h1>
          <p className="text-gray-500 text-sm">Powered by diff-match-patch — compare two texts and highlight changes</p>
        </div>
      </div>

      {!compared ? (
        <>
          {/* Mode selector */}
          <div className="flex gap-2 mb-4">
            {[['word','Word-level'],['char','Character-level']].map(([v,l]) => (
              <button key={v} onClick={() => setMode(v)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${mode===v ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
                {l}
              </button>
            ))}
            <span className="text-xs text-gray-400 self-center ml-2">
              {mode === 'word' ? 'Highlights added/removed whole words' : 'Shows every changed character'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Original Text (A)</label>
              <textarea value={textA} onChange={e => setTextA(e.target.value)} placeholder="Paste the original text here..." className={taBase} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Modified Text (B)</label>
              <textarea value={textB} onChange={e => setTextB(e.target.value)} placeholder="Paste the modified text here..." className={taBase} />
            </div>
          </div>
          <button onClick={() => setCompared(true)} disabled={!textA || !textB} className="btn-primary w-full">
            Compare
          </button>
        </>
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm">
              <span className="font-semibold text-green-700">+{stats.added}</span>
              <span className="text-green-600"> words added</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm">
              <span className="font-semibold text-red-700">-{stats.removed}</span>
              <span className="text-red-600"> words removed</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm">
              <span className="font-semibold text-gray-700">{stats.equal}</span>
              <span className="text-gray-600"> unchanged</span>
            </div>
            <div className="flex gap-2 ml-auto">
              {/* re-run with different mode */}
              {[['word','Word'],['char','Char']].map(([v,l]) => (
                <button key={v} onClick={() => setMode(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${mode===v ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
                  {l}
                </button>
              ))}
              <button onClick={() => setCompared(false)} className="btn-secondary text-sm py-1.5 px-4">Edit</button>
            </div>
          </div>

          {/* Diff output */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 leading-8 text-sm font-mono whitespace-pre-wrap break-words">
            {diffs.map((d, i) => (
              <span key={i} className={
                d.op === DIFF_INSERT ? 'bg-green-100 text-green-800 rounded px-0.5' :
                d.op === DIFF_DELETE ? 'bg-red-100 text-red-800 line-through rounded px-0.5' :
                'text-gray-800'
              }>
                {d.text}
              </span>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-5 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 inline-block"></span> Added in B</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 inline-block"></span> Removed from A</span>
            <span className="ml-auto text-gray-400 italic">diff-match-patch · semantic cleanup applied</span>
          </div>
        </div>
      )}
    </div>
  )
}
