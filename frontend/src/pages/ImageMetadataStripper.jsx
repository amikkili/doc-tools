import { useState, useRef } from 'react'
import { ArrowLeft, Download, Upload, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const COMMON_TAGS = ['GPS Location','Camera Make/Model','Date & Time','Software','Artist/Copyright','Exposure Settings','Thumbnail Data','Color Profile']

function stripMetadata(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      canvas.toBlob(blob => blob ? resolve({ blob, width: img.naturalWidth, height: img.naturalHeight }) : reject(new Error('Failed')), outType, 0.95)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

const fmt = n => n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`

export default function ImageMetadataStripper() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState(null)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef()

  const onFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { toast.error('Select a JPG, PNG or WebP image'); return }
    setFile(f); setResult(null)
    setPreview(URL.createObjectURL(f))
  }

  const strip = async () => {
    if (!file) { toast.error('Upload an image first'); return }
    setProcessing(true)
    try {
      const { blob, width, height } = await stripMetadata(file)
      const url = URL.createObjectURL(blob)
      const ext = file.type === 'image/png' ? 'png' : 'jpg'
      setResult({ url, size: blob.size, ext, width, height, name: file.name.replace(/\.[^.]+$/, '') })
      toast.success('Metadata stripped!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setProcessing(false)
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = result.url
    a.download = `${result.name}_clean.${result.ext}`
    a.click()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">🔍</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Image Metadata Stripper</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Remove EXIF data, GPS location, camera info and other metadata from images</p>
        </div>
      </div>

      {/* What gets removed */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Metadata removed</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map(t => (
            <span key={t} className="flex items-center gap-1 text-xs bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
              <CheckCircle size={11} /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-all mb-6"
      >
        <Upload size={28} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{file ? file.name : 'Drop image here or click to browse'}</p>
        {file && <p className="text-xs text-gray-400 mt-1">{fmt(file.size)} · {file.type}</p>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => onFile(e.target.files[0])} />
      </div>

      <button onClick={strip} disabled={!file || processing}
        className="btn-primary w-full py-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed">
        {processing ? 'Stripping metadata…' : 'Strip Metadata'}
      </button>

      {preview && result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Original · {fmt(file.size)}</p>
            <img src={preview} alt="original" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 object-contain max-h-64 bg-gray-50 dark:bg-gray-900" />
          </div>
          <div>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">
              Cleaned · {fmt(result.size)} · {result.width}×{result.height}px
            </p>
            <img src={result.url} alt="stripped" className="w-full rounded-xl border border-green-200 dark:border-green-700 object-contain max-h-64 bg-gray-50 dark:bg-gray-900" />
            <button onClick={download} className="mt-3 w-full btn-primary flex items-center justify-center gap-2">
              <Download size={16} /> Download Clean Image
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        Processing happens entirely in your browser — your images are never uploaded to any server.
      </p>
    </div>
  )
}
