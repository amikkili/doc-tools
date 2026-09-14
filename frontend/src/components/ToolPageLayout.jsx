import { useState } from 'react'
import { Download, Loader2, RotateCcw, Share2, Check, Twitter, Linkedin } from 'lucide-react'

const SITE_URL = 'https://pdftools.anilsofttech.com'

function ShareButton({ href, label, icon, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ background: color, color: '#fff', textDecoration: 'none', border: 'none' }}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
    >
      {icon}
      {label}
    </a>
  )
}

function SuccessBanner({ result, onDownload, onReset, title }) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(SITE_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const shareText = encodeURIComponent(`I just converted my files for FREE using DocCraft — ${title} and many more tools at ${SITE_URL}`)
  const shareUrl  = encodeURIComponent(SITE_URL)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #d1fae5' }}>

      {/* Top — success */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }} className="px-6 py-6 text-center">
        {/* Checkmark */}
        <div className="mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}>
          <Check size={28} className="text-white" strokeWidth={3} />
        </div>
        <h3 className="text-white font-bold text-lg mb-1">Your file is ready!</h3>
        <p className="text-emerald-200 text-sm truncate max-w-xs mx-auto">{result.name}</p>
      </div>

      {/* Download */}
      <div className="px-6 py-4" style={{ background: '#f0fdf4', borderBottom: '1px solid #d1fae5' }}>
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.01] active:scale-100"
          style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 4px 14px rgba(5,150,105,0.35)' }}
        >
          <Download size={17} strokeWidth={2.5} />
          Download File
        </button>

        {onReset && (
          <button
            onClick={onReset}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            style={{ background: 'transparent', border: '1.5px solid #6ee7b7' }}
          >
            <RotateCcw size={14} />
            Convert another file
          </button>
        )}
      </div>

      {/* Share */}
      <div className="px-6 py-4" style={{ background: '#fff' }}>
        <div className="flex items-center gap-2 mb-3">
          <Share2 size={14} className="text-gray-400" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Love DocCraft? Spread the word!</p>
        </div>
        <p className="text-xs text-gray-400 mb-3">Help others discover free document tools — share with a friend or on social media.</p>
        <div className="flex flex-wrap gap-2">
          <ShareButton
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            label="Twitter / X"
            color="#000"
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
          />
          <ShareButton
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            label="LinkedIn"
            color="#0077B5"
            icon={<Linkedin size={13} />}
          />
          <ShareButton
            href={`https://wa.me/?text=${shareText}`}
            label="WhatsApp"
            color="#25D366"
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>}
          />
          <button
            onClick={copyLink}
            style={{ background: copied ? '#6366f1' : '#f1f5f9', color: copied ? '#fff' : '#475569', border: 'none', cursor: 'pointer' }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-gray-200"
          >
            {copied ? <Check size={13} /> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ToolPageLayout({ icon, title, description, children, onProcess, processing, result, onDownload, onReset }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
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
        {onProcess && !result && (
          <button onClick={onProcess} disabled={processing} className="btn-primary w-full flex items-center justify-center gap-2">
            {processing ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : (
              'Process'
            )}
          </button>
        )}

        {/* Success banner */}
        {result && (
          <SuccessBanner
            result={result}
            onDownload={onDownload}
            onReset={onReset}
            title={title}
          />
        )}
      </div>
    </div>
  )
}
