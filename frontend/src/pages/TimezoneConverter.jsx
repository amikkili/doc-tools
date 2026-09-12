import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, X, RefreshCw, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const COMMON_ZONES = [
  { label: 'UTC', tz: 'UTC' },
  { label: 'New York (EST/EDT)', tz: 'America/New_York' },
  { label: 'Los Angeles (PST/PDT)', tz: 'America/Los_Angeles' },
  { label: 'Chicago (CST/CDT)', tz: 'America/Chicago' },
  { label: 'London (GMT/BST)', tz: 'Europe/London' },
  { label: 'Paris (CET/CEST)', tz: 'Europe/Paris' },
  { label: 'Berlin (CET/CEST)', tz: 'Europe/Berlin' },
  { label: 'Moscow (MSK)', tz: 'Europe/Moscow' },
  { label: 'Dubai (GST)', tz: 'Asia/Dubai' },
  { label: 'Mumbai (IST)', tz: 'Asia/Kolkata' },
  { label: 'Dhaka (BST)', tz: 'Asia/Dhaka' },
  { label: 'Bangkok (ICT)', tz: 'Asia/Bangkok' },
  { label: 'Singapore (SGT)', tz: 'Asia/Singapore' },
  { label: 'Beijing (CST)', tz: 'Asia/Shanghai' },
  { label: 'Tokyo (JST)', tz: 'Asia/Tokyo' },
  { label: 'Seoul (KST)', tz: 'Asia/Seoul' },
  { label: 'Sydney (AEST/AEDT)', tz: 'Australia/Sydney' },
  { label: 'Auckland (NZST/NZDT)', tz: 'Pacific/Auckland' },
  { label: 'São Paulo (BRT)', tz: 'America/Sao_Paulo' },
  { label: 'Buenos Aires (ART)', tz: 'America/Argentina/Buenos_Aires' },
  { label: 'Johannesburg (SAST)', tz: 'Africa/Johannesburg' },
  { label: 'Cairo (EET)', tz: 'Africa/Cairo' },
  { label: 'Nairobi (EAT)', tz: 'Africa/Nairobi' },
  { label: 'Toronto (EST/EDT)', tz: 'America/Toronto' },
  { label: 'Vancouver (PST/PDT)', tz: 'America/Vancouver' },
  { label: 'Mexico City (CST/CDT)', tz: 'America/Mexico_City' },
]

function formatInZone(date, tz) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true,
    })
    return fmt.format(date)
  } catch {
    return 'Invalid timezone'
  }
}

function getOffset(date, tz) {
  try {
    const utcMs = date.getTime()
    const localMs = new Date(date.toLocaleString('en-US', { timeZone: tz })).getTime()
    const diff = Math.round((localMs - new Date(date.toLocaleString('en-US', { timeZone: 'UTC' })).getTime()) / 60000)
    const sign = diff >= 0 ? '+' : '-'
    const h = Math.floor(Math.abs(diff) / 60).toString().padStart(2, '0')
    const m = (Math.abs(diff) % 60).toString().padStart(2, '0')
    return `UTC${sign}${h}:${m}`
  } catch {
    return ''
  }
}

function toLocalInput(date) {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${d}T${h}:${mi}`
}

export default function TimezoneConverter() {
  const [sourceDate, setSourceDate] = useState(() => toLocalInput(new Date()))
  const [sourceTz, setSourceTz] = useState('UTC')
  const [zones, setZones] = useState(['America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'])
  const [newZone, setNewZone] = useState('')
  const [now, setNow] = useState(new Date())
  const [useLive, setUseLive] = useState(false)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    if (!useLive) return
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [useLive])

  const baseDate = useLive ? now : (() => {
    try { return new Date(sourceDate) } catch { return new Date() }
  })()

  const addZone = () => {
    if (!newZone || zones.includes(newZone)) return
    setZones(prev => [...prev, newZone])
    setNewZone('')
  }

  const removeZone = (z) => setZones(prev => prev.filter(x => x !== z))

  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  const zoneLabel = (tz) => COMMON_ZONES.find(z => z.tz === tz)?.label || tz

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-2xl">🌍</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timezone Converter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Convert times across world timezones — live or manual</p>
        </div>
      </div>

      {/* Source time */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Source Date &amp; Time</label>
            <input
              type="datetime-local" value={sourceDate}
              onChange={e => { setSourceDate(e.target.value); setUseLive(false) }}
              disabled={useLive}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 transition"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Source Timezone</label>
            <select value={sourceTz} onChange={e => setSourceTz(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition">
              {COMMON_ZONES.map(z => <option key={z.tz} value={z.tz}>{z.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pb-0.5">
            <button onClick={() => { setUseLive(l => !l) }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${useLive ? 'bg-sky-500 text-white border-sky-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-sky-300'}`}>
              <RefreshCw size={14} className={useLive ? 'animate-spin' : ''} />
              Live
            </button>
            <button onClick={() => { setSourceDate(toLocalInput(new Date())); setUseLive(false) }}
              className="px-3 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-sky-300 transition-all">
              Now
            </button>
          </div>
        </div>

        {/* Source time display */}
        <div className="mt-4 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
          <p className="text-xs text-sky-500 dark:text-sky-400 font-semibold mb-0.5">{zoneLabel(sourceTz)} · {getOffset(baseDate, sourceTz)}</p>
          <p className="text-lg font-bold text-sky-700 dark:text-sky-300 font-mono">{formatInZone(baseDate, sourceTz)}</p>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3 mb-5">
        {zones.map((tz, i) => {
          const time = formatInZone(baseDate, tz)
          const offset = getOffset(baseDate, tz)
          return (
            <div key={tz} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 mb-0.5">{zoneLabel(tz)} · {offset}</p>
                <p className="font-mono text-sm text-gray-800 dark:text-gray-200 font-semibold">{time}</p>
              </div>
              <button onClick={() => copy(`${zoneLabel(tz)}: ${time}`, i)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shrink-0">
                {copied === i ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
              <button onClick={() => removeZone(tz)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Add zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add Timezone</p>
        <div className="flex gap-2">
          <select value={newZone} onChange={e => setNewZone(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition">
            <option value="">— Select a timezone —</option>
            {COMMON_ZONES.filter(z => !zones.includes(z.tz) && z.tz !== sourceTz).map(z => (
              <option key={z.tz} value={z.tz}>{z.label}</option>
            ))}
          </select>
          <button onClick={addZone} disabled={!newZone}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-sm font-semibold transition-all">
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Quick add popular zones */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-400 self-center">Quick add:</span>
          {COMMON_ZONES.filter(z => !zones.includes(z.tz) && z.tz !== sourceTz).slice(0, 6).map(z => (
            <button key={z.tz} onClick={() => setZones(prev => [...prev, z.tz])}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-all">
              {z.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
