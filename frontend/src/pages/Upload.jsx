import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { extractTextFromPDF } from '../utils/pdfExtract.js'
import { analyzeResume } from '../utils/api.js'

const STAGES = [
  { key: 'extract', label: 'Extracting text from PDF...' },
  { key: 'analyze', label: 'Analyzing skills and experience...' },
  { key: 'pathways', label: 'Generating career pathways...' },
]

export default function Upload() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [stage, setStage] = useState(null)
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
      setStage(0)
      const text = await extractTextFromPDF(f)
      if (!text || text.length < 50) {
        throw new Error('Could not extract text. Make sure the PDF is not scanned or image-only.')
      }

      setStage(1)
      const result = await analyzeResume(userId, text)
      setStage(2)

      await new Promise((resolve) => setTimeout(resolve, 800))

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
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const onDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  const isLoading = stage !== null

  return (
    <div className="min-h-screen bg-ink bg-grid">
      <Navbar variant="app" />
      <div className="pointer-events-none fixed top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-[120px]" />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-10">
            <h1 className="mb-2 font-display text-3xl font-800 text-white">
              Hey {userName.split(' ')[0]}, <br />
              <span className="text-accent">upload your resume.</span>
            </h1>
            <p className="text-sm text-muted">
              We&apos;ll extract your skills, analyze experience, and build personalized career pathways.
            </p>
          </div>

          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !isLoading && inputRef.current?.click()}
            className={`
              relative rounded-2xl border-2 border-dashed p-12 text-center transition-all
              ${dragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40 hover:bg-surface/50'}
              ${isLoading ? 'pointer-events-none' : 'cursor-pointer'}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {!isLoading ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
                  <svg className="h-7 w-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="mb-1 font-display text-lg font-600 text-white">
                  {file ? file.name : 'Drop your resume here'}
                </p>
                <p className="text-sm text-muted">PDF files only · Click to browse</p>
              </>
            ) : (
              <div className="space-y-6">
                <div className="relative mx-auto h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
                  <div className="absolute inset-2 rounded-full border border-accent/10" />
                </div>

                <div className="mx-auto max-w-xs space-y-2">
                  {STAGES.map((item, index) => (
                    <div key={item.key} className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                          index < stage
                            ? 'border-accent bg-accent'
                            : index === stage
                              ? 'border-accent animate-pulse-slow'
                              : 'border-border'
                        }`}
                      >
                        {index < stage ? (
                          <svg className="h-3 w-3 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : null}
                      </div>
                      <span className={`text-sm font-mono ${index <= stage ? 'text-white' : 'text-muted'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-xs font-mono text-danger">
              Warning: {error}
            </div>
          ) : null}

          <p className="mt-6 text-center text-xs text-muted/40">
            Text is processed locally, then sent to the AI backend for analysis.
          </p>
        </div>
      </div>
    </div>
  )
}
