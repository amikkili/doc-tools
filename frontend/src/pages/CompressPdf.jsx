import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'

export default function CompressPdf() {
  const [files, setFiles] = useState([])
  const [quality, setQuality] = useState('medium')
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PDF file')
    const fd = new FormData()
    fd.append('file', files[0])
    fd.append('quality', quality)
    await process('/pdf/compress', fd, 'compressed.pdf')
  }

  return (
    <ToolPageLayout
      icon="📦" title="Compress PDF" description="Reduce PDF file size while maintaining quality"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop a PDF file here"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Compression level</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[['low', 'Low', 'Smaller size, lower quality'], ['medium', 'Medium', 'Balanced size & quality'], ['high', 'High', 'Larger size, best quality']].map(([v, l, d]) => (
            <button key={v} onClick={() => setQuality(v)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${quality === v ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <p className="font-medium text-sm">{l}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d}</p>
            </button>
          ))}
        </div>
      </div>
    </ToolPageLayout>
  )
}
