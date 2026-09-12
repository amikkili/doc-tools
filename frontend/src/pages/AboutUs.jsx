import { Zap, Shield, Heart, Globe, Code2, DollarSign, Lightbulb } from 'lucide-react'

const DARK  = '#1e1b4b'
const DARK2 = '#312e81'
const ACCENT  = '#fb7185'
const ACCENT2 = '#f43f5e'

const VALUES = [
  { icon: Heart,      bg: '#fef2f2', iconColor: '#f43f5e', title: 'Radically Free',     desc: 'Every browser-side tool — PDF merge, JSON formatting, image conversion — costs us nothing to serve, so it costs you nothing to use. Free means free, forever.' },
  { icon: Shield,     bg: '#f0fdf4', iconColor: '#16a34a', title: 'Your Privacy First',  desc: 'Client-side tools never send your files to a server. Your documents and code stay on your device. We don\'t log, sell, or analyse your data.' },
  { icon: Zap,        bg: '#fffbeb', iconColor: '#d97706', title: 'Instant, No Friction', desc: 'No sign-up walls, no captchas, no timers. Open the tool, paste your content, get your result.' },
  { icon: DollarSign, bg: '#faf5ff', iconColor: '#7c3aed', title: 'Honest Pricing',      desc: 'A handful of tools that use real cloud compute carry a small charge. We tell you upfront which ones and why. No surprises.' },
  { icon: Code2,      bg: '#eff6ff', iconColor: '#2563eb', title: 'Built by a Developer', desc: 'Every UX decision was made with the engineer and student in mind. If it\'s annoying, we fix it.' },
  { icon: Globe,      bg: '#f0f9ff', iconColor: '#0284c7', title: 'For Everyone',         desc: 'A student debugging lab code, a developer formatting JSON, a professional converting a report — DocCraft is for all of you.' },
]


const TEAM = [
  { emoji: '👨‍💻', name: 'AK Mikkili', role: 'Founder & CEO',  bg: 'linear-gradient(135deg,#fb7185,#f43f5e)', desc: 'IT Lead Engineer · NIT Durgapur alum. Built DocCraft after getting frustrated one too many times with paywall-gated tools at 11 PM. Every design decision on this platform started from his own frustration as a developer.' },
  { emoji: '👩‍💼', name: 'Padma',       role: 'Co-Founder',      bg: 'linear-gradient(135deg,#818cf8,#6366f1)', desc: 'Shapes DocCraft\'s product vision and business strategy. Makes sure what we build actually solves real problems for real people, not just what\'s easy to build.' },
  { emoji: '👨‍🔧', name: 'Ramesh',      role: 'Lead Engineer',   bg: 'linear-gradient(135deg,#34d399,#059669)', desc: 'Leads backend infrastructure and keeps the engines running. Ensures every tool is fast, reliable, and handles edge cases gracefully under real-world load.' },
]

export default function AboutUs() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 80px' }}>

      {/* ── Our Thought ── */}
      <div className="px-6 sm:px-12 py-10 sm:py-14" style={{ background: `linear-gradient(135deg, ${DARK} 0%, ${DARK2} 60%, #4338ca 100%)`, borderRadius: '24px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(251,113,133,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(251,113,133,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lightbulb size={18} color={ACCENT} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Our Thought</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: '0 0 20px', maxWidth: '640px' }}>
            Great tools should be free for everyone who needs them.
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(199,210,254,0.85)', lineHeight: 1.85, margin: '0 0 14px', maxWidth: '700px' }}>
            You're in the middle of a task — merging a PDF, formatting JSON, converting an image — and you hit a wall. A login gate. A "you've used your 2 free conversions" message. An ad you have to sit through. Every time, without exception.
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(199,210,254,0.85)', lineHeight: 1.85, margin: 0, maxWidth: '700px' }}>
            The truth is, most of these tools run entirely in your browser — on your device. The provider bears zero server cost. The paywall isn't a necessity — it's a choice. <strong style={{ color: ACCENT, fontWeight: 700 }}>DocCraft makes a different choice: if it runs in your browser, it's free. Period.</strong>
          </p>
        </div>
      </div>

      {/* ── Meet the Team ── */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: DARK, margin: '0 0 18px' }}>Meet the Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ marginBottom: '36px' }}>
        {TEAM.map(({ emoji, name, role, bg, desc }) => (
          <div key={name} style={{ background: '#fff', border: '1px solid #e0e7ff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(99,102,241,0.08)' }}>
            {/* Colour header */}
            <div style={{ background: bg, padding: '28px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                {emoji}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 800, color: '#fff', fontSize: '16px', margin: '0 0 3px', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>{name}</p>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{role}</p>
              </div>
            </div>
            {/* Description */}
            <div style={{ padding: '18px 20px' }}>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.75, margin: 0 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── What's free / what's not ── */}
      <div style={{ background: '#fff', border: '1px solid #e0e7ff', borderRadius: '20px', padding: '32px', marginBottom: '28px', boxShadow: '0 2px 16px rgba(99,102,241,0.06)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: DARK, margin: '0 0 8px' }}>Our Promise: Honest About What's Free</h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: 1.7 }}>We're transparent. Here's exactly how DocCraft works:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '20px' }}>
            <p style={{ fontWeight: 800, color: '#15803d', marginBottom: '10px', fontSize: '14px' }}>✅ Always Free</p>
            <ul style={{ fontSize: '13.5px', color: '#166534', lineHeight: 2.1, margin: 0, paddingLeft: '18px' }}>
              <li>PDF merge, split, rotate, compress</li>
              <li>JSON, XML, SQL, YAML formatting</li>
              <li>Image conversion &amp; compression</li>
              <li>QR codes, regex tester, code diff</li>
              <li>Lab code cleaner, word compare</li>
              <li>Base64, hash, URL encode &amp; more</li>
            </ul>
            <p style={{ fontSize: '12px', color: '#15803d', marginTop: '12px', fontStyle: 'italic' }}>Runs in your browser — zero server cost to us.</p>
          </div>
          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '14px', padding: '20px' }}>
            <p style={{ fontWeight: 800, color: '#7c3aed', marginBottom: '10px', fontSize: '14px' }}>💜 Small Charge (Actual Cost)</p>
            <ul style={{ fontSize: '13.5px', color: '#6d28d9', lineHeight: 2.1, margin: 0, paddingLeft: '18px' }}>
              <li>AI-powered PDF Summarizer</li>
              <li>OCR (scanned document reading)</li>
              <li>Large-file cloud processing</li>
              <li>Background removal (AI model)</li>
            </ul>
            <p style={{ fontSize: '12px', color: '#7c3aed', marginTop: '12px', fontStyle: 'italic' }}>These hit real servers — we charge only what it costs.</p>
          </div>
        </div>
      </div>

      {/* ── Values ── */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: DARK, margin: '0 0 18px' }}>What We Stand For</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '36px' }}>
        {VALUES.map(({ icon: Icon, bg, iconColor, title, desc }) => (
          <div key={title} style={{ background: '#fff', border: '1px solid #e0e7ff', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 8px rgba(99,102,241,0.05)', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={19} color={iconColor} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: DARK, fontSize: '14px', margin: '0 0 4px' }}>{title}</p>
              <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
