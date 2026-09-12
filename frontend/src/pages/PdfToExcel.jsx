import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'

export default function PdfToExcel() {
  const [files, setFiles] = useState([])
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PDF file')
    const fd = new FormData()
    fd.append('file', files[0])
    const name = files[0].name.replace(/\.pdf$/i, '.xlsx')
    await process('/pdf/to-excel', fd, name)
  }

  return (
    <ToolPageLayout
      icon="📈" title="PDF to Excel" description="Extract tables from PDF into Excel spreadsheets"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop a PDF file here" hint="Best results with PDFs containing structured tables"
      />
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Note:</strong> This tool works best on PDFs with clearly defined table structures.
      </div>
    </ToolPageLayout>
  )
}
