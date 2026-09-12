import { useState, useRef } from 'react'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const FORMATS = [
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg', hasQuality: true },
  { value: 'image/png', label: 'PNG', ext: 'png', hasQuality: false },
  { value: 'image/webp', label: 'WebP', ext: 'webp', hasQuality: true },
]

function convertImage(file, mimeType, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Conversion failed')), mimeType, quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

export default function WebpConverter() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [output, setOutput] = useState(null)
  const [format, setFormat] = useState('image/jpeg')
  const [quality, setQuality] = useState(90)
  const [converting, setConverting] = useState(false)
  const inputRef = useRef()

  const selectedFmt = FORMATS.find(f => f.value === format)

  const onFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { toast.error('Select an image file'); return }
    setFile(f); setOutput(null)
    setPreview(URL.createObjectURL(f))
  }

  const convert = async () => {
    if (!file) { toast.error('Upload an image first'); return }
    setConverting(true)
    try {
      const blob = await convertImage(file, format, quality / 100)
      const url = URL.createObjectURL(blob)
      setOutput({ url, size: blob.size, ext: selectedFmt.ext, name: file.name.replace(/\.[^.]+$/, '') })
      toast.success(`Converted to ${selectedFmt.label}!`)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setConverting(false)
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = output.url
    a.download = `${output.name}.${output.ext}`
    a.click()
  }

  const fmt = (n) => n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-2xl">🖼️</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">WebP / Image Converter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Convert WebP, JPG, PNG between formats in your browser</p>
        </div>
      </div>

      {/* Upload */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-all mb-6"
      >
        <Upload size={28} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{file ? file.name : 'Drop image here or click to browse'}</p>
        {file && <p className="text-xs text-gray-400 mt-1">{fmt(file.size)} · {file.type}</p>}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files[0])} />
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Output Format</label>
          <div className="flex gap-2">
            {FORMATS.map(f => (
              <button key={f.value} onClick={() => setFormat(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  format === f.value
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-sky-300'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {selectedFmt.hasQuality && (
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Quality: {quality}%
            </label>
            <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-sky-500" />
          </div>
        )}
        <button onClick={convert} disabled={!file || converting}
          className="btn-primary py-2 px-6 mt-5 disabled:opacity-50 disabled:cursor-not-allowed">
          {converting ? 'Converting…' : 'Convert'}
        </button>
      </div>

      {/* Preview + Result */}
      {preview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Original · {file && fmt(file.size)}
            </p>
            <img src={preview} alt="original" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 object-contain max-h-64 bg-gray-50 dark:bg-gray-900" />
          </div>
          {output && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Converted · {fmt(output.size)}
                {file && <span className={`ml-2 ${output.size < file.size ? 'text-green-500' : 'text-orange-400'}`}>
                  ({output.size < file.size ? `↓${Math.round((1 - output.size / file.size) * 100)}%` : `↑${Math.round((output.size / file.size - 1) * 100)}%`})
                </span>}
              </p>
              <img src={output.url} alt="converted" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 object-contain max-h-64 bg-gray-50 dark:bg-gray-900" />
              <button onClick={download} className="mt-3 w-full btn-primary flex items-center justify-center gap-2">
                <Download size={16} /> Download {selectedFmt.label}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
