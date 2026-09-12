import { useState, useCallback } from 'react'
import { ArrowLeft, Upload, Download, RefreshCw, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useFileProcessor from '../hooks/useFileProcessor'

export default function HeicConverter() {
  const [original, setOriginal] = useState(null)
  const { processing, result, process, download, reset: resetProcessor } = useFileProcessor()

  const onFile = useCallback(file => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['heic','heif'].includes(ext) && !file.type.includes('heic') && !file.type.includes('heif')) {
      toast.error('Please select a HEIC or HEIF file')
      return
    }
    setOriginal({ name: file.name, size: file.size, file })
  }, [])

  const convert = async () => {
    if (!original) return
    const fd = new FormData()
    fd.append('file', original.file)
    const name = original.name.replace(/\.(heic|heif)$/i, '.jpg')
    await process('/image/heic-to-jpg', fd, name)
  }

  const reset = () => {
    setOriginal(null)
    resetProcessor()
  }

  const formatSize = b => b > 1e6 ? (b/1e6).toFixed(1)+' MB' : (b/1024).toFixed(0)+' KB'

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-2xl">📷</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">HEIC / HEIF to JPG</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Convert iPhone HEIC photos to universally compatible JPEG</p>
        </div>
      </div>

      {!original ? (
        <div
          onDrop={e=>{e.preventDefault();onFile(e.dataTransfer.files[0])}}
          onDragOver={e=>e.preventDefault()}
          onClick={()=>document.getElementById('heic-input').click()}
          className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-14 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-all"
        >
          <Upload size={36} className="mx-auto text-gray-300 mb-3"/>
          <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Drop HEIC / HEIF file here</p>
          <p className="text-sm text-gray-400">iPhone photos, iOS exports · Click to browse</p>
          <input id="heic-input" type="file" accept=".heic,.heif,image/heic,image/heif" className="hidden"
            onChange={e=>onFile(e.target.files[0])}/>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <ImageIcon size={22} className="text-sky-500"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{original.name}</p>
              <p className="text-sm text-gray-400">{formatSize(original.size)} · HEIC/HEIF</p>
            </div>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <RefreshCw size={12}/> Change
            </button>
          </div>

          {/* Result */}
          {result ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-sky-200 dark:border-sky-700 p-5">
              <p className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-3">Converted Successfully</p>
              <div className="flex items-center gap-4">
                <img src={result.url} alt="Converted" className="h-24 w-24 object-cover rounded-xl border border-gray-100 dark:border-gray-700"/>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{result.name}</p>
                  <p className="text-sm text-gray-400 mb-3">JPEG · Ready to download</p>
                  <button onClick={download}
                    className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm">
                    <Download size={15}/> Download JPG
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={convert} disabled={processing}
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-colors text-sm">
              {processing ? <><RefreshCw size={16} className="animate-spin"/> Converting…</> : <>📷 Convert to JPG</>}
            </button>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          ['📱 iPhone Native', 'HEIC is the default format for photos taken on iPhone (iOS 11+) and newer Android devices'],
          ['🔄 High Quality', 'Converted to JPEG at 95% quality — sharp details preserved from the original'],
          ['🌐 Universal', 'JPEG works everywhere — Windows, Android, web browsers, social media'],
        ].map(([t,d])=>(
          <div key={t} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t}</p>
            <p className="text-xs text-gray-400">{d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
