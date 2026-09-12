import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import { shouldUseClient, mergePdfClient, CLIENT_THRESHOLD_MB } from '../lib/pdfClientOps'
import toast from 'react-hot-toast'

export default function MergePdf() {
  const [files, setFiles] = useState([])
  const { processing, result, process, processClient, download, reset } = useFileProcessor()

  const handleRemove = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const useClient = files.length > 0 && shouldUseClient(files)

  const handleProcess = async () => {
    if (files.length < 2) return toast.error('Please select at least 2 PDF files')

    if (useClient) {
      try {
        const blob = await mergePdfClient(files)
        processClient(blob, 'merged.pdf')
      } catch (e) {
        toast.error('Browser merge failed — trying server...')
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        await process('/pdf/merge', fd, 'merged.pdf')
      }
    } else {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      await process('/pdf/merge', fd, 'merged.pdf')
    }
  }

  return (
    <ToolPageLayout
      icon="🔗" title="Merge PDF" description="Combine multiple PDF files into one document"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        multiple files={files} onFiles={setFiles} onRemove={handleRemove}
        label="Drop PDF files here" hint="Select 2 or more PDF files to merge"
      />

      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {files.length} file{files.length > 1 ? 's' : ''} — merged in order listed above
          </span>
          <EngineTag client={useClient} threshold={CLIENT_THRESHOLD_MB} />
        </div>
      )}
    </ToolPageLayout>
  )
}

function EngineTag({ client, threshold }) {
  return client ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
      ⚡ In Browser
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
      ☁️ Via Server  <span className="font-normal opacity-70">(files &gt; {threshold} MB)</span>
    </span>
  )
}
