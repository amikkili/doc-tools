import { useState, useRef, useCallback, useEffect } from 'react'
import { ArrowLeft, Download, Upload, RotateCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const RATIOS = [
  { label: 'Free', w: 0, h: 0 },
  { label: '1:1', w: 1, h: 1 },
  { label: '4:3', w: 4, h: 3 },
  { label: '16:9', w: 16, h: 9 },
  { label: '3:4', w: 3, h: 4 },
  { label: '9:16', w: 9, h: 16 },
]

export default function ImageCropper() {
  const [imgSrc, setImgSrc] = useState('')
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 })
  const [imgDisplay, setImgDisplay] = useState({ w: 0, h: 0 })
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 }) // % values
  const [ratio, setRatio] = useState(RATIOS[0])
  const [dragging, setDragging] = useState(null) // null | 'move' | 'br' | 'bl' | 'tr' | 'tl'
  const [dragStart, setDragStart] = useState(null)
  const [result, setResult] = useState(null)
  const containerRef = useRef()
  const imgRef = useRef()
  const inputRef = useRef()

  const onFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Select an image'); return }
    const url = URL.createObjectURL(file)
    setImgSrc(url); setResult(null)
    const img = new Image()
    img.onload = () => {
      setImgNatural({ w: img.naturalWidth, h: img.naturalHeight })
      setCrop({ x: 10, y: 10, w: 80, h: 80 })
    }
    img.src = url
  }

  useEffect(() => {
    if (!imgRef.current) return
    const obs = new ResizeObserver(() => {
      if (imgRef.current) {
        setImgDisplay({ w: imgRef.current.offsetWidth, h: imgRef.current.offsetHeight })
      }
    })
    obs.observe(imgRef.current)
    return () => obs.disconnect()
  }, [imgSrc])

  const clampCrop = (c) => ({
    x: Math.max(0, Math.min(c.x, 100 - c.w)),
    y: Math.max(0, Math.min(c.y, 100 - c.h)),
    w: Math.max(5, Math.min(c.w, 100 - c.x)),
    h: Math.max(5, Math.min(c.h, 100 - c.y)),
  })

  const onMouseDown = (e, type) => {
    e.preventDefault()
    setDragging(type)
    setDragStart({ mx: e.clientX, my: e.clientY, crop: { ...crop } })
  }

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStart || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragStart.mx) / rect.width) * 100
    const dy = ((e.clientY - dragStart.my) / rect.height) * 100
    const prev = dragStart.crop

    let next = { ...prev }
    if (dragging === 'move') {
      next = { ...prev, x: prev.x + dx, y: prev.y + dy }
    } else if (dragging === 'br') {
      const newW = prev.w + dx
      next = { ...prev, w: newW, h: ratio.w ? newW * ratio.h / ratio.w : prev.h + dy }
    } else if (dragging === 'bl') {
      const newW = prev.w - dx
      next = { ...prev, x: prev.x + dx, w: newW, h: ratio.w ? newW * ratio.h / ratio.w : prev.h + dy }
    } else if (dragging === 'tr') {
      const newW = prev.w + dx
      next = { ...prev, w: newW, h: ratio.w ? newW * ratio.h / ratio.w : prev.h - dy, y: ratio.w ? prev.y : prev.y + dy }
    } else if (dragging === 'tl') {
      const newW = prev.w - dx
      next = { ...prev, x: prev.x + dx, w: newW, h: ratio.w ? newW * ratio.h / ratio.w : prev.h - dy, y: ratio.w ? prev.y : prev.y + dy }
    }
    setCrop(clampCrop(next))
  }, [dragging, dragStart, ratio])

  const onMouseUp = useCallback(() => setDragging(null), [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [onMouseMove, onMouseUp])

  const doCrop = () => {
    if (!imgSrc) return
    const img = new Image()
    img.onload = () => {
      const sx = Math.round(img.naturalWidth * crop.x / 100)
      const sy = Math.round(img.naturalHeight * crop.y / 100)
      const sw = Math.round(img.naturalWidth * crop.w / 100)
      const sh = Math.round(img.naturalHeight * crop.h / 100)
      const canvas = document.createElement('canvas')
      canvas.width = sw; canvas.height = sh
      canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        setResult({ url, w: sw, h: sh })
        toast.success(`Cropped to ${sw}×${sh}px!`)
      }, 'image/jpeg', 0.95)
    }
    img.src = imgSrc
  }

  const download = () => {
    const a = document.createElement('a'); a.href = result.url; a.download = 'cropped.jpg'; a.click()
  }

  const H = ({ pos }) => (
    <div onMouseDown={e => onMouseDown(e, pos)}
      className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-pointer z-10 hover:bg-blue-100"
      style={{
        ...(pos.includes('t') ? { top: -8 } : { bottom: -8 }),
        ...(pos.includes('l') ? { left: -8 } : { right: -8 }),
        cursor: pos === 'br' || pos === 'tl' ? 'nwse-resize' : 'nesw-resize',
      }}
    />
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">✂️</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Image Cropper</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Drag to crop images with aspect ratio presets</p>
        </div>
      </div>

      {/* Aspect ratio */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ratio:</span>
        {RATIOS.map(r => (
          <button key={r.label} onClick={() => setRatio(r)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              ratio.label === r.label ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-orange-300'
            }`}>
            {r.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={() => inputRef.current.click()} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
            <Upload size={14} /> Upload
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files[0])} />
          {imgSrc && (
            <button onClick={doCrop} className="btn-primary text-sm py-1.5 px-4">Crop</button>
          )}
        </div>
      </div>

      {!imgSrc ? (
        <div
          onClick={() => inputRef.current.click()}
          onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files[0]) }}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-16 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all"
        >
          <Upload size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">Drop an image here to start cropping</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crop canvas */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Crop Region: {Math.round(imgNatural.w * crop.w / 100)}×{Math.round(imgNatural.h * crop.h / 100)}px
            </p>
            <div ref={containerRef} className="relative select-none overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
              style={{ userSelect: 'none' }}>
              <img ref={imgRef} src={imgSrc} alt="source" className="block w-full" draggable={false}
                onLoad={() => setImgDisplay({ w: imgRef.current?.offsetWidth || 0, h: imgRef.current?.offsetHeight || 0 })} />

              {/* Dark overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.5)' }} />

              {/* Crop box */}
              <div
                onMouseDown={e => onMouseDown(e, 'move')}
                className="absolute border-2 border-blue-400 cursor-move"
                style={{
                  left: `${crop.x}%`, top: `${crop.y}%`,
                  width: `${crop.w}%`, height: `${crop.h}%`,
                  background: 'transparent',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                }}>
                {/* Handles */}
                <H pos="tl" /> <H pos="tr" /> <H pos="bl" /> <H pos="br" />
                {/* Rule of thirds */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
                  backgroundSize: '33.33% 33.33%'
                }} />
              </div>
            </div>
          </div>

          {/* Result */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {result ? `Result — ${result.w}×${result.h}px` : 'Result'}
            </p>
            {result ? (
              <>
                <img src={result.url} alt="cropped" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 object-contain max-h-72 bg-gray-50 dark:bg-gray-900" />
                <button onClick={download} className="mt-3 w-full btn-primary flex items-center justify-center gap-2">
                  <Download size={16} /> Download Cropped Image
                </button>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 text-sm">
                Click "Crop" to see the result
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
