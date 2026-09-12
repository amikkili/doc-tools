import { useState } from 'react'
import ToolPageLayout from '../components/ToolPageLayout'
import FileUploadZone from '../components/FileUploadZone'
import useFileProcessor from '../hooks/useFileProcessor'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function ProtectPdf() {
  const [files, setFiles] = useState([])
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const { processing, result, process, download, reset } = useFileProcessor()

  const handleProcess = async () => {
    if (!files[0]) return toast.error('Please select a PDF file')
    if (!password) return toast.error('Please enter a password')
    const fd = new FormData()
    fd.append('file', files[0])
    fd.append('password', password)
    await process('/pdf/protect', fd, 'protected.pdf')
  }

  return (
    <ToolPageLayout
      icon="🔒" title="Protect PDF" description="Password-protect your PDF to restrict access"
      onProcess={handleProcess} processing={processing} result={result}
      onDownload={download} onReset={() => { reset(); setFiles([]); setPassword('') }}
    >
      <FileUploadZone
        accept={{ 'application/pdf': ['.pdf'] }}
        files={files} onFiles={setFiles} onRemove={() => setFiles([])}
        label="Drop a PDF file here"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
        ⚠️ Remember your password — there is no way to recover an encrypted PDF without it.
      </div>
    </ToolPageLayout>
  )
}
