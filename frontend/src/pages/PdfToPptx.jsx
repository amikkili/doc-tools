import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'

export default function PdfToPptx() {
  const [files, setFiles] = useState([])
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PDF file')
    const fd = new FormData()
    fd.append('file', files[0])
    const name = files[0].name.replace(/\.pdf$/i, '.pptx')
    await process('/pdf/to-pptx', fd, name)
  }

  return (
    <ToolPageLayout
      icon="📊"
      title="PDF to PowerPoint"
      description="Convert PDF slides to editable PPTX presentations"
      onProcess={handleProcess}
      processing={processing}
      result={result}
      onDownload={download}
      onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        files={files}
        onFiles={setFiles}
        onRemove={() => setFiles([])}
        label="Drop a PDF file here"
        hint="Best results with presentation-style PDFs (one slide per page)"
      />

      <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
        <p className="font-semibold mb-1">How it works</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-600 dark:text-amber-400 text-xs">
          <li>Each PDF page becomes a PowerPoint slide</li>
          <li>Text and images are preserved as editable elements</li>
          <li>Complex layouts may need minor adjustments after conversion</li>
        </ul>
      </div>
    </ToolPageLayout>
  )
}
