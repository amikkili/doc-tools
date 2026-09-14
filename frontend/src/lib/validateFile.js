const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

const ALLOWED = {
  pdf:   { exts: ['.pdf'],               mime: 'application/pdf',              label: 'PDF' },
  docx:  { exts: ['.docx', '.doc'],      mime: 'application/vnd',              label: 'Word document' },
  xlsx:  { exts: ['.xlsx', '.xls'],      mime: 'application/vnd',              label: 'Excel spreadsheet' },
  pptx:  { exts: ['.pptx'],             mime: 'application/vnd',              label: 'PowerPoint file' },
  image: { exts: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],
                                          mime: 'image/',                       label: 'image' },
  heic:  { exts: ['.heic', '.heif'],     mime: 'image/',                       label: 'HEIC image' },
}

/**
 * Validates a File object before upload.
 *
 * @param {File} file
 * @param {'pdf'|'docx'|'xlsx'|'pptx'|'image'|'heic'} type  Expected file type key
 * @param {number} [maxBytes]  Override the default 10 MB limit
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateFile(file, type, maxBytes = MAX_BYTES) {
  if (!file) return { ok: false, message: 'No file selected.' }

  const limit = maxBytes
  if (file.size > limit) {
    const mb = (limit / 1024 / 1024).toFixed(0)
    return { ok: false, message: `File is too large. Maximum size is ${mb} MB.` }
  }

  const spec = ALLOWED[type]
  if (!spec) return { ok: true } // unknown type — let backend decide

  const name = file.name.toLowerCase()
  const hasValidExt = spec.exts.some(ext => name.endsWith(ext))
  if (!hasValidExt) {
    const listed = spec.exts.join(', ')
    return {
      ok: false,
      message: `Please upload a ${spec.label} file (${listed}).`,
    }
  }

  return { ok: true }
}

/**
 * Validates multiple files, all of the same type.
 * Returns the first failure found, or { ok: true } if all pass.
 */
export function validateFiles(files, type, maxBytes = MAX_BYTES) {
  for (const file of files) {
    const result = validateFile(file, type, maxBytes)
    if (!result.ok) return result
  }
  return { ok: true }
}
