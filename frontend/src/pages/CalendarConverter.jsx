import { useState, useMemo } from 'react'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

// ── Hijri ↔ Gregorian (Kuwaiti/tabular algorithm) ──────────────────────────

function gregorianToHijriParts(year, month, day) {
  // Use Intl for display format
  const date = new Date(year, month - 1, day)
  const parts = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
    day: 'numeric', month: 'numeric', year: 'numeric'
  }).formatToParts(date)
  const get = t => parseInt(parts.find(p => p.type === t)?.value || '0')
  return { year: get('year'), month: get('month'), day: get('day') }
}

function hijriToGregorian(hYear, hMonth, hDay) {
  // Kuwaiti algorithm: Hijri → Julian Day → Gregorian
  const jd = Math.floor((11 * hYear + 3) / 30) + 354 * hYear + 30 * hMonth
    - Math.floor((hMonth - 1) / 2) + hDay + 1948440 - 385

  // JD → Gregorian
  let l = jd + 68569
  const n = Math.floor((4 * l) / 146097)
  l = l - Math.floor((146097 * n + 3) / 4)
  const i = Math.floor((4000 * (l + 1)) / 1461001)
  l = l - Math.floor((1461 * i) / 4) + 31
  const j = Math.floor((80 * l) / 2447)
  const day = l - Math.floor((2447 * j) / 80)
  l = Math.floor(j / 11)
  const month = j + 2 - 12 * l
  const year = 100 * (n - 49) + i + l
  return { year, month, day }
}

const HIJRI_MONTHS = [
  'Muharram','Safar','Rabi al-Awwal','Rabi al-Thani',
  'Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban',
  'Ramadan','Shawwal','Dhul Qadah','Dhul Hijjah'
]

const GREG_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

function pad(n) { return String(n).padStart(2,'0') }

function CopyBtn({value}) {
  const [c,setC]=useState(false)
  return (
    <button onClick={()=>{navigator.clipboard.writeText(value);setC(true);setTimeout(()=>setC(false),1200);toast.success('Copied!')}}
      className="p-1 rounded text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
      {c?<Check size={12} className="text-green-500"/>:<Copy size={12}/>}
    </button>
  )
}

export default function CalendarConverter() {
  const [mode, setMode] = useState('greg-to-hijri')
  // Gregorian → Hijri state
  const [gDate, setGDate] = useState(() => {
    const t = new Date()
    return `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())}`
  })
  // Hijri → Gregorian state
  const [hYear, setHYear] = useState(1446)
  const [hMonth, setHMonth] = useState(3)
  const [hDay, setHDay] = useState(1)

  const gregToHijri = useMemo(() => {
    try {
      const [y,m,d] = gDate.split('-').map(Number)
      if(!y||!m||!d) return null
      const h = gregorianToHijriParts(y,m,d)
      return h
    } catch { return null }
  }, [gDate])

  const hijriToGreg = useMemo(() => {
    try { return hijriToGregorian(hYear, hMonth, hDay) }
    catch { return null }
  }, [hYear, hMonth, hDay])

  const today = new Date()
  const todayHijri = gregorianToHijriParts(today.getFullYear(), today.getMonth()+1, today.getDate())

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl">📅</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar Converter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gregorian ↔ Hijri (Islamic) calendar conversion</p>
        </div>
      </div>

      {/* Today banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl px-5 py-3 mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">Today (Gregorian)</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{GREG_MONTHS[today.getMonth()]} {today.getDate()}, {today.getFullYear()}</p>
        </div>
        <div className="text-emerald-300 dark:text-emerald-600 text-xl">↔</div>
        <div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">Today (Hijri)</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{HIJRI_MONTHS[todayHijri.month-1]} {todayHijri.day}, {todayHijri.year} AH</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 mb-6 w-fit">
        <button onClick={()=>setMode('greg-to-hijri')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode==='greg-to-hijri'?'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100':'text-gray-500 dark:text-gray-400'}`}>
          Gregorian → Hijri
        </button>
        <button onClick={()=>setMode('hijri-to-greg')}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${mode==='hijri-to-greg'?'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100':'text-gray-500 dark:text-gray-400'}`}>
          Hijri → Gregorian
        </button>
      </div>

      {mode === 'greg-to-hijri' ? (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gregorian Date</label>
            <input type="date" value={gDate} onChange={e=>setGDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"/>
          </div>

          {gregToHijri && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 p-5">
              <p className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-3">Hijri (Islamic) Date</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ['Day', gregToHijri.day],
                  ['Month', `${gregToHijri.month} – ${HIJRI_MONTHS[gregToHijri.month-1]}`],
                  ['Year (AH)', `${gregToHijri.year} AH`],
                ].map(([l,v])=>(
                  <div key={l}>
                    <p className="text-xs text-gray-400 mb-1">{l}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{v}</p>
                      <CopyBtn value={String(v)}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {gregToHijri.day} {HIJRI_MONTHS[gregToHijri.month-1]} {gregToHijri.year} AH
                </p>
                <CopyBtn value={`${gregToHijri.day} ${HIJRI_MONTHS[gregToHijri.month-1]} ${gregToHijri.year} AH`}/>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Hijri Date</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Day</label>
                <input type="number" min={1} max={30} value={hDay} onChange={e=>setHDay(+e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Month</label>
                <select value={hMonth} onChange={e=>setHMonth(+e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition">
                  {HIJRI_MONTHS.map((m,i)=><option key={m} value={i+1}>{i+1} – {m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Year (AH)</label>
                <input type="number" min={1} max={1600} value={hYear} onChange={e=>setHYear(+e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"/>
              </div>
            </div>
          </div>

          {hijriToGreg && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 p-5">
              <p className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-3">Gregorian Date</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {GREG_MONTHS[hijriToGreg.month-1]} {hijriToGreg.day}, {hijriToGreg.year}
                </p>
                <CopyBtn value={`${GREG_MONTHS[hijriToGreg.month-1]} ${hijriToGreg.day}, ${hijriToGreg.year}`}/>
              </div>
              <p className="text-sm text-gray-400 mt-1 font-mono">{hijriToGreg.year}-{pad(hijriToGreg.month)}-{pad(hijriToGreg.day)}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400">
        <strong className="text-gray-500">Note:</strong> Uses the tabular/civil Hijri calendar (Kuwaiti algorithm). The observational Hijri calendar may differ by 1–2 days depending on moon sighting.
      </div>
    </div>
  )
}
