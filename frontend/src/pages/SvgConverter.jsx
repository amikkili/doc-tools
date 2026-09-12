import { useState, useRef } from 'react'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const FORMATS = [
  { value: 'image/png', label: 'PNG', ext: 'png', hasQuality: false },
  { value: 'image/webp', label: 'WebP', ext: 'webp', hasQuality: true },
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg', hasQuality: true },
]

const SCALES = [1, 2, 3, 4]

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <circle cx="50" cy="50" r="40" fill="#6366f1" />
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif">SVG</text>
</svg>`

function svgToImage(svgCode, mimeType, scale, quality) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const w = (img.naturalWidth || 512) * scale
      const h = (img.naturalHeight || 512) * scale
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      if (mimeType === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h) }
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      canvas.toBlob(b => b ? resolve({ blob: b, width: w, height: h }) : reject(new Error('Failed')), mimeType, quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to render SVG')) }
    img.src = url
  })
}

export default function SvgConverter() {
  const [svgCode, setSvgCode] = useState('')
  const [format, setFormat] = useState('image/png')
  const [scale, setScale] = useState(2)
  const [quality, setQuality] = useState(90)
  const [result, setResult] = useState(null)
  const [converting, setConverting] = useState(false)
  const inputRef = useRef()
  const selectedFmt = FORMATS.find(f => f.value === format)

  const onFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setSvgCode(e.target.result)
    reader.readAsText(file)
  }

  const convert = async () => {
    const code = svgCode.trim()
    if (!code) { toast.error('Paste SVG code or upload a file'); return }
    if (!code.includes('<svg')) { toast.error('Doesn\'t look like SVG'); return }
    setConverting(true)
    try {
      const { blob, width, height } = await svgToImage(code, format, scale, quality / 100)
      const url = URL.createObjectURL(blob)
      setResult({ url, size: blob.size, width, height })
      toast.success(`Converted to ${selectedFmt.label}!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setConverting(false)
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = result.url; a.download = `converted.${selectedFmt.ext}`; a.click()
  }

  const fmt = n => n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">⬡</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SVG to PNG / WebP / JPG</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Convert SVG to raster images at any resolution</p>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Output Format</label>
          <div className="flex gap-2">
            {FORMATS.map(f => (
              <button key={f.value} onClick={() => setFormat(f.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  format === f.value ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Scale</label>
          <div className="flex gap-2">
            {SCALES.map(s => (
              <button key={s} onClick={() => setScale(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  scale === s ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                }`}>
                {s}×
              </button>
            ))}
          </div>
        </div>
        {selectedFmt.hasQuality && (
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quality: {quality}%</label>
            <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-indigo-500" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SVG Code</label>
            <div className="flex gap-2">
              <button onClick={() => setSvgCode(SAMPLE_SVG)} className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300">Sample</button>
              <button onClick={() => inputRef.current.click()} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <Upload size={12} /> Upload
              </button>
              <input ref={inputRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={e => onFile(e.target.files[0])} />
            </div>
          </div>
          <textarea
            value={svgCode}
            onChange={e => { setSvgCode(e.target.value); setResult(null) }}
            placeholder="Paste SVG code here or upload a .svg file..."
            className="w-full h-64 font-mono text-xs border border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">SVG Preview</label>
          <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-64 overflow-hidden p-4">
            {svgCode ? (
              <div dangerouslySetInnerHTML={{ __html: svgCode }} className="max-w-full max-h-full [&>svg]:max-w-full [&>svg]:max-h-48" />
            ) : (
              <p className="text-sm text-gray-400">SVG preview appears here</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={convert} disabled={!svgCode.trim() || converting}
          className="btn-primary py-2 px-6 disabled:opacity-50">
          {converting ? 'Converting…' : `Convert to ${selectedFmt.label}`}
        </button>
        {result && (
          <button onClick={download} className="btn-secondary flex items-center gap-2 py-2 px-4">
            <Download size={16} /> Download ({fmt(result.size)} · {result.width}×{result.height}px)
          </button>
        )}
      </div>

      {result && (
        <div className="mt-6">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Result Preview</label>
          <img src={result.url} alt="converted" className="max-w-full max-h-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 object-contain" />
        </div>
      )}
    </div>
  )
}
