import { useState, useRef, useCallback } from 'react'
import { ArrowLeft, Upload, Download, Key, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const API_KEY_STORAGE = 'doccraft_removebg_key'

export default function BackgroundRemover() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  const [showKey, setShowKey] = useState(false)
  const [original, setOriginal] = useState(null)   // { url, name, file }
  const [result, setResult] = useState(null)        // { url, name }
  const [loading, setLoading] = useState(false)
  const [sliderX, setSliderX] = useState(50)
  const [dragging, setDragging] = useState(false)
  const dropRef = useRef(null)
  const sliderRef = useRef(null)

  const saveKey = (k) => {
    setApiKey(k)
    localStorage.setItem(API_KEY_STORAGE, k)
  }

  const onFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return toast.error('Please select an image file')
    const url = URL.createObjectURL(file)
    setOriginal({ url, name: file.name, file })
    setResult(null)
    setSliderX(50)
  }

  const onDrop = useCallback(e => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    onFile(file)
  }, [])

  const removeBackground = async () => {
    if (!original) return toast.error('Please upload an image first')
    if (!apiKey.trim()) return toast.error('Please enter your remove.bg API key')

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('image_file', original.file)
      fd.append('size', 'auto')

      const res = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey.trim() },
        body: fd,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = err.errors?.[0]?.title || `Error ${res.status}`
        throw new Error(msg)
      }

      const blob = await res.blob()
      const name = original.name.replace(/\.[^.]+$/, '') + '_no_bg.png'
      setResult({ url: URL.createObjectURL(blob), name })
      toast.success('Background removed!')
    } catch (err) {
      toast.error(err.message || 'Failed to remove background')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = result.name
    a.click()
  }

  const reset = () => {
    if (original?.url) URL.revokeObjectURL(original.url)
    if (result?.url) URL.revokeObjectURL(result.url)
    setOriginal(null); setResult(null); setSliderX(50)
  }

  // Comparison slider drag
  const onSliderMouseDown = (e) => {
    setDragging(true)
    e.preventDefault()
  }
  const onMouseMove = (e) => {
    if (!dragging || !sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    setSliderX(x)
  }
  const onMouseUp = () => setDragging(false)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-2xl">✂️</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Background Remover</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Remove image backgrounds instantly using remove.bg AI</p>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Key size={14} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">remove.bg API Key</span>
          <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer"
            className="text-xs text-pink-500 hover:underline ml-auto">Get free API key →</a>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => saveKey(e.target.value)}
              placeholder="Enter your remove.bg API key…"
              className="w-full px-3 py-2 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
            <button onClick={() => setShowKey(s => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-start gap-1.5">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          Key is saved locally in your browser. Free tier: 50 API calls/month.
        </p>
      </div>

      {/* Upload zone */}
      {!original ? (
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => document.getElementById('bg-file-input').click()}
          className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all"
        >
          <Upload size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-600 dark:text-gray-300">Drop an image here or click to browse</p>
          <p className="text-sm text-gray-400 mt-1">Supports JPG, PNG, WebP · Max 12 MB</p>
          <input id="bg-file-input" type="file" accept="image/*" className="hidden"
            onChange={e => onFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Comparison viewer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {result ? 'Drag slider to compare' : original.name}
              </span>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <RefreshCw size={12} /> New image
              </button>
            </div>

            {result ? (
              /* Before / After slider */
              <div
                ref={sliderRef}
                className="relative select-none overflow-hidden cursor-col-resize"
                style={{ aspectRatio: '16/9', userSelect: 'none' }}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              >
                {/* Checkerboard bg for transparency */}
                <div className="absolute inset-0"
                  style={{ backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)', backgroundSize: '20px 20px' }} />
                {/* Result (right side — no bg) */}
                <img src={result.url} alt="Background removed"
                  className="absolute inset-0 w-full h-full object-contain" draggable={false} />
                {/* Original (left clip) */}
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}>
                  <img src={original.url} alt="Original"
                    className="absolute inset-0 w-full h-full object-contain" draggable={false} />
                </div>
                {/* Slider handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 cursor-col-resize"
                  style={{ left: `${sliderX}%` }}
                  onMouseDown={onSliderMouseDown}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xs font-bold">↔</span>
                  </div>
                </div>
                {/* Labels */}
                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-lg">Original</div>
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-lg">No BG</div>
              </div>
            ) : (
              <div className="p-4">
                <img src={original.url} alt="Preview"
                  className="max-h-72 mx-auto rounded-xl object-contain" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!result ? (
              <button
                onClick={removeBackground}
                disabled={loading || !apiKey.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <><RefreshCw size={16} className="animate-spin" /> Removing background…</>
                ) : (
                  <>✂️ Remove Background</>
                )}
              </button>
            ) : (
              <>
                <button onClick={download}
                  className="flex-1 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  <Download size={16} /> Download PNG
                </button>
                <button
                  onClick={() => { if (result?.url) URL.revokeObjectURL(result.url); setResult(null) }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-all">
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          ['🤖 AI-Powered', 'Uses remove.bg\'s deep learning model trained on millions of images'],
          ['🎯 High Accuracy', 'Works on people, products, animals, cars and complex backgrounds'],
          ['⚡ Fast', 'Results in under 5 seconds. Output PNG preserves full transparency'],
        ].map(([title, desc]) => (
          <div key={title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">{title}</p>
            <p className="text-xs text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
