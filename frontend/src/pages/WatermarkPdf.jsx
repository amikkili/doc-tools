import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'

export default function WatermarkPdf() {
  const [files, setFiles] = useState([])
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState('0.3')
  const [color, setColor] = useState('#FF0000')
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PDF file')
    if (!text.trim()) return toast.error('Please enter watermark text')
    const fd = new FormData()
    fd.append('file', files[0])
    fd.append('text', text)
    fd.append('opacity', opacity)
    fd.append('color', color)
    await process('/pdf/watermark', fd, 'watermarked.pdf')
  }

  return (
    <ToolPageLayout
      icon="🔏" title="Watermark PDF" description="Add a text watermark to your PDF pages"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]) }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop a PDF file here"
      />
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Watermark text</label>
          <input type="text" value={text} onChange={e => setText(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opacity ({Math.round(opacity * 100)}%)</label>
            <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={e => setOpacity(e.target.value)}
              className="w-full accent-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" />
          </div>
        </div>
      </div>
    </ToolPageLayout>
  )
}
