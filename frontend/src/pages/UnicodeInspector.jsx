import { useState, useMemo } from 'react'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function getScript(cp) {
  if (cp <= 0x001F) return 'Control'
  if (cp <= 0x007E) return 'Basic Latin'
  if (cp <= 0x024F) return 'Extended Latin'
  if (cp >= 0x0370 && cp <= 0x03FF) return 'Greek'
  if (cp >= 0x0400 && cp <= 0x04FF) return 'Cyrillic'
  if (cp >= 0x0530 && cp <= 0x058F) return 'Armenian'
  if (cp >= 0x0590 && cp <= 0x05FF) return 'Hebrew'
  if (cp >= 0x0600 && cp <= 0x06FF) return 'Arabic'
  if (cp >= 0x0900 && cp <= 0x097F) return 'Devanagari'
  if (cp >= 0x0980 && cp <= 0x09FF) return 'Bengali'
  if (cp >= 0x0A80 && cp <= 0x0AFF) return 'Gujarati'
  if (cp >= 0x0B00 && cp <= 0x0B7F) return 'Oriya'
  if (cp >= 0x0B80 && cp <= 0x0BFF) return 'Tamil'
  if (cp >= 0x0C00 && cp <= 0x0C7F) return 'Telugu'
  if (cp >= 0x0C80 && cp <= 0x0CFF) return 'Kannada'
  if (cp >= 0x0D00 && cp <= 0x0D7F) return 'Malayalam'
  if (cp >= 0x0E00 && cp <= 0x0E7F) return 'Thai'
  if (cp >= 0x0E80 && cp <= 0x0EFF) return 'Lao'
  if (cp >= 0x1000 && cp <= 0x109F) return 'Myanmar'
  if (cp >= 0x10A0 && cp <= 0x10FF) return 'Georgian'
  if (cp >= 0x1100 && cp <= 0x11FF) return 'Hangul Jamo'
  if (cp >= 0x1E00 && cp <= 0x1EFF) return 'Latin Extended Additional'
  if (cp >= 0x1F00 && cp <= 0x1FFF) return 'Greek Extended'
  if (cp >= 0x2000 && cp <= 0x206F) return 'General Punctuation'
  if (cp >= 0x2070 && cp <= 0x209F) return 'Superscripts/Subscripts'
  if (cp >= 0x20A0 && cp <= 0x20CF) return 'Currency Symbols'
  if (cp >= 0x2100 && cp <= 0x214F) return 'Letterlike Symbols'
  if (cp >= 0x2190 && cp <= 0x21FF) return 'Arrows'
  if (cp >= 0x2200 && cp <= 0x22FF) return 'Math Operators'
  if (cp >= 0x2600 && cp <= 0x26FF) return 'Miscellaneous Symbols'
  if (cp >= 0x2700 && cp <= 0x27BF) return 'Dingbats'
  if (cp >= 0x3000 && cp <= 0x303F) return 'CJK Symbols & Punctuation'
  if (cp >= 0x3040 && cp <= 0x309F) return 'Hiragana'
  if (cp >= 0x30A0 && cp <= 0x30FF) return 'Katakana'
  if (cp >= 0x3100 && cp <= 0x312F) return 'Bopomofo'
  if (cp >= 0x3130 && cp <= 0x318F) return 'Hangul Compatibility'
  if (cp >= 0x31F0 && cp <= 0x31FF) return 'Katakana Phonetic Extensions'
  if (cp >= 0x3400 && cp <= 0x4DBF) return 'CJK Extension A'
  if (cp >= 0x4E00 && cp <= 0x9FFF) return 'CJK Unified'
  if (cp >= 0xA000 && cp <= 0xA48F) return 'Yi Syllables'
  if (cp >= 0xAC00 && cp <= 0xD7AF) return 'Hangul Syllables'
  if (cp >= 0xF900 && cp <= 0xFAFF) return 'CJK Compatibility'
  if (cp >= 0xFB00 && cp <= 0xFDFF) return 'Arabic Presentation A'
  if (cp >= 0xFE70 && cp <= 0xFEFF) return 'Arabic Presentation B'
  if (cp >= 0x1F300 && cp <= 0x1F9FF) return 'Emoji'
  if (cp >= 0x20000 && cp <= 0x2A6DF) return 'CJK Extension B'
  return 'Other'
}

function toUtf8Bytes(cp) {
  const bytes = new TextEncoder().encode(String.fromCodePoint(cp))
  return Array.from(bytes).map(b => b.toString(16).toUpperCase().padStart(2,'0')).join(' ')
}

function analyze(text) {
  return Array.from(text).map(ch => {
    const cp = ch.codePointAt(0)
    const hex = cp.toString(16).toUpperCase().padStart(4,'0')
    return {
      ch: cp < 0x20 ? '·' : ch,
      cp,
      hex: `U+${hex}`,
      decimal: cp,
      utf8: toUtf8Bytes(cp),
      html: cp > 127 ? `&#x${hex};` : (ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch),
      script: getScript(cp),
      bytes: new TextEncoder().encode(ch).length,
    }
  })
}

function CopyCell({ value }) {
  const [c,setC]=useState(false)
  return (
    <button onClick={()=>{navigator.clipboard.writeText(value);setC(true);setTimeout(()=>setC(false),1200);toast.success('Copied!')}}
      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-300 hover:text-gray-600 transition-all">
      {c?<Check size={11} className="text-green-500"/>:<Copy size={11}/>}
    </button>
  )
}

const SAMPLES = [
  { label: 'ASCII',   text: 'Hello, World!' },
  { label: 'Emoji',   text: '😀🌍🎉🔥⚡' },
  { label: 'Arabic',  text: 'مرحبا بالعالم' },
  { label: 'Hindi',   text: 'नमस्ते दुनिया' },
  { label: 'Chinese', text: '你好，世界！' },
  { label: 'Japanese',text: 'こんにちは世界' },
  { label: 'Korean',  text: '안녕하세요 세계' },
  { label: 'Greek',   text: 'Καλημέρα κόσμε' },
  { label: 'Russian', text: 'Привет мир' },
]

export default function UnicodeInspector() {
  const [text, setText] = useState('Hello 🌍 مرحبا')

  const chars = useMemo(() => analyze(text), [text])

  const totalBytes = chars.reduce((s, c) => s + c.bytes, 0)
  const uniqueScripts = [...new Set(chars.map(c => c.script))]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-2xl">Ω</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Unicode Inspector</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Code points · UTF-8 bytes · HTML entities · Script detection</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-5">
        <textarea rows={3} value={text} onChange={e=>setText(e.target.value)}
          placeholder="Type or paste any text — ASCII, emoji, Arabic, Chinese, Hindi…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 transition resize-none mb-3"
        />
        {/* Samples */}
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map(s=>(
            <button key={s.label} onClick={()=>setText(s.text)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-700 transition-all">
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {text && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            ['Characters', chars.length],
            ['UTF-8 Bytes', totalBytes],
            ['UTF-16 Chars', text.length],
            ['Scripts', uniqueScripts.length],
          ].map(([l,v])=>(
            <div key={l} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{v}</p>
              <p className="text-xs text-gray-400 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {chars.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-semibold">Char</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Code Point</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Decimal</th>
                  <th className="text-left px-4 py-2.5 font-semibold">UTF-8 Bytes</th>
                  <th className="text-left px-4 py-2.5 font-semibold">HTML Entity</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Script</th>
                </tr>
              </thead>
              <tbody>
                {chars.slice(0, 200).map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                    <td className="px-4 py-2.5 font-mono text-lg text-center w-12">
                      <span title={`U+${c.cp.toString(16).toUpperCase().padStart(4,'0')}`}>{c.ch}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-cyan-600 dark:text-cyan-400">
                      <div className="flex items-center gap-1">{c.hex}<CopyCell value={c.hex}/></div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-gray-600 dark:text-gray-400">{c.decimal}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">{c.utf8}<CopyCell value={c.utf8}/></div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">{c.html}<CopyCell value={c.html}/></div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{c.script}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {chars.length > 200 && (
              <p className="text-xs text-gray-400 text-center py-3">Showing first 200 of {chars.length} characters</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
