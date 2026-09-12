import { useState, useCallback } from 'react'
import { ArrowLeft, Copy, Check, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const PRESETS = [
  { name: 'Sunset', stops: [{ id: 1, color: '#f97316', pos: 0 }, { id: 2, color: '#ec4899', pos: 50 }, { id: 3, color: '#8b5cf6', pos: 100 }] },
  { name: 'Ocean', stops: [{ id: 1, color: '#06b6d4', pos: 0 }, { id: 2, color: '#3b82f6', pos: 100 }] },
  { name: 'Forest', stops: [{ id: 1, color: '#4ade80', pos: 0 }, { id: 2, color: '#16a34a', pos: 100 }] },
  { name: 'Fire', stops: [{ id: 1, color: '#fbbf24', pos: 0 }, { id: 2, color: '#ef4444', pos: 100 }] },
  { name: 'Midnight', stops: [{ id: 1, color: '#1e1b4b', pos: 0 }, { id: 2, color: '#312e81', pos: 50 }, { id: 3, color: '#0f172a', pos: 100 }] },
  { name: 'Rose', stops: [{ id: 1, color: '#fecdd3', pos: 0 }, { id: 2, color: '#f43f5e', pos: 100 }] },
]

let nextId = 10

export default function CssGradient() {
  const [type, setType] = useState('linear')
  const [angle, setAngle] = useState(135)
  const [radialShape, setRadialShape] = useState('circle')
  const [stops, setStops] = useState([
    { id: 1, color: '#6366f1', pos: 0 },
    { id: 2, color: '#ec4899', pos: 100 },
  ])
  const [copied, setCopied] = useState(false)

  const stopsStr = stops
    .slice().sort((a, b) => a.pos - b.pos)
    .map(s => `${s.color} ${s.pos}%`)
    .join(', ')

  const gradient =
    type === 'linear' ? `linear-gradient(${angle}deg, ${stopsStr})`
    : type === 'radial' ? `radial-gradient(${radialShape} at center, ${stopsStr})`
    : `conic-gradient(from ${angle}deg at center, ${stopsStr})`

  const css = `background: ${gradient};`

  const addStop = () => {
    const sorted = [...stops].sort((a, b) => a.pos - b.pos)
    const mid = sorted.length > 1
      ? Math.round((sorted[0].pos + sorted[1].pos) / 2)
      : 50
    setStops(prev => [...prev, { id: nextId++, color: '#ffffff', pos: mid }])
  }

  const updateStop = (id, field, value) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const removeStop = (id) => {
    if (stops.length <= 2) { toast.error('Need at least 2 color stops'); return }
    setStops(prev => prev.filter(s => s.id !== id))
  }

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('CSS copied!')
  }

  const loadPreset = (preset) => {
    setStops(preset.stops.map(s => ({ ...s })))
  }

  const DIRECTIONS = [
    { label: '↑', angle: 0 }, { label: '↗', angle: 45 }, { label: '→', angle: 90 },
    { label: '↘', angle: 135 }, { label: '↓', angle: 180 }, { label: '↙', angle: 225 },
    { label: '←', angle: 270 }, { label: '↖', angle: 315 },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>🌈</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CSS Gradient Maker</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create linear, radial and conic CSS gradients visually</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-5">
          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Type</label>
            <div className="flex gap-2">
              {['linear', 'radial', 'conic'].map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${
                    type === t ? 'bg-violet-500 text-white border-violet-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-violet-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          {(type === 'linear' || type === 'conic') && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Angle: {angle}°
              </label>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {DIRECTIONS.map(d => (
                  <button key={d.angle} onClick={() => setAngle(d.angle)}
                    className={`py-1.5 rounded text-sm border transition-all ${
                      angle === d.angle ? 'bg-violet-500 text-white border-violet-500' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-600 hover:border-violet-300'
                    }`}>
                    {d.label}
                  </button>
                ))}
              </div>
              <input type="range" min={0} max={360} value={angle} onChange={e => setAngle(Number(e.target.value))}
                className="w-full accent-violet-500" />
            </div>
          )}

          {type === 'radial' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shape</label>
              <div className="flex gap-2">
                {['circle', 'ellipse'].map(s => (
                  <button key={s} onClick={() => setRadialShape(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${
                      radialShape === s ? 'bg-violet-500 text-white border-violet-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Stops */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color Stops</label>
              <button onClick={addStop} className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {stops.slice().sort((a, b) => a.pos - b.pos).map(stop => (
                <div key={stop.id} className="flex items-center gap-2">
                  <input type="color" value={stop.color} onChange={e => updateStop(stop.id, 'color', e.target.value)}
                    className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer" />
                  <input type="range" min={0} max={100} value={stop.pos} onChange={e => updateStop(stop.id, 'pos', Number(e.target.value))}
                    className="flex-1 accent-violet-500" />
                  <span className="text-xs text-gray-400 w-8 text-right">{stop.pos}%</span>
                  <button onClick={() => removeStop(stop.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => loadPreset(p)}
                  className="h-8 rounded-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform overflow-hidden"
                  title={p.name}
                  style={{ background: `linear-gradient(90deg, ${p.stops.map(s => `${s.color} ${s.pos}%`).join(', ')})` }}>
                  <span className="sr-only">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview + CSS */}
        <div className="lg:col-span-2 space-y-4">
          {/* Large preview */}
          <div className="rounded-2xl h-64 border border-gray-200 dark:border-gray-700" style={{ background: gradient }} />

          {/* Gradient bar */}
          <div className="h-8 rounded-xl border border-gray-200 dark:border-gray-700" style={{ background: `linear-gradient(90deg, ${stopsStr})` }} />

          {/* CSS Output */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Generated CSS</label>
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 relative">
              <pre className="whitespace-pre-wrap break-all">{css}</pre>
              <button onClick={copy}
                className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all">
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Also show full gradient value */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
            {gradient}
          </div>
        </div>
      </div>
    </div>
  )
}
