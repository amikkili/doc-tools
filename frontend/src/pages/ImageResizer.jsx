import { useState, useRef, useCallback } from 'react'
import { Download, Upload, Lock, Unlock, RefreshCw } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { validateFile } from '../lib/validateFile'

const fmt = n => n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`

function Badge({ children, color = 'gray' }) {
  const colors = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    red:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    blue:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    gray:  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  }
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[color]}`}>{children}</span>
}

export default function ImageResizer() {
  const [file, setFile]               = useState(null)
  const [origUrl, setOrigUrl]         = useState(null)
  const [origDims, setOrigDims]       = useState(null)   // { w, h }
  const [width, setWidth]             = useState('')
  const [height, setHeight]           = useState('')
  const [locked, setLocked]           = useState(true)
  const [format, setFormat]           = useState('jpeg')
  const [quality, setQuality]         = useState(90)
  const [grayscale, setGrayscale]     = useState(false)
  const [processing, setProcessing]   = useState(false)
  const [result, setResult]           = useState(null)   // { url, size, w, h, ext }
  const inputRef = useRef()
  const dragRef  = useRef(false)

  const loadFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (origUrl) URL.revokeObjectURL(origUrl)
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)

    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      setOrigDims({ w: img.naturalWidth, h: img.naturalHeight })
      setWidth(String(img.naturalWidth))
      setHeight(String(img.naturalHeight))
    }
    img.src = url
    setFile(f)
    setOrigUrl(url)
  }, [origUrl, result])

  const onDrop = (e) => {
    e.preventDefault()
    dragRef.current = false
    loadFile(e.dataTransfer.files[0])
  }

  // Keep aspect ratio when either dimension changes
  const onWidthChange = (val) => {
    setWidth(val)
    if (locked && origDims && val) {
      const w = parseInt(val, 10)
      if (!isNaN(w)) setHeight(String(Math.round(w * origDims.h / origDims.w)))
    }
    setResult(null)
  }
  const onHeightChange = (val) => {
    setHeight(val)
    if (locked && origDims && val) {
      const h = parseInt(val, 10)
      if (!isNaN(h)) setWidth(String(Math.round(h * origDims.w / origDims.h)))
    }
    setResult(null)
  }

  const resetDims = () => {
    if (!origDims) return
    setWidth(String(origDims.w))
    setHeight(String(origDims.h))
    setResult(null)
  }

  const process = async () => {
    if (!file) { toast.error('Upload an image first'); return }
    const v = validateFile(file, 'image')
    if (!v.ok) { toast.error(v.message); return }
    setProcessing(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (width)  fd.append('width',  parseInt(width, 10))
      if (height) fd.append('height', parseInt(height, 10))
      fd.append('maintain_aspect', locked)
      fd.append('output_format', format)
      fd.append('quality', quality)
      fd.append('grayscale', grayscale)

      const res = await axios.post('/api/image/process', fd, {
        responseType: 'blob',
        timeout: 30000,
      })

      const blob = new Blob([res.data])
      const url  = URL.createObjectURL(blob)

      // Read output dimensions
      const img = new Image()
      img.onload = () => {
        if (result?.url) URL.revokeObjectURL(result.url)
        const ext = format === 'jpeg' ? 'jpg' : format
        setResult({ url, size: blob.size, w: img.naturalWidth, h: img.naturalHeight, ext })
        toast.success('Image processed!')
      }
      img.src = url
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Processing failed'
      toast.error(typeof msg === 'string' ? msg : 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = `${(file.name || 'image').replace(/\.[^.]+$/, '')}_resized.${result.ext}`
    a.click()
  }

  const sizeChange = result ? Math.round((1 - result.size / file.size) * 100) : 0

  const FORMATS = [
    { id: 'jpeg', label: 'JPEG' },
    { id: 'png',  label: 'PNG'  },
    { id: 'webp', label: 'WebP' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-2xl">🖼️</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Image Resizer</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Resize to exact dimensions, convert format, adjust quality — see before &amp; after instantly</p>
        </div>
      </div>

      {/* Drop zone */}
      {!file && (
        <div
          onClick={() => inputRef.current.click()}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); dragRef.current = true }}
          onDragLeave={() => { dragRef.current = false }}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-16 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all mb-6"
        >
          <Upload size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-base font-medium text-gray-600 dark:text-gray-400">Drop an image here or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">JPEG · PNG · WebP · HEIC · GIF · BMP — up to 25 MB</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => loadFile(e.target.files[0])} />

      {file && (
        <>
          {/* Controls */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Dimensions */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Dimensions (px)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min={1} max={10000} value={width}
                  onChange={e => onWidthChange(e.target.value)}
                  placeholder="W"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button
                  onClick={() => { setLocked(l => !l); setResult(null) }}
                  className={`p-2 rounded-lg border transition-all flex-shrink-0 ${locked ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'border-gray-200 dark:border-gray-600 text-gray-400 hover:border-violet-300'}`}
                  title={locked ? 'Lock aspect ratio (on)' : 'Lock aspect ratio (off)'}
                >
                  {locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                <input
                  type="number" min={1} max={10000} value={height}
                  onChange={e => onHeightChange(e.target.value)}
                  placeholder="H"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button onClick={resetDims} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-all flex-shrink-0" title="Reset to original">
                  <RefreshCw size={14} />
                </button>
              </div>
              {origDims && (
                <p className="text-xs text-gray-400 mt-1.5">Original: {origDims.w} × {origDims.h}px &nbsp;·&nbsp; {fmt(file.size)}</p>
              )}
            </div>

            {/* Format */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Output Format</label>
              <div className="flex gap-1.5">
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => { setFormat(f.id); setResult(null) }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${format === f.id ? 'bg-violet-500 text-white border-violet-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-violet-300'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality + Grayscale */}
            <div>
              {format !== 'png' ? (
                <>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Quality: <span className="text-violet-600 dark:text-violet-400">{quality}%</span>
                  </label>
                  <input type="range" min={10} max={95} step={5} value={quality}
                    onChange={e => { setQuality(Number(e.target.value)); setResult(null) }}
                    className="w-full accent-violet-500 mb-2" />
                </>
              ) : (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">PNG</label>
                  <p className="text-xs text-gray-400">Lossless — supports transparency</p>
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => { setGrayscale(g => !g); setResult(null) }}
                  className={`relative w-9 h-5 rounded-full transition-colors ${grayscale ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${grayscale ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Grayscale</span>
              </label>
            </div>
          </div>

          {/* Process button */}
          <button
            onClick={process}
            disabled={processing}
            className="w-full py-3 mb-8 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
          >
            {processing ? 'Processing…' : '✦ Resize & Process Image'}
          </button>

          {/* Before / After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Before */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Before</p>
                {origDims && <Badge color="gray">{origDims.w} × {origDims.h}px</Badge>}
                <Badge color="gray">{fmt(file.size)}</Badge>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#374151_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
                <img src={origUrl} alt="original" className="w-full object-contain max-h-80" />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{file.name}</p>
            </div>

            {/* After */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className={`text-xs font-semibold uppercase tracking-wider ${result ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`}>After</p>
                {result && <Badge color="blue">{result.w} × {result.h}px</Badge>}
                {result && <Badge color="blue">{fmt(result.size)}</Badge>}
                {result && (
                  <Badge color={sizeChange > 0 ? 'green' : sizeChange < 0 ? 'red' : 'gray'}>
                    {sizeChange > 0 ? `↓ ${sizeChange}% smaller` : sizeChange < 0 ? `↑ ${Math.abs(sizeChange)}% larger` : 'Same size'}
                  </Badge>
                )}
              </div>
              <div className={`rounded-2xl border-2 overflow-hidden transition-all min-h-[160px] flex items-center justify-center bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#374151_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] ${result ? 'border-violet-400' : 'border-dashed border-gray-300 dark:border-gray-600'}`}>
                {result
                  ? <img src={result.url} alt="processed" className="w-full object-contain max-h-80" />
                  : <div className="text-center py-10 px-4">
                      <p className="text-4xl mb-2">✦</p>
                      <p className="text-sm text-gray-400">Result appears here after processing</p>
                    </div>
                }
              </div>
              {result && (
                <div className="mt-3 flex gap-3">
                  <button onClick={download}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
                    <Download size={15} /> Download {result.ext.toUpperCase()}
                  </button>
                  <button onClick={() => { loadFile(file) }}
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-violet-300 hover:text-violet-600 transition-all">
                    Reset
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Change image link */}
          <div className="mt-6 text-center">
            <button onClick={() => inputRef.current.click()} className="text-xs text-gray-400 hover:text-violet-500 underline underline-offset-2 transition-colors">
              ← Change image
            </button>
          </div>
        </>
      )}
    </div>
  )
}
