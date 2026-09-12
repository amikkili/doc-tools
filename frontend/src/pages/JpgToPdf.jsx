import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'

export default function JpgToPdf() {
  const [files, setFiles] = useState([])
  const [orientation, setOrientation] = useState('portrait')
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files.length) return toast.error('Please select at least one image')
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    fd.append('orientation', orientation)
    await process('/pdf/from-images', fd, 'images.pdf')
  }

  return (
    <ToolPageLayout
      icon="📸" title="JPG to PDF" description="Convert JPG, PNG and other images to PDF"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp','.gif','.bmp'] }}
        multiple files={files} onFiles={setFiles} onRemove={(i) => setFiles(prev => prev.filter((_,idx) => idx !== i))}
        label="Drop images here" hint="JPG, PNG, WebP, GIF, BMP supported"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Page orientation</label>
        <div className="flex gap-3">
          {[['portrait','Portrait 📄'],['landscape','Landscape 🖼️']].map(([v,l]) => (
            <button key={v} onClick={() => setOrientation(v)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${orientation===v ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </ToolPageLayout>
  )
}
