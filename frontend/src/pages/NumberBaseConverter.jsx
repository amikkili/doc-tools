import { useState, useMemo } from 'react'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const BASES = [
  { id: 2,  label: 'Binary',      prefix: '0b', chars: /^[01]*$/ },
  { id: 8,  label: 'Octal',       prefix: '0o', chars: /^[0-7]*$/ },
  { id: 10, label: 'Decimal',     prefix: '',   chars: /^-?[0-9]*$/ },
  { id: 16, label: 'Hexadecimal', prefix: '0x', chars: /^[0-9a-fA-F]*$/ },
]

const BIT_SIZES = [8, 16, 32, 64]

function CopyBtn({ value }) {
  const [c, setC] = useState(false)
  return (
    <button onClick={()=>{navigator.clipboard.writeText(value);setC(true);setTimeout(()=>setC(false),1500);toast.success('Copied!')}}
      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shrink-0">
      {c?<Check size={13} className="text-green-500"/>:<Copy size={13}/>}
    </button>
  )
}

function formatBinary(n, bits) {
  if (n < 0) {
    const twos = (BigInt(2) ** BigInt(bits) + BigInt(n)).toString(2).padStart(bits, '0')
    return twos
  }
  return n.toString(2).padStart(bits, '0')
}

function groupBinary(bin) {
  return bin.match(/.{1,4}/g)?.join(' ') || bin
}

export default function NumberBaseConverter() {
  const [input, setInput] = useState('255')
  const [fromBase, setFromBase] = useState(10)
  const [bitSize, setBitSize] = useState(8)
  const [copied, setCopied] = useState(null)

  const { decimal, error, results } = useMemo(() => {
    if (!input.trim()) return { decimal: null, error: '', results: {} }
    try {
      const dec = parseInt(input.trim(), fromBase)
      if (isNaN(dec)) return { decimal: null, error: `Invalid ${BASES.find(b=>b.id===fromBase)?.label} number`, results: {} }
      const r = {}
      BASES.forEach(b => { r[b.id] = dec.toString(b.id).toUpperCase() })
      return { decimal: dec, error: '', results: r }
    } catch {
      return { decimal: null, error: 'Parse error', results: {} }
    }
  }, [input, fromBase])

  const copy = (val, id) => {
    navigator.clipboard.writeText(val)
    setCopied(id); setTimeout(() => setCopied(null), 1500)
    toast.success('Copied!')
  }

  const PRESETS = [
    {label:'0', base:10}, {label:'1', base:10}, {label:'127', base:10},
    {label:'255', base:10}, {label:'1024', base:10}, {label:'65535', base:10},
    {label:'FF', base:16}, {label:'DEADBEEF', base:16},
    {label:'11111111', base:2},
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-2xl">01</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Number Base Converter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Binary · Octal · Decimal · Hexadecimal</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Input Number</label>
            <input
              value={input} onChange={e => setInput(e.target.value.replace(/\s/g,'').toUpperCase())}
              placeholder={fromBase === 2 ? '11111111' : fromBase === 16 ? 'FF' : '255'}
              className={`w-full px-4 py-3 rounded-xl border text-lg font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400 transition ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">From Base</label>
            <div className="flex gap-1.5">
              {BASES.map(b => (
                <button key={b.id} onClick={() => setFromBase(b.id)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${fromBase===b.id ? 'bg-violet-500 text-white border-violet-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}>
                  {b.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-400 self-center">Try:</span>
          {PRESETS.map(p => (
            <button key={p.label+p.base} onClick={() => { setInput(p.label); setFromBase(p.base) }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 transition-all">
              {p.label}<span className="text-gray-400 text-xs ml-0.5">₍{p.base}₎</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {decimal !== null && (
        <div className="space-y-3 mb-5">
          {BASES.map(b => {
            const val = results[b.id]
            if (!val) return null
            const isSrc = b.id === fromBase
            return (
              <div key={b.id} className={`bg-white dark:bg-gray-800 rounded-xl border px-4 py-3 ${isSrc ? 'border-violet-200 dark:border-violet-700' : 'border-gray-100 dark:border-gray-700'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isSrc ? 'text-violet-500' : 'text-gray-400'}`}>
                      {b.label} (base {b.id})
                    </span>
                    {isSrc && <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-md">source</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-300">{b.prefix}</span>
                    <CopyBtn value={b.prefix + val}/>
                  </div>
                </div>
                <p className="font-mono text-base font-semibold text-gray-800 dark:text-gray-200 break-all">{val}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Bit representation */}
      {decimal !== null && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bit Representation</p>
            <div className="flex gap-1">
              {BIT_SIZES.map(n => (
                <button key={n} onClick={() => setBitSize(n)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${bitSize===n ? 'bg-violet-500 text-white border-violet-500' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}>
                  {n}-bit
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 tracking-wider break-all">
              {groupBinary(formatBinary(decimal, bitSize))}
            </code>
          </div>
          {decimal < 0 && <p className="text-xs text-gray-400 mt-2">Two's complement representation</p>}
        </div>
      )}
    </div>
  )
}
