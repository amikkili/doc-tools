import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileText, ChevronDown, Sun, Moon, Menu, X, UserPlus } from 'lucide-react'

/* ── palette ── */
const NAV_BG   = '#1e1b4b'
const NAV_TEXT = 'rgba(199,210,254,0.9)'
const NAV_HOVER= 'rgba(255,255,255,0.1)'
const ACCENT   = '#fb7185'

/* ── Dropdown data ── */
const PDF_COLS = [
  {
    heading: 'Organize & Optimize',
    items: [
      { label: 'Merge PDF',        path: '/merge-pdf' },
      { label: 'Split PDF',        path: '/split-pdf' },
      { label: 'Rotate PDF',       path: '/rotate-pdf' },
      { label: 'Compress PDF',     path: '/compress-pdf' },
      { label: 'Watermark PDF',    path: '/watermark-pdf' },
      { label: 'Protect PDF',      path: '/protect-pdf' },
      { label: 'Smart PDF Analyzer', path: '/analyze-pdf' },
    ],
  },
  {
    heading: 'Convert',
    items: [
      { label: 'PDF to Word',       path: '/pdf-to-word' },
      { label: 'PDF to JPG',        path: '/pdf-to-jpg' },
      { label: 'PDF to Excel',      path: '/pdf-to-excel' },
      { label: 'PDF to PowerPoint', path: '/pdf-to-pptx' },
      { label: 'Word to PDF',       path: '/word-to-pdf' },
      { label: 'JPG to PDF',        path: '/jpg-to-pdf' },
      { label: 'Excel to PDF',      path: '/excel-to-pdf' },
      { label: 'PowerPoint to PDF', path: '/pptx-to-pdf' },
      { label: 'HTML to PDF',       path: '/html-to-pdf' },
    ],
  },
]

const WORD_ITEMS = [
  { label: 'Word Compare',  path: '/word-compare' },
  { label: 'Word Count',    path: '/word-count' },
  { label: 'Word to PDF',   path: '/word-to-pdf' },
  { label: 'PDF to Word',   path: '/pdf-to-word' },
]

const DEV_COLS = [
  {
    heading: 'JSON & Markup',
    items: [
      { label: 'JSON Beautifier', path: '/json-beautifier' },
      { label: 'JSON Validator',  path: '/json-validator' },
      { label: 'JSON to CSV',     path: '/json-to-csv' },
      { label: 'XML Beautifier',  path: '/xml-beautifier' },
      { label: 'XML Formatter',   path: '/xml-formatter' },
      { label: 'SQL Formatter',   path: '/sql-formatter' },
      { label: 'YAML ↔ JSON',    path: '/yaml-json' },
      { label: 'JWT Debugger',    path: '/jwt-debugger' },
    ],
  },
  {
    heading: 'Code & Utilities',
    items: [
      { label: 'Regex Tester',       path: '/regex-tester' },
      { label: 'Code Diff',          path: '/code-diff' },
      { label: 'Lab Code Cleaner',   path: '/lab-code-cleaner' },
      { label: 'Hash Generator',     path: '/hash-generator' },
      { label: 'QR Generator',       path: '/qr-generator' },
      { label: 'Markdown Preview',   path: '/markdown-preview' },
      { label: 'Base64',             path: '/base64' },
      { label: 'URL Encode/Decode',  path: '/url-encode' },
    ],
  },
]

const MEDIA_ITEMS = [
  { label: 'WebP Converter',     path: '/webp-converter' },
  { label: 'Image Compressor',   path: '/image-compressor' },
  { label: 'Image Cropper',      path: '/image-cropper' },
  { label: 'Background Remover', path: '/bg-remover' },
  { label: 'HEIC to JPG',        path: '/heic-converter' },
  { label: 'Favicon Generator',  path: '/favicon-generator' },
  { label: 'Color Palette',      path: '/color-palette' },
  { label: 'SVG to PNG/WebP',    path: '/svg-converter' },
  { label: 'CSS Gradient Maker', path: '/css-gradient' },
  { label: 'Metadata Stripper',  path: '/image-metadata' },
]

const UTIL_ITEMS = [
  { label: 'Smart PDF Analyzer', path: '/analyze-pdf' },
  { label: 'Unit Converter',     path: '/unit-converter' },
  { label: 'Timezone Converter', path: '/timezone-converter' },
  { label: 'Color Converter',    path: '/color-converter' },
  { label: 'Number Base',        path: '/number-base' },
  { label: 'IP/CIDR Calculator', path: '/ip-calculator' },
  { label: 'Calendar Converter', path: '/calendar-converter' },
  { label: 'Cron Descriptor',    path: '/cron-descriptor' },
  { label: 'Lorem Ipsum',        path: '/lorem-ipsum' },
]

/* ── ALL TOOLS mega columns ── */
const MEGA_COLS = [
  { heading: 'Organize PDF',      items: PDF_COLS[0].items.slice(0, 6) },
  { heading: 'Convert PDF',       items: PDF_COLS[1].items },
  { heading: 'Dev Tools',         items: [...DEV_COLS[0].items.slice(0,5), ...DEV_COLS[1].items.slice(0,4)] },
  { heading: 'Code Utilities',    items: [...DEV_COLS[1].items.slice(4)] },
  { heading: 'Media & Graphics',  items: MEDIA_ITEMS.slice(0, 7) },
  { heading: 'Word Tools',        items: WORD_ITEMS },
  { heading: 'Utilities & AI',    items: UTIL_ITEMS.slice(0, 7) },
]

/* ── reusable link style helpers ── */
const dropLinkStyle = { display:'block', fontSize:'13px', fontWeight:500, color:'#374151', textDecoration:'none', padding:'6px 0', transition:'color 0.12s' }

const INFO_PAGES = ['/about', '/contact', '/feedback']

function DropLink({ to, children, onClose }) {
  const { pathname } = useLocation()
  return (
    <Link to={to} onClick={onClose} replace={INFO_PAGES.includes(pathname)} style={dropLinkStyle}
      onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
      onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
      {children}
    </Link>
  )
}

/* ── single-column dropdown ── */
function SimpleDropdown({ items, onClose }) {
  return (
    <div style={{ position:'absolute', top:'100%', left:0, background:'#fff', borderRadius:'14px', boxShadow:'0 16px 48px rgba(0,0,0,0.15)', border:'1px solid #e0e7ff', padding:'12px 16px', minWidth:'200px', zIndex:100 }}>
      {items.map(i => <DropLink key={i.path} to={i.path} onClose={onClose}>{i.label}</DropLink>)}
    </div>
  )
}

/* ── two-column dropdown ── */
function TwoColDropdown({ cols, onClose }) {
  return (
    <div style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', background:'#fff', borderRadius:'14px', boxShadow:'0 16px 48px rgba(0,0,0,0.15)', border:'1px solid #e0e7ff', padding:'16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 24px', minWidth:'420px', zIndex:100 }}>
      {cols.map(col => (
        <div key={col.heading}>
          <p style={{ fontSize:'10px', fontWeight:800, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px', paddingBottom:'5px', borderBottom:'1px solid #e0e7ff' }}>{col.heading}</p>
          {col.items.map(i => <DropLink key={i.path} to={i.path} onClose={onClose}>{i.label}</DropLink>)}
        </div>
      ))}
    </div>
  )
}

/* ── mega menu ── */
function MegaMenu({ onClose }) {
  return (
    <div style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:'min(98vw,1080px)', background:'#fff', borderRadius:'16px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)', border:'1px solid #e0e7ff', padding:'20px', zIndex:100, display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:0 }} onMouseLeave={onClose}>
      {MEGA_COLS.map((col, i) => (
        <div key={col.heading} style={{ padding:'0 12px', borderRight: i < MEGA_COLS.length-1 ? '1px solid #e0e7ff' : 'none' }}>
          <p style={{ fontSize:'9.5px', fontWeight:800, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'8px', paddingBottom:'5px', borderBottom:'2px solid #e0e7ff' }}>{col.heading}</p>
          {col.items.map(i => <DropLink key={i.path} to={i.path} onClose={onClose}>{i.label}</DropLink>)}
        </div>
      ))}
    </div>
  )
}

/* ── generic nav dropdown wrapper ── */
function NavDrop({ label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position:'relative' }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen(o => !o)} style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'15px', fontWeight:600, letterSpacing:'0.02em', color: open ? ACCENT : NAV_TEXT, background: open ? 'rgba(251,113,133,0.15)' : 'transparent', border:'none', borderRadius:'7px', padding:'7px 10px', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s' }}>
        {label} <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.18s' }} />
      </button>
      {open && children(() => setOpen(false))}
    </div>
  )
}

export default function Navbar({ dark, setDark }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <nav style={{ background: NAV_BG, borderBottom:'1px solid rgba(99,102,241,0.25)', position:'sticky', top:0, zIndex:50, boxShadow:'0 2px 20px rgba(0,0,0,0.25)' }}>
      <div style={{ padding:'0 14px', display:'flex', alignItems:'center', height:'60px', gap:'2px' }}>

        {/* Logo — extreme left */}
        <Link to="/" replace={INFO_PAGES.includes(location.pathname)} style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:800, fontSize:'20px', color:'#fff', textDecoration:'none', flexShrink:0 }}>
          <div style={{ width:'30px', height:'30px', background:'linear-gradient(135deg,#fb7185,#f43f5e)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <FileText size={16} color="#fff" />
          </div>
          DocCraft
        </Link>

        {/* Desktop category nav — centered */}
        <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
          <div className="hidden xl:flex items-center gap-0.5">
            {[{l:'Home',p:'/'},{l:'Contact',p:'/contact'},{l:'About',p:'/about'}].slice(0,1).map(n => (
              <Link key={n.p} to={n.p} replace={INFO_PAGES.includes(location.pathname)} style={{ fontSize:'15.5px', fontWeight:600, color:NAV_TEXT, textDecoration:'none', padding:'7px 11px', borderRadius:'7px', transition:'all 0.15s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background=NAV_HOVER; e.currentTarget.style.color='#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=NAV_TEXT }}>
                {n.l}
              </Link>
            ))}
            <NavDrop label="PDF">
              {(close) => <TwoColDropdown cols={PDF_COLS} onClose={close} />}
            </NavDrop>
            <NavDrop label="Word">
              {(close) => <SimpleDropdown items={WORD_ITEMS} onClose={close} />}
            </NavDrop>
            <NavDrop label="Dev Tools">
              {(close) => <TwoColDropdown cols={DEV_COLS} onClose={close} />}
            </NavDrop>
            <NavDrop label="Media">
              {(close) => <SimpleDropdown items={MEDIA_ITEMS} onClose={close} />}
            </NavDrop>
            <NavDrop label="Utilities & AI">
              {(close) => <SimpleDropdown items={UTIL_ITEMS} onClose={close} />}
            </NavDrop>
            <NavDrop label="All Tools">
              {(close) => <MegaMenu onClose={close} />}
            </NavDrop>
            {[{l:'Contact',p:'/contact'},{l:'About',p:'/about'}].map(n => (
              <Link key={n.p} to={n.p} replace={INFO_PAGES.includes(location.pathname)} style={{ fontSize:'15.5px', fontWeight:600, color:NAV_TEXT, textDecoration:'none', padding:'7px 11px', borderRadius:'7px', transition:'all 0.15s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background=NAV_HOVER; e.currentTarget.style.color='#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=NAV_TEXT }}>
                {n.l}
              </Link>
            ))}
          </div>
        </div>

        {/* Right group */}
        <div className="hidden xl:flex items-center gap-2" style={{ flexShrink:0 }}>

          <button onClick={() => setDark(d => !d)} aria-label="Toggle theme"
            style={{ padding:'7px', borderRadius:'8px', background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', color:'#c7d2fe', lineHeight:0 }}>
            {dark ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} />}
          </button>

          <Link to="/signin" style={{ fontSize:'13px', fontWeight:600, color:'#c7d2fe', border:'1px solid rgba(199,210,254,0.35)', borderRadius:'8px', padding:'6px 14px', textDecoration:'none', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#c7d2fe' }}>
            Login
          </Link>

          <Link to="/signup" style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'13px', fontWeight:700, color:'#fff', background:'linear-gradient(135deg,#fb7185,#f43f5e)', borderRadius:'8px', padding:'6px 14px', textDecoration:'none', boxShadow:'0 2px 10px rgba(244,63,94,0.4)', transition:'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            <UserPlus size={13} /> Sign Up
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="xl:hidden flex items-center gap-2 ml-auto">
          <button onClick={() => setDark(d => !d)} style={{ padding:'7px', borderRadius:'8px', background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', color:'#c7d2fe', lineHeight:0 }}>
            {dark ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} />}
          </button>
          <button onClick={() => setMobileOpen(o => !o)} style={{ padding:'7px', borderRadius:'8px', background:'transparent', border:'none', cursor:'pointer', color:'#c7d2fe', lineHeight:0 }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ background:'#1e1b4b', borderTop:'1px solid rgba(99,102,241,0.25)', padding:'12px 20px 20px', maxHeight:'80vh', overflowY:'auto' }}>
          {[
            { section:'PDF Tools', items:[...PDF_COLS[0].items, ...PDF_COLS[1].items] },
            { section:'Word Tools', items: WORD_ITEMS },
            { section:'Dev Tools', items:[...DEV_COLS[0].items,...DEV_COLS[1].items] },
            { section:'Media & Graphics', items: MEDIA_ITEMS },
            { section:'Utilities & AI', items: UTIL_ITEMS },
          ].map(g => (
            <div key={g.section}>
              <p style={{ fontSize:'10px', fontWeight:700, color:'rgba(199,210,254,0.45)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'14px 0 5px 4px' }}>{g.section}</p>
              {g.items.map(i => (
                <Link key={i.path} to={i.path} onClick={() => setMobileOpen(false)}
                  replace={INFO_PAGES.includes(location.pathname)}
                  style={{ display:'block', padding:'7px 8px', borderRadius:'7px', color:NAV_TEXT, textDecoration:'none', fontSize:'13px' }}>
                  {i.label}
                </Link>
              ))}
            </div>
          ))}
          <div style={{ display:'flex', gap:'10px', marginTop:'16px', borderTop:'1px solid rgba(99,102,241,0.2)', paddingTop:'14px' }}>
            <Link to="/signin" onClick={() => setMobileOpen(false)} style={{ flex:1, textAlign:'center', padding:'10px', borderRadius:'8px', border:'1px solid rgba(199,210,254,0.3)', color:'#c7d2fe', textDecoration:'none', fontSize:'13px', fontWeight:600 }}>Login</Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)} style={{ flex:1, textAlign:'center', padding:'10px', borderRadius:'8px', background:'linear-gradient(135deg,#fb7185,#f43f5e)', color:'#fff', textDecoration:'none', fontSize:'13px', fontWeight:700 }}>Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
