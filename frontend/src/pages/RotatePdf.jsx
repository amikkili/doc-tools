import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import { shouldUseClient, rotatePdfClient, CLIENT_THRESHOLD_MB } from '../lib/pdfClientOps'
import toast from 'react-hot-toast'

export default function RotatePdf() {
  const [files, setFiles] = useState([])
  const [angle, setAngle] = useState('90')
  const { processing, result, process, processClient, download, reset } = useFileProcessor()

  const useClient = files.length > 0 && shouldUseClient(files)

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PDF file')

    if (useClient) {
      try {
        const blob = await rotatePdfClient(files[0], angle)
        processClient(blob, 'rotated.pdf')
      } catch (e) {
        toast.error('Browser rotate failed — trying server...')
        const fd = new FormData()
        fd.append('file', files[0])
        fd.append('angle', angle)
        await process('/pdf/rotate', fd, 'rotated.pdf')
      }
    } else {
      const fd = new FormData()
      fd.append('file', files[0])
      fd.append('angle', angle)
      await process('/pdf/rotate', fd, 'rotated.pdf')
    }
  }

  return (
    <ToolPageLayout
      icon="🔄" title="Rotate PDF" description="Rotate all pages in your PDF by any angle"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop a PDF file here"
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Rotation angle</label>
          {files.length > 0 && <EngineTag client={useClient} threshold={CLIENT_THRESHOLD_MB} />}
        </div>
        <div className="flex gap-3">
          {[['90','90° ↷'],['180','180° ↻'],['270','270° ↶']].map(([v,l]) => (
            <button key={v} onClick={() => setAngle(v)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${angle===v ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {l}
            </button>
          ))}
        </div>
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
