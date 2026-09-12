import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import ConversionQualityBadge from '../components/ConversionQualityBadge'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'

export default function PdfToWord() {
  const [files, setFiles] = useState([])
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PDF file')
    const fd = new FormData()
    fd.append('file', files[0])
    const name = files[0].name.replace(/\.pdf$/i, '.docx')
    await process('/pdf/to-word', fd, name)
  }

  return (
    <ToolPageLayout
      icon="📝" title="PDF to Word" description="Convert PDF files to editable Word DOCX documents"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop a PDF file here" hint="Supports text-based PDFs for best accuracy"
      />

      {/* Auto-analyses the file as soon as it's selected */}
      <ConversionQualityBadge file={files[0] ?? null} />
    </ToolPageLayout>
  )
}
