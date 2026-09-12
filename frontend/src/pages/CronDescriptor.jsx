import { useState } from 'react'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_ABBR = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function expandField(val, min, max) {
  if (val === '*') {
    const r = []; for (let i = min; i <= max; i++) r.push(i); return r
  }
  const result = []
  for (const part of val.split(',')) {
    if (part === '*') { for (let i = min; i <= max; i++) result.push(i) }
    else if (part.includes('/')) {
      const [range, step] = part.split('/')
      const [s, e] = range === '*' ? [min, max] : range.includes('-') ? range.split('-').map(Number) : [parseInt(range), max]
      for (let i = s; i <= e; i += parseInt(step)) result.push(i)
    } else if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number)
      for (let i = s; i <= e; i++) result.push(i)
    } else {
      result.push(parseInt(part))
    }
  }
  return [...new Set(result)].sort((a, b) => a - b)
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function joinList(arr) {
  if (arr.length === 1) return arr[0]
  if (arr.length === 2) return arr[0] + ' and ' + arr[1]
  return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1]
}

function describeTime(minute, hour) {
  if (minute === '*' && hour === '*') return 'Every minute'
  if (minute.startsWith('*/') && hour === '*') return `Every ${minute.slice(2)} minutes`
  if (hour === '*') {
    if (minute.startsWith('*/')) return `Every ${minute.slice(2)} minutes`
    const mins = expandField(minute, 0, 59)
    return `At minute ${joinList(mins.map(String))} of every hour`
  }

  const hours = expandField(hour, 0, 23)
  const mins = expandField(minute, 0, 59)

  if (mins.length === 1 && mins[0] === 0 && hours.length === 1) {
    const h = hours[0], ampm = h < 12 ? 'AM' : 'PM', h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `At ${h12}:00 ${ampm}`
  }

  const times = hours.flatMap(h =>
    mins.map(m => {
      const ampm = h < 12 ? 'AM' : 'PM', h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
    })
  )
  return `At ${joinList(times)}`
}

function describeCron(expr) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length < 5 || parts.length > 6) throw new Error('Expected 5 or 6 fields: minute hour day month weekday')

  const [minute, hour, dom, month, dow] = parts

  let description = describeTime(minute, hour)

  // Month constraint
  if (month !== '*') {
    const months = expandField(month, 1, 12)
    description += `, in ${joinList(months.map(m => MONTHS[m]))}`
  }

  // Day constraints
  if (dom !== '*' && dow !== '*') {
    const doms = expandField(dom, 1, 31)
    const dows = expandField(dow, 0, 6)
    description += `, on day ${joinList(doms.map(ordinal))} of the month and on ${joinList(dows.map(d => DAYS[d]))}`
  } else if (dom !== '*') {
    if (dom.startsWith('*/')) {
      description += `, every ${dom.slice(2)} days`
    } else {
      const doms = expandField(dom, 1, 31)
      description += `, on the ${joinList(doms.map(ordinal))} of the month`
    }
  } else if (dow !== '*') {
    const dows = expandField(dow, 0, 6)
    description += `, on ${joinList(dows.map(d => DAYS[d]))}`
  }

  return description
}

function getNextRuns(expr, count = 6) {
  try {
    const parts = expr.trim().split(/\s+/)
    const [minute, hour, dom, month, dow] = parts
    const mins = expandField(minute, 0, 59)
    const hours = expandField(hour, 0, 23)
    const doms = dom === '*' ? null : expandField(dom, 1, 31)
    const months = month === '*' ? null : expandField(month, 1, 12)
    const dows = dow === '*' ? null : expandField(dow, 0, 6)

    const results = []
    const now = new Date()
    now.setSeconds(0, 0)
    now.setMinutes(now.getMinutes() + 1)

    let d = new Date(now)
    let limit = 0

    while (results.length < count && limit++ < 500000) {
      const mo = d.getMonth() + 1
      const da = d.getDate()
      const hw = d.getDay()
      const hr = d.getHours()
      const mi = d.getMinutes()

      if (months && !months.includes(mo)) {
        d.setMonth(d.getMonth() + 1, 1); d.setHours(0, 0, 0, 0); continue
      }
      if (doms && !doms.includes(da) && dows && !dows.includes(hw)) {
        d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); continue
      }
      if (doms && !doms.includes(da) && !dows) {
        d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); continue
      }
      if (dows && !dows.includes(hw) && !doms) {
        d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); continue
      }
      if (!hours.includes(hr)) {
        d.setHours(d.getHours() + 1, 0, 0, 0); continue
      }
      if (!mins.includes(mi)) {
        d.setMinutes(d.getMinutes() + 1, 0, 0); continue
      }

      results.push(new Date(d))
      d.setMinutes(d.getMinutes() + 1, 0, 0)
    }
    return results
  } catch { return [] }
}

const EXAMPLES = [
  { expr: '0 9 * * 1-5', label: 'Weekdays at 9 AM' },
  { expr: '*/15 * * * *', label: 'Every 15 minutes' },
  { expr: '0 0 1 * *', label: '1st of every month' },
  { expr: '0 12 * * 0', label: 'Sundays at noon' },
  { expr: '30 23 * * *', label: 'Daily at 11:30 PM' },
  { expr: '0 6 * * 1', label: 'Monday mornings' },
  { expr: '0 0 * * *', label: 'Every midnight' },
  { expr: '*/5 8-18 * * 1-5', label: 'Every 5 min, 8-6 PM weekdays' },
]

const FIELD_NAMES = ['Minute', 'Hour', 'Day', 'Month', 'Weekday']

export default function CronDescriptor() {
  const [expr, setExpr] = useState('0 9 * * 1-5')
  const [result, setResult] = useState(() => {
    try { return { desc: describeCron('0 9 * * 1-5'), next: getNextRuns('0 9 * * 1-5') } } catch { return null }
  })
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const evaluate = (val) => {
    const v = val ?? expr
    try {
      const desc = describeCron(v)
      const next = getNextRuns(v)
      setResult({ desc, next }); setError('')
    } catch (e) {
      setError(e.message); setResult(null)
    }
  }

  const fields = expr.trim().split(/\s+/).slice(0, 5)
  const fieldDescs = [
    '0-59 (minute)', '0-23 (hour)', '1-31 (day)', '1-12 (month)', '0-6 (weekday, 0=Sun)'
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl">⏰</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cron Expression Descriptor</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Translate cron expressions to plain English with next run times</p>
        </div>
      </div>

      {/* Input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cron Expression</label>
        <div className="flex gap-2">
          <input
            value={expr}
            onChange={e => { setExpr(e.target.value); evaluate(e.target.value) }}
            onKeyDown={e => e.key === 'Enter' && evaluate()}
            placeholder="*/15 * * * *"
            className={`flex-1 font-mono text-lg border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
              error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 dark:border-gray-700 focus:ring-amber-300'
            }`}
          />
          <button onClick={() => { navigator.clipboard.writeText(expr); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="btn-secondary px-3">
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Field breakdown */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {FIELD_NAMES.map((name, i) => (
          <div key={name} className="text-center">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-2 font-mono text-base font-bold text-amber-700 dark:text-amber-300 mb-1">
              {fields[i] ?? '*'}
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{name}</p>
            <p className="text-[9px] text-gray-400 hidden sm:block">{fieldDescs[i]}</p>
          </div>
        ))}
      </div>

      {result && (
        <div className="space-y-4 mb-8">
          {/* Description */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Runs</p>
            <p className="text-lg font-medium text-green-900 dark:text-green-100">{result.desc}</p>
          </div>

          {/* Next run times */}
          {result.next.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Next {result.next.length} Run Times</p>
              <div className="space-y-1.5">
                {result.next.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      {' at '}
                      {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Common Examples</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXAMPLES.map(({ expr: ex, label }) => (
            <button key={ex} onClick={() => { setExpr(ex); evaluate(ex) }}
              className="text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group">
              <p className="font-mono text-xs text-amber-600 dark:text-amber-400 group-hover:text-amber-700">{ex}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick reference */}
      <details className="mt-8">
        <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none">
          Cron Syntax Quick Reference ▸
        </summary>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            ['*', 'Every value'],
            ['*/n', 'Every n-th value'],
            ['n', 'Specific value'],
            ['n-m', 'Range from n to m'],
            ['n,m', 'List: n and m'],
            ['n-m/s', 'Range with step s'],
          ].map(([sym, desc]) => (
            <div key={sym} className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{sym}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">{desc}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
