import { useState, useMemo } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function WordCount() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
    const readingTime = Math.max(1, Math.round(words / 200))
    const lines = text ? text.split('\n').length : 0
    return { words, chars, charsNoSpace, sentences, paragraphs, readingTime, lines }
  }, [text])

  const STAT_CARDS = [
    { label: 'Words', value: stats.words, color: 'bg-blue-50 text-blue-700' },
    { label: 'Characters', value: stats.chars, color: 'bg-purple-50 text-purple-700' },
    { label: 'Chars (no spaces)', value: stats.charsNoSpace, color: 'bg-pink-50 text-pink-700' },
    { label: 'Sentences', value: stats.sentences, color: 'bg-green-50 text-green-700' },
    { label: 'Paragraphs', value: stats.paragraphs, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Lines', value: stats.lines, color: 'bg-orange-50 text-orange-700' },
    { label: 'Reading time', value: `~${stats.readingTime} min`, color: 'bg-red-50 text-red-700' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl">🔢</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Word Count</h1>
          <p className="text-gray-500 text-sm">Instantly count words, characters, sentences and more</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STAT_CARDS.map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Textarea */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Text</label>
          <button onClick={() => setText('')} className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="w-full h-80 text-sm border-0 focus:outline-none resize-none text-gray-800"
        />
      </div>
    </div>
  )
}
