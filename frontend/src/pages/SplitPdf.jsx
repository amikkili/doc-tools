import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import { shouldUseClient, splitPdfClient, CLIENT_THRESHOLD_MB } from '../lib/pdfClientOps'
import { validateFile } from '../lib/validateFile'
import toast from 'react-hot-toast'

export default function SplitPdf() {
  const [files, setFiles] = useState([])
  const [pages, setPages] = useState('')
  const { processing, result, process, processClient, download, reset } = useFileProcessor()

  const useClient = files.length > 0 && shouldUseClient(files)

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PDF file')
    const v = validateFile(files[0], 'pdf')
    if (!v.ok) return toast.error(v.message)

    if (useClient) {
      try {
        const blob = await splitPdfClient(files[0], pages)
        processClient(blob, 'split.zip')
      } catch (e) {
        toast.error('Browser split failed — trying server...')
        const fd = new FormData()
        fd.append('file', files[0])
        if (pages.trim()) fd.append('pages', pages.trim())
        await process('/pdf/split', fd, 'split.zip')
      }
    } else {
      const fd = new FormData()
      fd.append('file', files[0])
      if (pages.trim()) fd.append('pages', pages.trim())
      await process('/pdf/split', fd, 'split.zip')
    }
  }

  return (
    <ToolPageLayout
      icon="✂️" title="Split PDF" description="Extract individual pages or page ranges from a PDF"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop a PDF file here" hint="Select a PDF to split"
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Page ranges <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          {files.length > 0 && <EngineTag client={useClient} threshold={CLIENT_THRESHOLD_MB} />}
        </div>
        <input
          type="text" value={pages} onChange={e => setPages(e.target.value)}
          placeholder="e.g. 1-3, 5, 7-9 — blank = split every page"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        <p className="text-xs text-gray-400 mt-1">Separate ranges with commas. Output is a ZIP with each part.</p>
      </div>
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
      ☁️ Via Server <span className="font-normal opacity-70">(files &gt; {threshold} MB)</span>
    </span>
  )
}
