import { useState, useRef } from 'react'
import { ArrowLeft, Upload, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function colorDistance(c1, c2) {
  return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2) + Math.pow(c1[2] - c2[2], 2))
}

function extractPalette(imageData, numColors) {
  const data = imageData.data
  const total = data.length / 4
  const step = Math.max(1, Math.floor(total / 2000))
  const pixels = []

  for (let i = 0; i < total; i += step) {
    const idx = i * 4
    const a = data[idx + 3]
    if (a < 200) continue
    pixels.push([
      Math.round(data[idx] / 16) * 16,
      Math.round(data[idx + 1] / 16) * 16,
      Math.round(data[idx + 2] / 16) * 16,
    ])
  }

  const counts = {}
  pixels.forEach(([r, g, b]) => {
    const key = `${r},${g},${b}`
    counts[key] = (counts[key] || 0) + 1
  })

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number)
      return { r, g, b, count }
    })

  const palette = []
  for (const color of sorted) {
    const tooClose = palette.some(c => colorDistance([c.r, c.g, c.b], [color.r, color.g, color.b]) < 48)
    if (!tooClose) palette.push(color)
    if (palette.length >= numColors) break
  }

  return palette.map(({ r, g, b }) => ({
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: rgbToHsl(r, g, b),
    r, g, b,
  }))
}

export default function ColorPalette() {
  const [preview, setPreview] = useState('')
  const [palette, setPalette] = useState([])
  const [numColors, setNumColors] = useState(8)
  const [copied, setCopied] = useState(null)
  const [copyMode, setCopyMode] = useState('hex')
  const inputRef = useRef()

  const onFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Select an image file'); return }
    setPalette([])
    const url = URL.createObjectURL(file)
    setPreview(url)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX = 200
      const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
      const extracted = extractPalette(imageData, numColors)
      setPalette(extracted)
      toast.success(`Extracted ${extracted.length} colors!`)
    }
    img.src = url
  }

  const copy = (color) => {
    const val = copyMode === 'hex' ? color.hex : copyMode === 'rgb' ? color.rgb : color.hsl
    navigator.clipboard.writeText(val)
    setCopied(color.hex); setTimeout(() => setCopied(null), 2000)
    toast.success('Copied!')
  }

  const copyAll = () => {
    const vals = palette.map(c => copyMode === 'hex' ? c.hex : copyMode === 'rgb' ? c.rgb : c.hsl)
    navigator.clipboard.writeText(vals.join('\n'))
    toast.success('All colors copied!')
  }

  const getTextColor = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) > 128 ? '#000' : '#fff'

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-2xl">🎨</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Color Palette Extractor</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Extract dominant colors from any image</p>
        </div>
      </div>

      {/* Upload */}
      <div
        onClick={() => inputRef.current.click()}
        onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all mb-4"
      >
        <Upload size={28} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Drop any image here to extract its color palette</p>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files[0])} />
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2">Colors:</label>
          {[4, 6, 8, 10, 12].map(n => (
            <button key={n} onClick={() => setNumColors(n)}
              className={`px-2.5 py-1 rounded-lg text-sm font-medium border mr-1 transition-all ${
                numColors === n ? 'bg-pink-500 text-white border-pink-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
              }`}>
              {n}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2">Copy as:</label>
          {['hex', 'rgb', 'hsl'].map(m => (
            <button key={m} onClick={() => setCopyMode(m)}
              className={`px-2.5 py-1 rounded-lg text-sm font-medium border mr-1 uppercase transition-all ${
                copyMode === m ? 'bg-pink-500 text-white border-pink-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
              }`}>
              {m}
            </button>
          ))}
        </div>
        {palette.length > 0 && (
          <button onClick={copyAll} className="btn-secondary text-sm py-1.5 px-3 ml-auto">Copy All</button>
        )}
      </div>

      {preview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Image</label>
            <img src={preview} alt="source" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 object-contain max-h-72 bg-gray-50 dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Palette ({palette.length} colors)
            </label>
            {palette.length > 0 ? (
              <div className="space-y-2">
                {palette.map((color, i) => (
                  <button key={i} onClick={() => copy(color)}
                    className="w-full flex items-center gap-3 rounded-xl p-2 hover:scale-[1.01] transition-transform group"
                    style={{ backgroundColor: color.hex }}>
                    <div className="w-10 h-10 rounded-lg shrink-0" style={{ backgroundColor: color.hex, border: '2px solid rgba(255,255,255,0.3)' }} />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold font-mono" style={{ color: getTextColor(color.r, color.g, color.b) }}>{color.hex.toUpperCase()}</p>
                      <p className="text-xs font-mono opacity-75" style={{ color: getTextColor(color.r, color.g, color.b) }}>{color.rgb}</p>
                    </div>
                    <div style={{ color: getTextColor(color.r, color.g, color.b) }} className="opacity-0 group-hover:opacity-60 transition-opacity">
                      {copied === color.hex ? <Check size={14} /> : <Copy size={14} />}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 text-sm">
                Upload an image to extract colors
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
