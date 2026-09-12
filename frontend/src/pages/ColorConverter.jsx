import { useState, useCallback } from 'react'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

// ── Conversions ─────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  if (h.length !== 6) return null
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) }
}
function rgbToHex(r,g,b) {
  return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('')
}
function rgbToHsl(r,g,b) {
  r/=255;g/=255;b/=255
  const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min
  let h=0,s=0,l=(max+min)/2
  if(d>0){
    s=l>0.5?d/(2-max-min):d/(max+min)
    switch(max){
      case r:h=((g-b)/d+(g<b?6:0))/6;break
      case g:h=((b-r)/d+2)/6;break
      case b:h=((r-g)/d+4)/6;break
    }
  }
  return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)}
}
function hslToRgb(h,s,l) {
  h/=360;s/=100;l/=100
  if(s===0){const v=Math.round(l*255);return{r:v,g:v,b:v}}
  const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q
  const hue2=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p}
  return{r:Math.round(hue2(p,q,h+1/3)*255),g:Math.round(hue2(p,q,h)*255),b:Math.round(hue2(p,q,h-1/3)*255)}
}
function rgbToHsv(r,g,b) {
  r/=255;g/=255;b/=255
  const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min
  let h=0,s=max===0?0:d/max,v=max
  if(d>0){switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break}}
  return{h:Math.round(h*360),s:Math.round(s*100),v:Math.round(v*100)}
}
function rgbToCmyk(r,g,b) {
  r/=255;g/=255;b/=255
  const k=1-Math.max(r,g,b)
  if(k>=1)return{c:0,m:0,y:0,k:100}
  return{c:Math.round((1-r-k)/(1-k)*100),m:Math.round((1-g-k)/(1-k)*100),y:Math.round((1-b-k)/(1-k)*100),k:Math.round(k*100)}
}
function cmykToRgb(c,m,y,k){c/=100;m/=100;y/=100;k/=100;return{r:Math.round(255*(1-c)*(1-k)),g:Math.round(255*(1-m)*(1-k)),b:Math.round(255*(1-y)*(1-k))}}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v))}
function rgb255({r,g,b}){return{r:clamp(Math.round(r),0,255),g:clamp(Math.round(g),0,255),b:clamp(Math.round(b),0,255)}}

// ── Component ────────────────────────────────────────────────────────────────

function CopyBtn({ value }) {
  const [c,setC]=useState(false)
  return (
    <button onClick={()=>{navigator.clipboard.writeText(value);setC(true);setTimeout(()=>setC(false),1500);toast.success('Copied!')}}
      className="p-1 rounded text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
      {c?<Check size={13} className="text-green-500"/>:<Copy size={13}/>}
    </button>
  )
}

function Field({label,value,onChange,suffix='',note=''}){
  return(
    <div className="flex-1 min-w-[130px]">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input value={value} onChange={e=>onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-400 transition"/>
        {suffix&&<span className="text-xs text-gray-400">{suffix}</span>}
        <CopyBtn value={value}/>
      </div>
      {note&&<p className="text-xs text-gray-400 mt-0.5">{note}</p>}
    </div>
  )
}

const PRESETS=[
  {name:'Red',      hex:'#ef4444'},{name:'Orange',  hex:'#f97316'},{name:'Yellow', hex:'#eab308'},
  {name:'Green',    hex:'#22c55e'},{name:'Teal',    hex:'#14b8a6'},{name:'Blue',   hex:'#3b82f6'},
  {name:'Indigo',   hex:'#6366f1'},{name:'Purple',  hex:'#a855f7'},{name:'Pink',   hex:'#ec4899'},
  {name:'White',    hex:'#ffffff'},{name:'Gray',    hex:'#6b7280'},{name:'Black',  hex:'#000000'},
]

export default function ColorConverter() {
  const [hex, setHex] = useState('#ef4444')
  const [err, setErr] = useState('')

  const rgb = hexToRgb(hex) || {r:0,g:0,b:0}
  const hsl = rgbToHsl(rgb.r,rgb.g,rgb.b)
  const hsv = rgbToHsv(rgb.r,rgb.g,rgb.b)
  const cmyk = rgbToCmyk(rgb.r,rgb.g,rgb.b)

  const fromHex = (v) => {
    const clean = v.startsWith('#') ? v : '#'+v
    setHex(clean)
    setErr(hexToRgb(clean) ? '' : 'Invalid hex')
  }
  const fromRgb = (field, raw) => {
    const val = parseInt(raw)||0
    const next = rgb255({...rgb, [field]: val})
    setHex(rgbToHex(next.r,next.g,next.b))
    setErr('')
  }
  const fromHsl = (field, raw) => {
    const val = parseInt(raw)||0
    const next = {...hsl, [field]: val}
    const {r,g,b} = hslToRgb(next.h,next.s,next.l)
    setHex(rgbToHex(r,g,b)); setErr('')
  }
  const fromCmyk = (field, raw) => {
    const val = parseInt(raw)||0
    const next = {...cmyk, [field]: val}
    const {r,g,b} = cmykToRgb(next.c,next.m,next.y,next.k)
    setHex(rgbToHex(r,g,b)); setErr('')
  }

  const cssRgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const cssHsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{background:hex}}>🎨</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Color Format Converter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">HEX · RGB · HSL · HSV · CMYK — live sync</p>
        </div>
      </div>

      {/* Picker + preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-5 flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-4">
          <input type="color" value={hex.length===7?hex:'#ef4444'} onChange={e=>{setHex(e.target.value);setErr('')}}
            className="w-16 h-16 rounded-xl cursor-pointer border-0 p-1 bg-transparent"/>
          <div>
            <div className="w-32 h-16 rounded-xl border border-gray-100 dark:border-gray-700 shadow-inner" style={{background:hex}}/>
          </div>
        </div>

        <div className="flex-1 min-w-[250px] space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">CSS Values</p>
          {[['HEX', hex],['RGB', cssRgb],['HSL', cssHsl]].map(([k,v])=>(
            <div key={k} className="flex items-center gap-2">
              <span className="text-xs w-8 text-gray-400">{k}</span>
              <code className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">{v}</code>
              <CopyBtn value={v}/>
            </div>
          ))}
        </div>
      </div>

      {/* Format inputs */}
      <div className="space-y-4">
        {/* HEX */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">HEX</p>
          <div className="flex items-center gap-3">
            <Field label="#RRGGBB" value={hex} onChange={fromHex}/>
          </div>
          {err&&<p className="text-xs text-red-500 mt-1">{err}</p>}
        </div>

        {/* RGB */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">RGB (0–255)</p>
          <div className="flex flex-wrap gap-3">
            {[['R','r'],['G','g'],['B','b']].map(([l,f])=>(
              <Field key={f} label={l} value={String(rgb[f])} onChange={v=>fromRgb(f,v)}/>
            ))}
          </div>
        </div>

        {/* HSL */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">HSL</p>
          <div className="flex flex-wrap gap-3">
            <Field label="H (0–360°)" value={String(hsl.h)} onChange={v=>fromHsl('h',v)}/>
            <Field label="S (0–100%)" value={String(hsl.s)} onChange={v=>fromHsl('s',v)}/>
            <Field label="L (0–100%)" value={String(hsl.l)} onChange={v=>fromHsl('l',v)}/>
          </div>
        </div>

        {/* HSV */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">HSV / HSB (Photoshop)</p>
          <div className="flex flex-wrap gap-3">
            {[['H (°)','h'],['S (%)','s'],['V (%)','v']].map(([l,f])=>(
              <Field key={f} label={l} value={String(hsv[f])} onChange={()=>{}} note="read-only"/>
            ))}
          </div>
        </div>

        {/* CMYK */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">CMYK (Print)</p>
          <div className="flex flex-wrap gap-3">
            {[['C','c'],['M','m'],['Y','y'],['K','k']].map(([l,f])=>(
              <Field key={f} label={`${l} (%)`} value={String(cmyk[f])} onChange={v=>fromCmyk(f,v)}/>
            ))}
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p=>(
            <button key={p.hex} onClick={()=>{setHex(p.hex);setErr('')}}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium hover:border-gray-400 transition-all">
              <span className="w-4 h-4 rounded" style={{background:p.hex,border:'1px solid #e5e7eb'}}/>
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
