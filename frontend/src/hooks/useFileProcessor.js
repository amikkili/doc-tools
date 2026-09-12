import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function useFileProcessor() {
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const process = async (endpoint, formData, outputFilename) => {
    setProcessing(true)
    setResult(null)
    try {
      const res = await axios.post(`/api${endpoint}`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      const blob = new Blob([res.data])
      const url = URL.createObjectURL(blob)
      setResult({ url, name: outputFilename })
      toast.success('File processed successfully!')
      return { url, name: outputFilename }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Processing failed'
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
