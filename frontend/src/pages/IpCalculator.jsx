import { useState, useMemo } from 'react'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) | parseInt(octet, 10)) >>> 0, 0) >>> 0
}
function intToIp(n) {
  return [24, 16, 8, 0].map(s => (n >>> s) & 0xFF).join('.')
}
function toBinary(ip) {
  return ip.split('.').map(o => parseInt(o).toString(2).padStart(8,'0')).join('.')
}
function ipClass(firstOctet) {
  if (firstOctet < 128) return 'A'
  if (firstOctet < 192) return 'B'
  if (firstOctet < 224) return 'C'
  if (firstOctet < 240) return 'D (Multicast)'
  return 'E (Reserved)'
}

function calculate(cidr) {
  const match = cidr.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!match) return null
  const [, ip, prefixStr] = match
  const parts = ip.split('.').map(Number)
  if (parts.some(p => p > 255)) return null
  const prefix = parseInt(prefixStr)
  if (prefix < 0 || prefix > 32) return null

  const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0
  const ipInt = ipToInt(ip)
  const network = (ipInt & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const firstHost = prefix < 31 ? network + 1 : network
  const lastHost = prefix < 31 ? broadcast - 1 : broadcast
  const totalHosts = prefix < 31 ? Math.pow(2, 32 - prefix) - 2 : Math.pow(2, 32 - prefix)

  return {
    ip, prefix,
    subnetMask: intToIp(mask),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalHosts: totalHosts > 0 ? totalHosts : 1,
    usableHosts: Math.max(0, totalHosts),
    class: ipClass(parts[0]),
    ipBinary: toBinary(ip),
    maskBinary: toBinary(intToIp(mask)),
    networkBinary: toBinary(intToIp(network)),
    isPrivate: (
      (parts[0] === 10) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 127)
    )
  }
}

function CopyBtn({ value }) {
  const [c,setC]=useState(false)
  return (
    <button onClick={()=>{navigator.clipboard.writeText(value);setC(true);setTimeout(()=>setC(false),1200);toast.success('Copied!')}}
      className="p-1 rounded text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
      {c?<Check size={12} className="text-green-500"/>:<Copy size={12}/>}
    </button>
  )
}

function Row({ label, value, mono=true }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold text-gray-800 dark:text-gray-200 ${mono?'font-mono':''}`}>{value}</span>
        <CopyBtn value={String(value)}/>
      </div>
    </div>
  )
}

const EXAMPLES = [
  '192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12',
  '192.168.0.0/16', '10.10.10.0/28', '8.8.8.8/32',
]

export default function IpCalculator() {
  const [input, setInput] = useState('192.168.1.0/24')
  const result = useMemo(() => calculate(input), [input])

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">🌐</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">IP / CIDR Calculator</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Subnet mask · Network · Broadcast · Host range · Binary</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-5">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">IP Address / CIDR</label>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="192.168.1.0/24"
          className={`w-full px-4 py-3 rounded-xl border text-lg font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${!result && input ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
        />
        {!result && input && <p className="text-xs text-red-500 mt-1">Invalid format — try 192.168.1.0/24</p>}

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-400 self-center">Examples:</span>
          {EXAMPLES.map(e=>(
            <button key={e} onClick={()=>setInput(e)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 transition-all">
              {e}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <>
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${result.isPrivate ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
              {result.isPrivate ? '🔒 Private' : '🌐 Public'}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              Class {result.class}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              /{result.prefix} ({result.totalHosts.toLocaleString()} hosts)
            </span>
          </div>

          {/* Results */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-5 py-2 mb-5">
            <Row label="IP Address"       value={result.ip}/>
            <Row label="Subnet Mask"      value={result.subnetMask}/>
            <Row label="Network Address"  value={result.network}/>
            <Row label="Broadcast"        value={result.broadcast}/>
            <Row label="First Host"       value={result.firstHost}/>
            <Row label="Last Host"        value={result.lastHost}/>
            <Row label="Usable Hosts"     value={result.usableHosts.toLocaleString()} mono={false}/>
            <Row label="CIDR"             value={`${result.network}/${result.prefix}`}/>
          </div>

          {/* Binary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Binary Representation</p>
            {[['IP',result.ipBinary],['Mask',result.maskBinary],['Network',result.networkBinary]].map(([l,v])=>(
              <div key={l} className="flex items-start gap-4 mb-2.5">
                <span className="text-xs text-gray-400 w-14 shrink-0 mt-0.5">{l}</span>
                <code className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{v}</code>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
