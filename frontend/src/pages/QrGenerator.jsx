import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Download, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'

const SIZES = [128, 256, 512, 1024]
const ERROR_LEVELS = [
  { label: 'L — 7%', value: 'L' },
  { label: 'M — 15%', value: 'M' },
  { label: 'Q — 25%', value: 'Q' },
  { label: 'H — 30%', value: 'H' },
]

export default function QrGenerator() {
  const [text, setText] = useState('https://doccraft.io')
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState('M')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [dataUrl, setDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef()

  useEffect(() => {
    if (!text.trim()) { setDataUrl(''); return }
    QRCode.toCanvas(canvasRef.current, text, {
      width: size,
      errorCorrectionLevel: errorLevel,
      color: { dark: fgColor, light: bgColor },
      margin: 2,
    }, (err) => {
      if (err) return
      setDataUrl(canvasRef.current.toDataURL('image/png'))
    })
  }, [text, size, errorLevel, fgColor, bgColor])

  const download = (fmt) => {
    if (!text.trim()) { toast.error('Enter some text first'); return }
    if (fmt === 'png') {
      const a = document.createElement('a')
      a.href = dataUrl; a.download = 'qrcode.png'; a.click()
    } else {
      QRCode.toString(text, { type: 'svg', errorCorrectionLevel: errorLevel, color: { dark: fgColor, light: bgColor }, margin: 2 }, (err, svg) => {
        if (err) return
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob); a.download = 'qrcode.svg'; a.click()
      })
    }
    toast.success(`Downloaded as ${fmt.toUpperCase()}`)
  }

  const copyDataUrl = () => {
    navigator.clipboard.writeText(dataUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Data URL copied!')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-2xl">▦</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">QR Code Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Generate QR codes from any URL or text</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          {/* Text input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Content</label>
            <textarea
              rows={4} value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter URL, text, email, phone…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition resize-none font-mono"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{text.length} chars</p>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Size</label>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${size === s ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-400'}`}>
                  {s}px
                </button>
              ))}
            </div>
          </div>

          {/* Error correction */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Error Correction</label>
            <div className="flex gap-2 flex-wrap">
              {ERROR_LEVELS.map(e => (
                <button key={e.value} onClick={() => setErrorLevel(e.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${errorLevel === e.value ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-400'}`}>
                  {e.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Higher = more damage tolerance, larger QR</p>
          </div>

          {/* Colors */}
          <div className="flex gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Foreground</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer" />
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{fgColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer" />
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center w-full">
            <canvas ref={canvasRef} className="max-w-full rounded-xl" style={{ imageRendering: 'pixelated' }} />
          </div>

          <div className="flex flex-wrap justify-center gap-3 w-full">
            <button onClick={() => download('png')}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Download size={15} /> PNG
            </button>
            <button onClick={() => download('svg')}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors text-sm">
              <Download size={15} /> SVG
            </button>
            <button onClick={copyDataUrl}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors text-sm">
              {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
              Data URL
            </button>
          </div>

          {text.trim() && (
            <p className="text-xs text-gray-400 text-center">
              Scan with any phone camera · {size}×{size}px · Error correction {errorLevel}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
