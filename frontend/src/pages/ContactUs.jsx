import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Clock, CheckCircle2, ChevronRight, ChevronLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const DARK   = '#1e1b4b'
const ACCENT = '#fb7185'
const ACCENT2= '#f43f5e'

const GENERAL_SUBJECTS = [
  'Technical problem',
  'Bug report',
  'Feature request',
  'Billing / Subscription',
  'General inquiry',
]

const SPECIFIC_SUBJECTS = {
  'Technical problem':    ['PDF conversion issue', 'Dev tool not working', 'Image tool issue', 'Page not loading', 'Slow performance', 'Other technical issue'],
  'Bug report':          ['Wrong output produced', 'Tool crashes or freezes', 'Display / layout issue', 'Download not working', 'Other bug'],
  'Feature request':     ['New tool suggestion', 'UI / UX improvement', 'API / integration request', 'Mobile app request', 'Other feature'],
  'Billing / Subscription': ['Question about a charge', 'Refund request', 'Upgrade / downgrade plan', 'Cancel subscription', 'Other billing'],
  'General inquiry':     ['Partnership / collaboration', 'Press / media', 'Career opportunities', 'Data privacy question', 'Other'],
}

const PLATFORMS = ['Web (browser)']

export default function ContactUs() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', email: '',
    generalSubject: GENERAL_SUBJECTS[0],
    specificSubject: SPECIFIC_SUBJECTS[GENERAL_SUBJECTS[0]][0],
    platform: '',
    message: '',
  })
  const [sent, setSent] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleGeneralChange = (v) => {
    setForm(f => ({ ...f, generalSubject: v, specificSubject: SPECIFIC_SUBJECTS[v][0] }))
  }

  const step1Valid = form.name.trim() && form.email.trim() && form.generalSubject && form.specificSubject
  const step2Valid = form.message.trim()

  const send = () => {
    setSent(true)
    toast.success('Message sent! We\'ll reply to ' + form.email + ' shortly.')
  }

  const steps = ['Your Details', 'Your Issue', 'Review & Send']

  if (sent) return (
    <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ width: '72px', height: '72px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <CheckCircle2 size={38} color="#16a34a" />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: DARK, margin: '0 0 10px' }}>Message Sent!</h2>
      <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '28px', lineHeight: 1.7 }}>
        Thanks for reaching out, <strong>{form.name}</strong>. We'll reply to <strong>{form.email}</strong> within 1–2 business days.
      </p>
      <Link to="/" style={{ display: 'inline-block', background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, color: '#fff', fontWeight: 700, fontSize: '14px', padding: '11px 28px', borderRadius: '12px', textDecoration: 'none' }}>
        Back to Home
      </Link>
    </div>
  )

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 80px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '40px', alignItems: 'start' }}>

        {/* ── Left: info ── */}
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: DARK, margin: '0 0 8px' }}>Contact Us</h1>
          <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, marginBottom: '32px' }}>
            Report a problem, suggest a feature, or just say hello. We read every message.
          </p>

          {[
            { icon: Mail,    bg: '#fef2f2', ic: ACCENT2,   title: 'Email',          sub: 'contact@anilsofttech.com' },
            { icon: Clock,   bg: '#eff6ff', ic: '#2563eb',  title: 'Response time',  sub: 'Within 1–2 business days' },
            { icon: MapPin,  bg: '#f0fdf4', ic: '#16a34a',  title: 'Location',       sub: 'Hyderabad, Telangana, India' },
          ].map(({ icon: Icon, bg, ic, title, sub }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: '#fff', border: '1px solid #e0e7ff', borderRadius: '16px', marginBottom: '12px', boxShadow: '0 1px 6px rgba(99,102,241,0.05)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={19} color={ic} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: DARK, fontSize: '14px', margin: '0 0 2px' }}>{title}</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right: 3-step form ── */}
        <div style={{ background: '#fff', border: '1px solid #e0e7ff', borderRadius: '24px', boxShadow: '0 4px 24px rgba(99,102,241,0.08)', overflow: 'hidden' }}>

          {/* Step indicator */}
          <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #312e81 100%)`, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {steps.map((s, i) => {
                const n = i + 1
                const done = step > n
                const active = step === n
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? '#16a34a' : active ? ACCENT : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff', transition: 'background 0.2s' }}>
                        {done ? '✓' : n}
                      </div>
                      <span style={{ fontSize: '12.5px', fontWeight: active ? 700 : 500, color: active ? '#fff' : 'rgba(199,210,254,0.65)', whiteSpace: 'nowrap' }}>{s}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ flex: 1, height: '1px', background: done ? '#16a34a' : 'rgba(255,255,255,0.15)', margin: '0 10px', transition: 'background 0.2s' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form body */}
          <div style={{ padding: '28px' }}>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Your name *" value={form.name} onChange={v => set('name', v)} placeholder="Anil Kumar" />
                  <Field label="Your email *" value={form.email} onChange={v => set('email', v)} placeholder="you@example.com" type="email" />
                </div>
                <SelectField label="General Subject *" value={form.generalSubject} options={GENERAL_SUBJECTS}
                  onChange={v => handleGeneralChange(v)} />
                <SelectField label="Specific Subject *" value={form.specificSubject} options={SPECIFIC_SUBJECTS[form.generalSubject]}
                  onChange={v => set('specificSubject', v)} />
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: DARK, display: 'block', marginBottom: '8px' }}>Message *</label>
                <textarea
                  rows={7} value={form.message} placeholder="Describe your issue or question in detail..."
                  onChange={e => set('message', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e0e7ff', fontSize: '14px', color: '#374151', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.65, boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = ACCENT}
                  onBlur={e => e.target.style.borderColor = '#e0e7ff'}
                />
              </div>
            )}

            {/* ── STEP 3: Summary ── */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: DARK, marginBottom: '16px' }}>Review your message</h3>
                <div style={{ background: '#f8f7ff', border: '1px solid #e0e7ff', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
                  {[
                    ['Name', form.name],
                    ['Email', form.email],
                    ['General Subject', form.generalSubject],
                    ['Specific Subject', form.specificSubject],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: '12px', marginBottom: '10px', fontSize: '14px' }}>
                      <span style={{ fontWeight: 700, color: DARK, minWidth: '140px', flexShrink: 0 }}>{k}:</span>
                      <span style={{ color: '#6366f1', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#f8f7ff', border: '1px solid #e0e7ff', borderRadius: '14px', padding: '18px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: DARK, margin: '0 0 8px' }}>Message:</p>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.75, margin: 0 }}>{form.message}</p>
                </div>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '14px' }}>
                  We'll reply to <strong>{form.email}</strong> within 1–2 business days.
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e0e7ff' }}>
              {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '10px 18px', cursor: 'pointer' }}>
                  <ChevronLeft size={15} /> Previous
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 ? !step1Valid : !step2Valid}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 700, color: '#fff', background: (step === 1 ? step1Valid : step2Valid) ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : '#e0e7ff', border: 'none', borderRadius: '10px', padding: '10px 22px', cursor: (step === 1 ? step1Valid : step2Valid) ? 'pointer' : 'not-allowed', transition: 'opacity 0.15s' }}>
                  Next Step <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={send}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: 700, color: '#fff', background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, border: 'none', borderRadius: '10px', padding: '11px 26px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(244,63,94,0.35)' }}>
                  <Send size={15} /> Send Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '7px' }}>{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0e7ff', fontSize: '14px', color: '#374151', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
        onFocus={e => e.target.style.borderColor = '#fb7185'}
        onBlur={e => e.target.style.borderColor = '#e0e7ff'}
      />
    </div>
  )
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '7px' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e0e7ff', fontSize: '14px', color: '#374151', outline: 'none', fontFamily: 'inherit', background: '#fff', cursor: 'pointer', appearance: 'auto' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
