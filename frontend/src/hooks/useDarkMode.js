import { useEffect, useState } from 'react'

export default function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('doccraft-theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('doccraft-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('doccraft-theme', 'light')
    }
  }, [dark])

  return [dark, setDark]
}
