import { useState } from 'react'
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'

const MAX_MB = 25
const MAX_BYTES = MAX_MB * 1024 * 1024

const GRADE_COLOR = {
  green:  { bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700 border-green-200',  ring: '#22c55e' },
  blue:   { bar: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700 border-blue-200',     ring: '#3b82f6' },
  yellow: { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',ring: '#eab308' },
  red:    { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700 border-red-200',         ring: '#ef4444' },
}

export default function PdfAnalyzer() {
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [typeResult, setType]   = useState(null)
  const [qualResult, setQual]   = useState(null)

  const onDrop = (accepted) => {
    const f = accepted[0]
    if (!f) return
    if (f.size > MAX_BYTES) { toast.error(`File exceeds ${MAX_MB} MB limit`); return }
    setFile(f)
    setType(null)
    setQual(null)
    runAnalysis(f)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  })

  const runAnalysis = async (f) => {
    setLoading(true)
    const fd1 = new FormData(); fd1.append('file', f)
    const fd2 = new FormData(); fd2.append('file', f)
    try {
      const [typeRes, qualRes] = await Promise.all([
        axios.post('/api/ml/detect-type', fd1),
        axios.post('/api/ml/conversion-quality', fd2),
      ])
      setType(typeRes.data)
      setQual(qualRes.data)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setFile(null); setType(null); setQual(null) }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl">🔮</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart PDF Analyzer</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Upload any PDF — we'll detect its type and predict conversion quality instantly
          </p>
        </div>
      </div>

      {/* Upload zone */}
      {!file && (
        <div {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}>
          <input {...getInputProps()} />
          <div className="text-4xl mb-3">📄</div>
          <p className="font-semibold text-gray-700">Drop a PDF here or click to browse</p>
          <p className="text-sm text-gray-400 mt-1">Max {MAX_MB} MB · PDF only</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
          <Loader2 size={32} className="animate-spin text-violet-500" />
          <p className="text-sm">Analysing document...</p>
        </div>
      )}

      {/* Results */}
      {!loading && typeResult && qualResult && (
        <div className="space-y-5">
          {/* File info bar */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-500">📄</span>
              <span className="font-medium text-gray-700 truncate max-w-xs">{file.name}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              Analyse another
            </button>
          </div>

          {/* Document Type Card */}
          <TypeCard result={typeResult} />

          {/* Conversion Quality Card */}
          <QualityCard result={qualResult} />
        </div>
      )}
    </div>
  )
}

// ── Document Type Card ────────────────────────────────────────────────────

function TypeCard({ result }) {
  const conf = Math.round(result.confidence * 100)
  const topScores = Object.entries(result.all_scores || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{result.icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-lg">{result.label}</h2>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border
              ${conf >= 55 ? 'bg-green-100 text-green-700 border-green-200' :
                conf >= 30 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                             'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {conf}% confidence
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{result.description}</p>
        </div>
      </div>

      {/* Score bars for top types */}
      {topScores.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type Breakdown</p>
          {topScores.map(([type, score]) => {
            const pct = Math.round(score * 100)
            const isTop = type === result.type
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-28 capitalize">{type}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isTop ? 'bg-violet-500' : 'bg-gray-300'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Suggested tools */}
      {result.suggested_tools?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Suggested Tools</p>
          <div className="flex flex-wrap gap-2">
            {result.suggested_tools.map(t => (
              <Link key={t.path} to={t.path}
                className="group inline-flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                title={t.reason}>
                {t.name}
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Conversion Quality Card ───────────────────────────────────────────────

function QualityCard({ result }) {
  const c = GRADE_COLOR[result.color] ?? GRADE_COLOR.blue
  const circumference = 2 * Math.PI * 15  // r=15

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-4">
        {/* Radial score dial */}
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke={c.ring}
              strokeWidth="3"
              strokeDasharray={`${(result.score / 100) * circumference} ${circumference}`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${c.badge.split(' ')[1]}`}>
            {result.score}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-bold text-gray-900 text-lg">PDF→Word Quality</h2>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${c.badge}`}>
              {result.grade}
            </span>
            {result.is_scanned && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                Scanned
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 leading-snug">{result.recommendation}</p>
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Score Breakdown</p>
        {result.breakdown.map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-400">{item.score}/{item.max}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
                style={{ width: `${(item.score / item.max) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
          </div>
        ))}
      </div>

      <Link
        to="/pdf-to-word"
        className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-colors">
        Convert this PDF to Word
        <ArrowRight size={15} />
      </Link>
    </div>
  )
}
