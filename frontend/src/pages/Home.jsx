import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/* ─── Color tokens (indigo-900 family, rose accent) ─── */
const DARK = '#1e1b4b'
const DARK2 = '#312e81'
const DARK3 = '#3730a3'
const ACCENT = '#fb7185'
const ACCENT2 = '#f43f5e'
const CONTENT_BG = '#f5f3ff'

const ALL_TOOLS = [
  { path: '/merge-pdf',         icon: '🔗', label: 'Merge PDF',               desc: 'Drag and drop multiple PDFs and combine them into one file — set the page order before merging',                                   color: 'bg-red-100',           cat: 'Organize PDF' },
  { path: '/split-pdf',         icon: '✂️', label: 'Split PDF',                desc: 'Split a large PDF into individual pages or custom page ranges and download each part separately',                                   color: 'bg-orange-100',        cat: 'Organize PDF' },
  { path: '/rotate-pdf',        icon: '🔄', label: 'Rotate PDF',               desc: 'Fix sideways or upside-down PDF pages — rotate by 90°, 180°, or 270° and save permanently',                                       color: 'bg-yellow-100',        cat: 'Organize PDF' },
  { path: '/compress-pdf',      icon: '📦', label: 'Compress PDF',             desc: 'Shrink PDF file size for email or upload — choose quality level to balance file size vs. image clarity',                            color: 'bg-blue-100',          cat: 'Optimize PDF' },
  { path: '/watermark-pdf',     icon: '🔏', label: 'Watermark PDF',            desc: 'Stamp custom text (CONFIDENTIAL, DRAFT…) or an image on every page of your PDF document',                                          color: 'bg-purple-100',        cat: 'Optimize PDF' },
  { path: '/protect-pdf',       icon: '🔒', label: 'Protect PDF',              desc: 'Lock your PDF with a password so only authorised recipients can open, print, or copy content from it',                              color: 'bg-red-100',           cat: 'PDF Security' },
  { path: '/pdf-to-word',       icon: '📝', label: 'PDF to Word',              desc: 'Convert a scanned or digital PDF into an editable .docx file — preserves text, tables, and page layout',                           color: 'bg-blue-100',          cat: 'Convert PDF' },
  { path: '/word-to-pdf',       icon: '📄', label: 'Word to PDF',              desc: 'Turn any .doc or .docx file into a professional, universally viewable, print-ready PDF document',                                   color: 'bg-blue-100',          cat: 'Convert PDF' },
  { path: '/pdf-to-jpg',        icon: '🖼️', label: 'PDF to JPG',               desc: 'Extract every page of a PDF as a high-resolution JPG image — useful for slides, previews, and presentations',                      color: 'bg-green-100',         cat: 'Convert PDF' },
  { path: '/jpg-to-pdf',        icon: '📸', label: 'JPG to PDF',               desc: 'Package one or more images (JPG, PNG, WebP) into a single shareable PDF document in one click',                                    color: 'bg-green-100',         cat: 'Convert PDF' },
  { path: '/excel-to-pdf',      icon: '📊', label: 'Excel to PDF',             desc: 'Convert .xlsx spreadsheets to PDF with all columns, rows, and cell formatting intact and print-ready',                             color: 'bg-emerald-100',       cat: 'Convert PDF' },
  { path: '/pdf-to-excel',      icon: '📈', label: 'PDF to Excel',             desc: 'Automatically detect and extract tables from a PDF into an editable Excel spreadsheet (.xlsx)',                                     color: 'bg-emerald-100',       cat: 'Convert PDF' },
  { path: '/html-to-pdf',       icon: '🌐', label: 'HTML to PDF',              desc: 'Paste raw HTML code and get a pixel-perfect, styled PDF — great for invoices, reports, and receipts',                              color: 'bg-indigo-100',        cat: 'Convert PDF' },
  { path: '/pdf-to-pptx',       icon: '📊', label: 'PDF to PowerPoint',        desc: 'Convert PDF slides back into a fully editable .pptx presentation so you can update content and design',                            color: 'bg-orange-100',        cat: 'Convert PDF' },
  { path: '/pptx-to-pdf',       icon: '📄', label: 'PowerPoint to PDF',        desc: 'Save any .pptx or .ppt presentation as a compact, universally-viewable PDF document',                                              color: 'bg-blue-100',          cat: 'Convert PDF' },
  { path: '/analyze-pdf',       icon: '🔮', label: 'Smart PDF Analyzer',       desc: 'Drop any PDF to instantly identify its type (invoice, resume, contract) and preview expected Word conversion quality',              color: 'bg-violet-100',        cat: 'AI Tools' },
  { path: '/json-beautifier',   icon: '{ }',label: 'JSON Beautifier',          desc: 'Pretty-print minified JSON with proper indentation and syntax highlighting, or compact it back to one line',                        color: 'bg-gray-100',          cat: 'Dev Tools' },
  { path: '/json-validator',    icon: '✅', label: 'JSON Validator',           desc: 'Paste any JSON string and instantly see if it is valid — pinpoints the exact line and column with the error',                       color: 'bg-green-100',         cat: 'Dev Tools' },
  { path: '/xml-beautifier',    icon: '</>',label: 'XML Beautifier',           desc: 'Format tangled, single-line XML with proper indentation or strip all whitespace for production minification',                        color: 'bg-gray-100',          cat: 'Dev Tools' },
  { path: '/xml-formatter',     icon: '📄', label: 'XML Formatter',            desc: 'Beautify or minify XML documents — supports large files and displays character encoding and root tag info',                          color: 'bg-orange-100',        cat: 'Dev Tools' },
  { path: '/html-tools',        icon: '🌐', label: 'HTML Minifier/Beautifier', desc: 'Compress HTML to reduce page-load time by removing whitespace, or indent it neatly for code readability',                          color: 'bg-rose-100',          cat: 'Dev Tools' },
  { path: '/yaml-json',         icon: '🔄', label: 'YAML ↔ JSON',             desc: 'Convert YAML configuration files to JSON and back — perfect for Kubernetes manifests, CI/CD pipelines, and APIs',                  color: 'bg-purple-100',        cat: 'Dev Tools' },
  { path: '/jwt-debugger',      icon: '🔑', label: 'JWT Debugger',             desc: 'Decode a JWT token to inspect the header, payload claims, and expiry timestamp — no secret key needed',                            color: 'bg-indigo-100',        cat: 'Dev Tools' },
  { path: '/sql-formatter',     icon: '🗄️', label: 'SQL Formatter',            desc: 'Reformat messy SQL queries into clean, indented code — supports MySQL, PostgreSQL, SQLite, and T-SQL dialects',                    color: 'bg-blue-100',          cat: 'Dev Tools' },
  { path: '/json-to-csv',       icon: '📊', label: 'JSON to CSV',              desc: 'Convert a JSON array of objects into a spreadsheet-ready CSV file with a live column preview before download',                     color: 'bg-emerald-100',       cat: 'Dev Tools' },
  { path: '/cron-descriptor',   icon: '⏰', label: 'Cron Descriptor',          desc: 'Paste a cron expression and instantly get a plain-English sentence describing when the job will fire next',                         color: 'bg-amber-100',         cat: 'Dev Tools' },
  { path: '/qr-generator',      icon: '▦',  label: 'QR Generator',            desc: 'Generate a scannable QR code from any URL, plain text, or contact info and download it as a PNG image',                            color: 'bg-gray-100',          cat: 'Dev Tools' },
  { path: '/regex-tester',      icon: '.*', label: 'Regex Tester',             desc: 'Test a regular expression against sample text with live highlighted matches, group captures, and flag toggles',                     color: 'bg-rose-100',          cat: 'Dev Tools' },
  { path: '/markdown-preview',  icon: '📝', label: 'Markdown Preview',         desc: 'Write Markdown on the left and see the fully rendered HTML on the right in real time — supports GFM tables',                       color: 'bg-indigo-100',        cat: 'Dev Tools' },
  { path: '/hash-generator',    icon: '#',  label: 'Hash Generator',           desc: 'Generate MD5, SHA-1, SHA-256, or SHA-512 cryptographic hashes of any text — useful for checksums and fingerprints',                color: 'bg-emerald-100',       cat: 'Dev Tools' },
  { path: '/lorem-ipsum',       icon: 'Aa', label: 'Lorem Ipsum Generator',    desc: 'Generate realistic filler text by word, sentence, or paragraph count for UI mockups and layout prototypes',                        color: 'bg-orange-100',        cat: 'Dev Tools' },
  { path: '/unit-converter',    icon: '⇄',  label: 'Unit Converter',           desc: 'Convert Length, Mass, Temperature, Area, Volume, Speed, Data size, and Time units in one unified tool',                            color: 'bg-teal-100',          cat: 'Dev Tools' },
  { path: '/timezone-converter',icon: '🌍', label: 'Timezone Converter',       desc: 'Pick any two cities and convert times across world timezones with a live analog clock for each location',                           color: 'bg-sky-100',           cat: 'Dev Tools' },
  { path: '/color-converter',   icon: '🎨', label: 'Color Converter',          desc: 'Convert any color between HEX, RGB, HSL, HSV, and CMYK simultaneously with a live interactive color picker',                       color: 'bg-pink-100',          cat: 'Dev Tools' },
  { path: '/number-base',       icon: '01', label: 'Number Base Converter',    desc: 'Convert any integer between Binary, Octal, Decimal, and Hexadecimal — shows bit representation',                                   color: 'bg-violet-100',        cat: 'Dev Tools' },
  { path: '/html-entity',       icon: '&amp;', label: 'HTML Entity Tool',      desc: 'Encode special characters to HTML entities or decode entity strings back to readable text — supports full Unicode',                 color: 'bg-indigo-100',        cat: 'Dev Tools' },
  { path: '/unicode-inspector', icon: 'Ω',  label: 'Unicode Inspector',        desc: "Paste any text to see each character's Unicode code point, UTF-8 byte sequence, script name, and category",                       color: 'bg-cyan-100',          cat: 'Dev Tools' },
  { path: '/css-js-minifier',   icon: '{}', label: 'CSS / JS Minifier',        desc: 'Minify CSS or JavaScript to cut file size for production — or beautify minified code for easier debugging',                         color: 'bg-amber-100',         cat: 'Dev Tools' },
  { path: '/ip-calculator',     icon: '🌐', label: 'IP / CIDR Calculator',     desc: 'Enter an IP address and subnet mask to calculate network address, broadcast, usable host range, and binary view',                  color: 'bg-blue-100',          cat: 'Dev Tools' },
  { path: '/calendar-converter',icon: '📅', label: 'Calendar Converter',       desc: 'Convert dates between the Gregorian calendar and Hijri (Islamic) calendar with day-of-week and leap year info',                   color: 'bg-emerald-100',       cat: 'Dev Tools' },
  { path: '/code-diff',         icon: '⇄',  label: 'Code Diff',                desc: 'Paste two code snippets and see every added, removed, and changed line highlighted in side-by-side or unified view',               color: 'bg-rose-100',          cat: 'Dev Tools' },
  { path: '/lab-code-cleaner',  icon: '🧹', label: 'Lab Code Cleaner',         desc: 'Paste code from a college PDF lab manual — strips line numbers, curly quotes, split operators, and hidden characters instantly',   color: 'bg-emerald-100',       cat: 'Dev Tools' },
  { path: '/base64',            icon: '🔡', label: 'Base64',                   desc: 'Encode plain text or binary data to a Base64 string, or decode a Base64 string back to its original form',                         color: 'bg-violet-100',        cat: 'Dev Tools' },
  { path: '/url-encode',        icon: '🔗', label: 'URL Encode/Decode',        desc: 'Percent-encode special characters in a URL for safe transmission, or decode an encoded URL back to readable text',                 color: 'bg-cyan-100',          cat: 'Dev Tools' },
  { path: '/webp-converter',    icon: '🖼️', label: 'WebP Converter',           desc: 'Convert WebP images to JPG or PNG for compatibility, or convert JPG/PNG to lightweight WebP for faster web pages',                color: 'bg-sky-100',           cat: 'Media & Graphics' },
  { path: '/image-metadata',    icon: '🔍', label: 'Metadata Stripper',        desc: 'Remove embedded EXIF data — GPS coordinates, camera model, timestamps — from JPEG and PNG images before sharing',                 color: 'bg-slate-100',         cat: 'Media & Graphics' },
  { path: '/svg-converter',     icon: '⬡',  label: 'SVG to PNG/WebP',         desc: 'Render an SVG vector file to a crisp PNG or WebP raster image at any custom resolution, width, or DPI setting',                  color: 'bg-indigo-100',        cat: 'Media & Graphics' },
  { path: '/image-compressor',  icon: '📉', label: 'Image Compressor',         desc: 'Reduce image file size with an interactive quality slider — see before/after size savings and dimensions live',                   color: 'bg-teal-100',          cat: 'Media & Graphics' },
  { path: '/favicon-generator', icon: '⭐', label: 'Favicon Generator',        desc: 'Upload a logo or type an emoji to generate favicon PNG files at 16×16, 32×32, 64×64, and 180×180 px',                            color: 'bg-yellow-100',        cat: 'Media & Graphics' },
  { path: '/color-palette',     icon: '🎨', label: 'Color Palette',            desc: 'Upload any photo and automatically extract 5–10 dominant colors with their HEX codes for use in design projects',                 color: 'bg-pink-100',          cat: 'Media & Graphics' },
  { path: '/css-gradient',      icon: '🌈', label: 'CSS Gradient Maker',       desc: 'Design smooth linear, radial, or conic CSS gradients visually and copy the ready-to-use CSS background property',                 color: 'bg-violet-100',        cat: 'Media & Graphics' },
  { path: '/image-cropper',     icon: '✂️', label: 'Image Cropper',            desc: 'Drag a crop handle to cut any image to exact dimensions — choose a preset aspect ratio or enter custom pixel values',             color: 'bg-orange-100',        cat: 'Media & Graphics' },
  { path: '/bg-remover',        icon: '🪄', label: 'Background Remover',       desc: 'Automatically remove the background from any product photo or portrait using AI — download as a transparent PNG',                 color: 'bg-pink-100',          cat: 'Media & Graphics' },
  { path: '/heic-converter',    icon: '📷', label: 'HEIC to JPG',              desc: 'Convert iPhone HEIC/HEIF photos to universally compatible JPEGs right in the browser — no upload to a server needed',             color: 'bg-sky-100',           cat: 'Media & Graphics' },
  { path: '/word-compare',      icon: '🔍', label: 'Word Compare',             desc: 'Paste two pieces of text and see every addition, deletion, and word-level change highlighted side-by-side',                       color: 'bg-amber-100',         cat: 'Word Tools' },
  { path: '/word-count',        icon: '🔢', label: 'Word Count',               desc: 'Count words, characters (with and without spaces), sentences, paragraphs, and estimated reading time in your text',               color: 'bg-pink-100',          cat: 'Word Tools' },
]

const CATEGORIES = ['All', 'Organize PDF', 'Optimize PDF', 'PDF Security', 'Convert PDF', 'AI Tools', 'Dev Tools', 'Media & Graphics', 'Word Tools']
const CAT_COUNTS = CATEGORIES.reduce((acc, c) => {
  acc[c] = c === 'All' ? ALL_TOOLS.length : ALL_TOOLS.filter(t => t.cat === c).length
  return acc
}, {})

const BASE_VISITORS = 4827

export default function Home() {
  const [active, setActive] = useState('All')
  const [visitors, setVisitors] = useState(BASE_VISITORS)

  useEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem('dc_visitors') || '0', 10)
      const count = stored > 0 ? stored + 1 : BASE_VISITORS + 1
      localStorage.setItem('dc_visitors', String(count))
      setVisitors(count)
    } catch { setVisitors(BASE_VISITORS) }
  }, [])

  const visible = ALL_TOOLS.filter(t => active === 'All' || t.cat === active)

  const selectCat = (c) => setActive(c)

  return (
    <>
      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, ${DARK2} 60%, #4338ca 100%)`, textAlign: 'center' }} className="px-5 sm:px-12 py-10 sm:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl" style={{ fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.25 }}>
          The Smart All-in-One Workspace for Your Documents and Code
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(199,210,254,0.9)', margin: '0 0 10px', lineHeight: 1.6, whiteSpace: 'nowrap' }}>
          Every utility tool you need to process PDFs, clean code logs, and compare documents — <span style={{ color: ACCENT, fontWeight: 700 }}>100% FREE</span>, no signup needed.
        </p>
        <p style={{ fontSize: '13.5px', color: 'rgba(199,210,254,0.6)', margin: 0, lineHeight: 1.8 }}>
          Merge, split, compress, convert, rotate and watermark PDFs. Format JSON, SQL and HTML. Clean lab code, convert images, generate QR codes — all in one place.
        </p>
      </div>

      {/* ── Stats bar ── */}
      <div className="px-4 sm:px-8 py-4" style={{ background: '#fff', borderBottom: '1px solid #e0e7ff' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0', flexWrap: 'wrap' }}>
          {[
            { n: '57+',                        l: 'Free Tools' },
            { n: '100%',                       l: 'Browser-Based' },
            { n: 'No',                         l: 'Signup Required' },
            { n: '25 MB',                      l: 'Max File Size' },
            { n: visitors.toLocaleString()+'+',l: 'Happy Visitors' },
          ].map(({ n, l }, i, arr) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="px-4 sm:px-8" style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: ACCENT2, margin: '0 0 2px', lineHeight: 1 }}>{n}</p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 500 }}>{l}</p>
              </div>
              {i < arr.length - 1 && <div style={{ width: '1px', height: '36px', background: '#e0e7ff', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e7ff', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => {
            const isActive = active === c
            return (
              <button
                key={c}
                onClick={() => selectCat(c)}
                style={{
                  flexShrink: 0, padding: '14px 16px', border: 'none', cursor: 'pointer',
                  background: 'transparent', fontSize: '13.5px', fontWeight: isActive ? 700 : 500,
                  color: isActive ? ACCENT2 : '#64748b',
                  borderBottom: isActive ? `2px solid ${ACCENT2}` : '2px solid transparent',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = DARK }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#64748b' }}
              >
                {c}
                <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 700, background: isActive ? '#fef2f2' : '#f1f5f9', color: isActive ? ACCENT2 : '#94a3b8', padding: '1px 7px', borderRadius: '999px' }}>
                  {CAT_COUNTS[c]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tool grid ── */}
      <div style={{ background: CONTENT_BG, padding: '28px 28px 60px' }}>
        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#475569' }}>No tools in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {visible.map(tool => (
              <Link key={tool.path} to={tool.path} className="tool-card group" style={{ textDecoration: 'none' }}>
                <div className={`tool-icon-wrap ${tool.color}`}>
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{tool.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: 0, lineHeight: 1.25 }}
                    className="group-hover:text-rose-500">
                    {tool.label}
                  </h3>
                  <p style={{ fontSize: '15.5px', color: '#64748b', lineHeight: 1.7, margin: 0 }}
                    className="line-clamp-3">
                    {tool.desc}
                  </p>
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8', paddingTop: '10px', borderTop: '1px solid #ede9fe', display: 'block', width: '100%' }}>
                  {tool.cat}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </>
  )
}
