import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'

export default function PptxToPdf() {
  const [files, setFiles] = useState([])
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PowerPoint file')
    const fd = new FormData()
    fd.append('file', files[0])
    const name = files[0].name.replace(/\.(pptx?|ppt)$/i, '.pdf')
    await process('/pdf/from-pptx', fd, name)
  }

  return (
    <ToolPageLayout
      icon="📄"
      title="PowerPoint to PDF"
      description="Convert PPTX/PPT presentations to PDF — preserves all slides"
      onProcess={handleProcess}
      processing={processing}
      result={result}
      onDownload={download}
      onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'], 'application/vnd.ms-powerpoint': ['.ppt'] }}
        files={files}
        onFiles={setFiles}
        onRemove={() => setFiles([])}
        label="Drop a PowerPoint file here"
        hint="Supports .pptx and .ppt · All slides converted · Animations flattened"
      />
    </ToolPageLayout>
  )
}
