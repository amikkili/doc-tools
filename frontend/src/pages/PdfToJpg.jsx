import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'

export default function PdfToJpg() {
  const [files, setFiles] = useState([])
  const [dpi, setDpi] = useState('150')
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PDF file')
    const fd = new FormData()
    fd.append('file', files[0])
    fd.append('dpi', dpi)
    await process('/pdf/to-jpg', fd, 'pdf-images.zip')
  }

  return (
    <ToolPageLayout
      icon="🖼️" title="PDF to JPG" description="Convert each PDF page to a JPG image"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop a PDF file here"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image quality (DPI)</label>
        <div className="flex gap-3">
          {[['72', 'Low'], ['150', 'Medium'], ['300', 'High']].map(([v, l]) => (
            <button key={v} onClick={() => setDpi(v)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${dpi === v ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {l}<br /><span className="text-xs font-normal text-gray-400">{v} DPI</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Output will be a ZIP file with one JPG per page.</p>
      </div>
    </ToolPageLayout>
  )
}
