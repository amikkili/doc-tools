import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import { validateFile } from '../lib/validateFile'
import toast from 'react-hot-toast'

export default function WordToPdf() {
  const [files, setFiles] = useState([])
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a Word file')
    const v = validateFile(files[0], 'docx')
    if (!v.ok) return toast.error(v.message)
    const fd = new FormData()
    fd.append('file', files[0])
    const name = files[0].name.replace(/\.(doc|docx)$/i, '.pdf')
    await process('/word/to-pdf', fd, name)
  }

  return (
    <ToolPageLayout
      icon="📄" title="Word to PDF" description="Convert DOC and DOCX documents to PDF format"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop a Word file here" hint="Supports .doc and .docx formats"
      />
    </ToolPageLayout>
  )
}
