import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function useFileProcessor() {
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const process = async (endpoint, formData, outputFilename, { base64Response = false } = {}) => {
    setProcessing(true)
    setResult(null)
    try {
      const res = await axios.post(`/api${endpoint}`, formData, {
        responseType: base64Response ? 'json' : 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })

      let blob, name
      if (base64Response) {
        // Decode base64 JSON response (used when Vercel proxy strips binary bodies)
        const { data: b64, filename } = res.data
        const binary = atob(b64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        blob = new Blob([bytes])
        name = filename || outputFilename
      } else {
        blob = new Blob([res.data])
        name = outputFilename
      }

      const url = URL.createObjectURL(blob)
      setResult({ url, name })
      toast.success('File processed successfully!')
      return { url, name }
    } catch (err) {
      let msg = 'Processing failed. Please try again.'
      const status = err.response?.status

      if (!err.response) {
        msg = 'Cannot reach the server. Check your connection and try again.'
      } else {
        try {
          const raw = err.response.data
          const text = raw instanceof Blob ? await raw.text() : JSON.stringify(raw)
          const parsed = JSON.parse(text)
          msg = parsed.detail || msg
        } catch (_) { /* use default msg */ }

        if (status === 413) {
          msg = 'File is too large. Please upload a smaller file.'
          toast.error(msg)
        } else if (status === 400) {
          toast(msg, { icon: '⚠️' })
        } else if (status === 503) {
          msg = msg || 'Service temporarily unavailable. Please try again later.'
          toast.error(msg)
        } else {
          toast.error(msg)
        }
        setProcessing(false)
        return
      }

      toast.error(msg)
    } finally {
      setProcessing(false)
    }
  }

  // For client-side operations: pass the result Blob directly
  const processClient = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    setResult({ url, name: filename })
    toast.success('Done! Processed in your browser.')
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = result.name
    a.click()
  }

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  return { processing, result, process, processClient, download, reset }
}
