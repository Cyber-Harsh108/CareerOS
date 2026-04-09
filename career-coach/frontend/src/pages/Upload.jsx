import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { extractTextFromPDF } from '../utils/pdfExtract.js'
import { analyzeResume } from '../utils/api.js'

const STAGES = [
  { key: 'extract', label: 'Extracting text from PDF…' },
  { key: 'analyze', label: 'Analyzing skills & experience…' },
  { key: 'pathways', label: 'Generating career pathways…' },
]

export default function Upload() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [stage, setStage] = useState(null) // null | 0 | 1 | 2
  const [error, setError] = useState('')
  const inputRef = useRef()
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || 'there'

  const handleFile = useCallback(async (f) => {
    if (!f || f.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    setFile(f)
    setError('')
    const userId = localStorage.getItem('userId')

    try {
      // Stage 0: extract text
      setStage(0)
      const text = await extractTextFromPDF(f)
      if (!text || text.length < 50) {
        throw new Error('Could not extract text. Make sure the PDF is not scanned/image-only.')
      }

      // Stage 1+2: backend analyze
      setStage(1)
      const result = await analyzeResume(userId, text)
      setStage(2)

      // Short pause for UX feel
      await new Promise(r => setTimeout(r, 800))

      // Store pathway data for Pathways page
      localStorage.setItem('pathwayData', JSON.stringify(result))
      navigate(`/pathways/${result.pathwayId}`)
    } catch (err) {
      setError(err.message || 'Analysis failed. Check backend is running.')
      setStage(null)
    }
  }, [navigate])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const isLoading = stage !== null

  return (
    <div className="min-h-screen bg-ink bg-grid flex items-center justify-center px-4">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-accent text-sm">⚡</span>
            </div>
            <span className="font-display font-700 text-white text-lg">CareerOS</span>
          </div>
          <h1 className="font-display text-3xl font-800 text-white mb-2">
            Hey {userName.split(' ')[0]}, <br />
            <span className="text-accent">upload your resume.</span>
          </h1>
          <p className="text-muted text-sm">
            We'll extract your skills, analyze experience, and build personalized career pathways.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !isLoading && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40 hover:bg-surface/50'}
            ${isLoading ? 'pointer-events-none' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />

          {!isLoading ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-white font-display font-600 text-lg mb-1">
                {file ? file.name : 'Drop your resume here'}
              </p>
              <p className="text-muted text-sm">PDF files only · Click to browse</p>
            </>
          ) : (
            <div className="space-y-6">
              {/* Animated spinner */}
              <div className="w-16 h-16 mx-auto relative">
                <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
                <div className="absolute inset-2 rounded-full border border-accent/10" />
              </div>

              {/* Stage progress */}
              <div className="space-y-2 max-w-xs mx-auto">
                {STAGES.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                      i < stage ? 'bg-accent border-accent' :
                      i === stage ? 'border-accent animate-pulse-slow' :
                      'border-border'
                    }`}>
                      {i < stage && (
                        <svg className="w-3 h-3 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-mono ${i <= stage ? 'text-white' : 'text-muted'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-danger text-xs font-mono bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
            ⚠ {error}
          </div>
        )}

        <p className="text-muted/40 text-xs mt-6 text-center">
          Text is processed locally then sent to our AI. Nothing is stored permanently.
        </p>
      </div>
    </div>
  )
}
