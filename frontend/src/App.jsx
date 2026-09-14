import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MergePdf from './pages/MergePdf'
import SplitPdf from './pages/SplitPdf'
import CompressPdf from './pages/CompressPdf'
import PdfToWord from './pages/PdfToWord'
import WordToPdf from './pages/WordToPdf'
import PdfToJpg from './pages/PdfToJpg'
import JpgToPdf from './pages/JpgToPdf'
import RotatePdf from './pages/RotatePdf'
import WatermarkPdf from './pages/WatermarkPdf'
import ProtectPdf from './pages/ProtectPdf'
import JsonBeautifier from './pages/JsonBeautifier'
import XmlJsonBeautifier from './pages/XmlBeautifier'
import WordCompare from './pages/WordCompare'
import WordCount from './pages/WordCount'
import Base64Tool from './pages/Base64Tool'
import UrlEncodeTool from './pages/UrlEncodeTool'
import HtmlToPdf from './pages/HtmlToPdf'
import ExcelToPdf from './pages/ExcelToPdf'
import PdfToExcel from './pages/PdfToExcel'
import PdfAnalyzer from './pages/PdfAnalyzer'
import JsonValidator from './pages/JsonValidator'
import XmlFormatter from './pages/XmlFormatter'
import HtmlTools from './pages/HtmlTools'
import YamlJson from './pages/YamlJson'
import JwtDebugger from './pages/JwtDebugger'
import SqlFormatter from './pages/SqlFormatter'
import JsonToCsv from './pages/JsonToCsv'
import CronDescriptor from './pages/CronDescriptor'
import WebpConverter from './pages/WebpConverter'
import ImageMetadataStripper from './pages/ImageMetadataStripper'
import SvgConverter from './pages/SvgConverter'
import ImageCompressor from './pages/ImageCompressor'
import FaviconGenerator from './pages/FaviconGenerator'
import ColorPalette from './pages/ColorPalette'
import CssGradient from './pages/CssGradient'
import ImageCropper from './pages/ImageCropper'
import ContactUs from './pages/ContactUs'
import AboutUs from './pages/AboutUs'
import Feedback from './pages/Feedback'
import SignIn from './pages/SignIn'
import Subscription from './pages/Subscription'
import NotFound from './pages/NotFound'
import QrGenerator from './pages/QrGenerator'
import RegexTester from './pages/RegexTester'
import MarkdownPreview from './pages/MarkdownPreview'
import HashGenerator from './pages/HashGenerator'
import LoremIpsum from './pages/LoremIpsum'
import UnitConverter from './pages/UnitConverter'
import TimezoneConverter from './pages/TimezoneConverter'
import PdfToPptx from './pages/PdfToPptx'
import BackgroundRemover from './pages/BackgroundRemover'
import ColorConverter from './pages/ColorConverter'
import NumberBaseConverter from './pages/NumberBaseConverter'
import HtmlEntityTool from './pages/HtmlEntityTool'
import UnicodeInspector from './pages/UnicodeInspector'
import CssJsMinifier from './pages/CssJsMinifier'
import IpCalculator from './pages/IpCalculator'
import CalendarConverter from './pages/CalendarConverter'
import CodeDiff from './pages/CodeDiff'
import PptxToPdf from './pages/PptxToPdf'
import HeicConverter from './pages/HeicConverter'
import LabCodeCleaner from './pages/LabCodeCleaner'
import ImageResizer from './pages/ImageResizer'
import SignUp from './pages/SignUp'
import useDarkMode from './hooks/useDarkMode'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const [dark, setDark] = useDarkMode()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <ScrollToTop />
      <Navbar dark={dark} setDark={setDark} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge-pdf" element={<MergePdf />} />
          <Route path="/split-pdf" element={<SplitPdf />} />
          <Route path="/compress-pdf" element={<CompressPdf />} />
          <Route path="/pdf-to-word" element={<PdfToWord />} />
          <Route path="/word-to-pdf" element={<WordToPdf />} />
          <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
          <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
          <Route path="/rotate-pdf" element={<RotatePdf />} />
          <Route path="/watermark-pdf" element={<WatermarkPdf />} />
          <Route path="/protect-pdf" element={<ProtectPdf />} />
          <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
          <Route path="/pdf-to-excel" element={<PdfToExcel />} />
          <Route path="/json-beautifier" element={<JsonBeautifier />} />
          <Route path="/xml-beautifier" element={<XmlJsonBeautifier />} />
          <Route path="/word-compare" element={<WordCompare />} />
          <Route path="/word-count" element={<WordCount />} />
          <Route path="/base64" element={<Base64Tool />} />
          <Route path="/url-encode" element={<UrlEncodeTool />} />
          <Route path="/html-to-pdf" element={<HtmlToPdf />} />
          <Route path="/analyze-pdf" element={<PdfAnalyzer />} />
          <Route path="/json-validator" element={<JsonValidator />} />
          <Route path="/xml-formatter" element={<XmlFormatter />} />
          <Route path="/html-tools" element={<HtmlTools />} />
          <Route path="/yaml-json" element={<YamlJson />} />
          <Route path="/jwt-debugger" element={<JwtDebugger />} />
          <Route path="/sql-formatter" element={<SqlFormatter />} />
          <Route path="/json-to-csv" element={<JsonToCsv />} />
          <Route path="/cron-descriptor" element={<CronDescriptor />} />
          <Route path="/webp-converter" element={<WebpConverter />} />
          <Route path="/image-metadata" element={<ImageMetadataStripper />} />
          <Route path="/svg-converter" element={<SvgConverter />} />
          <Route path="/image-compressor" element={<ImageCompressor />} />
          <Route path="/favicon-generator" element={<FaviconGenerator />} />
          <Route path="/color-palette" element={<ColorPalette />} />
          <Route path="/css-gradient" element={<CssGradient />} />
          <Route path="/image-cropper" element={<ImageCropper />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/qr-generator" element={<QrGenerator />} />
          <Route path="/regex-tester" element={<RegexTester />} />
          <Route path="/markdown-preview" element={<MarkdownPreview />} />
          <Route path="/hash-generator" element={<HashGenerator />} />
          <Route path="/lorem-ipsum" element={<LoremIpsum />} />
          <Route path="/unit-converter" element={<UnitConverter />} />
          <Route path="/timezone-converter" element={<TimezoneConverter />} />
          <Route path="/pdf-to-pptx" element={<PdfToPptx />} />
          <Route path="/bg-remover" element={<BackgroundRemover />} />
          <Route path="/color-converter" element={<ColorConverter />} />
          <Route path="/number-base" element={<NumberBaseConverter />} />
          <Route path="/html-entity" element={<HtmlEntityTool />} />
          <Route path="/unicode-inspector" element={<UnicodeInspector />} />
          <Route path="/css-js-minifier" element={<CssJsMinifier />} />
          <Route path="/ip-calculator" element={<IpCalculator />} />
          <Route path="/calendar-converter" element={<CalendarConverter />} />
          <Route path="/code-diff" element={<CodeDiff />} />
          <Route path="/pptx-to-pdf" element={<PptxToPdf />} />
          <Route path="/heic-converter" element={<HeicConverter />} />
          <Route path="/lab-code-cleaner" element={<LabCodeCleaner />} />
          <Route path="/image-resizer" element={<ImageResizer />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
