import { useState } from 'react'
import { ArrowLeft, ArrowRightLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const CATEGORIES = {
  Length: {
    icon: '📏',
    base: 'm',
    units: {
      mm: 0.001, cm: 0.01, m: 1, km: 1000,
      in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
      nm: 1e-9, μm: 1e-6,
    },
  },
  Mass: {
    icon: '⚖️',
    base: 'kg',
    units: {
      mg: 1e-6, g: 0.001, kg: 1, t: 1000,
      oz: 0.028349523, lb: 0.45359237,
    },
  },
  Temperature: {
    icon: '🌡️',
    base: 'C',
    units: { '°C': 'C', '°F': 'F', 'K': 'K' },
    toBase: { C: x => x, F: x => (x - 32) * 5 / 9, K: x => x - 273.15 },
    fromBase: { C: x => x, F: x => x * 9 / 5 + 32, K: x => x + 273.15 },
  },
  Area: {
    icon: '▭',
    base: 'm²',
    units: {
      'mm²': 1e-6, 'cm²': 1e-4, 'm²': 1, 'km²': 1e6,
      'in²': 6.4516e-4, 'ft²': 0.092903, 'yd²': 0.836127,
      acre: 4046.856, ha: 10000,
    },
  },
  Volume: {
    icon: '🧪',
    base: 'l',
    units: {
      ml: 0.001, cl: 0.01, dl: 0.1, l: 1,
      'm³': 1000, 'ft³': 28.316847,
      tsp: 0.004929, tbsp: 0.014787,
      'fl oz': 0.029574, cup: 0.236588,
      pt: 0.473176, qt: 0.946353, gal: 3.785412,
    },
  },
  Speed: {
    icon: '💨',
    base: 'm/s',
    units: {
      'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704,
      knot: 0.514444, 'ft/s': 0.3048,
    },
  },
  Data: {
    icon: '💾',
    base: 'B',
    units: {
      B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3,
      TB: 1024 ** 4, PB: 1024 ** 5,
      Kb: 125, Mb: 125000, Gb: 125e6,
    },
  },
  Time: {
    icon: '⏱️',
    base: 's',
    units: {
      ms: 0.001, s: 1, min: 60, h: 3600,
      day: 86400, week: 604800,
      month: 2629800, year: 31557600,
    },
  },
}

function convert(cat, from, to, val) {
  if (!val || isNaN(val)) return ''
  const n = parseFloat(val)
  const C = CATEGORIES[cat]
  if (cat === 'Temperature') {
    const toBase = C.toBase[C.units[from]]
    const fromBase = C.fromBase[C.units[to]]
    return fromBase(toBase(n))
  }
  const fromFactor = C.units[from]
  const toFactor = C.units[to]
  return (n * fromFactor) / toFactor
}

function fmt(n) {
  if (n === '' || n === undefined) return ''
  const num = parseFloat(n)
  if (isNaN(num)) return ''
  if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-4 && num !== 0)) return num.toExponential(6)
  const str = parseFloat(num.toPrecision(10)).toString()
  return str
}

export default function UnitConverter() {
  const [cat, setCat] = useState('Length')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')
  const [fromVal, setFromVal] = useState('1')

  const C = CATEGORIES[cat]
  const units = Object.keys(C.units)
  const result = convert(cat, fromUnit, toUnit, fromVal)

  const switchCat = (newCat) => {
    setCat(newCat)
    const newUnits = Object.keys(CATEGORIES[newCat].units)
    setFromUnit(newUnits[0])
    setToUnit(newUnits[Math.min(1, newUnits.length - 1)])
    setFromVal('1')
  }

  const swap = () => {
    const prevFrom = fromUnit, prevTo = toUnit
    setFromUnit(prevTo); setToUnit(prevFrom)
    setFromVal(fmt(result))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-2xl">⇄</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Unit Converter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Length, Mass, Temperature, Area, Volume, Speed, Data &amp; Time</p>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-7">
        {Object.entries(CATEGORIES).map(([name, c]) => (
          <button key={name} onClick={() => switchCat(name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${cat === name ? 'bg-teal-500 text-white border-teal-500 shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-teal-300 hover:text-teal-600'}`}>
            <span>{c.icon}</span> {name}
          </button>
        ))}
      </div>

      {/* Converter card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* From */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">From</label>
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-teal-400">
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={fromVal} onChange={e => setFromVal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              placeholder="0"
            />
          </div>

          {/* Swap */}
          <button onClick={swap}
            className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-600 dark:text-teal-400 transition-all hover:scale-110 mt-4 sm:mt-6 shrink-0">
            <ArrowRightLeft size={20} />
          </button>

          {/* To */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">To</label>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-teal-400">
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 text-gray-900 dark:text-gray-100 text-lg font-bold min-h-[52px] break-all">
              {fmt(result) || <span className="text-gray-300 font-normal">—</span>}
            </div>
          </div>
        </div>

        {fromVal && result !== '' && (
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{fromVal} {fromUnit}</span>
            {' = '}
            <span className="font-semibold text-teal-600 dark:text-teal-400">{fmt(result)} {toUnit}</span>
          </p>
        )}
      </div>

      {/* Quick reference for current category */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">All {cat} units (relative to {C.base})</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {units.filter(u => u !== C.base && u !== `°C`).slice(0, 6).map(u => {
            const r = convert(cat, C.base === '°C' ? '°C' : C.base, u, '1')
            return (
              <div key={u} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2.5 text-sm cursor-pointer hover:border-teal-300 transition-all"
                onClick={() => { setFromUnit(C.base === '°C' ? '°C' : C.base); setToUnit(u); setFromVal('1') }}>
                <span className="font-semibold text-gray-700 dark:text-gray-300">1 {C.base === '°C' ? '°C' : C.base}</span>
                <span className="text-gray-400 mx-1.5">=</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono text-xs">{fmt(r)} {u}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
