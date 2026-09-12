import { Link, useLocation } from 'react-router-dom'
import { FileText } from 'lucide-react'

const DARK = '#1e1b4b'
const INFO_PAGES = ['/about', '/contact', '/feedback']

export default function Footer() {
  const { pathname } = useLocation()
  const shouldReplace = INFO_PAGES.includes(pathname)
  return (
    <footer style={{ background: DARK, color: 'rgba(199,210,254,0.75)', marginTop: '0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 0' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8" style={{ marginBottom: '40px' }}>

          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" replace={shouldReplace} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '18px', color: '#fff', textDecoration: 'none', marginBottom: '10px' }}>
              <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#fb7185,#f43f5e)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={16} color="#fff" />
              </div>
              DocCraft
            </Link>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(199,210,254,0.6)', margin: 0 }}>
              All document &amp; developer tools in one place. Free, fast, and private.
            </p>
          </div>

          {/* PDF Tools */}
          <FooterCol replace={shouldReplace} title="PDF Tools" links={[
            ['Merge PDF',       '/merge-pdf'],
            ['Split PDF',       '/split-pdf'],
            ['Compress PDF',    '/compress-pdf'],
            ['Rotate PDF',      '/rotate-pdf'],
            ['Protect PDF',     '/protect-pdf'],
          ]} />

          {/* Convert */}
          <FooterCol replace={shouldReplace} title="Convert" links={[
            ['PDF to Word',     '/pdf-to-word'],
            ['Word to PDF',     '/word-to-pdf'],
            ['PDF to JPG',      '/pdf-to-jpg'],
            ['JPG to PDF',      '/jpg-to-pdf'],
            ['Excel to PDF',    '/excel-to-pdf'],
          ]} />

          {/* Dev Tools */}
          <FooterCol replace={shouldReplace} title="Dev Tools" links={[
            ['JSON Beautifier',  '/json-beautifier'],
            ['SQL Formatter',    '/sql-formatter'],
            ['JWT Debugger',     '/jwt-debugger'],
            ['Regex Tester',     '/regex-tester'],
            ['Code Diff',        '/code-diff'],
          ]} />

          {/* Company */}
          <FooterCol replace={shouldReplace} title="Company" links={[
            ['Home',    '/'],
            ['About',   '/about'],
            ['Contact', '/contact'],
          ]} extra={[
            ['Blog', null],
          ]} />

        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(99,102,241,0.25)', padding: '20px 0' }} />
      </div>
    </footer>
  )
}

function FooterCol({ title, links, extra = [], replace = false }) {
  return (
    <div>
      <h4 style={{ fontWeight: 700, fontSize: '13px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>{title}</h4>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {links.map(([label, path]) => (
          <li key={path}>
            <Link to={path} replace={replace} style={{ fontSize: '13.5px', color: 'rgba(199,210,254,0.65)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(199,210,254,0.65)'}>
              {label}
            </Link>
          </li>
        ))}
        {extra.map(([label, path]) => (
          <li key={label}>
            <span style={{ fontSize: '13.5px', color: 'rgba(199,210,254,0.35)', cursor: 'default' }}>
              {label} <span style={{ fontSize: '10px', background: 'rgba(251,113,133,0.2)', color: '#fb7185', borderRadius: '4px', padding: '1px 5px', fontWeight: 700 }}>Soon</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
