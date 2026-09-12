import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import JSZip from 'jszip'

const SIZES = [16, 32, 48, 64, 128, 256]

function renderToCanvas(source, size, bg, padding) {
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size) }
  const p = Math.round(size * padding / 100)
  ctx.drawImage(source, p, p, size - p * 2, size - p * 2)
  return canvas
}

function emojiToCanvas(emoji, size, bg) {
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size) }
  ctx.font = `${size * 0.75}px serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(emoji, size / 2, size / 2)
  return canvas
}

export default function FaviconGenerator() {
  const [mode, setMode] = useState('image') // 'image' | 'emoji'
  const [imgEl, setImgEl] = useState(null)
  const [emoji, setEmoji] = useState('🚀')
  const [bg, setBg] = useState('#ffffff')
  const [transparent, setTransparent] = useState(false)
  const [padding, setPadding] = useState(10)
  const [previews, setPreviews] = useState({})
  const inputRef = useRef()

  const generate = () => {
    const source = mode === 'image' ? imgEl : null
    const bgColor = transparent ? null : bg
    const result = {}
    try {
      SIZES.forEach(size => {
        const canvas = mode === 'emoji'
          ? emojiToCanvas(emoji, size, bgColor)
          : source
            ? renderToCanvas(source, size, bgColor, padding)
            : null
        if (canvas) result[size] = canvas.toDataURL('image/png')
      })
      setPreviews(result)
      toast.success('Favicons generated!')
    } catch (e) {
      toast.error('Generation failed: ' + e.message)
    }
  }

  const downloadAll = async () => {
    const zip = new JSZip()
    for (const [size, dataUrl] of Object.entries(previews)) {
      const b64 = dataUrl.split(',')[1]
      zip.file(`favicon-${size}x${size}.png`, b64, { base64: true })
    }
    // Add HTML snippet
    const html = SIZES.map(s => `<link rel="icon" type="image/png" sizes="${s}x${s}" href="favicon-${s}x${s}.png">`).join('\n')
    zip.file('html-snippet.txt', html)
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'favicons.zip'; a.click()
    URL.revokeObjectURL(url)
  }

  const downloadOne = (size) => {
    const a = document.createElement('a')
    a.href = previews[size]; a.download = `favicon-${size}x${size}.png`; a.click()
  }

  const onFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Select an image'); return }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { setImgEl(img); URL.revokeObjectURL(url); setPreviews({}) }
    img.src = url
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-2xl">⭐</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Favicon Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Generate favicons at all sizes from an image or emoji</p>
        </div>
      </div>

      {/* Mode */}
      <div className="flex gap-2 mb-6">
        {['image', 'emoji'].map(m => (
          <button key={m} onClick={() => { setMode(m); setPreviews({}) }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${
              mode === m ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-yellow-300'
            }`}>
            {m === 'image' ? '🖼 From Image' : '😊 From Emoji'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          {mode === 'image' ? (
            <div
              onClick={() => inputRef.current.click()}
              onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all">
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{imgEl ? 'Image loaded ✓' : 'Upload image'}</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP, SVG</p>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files[0])} />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Emoji or Text</label>
              <input value={emoji} onChange={e => { setEmoji(e.target.value); setPreviews({}) }}
                placeholder="🚀" maxLength={4}
                className="w-full text-4xl text-center border border-gray-200 dark:border-gray-700 rounded-xl py-4 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Background</label>
              <div className="flex items-center gap-3">
                <input type="color" value={bg} onChange={e => { setBg(e.target.value); setPreviews({}) }}
                  disabled={transparent}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer disabled:opacity-40" />
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={transparent} onChange={e => { setTransparent(e.target.checked); setPreviews({}) }} />
                  Transparent
                </label>
              </div>
            </div>
            {mode === 'image' && (
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Padding: {padding}%</label>
                <input type="range" min={0} max={30} value={padding} onChange={e => { setPadding(Number(e.target.value)); setPreviews({}) }}
                  className="w-full accent-yellow-500 mt-2" />
              </div>
            )}
          </div>

          <button onClick={generate} disabled={mode === 'image' ? !imgEl : !emoji}
            className="btn-primary w-full py-3 disabled:opacity-50">
            Generate Favicons
          </button>
        </div>

        {/* Preview grid */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Preview</label>
          {Object.keys(previews).length > 0 ? (
            <div className="space-y-2">
              {SIZES.map(size => (
                <div key={size} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2">
                  <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0">
                    <img src={previews[size]} alt={`${size}px`} width={size > 32 ? 48 : size} height={size > 32 ? 48 : size} style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{size}×{size}</p>
                    <p className="text-xs text-gray-400">favicon-{size}x{size}.png</p>
                  </div>
                  <button onClick={() => downloadOne(size)} className="text-gray-400 hover:text-yellow-500 transition-colors">
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-400 text-sm">
              Previews appear here after generating
            </div>
          )}
        </div>
      </div>

      {Object.keys(previews).length > 0 && (
        <button onClick={downloadAll} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          <Download size={18} /> Download All Sizes as ZIP (+ HTML snippet)
        </button>
      )}
    </div>
  )
}
