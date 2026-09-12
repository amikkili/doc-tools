import { useState, useRef } from 'react'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function compressImage(file, quality, maxDim) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight
      if (maxDim && (w > maxDim || h > maxDim)) {
        const r = Math.min(maxDim / w, maxDim / h)
        w = Math.round(w * r); h = Math.round(h * r)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      const mime = file.type === 'image/png' && quality === 100 ? 'image/png' : 'image/jpeg'
      canvas.toBlob(b => b ? resolve({ blob: b, w, h, mime }) : reject(new Error('Failed')), mime, quality / 100)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

const MAX_DIMS = [0, 1920, 1280, 800, 640]
const fmt = n => n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`

export default function ImageCompressor() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [quality, setQuality] = useState(80)
  const [maxDim, setMaxDim] = useState(0)
  const [result, setResult] = useState(null)
  const [compressing, setCompressing] = useState(false)
  const inputRef = useRef()

  const onFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { toast.error('Select an image file'); return }
    setFile(f); setResult(null)
    setPreview(URL.createObjectURL(f))
  }

  const compress = async () => {
    if (!file) { toast.error('Upload an image first'); return }
    setCompressing(true)
    try {
      const { blob, w, h } = await compressImage(file, quality, maxDim || null)
      const url = URL.createObjectURL(blob)
      setResult({ url, size: blob.size, w, h, name: file.name.replace(/\.[^.]+$/, '') })
      const saved = Math.round((1 - blob.size / file.size) * 100)
      toast.success(saved > 0 ? `Compressed! Saved ${saved}%` : 'Done (no size reduction possible at these settings)')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setCompressing(false)
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = result.url; a.download = `${result.name}_compressed.jpg`; a.click()
  }

  const saving = result ? Math.round((1 - result.size / file.size) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-2xl">📉</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Image Compressor</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Reduce image file size with quality and dimension controls</p>
        </div>
      </div>

      {/* Upload */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all mb-6"
      >
        <Upload size={28} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{file ? file.name : 'Drop image here or click to browse'}</p>
        {file && <p className="text-xs text-gray-400 mt-1">{fmt(file.size)}</p>}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files[0])} />
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quality: <span className="text-teal-600 dark:text-teal-400">{quality}%</span>
            <span className="text-gray-400 font-normal ml-2">
              {quality >= 90 ? '(Best)' : quality >= 70 ? '(Good)' : quality >= 50 ? '(Medium)' : '(Low)'}
            </span>
          </label>
          <input type="range" min={10} max={100} step={5} value={quality}
            onChange={e => { setQuality(Number(e.target.value)); setResult(null) }}
            className="w-full accent-teal-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Small</span><span>Best quality</span></div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Max Dimension</label>
          <div className="flex flex-wrap gap-2">
            {[['None', 0], ['1920px', 1920], ['1280px', 1280], ['800px', 800], ['640px', 640]].map(([label, val]) => (
              <button key={val} onClick={() => { setMaxDim(val); setResult(null) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  maxDim === val ? 'bg-teal-500 text-white border-teal-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-teal-300'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={compress} disabled={!file || compressing}
        className="btn-primary w-full py-3 mb-6 disabled:opacity-50">
        {compressing ? 'Compressing…' : 'Compress Image'}
      </button>

      {file && result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Original · {fmt(file.size)}</p>
            <img src={preview} alt="original" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 object-contain max-h-56 bg-gray-50 dark:bg-gray-900" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Compressed · {fmt(result.size)}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${saving > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                {saving > 0 ? `↓ ${saving}% saved` : 'No reduction'}
              </span>
            </div>
            <img src={result.url} alt="compressed" className="w-full rounded-xl border border-teal-200 dark:border-teal-700 object-contain max-h-56 bg-gray-50 dark:bg-gray-900" />
            <div className="flex gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{result.w}×{result.h}px</span>
              <span>·</span>
              <span>{fmt(file.size)} → {fmt(result.size)}</span>
            </div>
            <button onClick={download} className="mt-2 w-full btn-primary flex items-center justify-center gap-2">
              <Download size={16} /> Download Compressed
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
