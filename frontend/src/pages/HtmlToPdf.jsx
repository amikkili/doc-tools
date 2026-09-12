import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function HtmlToPdf() {
  const [tab, setTab] = useState('url')
  const [url, setUrl] = useState('')
  const [html, setHtml] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleProcess = async () => {
    setProcessing(true)
    try {
      const fd = new FormData()
      if (tab === 'url') fd.append('url', url)
      else fd.append('html', html)
      const res = await axios.post('/api/html/to-pdf', fd, { responseType: 'blob', timeout: 60000 })
      const blobUrl = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = tab === 'url' ? 'page.pdf' : 'document.pdf'
      a.click()
      URL.revokeObjectURL(blobUrl)
      toast.success('PDF downloaded!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Conversion failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl">🌐</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HTML to PDF</h1>
          <p className="text-gray-500 text-sm">Convert a URL or HTML code to a PDF file</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Tab */}
        <div className="flex gap-2">
          {[['url','URL'],['html','HTML Code']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab===v ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'url' ? (
          <input type="url" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300" />
        ) : (
          <textarea value={html} onChange={e => setHtml(e.target.value)}
            placeholder="<html><body><h1>Hello World</h1></body></html>"
            className="w-full h-60 font-mono text-sm border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
        )}

        <button onClick={handleProcess} disabled={processing || (tab==='url' ? !url : !html)} className="btn-primary w-full flex items-center justify-center gap-2">
          {processing ? <><Loader2 size={18} className="animate-spin"/>Converting...</> : 'Convert to PDF'}
        </button>
      </div>
    </div>
  )
}
