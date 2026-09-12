import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ToolPageLayout({ icon, title, description, children, onProcess, processing, result, onDownload, onReset }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back */}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{description}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="tool-page-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {children}

        {/* Process button */}
        {onProcess && (
          <button onClick={onProcess} disabled={processing} className="btn-primary w-full flex items-center justify-center gap-2">
            {processing ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : (
              'Process'
            )}
          </button>
        )}

        {/* Result */}
        {result && (
          <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800 dark:text-green-400">Done! Your file is ready.</p>
              <p className="text-sm text-green-600 dark:text-green-500">{result.name}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onDownload} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Download size={16} /> Download
              </button>
              {onReset && (
                <button onClick={onReset} className="btn-secondary text-sm py-2 px-4">New</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
