import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'

export default function ExcelToPdf() {
  const [files, setFiles] = useState([])
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select an Excel file')
    const fd = new FormData()
    fd.append('file', files[0])
    const name = files[0].name.replace(/\.(xlsx|xls)$/i, '.pdf')
    await process('/excel/to-pdf', fd, name)
  }

  return (
    <ToolPageLayout
      icon="📊" title="Excel to PDF" description="Convert Excel spreadsheets to PDF format"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop an Excel file here" hint="Supports .xlsx and .xls formats"
      />
    </ToolPageLayout>
  )
}
