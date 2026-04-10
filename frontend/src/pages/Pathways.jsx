import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { selectPathway } from '../utils/api.js'

const ROLE_ICONS = {
  'Software Engineer (SDE)': '⚙️',
  'Full Stack Web Developer': '🌐',
  'Data Scientist': '📊',
}

const ROLE_COLORS = [
  { bg: 'bg-blue-500/10', border: 'border-blue-500/30', accent: 'text-blue-400', bar: 'bg-blue-400' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', accent: 'text-purple-400', bar: 'bg-purple-400' },
  { bg: 'bg-accent/10', border: 'border-accent/30', accent: 'text-accent', bar: 'bg-accent' },
]

function PathwayCard({ pathway, index, selected, onSelect }) {
  const colors = ROLE_COLORS[index % ROLE_COLORS.length]
  const icon = Object.entries(ROLE_ICONS).find(([k]) => pathway.roleTitle?.includes(k.split(' ')[0]))?.[1] || '🎯'
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`card-base p-6 cursor-pointer transition-all duration-200 ${
        selected ? `${colors.bg} ${colors.border} glow-accent` : 'hover:border-border/80 hover:bg-surface/50'
      }`}
      onClick={() => onSelect(index)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-display font-700 text-white text-lg leading-tight">
              {pathway.roleTitle}
            </h3>
            <p className={`text-xs font-mono mt-0.5 ${colors.accent}`}>
              {pathway.matchPercentage}% match
            </p>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
          selected ? `${colors.border} bg-accent` : 'border-border'
        }`}>
          {selected && <div className="w-2 h-2 rounded-full bg-ink" />}
        </div>
      </div>

      {/* Match bar */}
      <div className="progress-bar mb-4">
        <div
          className={`progress-bar-fill ${colors.bar}`}
          style={{ width: `${pathway.matchPercentage}%` }}
        />
      </div>

      {/* Missing skills */}
      <div className="space-y-3">
        {pathway.missingCritical?.length > 0 && (
          <div>
            <p className="text-xs font-mono text-danger/80 uppercase tracking-widest mb-2">Critical gaps</p>
            <div className="flex flex-wrap gap-1.5">
              {pathway.missingCritical.slice(0, 4).map(s => (
                <span key={s} className="text-xs bg-danger/10 border border-danger/20 text-danger px-2 py-0.5 rounded-md font-mono">
                  {s}
                </span>
              ))}
              {pathway.missingCritical.length > 4 && (
                <span className="text-xs text-muted">+{pathway.missingCritical.length - 4} more</span>
              )}
            </div>
          </div>
        )}
        {pathway.missingOptional?.length > 0 && (
          <div>
            <p className="text-xs font-mono text-warn/80 uppercase tracking-widest mb-2">Nice to have</p>
            <div className="flex flex-wrap gap-1.5">
              {pathway.missingOptional.slice(0, 3).map(s => (
                <span key={s} className="text-xs bg-warn/10 border border-warn/20 text-warn px-2 py-0.5 rounded-md font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Roadmap preview toggle */}
      <button
        className="mt-4 text-xs font-mono text-muted hover:text-white transition-colors flex items-center gap-1"
        onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
      >
        {expanded ? '▲' : '▼'} {expanded ? 'Hide' : 'Preview'} 4-week roadmap
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {pathway.roadmap?.weeklyPlan?.map(w => (
            <div key={w.week} className="bg-ink/50 rounded-lg px-3 py-2.5 border border-border/50">
              <p className="text-xs font-display font-600 text-white mb-0.5">Week {w.week}: {w.focus}</p>
              <p className="text-xs text-muted">{w.tasks?.length || 0} tasks</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Pathways() {
  const { pathwayId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cached = localStorage.getItem('pathwayData')
    if (cached) {
      try { setData(JSON.parse(cached)) } catch {}
    }
  }, [])

  async function handleConfirm() {
    if (selected === null) return
    setLoading(true)
    try {
      const userId = localStorage.getItem('userId')
      const result = await selectPathway(userId, pathwayId, selected)
      navigate(`/dashboard/${pathwayId}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-muted font-mono text-sm">Loading pathways…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink bg-grid pb-24">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-accent/4 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 pt-12">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-accent text-sm">⚡</span>
            <span className="font-display font-700 text-white">CareerOS</span>
          </div>
          <h1 className="font-display text-3xl font-800 text-white mb-2">
            Your career <span className="text-accent">pathways.</span>
          </h1>
          <p className="text-muted text-sm">
            Based on your resume — select the role you want to pursue.
          </p>
        </div>

        {/* Extracted skills */}
        {data.extractedSkills?.length > 0 && (
          <div className="card-base p-5 mb-8">
            <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Detected skills</p>
            <div className="flex flex-wrap gap-2">
              {data.extractedSkills.map(s => (
                <span key={s} className="text-xs bg-accent/10 border border-accent/20 text-accent px-2.5 py-1 rounded-md font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pathway cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {data.pathways?.map((p, i) => (
            <PathwayCard
              key={p.roleTitle}
              pathway={p}
              index={i}
              selected={selected === i}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Confirm CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-ink/90 backdrop-blur border-t border-border px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <p className="text-sm text-muted">
              {selected !== null
                ? `Selected: ${data.pathways[selected]?.roleTitle}`
                : 'Choose a pathway above to continue'}
            </p>
            <button
              onClick={handleConfirm}
              disabled={selected === null || loading}
              className="bg-accent text-ink font-display font-700 text-sm px-8 py-3 rounded-lg hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up…' : 'Start This Path →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
