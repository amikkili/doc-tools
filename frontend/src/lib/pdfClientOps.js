import { PDFDocument, degrees } from 'pdf-lib'

// Files under this threshold run in the browser; larger files go to the server
export const CLIENT_THRESHOLD_MB = 10
const CLIENT_THRESHOLD = CLIENT_THRESHOLD_MB * 1024 * 1024

export function shouldUseClient(files) {
  const total = files.reduce((sum, f) => sum + f.size, 0)
  return total < CLIENT_THRESHOLD
}

// ── Merge ─────────────────────────────────────────────────────────────────
export async function mergePdfClient(files) {
  const merged = await PDFDocument.create()
  for (const file of files) {
    const buf = await file.arrayBuffer()
    const doc = await PDFDocument.load(buf)
    const copied = await merged.copyPages(doc, doc.getPageIndices())
    copied.forEach(p => merged.addPage(p))
  }
  const bytes = await merged.save()
  return new Blob([bytes], { type: 'application/pdf' })
}

// ── Rotate ────────────────────────────────────────────────────────────────
export async function rotatePdfClient(file, angle) {
  const buf = await file.arrayBuffer()
  const doc = await PDFDocument.load(buf)
  doc.getPages().forEach(page => {
    const current = page.getRotation().angle
    page.setRotation(degrees((current + Number(angle)) % 360))
  })
  const bytes = await doc.save()
  return new Blob([bytes], { type: 'application/pdf' })
}

// ── Split ─────────────────────────────────────────────────────────────────
export async function splitPdfClient(file, pagesStr) {
  const buf = await file.arrayBuffer()
  const src = await PDFDocument.load(buf)
  const total = src.getPageCount()

  // Parse "1-3, 5, 7-9" → [[0,1,2],[4],[6,7,8]] (0-indexed)
  let groups
  if (!pagesStr?.trim()) {
    groups = Array.from({ length: total }, (_, i) => [i])
  } else {
    groups = pagesStr.split(',').map(part => {
      part = part.trim()
      if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number)
        return Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i)
      }
      return [Number(part) - 1]
    })
  }

  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  for (let i = 0; i < groups.length; i++) {
    const indices = groups[i].filter(p => p >= 0 && p < total)
    if (!indices.length) continue
    const part = await PDFDocument.create()
    const copied = await part.copyPages(src, indices)
    copied.forEach(p => part.addPage(p))
    const bytes = await part.save()
    zip.file(`part_${i + 1}.pdf`, bytes)
  }

  return zip.generateAsync({ type: 'blob' })
}
