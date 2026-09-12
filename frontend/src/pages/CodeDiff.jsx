import { useState, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import DiffMatchPatch from 'diff-match-patch'

const dmp = new DiffMatchPatch()
const DIFF_DELETE = -1
const DIFF_INSERT =  1
const DIFF_EQUAL  =  0

function lineDiff(textA, textB) {
  // Tokenise by line
  const lines = []
  const lineToChar = (text) => {
    let out = ''
    for (const line of text.split('\n')) {
      const key = lines.indexOf(line)
      if (key === -1) { out += String.fromCharCode(lines.length + 0xE000); lines.push(line) }
      else out += String.fromCharCode(key + 0xE000)
    }
    return out
  }
  const charsA = lineToChar(textA)
  const charsB = lineToChar(textB)
  const diffs = dmp.diff_main(charsA, charsB, false)
  dmp.diff_cleanupSemantic(diffs)
  return diffs.flatMap(([type, chars]) =>
    Array.from(chars).map(ch => [type, lines[ch.codePointAt(0) - 0xE000]])
  )
}

const SAMPLE_A = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob"];
users.forEach(user => greet(user));`

const SAMPLE_B = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return name;
}

const users = ["Alice", "Bob", "Carol"];
users.forEach(user => greet(user));
console.log("Done");`

export default function CodeDiff() {
  const [textA, setTextA] = useState(SAMPLE_A)
  const [textB, setTextB] = useState(SAMPLE_B)
  const [mode, setMode] = useState('side')  // 'side' | 'unified'

  const diffs = useMemo(() => {
    if (!textA && !textB) return []
    return lineDiff(textA, textB)
  }, [textA, textB])

  const stats = useMemo(() => {
    const added = diffs.filter(([t]) => t === DIFF_INSERT).length
    const removed = diffs.filter(([t]) => t === DIFF_DELETE).length
    const unchanged = diffs.filter(([t]) => t === DIFF_EQUAL).length
    return { added, removed, unchanged }
  }, [diffs])

  // Build side-by-side rows
  const sideRows = useMemo(() => {
    const rows = []
    let li = 1, ri = 1
    let i = 0
    while (i < diffs.length) {
      const [type, text] = diffs[i]
      if (type === DIFF_EQUAL) { rows.push({ type: 'eq', left: { n: li++, text }, right: { n: ri++, text } }); i++ }
      else if (type === DIFF_DELETE) {
        const next = diffs[i+1]
        if (next && next[0] === DIFF_INSERT) {
          rows.push({ type: 'change', left: { n: li++, text }, right: { n: ri++, text: next[1] } }); i += 2
        } else {
          rows.push({ type: 'del', left: { n: li++, text }, right: null }); i++
        }
      } else {
        rows.push({ type: 'ins', left: null, right: { n: ri++, text } }); i++
      }
    }
    return rows
  }, [diffs])

  const bg = { eq: '', del: 'bg-red-50 dark:bg-red-900/20', ins: 'bg-green-50 dark:bg-green-900/20', change: '' }
  const badge = { del: 'bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-300', ins: 'bg-green-200 dark:bg-green-900/60 text-green-800 dark:text-green-300' }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-2xl">⇄</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Code Diff</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Line-by-line diff · Side-by-side · Unified view</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          ['Added', stats.added, 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'],
          ['Removed', stats.removed, 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'],
          ['Unchanged', stats.unchanged, 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'],
        ].map(([l,v,cls])=>(
          <span key={l} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${cls}`}>{l}: {v} lines</span>
        ))}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 ml-auto">
          {['side','unified'].map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${mode===m?'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100':'text-gray-500 dark:text-gray-400'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[['Original', textA, setTextA],['Modified', textB, setTextB]].map(([label, val, setter])=>(
          <div key={label}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
            <textarea rows={8} value={val} onChange={e=>setter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-400 transition resize-none"
            />
          </div>
        ))}
      </div>

      {/* Diff output */}
      {sideRows.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {mode === 'side' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="w-10 px-2 py-2 text-gray-400 text-right font-normal">#</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-semibold">Original</th>
                    <th className="w-10 px-2 py-2 text-gray-400 text-right font-normal">#</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-semibold">Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {sideRows.map((row, i) => (
                    <tr key={i} className={`${bg[row.type]} border-b border-gray-50 dark:border-gray-700/50`}>
                      <td className="px-2 py-1 text-gray-300 dark:text-gray-600 text-right select-none whitespace-nowrap">
                        {row.left?.n}
                      </td>
                      <td className={`px-3 py-1 whitespace-pre ${row.type==='del'||row.type==='change' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {row.type === 'del' || row.type === 'change' ? <span className="text-red-400 mr-1">−</span> : null}
                        {row.left?.text ?? ''}
                      </td>
                      <td className="px-2 py-1 text-gray-300 dark:text-gray-600 text-right select-none whitespace-nowrap">
                        {row.right?.n}
                      </td>
                      <td className={`px-3 py-1 whitespace-pre ${row.type==='ins'||row.type==='change' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {row.type === 'ins' || row.type === 'change' ? <span className="text-green-500 mr-1">+</span> : null}
                        {row.right?.text ?? ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              {diffs.map(([type, text], i) => (
                <div key={i} className={`px-3 py-0.5 font-mono text-xs whitespace-pre rounded ${
                  type === DIFF_INSERT ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                  type === DIFF_DELETE ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  <span className="select-none mr-2 text-gray-300">
                    {type === DIFF_INSERT ? '+' : type === DIFF_DELETE ? '−' : ' '}
                  </span>
                  {text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
